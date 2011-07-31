let EXPORTED_SYMBOLS = ['XMLRPC'];

const Cu = Components.utils;
Cu.import('resource://modules/Util.jsm');

// TODO: Handle base64

var XMLRPC = {};
(function() {
function Request(methodName, params) {
    this.methodName = methodName;
    if (Array.isArray(params)) {
        this.params = params;
    } else {
        this.params = [];
    }
}
XMLRPC.Request = Request;

Request.prototype = {
    addParam: function(param) {
        this.params.push(param);
    },
    send: function(uri) {
        var self = this,
            s = '<?xml version="1.0"?><methodCall><methodName>'
                + this.methodName + '</methodName>';
        if (this.params.length > 0) {
            s += '<params>';
            this.params.forEach(function(e) {
                s += '<param>' + self.marshal(e) + '</param>';
            });
            s += '</params>';
        }
        s += '</methodCall>';

        var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                .createInstance(Components.interfaces.nsIXMLHttpRequest);
        req.open('POST', uri, false);
        req.setRequestHeader('Content-Type', 'text/xml');
        req.send(s);

        if (req.status == 200) {
            return new Response(req.responseXML);
        } else {
            throw new Error('Error connecting to server: HTTP ' + req.status);
        }
    },
    marshal: function(val) {
        var t = typeof val;
        switch (t) {
        case 'number':
            if (val % 1 == 0) {
                return this.mInt(val);
            } else {
                return this.mDouble(val);
            }
        case 'boolean':
            return this.mBoolean(val);
        case 'object':
            if (Array.isArray(val)) {
                return this.mArray(val);
            } else {
                return this.mObject(val);
            }
        default:
            return this.mString(val);
        }
    },
    mInt: function(val) {
        return '<int>' + val + '</int>';
    },
    mBoolean: function(val) {
        return '<boolean>' + (val ? 1 : 0) + '</boolean>';
    },
    mString: function(val) {
        return '<string>' + val + '</string>';
    },
    mDouble: function(val) {
        return '<double>' + val + '</double>';
    },
    mDate: function(val) {
        return '<dateTime.iso8601>' + ISODateString(val)
            + '</dateTime.iso8601>';
    },
    mObject: function(val) {
        let s = '<struct>';
        for (let p in val) {
            if (val.hasOwnProperty(p)) {
                s += '<member><name>' + p + '</name><value>'
                    + this.marshal(val[p]) + '</value></member>';
            }
        }
        s += '</struct>';

        return s;
    },
    mArray: function(val) {
        let s = '<array><data>',
            self = this;
        val.forEach(function(e) {
            s += '<value>' + self.marshal(e) + '</value>';
        });
        s += '</data></array>';

        return s;
    }
};

function Response(xml) {
    var methodResponse = xml.documentElement;
    if (methodResponse.querySelectorAll('fault').length > 0) {
        this.fault = true;
        this.parseFault(methodResponse);
    } else {
        this.fault = false;
        this.parseResponse(methodResponse);
    }
}
XMLRPC.Response = Response;

Response.prototype = {
    parseFault: function(r) {
        var value = r.querySelector('fault > value > struct');
        var struct = this.umStruct(value);
        this.faultCode = struct.faultCode;
        this.faultString = struct.faultString;
    },
    parseResponse: function(r) {
        var valNode = r.querySelector('params > param > value');
        this.value = this.unmarshal(valNode.firstElementChild);
    },
    unmarshal: function(node) {
        switch (node.tagName) {
        case 'i4':
        case 'int':
            return this.umInt(node);
        case 'boolean':
            return this.umBoolean(node);
        case 'double':
            return this.umDouble(node);
        case 'dateTime.iso8601':
            return this.umDate(node);
        case 'struct':
            return this.umStruct(node);
        case 'array':
            return this.umArray(node);
        default:
            return this.umString(node);
        }
    },
    umInt: function(node) {
        return parseInt(node.textContent, 10);
    },
    umBoolean: function(node) {
        return this.umInt(node) === 1 ? true : false;
    },
    umString: function(node) {
        return node.textContent;
    },
    umDouble: function(node) {
        return parseFloat(node.textContent);
    },
    umDate: function(node) {
        return Date.parse(node.textContent);
    },
    umStruct: function(node) {
        var obj = {};
        for (var k = 0; k < node.children.length; k++) {
            var member = node.children[k],
                name = member.querySelector('name'),
                value = member.querySelector('value');
            obj[name.textContent] = this.unmarshal(value.firstElementChild);
        }

        return obj;
    },
    umArray: function(node) {
        var arr = [],
            data = node.querySelector('data');
        for (var k = 0; k < data.children.length; k++) {
            arr.push(this.unmarshal(data.children[k].firstElementChild));
        }

        return arr;
    }
};

XMLRPC.send = function(uri, methodName, params) {
    var req = new Request(methodName, params);
    var resp = req.send(uri);

    if (resp.fault) {
        throw new Error('XMLRPC Fault: ' + resp.faultCode + ': '
                        + resp.faultString);
    } else {
        return resp.value;
    }
};

function ISODateString(d) {
    function pad(n){
        return n < 10 ? '0'+n : n;
    }
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z';
}
})();
