(function (CopyMachine, undefined) {
	CopyMachine.api = CopyMachine.api || {};

	var API_BASE_URL = 'https://agilezen.com/api/v1/';

	/**
	 * Verifies whether the user has set their AgileZen API Key on the options
	 * page. If not, they are alerted and API calls will be canceled.
	 */
	CopyMachine.api.verifyApiToken = function () {
		if (!CopyMachine.options['apiToken']) {
			alert('Missing AgileZen API Key - please set it on the options page.');
			return false;
		}
		
		return true;
	};
	
	/**
	 * Get a list of the available Projects for the user and 
	 * pass them to the provided callback.
	 *
	 * @param callback Pass Project list to this callback function
	 */
	CopyMachine.api.getProjects = function (callback) {
		callback(CopyMachine.options['readProjects'],
			CopyMachine.options['readWriteProjects']
		);
	};
	
	/**
	 * Get whether the user has Read API access for the given Project.
	 *
	 * @param projectId The Project ID
	 */
	CopyMachine.api.hasReadAccessToProject = function (projectId) {
		var rProjects = CopyMachine.options['readProjects'];
		for (rp in rProjects) {
			if (rProjects[rp].id == projectId) {
				return true;
			}
		}
		
		var rwProjects = CopyMachine.options['readWriteProjects'];
		for (rwp in rwProjects) {
			if (rwProjects[rwp].id == projectId) {
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Get whether the user has Read+Write API access for the given Project.
	 *
	 * @param projectId The Project ID
	 */
	CopyMachine.api.hasReadWriteAccessToProject = function (projectId) {
		var rwProjects = CopyMachine.options['readWriteProjects'];
		for (rwp in rwProjects) {
			if (rwProjects[rwp].id == projectId) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Get a Story under the given Project and pass it to
	 * the provided callback.
	 *
	 * @param projectId The Project ID
	 * @param storyId The Story ID
	 * @param callback Pass Story details to this callback function
	 */
	CopyMachine.api.getStory = function (projectId, storyId, callback) {
		if (!CopyMachine.api.verifyApiToken()) {
			return;
		}
		
		$.ajax({
			url: API_BASE_URL + 'projects/' + projectId + '/stories/' + storyId + '?with=details,tags,tasks',
			headers: { 
				'X-Zen-ApiKey': CopyMachine.options['apiToken']
			}
		}).done(function (data) {
			callback(data);
		}).fail(function (jqXHR, textStatus) {
			alert('Failed to load Story details: ' + textStatus);
		});
	};

	/**
	 * Copy a Story to a new Project.
	 *
	 * @param options Source Story and Project, Destination Project, whether to
	 * 				include tags and tasks.
	 * @param callback Function to execute after the copy has completed
	 */
	CopyMachine.api.copyStory = function (options, callback) {
		CopyMachine.api.getStory(options.sourceProjectId, options.sourceStoryId, function (story) {
			var newStory = copyStoryDetails(options, story);

			$.ajax({
				method: 'POST',
				url: API_BASE_URL + 'projects/' + options.destinationProjectId + '/stories',
				data: JSON.stringify(newStory),
				dataType: 'json',
				contentType: 'application/json; charset=utf-8',
				headers: { 
					'X-Zen-ApiKey': CopyMachine.options['apiToken']
				}
			}).done(function (data) {
				if (callback) {
					callback(data.id);
				}
			}).fail(function (jqXHR, textStatus) {
				alert('Failed to copy Story: ' + textStatus);
			});
		});
	};

	/**
	 * Move a Story to a new Project (deleting the original).
	 *
	 * @param options Source Story and Project, Destination Project, whether to
	 * 				include tags and tasks.
	 * @param callback Function to execute after the move has completed
	 */
	CopyMachine.api.moveStory = function (options, callback) {
		CopyMachine.api.copyStory(options, function (newId) {
			// Delete original story after moving
			$.ajax({
				method: 'DELETE',
				url: API_BASE_URL + 'projects/' + options.sourceProjectId + '/stories/' + options.sourceStoryId,
				headers: { 
					'X-Zen-ApiKey': CopyMachine.options['apiToken']
				}
			}).done(function (data) {
				if (callback) {
					callback(newId);
				}
			}).fail(function (jqXHR, textStatus) {
				alert('Failed to delete Story: ' + textStatus);
			});
		});
	};
	
	// Create a new Story object based on the given options.
	function copyStoryDetails(options, story) {
		var newStory = {
			text: story.text,
			details: story.details
		};
		if (story.size) {
			newStory.size = story.size;
		}
		if (story.priority) {
			newStory.priority = story.priority;
		}
		if (story.color) {
			newStory.color = story.color;
		}

		if (options.includeTags && story.tags.length) {
			newStory.tags = [];
			for (tag in story.tags) {
				newStory.tags.push(story.tags[tag].name);
			}
		}
		
		if (options.includeTasks && story.tasks.length) {
			newStory.tasks = [];
			for (task in story.tasks) {
				newStory.tasks.push({
					status: story.tasks[task].status,
					text: story.tasks[task].text
				});
			}
		}

		return newStory;
	}
})(window.CopyMachine = window.CopyMachine || {});