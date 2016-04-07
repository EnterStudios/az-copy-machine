chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.newTabUrl) {
		chrome.tabs.create({url: request.newTabUrl});
	}
});