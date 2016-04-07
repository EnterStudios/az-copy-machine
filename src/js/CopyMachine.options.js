(function (CopyMachine, undefined) {
	CopyMachine.options = CopyMachine.options || {};
	
	// Load options from storage.
	chrome.storage.sync.get({
	  'apiToken': ''
	}, function (items) {
		CopyMachine.options['apiToken'] = items.apiToken;
	});
	
	// Set up a listener to catch when options change and update the
	// cached values accordingly.
	chrome.storage.onChanged.addListener(function (changes, namespace) {
		for (key in changes) {
			CopyMachine.options[key] = changes[key].newValue;
		}
	});
})(window.CopyMachine = window.CopyMachine || {});