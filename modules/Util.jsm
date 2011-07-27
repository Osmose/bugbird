let EXPORTED_SYMBOLS = ['Util'];

Util = {
    merge: function() {
        var merged_obj = {};
        for (var k = 0; k < arguments.length; k++) {
            var obj = arguments[k];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop) &&
                    !merged_obj.hasOwnProperty(prop)) {
                    merged_obj[prop] = obj[prop];
                }
            }
        }

        return merged_obj;
    },

    jsdump: function(data) {
        if (typeof data == "object") data = data.toSource();
        Components.classes['@mozilla.org/consoleservice;1']
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(data);
    },
};

Util.BugTreeView = function(bugs) {
    this.bugs = bugs || [];
    this.treebox = null;
    this.selection = null;
};

Util.BugTreeView.prototype = {
    get rowCount() {
        return this.bugs.length;
    },
    getCellText: function(row, col) {
        return this.getCellValue(row, col);
    },
    getCellValue: function(row, col) {
        switch (col.index) {
        case 0: return this.bugs[row].id;
        case 1: return this.bugs[row].summary;
        default: return undefined;
        }
    },
    setTree: function(treebox) {
        this.treebox = treebox;
    },
    isContainer: function(index) { return false; },
    isSeparator: function(row){ return false; },
    isSorted: function(){ return false; },
    getLevel: function(row){ return 0; },
    getImageSrc: function(row,col){ return null; },
    getRowProperties: function(row,props){},
    getCellProperties: function(row,col,props){},
    getColumnProperties: function(colid,col,props){}
};