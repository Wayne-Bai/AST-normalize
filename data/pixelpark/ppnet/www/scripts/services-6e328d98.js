'use strict';

angular.module('ppnetApp')
  .factory('ppnetConfig', function($http, $q, ppSyncService) {
    var config, configuration;

    localStorage.removeItem('ppnetConfig');

    function loadConfigFromLocalStorage() {
      configuration = JSON.parse(localStorage.getItem('ppnetConfig'));
      return configuration;
    }

    function saveConfigtoLocalStorage(config) {
      localStorage.setItem('ppnetConfig', JSON.stringify(config));
    }

    function init(config) {
      /* SET CONFIG TO POUCHDB BEFORE INIT() */
      ppSyncService.setDB(config).then(function() {
        ppSyncService.init();
      });
    }

    return {
      init: function(config) {
        var deferred = $q.defer();
        if (!config) {
          init(loadConfigFromLocalStorage());
          deferred.resolve(config);
          deferred.reject(config);
          deferred.notify(config);
        } else {
          saveConfigtoLocalStorage(config);
          init(config);
          deferred.resolve(config);
          deferred.reject(config);
          deferred.notify(config);
        }
        return deferred.promise;
      },
      existingConfig: function() {
        config = loadConfigFromLocalStorage();
        return (config) ? true : false;
      },
      loadConfig: function() {
        return loadConfigFromLocalStorage();
      },
      loadConfigFromExternal: function() {
        var deferred = $q.defer();
        $http.get('config.json').then(function(res) {
          deferred.resolve(res);
          deferred.reject(res);
          deferred.notify(res);
        });
        return deferred.promise;
      },
      saveConfig: function(config) {
        saveConfigtoLocalStorage(config);
      },

      getLoginData: function() {
        return config.login;
      },
      getMapviewMapID: function() {
        return config.mapview.mapid;
      },
      getMapviewAccessToken: function() {
        return config.mapview.accesstoken;
      },
      getMapviewDefaultLatitude: function() {
        return config.mapview.defaultLatitude;
      },
      getMapviewDefaultLongitude: function() {
        return config.mapview.defaultLongitude;
      },
      getMapviewDefaultZoom: function() {
        return config.mapview.defaultZoom;
      }
    };
  });
'use strict';

