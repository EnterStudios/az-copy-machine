(function (CopyMachine, undefined) {
	CopyMachine.ui = CopyMachine.ui || {};
	CopyMachine.ui.buttons = CopyMachine.ui.buttons || {};

	// Inject Font Awesome into the page.
	var fa = document.createElement('style');
    fa.type = 'text/css';
    fa.textContent = '@font-face { font-family: FontAwesome; src: url("'
        + chrome.extension.getURL('fonts/fontawesome-webfont.woff?v=4.5.0')
        + '"); }';
	document.head.appendChild(fa);

	/**
	 * Add a button to the toolbar on a Story.
	 * 
	 * @param name Button name
	 * @param iconClass Font Awesome icon class
	 * @param click Function to perform the button's action
	 */
	CopyMachine.ui.addToolbarButton = function (name, iconClass, click) {
		var buttonOptions = {
			buttonId: 'story-toolbar-' + name,
			buttonTitle: name + ' story to another project',
			buttonText: name,
			buttonLongText: name + ' Story',
			icon: iconClass
		};
		CopyMachine.ui.buttons[name] = buttonOptions;
		
		var newButton = document.createElement('button');
		newButton.type = 'button';
		newButton.id = buttonOptions.buttonId;
		newButton.title = buttonOptions.buttonTitle;
		
		var buttonIcon = document.createElement('i');
		buttonIcon.className = buttonOptions.icon;
		newButton.appendChild(buttonIcon);

		var buttonText = document.createTextNode(buttonOptions.buttonText);
		newButton.appendChild(buttonText);
		
		var toolbar = document.getElementById('story-buttons');
		toolbar.appendChild(newButton);
		
		addDropdownPanel(name, click);
	};

	/**
	 * Populate a dropdown with a Project list.
	 * 
	 * @param dropdownId ID of the dropdown element
	 * @param projects The list of Projects
	 */
	CopyMachine.ui.populateProjects = function (dropdownId, projects) {
		var dropdown = document.getElementById(dropdownId);
		
		// Clear out anything aleady in the list
		var fc = dropdown.firstChild;
		while (fc) {
			dropdown.removeChild(fc);
			fc = dropdown.firstChild;
		}
		
		// Add options for each Project to the dropdown
		for (var i = 0; i < projects.length; i++) {
			var projectOption = document.createElement('option');
			projectOption.value = projects[i].id;
			projectOption.innerHTML = projects[i].name;
				
			dropdown.appendChild(projectOption);
		}
	};
	
	/**
	 * Populate a dropdown with the Story details.
	 * 
	 * @param dropdownOptions Options of the dropdown element
	 * @param story The Story details
	 */
	CopyMachine.ui.populateStory = function (dropdownOptions, story) {
		var titleArea = document.getElementById(dropdownOptions.titleId);
		titleArea.value = story.text;
	};
	
	/**
	 * Show a processing overlay in a dropdown and hide other elements.
	 * 
	 * @param buttonKey The key of the dropdown's button. 
	 */
	CopyMachine.ui.showProcessingOverlay = function (buttonKey) {
		var buttonOptions = CopyMachine.ui.buttons[buttonKey];
		var panel = document.getElementById(buttonOptions.dropdownId);
		panel.firstChild.className = 'jq-dropdown-panel project-panel loadingHide';
	};
	
	/**
	 * Hide a processing overlay in a dropdown and show other elements.
	 * 
	 * @param buttonKey The key of the dropdown's button. 
	 */
	CopyMachine.ui.hideProcessingOverlay = function (buttonKey) {
		var buttonOptions = CopyMachine.ui.buttons[buttonKey];
		var panel = document.getElementById(buttonOptions.dropdownId);
		panel.firstChild.className = 'jq-dropdown-panel project-panel';
	};
	
	/**
	 * Hide a dropdown.
	 * 
	 * @param buttonKey The key of the dropdown's button. 
	 */
	CopyMachine.ui.hideDropdown = function (buttonKey) {
		var buttonOptions = CopyMachine.ui.buttons[buttonKey];
		$('#' + buttonOptions.buttonId).jqDropdown('hide');
	};
	
	// Add a dropdown panel to a button.
	function addDropdownPanel(name, click) {
		var buttonOptions = CopyMachine.ui.buttons[name];
		buttonOptions.dropdownId = name + '-dropdown';
		buttonOptions.dropdownTitle = name + ' to...';
		buttonOptions.actionButtonId = name + '-button';
		buttonOptions.projectListId = name + '-project-list';
		buttonOptions.inclTagsId = name + '-inclTags';
		buttonOptions.inclTasksId = name + '-inclTasks';
		buttonOptions.titleId = name + '-title';
		
		// Title of the Popup
		var popupTitleText = document.createTextNode(buttonOptions.buttonLongText);
		var popupTitleSpan = document.createElement('span');
		popupTitleSpan.appendChild(popupTitleText);
		popupTitleSpan.className = 'copy-title';
		var popupTitle = document.createElement('div');
		popupTitle.appendChild(popupTitleSpan);
		
		// Title of the ticket
		var ticketTitleText = document.createTextNode('Title');
		var ticketTitle = document.createElement('label');
		ticketTitle.appendChild(ticketTitleText);
		ticketTitle.className = 'copy-label';
		
		var ticketTitleArea = document.createElement('textarea');
		ticketTitleArea.className = 'copy-text';
		ticketTitleArea.id = buttonOptions.titleId;
		
		// Title of the dropdown panel
		var projectTitleText = document.createTextNode(buttonOptions.dropdownTitle);
		var projectTitle = document.createElement('label');
		projectTitle.appendChild(projectTitleText);
		projectTitle.className = 'copy-label';
		
		// Dropdown containing Project list
		var projectSelect = document.createElement('select');
		projectSelect.id = buttonOptions.projectListId;
		
		// Additional options to copy
		var inclTitleText = document.createTextNode('Keep...');
		var inclTitle = document.createElement('label');
		inclTitle.appendChild(inclTitleText);
		inclTitle.className = 'copy-label';
		
		/// Include tags
		var inclTags = document.createElement('input');
		inclTags.type = 'checkbox';
		inclTags.id = buttonOptions.inclTagsId;
		
		var inclTagsText = document.createTextNode('Tags');
		var inclTagsLabel = document.createElement('label');
		inclTagsLabel.appendChild(inclTags);
		inclTagsLabel.appendChild(inclTagsText);
		
		/// Include tasks
		var inclTasks = document.createElement('input');
		inclTasks.type = 'checkbox';
		inclTasks.id = buttonOptions.inclTasksId;
		
		var inclTasksText = document.createTextNode('Tasks');
		var inclTasksLabel = document.createElement('label');
		inclTasksLabel.appendChild(inclTasks);
		inclTasksLabel.appendChild(inclTasksText);
		
		// Action button to submit the request
		var actionButton = document.createElement('button');
		actionButton.type = 'button';
		actionButton.className = 'small';
		actionButton.id = buttonOptions.actionButtonId;
		actionButton.addEventListener('click', function () {
			actionClicked(buttonOptions.buttonText, click);
		});
		
		var buttonText = document.createTextNode(buttonOptions.buttonLongText);
		actionButton.appendChild(buttonText);
		
		var buttonPanel = document.createElement('div');
		buttonPanel.className = 'buttons';
		buttonPanel.appendChild(actionButton);
		
		var loadingPanel = document.createElement('div');
		var imageUrl = chrome.extension.getURL('images/balls.svg');
		loadingPanel.style.backgroundImage = 'url("' + imageUrl + '")';
		loadingPanel.style.width = '166px';
		loadingPanel.style.height = '166px';
		loadingPanel.className = 'loadingSpinner';

		// Set up the main dropdown panel
		var projectPanel = document.createElement('div');
		projectPanel.className = 'jq-dropdown-panel project-panel';
		projectPanel.appendChild(popupTitle);
		projectPanel.appendChild(ticketTitle);
		projectPanel.appendChild(ticketTitleArea);
		projectPanel.appendChild(inclTitle);
		projectPanel.appendChild(inclTagsLabel);
		projectPanel.appendChild(inclTasksLabel);
		projectPanel.appendChild(document.createElement('br'));
		projectPanel.appendChild(projectTitle);
		projectPanel.appendChild(projectSelect);
		projectPanel.appendChild(buttonPanel);
		projectPanel.appendChild(loadingPanel);
		
		var ddDiv = document.createElement('div');
		ddDiv.id = buttonOptions.dropdownId;
		ddDiv.className = 'jq-dropdown jq-dropdown-tip';
		ddDiv.appendChild(projectPanel);

		// Link to the parent element
		var parentElement = document.getElementById(buttonOptions.buttonId);
		parentElement.setAttribute('data-jq-dropdown', '#' + buttonOptions.dropdownId);

		// Attach dropdown to DOM
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(ddDiv);
	}

	// Fired when an action button is clicked.
	function actionClicked(action, click) {
		var buttonOptions = CopyMachine.ui.buttons[action];
		var projectList = document.getElementById(buttonOptions.projectListId);

		CopyMachine.ui.showProcessingOverlay(action);

		var options = {
			sourceProjectId: CopyMachine.projectId,
			sourceStoryId: CopyMachine.storyId,
			destinationProjectId: projectList.options[projectList.selectedIndex].value,
			includeTags: document.getElementById(buttonOptions.inclTagsId).checked,
			includeTasks: document.getElementById(buttonOptions.inclTasksId).checked,
			newTitle: document.getElementById(buttonOptions.titleId).value
		};

		click(options);
	}
	
})(window.CopyMachine = window.CopyMachine || {});