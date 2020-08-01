'use strict';
/*jshint unused:vars */
/*jshint camelcase: false */
angular.module('RedhatAccess.security').factory('securityService', [
    '$rootScope',
    '$modal',
    'AUTH_EVENTS',
    '$q',
    'LOGIN_VIEW_CONFIG',
    'SECURITY_CONFIG',
    'strataService',
    'AlertService',
    'RHAUtils',
    function($rootScope, $modal, AUTH_EVENTS, $q, LOGIN_VIEW_CONFIG, SECURITY_CONFIG, strataService, AlertService, RHAUtils) {
        var isLoginDisplayed = false;
        var service = {
            loginStatus: {
                isLoggedIn: false,
                verifying: false,
                userAllowedToManageCases: true,
                authedUser: {}
            },
            loginURL: SECURITY_CONFIG.loginURL,
            logoutURL: SECURITY_CONFIG.logoutURL,
            setLoginStatus: function(isLoggedIn, verifying, authedUser) {
                service.loginStatus.isLoggedIn = isLoggedIn;
                service.loginStatus.verifying = verifying;
                service.loginStatus.authedUser = authedUser;
                service.userAllowedToManageCases();
            },
            clearLoginStatus: function() {
                service.loginStatus.isLoggedIn = false;
                service.loginStatus.verifying = false;
                service.loginStatus.userAllowedToManageCases = false;
                service.loginStatus.authedUser = {};
            },
            setAccount: function(accountJSON) {
                service.loginStatus.account = accountJSON;
            },
            modalDefaults: {
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                templateUrl: 'security/views/login_form.html',
                windowClass: 'rha-login-modal'
            },
            modalOptions: {
                closeButtonText: 'Close',
                actionButtonText: 'OK',
                headerText: 'Proceed?',
                bodyText: 'Perform this action?',
                backdrop: 'static'
            },
            userAllowedToManageCases: function() {
                var canManage = false;
                if(service.loginStatus.authedUser.rights !== undefined){
                    for(var i = 0; i < service.loginStatus.authedUser.rights.right.length; i++){
                        if(service.loginStatus.authedUser.rights.right[i].name === 'portal_manage_cases' && service.loginStatus.authedUser.rights.right[i].has_access === true){
                            canManage = true;
                            break;
                        }
                    }
                }
                service.loginStatus.userAllowedToManageCases = canManage;
            },
            userAllowedToManageEmailNotifications: function(user) {
                if (RHAUtils.isNotEmpty(service.loginStatus.authedUser.account) && RHAUtils.isNotEmpty(service.loginStatus.authedUser.account) && service.loginStatus.authedUser.org_admin) {
                    return true;
                } else {
                    return false;
                }
            },
            userAllowedToManageGroups: function(user) {
                if (RHAUtils.isNotEmpty(service.loginStatus.authedUser.account) && RHAUtils.isNotEmpty(service.loginStatus.authedUser.account) && (!service.loginStatus.authedUser.account.has_group_acls || service.loginStatus.authedUser.account.has_group_acls && service.loginStatus.authedUser.org_admin)) {
                    return true;
                } else {
                    return false;
                }
            },
            userAllowedToManageDefaultGroups: function(user) {
                if (RHAUtils.isNotEmpty(service.loginStatus.authedUser.account) && RHAUtils.isNotEmpty(service.loginStatus.authedUser.account) && (service.loginStatus.authedUser.org_admin)) {
                    return true;
                } else {
                    return false;
                }
            },
            getBasicAuthToken: function() {
                var defer = $q.defer();
                var token = localStorage.getItem('rhAuthToken');
                if (token !== undefined && token !== '') {
                    defer.resolve(token);
                    return defer.promise;
                } else {
                    service.login().then(function(authedUser) {
                        defer.resolve(localStorage.getItem('rhAuthToken'));
                    }, function(error) {
                        defer.resolve(error);
                    });
                    return defer.promise;
                }
            },
            loggingIn: false,
            initLoginStatus: function() {
                service.loggingIn = true;
                var defer = $q.defer();
                var wasLoggedIn = service.loginStatus.isLoggedIn;
                service.loginStatus.verifying = true;
                strataService.authentication.checkLogin().then(angular.bind(this, function(authedUser) {
                    service.setAccount(authedUser.account);
                    service.setLoginStatus(true, false, authedUser);
                    service.loggingIn = false;
                    //We don't want to resend the AUTH_EVENTS.loginSuccess if we are already logged in
                    if (wasLoggedIn === false) {
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    }
                    defer.resolve(authedUser.loggedInUser);
                }), angular.bind(this, function(error) {
                    service.clearLoginStatus();
                    AlertService.addStrataErrorMessage(error);
                    service.loggingIn = false;
                    defer.reject(error);
                }));
                return defer.promise;
            },
            validateLogin: function(forceLogin) {
                var defer = $q.defer();
                //var that = this;
                if (!forceLogin) {
                    service.initLoginStatus().then(function(username) {
                        defer.resolve(username);
                    }, function(error) {
                        defer.reject(error);
                    });
                    return defer.promise;
                } else {
                    service.initLoginStatus().then(function(username) {
                        defer.resolve(username);
                    }, function(error) {
                        service.login().then(function(authedUser) {
                            defer.resolve(authedUser.loggedInUser);
                        }, function(error) {
                            defer.reject(error);
                        });
                    });
                    return defer.promise;
                }
            },
            login: function() {
                return service.showLogin(service.modalDefaults, service.modalOptions);
            },
            logout: function() {
                strataService.authentication.logout();
                service.clearLoginStatus();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            },
            showLogin: function(customModalDefaults, customModalOptions) {
                if (isLoginDisplayed) {
                    // We already have a login dialog up, no need to show another
                    var defer = $q.defer();
                    defer.reject();
                    return defer.promise;
                }
                isLoginDisplayed = true;

                //Create temp objects to work with since we're in a singleton service
                var tempModalDefaults = {};
                var tempModalOptions = {};
                //Map angular-ui modal custom defaults to modal defaults defined in service
                angular.extend(tempModalDefaults, service.modalDefaults, customModalDefaults);
                //Map modal.html $scope custom properties to defaults defined in service
                angular.extend(tempModalOptions, service.modalOptions, customModalOptions);
                if (!tempModalDefaults.controller) {
                    tempModalDefaults.controller = [
                        '$scope',
                        '$modalInstance',
                        function($scope, $modalInstance) {
                            $scope.user = {
                                user: null,
                                password: null
                            };
                            $scope.status = {
                                authenticating: false
                            };
                            $scope.useVerboseLoginView = LOGIN_VIEW_CONFIG.verbose;
                            function resetStatus() {
                                $scope.status.authenticating = false;
                                isLoginDisplayed = false;
                            }
                            $scope.modalOptions = tempModalOptions;
                            $scope.modalOptions.keyDown = function($event, onEnter) {
                                if ($event.keyCode === 13) {
                                    onEnter();
                                }
                            };
                            $scope.modalOptions.ok = function(result) {
                                //Hack below is needed to handle autofill issues
                                //@see https://github.com/angular/angular.js/issues/1460
                                //BEGIN HACK
                                $scope.status.authenticating = true;
                                $scope.user.user = $('#rha-login-user-id').val();
                                $scope.user.password = $('#rha-login-password').val();
                                //END HACK
                                var resp = strataService.authentication.setCredentials($scope.user.user, $scope.user.password);
                                if (resp) {
                                    service.initLoginStatus().then(
                                        function(authedUser) {
                                            $scope.user.password = '';
                                            $scope.authError = null;
                                            try {
                                                $modalInstance.close(authedUser);
                                            } catch (err) {}
                                            resetStatus();
                                        },
                                        function(error) {
                                            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                                                $scope.$apply(function() {
                                                    $scope.authError = 'Login Failed!';
                                                });
                                            } else {
                                                $scope.authError = 'Login Failed!';
                                            }
                                            resetStatus();
                                        }
                                    );
                                }else {
                                    $scope.authError = 'Login Failed!';
                                    resetStatus();
                                }
                            };
                            $scope.modalOptions.close = function() {
                                resetStatus();
                                $modalInstance.dismiss('User Canceled Login');
                            };
                        }
                    ];
                }
                return $modal.open(tempModalDefaults).result;
            }
        };
        return service;
    }
]);
