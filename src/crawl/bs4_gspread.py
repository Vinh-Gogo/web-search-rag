import requests
from bs4 import BeautifulSoup
# Slpeep 3 seconds between requests to be polite
import time

# Scrape data
url = 'https://biwase.com.vn/tin-tuc/ban-tin-biwase'
pages_num = []
news = []
pdfs = []

html = requests.get(url).content
soup = BeautifulSoup(html, 'html.parser')

# Get all <a class="ModulePager" href=...> links
for pager in soup.find_all('a', class_='ModulePager'):
    href = pager.get('href')
    if href:
        pages_num.append(href)

print()
print(pages_num)

for page in pages_num:
    time.sleep(3)
    print(page)
    html = requests.get(page).content
    soup = BeautifulSoup(html, 'html.parser')
    
    # Get all <a class="img-scale" href=...> links
    for a in soup.find_all('a', class_='img-scale'):
        href = a.get('href')
        if href:
            news.append(href)

print()
news = list(set(news))
print(news)

for new in news:
    time.sleep(3)
    print(new)
    html = requests.get(new).content
    soup = BeautifulSoup(html, 'html.parser')

    # Get all <iframe src=...> links
    for iframe in soup.find_all('iframe'):
        src = f"https://biwase.com.vn/{iframe.get('src')}"
        if src:
            pdfs.append(src)


# Unique PDFs only
print()
pdfs = list(set(pdfs))
print(f"Total PDFs found in {len(news)} news:", len(pdfs))
print()

output_dir = "src/biwase_data/pdfs_all"
# Dowmnload link PDFs
for pdf in pdfs:
    time.sleep(3)
    print(f"Downloading {pdf}...")
    response = requests.get(pdf)
    filename = pdf.split('/')[-1]
    with open(f"{output_dir}/{filename}", 'wb') as f:
        f.write(response.content)
    print(f"Saved to {output_dir}/{filename}")

# ['https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-11-nam-2025', 
# 'https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-10-nam-2025', 
# 'https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-9-nam-2025', 
# 'https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-8-nam-2025', 
# 'https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-7-nam-2025', 
# 'https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-6-nam-2025', 
# 'https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-5-nam-2025', 
# 'https://biwase.com.vn/tin-tuc/ban-tin-biwase/ban-tin-biwase-thang-4-nam-2025']