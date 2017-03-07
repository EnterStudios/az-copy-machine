;(function (CopyMachine, undefined) {
	// Find the Project ID and Story ID of the current page
	var pattern = /\/project\/(\d*)\/story\/(\d*)/gi;
	var matches = pattern.exec(window.location.pathname);
	
	CopyMachine.projectId = matches[1];
	CopyMachine.storyId = matches[2];

	$(function () { // Necessary to delay so the options can be loaded from storage
	// Inject a Copy button into the toolbar
	if (CopyMachine.api.hasReadAccessToProject(CopyMachine.projectId)) {
		CopyMachine.ui.addToolbarButton('Copy', 'fa fa-clone', function (options) {
			CopyMachine.api.copyStory(options, function (newStoryId) {
				CopyMachine.ui.hideDropdown('Copy');
			
				// Open clone in new tab
				chrome.runtime.sendMessage({
					newTabUrl: 'https://agilezen.com/project/' + options.destinationProjectId + '/story/' + newStoryId
				});
			});
		});
	}

	// Inject a Move button into the toolbar	
	if (CopyMachine.api.hasReadWriteAccessToProject(CopyMachine.projectId)) {
		CopyMachine.ui.addToolbarButton('Move', 'fa fa-external-link', function (options) {
			CopyMachine.api.moveStory(options, function (newStoryId) {
				// Redirect to new story (since current one has been deleted)
				window.location.href = 'https://agilezen.com/project/' + options.destinationProjectId + '/story/' + newStoryId;
			});
		});
	}

	// Populate the Project list when a dropdown is shown
	for (key in CopyMachine.ui.buttons) {
		$('#' + CopyMachine.ui.buttons[key].dropdownId).on('show', function (b) {
			return function (event, dropdownData) {
				CopyMachine.ui.hideProcessingOverlay(b);
				
				CopyMachine.api.getProjects(function (readProjects, readWriteProjects) {
					var projectListId = CopyMachine.ui.buttons[b].projectListId;
					CopyMachine.ui.populateProjects(projectListId, readWriteProjects);
				});
				CopyMachine.api.getStory(CopyMachine.projectId, CopyMachine.storyId, function (story) {
					CopyMachine.ui.populateStory(CopyMachine.ui.buttons[b], story);
				});
			};
		}(key));
	}
	});
})(window.CopyMachine = window.CopyMachine || {});