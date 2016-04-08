var API_BASE_URL = 'https://agilezen.com/api/v1/';

$(function () {
	restoreOptions();
	
	$('#save').click(getUserData);
});

// Save options to the Chrome sync storage area.
function saveOptions(apiToken, readProjects, readWriteProjects) {
	var apiToken = $('#apiToken').val();
	
	chrome.storage.sync.set({
		'apiToken': apiToken,
		'readProjects': JSON.stringify(readProjects),
		'readWriteProjects': JSON.stringify(readWriteProjects)
	}, function () {
		message('Options saved.');
	});
}

// Restore options from the Chrome sync storage area.
function restoreOptions() {
	chrome.storage.sync.get({
		'apiToken': '',
		'readProjects': '[]',
		'readWriteProjects': '[]'
	}, function (items) {
		$('#apiToken').val(items.apiToken);
		
		displayOptions(JSON.parse(items.readProjects), JSON.parse(items.readWriteProjects));
	});
}

// Display a temporary status notification on the screen.
function message(msg) {
	var status = $('#status');
	status.textContent = msg;
	
	setTimeout(function() {
		status.textContent = '';
	}, 3000);
}

function getUserData() {
	var apiToken = $('#apiToken').val();

	$.ajax({
		url: API_BASE_URL + 'me',
		headers: { 
			'X-Zen-ApiKey': apiToken
		}
	}).done(function (data) {
		getProjectsAndRoles(data.userName);
	}).fail(function (jqXHR, textStatus) {
		message('Invalid API Token');
	});
}

function getProjectsAndRoles(userName) {
	var apiToken = $('#apiToken').val();

	$.ajax({
		url: API_BASE_URL + 'projects?with=roles',
		headers: { 
			'X-Zen-ApiKey': apiToken
		}
	}).done(function (data) {
		parseProjects(userName, data.items);
	});
}

function parseProjects(userName, projects) {
	var readProjects = [];
	var readWriteProjects = [];
	
	for (p in projects) {
		var project = projects[p];
		var foundRead = false;
		var foundReadWrite = false;
		
		for (r in project.roles) {
			var role = project.roles[r];
			
			if (role.access == 'read' || role.access == 'readwrite' || role.access == 'admin') {
				for (m in role.members) {
					var member = role.members[m];
					
					if (member.userName == userName) {
						if (role.access == 'readwrite' || role.access == 'admin') {
							foundReadWrite = true;
						} else if (role.access == 'read') {
							foundRead = true;
						}
						break;
					}
				}
			}
			if (foundReadWrite) {
				break;
			}
		}
		
		if (foundReadWrite) {
			readWriteProjects.push({
				'name': project.name,
				'id': project.id
			});
		} else if (foundRead) {
			readProjects.push({
				'name': project.name,
				'id': project.id
			});
		}
	}
	var apiToken = $('#apiToken').val();
	saveOptions(apiToken, readProjects, readWriteProjects);
	displayOptions(readProjects, readWriteProjects);
}

function displayOptions(readProjects, readWriteProjects) {
	$('#rList').empty();
	if (readProjects.length) {
		for (rp in readProjects) {
			$('#rList').append('<li>' + readProjects[rp].name + '</li>');
		}
	} else {
		$('#rList').append('<li><em>None</em></li>');
	}
	
	$('#rwList').empty();
	if (readWriteProjects.length) {
		for (rwp in readWriteProjects) {
			$('#rwList').append('<li>' + readWriteProjects[rwp].name + '</li>');
		}
	} else {
		$('#rwList').append('<li><em>None</em></li>');
	}
}
