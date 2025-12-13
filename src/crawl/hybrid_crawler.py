"""
Biwase Newsletter Hybrid Crawler - Enhanced Version
Combines:
1. Deep crawl (from article pages)
2. Pattern-based testing (monthly and annual)
3. Additional pattern discovery

This ensures we find ALL available PDFs regardless of naming convention.
"""

import requests
from bs4 import BeautifulSoup
import re
import time
import os
from urllib.parse import unquote
from pathlib import Path
from typing import Set, List


class BiwaseHybridCrawler:
    """
    Hybrid crawler that uses multiple strategies to find ALL PDFs:
    - Deep crawl of article pages
    - Pattern-based URL testing
    - Annual report patterns
    """
    
    def __init__(self, output_dir: str = 'biwase_data/pdfs_all'):
        self.base_url = 'https://biwase.com.vn'
        self.newsletter_url = f'{self.base_url}/tin-tuc/ban-tin-biwase'
        self.pdf_base_url = f'{self.base_url}/Data/Sites/1/media/filescan/ban-tin-biwase'
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.all_pdf_urls = set()
        
    def collect_article_links(self, max_pages: int = 10) -> Set[str]:
        """Strategy 1: Collect article links from pagination pages"""
        print('\n' + '=' * 60)
        print('STRATEGY 1: Collecting article links from pagination')
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
                    if '/ban-tin-biwase/ban-tin-biwase-thang' in href:
                        if href.startswith('/'):
                            href = self.base_url + href
                        if href not in all_article_links:
                            all_article_links.add(href)
                            count += 1
                
                if count == 0:
                    print('No more articles')
                    break
                else:
                    print(f'{count} articles')
                    
            except Exception as e:
                print(f'Error: {e}')
                break
            
            time.sleep(0.3)
        
        print(f'Total articles: {len(all_article_links)}')
        return all_article_links
    
    def find_pdfs_in_articles(self, article_links: Set[str]) -> Set[str]:
        """Strategy 2: Extract PDFs from article pages"""
        print('\n' + '=' * 60)
        print('STRATEGY 2: Extracting PDFs from articles')
        print('=' * 60)
        
        found_pdfs = set()
        sorted_articles = sorted(article_links)
        
        for i, article_url in enumerate(sorted_articles, 1):
            article_name = article_url.split('/')[-1][:45]
            print(f'  [{i}/{len(sorted_articles)}] {article_name}... ', end='', flush=True)
            
            try:
                response = requests.get(article_url, headers=self.headers, timeout=10)
                response.raise_for_status()
                
                patterns = [
                    r'href=["\']([^"\']*\.pdf[^"\']*)["\']',
                    r'src=["\']([^"\']*\.pdf[^"\']*)["\']',
                    r'(https?://[^\s<>"]*\.pdf)',
                ]
                
                pdfs_in_article = []
                for pattern in patterns:
                    pdfs_in_article += re.findall(pattern, response.text, re.IGNORECASE)
                
                if pdfs_in_article:
                    for pdf in pdfs_in_article:
                        if pdf.startswith('/'):
                            pdf = self.base_url + pdf
                        found_pdfs.add(pdf)
                    print(f'{len(pdfs_in_article)} PDF(s)')
                else:
                    print('No PDF')
                    
            except Exception as e:
                print(f'Error')
            
            time.sleep(0.2)
        
        print(f'PDFs from articles: {len(found_pdfs)}')
        self.all_pdf_urls.update(found_pdfs)
        return found_pdfs
    
    def test_pattern_urls(self, start_year: int = 2015, end_year: int = 2026) -> Set[str]:
        """Strategy 3: Test pattern-based URLs"""
        print('\n' + '=' * 60)
        print('STRATEGY 3: Testing pattern-based URLs')
        print('=' * 60)
        
        found_pdfs = set()
        patterns_to_test = []
        
        # Annual reports
        print('\n  Testing annual reports...')
        for year in range(start_year, end_year):
            patterns_to_test.append(f'BanTinBiwaseNam{year}.pdf')
        
        # Monthly patterns (multiple variations)
        print('  Testing monthly patterns...')
        for year in range(start_year, end_year):
            for month in range(1, 13):
                # Pattern 1: ban-tin-biwase-t{m}-{y}--a4.pdf
                patterns_to_test.append(f'ban-tin-biwase-t{month}-{year}--a4.pdf')
                # Pattern 2: BAN-TIN-BIWASE-T{m}-{y}-A4.pdf
                patterns_to_test.append(f'BAN-TIN-BIWASE-T{month}-{year}-A4.pdf')
        
        # Test all patterns
        for pattern in patterns_to_test:
            url = f'{self.pdf_base_url}/{pattern}'
            try:
                response = requests.head(url, headers=self.headers, timeout=5)
                if response.status_code == 200:
                    found_pdfs.add(url)
                    # Only print newly found PDFs
                    if url not in self.all_pdf_urls:
                        print(f'    ✅ New: {pattern}')
            except:
                pass
            time.sleep(0.1)
        
        new_pdfs = found_pdfs - self.all_pdf_urls
        print(f'\nNew PDFs from patterns: {len(new_pdfs)}')
        self.all_pdf_urls.update(found_pdfs)
        return found_pdfs
    
    def download_pdfs(self, pdf_urls: Set[str]) -> dict:
        """Download all collected PDFs"""
        print('\n' + '=' * 60)
        print('DOWNLOADING ALL PDFs')
        print('=' * 60)
        
        downloaded = 0
        failed = 0
        skipped = 0
        
        sorted_urls = sorted(pdf_urls)
        
        for i, pdf_url in enumerate(sorted_urls, 1):
            filename = unquote(pdf_url.split('/')[-1])
            filename = filename.replace(' ', '_').replace('(', '').replace(')', '')
            filepath = self.output_dir / filename
            
            print(f'[{i}/{len(sorted_urls)}] {filename[:50]}... ', end='', flush=True)
            
            if filepath.exists():
                size_mb = filepath.stat().st_size / (1024*1024)
                print(f'Exists ({size_mb:.2f} MB)')
                skipped += 1
                continue
            
            try:
                encoded_url = pdf_url.replace(' ', '%20')
                response = requests.get(encoded_url, headers=self.headers, timeout=30)
                
                if response.status_code == 200 and len(response.content) > 1000:
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    size_mb = len(response.content) / (1024*1024)
                    print(f'Downloaded ({size_mb:.2f} MB)')
                    downloaded += 1
                else:
                    print(f'Failed ({response.status_code})')
                    failed += 1
                    
            except Exception as e:
                print(f'Error')
                failed += 1
            
            time.sleep(0.2)
        
        return {
            'downloaded': downloaded,
            'failed': failed,
            'skipped': skipped,
            'total': len(sorted_urls)
        }
    
    def run(self, max_pages: int = 10, start_year: int = 2015, end_year: int = 2026):
        """Run the complete hybrid crawl process"""
        print('\n' + '=' * 70)
        print('BIWASE NEWSLETTER HYBRID CRAWLER (ENHANCED)')
        print('=' * 70)
        print(f'Target: {self.newsletter_url}')
        print(f'Output: {self.output_dir.absolute()}')
        print(f'Strategies: Deep Crawl + Pattern Testing')
        print('=' * 70)
        
        start_time = time.time()
        
        # Strategy 1: Deep crawl articles
        article_links = self.collect_article_links(max_pages)
        
        # Strategy 2: Extract PDFs from articles
        if article_links:
            self.find_pdfs_in_articles(article_links)
        
        # Strategy 3: Test pattern-based URLs
        self.test_pattern_urls(start_year, end_year)
        
        # Summary of collected URLs
        print('\n' + '=' * 70)
        print(f'TOTAL UNIQUE PDFs FOUND: {len(self.all_pdf_urls)}')
        print('=' * 70)
        
        if not self.all_pdf_urls:
            print('❌ No PDFs found. Exiting.')
            return
        
        # Download all PDFs
        results = self.download_pdfs(self.all_pdf_urls)
        
        # Final summary
        elapsed = time.time() - start_time
        print('\n' + '=' * 70)
        print('CRAWL COMPLETE')
        print('=' * 70)
        print(f'Articles crawled: {len(article_links)}')
        print(f'Total PDFs discovered: {len(self.all_pdf_urls)}')
        print(f'Downloaded: {results["downloaded"]}')
        print(f'Skipped (existing): {results["skipped"]}')
        print(f'Failed: {results["failed"]}')
        print(f'Time elapsed: {elapsed:.1f} seconds')
        print(f'Saved to: {self.output_dir.absolute()}')
        print('=' * 70)
        
        # List all downloaded files
        downloaded_files = sorted(self.output_dir.glob('*.pdf'))
        if downloaded_files:
            print(f'\nAll downloaded files ({len(downloaded_files)}):\n')
            for f in downloaded_files:
                size_mb = f.stat().st_size / (1024*1024)
                print(f'  - {f.name} ({size_mb:.2f} MB)')


if __name__ == '__main__':
    import sys
    
    output_dir = sys.argv[1] if len(sys.argv) > 1 else 'biwase_data/pdfs_all'
    max_pages = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    start_year = int(sys.argv[3]) if len(sys.argv) > 3 else 2015
    end_year = int(sys.argv[4]) if len(sys.argv) > 4 else 2026
    
    crawler = BiwaseHybridCrawler(output_dir=output_dir)
    crawler.run(max_pages=max_pages, start_year=start_year, end_year=end_year)
