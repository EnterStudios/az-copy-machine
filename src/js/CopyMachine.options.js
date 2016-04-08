(function (CopyMachine, undefined) {
	CopyMachine.options = CopyMachine.options || {};
	
	// Load options from storage.
	chrome.storage.sync.get({
	  'apiToken': '',
	  'readProjects': '[]',
	  'readWriteProjects': '[]'
	}, function (items) {
		CopyMachine.options['apiToken'] = items.apiToken;
		CopyMachine.options['readProjects'] = JSON.parse(items.readProjects);
		CopyMachine.options['readWriteProjects'] = JSON.parse(items.readWriteProjects);
	});
	
	// Set up a listener to catch when options change and update the
	// cached values accordingly.
	chrome.storage.onChanged.addListener(function (changes, namespace) {
		for (key in changes) {
			if (key == 'apiToken') {
				CopyMachine.options[key] = changes[key].newValue;
			} else {
				CopyMachine.options[key] = JSON.parse(changes[key].newValue);
			}
		}
	});
})(window.CopyMachine = window.CopyMachine || {});