angular.module('ppSync', ['ng']).provider('ppSyncService', function ppSyncServiceProvider() {
    this.$get = function ($q, $window) {
        /* global emit */
        var srv = {};
        srv.dbs;
        
        // objects that contain a cancel-method if any replication is done
        srv.syncingCache;
        srv.liveSync;
        srv.remoteSync;
        srv.fetchChanges;
        
        
        srv.currentDB = 0;
        srv.network = 'online';

        /**
         * does some initial syncing, sets the current-DB and starts replication
         * @returns {undefined}
         */
        srv.init = function () {
            srv.syncAllCaches();
            srv.currentDB = 0;
            srv.startReplicate();
            srv.monitorNetwork();
        };

        /**
         * initialized the databases with the given config
         * @param {type} config
         */
        srv.setDBs = function (config) {
            srv.dbs = config.database;
            for (var i = 0; i < srv.dbs.length; i++) {
                srv.dbs[i].remote += srv.dbs[i].name;
                srv.dbs[i].db = new PouchDB(srv.dbs[i].name, {
                    auto_compaction: true,
                    cache: false
                });
                srv.createDesignDocs(srv.dbs[i].db);
            }
        };

        /**
         * syncs the cache of the active database (channel)
         */
        srv.syncCache = function () {
            var tempIds = srv.cache.getDocs(srv.dbs[srv.currentDB].name);
            if (tempIds.length > 0) {
                var current = tempIds[tempIds.length - 1];
                srv.syncingCache = srv.dbs[srv.currentDB].db.replicate.to(srv.dbs[srv.currentDB].remote, {
                    doc_ids: [current]
                }).on('complete', function (res) {
                    if (res.ok) {
                        srv.cache.removeDoc(current, srv.dbs[srv.currentDB].name);
                        srv.syncCache();
                    }
                });
            }
        };
        
        /**
         * synchronise the caches of all databases (channels)
         */
        srv.syncAllCaches = function () {
            for (var i = 0; i < srv.dbs.length; i++) {
                var tmpIds = srv.cache.getDocs(srv.dbs[i].name);
                srv.cache.removeDbsDocs(srv.dbs[i].name);
                if (tmpIds.length > 0) {
                    srv.dbs[i].db.replicate.to(srv.dbs[i].remote, {
                        doc_ids: tmpIds
                    });
                }
            }
        };

        /**
         * start replicating databases
         * start with replicating the last day and
         * then a live-sync
         */
        srv.startReplicate = function () {
            var syncFilter = function (doc) {
                var timeBarrier = Date.now() - (86400 * 1000);
                return doc.created > timeBarrier ? true : false;
            };

            srv.remoteSync = srv.dbs[srv.currentDB].db.replicate.from(srv.dbs[srv.currentDB].remote, {
                live: false,
                filter: syncFilter,
                batch_size: 1000
            }).on('complete', function () {
                srv.liveSync = srv.dbs[srv.currentDB].db.replicate.from(srv.dbs[srv.currentDB].remote, {
                    live: true
                });
            });
        };

        /**
         * stops all syncs and replications that may be running
         * @returns {undefined}
         */
        srv.stopReplicate = function () {
            if (!!srv.syncingCache && srv.syncingCache.hasOwnProperty('cancel')) {
                srv.syncingCache.cancel();
            };
            if (!!srv.fetchChanges)
                srv.fetchChanges.cancel();
            if (!!srv.remoteSync)
                srv.remoteSync.cancel();
            if (!!srv.liveSync)
                srv.liveSync.cancel();
        };
        
        /**
         * set a channel by switching the db and return if the channel has realdy changed
         * @param {type} dbname
         * @returns {Boolean}
         */
        srv.setChannel = function (dbname) {
            var oldDB = srv.currentDB;

            for (var i = 0; i < srv.dbs.length; i++) {
                if (srv.dbs[i].displayName === dbname) {
                    srv.currentDB = i;
                    break;
                }
            }

            if (oldDB !== srv.currentDB) {
                srv.stopReplicate();
                srv.syncCache();
                srv.startReplicate();
                return true;
            } else {
                return false;
            }
        };


        /**
         * add eventlisteners to online/offline events
         */
        srv.monitorNetwork = function () {
            var onOfflineHandler = function () {
                srv.network = 'offline';
                console.log(srv.network);
            };

            var onOnlineHandler = function () {
                srv.network = 'online';
                console.log(srv.network);
                // Starts the syncCaches function to push changes made while offline.
                //srv.syncCache();
                srv.syncAllCaches();
                srv.startReplicate();
            };

            if ('connection' in navigator) {
                $window.addEventListener('offline', onOfflineHandler, false);
                $window.addEventListener('online', onOnlineHandler, false);
            } else if ('onLine' in navigator) {
                $window.addEventListener('offline', onOfflineHandler);
                $window.addEventListener('online', onOnlineHandler);
            }
            ;
        };

        /**
         * Create map/reduce design documents for the given database
         * @param {type} db
         * @returns {undefined}
         */
        srv.createDesignDocs = function (db) {

            // Posts Only
            var postsOnly = {
                _id: '_design/posts_only',
                views: {
                    'posts_only': {
                        map: function (doc) {
                            if (doc.type === 'POST' || doc.type === 'IMAGE') {
                                emit([doc.created, doc._id, doc.user.id], doc.created);
                            }
                        }.toString()
                    }
                }
            };
            db.put(postsOnly).then(function () {
                return db.query('posts_only', {
                    stale: 'update_after'
                });
            });

            // User Posts Only
            var useronly = {
                _id: '_design/user_posts',
                views: {
                    'user_posts': {
                        map: function (doc) {
                            if (doc.type === 'POST' || doc.type === 'IMAGE') {
                                emit([doc.user.id, doc.created, doc._id], doc.created);
                            }
                        }.toString()
                    }
                }
            };
            db.put(useronly).then(function () {
                return db.query('user_posts', {
                    stale: 'update_after'
                });
            });

            // Related docs only
            var relatedDocs = {
                _id: '_design/related_docs',
                views: {
                    'related_docs': {
                        map: function (doc) {
                            if (doc.type === 'COMMENT') {
                                emit(doc.posting, doc.created);
                            } else if (doc.type === 'LIKE') {
                                emit(doc.posting, doc.created);
                            }
                        }.toString()
                    }
                }
            };
            db.put(relatedDocs).then(function () {
                return db.query('related_docs', {
                    stale: 'update_after'
                });
            });

            // Docs with Tags
            var tags = {
                _id: '_design/tags',
                views: {
                    'tags': {
                        map: function (doc) {
                            if (typeof doc.tags !== 'undefined' && doc.tags !== null && doc.tags.length > 0) {
                                for (var i = 0; i < doc.tags.length; i++) {
                                    emit(doc.tags[i], doc.created);
                                }
                            }
                        }.toString()
                    }
                }
            };
            db.put(tags).then(function () {
                return db.query('tags', {
                    stale: 'update_after'
                });
            });
        };

        /**
         * The Cache is used to store newly created document_ids while beeing offline.
         */
        function Cache() {
            this.docs = {dummy: 'dummy'}; // ...to tell javascript that this is really an object and not and array
        }

        Cache.prototype.addDoc = function (docId, dbname) {
            if (JSON.parse(localStorage.getItem('cache')) !== null) {
                this.docs = JSON.parse(localStorage.getItem('cache'));
            }
            if (!this.docs.hasOwnProperty(dbname)) {
                this.docs[dbname] = [];
            }
            this.docs[dbname].push(docId.id);
            localStorage.setItem('cache', JSON.stringify(this.docs));
        };


        Cache.prototype.getDocs = function (dbname) {
            var tmpDocs = JSON.parse(localStorage.getItem('cache'));
            if (tmpDocs !== null)
                this.docs = tmpDocs;
            if (this.docs.hasOwnProperty(dbname)) {
                return this.docs[dbname];
            }
            else
                return false;
        };

        Cache.prototype.removeDoc = function (docId, dbname) {
            if (JSON.parse(localStorage.getItem('cache')) !== null) {
                this.docs = JSON.parse(localStorage.getItem('cache'));
            }
            for (var i = this.docs[dbname].length - 1; i >= 0; i--) {
                if (this.docs[dbname][i] === docId) {
                    this.docs[dbname].splice(i, 1);
                    localStorage.setItem('cache', JSON.stringify(this.docs));
                    return true;
                }
            }
        };
        
        Cache.prototype.removeDbsDocs = function (dbname) {
            if (JSON.parse(localStorage.getItem('cache')) !== null) {
                this.docs = JSON.parse(localStorage.getItem('cache'));
            }
            
            this.docs[dbname] = [];
            localStorage.setItem('cache', JSON.stringify(this.docs));
            return true;
        };
        

        Cache.prototype.reset = function () {
            this.docs = {dummy: 'dummy'};
            localStorage.setItem('cache', JSON.stringify(this.docs));
        };

        srv.cache = new Cache();

        return {
            init: function () {
                srv.init();
            },
            setDB: function (config) {
                var deferred = $q.defer();
                srv.setDBs(config);

                deferred.resolve('ok');
                deferred.reject('ok');
                deferred.notify('ok');

                return deferred.promise;
            },
            getInfo: function () {
                var deferred = $q.defer();

                srv.dbs[srv.currentDB].db.info(function (err, info) {
                    deferred.resolve(info);
                    deferred.reject(err);
                    deferred.notify(info);
                });


                return deferred.promise;
            },
            /**
             * Implements the changes method from pouchdb to notify about each new document added
             * to the local database.
             * @return {promise}
             */
            fetchChanges: function () {
                var deferred = $q.defer();
                srv.dbs[srv.currentDB].db.info(function (err, info) {
                    srv.fetchChanges = srv.dbs[srv.currentDB].db.changes({
                        live: true,
                        since: info.update_seq,
                        include_docs: true,
                        attachments: true
                    })
                            .on('error', function (err) {
                                deferred.reject(err);
                            })
                            .on('complete', function (resp) {
                                deferred.resolve(resp);
                            })
                            .on('change', function (change) {
                                deferred.notify(change);
                            });
                });

                return deferred.promise;
            },
            /**
             * Implements the post method from pouchdb to store a new document in the database.
             * When the device is online, the document gets immediately synced to the server,
             * otherwise it is stored in the cache.
             * @param  {object} obj
             * @return {promise}
             */
            postDocument: function (obj) {
                var deferred = $q.defer();
                srv.dbs[srv.currentDB].db.post(obj).then(function (response) {
                    srv.cache.addDoc(response, srv.dbs[srv.currentDB].name);
                    if (srv.network === 'online') {

                        //cache hier leeren
                        srv.syncCache();
                    }
                    deferred.resolve(response);
                }).
                        catch (function (error) {
                            deferred.reject(error);
                        });

                return deferred.promise;
            },
            /**
             * Implements the putAttachment Method from PouchDB
             * @return {promise}
             */
            putAttachment: function (docId, attachmentId, rev, doc, type) {
                var deferred = $q.defer();

                srv.dbs[srv.currentDB].db.putAttachment(docId, attachmentId, rev, doc, type, function (err, response) {
                    srv.cache.addDoc(response, srv.dbs[srv.currentDB].name);
                    // hier cache leeren
                    //cache hier leeren
                    srv.syncCache();
                    deferred.resolve(response);
                });

                return deferred.promise;
            },
            getAttachment: function (docId, attachmentId) {
                var deferred = $q.defer();

                srv.dbs[srv.currentDB].db.getAttachment(docId, attachmentId, function (err, response) {
                    deferred.resolve(response);
                });

                return deferred.promise;
            },
            /**
             * Implements the delete function from pouchdb and accepts two parameters. The first one contains
             * the doc which should be deleted and the second one defines whether the change should be pushed
             * to the server or stored in the puffer.
             * @param  {object} doc
             * @param  {boolean} push
             * @return {promise}
             */
            deleteDocument: function (doc, push) {
                var deferred = $q.defer();

                push = typeof push !== 'undefined' ? push : true;

                srv.dbs[srv.currentDB].db.remove(doc, {}, function (err, response) {

                    srv.cache.addDoc(response, srv.dbs[srv.currentDB].name);


                    if (srv.network === 'online') {
                        srv.syncCache();
                    }
                    deferred.resolve(response);
                });

                return deferred.promise;
            },
            /**
             * This function returns a single document by passing the docId
             * @param  {string} docId
             * @return {promise}
             */
            getDocument: function (docId) {
                var deferred = $q.defer();

                srv.dbs[srv.currentDB].db.get(docId).then(function (doc) {
                    deferred.resolve(doc);
                });

                return deferred.promise;
            },
            getRelatedDocuments: function (docId) {
                var deferred = $q.defer();

                var queryOptions = {
                    descending: true,
                    include_docs: true,
                    key: docId
                };

                srv.dbs[srv.currentDB].db.query('related_docs', queryOptions).then(function (response) {
                    deferred.resolve(response.rows);
                });

                return deferred.promise;
            },
            getUserPosts: function (userId) {
                var deferred = $q.defer();

                // Set the query options
                var queryOptions = {
                    descending: true,
                    include_docs: true,
                    startkey: [userId, {}, {}],
                    endkey: [userId]
                };

                srv.dbs[srv.currentDB].db.query('user_posts', queryOptions).then(function (response) {
                    deferred.resolve(response.rows);
                });

                return deferred.promise;
            },
            /**
             * The getDocuments function is used to query a large amount of documents stored in the local
             * database. Additionally, the function "joins" together related data.
             * An array as parameter is used to define the types and "join order" of the queried documents.
             * An example array would look like ['
             POST ', '
             COMMENT ', '
             LIKE ']. The function then queries the
             * database for this type.
             *
             * More on CouchDB Joins http://www.cmlenz.net/archives/2007/10/couchdb-joins
             *
             * @param  {string} documentType
             * @return {promise}
             */
            getPosts: function (limit, startkey) {
                var deferred = $q.defer();

                // Set the query options
                var queryOptions = {
                    descending: true,
                    include_docs: true
                };

                if (!angular.isUndefined(startkey)) {
                    queryOptions.startkey = startkey;
                }

                if (!angular.isUndefined(limit)) {
                    queryOptions.limit = limit;
                }

                srv.dbs[srv.currentDB].db.query('posts_only', queryOptions).then(function (response) {
                    deferred.resolve(response.rows);
                });
                return deferred.promise;
            },
            getPostsWithTag: function (tag) {
                var deferred = $q.defer();

                // Set the query options
                var queryOptions = {
                    descending: true,
                    include_docs: true
                };

                if (!angular.isUndefined(tag)) {
                    queryOptions.key = tag;
                }

                srv.dbs[srv.currentDB].db.query('tags', queryOptions).then(function (response) {
                    deferred.resolve(response.rows);
                });

                return deferred.promise;
            },
            /**
             * The syncCache function is a way to start syncing the documents stored in the cache to the
             * remote server.
             */
            syncCache: function () {
                syncCache();
            },
            /**
             * This function returns the database info object containing the amount of documents,
             * the update sequence and the database name.
             * @return promise
             */
            debug: function () {
                var deferred = $q.defer();

                srv.dbs[srv.currentDB].db.info().then(function (response) {
                    console.log('online', srv.network);
                    deferred.resolve(response);
                }).
                        catch (function (error) {
                            console.log(error);
                        });

                return deferred.promise;
            },
            /**
             * Return the URL of the remote server
             */
            getRemoteUrl: function () {
                return srv.dbs[srv.currentDB].remote;
            },
            /**
             * Resets the database by deleting the current database and creating a new one.
             */
            reset: function () {
                PouchDB.destroy(srv.dbs[srv.currentDB].name);
                srv.cache.reset();
                srv.dbs[srv.currentDB].db = new PouchDB(dbs[currentDB].name, {
                    //adapter: 'websql',
                    auto_compaction: true,
                    cache: false
                });
            },
            cancel: function () {
                if (srv.fetchChanges)
                    srv.fetchChanges.cancel();
            },
            /**
             * sets the current channel
             * @param {type} channelName
             * @returns {undefined}
             */
            setChannel: function (channelName) {
                return srv.setChannel(channelName);
            },
            /**
             * returns all present channels
             * @returns {Array}
             */
            getChannels: function () {
                var result = [];
                for (var i = 0; i < srv.dbs.length; i++) {
                    result.push(srv.dbs[i].displayName);
                }
                return result;
            },
            /**
             * return the name of the channel that is currently set
             * @returns {String} name of the current DB/channel
             */
            getActiveChannel: function () {
                return srv.dbs[srv.currentDB].displayName;
            }

        };
    };
});
'use strict';

