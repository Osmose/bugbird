var EXPORTED_SYMBOLS = ['Bugzilla']

const Cu = Components.utils;
Cu.import('resource://modules/Mimic.jsm');
Cu.import('resource://modules/Util.jsm');

let Bugzilla = {
    connections: {},
    currentConn: null,
    connect: function(name, url, options) {
        this.createConnection(name, url, options);
        this.switchConnection(name);
    },
    createConnection: function(name, url, options) {
        if (url.substr(-1) !== '/') url += '/';
        let connection = {
            url: url + 'xmlrpc.cgi',
            options: Util.merge(this.defaultOptions, options),
        }

        this.connections[name] = connection;
    },
    switchConnection: function(name) {
        if (this.connections.hasOwnProperty(name)) {
            this.currentConn = this.connections[name];
        }
    },
    request: function(method, params) {
        if (!this.currentConn) {
            throw new Error("No connection specified.");
        }

        let request = new XmlRpcRequest(this.currentConn.url, method);
        request.addParam(params);
        let response = request.send();

        return response.parseXML();
    },

    bug: {
        search: function(params) {
            return Bugzilla.request('Bug.search', params)['bugs'];
        },
        comments: function(params) {
            let wants_bugs = params.hasOwnProperty('ids'),
            wants_comments = params.hasOwnProperty('comment_ids');

            // Must specify ids or comment_ids
            if (!wants_bugs && !wants_comments) {
                throw new Error('Bug.comments requires either ids or ' +
                                'comment_ids be specified');
            }

            return Bugzilla.request('Bug.comments', params);
        },
    },
};