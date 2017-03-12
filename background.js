chrome.browserAction.onClicked.addListener((info, tab) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const ids = /([0-9\-]+)/.exec(tabs[0].url)
		if(ids.length >= 2) {
			chrome.tabs.sendMessage(tabs[0].id, { ids: ids[1] })
		}
	})
})