angular.module('ppnetApp')
  .service('global_functions', function() {

    this.showTimestamp = function(timestamp) {
      // Set the maximum time difference for showing the date
      var maxTimeDifferenceForToday = Math.round((new Date()).getTime() / 1000) - this.ageOfDayInSeconds();
      var maxTimeDifferenceForYesterday = maxTimeDifferenceForToday - 86400;
      var postTime = timestamp / 1000;
      if ((postTime > maxTimeDifferenceForYesterday) && (postTime < maxTimeDifferenceForToday)) {
        return 'yesterday';
      } else if (postTime < maxTimeDifferenceForToday) {
        return 'older';
      }
      return 'today';
    };

    this.time = function(timestamp) {
      timestamp = timestamp / 1000;
      return timestamp;
    };


    this.ageOfDayInSeconds = function() {
      var dt = new Date();
      return dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours());
    };

    this.apply = function(scope) {
      if (!scope.$$phase) {
        scope.$apply();
      }
    };

    this.showLoader = function(items) {
      if (items.length >= 1) {
        return false;
      }
      return true;
    };

    this.orderByCreated = function(item) {
      if (item.created) {
        return item.created;
      } else if (item.doc.created) {
        return item.doc.created;
      }
    };

    this.isDeletable = function(item, user_id) {
      if (item.doc.user.id === user_id) {
        return true;
      }
      return false;
    };

    this.isPhoneGap = function() {
      return /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
    };

    this.isIOS = function() {
      return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
    };
  });
