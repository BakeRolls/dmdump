chrome.browserAction.onClicked.addListener((info, tab) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, {})
	})
})
