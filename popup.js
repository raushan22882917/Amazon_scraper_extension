document.getElementById('scrapeButton').addEventListener('click', () => {
  const urlInput = document.getElementById('urlInput').value;
  const urls = urlInput.split(',').map(url => url.trim()).filter(url => url.length > 0);

  if (urls.length === 0) {
    alert('Please enter at least one URL.');
    return;
  }

  const loader = document.getElementById('loader');
  loader.style.display = 'block';

  scrapeBulkData(urls).then(data => {
    loader.style.display = 'none';
    if (data.length > 0) {
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, 'amazon_data.csv');
    } else {
      alert('No data scraped.');
    }
  }).catch(error => {
    loader.style.display = 'none';
    console.error('Error during scraping:', error);
    alert('An error occurred during scraping.');
  });
});

async function scrapeBulkData(urls) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`Scraping ${url}`);
    const data = await scrapeAmazonData(url);
    results.push(data);
    console.log(`Completed ${i + 1}/${urls.length}`);
  }
  return results.filter(result => result !== null);
}

function scrapeAmazonData(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: scrapeDataFromPage,
        args: [url]
      }, (results) => {
        if (results && results[0] && results[0].result) {
          resolve(results[0].result);
        } else {
          resolve(null);
        }
      });
    });
  });
}

function scrapeDataFromPage(url) {
  const data = {
    url: url,
    title: document.querySelector('#productTitle') ? document.querySelector('#productTitle').innerText.trim() : 'N/A',
    price: document.querySelector('.a-price .a-offscreen') ? document.querySelector('.a-price .a-offscreen').innerText.trim() : 'N/A',
    rating: document.querySelector('.a-icon-star .a-icon-alt') ? document.querySelector('.a-icon-star .a-icon-alt').innerText.trim() : 'N/A',
    images: Array.from(document.querySelectorAll('#altImages img')).map(img => img.src) || 'N/A',
    specs: Array.from(document.querySelectorAll('.a-section.a-spacing-small.a-spacing-top-small')).map(spec => {
      const key = spec.querySelector('th') ? spec.querySelector('th').innerText.trim() : 'N/A';
      const value = spec.querySelector('td') ? spec.querySelector('td').innerText.trim() : 'N/A';
      return { [key]: value };
    }),
    techDetails: Array.from(document.querySelectorAll('#productDetails_techSpec_section_1 tr')).reduce((acc, row) => {
      const key = row.querySelector('th') ? row.querySelector('th').innerText.trim() : 'N/A';
      const value = row.querySelector('td') ? row.querySelector('td').innerText.trim() : 'N/A';
      acc[key] = value;
      return acc;
    }, {}),
    aboutItem: Array.from(document.querySelectorAll('#feature-bullets ul li')).map(li => li.innerText.trim()) || 'N/A',
    whatsInTheBox: Array.from(document.querySelectorAll('#postPurchaseItems ul li')).map(li => li.innerText.trim()) || 'N/A',
    productDescription: document.querySelector('#productDescription p') ? document.querySelector('#productDescription p').innerText.trim() : 'N/A',
    additionalInformation: Array.from(document.querySelectorAll('#productDetails_detailBullets_sections1 tr')).reduce((acc, row) => {
      const key = row.querySelector('th') ? row.querySelector('th').innerText.trim() : 'N/A';
      const value = row.querySelector('td') ? row.querySelector('td').innerText.trim() : 'N/A';
      acc[key] = value;
      return acc;
    }, {})
  };
  return data;
}

function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header], replacer)).join(','))
  ];
  return csvRows.join('\n');
}

function replacer(key, value) {
  return value === null ? '' : value;
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