'use strict';

angular.module('ppnetApp')
  .factory('ppnetUser', function() {
    /* global routingConfig*/
    /*jslint bitwise: true */

    var accessLevels = routingConfig.accessLevels,
      userRoles = routingConfig.userRoles;


    var userAttributes = {
      id: '',
      name: '',
      provider: '',
      admin: false,
      online: false,
      role: userRoles.public
    };
    var currentUser;
    var initUser = function() {
      if (!localStorage.getItem('ppnetUser')) {
        currentUser = userAttributes;
      } else {
        currentUser = JSON.parse(localStorage.getItem('ppnetUser'));
      }
    };
    initUser();

    function changeUser(user) {
      angular.extend(currentUser, user);
      localStorage.setItem('ppnetUser', JSON.stringify(user));
    }

    return {
      login: function(newUserData) {
        var user = {
          id: newUserData.id,
          name: newUserData.name,
          provider: newUserData.provider,
          online: true,
          role: userRoles.user
        };
        changeUser(user);
        window.location = '#/';
        return true;
      },
      logout: function() {
        changeUser(userAttributes);

      },
      toggleAdmin: function(status) {
        currentUser.role = (status) ? userRoles.admin : userRoles.user;
        changeUser(currentUser);
      },

      authorize: function(accessLevel, role) {
        if (role === undefined) {
          role = currentUser.role;
        }

        if (!accessLevel) {
          return true;
        }

        return accessLevel.bitMask & role.bitMask;
      },
      isLoggedIn: function(user) {
        if (user === undefined) {
          user = currentUser;
        }
        return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
      },
      accessLevels: accessLevels,
      userRoles: userRoles,
      user: currentUser
    };

  }).directive('accessLevel', ['ppnetUser',
    function(ppnetUser) {
      return {
        restrict: 'A',
        link: function($scope, element, attrs) {
          var prevDisp = element.css('display'),
            userRole, accessLevel;

          $scope.user = ppnetUser.user;
          $scope.$watch('user', function(user) {
            if (user.role) {
              userRole = user.role;
            }
            updateCSS();
          }, true);

          attrs.$observe('accessLevel', function(al) {
            if (al) {
              accessLevel = $scope.$eval(al);
            }
            updateCSS();

          });

          function updateCSS() {
            if (userRole && accessLevel) {
              if (!ppnetUser.authorize(accessLevel, userRole)) {
                element.css('display', 'none');
              } else {
                element.css('display', prevDisp);
              }
            }
          }

        }
      };
    }
  ]);
