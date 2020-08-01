'use strict';

/**
 * @ngdoc overview
 * @name ExpertsInside.SharePoint.Core
 *
 * @description
 *
 * # ExpertsInside.SharePoint.Core
 *
 * The ExpertsInside.SharePoint.Core module contains utility services
 * used by the other modules.
 */
angular.module('ExpertsInside.SharePoint.Core', ['ng'])
  .run(function($window, $log) {
    if (angular.isUndefined($window.ShareCoffee)) {
      $log.warn("ExpertsInside.SharePoint.Core module depends on ShareCoffee. " +
                 "Please include ShareCoffee.js in your document");
    }
  });

/**
 * @ngdoc overview
 * @name ExpertsInside.SharePoint.List
 * @requires ExpertsInside.SharePoint.Core
 *
 * @description
 *
 * # ExpertsInside.SharePoint.List
 *
 * The ExpertsInside.SharePoint.List module contains the
 * {@link ExpertsInside.SharePoint.List.$spList `$spList`} service,
 * a wrapper for the List REST API
 */
angular.module('ExpertsInside.SharePoint.List', ['ExpertsInside.SharePoint.Core']);

/**
 * @ngdoc overview
 * @name ExpertsInside.SharePoint.Search
 * @requires ExpertsInside.SharePoint.Core
 *
 * @description
 *
 * # ExpertsInside.SharePoint.Search
 *
 * The ExpertsInside.SharePoint.Search module contains the
 * {@link ExpertsInside.SharePoint.Search.$spSearch `$spSearch`} service,
 * a wrapper for the Search REST API.
 *
 * Include **ShareCoffee.Search.js** when using this module !
 */
angular.module('ExpertsInside.SharePoint.Search', ['ExpertsInside.SharePoint.Core'])
  .run(function($window, $log) {
    if (angular.isUndefined($window.ShareCoffee) || angular.isUndefined($window.ShareCoffee.QueryProperties)) {
      $log.warn("ExpertsInside.SharePoint.Search module depends on ShareCoffee.Search. " +
                 "Please include ShareCoffee.Search.js in your document");
    }
  });

/**
 * @ngdoc overview
 * @name ExpertsInside.SharePoint.User
 * @requires ExpertsInside.SharePoint.Core
 *
 * @description
 *
 * # ExpertsInside.SharePoint.User
 *
 * The ExpertsInside.SharePoint.User module contains the
 * {@link ExpertsInside.SharePoint.User.$spUser `$spUser`} service,
 * a wrapper for the User Profiles REST API
 *
 * Include **ShareCoffee.UserProfiles.js** when using this module !
 */
angular.module('ExpertsInside.SharePoint.User', ['ExpertsInside.SharePoint.Core'])
  .run(function($window, $log) {
    if (angular.isUndefined($window.ShareCoffee) || angular.isUndefined($window.ShareCoffee.UserProfileProperties)) {
      $log.warn("ExpertsInside.SharePoint.User module depends on ShareCoffee.UserProfiles. " +
                 "Please include ShareCoffee.UserProfiles.js in your document");
    }
  });

/**
 * @ngdoc overview
 * @name ExpertsInside.SharePoint.JSOM
 *
 * @description
 *
 * # ExpertsInside.SharePoint.JSOM
 *
 * The ExpertsInside.SharePoint.User module contains the
 * {@link ExpertsInside.SharePoint.User.$spUser `$spUser`} service,
 * a wrapper for the User Profiles REST API
 *
 * Include **ShareCoffee.UserProfiles.js** when using this module !
 */
angular.module('ExpertsInside.SharePoint.JSOM', [])
  .run(function($window, $log) {
    if (angular.isUndefined($window.SP) || angular.isUndefined($window.SP.ClientContext)) {
      $log.warn("ExpertsInside.SharePoint.JSOM module depends on the SharePoint Javascript Runtime. " +
                 "For more information see: http://blogs.msdn.com/b/officeapps/archive/2012/09/04/using-the-javascript-object-model-jsom-in-apps-for-sharepoint.aspx");
    }
  });

/**
 * @ngdoc overview
 * @name ExpertsInside.SharePoint
 * @requires ExpertsInside.SharePoint.Core
 * @requires ExpertsInside.SharePoint.List
 * @requires ExpertsInside.SharePoint.Search
 * @requires ExpertsInside.SharePoint.User
 * @requires ExpertsInside.SharePoint.JSOM
 *
 * @description
 *
 * # ExpertsInside.SharePoint
 *
 * The complete `angular-sharepoint` experience.
 *
 */
angular.module('ExpertsInside.SharePoint', [
  'ExpertsInside.SharePoint.Core',
  'ExpertsInside.SharePoint.List',
  'ExpertsInside.SharePoint.Search',
  'ExpertsInside.SharePoint.User'
]);

