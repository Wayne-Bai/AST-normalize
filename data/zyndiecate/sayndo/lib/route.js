/*
 * Dependencies.
 */

/*
 * Route module.
 */
var route = {
  /*
   * Create the app route structure for the view functions. So we
   * are able to define a function fpr each combination of views,
   * request urls, request methods and custom auth types.
   */
  structure: function(authTypes, requestMethods) {
    var routes =  {}
      , i = 0
      , ii = authTypes.length;

    for(i; i < ii; i++) {
      var c = 0
        , cc = requestMethods.length
        , authType = authTypes[i];

      routes[authType] = {};

      for(c; c < cc; c++) {
        routes[authType][requestMethods[c]] = {};
      }
    }

    return routes;
  }
};

module.exports = route;
