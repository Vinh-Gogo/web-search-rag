import requests
from bs4 import BeautifulSoup
# Sleep 3 seconds between requests to be polite
import time
import os
from pathlib import Path

def main(base_url='https://biwase.com.vn/tin-tuc/ban-tin-biwase'):
    """
    Main function to crawl Biwase newsletter pages and extract PDF links
    
    Args:
        base_url: The base URL to start crawling from
        
    Returns:
        dict: Results containing pages_found, pdfs_found, and download status
    """
    # Create output directory
    output_dir = Path("src/biwase_data/pdfs_all")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize data structures
    pages_num = []
    news = []
    pdfs = []
    
    try:
        print(f"Starting crawl from: {base_url}")
        
        # Get initial page
        html = requests.get(base_url).content
        soup = BeautifulSoup(html.decode('utf-8'), 'html.parser')

        # Get all <a class="ModulePager" href=...> links
        for pager in soup.find_all('a', class_='ModulePager'):
            href = pager.get('href')
            if href:
                pages_num.append(href)

        print(f"Found {len(pages_num)} pagination pages")
        pages_found = len(pages_num)

        # Process each pagination page
        for page in pages_num:
            time.sleep(3)  # Rate limiting
            print(f"Processing page: {page}")
            
            try:
                html = requests.get(page).content
                soup = BeautifulSoup(html.decode('utf-8'), 'html.parser')
                
                # Get all <a class="img-scale" href=...> links
                for a in soup.find_all('a', class_='img-scale'):
                    href = a.get('href')
                    if href:
                        news.append(href)
            except Exception as e:
                print(f"Error processing page {page}: {e}")
                continue

        # Remove duplicates
        news = list(set(news))
        print(f"Found {len(news)} unique news articles")

        # Process each news article to find PDF links
        for new in news:
            time.sleep(3)  # Rate limiting
            print(f"Processing news article: {new}")
            
            try:
                html = requests.get(new).content
                soup = BeautifulSoup(html.decode('utf-8'), 'html.parser')

                # Get all <iframe src=...> links
                for iframe in soup.find_all('iframe'):
                    iframe_src = iframe.get('src')
                    if iframe_src:
                        src = f"https://biwase.com.vn/{iframe_src}"
                        pdfs.append(src)
            except Exception as e:
                print(f"Error processing news article {new}: {e}")
                continue

        # Unique PDFs only
        pdfs = list(set(pdfs))
        pdfs_found = len(pdfs)
        print(f"Total PDFs found in {len(news)} news: {pdfs_found}")

        # Download PDFs
        downloaded_count = 0
        for pdf_url in pdfs:
            time.sleep(3)  # Rate limiting
            try:
                print(f"Downloading {pdf_url}...")
                response = requests.get(pdf_url)
                filename = pdf_url.split('/')[-1]
                file_path = output_dir / filename
                
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"Saved to {file_path}")
                downloaded_count += 1
            except Exception as e:
                print(f"Error downloading {pdf_url}: {e}")
                continue

        return {
            "success": True,
            "pages_found": pages_found,
            "pdfs_found": pdfs_found,
            "downloaded": downloaded_count,
            "output_dir": str(output_dir),
            "message": f"Successfully crawled and downloaded {downloaded_count} PDFs from {pages_found} pages"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "pages_found": 0,
            "pdfs_found": 0,
            "downloaded": 0,
            "message": f"Crawl failed: {e}"
        }

if __name__ == "__main__":
    # Run the main function when script is executed directly
    result = main()
    print(f"Crawl result: {result}")
