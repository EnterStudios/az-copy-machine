// Save options to the Chrome sync storage area.
function saveOptions() {
  var apiToken = document.getElementById('apiToken').value;
  
  chrome.storage.sync.set({
	  'apiToken': apiToken
  }, function () {
    message('Options saved.');
  });
}

// Restore options from the Chrome sync storage area.
function restoreOptions() {
  chrome.storage.sync.get({
	  'apiToken': ''
  }, function (items) {
    document.getElementById('apiToken').value = items.apiToken;
  });
}

// Display a temporary status notification on the screen.
function message(msg) {
  var status = document.getElementById('status');
  status.textContent = msg;
  setTimeout(function() {
    status.textContent = '';
  }, 3000);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
