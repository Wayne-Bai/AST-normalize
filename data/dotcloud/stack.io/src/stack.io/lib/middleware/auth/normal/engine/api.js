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

module.exports = function(dbName) {
    var crypto = require('crypto'),
        _ = require('underscore');
    var db = require('sqlite-wrapper')(dbName);

    function hash(str) {
        var h = crypto.createHash('sha256');
        h.update(str);
        return h.digest('hex');
    }

    function repeat(seq, sep, n) {
        var res = '';
        while (n > 1) {
            if (n % 2 == 1) {
                res += sep + seq;
                n--;
            }
            seq += sep + seq;
            n /= 2;
        }
        return seq + res;
    }

    function proxy(fn) {
        return function(err, result) {
            fn(err, result, false);
        };
    }

    return {
        _getGroupId: function(name, cb) {
            db.selectOne('groups', null, ['id'], 'name=?', [name], cb);
        },
        _getUserId: function(name, cb) {
            db.selectOne('users', null, ['id'], 'username=?', [name], cb);
        },
        checkAuth: function(user, password, cb) {
            db.selectOne('users', null, ['id'], 
                'username=? AND password_hash=?', [user, hash(password)], function(err, result) {
                    if (err) {
                        cb(err, null, false);
                    } else {
                        cb(err, !!result, false);
                    }
                });
        },
        login: function(user, password, cb) {
            var self = this;
            this.checkAuth(user, password, function(err, result) {
                if (err) {
                    cb(err);
                } else if (!result) {
                    cb('Unknown user or invalid credentials');
                } else {
                    self.getUserPermissions(user, cb);
                }
            });
        },
        hasGroup: function(name, cb) {
            this._getGroupId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                }
                cb(null, !!result, false);
            });
        },
        addGroup: function(name, cb) {
            db.insert('groups', { name: name }, proxy(cb));
        },
        removeGroup: function(name, cb) {
            this._getGroupId(name, function(err, result) {
                if (err) {
                    cb(err, null, false);
                } else if (!result) {
                    cb(null, false, false);
                } else {
                    db.removeById('groups', result.id, function(err) {
                        cb(err, !err, false);
                    });
                }
            });
        },
        getAllGroups: function(cb) {
            db.list('groups', proxy(cb));
        },
        getGroupPermissions: function(name, cb) {
            this._getGroupId(name, function(err, result) {
                if (err) {
                    cb(err, null, false);
                } else if (!result) {
                    cb(null, null, false);
                } else {
                    db.select('permissions', null, ['service', 'method'], 
                        'group_id=?', [result.id], proxy(cb));
                }
            });
        },
        addGroupPermissions: function(name, permissions, cb) {
            this._getGroupId(name, function(err, result) {
                if (err || !result) {
                    cb(err, null, false);
                } else {
                    // Validate regexes
                    var valid = true;
                    permissions.forEach(function(item) {
                        try {
                            new RegExp(item.service);
                        } catch (e) {
                            valid = false;
                            return cb(e, null, false);
                        }

                        try {
                            new RegExp(item.method);
                        } catch (e) {
                            valid = false;
                            return cb(e, null, false);
                        }
                    });
                    if (!valid) {
                        return;
                    }
                    var errors = [];
                    permissions.forEach(function(item) {
                        item.group_id = result.id;
                    });
                    db.insertAll('permissions', permissions, function(err) {
                        cb(err, !err, false);
                    });
                }
            });
        },
        removeGroupPermissions: function(name, permissions, cb) {
            function couples(n) {
                return repeat('(service=? AND method=?)', ' OR ', n);
            }
            var clause = 'group_id=? AND (' + 
                couples(permissions.length) + ')';

            this._getGroupId(name, function(err, result) {
                if (err) {
                    cb(err, null, false);
                } else if (!result) {
                    cb(null, false, false);
                } else {
                    db.remove('permissions', clause, permissions.reduce(function(prev, item) {
                        prev.push(item.service, item.method);
                        return prev;
                    }, [result.id]), function(err) {
                        return cb(err, !err, false);
                    });
                }
            });
        },

        clearGroupPermissions: function(name, cb) {
            this._getGroupId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, false, false);
                }
                db.remove('permissions', 'group_id=?', [result.id], function(err) {
                    cb(err, !err, false);
                });
            });
        },
        hasUser: function(name, cb) {
            this._getUserId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                }
                cb(null, !!result, false);
            });
        },
        addUser: function(user, password, cb) {
            db.insert('users', {
                username: user,
                password_hash: hash(password)
            }, proxy(cb));
        },
        removeUser: function(name, cb) {
            this._getUserId(name, function(err, result) {
                if (err) {
                    cb(err, null, false);
                } else if (!result) {
                    cb(null, false, false);
                } else {
                    db.removeById('users', result.id, function(err) {
                        cb(err, !err, false);
                    });
                }
            });
        },
        getUserPermissions: function(name, cb) {
            db.select('permissions', {
                'groups': 'permissions.group_id=groups.id',
                'user_groups': 'groups.id=user_groups.group_id',
                'users': 'user_groups.user_id=users.id'
            }, {
                'permissions.service': 'service',
                'permissions.method': 'method'
            }, 'users.username=?', [name], proxy(cb), null, null, true);
        },
        getUserGroups: function(name, cb) {
            this._getUserId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, null, false);
                }
                db.select('groups, user_groups', null, { 
                    'groups.name': 'name' 
                }, 'groups.id=user_groups.group_id AND user_groups.user_id=?',
                    [result.id], proxy(cb), null, null, true);
            });
        },
        clearUserGroups: function(name, cb) {
            this._getUserId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, false, false);
                }
                db.remove('user_groups', 'user_id=?', [result.id], proxy(cb));
            });
        },
        addUserGroups: function(name, groups, cb) {
            this._getUserId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, false, false);
                }
                var userId = result.id;

                db.select('groups', null, ['id'], 'name IN (' + 
                    repeat('?', ',', groups.length) + ')', groups,
                    function(err, rows) {
                        if (err) {
                            return cb(err, null, false);
                        }
                        var links = rows.reduce(function(prev, item) {
                            prev.push({
                                group_id: item.id,
                                user_id: userId
                            });
                            return prev;
                        }, []);
                        db.insertAll('user_groups', links, function(err) {
                            cb(err, !err, false);
                        });
                    }
                );
            });
        },
        removeUserGroups: function(name, groups, cb) {
            this._getUserId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, false, false);
                }
                db.remove('user_groups', 'group_id IN (SELECT id FROM groups WHERE name IN (' + 
                    repeat('?', ',', groups.length) + '))', groups, function(err) {
                        return cb(err, !err, false);
                    }
                );
            });
        },
        getGroupMembers: function(name, cb) {
            this._getGroupId(name, function(err, result) {
                if (err || !result) {
                    return cb(err, null, false);
                }

                db.select('groups g, user_groups ug, users u', null, 
                    { 'u.username': 'username' }, 
                    'ug.user_id=u.id AND g.id=ug.group_id AND g.id=?', [result.id], proxy(cb), null, null, true);
            });
        },
        clearGroupMembers: function(name, cb) {
            this._getGroupId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, false, false);
                }
                db.remove('user_groups', 'group_id=?', [result.id], proxy(cb));
            });
        },
        addGroupMembers: function(name, users, cb) {
            var callback = _.after(proxy(cb), users.length);
            this._getGroupId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, false, false);
                }
                var gid = result.id,
                    errors = [];
                db.select('users', null, ['id'], 'username IN (' + 
                    repeat('?', ',', users.length) + ')', users, function(err, ids) {
                        if (err) {
                            return cb(err, null, false);
                        }
                        var links = ids.reduce(function(prev, item) {
                            prev.push({
                                group_id: gid,
                                user_id: item.id
                            });
                            return prev;
                        }, []);
                        db.insertAll('user_groups', links, function(err) {
                            cb(err, !err, false);
                        });
                });
            });
        },
        removeGroupMembers: function(name, users, cb) {
            this._getGroupId(name, function(err, result) {
                if (err) {
                    return cb(err, null, false);
                } else if (!result) {
                    return cb(null, false, false);
                }
                db.remove('user_groups', 'user_id IN (SELECT id FROM users WHERE username IN (' + 
                    repeat('?', ',', users.length) + '))', users, function(err) {
                        return cb(err, !err, false);
                    }
                );
            });
        }
    };
};
