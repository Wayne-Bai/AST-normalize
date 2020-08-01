jqmModule.provider('jqmViewCache', function () {
  return {
    $get: ['$cacheFactory', '$compile', '$http', '$templateCache', '$q', factory]
  };

  function factory($cacheFactory, $compile, $http, $templateCache, $q) {
    var jqmViewCache = $cacheFactory('jqmCachingView');

    return {
      cache: jqmViewCache,
      load: load
    };

    function load(scope, url) {
      var cacheKey = scope.$id+'@'+url,
        cacheEntryPromise = jqmViewCache.get(cacheKey);
      if (cacheEntryPromise) {
        return cacheEntryPromise;
      }
      cacheEntryPromise = $http.get(url, {cache: $templateCache}).then(function (response) {
        var compileElements = angular.element('<div></div>').html(response.data).contents();
        return createCacheEntry(scope, compileElements);
      });
      jqmViewCache.put(cacheKey, cacheEntryPromise);
      return cacheEntryPromise;
    }

    function createCacheEntry(scope, compileElements) {
      var currentIndex = 0,
        templateInstances = [],
        i,
        templateInstanceCount = 1,
        link;
      angular.forEach(compileElements, function (element) {
        var el;
        if (element.nodeType === window.Node.ELEMENT_NODE) {
          el = angular.element(element);
          if (angular.isDefined(el.attr('allow-same-view-animation')) ||
            angular.isDefined(el.attr('data-allow-same-view-animation'))) {
            templateInstanceCount = 2;
          }
        }
      });
      link = $compile(compileElements);
      for (i = 0; i < templateInstanceCount; i++) {
        templateInstances.push(createTemplateInstance(link, scope, true));
      }
      return {
        get: get,
        next: next
      };

      function get(index) {
        if (!angular.isDefined(index)) {
          index = currentIndex;
        }
        return templateInstances[index];
      }

      function next() {
        currentIndex++;
        if (currentIndex >= templateInstances.length) {
          currentIndex = 0;
        }
        return get(currentIndex);
      }
    }

    function createTemplateInstance(link, scope, clone) {
      var ctrlScope = scope.$new(),
        directiveScope = ctrlScope.$new(),
        elements,
        cloneAttachFn;
      ctrlScope.$disconnect();
      ctrlScope.$destroy = scopeClearAndDisconnect;
      if (clone) {
        cloneAttachFn = angular.noop;
      }
      elements = link(directiveScope, cloneAttachFn);
      return {
        scope: ctrlScope,
        elements: elements
      };
    }
  }

  function scopeClearAndDisconnect() {
    /*jshint -W040:true*/
    var prop;
    // clear all watchers, listeners and all non angular properties,
    // so we have a fresh scope!
    this.$$watchers = [];
    this.$$listeners = [];
    for (prop in this) {
      if (this.hasOwnProperty(prop) && prop.charAt(0) !== '$') {
        delete this[prop];
      }
    }
    this.$disconnect();
  }




});
