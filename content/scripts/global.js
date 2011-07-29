// Import other global scripts
var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader);
jsLoader.loadSubScript('chrome://bugbird/content/scripts/xulquery.js', window);