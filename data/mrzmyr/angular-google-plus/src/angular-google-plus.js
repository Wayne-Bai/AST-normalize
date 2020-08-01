/**
 * Options object available for module
 * options/services definition.
 * @type {Object}
 */
var options = {};

/**
 * googleplus module
 */
angular.module('googleplus', []).

  /**
   * GooglePlus provider
   */
  provider('GooglePlus', [function() {

    /**
     * clientId
     * @type {Number}
     */
    options.clientId = null;

    this.setClientId = function(clientId) {
      options.clientId = clientId;
      return this;
    };

    this.getClientId = function() {
      return options.clientId;
    };

    /**
     * apiKey
     * @type {String}
     */
    options.apiKey = null;

    this.setApiKey = function(apiKey) {
      options.apiKey = apiKey;
      return this;
    };

    this.getApiKey = function() {
      return options.apiKey;
    };

    /**
     * Scopes
     * @default 'https://www.googleapis.com/auth/plus.login'
     * @type {Boolean}
     */
    options.scopes = 'https://www.googleapis.com/auth/plus.login';

    this.setScopes = function(scopes) {
      options.scopes = scopes;
      return this;
    };

    this.getScopes = function() {
      return options.scopes;
    };

    /**
     * Init Google Plus API
     */
    this.init = function(customOptions) {
      angular.extend(options, customOptions);
    };

    /**
     * This defines the Google Plus Service on run.
     */
    this.$get = ['$q', '$rootScope', '$timeout', function($q, $rootScope, $timeout) {

      /**
       * Define a deferred instance that will implement asynchronous calls
       * @type {Object}
       */
      var deferred;

      /**
       * NgGooglePlus Class
       * @type {Class}
       */
      var NgGooglePlus = function () {};

      NgGooglePlus.prototype.login =  function () {
        deferred  = $q.defer();
        gapi.auth.authorize({
          client_id: options.clientId,
          scope: options.scopes,
          immediate: false
        }, this.handleAuthResult);
        return deferred.promise;
      };

      NgGooglePlus.prototype.checkAuth = function() {
        gapi.auth.authorize({
          client_id: options.clientId,
          scope: options.scopes,
          immediate: true
        }, this.handleAuthResult);
      };

      NgGooglePlus.prototype.handleClientLoad = function () {
        gapi.client.setApiKey(options.apiKey);
        gapi.auth.init(function () { });
        $timeout(this.checkAuth, 1);
      };

      NgGooglePlus.prototype.handleAuthResult = function(authResult) {
          if (authResult && !authResult.error) {
            deferred.resolve(authResult);
            $rootScope.$apply();
          } else {
            deferred.reject('error');
          }
      };

      NgGooglePlus.prototype.getUser = function() {
          var deferred = $q.defer();

          gapi.client.load('oauth2', 'v2', function () {
            gapi.client.oauth2.userinfo.get().execute(function (resp) {
              deferred.resolve(resp);
              $rootScope.$apply();
            });
          });

          return deferred.promise;
      };

      NgGooglePlus.prototype.getToken = function() {
        return gapi.auth.getToken();
      };

      NgGooglePlus.prototype.setToken = function(token) {
        return gapi.auth.setToken(token);
      };

      NgGooglePlus.prototype.logout =  function () {
        gapi.auth.signOut();
        return deferred.promise;
      };

      return new NgGooglePlus();
    }];
}])

// Initialization of module
.run([function() {
  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://apis.google.com/js/client.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
}]);
