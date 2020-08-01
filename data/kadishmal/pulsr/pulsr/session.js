/*
 session.js
 A module to manage client session
 */
define(['crypto', 'cookies'], function(crypto, cookies) {
    var sessions = {},
        settings = {
            name: 'PULSRSESSID',
            algorithm: 'sha1'
        };

    function getIP(request){
        var ip;

        if (!(ip = request.headers['x-forwarded-for'])) {
            ip = request.connection.remoteAddress;
        }

        return ip;
    }

    function store(key, val) {
        if (this.cookies) {
            var sessionID = this.cookies.get(settings.name);

            if (sessionID) {
                sessions[sessionID][key] = val;
            }
            else{
                console.log('WARNING: SessionID could not be retrieved. Possibly the client does not accept cookies.');
            }
        }
        else{
            console.log('WARNING: Cannot store a session data. Session has not be explicitly started.');
        }
    }

    function retrieve(key) {
        var val;

        if (this.cookies) {
            var sessionID = this.cookies.get(settings.name);

            if (sessionID) {
                if (sessions[sessionID]) {
                    // make sure the same user is accessing this session data
                    if (sessions[sessionID]['IP'] == getIP(this)) {
                        val = sessions[sessionID][key];
                    }
                    else{
                        console.log('WARNING: Cannot retrieve a session data. Access denied due to difference in user IP and session IP.');
                    }
                }
            }
            else{
                console.log('WARNING: SessionID could not be retrieved. Possibly the client does not accept cookies.');
            }
        }
        else{
            console.log('WARNING: Cannot retrieve a session data. Session has not be explicitly started.');
        }

        return val;
    }


    function destroyUserData() {
        if (this.cookies) {
            var sessionID = this.cookies.get(settings.name);

            if (sessionID) {
                this.cookies.set(settings.name, '; expires=Thu, 01 Jan 1970 00:00:01 GMT;');
                delete sessions[sessionID];
            }
            else{
                console.log('WARNING: SessionID could not be retrieved. Possibly the client does not accept cookies.');
            }
        }
        else{
            console.log('WARNING: Cannot delete a session data. Session has not be explicitly started.');
        }
    }

    return {
        // generate a session id
        start: function (request, response) {
            if (!request) {
                console.log('WARNING: "request" object is not passed to session.start().');
            }
            else{
                var sessionID;

                cookies.init(request, response);

                sessionID = request.cookies.get(settings.name);

                if (!sessionID || sessions[sessionID] === undefined) {
                    var ip = getIP(request),
                        hash = crypto.createHash(settings.algorithm),
                        now = new Date().getTime();

                    hash.update(ip + now);
                    sessionID = hash.digest('base64');

                    request.cookies.set(settings.name, sessionID);

                    sessions[sessionID] = {
                        IP: ip
                    };
                }

                request.session = {
                    store: function(key, val) {
                        store.call(request, key, val);
                    },
                    retrieve: function(key) {
                        return retrieve.call(request, key);
                    },
                    destroyUserData: function(key) {
                        destroyUserData.call(request, key);
                    }
                };
            }
        }
    };
});