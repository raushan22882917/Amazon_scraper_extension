chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'storeData') {
      const data = request.data;
      console.log('Received data in background script:', data);
      
      // Example: Storing data in local storage
      chrome.storage.local.set({ amazonData: data }, () => {
        console.log('Data saved to local storage');
        sendResponse({ status: 'success' });
      });
    }
  });
  