// Copyright StrongLoop 2014
Property.service('PropertyService', [
  'ModelDefinition',
  'ModelProperty',
  'ModelService',
  '$q',
  '$log',
  function(ModelDefinition, ModelProperty, ModelService, $q, $log) {
    var svc = {};

    svc.getModelProperties = function(modelId) {
      /*
      * not the most efficient method to get the model properties
      * but the native ModelProperty.properties:id wasn't working
      * - usefull for where the UI doesn't need a whole instnace reload
      * */
      return ModelService.getModelInstanceById(modelId)
        .then(function(modelInstance) {
          return modelInstance.properties;
        });
    };
    svc.createModelProperty = function(propConfig) {
      return ModelProperty.create({}, propConfig)
        .$promise
        .then(function(property) {
          return property;
        })
        .catch(function(error) {
          console.warn('bad create model property: ' + error);
          return error;
        });
    };

    svc.updateModelProperty = function(propConfig) {
      if (propConfig) {

        // `id` is '{facet}.{model}.{name}'
        var splitId = propConfig.id.split('.');
        var oldName = splitId.pop();
        var oldId = propConfig.id;

        // update the id
        splitId.push(propConfig.name);
        var newId = splitId.join('.');

        return ModelProperty.deleteById({ id: oldId })
          .$promise
          .then(function() {
            delete propConfig.id;
            return ModelProperty.create(propConfig)
              .$promise
              .then(function(property) {
                //propConfig.id = response.idproperty;
                return property;
              })
              .catch(function(error) {
                $log.warn('bad model property create: ' + error.message);
              })

          })
          .catch(function(err) {
            $log.warn('Cannot rename %s to %s.', oldId, propConfig.id, err);
          });
      }
      else {
        $log.warn('updateModelProperty called with no propConfig ');
      }

    };

    svc.deleteModelProperty = function(config) {
      var deferred = $q.defer();
      ModelProperty.deleteById({id: config.id},
        //success
        function(response) {
          return deferred.resolve(response);
        },
        // fail
        function(response) {
          console.warn('bad delete model properties: ' + response);
          return deferred.reject(response);
        }
      );
      return deferred.promise;
    };

    return svc;
  }
]);

/**
 * @ngdoc factory
 * @name Property.modelPropertyTypes
 * @kind array
 * @description
 * A list of LoopBack types that can be used in model properties.
 */
Property.factory('modelPropertyTypes', [
  'ModelProperty',
  function modelPropertyTypesFactory(ModelProperty) {
    var list = ModelProperty.getAvailableTypes();

    var result = [];
    result.$resolved = list.$resolved;
    result.$promise = list.$promise.then(function() {
      // Angular converts each string to a Resource object
      // E.g. { 0: 'S', 1: 't', 2: 'r', 3: 'i', 4: 'n', 5: 'g' }
      // We need to convert it back to string
      list.forEach(function(res) {
        var indices = Object.keys(res)
          .filter(function isIndex(ix) { return /^[0-9]+$/.test(ix); })
          .map(function convertToNumber(ix) { return +ix; });
        indices.sort();

        var str = indices.reduce(function(acc, val) {
          return acc + res[val];
        }, '');
        result.push(str);
      });
      result.$resolved = true;
      return result;
    });

    return result;
  }
]);
