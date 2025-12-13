"""
Biwase Newsletter Deep Crawler - Method 1
Crawls all pagination pages and individual articles to find ALL PDFs
Based on CRAWLER_README.md Method 1 (Deep Crawl All Pages)
"""

import requests
from bs4 import BeautifulSoup
import re
import time
import os
from urllib.parse import unquote
from pathlib import Path
from typing import Set, List


class BiwaseDeepCrawler:
    """
    Deep crawler that:
    1. Crawls all pagination pages
    2. Extracts article links from each page
    3. Visits each article and finds PDF links
    4. Downloads all PDFs
    """
    
    def __init__(self, output_dir: str = 'biwase_data/pdfs_all'):
        self.base_url = 'https://biwase.com.vn'
        self.newsletter_url = f'{self.base_url}/tin-tuc/ban-tin-biwase'
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def collect_article_links(self, max_pages: int = 10) -> Set[str]:
        """
        Step 1: Collect all article links from pagination pages
        """
        print('=' * 60)
        print('Step 1: Collecting article links from all pages...')
        print('=' * 60)
        
        all_article_links = set()
        
        for page in range(1, max_pages + 1):
            url = f'{self.newsletter_url}?pagenumber={page}'
            print(f'  Page {page}: ', end='', flush=True)
            
            try:
                response = requests.get(url, headers=self.headers, timeout=10)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                count = 0
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    # Article pattern: /tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-...
                    if '/ban-tin-biwase/ban-tin-biwase-thang' in href:
                        if href.startswith('/'):
                            href = self.base_url + href
                        if href not in all_article_links:
                            all_article_links.add(href)
                            count += 1
                
                if count == 0:
                    print('No more articles (stopping)')
                    break
                else:
                    print(f'{count} new articles found')
                    
            except Exception as e:
                print(f'Error: {e}')
                break
            
            time.sleep(0.5)
        
        print(f'\nTotal unique articles found: {len(all_article_links)}')
        return all_article_links
    
    def find_pdfs_in_articles(self, article_links: Set[str]) -> List[str]:
        """
        Step 2: Find all PDF URLs from articles
        """
        print('\n' + '=' * 60)
        print('Step 2: Searching for PDFs in each article...')
        print('=' * 60)
        
        all_pdfs = []
        sorted_articles = sorted(article_links)
        
        for i, article_url in enumerate(sorted_articles, 1):
            article_name = article_url.split('/')[-1][:50]
            print(f'  [{i}/{len(sorted_articles)}] {article_name}... ', end='', flush=True)
            
            try:
                response = requests.get(article_url, headers=self.headers, timeout=10)
                response.raise_for_status()
                
                # Find PDF links with multiple patterns
                patterns = [
                    r'href=["\']([^"\']*\.pdf[^"\']*)["\']',  # href="...pdf"
                    r'src=["\']([^"\']*\.pdf[^"\']*)["\']',    # src="...pdf"
                    r'(https?://[^\s<>"]*\.pdf)',              # Direct URLs
                ]
                
                found_pdfs = []
                for pattern in patterns:
                    found_pdfs += re.findall(pattern, response.text, re.IGNORECASE)
                
                if found_pdfs:
                    print(f'Found {len(found_pdfs)} PDF(s)')
                    for pdf in found_pdfs:
                        if pdf.startswith('/'):
                            pdf = self.base_url + pdf
                        if pdf not in all_pdfs:
                            all_pdfs.append(pdf)
                            print(f'      -> {pdf.split("/")[-1]}')
                else:
                    print('No PDF')
                    
            except Exception as e:
                print(f'Error: {str(e)[:50]}')
            
            time.sleep(0.3)
        
        print(f'\nTotal unique PDFs found: {len(all_pdfs)}')
        return all_pdfs
    
    def download_pdfs(self, pdf_urls: List[str]) -> dict:
        """
        Step 3: Download all PDFs
        """
        print('\n' + '=' * 60)
        print('Step 3: Downloading PDFs...')
        print('=' * 60)
        
        downloaded = 0
        failed = 0
        skipped = 0
        
        for i, pdf_url in enumerate(pdf_urls, 1):
            # Get filename from URL
            filename = unquote(pdf_url.split('/')[-1])
            filename = filename.replace(' ', '_').replace('(', '').replace(')', '')
            filepath = self.output_dir / filename
            
            print(f'[{i}/{len(pdf_urls)}] {filename[:50]}... ', end='', flush=True)
            
            # Skip if already exists
            if filepath.exists():
                size_mb = filepath.stat().st_size / (1024*1024)
                print(f'Exists ({size_mb:.2f} MB)')
                skipped += 1
                continue
            
            try:
                # URL encode spaces
                encoded_url = pdf_url.replace(' ', '%20')
                response = requests.get(encoded_url, headers=self.headers, timeout=30)
                
                if response.status_code == 200 and len(response.content) > 1000:
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    size_mb = len(response.content) / (1024*1024)
                    print(f'Downloaded ({size_mb:.2f} MB)')
                    downloaded += 1
                else:
                    print(f'Failed (Status: {response.status_code})')
                    failed += 1
                    
            except Exception as e:
                print(f'Error: {str(e)[:30]}')
                failed += 1
            
            time.sleep(0.3)
        
        return {
            'downloaded': downloaded,
            'failed': failed,
            'skipped': skipped,
            'total': len(pdf_urls)
        }
    
    def run(self, max_pages: int = 10):
        """
        Run the complete deep crawl process
        """
        print('\n' + '=' * 60)
        print('BIWASE NEWSLETTER DEEP CRAWLER')
        print('=' * 60)
        print(f'Target: {self.newsletter_url}')
        print(f'Output: {self.output_dir.absolute()}')
        print(f'Max pages to crawl: {max_pages}')
        print('=' * 60 + '\n')
        
        start_time = time.time()
        
        # Step 1: Collect article links
        article_links = self.collect_article_links(max_pages)
        
        if not article_links:
            print('\n❌ No articles found. Exiting.')
            return
        
        # Step 2: Find PDFs in articles
        pdf_urls = self.find_pdfs_in_articles(article_links)
        
        if not pdf_urls:
            print('\n❌ No PDFs found. Exiting.')
            return
        
        # Step 3: Download PDFs
        results = self.download_pdfs(pdf_urls)
        
        # Summary
        elapsed = time.time() - start_time
        print('\n' + '=' * 60)
        print('CRAWL COMPLETE')
        print('=' * 60)
        print(f'Articles crawled: {len(article_links)}')
        print(f'PDFs found: {results["total"]}')
        print(f'Downloaded: {results["downloaded"]}')
        print(f'Skipped (existing): {results["skipped"]}')
        print(f'Failed: {results["failed"]}')
        print(f'Time elapsed: {elapsed:.1f} seconds')
        print(f'Saved to: {self.output_dir.absolute()}')
        print('=' * 60)
        
        # List downloaded files
        downloaded_files = sorted(self.output_dir.glob('*.pdf'))
        if downloaded_files:
            print(f'\nDownloaded files ({len(downloaded_files)}):\n')
            for f in downloaded_files:
                size_mb = f.stat().st_size / (1024*1024)
                print(f'  - {f.name} ({size_mb:.2f} MB)')


if __name__ == '__main__':
    import sys
    
    # Optional: Custom output directory
    output_dir = sys.argv[1] if len(sys.argv) > 1 else 'biwase_data/pdfs_all'
    
    # Optional: Max pages to crawl
    max_pages = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    crawler = BiwaseDeepCrawler(output_dir=output_dir)
    crawler.run(max_pages=max_pages)
