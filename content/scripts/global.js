// Import other global scripts
var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
        .getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript('chrome://bugbird/content/scripts/xulquery.js', window);

// Dumps a string to the javascript console as a notice
function jsdump(str) {
  Components.classes['@mozilla.org/consoleservice;1']
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(str);
}