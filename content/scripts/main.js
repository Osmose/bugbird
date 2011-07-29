const Cu = Components.utils;
Cu.import('resource://modules/Bugzilla.jsm');
Cu.import('resource://modules/Util.jsm');
var bugs = {};

$(function() {
    // Grab bugs
    Bugzilla.connect('mozilla', 'https://bugzilla.mozilla.org');

    var $buglist = $('#buglist'), buglist = $buglist[0];
    $buglist.bind('select', function(e) {
        var row = buglist.currentIndex, col = buglist.columns.getColumnAt(0);
        var k = buglist.view.getCellValue(row, col);
        showBug(bugs[k]);
    });

    var mybugs = Bugzilla.bug.search({creator: 'mkelly@mozilla.com'});
    mybugs.forEach(function (bug) {
        bugs[bug.id] = bug;
    });
    buglist.view = new Util.BugTreeView(mybugs);

	// Edit connection dialog
	$('#file-connection-edit').bind('command', function(e) {
		var params = {
			in: {
				url: "https://bugzilla.mozilla.com",
				username: 'mkelly@mozilla.com',
				password: 'asdf'
			},
			out: null
		};
		window.openDialog(
			'chrome://bugbird/content/xul/editConnection.xul',
			'',
			'chrome, dialog, modal',
			params
		).focus();
    });

    var bugview = document.getElementById("main_bugview").contentWindow;
    function showBug(bug) {
        bugview.postMessage(JSON.stringify(bug), "*");
    }
});