// Open Source Initiative OSI - The MIT License (MIT):Licensing
//
// The MIT License (MIT)
// Copyright (c) 2012 DotCloud Inc (opensource@dotcloud.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

module.exports = function(auth, config) {
    function addPerms(name) {
        var perms = config.groups[name];
        for (var svc in perms) {
            var insertables = perms[svc].reduce(function(prev, item) {
                prev.push({
                    service: svc,
                    method: item
                });
                return prev;
            }, []);
            auth.addGroupPermissions(name, insertables, function(err) {
                if (err) throw err;
            });
        }
    }

    function addGroup(name) {
        auth.hasGroup(name, function(err, has) {
            if (err)
                throw err;
            if (has) {
                auth.clearGroupPermissions(name, function(err) {
                    if (err) throw err;
                    addPerms(name);
                });
            } else {
                auth.addGroup(name, function(err) { 
                    if (err) throw err;
                    addPerms(name);
                });
            }
        });
    }

    function addUser(username) {
        var data = config.users[username];
        auth.hasUser(username, function(err, has) {
            if (err) throw err;
            if (has) {
                auth.checkAuth(username, data.password, function(err, ok) {
                    if (err) throw err;
                    if (!ok) {
                        throw 'Could not authenticate user ' + username;
                    }
                    auth.clearUserGroups(username, function(err) {
                        if (err) throw err;
                        auth.addUserGroups(username, data.groups, 
                            function(err) { if (err) throw err; });
                    });
                });
            } else {
                auth.addUser(username, data.password, function(err) {
                    if (err) throw err;
                    auth.addUserGroups(username, data.groups, function(err) {
                        if (err) throw err;
                    });
                });
            }
        });
    }

    for (var name in config.groups) {
        addGroup(name);
    }

    for (var username in config.users) {
        addUser(username);
    }
};