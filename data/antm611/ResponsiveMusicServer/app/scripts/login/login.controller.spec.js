/* jshint -W117, -W030 */
describe('app.login.LoginController', function() {

    var controller;

    beforeEach(module('app.login'));

    beforeEach(inject(function($controller, $rootScope, $routeParams, $q, ApiFactory) {
        window.$rootScope = $rootScope;
        window.$routeParams = $routeParams;
        window.ApiFactory = ApiFactory;
        window.$q = $q;

        controller = $controller('LoginController', {
            $rootScope: $rootScope,
            $routeParams: $routeParams,
            ApiFactory: ApiFactory
        });
    }));

    describe('initialisation', function() {
        it('should initialise the auth object on start', function() {
            expect(controller.auth).toEqual({});
        });

        it('should analyse the route parameters and automatically log a user in if they are set', function() {
            spyOn(ApiFactory.session, 'getSession').and.returnValue({
                submit: function() {
                    return $q.when({
                        Session: 'asdhdashhds',
                        Secret: 'sadgdsahsahdsa'
                    });
                }
            });
            $routeParams.token = 'asd9fugasd9ufgsaiduofb';
            $routeParams.auth = 'sadf98hasf9dhsafushdao';
            spyOn($rootScope, '$emit');

            inject(function($injector) {
                var $controller = $injector.get('$controller');

                controller = $controller('LoginController', {
                    $rootScope: $rootScope,
                    $routeParams: $routeParams,
                    ApiFactory: ApiFactory
                });
            });
            $rootScope.$digest();

            expect(ApiFactory.session.getSession).toHaveBeenCalledWith('asd9fugasd9ufgsaiduofb', 'sadf98hasf9dhsafushdao');
            expect(ApiFactory.session.getSession.calls.count()).toBe(1);

            expect($rootScope.$emit).toHaveBeenCalled();
            expect($rootScope.$emit.calls.count()).toBe(1);
            expect($rootScope.$emit.calls.mostRecent().args.length).toBe(2);
            expect($rootScope.$emit.calls.mostRecent().args[0]).toBe('loginSuccess');
            expect($rootScope.$emit.calls.mostRecent().args[1].Key).toBe('asdhdashhds');
            expect($rootScope.$emit.calls.mostRecent().args[1].Secret).toBe('sadgdsahsahdsa');
        });
    });

    describe('loginFailed', function() {
        it('should log an error and display an error when calling the loginFailed function', function() {
            spyOn(console, 'warn');
            spyOn($rootScope, '$emit');

            controller.loginFailed('asdiabsiusavfusyavfuysd');
            expect(console.warn).toHaveBeenCalledWith('asdiabsiusavfusyavfuysd');
            expect($rootScope.$emit).toHaveBeenCalledWith('app.components.error.ErrorMessage', 'Login attempt failed. Please try again.');
        });
    });

    describe('getAuthString', function() {
        it('should correctly generate auth strings', function() {
            expect(controller.getAuthString('myUsername', 'myPassword', 'myToken')).toBe('c97cfcc0a13092b18d8dd3912112f71a');
            expect(controller.getAuthString('dfgsdf0ghi', 'asdfsubisd', 'myToksdd09hen')).toBe('d77d1465d59a51b60d9ec1e79a58c921');
            expect(controller.getAuthString('sdn9gfdg', 'sdfg08dh9g', 'sagasdg')).toBe('ef4de70da765515f55cf73ef462065e6');
            expect(controller.getAuthString('s0gh8hfd9gho', 'dfg0sdh89', 'myToken')).toBe('502fcedff4e12b59756e7a4c465e77cf');
        });
    });

    describe('login', function() {
        it('should call loginFailed if the getToken request fails', function() {
            spyOn(ApiFactory.session, 'getToken').and.returnValue({
                submit: function() {
                    return $q.reject();
                }
            });
            spyOn(controller, 'loginFailed');

            controller.login();
            $rootScope.$digest();

            expect(controller.loginFailed).toHaveBeenCalledWith();
            expect(controller.loginFailed.calls.count()).toBe(1);
        });

        it('should call loginFailed if the getSession request fails', function() {
            spyOn(ApiFactory.session, 'getToken').and.returnValue({
                submit: function() {
                    return $q.when({
                        Token: 'asdonasifdsf'
                    });
                }
            });
            spyOn(ApiFactory.session, 'getSession').and.returnValue({
                submit: function() {
                    return $q.reject();
                }
            });
            spyOn(controller, 'loginFailed');

            controller.login();
            $rootScope.$digest();

            expect(controller.loginFailed).toHaveBeenCalledWith();
            expect(controller.loginFailed.calls.count()).toBe(1);
        });

        it('should emit a loginSuccess event when the login request succeeds', function() {
            spyOn(ApiFactory.session, 'getToken').and.returnValue({
                submit: function() {
                    return $q.when({
                        Token: 'myToksdd09hen'
                    });
                }
            });
            spyOn(ApiFactory.session, 'getSession').and.returnValue({
                submit: function() {
                    return $q.when({
                        Session: 'asdouas8gs9f9',
                        Secret: 'asdgbsa87gs98hfj'
                    });
                }
            });
            controller.auth = {
                username: 'dfgsdf0ghi',
                password: 'asdfsubisd'
            };

            spyOn($rootScope, '$emit');

            controller.login();
            $rootScope.$digest();

            expect(ApiFactory.session.getToken).toHaveBeenCalledWith();
            expect(ApiFactory.session.getToken.calls.count()).toBe(1);
            expect(ApiFactory.session.getSession).toHaveBeenCalledWith('myToksdd09hen', 'd77d1465d59a51b60d9ec1e79a58c921');
            expect(ApiFactory.session.getSession.calls.count()).toBe(1);

            expect($rootScope.$emit).toHaveBeenCalled();
            expect($rootScope.$emit.calls.count()).toBe(1);
            expect($rootScope.$emit.calls.mostRecent().args.length).toBe(2);
            expect($rootScope.$emit.calls.mostRecent().args[0]).toBe('loginSuccess');
            expect($rootScope.$emit.calls.mostRecent().args[1].Key).toBe('asdouas8gs9f9');
            expect($rootScope.$emit.calls.mostRecent().args[1].Secret).toBe('asdgbsa87gs98hfj');
        });
    });

});
