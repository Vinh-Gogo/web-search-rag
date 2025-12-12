# Biwase Newsletter Crawler - Complete Guide

## Overview

This guide explains multiple methods to crawl the Biwase newsletter page (https://biwase.com.vn/tin-tuc/ban-tin-biwase) and extract/download PDF files.

## What is Firecrawl?

Firecrawl is a web crawling API that:
- Takes any URL and converts it into clean, structured data
- Handles JavaScript-rendered content
- Extracts markdown, HTML, metadata, and more
- Supports PDFs, docx, and image parsing
- Works with complex websites and anti-bot mechanisms

More info: https://firecrawl.dev

---

## Method 1: Deep Crawl All Pages (Recommended)

This method crawls all pagination pages and individual articles to find ALL PDFs.

### Why This Method?

- Main page doesn't contain direct PDF links
- PDFs are embedded inside individual article pages
- Need to crawl multiple pagination pages (1, 2, 3...)
- Most comprehensive - finds ALL available PDFs

### How It Works

```
Step 1: Crawl all pagination pages (?pagenumber=1, 2, 3...)
   ↓
Step 2: Extract article links from each page
   ↓
Step 3: Visit each article and find PDF links
   ↓
Step 4: Download all PDFs
```

### Python Code

```python
import requests
from bs4 import BeautifulSoup
import re
import time
import os
from urllib.parse import unquote

# Configuration
BASE_URL = 'https://biwase.com.vn'
OUTPUT_DIR = 'biwase_data/pdfs_all'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Step 1: Collect all article links from all pages
print('Step 1: Collecting article links from all pages...')
all_article_links = set()

for page in range(1, 10):  # Pages 1-9
    url = f'{BASE_URL}/tin-tuc/ban-tin-biwase?pagenumber={page}'
    print(f'  Page {page}: ', end='')
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        count = 0
        for a in soup.find_all('a', href=True):
            href = a['href']
            # Article pattern: /tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-...
            if '/ban-tin-biwase/ban-tin-biwase-thang' in href:
                if href.startswith('/'):
                    href = BASE_URL + href
                if href not in all_article_links:
                    all_article_links.add(href)
                    count += 1
        print(f'{count} articles found')
    except Exception as e:
        print(f'Error: {e}')
        break
    
    time.sleep(0.5)

print(f'\nTotal unique articles: {len(all_article_links)}')

# Step 2: Find all PDF URLs from articles
print('\nStep 2: Searching for PDFs in each article...')
all_pdfs = []

for i, article_url in enumerate(sorted(all_article_links), 1):
    article_name = article_url.split('/')[-1][:40]
    print(f'  [{i}/{len(all_article_links)}] {article_name}... ', end='')
    
    try:
        response = requests.get(article_url, headers=HEADERS, timeout=10)
        
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
                    pdf = BASE_URL + pdf
                if pdf not in all_pdfs:
                    all_pdfs.append(pdf)
                    print(f'      -> {pdf}')
        else:
            print('No PDF')
    except Exception as e:
        print(f'Error: {e}')
    
    time.sleep(0.3)

print(f'\nTotal PDFs found: {len(all_pdfs)}')

# Step 3: Download all PDFs
print('\n' + '='*60)
print('Step 3: Downloading PDFs...')
print('='*60)

downloaded = 0
failed = 0

for i, pdf_url in enumerate(all_pdfs, 1):
    # Get filename from URL
    filename = unquote(pdf_url.split('/')[-1])
    filename = filename.replace(' ', '_').replace('(', '').replace(')', '')
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    print(f'[{i}/{len(all_pdfs)}] {filename[:45]}... ', end='')
    
    # Skip if already exists
    if os.path.exists(filepath):
        size_mb = os.path.getsize(filepath) / (1024*1024)
        print(f'Exists ({size_mb:.2f} MB)')
        downloaded += 1
        continue
    
    try:
        # URL encode spaces
        encoded_url = pdf_url.replace(' ', '%20')
        response = requests.get(encoded_url, headers=HEADERS, timeout=30)
        
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

# Summary
print('\n' + '='*60)
print(f'COMPLETE: {downloaded} downloaded, {failed} failed')
print(f'Saved to: {os.path.abspath(OUTPUT_DIR)}')
print('='*60)
```

### Installation

```bash
pip install requests beautifulsoup4
```

### Usage

```bash
# Save the code above as: crawl_biwase_all.py
python crawl_biwase_all.py
```

### Expected Output

```
Step 1: Collecting article links from all pages...
  Page 1: 8 articles found
  Page 2: 8 articles found
  Page 3: 6 articles found
  ...

Total unique articles: 38

Step 2: Searching for PDFs in each article...
  [1/38] ban-tin-biwase-thang-01-nam-2023... Found 1 PDF(s)
      -> https://biwase.com.vn/.../ban-tin-biwase-t1-2023-a4.pdf
  ...

Total PDFs found: 38

Step 3: Downloading PDFs...
[1/38] ban-tin-biwase-t1-2023-a4.pdf... Downloaded (1.25 MB)
...

COMPLETE: 38 downloaded, 0 failed
Saved to: D:\firecrawl\biwase_data\pdfs_all
```

---

## Method 2: Direct URL Pattern (If Pattern Known)

If you know the PDF URL pattern, use this faster method.

### Biwase PDF URL Pattern

```
https://biwase.com.vn/Data/Sites/1/media/filescan/ban-tin-biwase/ban-tin-biwase-t{month}-{year}--a4.pdf
```

### Python Code

```python
import requests
import os

OUTPUT_DIR = 'biwase_data/pdfs'
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = 'https://biwase.com.vn/Data/Sites/1/media/filescan/ban-tin-biwase'
HEADERS = {'User-Agent': 'Mozilla/5.0'}

for year in range(2021, 2026):
    for month in range(1, 13):
        filename = f'ban-tin-biwase-t{month}-{year}--a4.pdf'
        url = f'{BASE_URL}/{filename}'
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        print(f'{filename}: ', end='')
        
        if os.path.exists(filepath):
            print('Already exists')
            continue
            
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                print(f'Downloaded ({len(response.content)/(1024*1024):.2f} MB)')
            else:
                print('Not found')
        except:
            print('Error')
```

### Limitation

⚠️ **Note**: Biwase uses inconsistent PDF naming patterns:
- `ban-tin-biwase-t1-2023-a4.pdf`
- `BAN TIN BIWASE T2-2024 - (2)A4.pdf`
- `ban-tin-biwase-t6-2024---a4-(fixed).pdf`

**Method 1 (Deep Crawl) is recommended** because it finds the actual PDF URLs.

---

## Method 3: Using Firecrawl API

Use Firecrawl's official SDK for advanced features.

### Installation

```bash
pip install firecrawl-py
```

### Set API Key

```bash
# Git Bash / Linux / Mac:
export FIRECRAWL_API_KEY=fc-your_api_key_here

# Windows CMD:
set FIRECRAWL_API_KEY=fc-your_api_key_here

# Windows PowerShell:
$env:FIRECRAWL_API_KEY = "fc-your_api_key_here"
```

### Python Code

```python
from firecrawl import Firecrawl
import os
import re

# Initialize
app = Firecrawl(api_key=os.environ.get('FIRECRAWL_API_KEY'))

# Scrape a page
url = 'https://biwase.com.vn/tin-tuc/ban-tin-biwase'
result = app.scrape(url, formats=['markdown', 'html', 'links'])

# Find PDF links
pdf_links = []
if 'html' in result:
    pattern = r'href=["\']([^"\']*\.pdf[^"\']*)["\']'
    pdf_links = re.findall(pattern, result['html'], re.IGNORECASE)

print(f'Found {len(pdf_links)} PDFs')
for link in pdf_links:
    print(f'  - {link}')
```

### Important Notes

- Firecrawl import: `from firecrawl import Firecrawl` (not `FirecrawlApp`)
- Method name: `app.scrape()` (not `scrape_url()`)
- Parameters: Use keyword arguments: `app.scrape(url, formats=[...])`

---

## Comparison of Methods

| Feature | Method 1 (Deep Crawl) | Method 2 (Pattern) | Method 3 (Firecrawl) |
|---------|----------------------|-------------------|---------------------|
| Finds all PDFs | ✅ Yes | ❌ Only matching pattern | ✅ Yes |
| Speed | Medium | Fast | Fast |
| No API needed | ✅ Yes | ✅ Yes | ❌ Requires API key |
| Handles JS | ❌ No | N/A | ✅ Yes |
| Best for | Complete crawling | Known patterns | Dynamic content |

---

## Output Structure

```
biwase_data/
├── pdfs/              # Method 2 output
│   └── ban-tin-biwase-t4-2025--a4.pdf
│   └── ...
├── pdfs_all/          # Method 1 output (all PDFs)
│   └── ban-tin-biwase-t1-2023-a4.pdf
│   └── BAN_TIN_BIWASE_T2-2024_-_2A4.pdf
│   └── ...
└── report_*.json      # Optional crawl reports
```

---

## Troubleshooting

### "No PDF links found"

**Problem**: The main page doesn't show PDFs.

**Solution**: Use Method 1 (Deep Crawl) to check individual article pages.

### "ModuleNotFoundError: No module named 'bs4'"

```bash
pip install beautifulsoup4
```

### "Connection timeout"

```python
# Increase timeout
response = requests.get(url, timeout=60)

# Add delay between requests
time.sleep(1)
```

### PDF download fails but URL is valid

```python
# URL encode spaces and special characters
from urllib.parse import quote
encoded_url = quote(pdf_url, safe=':/')
```

### Git Bash: "API key not found"

```bash
# Use export (not set) in Git Bash:
export FIRECRAWL_API_KEY=fc-your_key
```

---

## Legal & Ethical Use

- Always check `robots.txt` before scraping
- Respect rate limits (add delays between requests)
- Don't overload servers
- Respect copyright and data privacy laws
- Check website's Terms of Service

---

## Quick Commands

```bash
# Install dependencies
pip install requests beautifulsoup4 firecrawl-py

# Run deep crawler (Method 1 - recommended)
python crawl_biwase_all.py

# Run pattern-based downloader (Method 2)
python crawler_biwase.py 2021 2025

# Set Firecrawl API key (Git Bash)
export FIRECRAWL_API_KEY=fc-your_api_key
```

---

**Created with Firecrawl** - Turn websites into LLM-ready data
