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

    md5: function(str) {
        var converter =
          Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
            createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";

        // result is an out parameter,
        // result.value will contain the array length
        var result = {};

        // data is an array of bytes
        var data = converter.convertToByteArray(str, result);

        var ch = Components.classes["@mozilla.org/security/hash;1"]
                .createInstance(Components.interfaces.nsICryptoHash);
        ch.init(ch.MD5);
        ch.update(data, data.length);
        var hash = ch.finish(false);

        // return the two-digit hexadecimal code for a byte
        function toHexString(charCode) {
            return ("0" + charCode.toString(16)).slice(-2);
        }

        // convert the binary hash data to a hex string.
        return [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
    },
    xmlhttp: function() {
        return Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
            .createInstance(Components.interfaces.nsIXMLHttpRequest);
    },
    loadFromUrl: function(url) {
        var req = this.xmlhttp();
        req.open('GET', url, false);
        req.send();
        return req.responseText;
    },
    getGravatarProfile: function(email) {
        var req = this.xmlhttp();
        req.open('GET', 'http://www.gravatar.com/' + this.md5(email) + '.json',
                 false);
        Util.jsdump('http://www.gravatar.com/' + this.md5(email) + '.json');
        req.send();
        if (req.status == 200) {
            var resp = JSON.parse(req.responseText);
            var profile = resp.entry[0];

            // Extra sugar to make life easier
            profile.primaryEmail = profile.emails.filter(function(e) {
                return e.primary;
            });

            return profile;
        } else if (req.status == 404) {
            // User not found, let's mock with bugzilla
        } else {
            throw new Error('Error connecting to server: HTTP ' + req.status);
        }
    }
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