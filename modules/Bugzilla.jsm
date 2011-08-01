var EXPORTED_SYMBOLS = ['Bugzilla'];

const Cu = Components.utils;
Cu.import('resource://modules/xmlrpc.jsm');
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
            options: Util.merge(this.defaultOptions, options)
        };

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

        return XMLRPC.send(this.currentConn.url, method, [params]);;
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
        }
    }
};

function User(attrs) {
    this.attrs = attrs || {};
    this.displayName = attrs.realName || attrs.name;

    var email = attrs.email || attrs.name;
    this.gravatar = 'http://www.gravatar.com/avatar/' + Util.md5(email)
            + '?s=48';
}
Bugzilla.User = User;

User.getFromEmail = function(email) {
    var resp = Bugzilla.request('User.get', {names: [email]});
    if (resp.users.length > 0) {
        return new User(resp.users[0]);
    }

    return false;
};