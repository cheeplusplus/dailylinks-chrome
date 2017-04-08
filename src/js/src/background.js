chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({"url": "links.html"});
});