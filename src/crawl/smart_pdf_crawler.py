"""
Smart PDF Crawler - Powered by Jina.ai Reader + LLM
Automatically discovers and downloads PDFs from any URL
"""

import os
import re
import json
import requests
from pathlib import Path
from typing import List, Dict, Set, Optional, Any
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from urllib.parse import urljoin, urlparse
import time
try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  Playwright not available. Install with: pip install playwright && playwright install")


class SmartPDFCrawler:
    """
    Intelligent PDF crawler that:
    1. Uses Jina.ai Reader to get clean content from URLs
    2. Uses LLM to analyze content and find PDF links
    3. Automatically downloads discovered PDFs
    """
    
    def __init__(self, 
                 output_dir: str = 'biwase_data/pdfs_smart',
                 model_name: str = "Qwen/Qwen3-1.7B",
                 use_javascript: bool = True):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.discovered_pdfs = set()
        self.use_javascript = use_javascript and PLAYWRIGHT_AVAILABLE
        self.reasoning_steps = []  # Lưu các bước suy luận của LLM
        
    def load_model(self):
        """Load LLM for content analysis"""
        print(f"Loading LLM: {self.model_name}")
        try:
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.bfloat16,
                device_map="auto",
                trust_remote_code=True,
            ).eval()
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                use_fast=True, 
                trust_remote_code=True
            )
            print("✅ LLM loaded successfully")
            return True
        except Exception as e:
            print(f"⚠️  Could not load LLM: {e}")
            print("Falling back to rule-based extraction")
            return False
    
    def fetch_with_javascript(self, url: str) -> Dict[str, Any]:
        """Render JavaScript và trích xuất nội dung động (học từ Firecrawl)"""
        if not PLAYWRIGHT_AVAILABLE:
            return {"content": "", "links": [], "data_attributes": []}
        
        print(f"🌐 Rendering JavaScript: {url}")
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                # Tải trang và đợi network idle
                page.goto(url, wait_until="networkidle", timeout=30000)
                
                # Đợi thêm cho AJAX requests
                page.wait_for_timeout(2000)
                
                # Trích xuất nội dung
                content = page.content()
                
                # Tìm tất cả links (bao gồm cả dynamic links)
                links = page.eval_on_selector_all('a', 
                    '(elements) => elements.map(e => ({href: e.href, text: e.textContent, dataAttrs: Object.fromEntries(Object.entries(e.dataset))}))'
                )
                
                # Tìm tất cả elements có data-pdf, data-file, data-url
                data_elements = page.eval_on_selector_all('[data-pdf], [data-file], [data-url], [data-download]',
                    '(elements) => elements.map(e => Object.fromEntries(Object.entries(e.dataset)))'
                )
                
                browser.close()
                
                print(f"✅ Rendered: {len(content)} chars, {len(links)} links, {len(data_elements)} data-attrs")
                
                return {
                    "content": content,
                    "links": links,
                    "data_attributes": data_elements
                }
                
        except Exception as e:
            print(f"❌ JavaScript rendering failed: {e}")
            return {"content": "", "links": [], "data_attributes": []}
    
    def fetch_with_jina(self, url: str) -> str:
        """Fetch URL content using Jina.ai Reader API"""
        jina_url = f"https://r.jina.ai/{url}"
        print(f"📡 Fetching: {jina_url}")
        
        try:
            response = requests.get(jina_url, timeout=30)
            response.raise_for_status()
            content = response.text
            print(f"✅ Retrieved {len(content)} characters")
            return content
        except Exception as e:
            print(f"❌ Jina.ai fetch failed: {e}")
            return ""
    
    def extract_pdfs_with_llm(self, content: str, base_url: str, js_data: Optional[Dict] = None) -> List[str]:
        """Use LLM với chain-of-thought reasoning và tool calling"""
        if not self.model:
            return self.extract_pdfs_rules(content, base_url)
        
        # Truncate content if too long (LLM context limit)
        max_chars = 8000
        if len(content) > max_chars:
            content = content[:max_chars] + "\n\n[Content truncated...]"
        
        # Chuẩn bị tool information
        tools_info = ""
        if js_data:
            tools_info = f"""

Available Analysis Tools:
1. Dynamic Links: {len(js_data.get('links', []))} links found from JavaScript rendering
2. Data Attributes: {len(js_data.get('data_attributes', []))} elements with data-* attributes
"""
        
        # Chain-of-thought prompting
        prompt = f"""You are an expert web crawler analyzing a webpage to find PDF download links.

Base URL: {base_url}
{tools_info}

**Step-by-step reasoning process:**

1. ANALYZE the webpage structure:
   - What type of website is this? (news, documentation, file repository, etc.)
   - Where are PDFs typically located on this type of site?

2. IDENTIFY potential PDF sources:
   - Direct links with .pdf extension
   - Data attributes (data-pdf, data-file, data-url, data-download)
   - JavaScript-generated links
   - AJAX endpoints that might return PDF URLs
   - Hidden or collapsed sections

3. EXTRACT all PDF URLs using these patterns:
   - href attributes containing .pdf
   - data-* attributes pointing to PDFs
   - URL patterns in text content
   - Relative paths that need base URL joining

4. VALIDATE each found URL:
   - Is it a complete URL or needs base URL?
   - Does it actually point to a PDF file?

Content:
{content}

**Output Format:**
{{
  "reasoning": "Your step-by-step thought process",
  "pdf_urls": ["list", "of", "pdf", "urls"]
}}

Provide ONLY valid JSON output:"""
        
        messages = [
            {"role": "system", "content": "You are an expert at analyzing web content and extracting PDF download links. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            text = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
                enable_thinking=False
            )
            
            model_inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)
            
            with torch.no_grad():
                generated_ids = self.model.generate(
                    **model_inputs,
                    max_new_tokens=1024*16,
                    temperature=0.1,
                    top_p=0.9,
                    do_sample=True,
                    eos_token_id=self.tokenizer.eos_token_id,
                    pad_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.3
                )
            
            generated_ids = [
                output_ids[len(input_ids):] 
                for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            
            response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            # Parse JSON response với reasoning
            json_match = re.search(r'\{.*?"pdf_urls".*?\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(0))
                reasoning = result.get('reasoning', '')
                pdf_links = result.get('pdf_urls', [])
                
                # Lưu reasoning
                if reasoning:
                    self.reasoning_steps.append(reasoning)
                    print(f"\n💭 LLM Reasoning: {reasoning[:200]}...")
                
                # Make absolute URLs
                absolute_links = []
                for link in pdf_links:
                    if link.startswith('http'):
                        absolute_links.append(link)
                    else:
                        absolute_links.append(urljoin(base_url, link))
                return absolute_links
            
            # Fallback: try old format
            match = re.search(r'\[.*?\]', response, re.DOTALL)
            if match:
                pdf_links = json.loads(match.group(0))
                # Make absolute URLs
                absolute_links = []
                for link in pdf_links:
                    if link.startswith('http'):
                        absolute_links.append(link)
                    else:
                        absolute_links.append(urljoin(base_url, link))
                return absolute_links
            
        except Exception as e:
            print(f"⚠️  LLM extraction failed: {e}")
        
        # Fallback to rule-based
        return self.extract_pdfs_rules(content, base_url)
    
    def extract_pdfs_from_data_attributes(self, data_attrs: List[Dict]) -> List[str]:
        """Tool: Trích xuất PDF từ data attributes (học từ Firecrawl)"""
        pdf_links = []
        
        for attrs in data_attrs:
            for key, value in attrs.items():
                if value and isinstance(value, str):
                    # Kiểm tra nếu value là PDF URL
                    if '.pdf' in value.lower():
                        pdf_links.append(value)
                    # Kiểm tra nếu value là relative path
                    elif value.startswith('/') and 'pdf' in value.lower():
                        pdf_links.append(value)
        
        return pdf_links
    
    def extract_pdfs_from_links(self, links: List[Dict]) -> List[str]:
        """Tool: Trích xuất PDF từ link objects"""
        pdf_links = []
        
        for link in links:
            href = link.get('href', '')
            if href and '.pdf' in href.lower():
                pdf_links.append(href)
            
            # Kiểm tra data attributes trong link
            data_attrs = link.get('dataAttrs', {})
            if data_attrs:
                pdf_links.extend(self.extract_pdfs_from_data_attributes([data_attrs]))
        
        return pdf_links
    
    def extract_pdfs_rules(self, content: str, base_url: str) -> List[str]:
        """Rule-based PDF extraction (fallback) - Enhanced"""
        pdf_links = []
        
        # Pattern 1: Direct PDF URLs
        patterns = [
            r'https?://[^\s<>"]+\.pdf',
            r'/[^\s<>"]*\.pdf',
            r'href=["\']([^"\']*\.pdf[^"\']*)["\']',
            # Pattern cho data attributes
            r'data-pdf=["\']([^"\']+)["\']',
            r'data-file=["\']([^"\']*\.pdf[^"\']*)["\']',
            r'data-url=["\']([^"\']*\.pdf[^"\']*)["\']',
            r'data-download=["\']([^"\']*\.pdf[^"\']*)["\']',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if match.startswith('http'):
                    pdf_links.append(match)
                else:
                    pdf_links.append(urljoin(base_url, match))
        
        return list(set(pdf_links))
    
    def discover_pagination(self, content: str, base_url: str) -> List[str]:
        """Discover pagination URLs to crawl"""
        pagination_urls = []
        
        # Look for pagination patterns
        patterns = [
            r'pagenumber=(\d+)',
            r'/page/(\d+)',
            r'\?page=(\d+)',
        ]
        
        max_page = 1
        for pattern in patterns:
            matches = re.findall(pattern, content)
            if matches:
                max_page = max(max_page, max([int(m) for m in matches]))
        
        # Generate pagination URLs
        if 'pagenumber=' in content:
            for page in range(1, min(max_page + 1, 11)):  # Max 10 pages
                url = re.sub(r'pagenumber=\d+', f'pagenumber={page}', base_url)
                if 'pagenumber=' not in url:
                    url = f"{base_url}?pagenumber={page}"
                pagination_urls.append(url)
        
        return pagination_urls if pagination_urls else [base_url]
    
    def download_pdf(self, url: str) -> bool:
        """Download a single PDF"""
        try:
            filename = url.split('/')[-1]
            # Clean filename
            filename = re.sub(r'[<>:"|?*]', '_', filename)
            if not filename.lower().endswith('.pdf'):
                filename += '.pdf'
            
            filepath = self.output_dir / filename
            
            # Skip if exists
            if filepath.exists():
                print(f"  ⏭️  Skip (exists): {filename}")
                return True
            
            response = requests.get(url, headers=self.headers, timeout=60)
            response.raise_for_status()
            
            # Validate PDF
            if not response.content[:4] == b'%PDF':
                print(f"  ❌ Not a PDF: {filename}")
                return False
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            size_mb = len(response.content) / (1024 * 1024)
            print(f"  ✅ Downloaded: {filename} ({size_mb:.2f} MB)")
            return True
            
        except Exception as e:
            print(f"  ❌ Download failed: {e}")
            return False
    
    def crawl(self, start_url: str, use_llm: bool = True, max_pages: int = 10):
        """Main crawl function"""
        print("\n" + "="*70)
        print("🤖 SMART PDF CRAWLER (Jina.ai + LLM)")
        print("="*70)
        print(f"Target: {start_url}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"\nFeatures:")
        print(f"  🌐 JavaScript Rendering: {'\u2705 Enabled (Firecrawl-style)' if self.use_javascript else '❌ Disabled'}")
        print(f"  🤖 LLM Analysis: {'\u2705 Enabled' if use_llm else '❌ Disabled (Rules only)'}")
        print(f"  📡 Jina.ai Reader: \u2705 Enabled")
        print("="*70 + "\n")
        
        # Load LLM if requested
        if use_llm:
            llm_loaded = self.load_model()
            if not llm_loaded:
                print("Continuing with rule-based extraction...")
        
        # Step 1: Fetch initial page (with JavaScript if enabled)
        print("\n📖 Step 1: Analyzing initial page...")
        
        js_data = None
        if self.use_javascript:
            print("   Using JavaScript rendering (Firecrawl-style)...")
            js_data = self.fetch_with_javascript(start_url)
            content = js_data.get('content', '')
            
            # Extract PDFs from JavaScript-rendered data
            if js_data:
                js_pdfs = []
                js_pdfs.extend(self.extract_pdfs_from_links(js_data.get('links', [])))
                js_pdfs.extend(self.extract_pdfs_from_data_attributes(js_data.get('data_attributes', [])))
                print(f"   🔧 Tool: Found {len(js_pdfs)} PDFs from JS rendering")
                self.discovered_pdfs.update([urljoin(start_url, p) for p in js_pdfs])
        else:
            content = self.fetch_with_jina(start_url)
        
        if not content:
            print("❌ Could not fetch initial page")
            return
        
        # Step 2: Discover pagination
        print("\n📄 Step 2: Discovering pages...")
        urls_to_crawl = self.discover_pagination(content, start_url)
        urls_to_crawl = urls_to_crawl[:max_pages]
        print(f"Found {len(urls_to_crawl)} pages to crawl")
        
        # Step 3: Extract PDFs from all pages
        print("\n🔍 Step 3: Extracting PDF links...")
        for i, url in enumerate(urls_to_crawl, 1):
            print(f"\n[{i}/{len(urls_to_crawl)}] Processing: {url}")
            
            # Fetch page content
            page_js_data = None
            if i > 1:  # Skip first page (already fetched)
                if self.use_javascript:
                    # Ưu tiên JavaScript rendering
                    page_js_data = self.fetch_with_javascript(url)
                    content = page_js_data.get('content', '')
                    
                    # Tool extraction từ JavaScript data
                    tool_pdfs = []
                    tool_pdfs.extend(self.extract_pdfs_from_links(page_js_data.get('links', [])))
                    tool_pdfs.extend(self.extract_pdfs_from_data_attributes(page_js_data.get('data_attributes', [])))
                    if tool_pdfs:
                        print(f"  🔧 JS Tools: Found {len(tool_pdfs)} PDFs")
                        self.discovered_pdfs.update([urljoin(url, p) for p in tool_pdfs])
                    
                    # Fallback sang Jina.ai nếu JS không lấy được content
                    if not content:
                        print("  ⚠️  JS rendering failed, using Jina.ai...")
                        content = self.fetch_with_jina(url)
                else:
                    # Không dùng JavaScript, dùng Jina.ai
                    content = self.fetch_with_jina(url)
                
                if not content:
                    print("  ❌ Could not fetch page")
                    continue
                time.sleep(1)  # Rate limiting
            else:
                # Trang đầu tiên đã fetch, dùng lại js_data từ step 1
                page_js_data = js_data
            
            # Extract PDFs với LLM hoặc rules
            if use_llm and self.model:
                pdfs = self.extract_pdfs_with_llm(content, url, page_js_data)
            else:
                pdfs = self.extract_pdfs_rules(content, url)
            
            print(f"  🔍 Extraction: {len(pdfs)} PDF links")
            self.discovered_pdfs.update(pdfs)
        
        # Step 4: Download all discovered PDFs
        print("\n" + "="*70)
        print(f"📥 Step 4: Downloading {len(self.discovered_pdfs)} PDFs...")
        print("="*70)
        
        downloaded = 0
        failed = 0
        
        for i, pdf_url in enumerate(sorted(self.discovered_pdfs), 1):
            print(f"\n[{i}/{len(self.discovered_pdfs)}] {pdf_url}")
            if self.download_pdf(pdf_url):
                downloaded += 1
            else:
                failed += 1
            time.sleep(0.3)
        
        # Summary
        print("\n" + "="*70)
        print("✨ CRAWL COMPLETE")
        print("="*70)
        print(f"URLs crawled: {len(urls_to_crawl)}")
        print(f"PDFs discovered: {len(self.discovered_pdfs)}")
        print(f"Successfully downloaded: {downloaded}")
        print(f"Failed: {failed}")
        print(f"\nFeatures used:")
        print(f"  🌐 JavaScript rendering: {'\u2705 Enabled' if self.use_javascript else '❌ Disabled'}")
        print(f"  🤖 LLM analysis: {'\u2705 Enabled' if use_llm and self.model else '❌ Disabled'}")
        if self.reasoning_steps:
            print(f"  💭 Reasoning steps: {len(self.reasoning_steps)}")
        print(f"\nSaved to: {self.output_dir.absolute()}")
        print("="*70)
        
        # Save reasoning log
        if self.reasoning_steps:
            reasoning_file = self.output_dir / 'reasoning_log.txt'
            with open(reasoning_file, 'w', encoding='utf-8') as f:
                f.write("LLM Reasoning Steps\n")
                f.write("="*70 + "\n\n")
                for i, step in enumerate(self.reasoning_steps, 1):
                    f.write(f"Step {i}:\n{step}\n\n")
            print(f"📝 Reasoning log saved: {reasoning_file}")


def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python smart_pdf_crawler.py <URL> [OPTIONS]")
        print("\nOptions:")
        print("  --no-llm          Disable LLM analysis (use rule-based only)")
        print("  --no-javascript   Disable JavaScript rendering")
        print("  --max-pages N     Maximum pages to crawl (default: 10)")
        print("\nExamples:")
        print("  python src/smart_pdf_crawler.py https://biwase.com.vn/tin-tuc/ban-tin-biwase")
        print("  python src/smart_pdf_crawler.py https://example.com --no-llm")
        print("  python src/smart_pdf_crawler.py https://example.com --max-pages 5 --no-javascript")
        return
    
    url = sys.argv[1]
    use_llm = '--no-llm' not in sys.argv
    use_javascript = '--no-javascript' not in sys.argv
    
    max_pages = 10
    if '--max-pages' in sys.argv:
        idx = sys.argv.index('--max-pages')
        if idx + 1 < len(sys.argv):
            max_pages = int(sys.argv[idx + 1])
    
    crawler = SmartPDFCrawler(use_javascript=use_javascript)
    crawler.crawl(url, use_llm=use_llm, max_pages=max_pages)


if __name__ == "__main__":
    main()


# # TODO: Fix step 3 using LLM extraction and JavaScript Rendering & Dynamic Content Detection
# 🔍 Step 3: Extracting PDF links...

# [1/8] Processing: https://biwase.com.vn/tin-tuc/ban-tin-biwase?pagenumber=1

# 💭 LLM Reasoning: The page contains news articles about BIWASE but does not explicitly list any direct PDF downloads. The dynamic links generated by JavaScript do not contain .pdf extensions. There are no visible data-...
#   🔍 Extraction: 0 PDF links

# [2/8] Processing: https://biwase.com.vn/tin-tuc/ban-tin-biwase?pagenumber=2
# 🌐 Rendering JavaScript: https://biwase.com.vn/tin-tuc/ban-tin-biwase?pagenumber=2     
# ✅ Rendered: 49291 chars, 101 links, 0 data-attrs

# 💭 LLM Reasoning: The page contains news articles about BIWASE (BWE). The dynamic links generated by JavaScript render contain possible PDF downloads. However, there are no direct <a href> tags with .pdf extensions. No...
#   🔍 Extraction: 0 PDF links

# [3/8] Processing: https://biwase.com.vn/tin-tuc/ban-tin-biwase?pagenumber=3
# 🌐 Rendering JavaScript: https://biwase.com.vn/tin-tuc/ban-tin-biwase?pagenumber=3     
# Traceback (most recent call last):
#   File "D:\web-search-rag\src\smart_pdf_crawler.py", line 551, in <module>
#     main()
#   File "D:\web-search-rag\src\smart_pdf_crawler.py", line 547, in main
#     crawler.crawl(url, use_llm=use_llm, max_pages=max_pages)
#   File "D:\web-search-rag\src\smart_pdf_crawler.py", line 442, in crawl
#     page_js_data = self.fetch_with_javascript(url)
#                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#   File "D:\web-search-rag\src\smart_pdf_crawler.py", line 86, in fetch_with_javascript 
#     page.wait_for_timeout(2000)
#   File "D:\web-search-rag\venv\Lib\site-packages\playwright\sync_api\_generated.py", line 11532, in wait_for_timeout
#     self._sync(self._impl_obj.wait_for_timeout(timeout=timeout))
#   File "D:\web-search-rag\venv\Lib\site-packages\playwright\_impl\_sync_base.py", line 113, in _sync
#     self._dispatcher_fiber.switch()
#   File "D:\web-search-rag\venv\Lib\site-packages\playwright\sync_api\_context_manager.py", line 56, in greenlet_main
#     self._loop.run_until_complete(self._connection.run_as_sync())
#     super().run_forever()
#   File "C:\Program Files\Python312\Lib\asyncio\base_events.py", line 645, in run_forever
#     super().run_forever()
#   File "C:\Program Files\Python312\Lib\asyncio\base_events.py", line 645, in run_forever
#     self._run_once()
#   File "C:\Program Files\Python312\Lib\asyncio\base_events.py", line 1961, in _run_once
#     event_list = self._selector.select(timeout)
#                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#   File "C:\Program Files\Python312\Lib\asyncio\windows_events.py", line 445, in select 
#     self._poll(timeout)
#   File "C:\Program Files\Python312\Lib\asyncio\windows_events.py", line 774, in _poll  
#     status = _overlapped.GetQueuedCompletionStatus(self._iocp, ms)
#              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
# KeyboardInterrupt
# Future exception was never retrieved
# future: <Future finished exception=TargetClosedError('Target page, context or browser has been closed')>
# playwright._impl._errors.TargetClosedError: Target page, context or browser has been closed