'use strict';

angular.module('ppnetApp')
  .factory('ppnetPostHelper', function($q, ppnetGeolocation) {

    var defaultPost = {
      msg: '',
      created: false,
      user: false,
      coords: false,
      tags: [],
      type: 'POST'
    };

    var defaultImage = {
      msg: '',
      created: false,
      user: false,
      coords: false,
      tags: [],
      type: 'IMAGE'
    };
    var defaultLike = {
      created: false,
      user: false,
      coords: false,
      type: 'LIKE',
      posting: false
    };
    var defaultComment = {
      msg: '',
      created: false,
      user: false,
      coords: false,
      tags: [],
      type: 'COMMENT',
      posting: false
    };

    var getTags = function(content) {
      var tempTags = [];
      if (!angular.isUndefined(content)) {
        tempTags = content.match(/(#[a-z\d-]+)/ig);
      }
      if (tempTags !== null) {
        for (var i = 0; i < tempTags.length; i++) {
          tempTags[i] = tempTags[i].split('#').join('');
        }
      }
      return tempTags;
    };

    return {
      loadComment: function(comments, newEntry) {
        var postId = newEntry.doc.posting;
        // Checks if there are already comments for the postId
        if (!(postId in comments)) {
          // Initialize an empty array
          comments[postId] = [];
        }
        comments[postId].push(newEntry);
      },
      loadLike: function(likes, newEntry) {
        var postId = newEntry.doc.posting;
        if (!(postId in likes)) {
          likes[postId] = [];
        }
        likes[postId].push(newEntry);
      },
      createPostObject: function(content, user) {
        var tempPost = defaultPost;
        tempPost.created = new Date().getTime();
        tempPost.coords = ppnetGeolocation.getCurrentCoords();
        tempPost.user = {
          id: user.id,
          name: user.name
        };
        tempPost.msg = content;
        tempPost.tags = getTags(content);
        return tempPost;
      },
      createImageObject: function(content, user) {
        var tempImage = defaultImage;
        tempImage.created = new Date().getTime();
        tempImage.coords = ppnetGeolocation.getCurrentCoords();
        tempImage.user = {
          id: user.id,
          name: user.name
        };
        tempImage.tags = getTags(content);
        tempImage.msg = angular.isUndefined(content) ? '' : content;
        return tempImage;
      },
      createLikeObject: function(user, posting) {
        var tempLike = defaultLike;
        tempLike.created = new Date().getTime();
        tempLike.coords = ppnetGeolocation.getCurrentCoords();
        tempLike.user = {
          id: user.id,
          name: user.name
        };
        tempLike.posting = posting;
        return tempLike;
      },
      createCommentObject: function(content, user, posting) {
        var tempComment = defaultComment;
        tempComment.msg = content;
        tempComment.created = new Date().getTime();
        tempComment.coords = ppnetGeolocation.getCurrentCoords();
        tempComment.user = {
          id: user.id,
          name: user.name
        };
        tempComment.tags = getTags(content);
        tempComment.posting = posting;
        return tempComment;
      },
      deleteLikeLocal: function(likes, postId, userId) {
        var deferred = $q.defer();
        var result = false;
        if (!angular.isUndefined(likes[postId])) {
          for (var i = 0; i < likes[postId].length; i++) {
            if (likes[postId][i].doc.user.id === userId) {
              result = likes[postId][i].doc;
              break;
            }
          }
        }
        if (result) {
          deferred.resolve(result);
        } else {
          deferred.reject('No ID found');
        }
        return deferred.promise;
      },
      deleteLike: function(likes, deleted) {
        for (var key in likes) {
          for (var i = 0; i < likes[key].length; i++) {
            if (likes[key][i].id === deleted.id) {
              likes[key].splice(i, 1);
            }
          }
        }
      },
      deleteComment: function(comments, deleted) {
        for (var key in comments) {
          for (var i = 0; i < comments[key].length; i++) {
            if (comments[key][i].id === deleted.id) {
              comments[key].splice(i, 1);
            }
          }
        }
      },
      deletePost: function(posts, deleted) {
        for (var i = 0; i < posts.length; i++) {
          if (posts[i].id === deleted.id) {
            posts.splice(i, 1);
            break;
          }
        }
      },
      findPostInArray: function(posts, id) {
        var deferred = $q.defer();
        var result = false;

        for (var i = 0; i < posts.length; i++) {
          if (posts[i].id === id) {
            result = i;
            break;
          }
        }

        if (result) {
          deferred.resolve(result);
        } else {
          deferred.reject('No ID found');
        }
        return deferred.promise;
      }
    };
  });
'use strict';

angular.module('ppnetApp')
  .factory('ppnetGeolocation', function() {

    var watchID;
    var coords = {};

    var showPosition = function(position) {
      coords.latitude = position.coords.latitude;
      coords.longitude = position.coords.longitude;
      coords.accuracy = position.coords.accuracy;
      saveCurrentLocationtoLocalStorage();
    };

    var errorHandler = function(err) {
      if (err.code === 1) {
        console.log('Error: Access is denied!');
      } else if (err.code === 2) {
        console.log('Error: Position is unavailable!');
      }
      coords.latitude = null;
      coords.longitude = null;
      coords.accuracy = null;
      saveCurrentLocationtoLocalStorage();
    };

    var getLocationUpdate = function() {
      coords.latitude = null;
      coords.longitude = null;
      coords.accuracy = null;
      if (navigator.geolocation) {
        // timeout at 60000 milliseconds (60 seconds)
        var options = {
          timeout: 60000
        };
        watchID = navigator.geolocation.watchPosition(showPosition, errorHandler, options);
      } else {
        console.log('Sorry, browser does not support geolocation!');
      }
    };
    var saveCurrentLocationtoLocalStorage = function() {
      localStorage.setItem('ppnetLocation', JSON.stringify(coords));
    };
    var loadCurrentPositionFromLocalStorage = function() {
      return JSON.parse(localStorage.getItem('ppnetLocation'));
    };

    var saveCurrentMapPositionToLocalStorage = function(position) {
      localStorage.setItem('ppnetMapPosition', JSON.stringify(position));
    };
    var loadCurrentMapPositionFromLocalStorage = function() {
      return JSON.parse(localStorage.getItem('ppnetMapPosition'));
    };

    return {
      getCurrentUserPosition: function() {
        var position = loadCurrentPositionFromLocalStorage();
        if (position === null || (position.latitude === null && position.longitude === null)) {
          return false;
        }
        return position;
      },
      setCurrentMapLocation: function(position) {
        saveCurrentMapPositionToLocalStorage(position);
      },
      getCurrentMapLocation: function() {
        return loadCurrentMapPositionFromLocalStorage();
      },

      getCurrentCoords: function() {
        return coords;
      },
      startGeoWatch: function() {
        getLocationUpdate();
      }
    };
  });
'use strict';

angular.module('ppnetApp').factory('ppnetID', function($cookies) {
    return {
        init : function () {
            $cookies.token = 'abc123';
        }
    };
});