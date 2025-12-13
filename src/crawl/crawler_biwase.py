"""
Biwase Newsletter PDF Downloader
Downloads PDF newsletters from Biwase website
Pattern: ban-tin-biwase-t{month}-{year}--a4.pdf
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime
from typing import List, Dict
import time

class BiwaseCrawler:
    def __init__(self):
        self.base_pdf_url = "https://biwase.com.vn/Data/Sites/1/media/filescan/ban-tin-biwase"
        self.output_dir = Path("biwase_data")
        self.output_dir.mkdir(exist_ok=True)
        self.pdfs_dir = self.output_dir / "pdfs"
        self.pdfs_dir.mkdir(exist_ok=True)
    
    def generate_pdf_urls(self, start_year=2020, end_year=2025):
        pdf_list = []
        for year in range(start_year, end_year + 1):
            for month in range(1, 13):
                filename = f"ban-tin-biwase-t{month}-{year}--a4.pdf"
                url = f"{self.base_pdf_url}/{filename}"
                pdf_list.append({
                    'url': url,
                    'filename': filename,
                    'year': year,
                    'month': month,
                })
        return pdf_list
    
    def download_pdf(self, url, filename):
        try:
            filepath = self.pdfs_dir / filename
            if filepath.exists():
                size = filepath.stat().st_size / (1024 * 1024)
                return ('exists', size)
            
            response = requests.get(url, timeout=60)
            if response.status_code == 404:
                return ('not_found', 0)
            response.raise_for_status()
            
            if not response.content[:4] == b'%PDF':
                return ('not_pdf', 0)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            size = filepath.stat().st_size / (1024 * 1024)
            return ('success', size)
        except:
            return ('error', 0)
    
    def run(self, start_year=2020, end_year=2025):
        print("=" * 60)
        print("Biwase Newsletter PDF Downloader")
        print("=" * 60)
        print(f"\nURL Pattern: {self.base_pdf_url}/ban-tin-biwase-t{{month}}-{{year}}--a4.pdf")
        print(f"Checking years: {start_year} - {end_year}")
        
        pdf_list = self.generate_pdf_urls(start_year, end_year)
        
        successful = 0
        not_found = 0
        current_year = None
        
        for pdf in pdf_list:
            if pdf['year'] != current_year:
                current_year = pdf['year']
                print(f"\n  Year {current_year}:")
            
            status, size = self.download_pdf(pdf['url'], pdf['filename'])
            month_str = f"T{pdf['month']:02d}"
            
            if status == 'success':
                print(f"    {month_str}: Downloaded ({size:.2f} MB)")
                successful += 1
            elif status == 'exists':
                print(f"    {month_str}: Already exists ({size:.2f} MB)")
                successful += 1
            elif status == 'not_found':
                print(f"    {month_str}: Not found")
                not_found += 1
            else:
                print(f"    {month_str}: Error")
                not_found += 1
            
            time.sleep(0.2)
        
        print("\n" + "=" * 60)
        print(f"Summary: {successful} downloaded, {not_found} not found")
        print(f"Saved to: {self.pdfs_dir.absolute()}")
        
        downloaded = list(self.pdfs_dir.glob("*.pdf"))
        if downloaded:
            print(f"\nDownloaded files ({len(downloaded)}):")
            for f in sorted(downloaded):
                print(f"  - {f.name}")

if __name__ == "__main__":
    import sys
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 2020
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 2025
    BiwaseCrawler().run(start, end)
