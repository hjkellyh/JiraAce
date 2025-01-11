chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openOptionsPage') {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
});