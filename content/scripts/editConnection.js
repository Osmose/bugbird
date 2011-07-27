const Cu = Components.utils;
Cu.import('resource://modules/xulquery.jsm');
var $ = XULQuery(window);
var params = window.arguments[0];

$(function() {
	$('#url').val(params.in.url);
	$('#username').val(params.in.username);
	$('#password').val(params.in.password);
});

function onOK() {
	params.out = {
		url: $('#url').val(),
		username: $('#username').val(),
		password: $('#password').val()
	};

	return true;
};
