function scrapeAmazonData(url) {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeData') {
    const data = scrapeAmazonData(window.location.href);
    sendResponse(data);
  }
});
