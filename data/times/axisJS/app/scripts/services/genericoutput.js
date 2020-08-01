'use strict';

/**
 * @ngdoc service
 * @name axisJsApp.GenericOutputService
 * @description
 * # GenericOutput
 * Useless service. Meant to be extended.
 */
angular.module('axisJSApp')
  .factory('GenericOutput', [function() {
    this.serviceConfig = {
      type: 'save', // Options: 'save' and 'export'
      label: ''
    };
    this.preprocess = function(scope){
      return scope;
    };
    this.process = function(payload){
      return payload;
    };
    this.complete = function(output){
      return output; // This generally doesn't return anything, but is doing so for tests in this case.
    };
    this.export = function(scope){
      var payload = this.preprocess(scope);
      var output = this.process(payload);
      return this.complete(output);
    };

    return this;
  }]);
