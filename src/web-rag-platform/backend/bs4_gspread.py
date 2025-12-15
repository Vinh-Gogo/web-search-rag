import requests
from bs4 import BeautifulSoup
import time
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

class BiwaseCrawler:
    def __init__(self, base_url: str = 'https://biwase.com.vn/tin-tuc/ban-tin-biwase', output_dir: str = "store_pdfs"):
        """
        Initialize the BiwaseCrawler.

        Args:
            base_url: The base URL to start crawling from.
            output_dir: The directory to save downloaded PDFs.
        """
        self.base_url = base_url
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        
    def get_soup(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch a URL and return a BeautifulSoup object."""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.content.decode('utf-8'), 'html.parser')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def get_pagination_links(self) -> List[str]:
        """Retrieve pagination links from the base URL."""
        print(f"Starting crawl from: {self.base_url}")
        soup = self.get_soup(self.base_url)
        if not soup:
            return []
            
        pages = []
        for pager in soup.find_all('a', class_='ModulePager'):
            href = pager.get('href')
            if href:
                pages.append(href)
        
        print(f"Found {len(pages)} pagination pages")
        return pages

    def get_news_links(self, page_url: str) -> List[str]:
        """Retrieve news article links from a pagination page."""
        print(f"Processing page: {page_url}")
        soup = self.get_soup(page_url)
        if not soup:
            return []
            
        news_links = []
        for a in soup.find_all('a', class_='img-scale'):
            href = a.get('href')
            if href:
                news_links.append(href)
        return news_links

    def get_pdf_links(self, news_url: str) -> List[str]:
        """Retrieve PDF links from a news article."""
        print(f"Processing news article: {news_url}")
        soup = self.get_soup(news_url)
        if not soup:
            return []
            
        pdf_links = []
        for iframe in soup.find_all('iframe'):
            iframe_src = iframe.get('src')
            if iframe_src:
                src = f"https://biwase.com.vn/{iframe_src}"
                pdf_links.append(src)
        return pdf_links

    def download_pdf(self, pdf_url: str) -> bool:
        """Download a PDF file."""
        try:
            print(f"Downloading {pdf_url}...")
            response = self.session.get(pdf_url)
            filename = pdf_url.split('/')[-1]
            file_path = self.output_dir / filename
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            print(f"Saved to {file_path}")
            return True
        except Exception as e:
            print(f"Error downloading {pdf_url}: {e}")
            return False

    def crawl(self) -> Dict[str, Any]:
        """Execute the full crawl process."""
        pages_num = self.get_pagination_links()
        pages_found = len(pages_num)
        
        all_news = []
        for page in pages_num:
            time.sleep(1)  # Rate limiting
            all_news.extend(self.get_news_links(page))
            
        unique_news = list(set(all_news))
        print(f"Found {len(unique_news)} unique news articles")
        
        all_pdfs = []
        for news_link in unique_news:
            time.sleep(1)  # Rate limiting
            all_pdfs.extend(self.get_pdf_links(news_link))
            
        unique_pdfs = list(set(all_pdfs))
        pdfs_found = len(unique_pdfs)
        print(f"Total PDFs found: {pdfs_found}")
        
        downloaded_count = 0
        for pdf_url in unique_pdfs:
            time.sleep(1)  # Rate limiting
            if self.download_pdf(pdf_url):
                downloaded_count += 1
                
        return {
            "success": True,
            "pages_found": pages_found,
            "pdfs_found": pdfs_found,
            "pdf_urls": unique_pdfs,
            "downloaded": downloaded_count,
            "output_dir": str(self.output_dir),
            "message": f"Successfully crawled and downloaded {downloaded_count} PDFs from {pages_found} pages"
        }

def main(link: str='https://biwase.com.vn/tin-tuc/ban-tin-biwase'):
    """
    Main entry point that uses the BiwaseCrawler class.
    Kept for backward compatibility with existing calls.
    """
    crawler = BiwaseCrawler(link)
    try:
        return crawler.crawl()
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "pages_found": 0,
            "pdfs_found": 0,
            "pdf_urls": [],
            "downloaded": 0,
            "message": f"Crawl failed: {e}"
        }

if __name__ == "__main__":
    result = main()
    print(f"Crawl result: {result}")
