'use strict';
/*global navigator, strata, angular*/
/*jshint camelcase: false */
/*jshint bitwise: false */
/*jshint unused:vars */
angular.module('RedhatAccess.common').factory('strataService', [
    '$q',
    'translate',
    'RHAUtils',
    '$angularCacheFactory',
    'RESOURCE_TYPES',
    function ($q, translate, RHAUtils, $angularCacheFactory, RESOURCE_TYPES) {
        $angularCacheFactory('strataCache', {
            capacity: 1000,
            maxAge: 900000,
            deleteOnExpire: 'aggressive',
            recycleFreq: 60000,
            cacheFlushInterval: 3600000,
            storageMode: 'sessionStorage',
            verifyIntegrity: true
        });
        var ie8 = false;
        if (navigator.appVersion.indexOf('MSIE 8.') !== -1) {
            ie8 = true;
        }
        var strataCache;
        if (!ie8) {
            strataCache = $angularCacheFactory.get('strataCache');
            $(window).unload(function () {
                strataCache.destroy();
            });
        }
        var errorHandler = function (message, xhr, response, status) {
            var translatedMsg = message;
            switch (status) {
            case 'Unauthorized':
                translatedMsg = translate('Unauthorized.');
                break; // case n:
                //   code block
                //   break;
            }
            this.reject({
                message: translatedMsg,
                xhr: xhr,
                response: response,
                status: status
            });
        };
        var clearCache = function (key) {
            strataCache.remove(key);
        };
        var service = {
            authentication: {
                checkLogin: function () {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('auth')) {
                        strata.addAccountNumber(strataCache.get('auth').account_number);
                        deferred.resolve(strataCache.get('auth'));
                    } else {
                        strata.checkLogin(function (result, authedUser) {
                            if (result) {
                                service.accounts.list().then(function (accountNumber) {
                                    service.accounts.get(accountNumber).then(function (account) {
                                        authedUser.account = account;
                                        strata.addAccountNumber(account.number);
                                        if (!ie8) {
                                            strataCache.put('auth', authedUser);
                                        }
                                        deferred.resolve(authedUser);
                                    });
                                }, function (error) {
                                    //TODO revisit this behavior
                                    authedUser.account = undefined;
                                    deferred.resolve(authedUser);
                                });
                            } else {
                                var error = {message: 'Unauthorized.'};
                                deferred.reject(error);
                            }
                        });
                    }
                    return deferred.promise;
                },
                setCredentials: function (username, password) {
                    return strata.setCredentials(username, password);
                },
                logout: function () {
                    if (!ie8) {
                        strataCache.removeAll();
                    }
                    strata.clearCredentials();
                }
            },
            cache: {
                clr: function(key) {
                    clearCache(key);
                }
            },
            entitlements: {
                get: function (showAll, ssoUserName) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('entitlements' + ssoUserName)) {
                        deferred.resolve(strataCache.get('entitlements' + ssoUserName));
                    } else {
                        strata.entitlements.get(showAll, function (entitlements) {
                            if (!ie8) {
                                strataCache.put('entitlements' + ssoUserName, entitlements);
                            }
                            deferred.resolve(entitlements);
                        }, angular.bind(deferred, errorHandler), ssoUserName);
                    }
                    return deferred.promise;
                }
            },
            problems: function (data, max) {
                var deferred = $q.defer();
                strata.problems(data, function (solutions) {
                    deferred.resolve(solutions);
                }, angular.bind(deferred, errorHandler), max);
                return deferred.promise;
            },
            recommendations: function (data, max, highlight, highlightTags) {
                var deferred = $q.defer();
                strata.recommendations(data, function (recommendations) {
                    deferred.resolve(recommendations);
                }, angular.bind(deferred, errorHandler), max, highlight, highlightTags);
                return deferred.promise;
            },
            recommendationsXmlHack: function (data, max, highlight, highlightTags) {
                var deferred = $q.defer();
                strata.recommendationsXmlHack(data, function (recommendations) {
                    deferred.resolve(recommendations);
                }, angular.bind(deferred, errorHandler), max, highlight, highlightTags);
                return deferred.promise;
            },
            solutions: {
                get: function (uri) {
                    var deferred = $q.defer();
                    var splitUri = uri.split('/');
                    uri = splitUri[splitUri.length - 1];
                    if (!ie8 && strataCache.get('solution' + uri)) {
                        deferred.resolve(strataCache.get('solution' + uri));
                    } else {
                        strata.solutions.get(uri, function (solution) {
                            solution.resource_type = RESOURCE_TYPES.solution; //Needed upstream
                            if (!ie8) {
                                strataCache.put('solution' + uri, solution);
                            }
                            deferred.resolve(solution);
                        }, function () {
                            //workaround for 502 from strata
                            //If the deferred is rejected then the parent $q.all()
                            //based deferred will fail. Since we don't need every
                            //recommendation just send back undefined
                            //and the caller can ignore the missing solution details.
                            deferred.resolve();
                        });
                    }
                    return deferred.promise;
                }
            },
            articles: {
                get: function (uri) {
                    var deferred = $q.defer();
                    var splitUri = uri.split('/');
                    uri = splitUri[splitUri.length - 1];
                    if (!ie8 && strataCache.get('articles' + uri)) {
                        deferred.resolve(strataCache.get('articles' + uri));
                    } else {
                        strata.articles.get(uri, function (article) {
                            article.resource_type = RESOURCE_TYPES.article; //Needed upstream
                            if (!ie8) {
                                strataCache.put('articles' + uri, article);
                            }
                            deferred.resolve(article);
                        }, function () {
                            deferred.resolve();
                        });
                    }
                    return deferred.promise;
                }
            },
            search: function (searchString, max) {
                var resultsDeferred = $q.defer();
                var deferreds = [];
                strata.search(
                    searchString,
                    function (entries) {
                        //retrieve details for each solution
                        if (entries !== undefined) {
                            entries.forEach(function (entry) {
                                var deferred = $q.defer();
                                deferreds.push(deferred.promise);
                                var cacheMiss = true;
                                if (entry.resource_type === RESOURCE_TYPES.solution) {
                                    if (!ie8 && strataCache.get('solution' + entry.uri)) {
                                        deferred.resolve(strataCache.get('solution' + entry.uri));
                                        cacheMiss = false;
                                    }

                                }
                                // else if (entry.resource_type === RESOURCE_TYPES.article) {
                                //     if (strataCache.get('article' + entry.uri)) {
                                //         deferred.resolve(strataCache.get('article' + entry.uri));
                                //         cacheMiss = false;
                                //     }
                                // }
                                if (cacheMiss) {
                                    strata.utils.getURI(entry.uri, entry.resource_type, function (type, info) {
                                        if (info !== undefined) {
                                            info.resource_type = type;
                                            if (!ie8 && (type === RESOURCE_TYPES.solution)) {
                                                strataCache.put('solution' + entry.uri, info);
                                            }
                                        }
                                        deferred.resolve(info);
                                    }, function (error) {
                                        deferred.resolve();
                                    });
                                }
                            });
                        }
                        $q.all(deferreds).then(
                            function (results) {
                                var _results = [];
                                results.forEach(function (result) {
                                    if (result !== undefined) {
                                        _results.push(result);
                                    }
                                });
                                resultsDeferred.resolve(_results);
                            },
                            angular.bind(resultsDeferred, errorHandler));
                    },
                    angular.bind(resultsDeferred, errorHandler),
                    max,
                    false);
                return resultsDeferred.promise;
            },
            products: {
                list: function (ssoUserName) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('products' + ssoUserName)) {
                        deferred.resolve(strataCache.get('products' + ssoUserName));
                    } else {
                        strata.products.list(function (response) {
                            if (!ie8) {
                                strataCache.put('products' + ssoUserName, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler), ssoUserName);
                    }
                    return deferred.promise;
                },
                versions: function (productCode) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('versions-' + productCode)) {
                        deferred.resolve(strataCache.get('versions-' + productCode));
                    } else {
                        strata.products.versions(productCode, function (response) {
                            if (!ie8) {
                                strataCache.put('versions-' + productCode, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                    }
                    return deferred.promise;
                },
                get: function (productCode) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('product' + productCode)) {
                        deferred.resolve(strataCache.get('product' + productCode));
                    } else {
                        strata.products.get(productCode, function (response) {
                            if (!ie8) {
                                strataCache.put('product' + productCode, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                    }
                    return deferred.promise;
                }
            },
            groups: {
                get: function (groupNum, ssoUserName) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('groups' + groupNum + ssoUserName)) {
                        deferred.resolve(strataCache.get('groups' + groupNum + ssoUserName));
                    } else {
                        strata.groups.get(groupNum, function (response) {
                            if (!ie8) {
                                strataCache.put('groups' + groupNum + ssoUserName, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler), ssoUserName);
                    }
                    return deferred.promise;
                },
                list: function (ssoUserName, flushCashe) {
                    var deferred = $q.defer();
                    if(flushCashe){
                        strataCache.remove('groups' + ssoUserName);
                    }
                    if (!ie8 && strataCache.get('groups' + ssoUserName)) {
                        deferred.resolve(strataCache.get('groups' + ssoUserName));
                    } else {
                        strata.groups.list(function (response) {
                            if (!ie8) {
                                strataCache.put('groups' + ssoUserName, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler), ssoUserName);
                    }
                    return deferred.promise;
                },
                remove: function (groupNum, ssoUserName) {
                    var deferred = $q.defer();
                    strata.groups.remove(groupNum, function (response) {
                        deferred.resolve(response);
                        clearCache('groups' + ssoUserName);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                },
                create: function (groupName, ssoUserName) {
                    var deferred = $q.defer();
                    strata.groups.create(groupName, function (response) {
                        deferred.resolve(response);
                        clearCache('groups' + ssoUserName);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                },
                update: function(group, ssoUserName){
                    var deferred = $q.defer();
                    strata.groups.update(group, function (response) {
                        deferred.resolve(response);
                        clearCache('groups' + ssoUserName);
                        clearCache('groups' + group.number + ssoUserName);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                },
                createDefault: function(group){
                    var deferred = $q.defer();
                    strata.groups.createDefault(group, function (response) {
                        deferred.resolve(response);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                }
            },
            groupUsers: {
                update: function(users, accountId, groupnum){
                    var deferred = $q.defer();
                    strata.groupUsers.update(users, accountId, groupnum, function (response) {
                        deferred.resolve(response);
                        if (!ie8 && strataCache.get('users' + accountId + groupnum)) {
                            clearCache('users' + accountId + groupnum);
                        }
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                }
            },
            accounts: {
                get: function (accountNumber) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('account' + accountNumber)) {
                        deferred.resolve(strataCache.get('account' + accountNumber));
                    } else {
                        strata.accounts.get(accountNumber, function (response) {
                            if (!ie8) {
                                strataCache.put('account' + accountNumber, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                    }
                    return deferred.promise;
                },
                users: function (accountNumber, group) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('users' + accountNumber + group)) {
                        deferred.resolve(strataCache.get('users' + accountNumber + group));
                    } else {
                        strata.accounts.users(accountNumber, function (response) {
                            if (!ie8) {
                                strataCache.put('users' + accountNumber + group, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler), group);
                    }
                    return deferred.promise;
                },
                list: function () {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('account')) {
                        deferred.resolve(strataCache.get('account'));
                    } else {
                        strata.accounts.list(function (response) {
                            if (!ie8) {
                                strataCache.put('account', response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                    }
                    return deferred.promise;
                }
            },
            cases: {
                csv: function () {
                    var deferred = $q.defer();
                    strata.cases.csv(function (response) {
                        deferred.resolve(response);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                },
                attachments: {
                    list: function (id) {
                        var deferred = $q.defer();
                        if (!ie8 && strataCache.get('attachments' + id)) {
                            deferred.resolve(strataCache.get('attachments' + id));
                        } else {
                            strata.cases.attachments.list(id, function (response) {
                                if (!ie8) {
                                    strataCache.put('attachments' + id, response);
                                }
                                deferred.resolve(response);
                            }, angular.bind(deferred, errorHandler));
                        }
                        return deferred.promise;
                    },
                    post: function (attachment, caseNumber) {
                        var deferred = $q.defer();
                        strata.cases.attachments.post(attachment, caseNumber, function (response, code, xhr) {
                            if (!ie8) {
                                strataCache.remove('attachments' + caseNumber);
                            }
                            deferred.resolve(xhr.getResponseHeader('Location'));
                        }, angular.bind(deferred, errorHandler));
                        return deferred.promise;
                    },
                    remove: function (id, caseNumber) {
                        var deferred = $q.defer();
                        strata.cases.attachments.remove(id, caseNumber, function (response) {
                            if (!ie8) {
                                strataCache.remove('attachments' + caseNumber);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                        return deferred.promise;
                    }
                },
                comments: {
                    get: function (id) {
                        var deferred = $q.defer();
                        if (!ie8 && strataCache.get('comments' + id)) {
                            deferred.resolve(strataCache.get('comments' + id));
                        } else {
                            strata.cases.comments.get(id, function (response) {
                                if (!ie8) {
                                    strataCache.put('comments' + id, response);
                                }
                                deferred.resolve(response);
                            }, angular.bind(deferred, errorHandler));
                        }
                        return deferred.promise;
                    },
                    post: function (caseNumber, text, isPublic, isDraft) {
                        var deferred = $q.defer();
                        strata.cases.comments.post(caseNumber, {
                            'text': text,
                            'draft': isDraft === true ? 'true' : 'false',
                            'public': isPublic === true ? 'true' : 'false'
                        }, function (response) {
                            if (!ie8) {
                                strataCache.remove('comments' + caseNumber);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                        return deferred.promise;
                    },
                    put: function (caseNumber, text, isDraft, isPublic, comment_id) {
                        var deferred = $q.defer();
                        strata.cases.comments.update(caseNumber, {
                            'text': text,
                            'draft': isDraft === true ? 'true' : 'false',
                            'public': isPublic === true ? 'true' : 'false',
                            'caseNumber': caseNumber,
                            'id': comment_id
                        }, comment_id, function (response) {
                            if (!ie8) {
                                strataCache.remove('comments' + caseNumber);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                        return deferred.promise;
                    }
                },
                notified_users: {
                    add: function (caseNumber, ssoUserName) {
                        var deferred = $q.defer();
                        strata.cases.notified_users.add(caseNumber, ssoUserName, function (response) {
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                        return deferred.promise;
                    },
                    remove: function (caseNumber, ssoUserName) {
                        var deferred = $q.defer();
                        strata.cases.notified_users.remove(caseNumber, ssoUserName, function (response) {
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                        return deferred.promise;
                    }
                },
                get: function (id) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('case' + id)) {
                        deferred.resolve([
                            strataCache.get('case' + id),
                            true
                        ]);
                    } else {
                        strata.cases.get(id, function (response) {
                            if (!ie8) {
                                strataCache.put('case' + id, response);
                            }
                            deferred.resolve([
                                response,
                                false
                            ]);
                        }, angular.bind(deferred, errorHandler));
                    }
                    return deferred.promise;
                },
                filter: function (params) {
                    var deferred = $q.defer();
                    if (RHAUtils.isEmpty(params)) {
                        params = {};
                    }
                    if (RHAUtils.isEmpty(params.count)) {
                        params.count = 50;
                    }
                    if (!ie8 && strataCache.get('filter' + JSON.stringify(params))) {
                        deferred.resolve(strataCache.get('filter' + JSON.stringify(params)));
                    } else {
                        strata.cases.filter(params, function (response) {
                            if (!ie8) {
                                strataCache.put('filter' + JSON.stringify(params), response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                    }
                    return deferred.promise;
                },
                post: function (caseJSON) {
                    var deferred = $q.defer();
                    strata.cases.post(caseJSON, function (caseNumber) {
                        //Remove any case filters that are cached
                        if (!ie8) {
                            for (var k in strataCache.keySet()) {
                                if (~k.indexOf('filter')) {
                                    strataCache.remove(k);
                                }
                            }
                        }
                        deferred.resolve(caseNumber);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                },
                put: function (caseNumber, caseJSON) {
                    var deferred = $q.defer();
                    strata.cases.put(caseNumber, caseJSON, function (response) {
                        if (!ie8) {
                            strataCache.remove('case' + caseNumber);
                        }
                        deferred.resolve(response);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                },
                owner: {
                    update: function (caseNumber, ssoUserName) {
                        var deferred = $q.defer();
                        strata.cases.owner.update(caseNumber, ssoUserName, function (response) {
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler));
                        return deferred.promise;
                    }
                }
            },
            values: {
                cases: {
                    severity: function () {
                        var deferred = $q.defer();
                        if (!ie8 && strataCache.get('severities')) {
                            deferred.resolve(strataCache.get('severities'));
                        } else {
                            strata.values.cases.severity(function (response) {
                                if (!ie8) {
                                    strataCache.put('severities', response);
                                }
                                deferred.resolve(response);
                            }, angular.bind(deferred, errorHandler));
                        }
                        return deferred.promise;
                    },
                    status: function () {
                        var deferred = $q.defer();
                        if (!ie8 && strataCache.get('statuses')) {
                            deferred.resolve(strataCache.get('statuses'));
                        } else {
                            strata.values.cases.status(function (response) {
                                if (!ie8) {
                                    strataCache.put('statuses', response);
                                }
                                deferred.resolve(response);
                            }, angular.bind(deferred, errorHandler));
                        }
                        return deferred.promise;
                    },
                    types: function () {
                        var deferred = $q.defer();
                        if (!ie8 && strataCache.get('types')) {
                            deferred.resolve(strataCache.get('types'));
                        } else {
                            strata.values.cases.types(function (response) {
                                if (!ie8) {
                                    strataCache.put('types', response);
                                }
                                deferred.resolve(response);
                            }, angular.bind(deferred, errorHandler));
                        }
                        return deferred.promise;
                    }
                }
            },
            users: {
                get: function (userId) {
                    var deferred = $q.defer();
                    if (!ie8 && strataCache.get('userId' + userId)) {
                        deferred.resolve(strataCache.get('userId' + userId));
                    } else {
                        strata.users.get(function (response) {
                            if (!ie8) {
                                strataCache.put('userId' + userId, response);
                            }
                            deferred.resolve(response);
                        }, angular.bind(deferred, errorHandler), userId);
                    }
                    return deferred.promise;
                },
                chatSession: {
                    post: function(){
                        var deferred = $q.defer();
                        if (!ie8 && strataCache.get('chatSession')) {
                            deferred.resolve(strataCache.get('chatSession'));
                        } else {
                            strata.users.chatSession.get(function (response) {
                                if (!ie8) {
                                    strataCache.put('chatSession', response);
                                }
                                deferred.resolve(response);
                            }, angular.bind(deferred, errorHandler));
                        }
                        return deferred.promise;
                    }
                }
            },
            health: {
                sfdc: function () {
                    var deferred = $q.defer();
                    strata.health.sfdc(function (response) {
                        deferred.resolve(response);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                }
            },
            escalationRequest: {
                create: function (escalationJSON) {
                    var deferred = $q.defer();
                    strata.escalation.create(escalationJSON, function (escalationNum) {
                        deferred.resolve(escalationNum);
                    }, angular.bind(deferred, errorHandler));
                    return deferred.promise;
                }
            }
        };
        return service;
    }
]);
