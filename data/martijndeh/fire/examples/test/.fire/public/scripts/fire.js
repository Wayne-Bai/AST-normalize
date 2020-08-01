'use strict';

/* jshint undef: true, unused: true */
/* global angular */

var app = angular.module('default', ['ngRoute']);


app.config(['TestsServiceProvider', function(TestsServiceProvider) {
	TestsServiceProvider.delegate(function(test, variant) {
		console.log('Join test ' + test + ' with variant ' + variant);

		var properties = {};
		properties[test] = variant;
		mixpanel.register(properties);
	});
}]);



app.controller('StartController', ['TextOfButtonTest', '$scope', function(TextOfButtonTest, $scope) {
	if(TextOfButtonTest.getVariant() == 'A') {
		$scope.buttonText = 'Register for FREE';
	}
	else {
		$scope.buttonText = 'Register now';
	}

	$scope.register = function() {
		mixpanel.track('Register');
	};
}]);

function _getUUID(modelInstanceOrUUID) {
    var UUID;

    if(typeof modelInstanceOrUUID.toQueryValue != 'undefined') {
        UUID = modelInstanceOrUUID.toQueryValue();
    }
    else if(typeof modelInstanceOrUUID == 'string') {
        UUID = modelInstanceOrUUID;
    }
    else {
        var error = new FireError('Parameter `' + modelInstanceOrUUID + '` is not a valid model instance or UUID.');
        error.status = 400;
        throw error;
    }

    return UUID;
}

function FireError(message) {
    this.name = 'FireError';
    this.message = message || '';
	this.number = -1;
}
FireError.prototype = new Error();

function FireModelInstance(setMap, model, path) {
	this._map = setMap || {};
	this._changes = {};
	this._model = model;

	if(this._map.id) {
		this._endpoint = path + '/' + this._map.id;
	}
	else {
		this._endpoint = null;
	}
}

FireModelInstance.prototype.refresh = function(otherInstance) {
	this._map = otherInstance._map;
	return this;
};

FireModelInstance.prototype.toQueryValue = function() {
	return this._map.id;
};

FireModelInstance.prototype.remove = function() {
	return this._model.remove(this._map.id);
};

FireModelInstance.prototype.save = function() {
    var self = this;
    return this._model.$q.when(Object.keys(this._changes).length)
        .then(function(numberOfChanges) {
            if(numberOfChanges) {
                var queryMap = transformQueryMap(self._changes);

                return self._model._put(self._endpoint, queryMap)
                    .then(function(instance) {
                        self._changes = {};

                        Object.keys(instance._map).forEach(function(key) {
                            if(instance._map[key] !== null) {
                                self._map[key] = instance._map[key];
                            }
                        });
                        return self;
                    });
            }
            else {
                return self;
            }
        });
};

function FireModel($http, $q, models) {
	this.$http = $http;
	this.$q = $q;
	this.models = models;
}

FireModel.prototype._prepare = function(params) {
	var map = {};
	Object.keys(params || {}).forEach(function(key) {
		map[key] = JSON.stringify(params[key]);
	});
	return map;
};

FireModel.prototype._action = function(verb, path, params, data) {
	var defer = this.$q.defer();

	var self = this;
	this.$http({method: verb, url: path, data: data, params: params, headers: {'x-json-params': true}})
		.success(function(result) {
			defer.resolve(self.parseResult(result, path));
		})
		.error(function(data, statusCode) {
            var error = new FireError(data);
            error.number = statusCode;
			defer.reject(error);
		});

	return defer.promise;
};

FireModel.prototype._post = function(path, fields) {
	return this._action('post', path, null, this._prepare(fields));
};

FireModel.prototype._get = function(path, params) {
	return this._action('get', path, this._prepare(params));
};

FireModel.prototype._put = function(path, fields) {
	return this._action('put', path, null, this._prepare(fields));
};

FireModel.prototype.update = function(id, model) {
    var queryMap = transformQueryMap(model);

	return this._put(this.endpoint + '/' + id, queryMap);
};

FireModel.prototype.remove = function(modelInstanceMapOrUUID) {
    var UUID = null;

    if(typeof modelInstanceMapOrUUID.toQueryValue != 'undefined') {
        UUID = modelInstanceMapOrUUID.toQueryValue();
    }
    else if(typeof modelInstanceMapOrUUID == 'string') {
        UUID = modelInstanceMapOrUUID;
    }

    if(UUID) {
        return this._action('delete', this.endpoint + '/' + UUID);
    }
    else {
        return this._action('delete', this.endpoint, this._prepare(transformQueryMap(modelInstanceMapOrUUID)));
    }
};

FireModel.prototype.findOrCreate = function(where, set) {
	var self = this;
	return this.findOne(where)
		.then(function(modelInstance) {
			if(modelInstance) {
				return modelInstance;
			}
			else {
				var createMap = {};
				Object.keys(where || {}).forEach(function(key) {
					createMap[key] = where[key];
				});

				Object.keys(set || {}).forEach(function(key) {
					createMap[key] = set[key];
				});

				return self.create(createMap);
			}
		});
};

FireModel.prototype._create = function(path, fields) {
    var queryMap = transformQueryMap(fields);

	return this._post(path, queryMap);
};

FireModel.prototype.create = function(fields) {
	return this._create(this.endpoint, fields);
};

function transformQueryMap(fields, options) {
    var queryMap = {};

    Object.keys(fields || {}).forEach(function(key) {
        var value = fields[key];
        if(value && typeof value.toQueryValue != 'undefined') {
            queryMap[key] = value.toQueryValue();
        }
        else {
            queryMap[key] = value;
        }
    });

    if(options) {
        queryMap.$options = options;
    }

    return queryMap;
}

FireModel.prototype._find = function(path, fields, options) {
	var queryMap = transformQueryMap(fields, options);
	return this._get(path, queryMap);
};

FireModel.prototype.find = function(fields, options) {
	return this._find(this.endpoint, fields, options);
};

FireModel.prototype.findOne = function(fields, options) {
	var fieldsMap = fields || {};
	if(fieldsMap.id) {
		var modelID = fieldsMap.id;
		delete fieldsMap.id;

		var self = this;
		return this._get(this.endpoint + '/' + modelID, transformQueryMap(fieldsMap))
			.then(function(modelInstance) {
				if(modelInstance) {
					modelInstance._endpoint = self.endpoint + '/' + modelID;
				}

				return modelInstance;
			});
	}
	else {
		var optionsMap = options || {};
		optionsMap.limit = 1;

		return this.find(fieldsMap, optionsMap)
			.then(function(list) {
				if(list && list.length) {
					return list[0];
				}
				else {
					return null;
				}
			});
	}

};

FireModel.prototype.getOne = function(fields) {
	var defer = this.$q.defer();
	this.findOne(fields)
		.then(function(model) {
			if(model) {
				defer.resolve(model);
			}
			else {
				var error = new FireError('Not Found');
				error.number = 404;
				defer.reject(error);
			}
		});
	return defer.promise;
};


function FireModelInstanceTest(setMap, model, path) {
	var self = this;

	

	Object.defineProperty(this, 'id', {
		get: function() {
			if(typeof self._changes['id'] != 'undefined') {
				return self._changes['id'];
			}

			return self._map['id'];
		},

		set: function(value) {
			self._changes['id'] = value;
		}
	});

	

	Object.defineProperty(this, 'name', {
		get: function() {
			if(typeof self._changes['name'] != 'undefined') {
				return self._changes['name'];
			}

			return self._map['name'];
		},

		set: function(value) {
			self._changes['name'] = value;
		}
	});

	
	if(typeof setMap.sessions != 'undefined' && setMap.sessions !== null) {
		if(Array.isArray(setMap.sessions)) {
			setMap.sessions = setMap.sessions.map(function(object) {
                return new FireModelInstanceTestSession(object, model.models.TestSession, path + '/' + 'sessions');
			});
		}
		else {
			setMap.sessions = new FireModelInstanceTestSession(setMap.sessions, model.models.TestSession, path + '/' + 'sessions');
		}
	}
	

	Object.defineProperty(this, 'sessions', {
		get: function() {
			if(typeof self._changes['sessions'] != 'undefined') {
				return self._changes['sessions'];
			}

			return self._map['sessions'];
		},

		set: function(value) {
			self._changes['sessions'] = value;
		}
	});

	
	if(typeof setMap.variants != 'undefined' && setMap.variants !== null) {
		if(Array.isArray(setMap.variants)) {
			setMap.variants = setMap.variants.map(function(object) {
                return new FireModelInstanceTestVariant(object, model.models.TestVariant, path + '/' + 'variants');
			});
		}
		else {
			setMap.variants = new FireModelInstanceTestVariant(setMap.variants, model.models.TestVariant, path + '/' + 'variants');
		}
	}
	

	Object.defineProperty(this, 'variants', {
		get: function() {
			if(typeof self._changes['variants'] != 'undefined') {
				return self._changes['variants'];
			}

			return self._map['variants'];
		},

		set: function(value) {
			self._changes['variants'] = value;
		}
	});


	FireModelInstance.call(this, setMap, model, path);
}
FireModelInstanceTest.prototype = Object.create(FireModelInstance.prototype);




FireModelInstanceTest.prototype.getSessions = function(queryMap, optionsMap) {
    var self = this;
	return this._model.models.TestSession._find(this._model.endpoint + '/' + this.id + '/sessions', queryMap, optionsMap)
        .then(function(modelInstances) {
            self.sessions = modelInstances;
            return modelInstances;
        })
};

FireModelInstanceTest.prototype.createSession = function(queryMap) {
    var self = this;
    return this._model.models.TestSession._create(this._model.endpoint + '/' + this.id + '/sessions', queryMap)
        .then(function(createdModelInstance) {
            if(!self.sessions) {
                self.sessions = [];
            }

            // TODO: How should we sort these associations?
            self.sessions.push(createdModelInstance);
            return createdModelInstance;
        });
};

FireModelInstanceTest.prototype.removeSession = function(modelInstanceOrUUID) {
    var UUID = _getUUID(modelInstanceOrUUID);

    var self = this;
    return this._model.models.TestSession._action('delete', this._model.endpoint + '/' + this.id + '/sessions/' + UUID)
        .then(function(removedModelInstance) {
            for(var i = 0, il = self.sessions.length; i < il; i++) {
                var modelInstance = self.sessions[i];

                if(modelInstance.id === UUID) {
                    self.sessions.splice(i, 1);
                    break;
                }
            }
            return removedModelInstance;
        });
};

FireModelInstanceTest.prototype.removeSessions = function(map) {
    var self = this;
    return this._model.models.TestSession._action('delete', this._model.endpoint + '/' + this.id + '/sessions', this._model._prepare(transformQueryMap(map)))
        .then(function(removedModelInstances) {
            var ids = removedModelInstances.map(function(modelInstance) {
                return modelInstance.id;
            });

            self.sessions = self.sessions.filter(function(modelInstance) {
                return (ids.indexOf(modelInstance.id) !== -1);
            });

            return removedModelInstances;
        });
};





FireModelInstanceTest.prototype.getVariants = function(queryMap, optionsMap) {
    var self = this;
	return this._model.models.TestVariant._find(this._model.endpoint + '/' + this.id + '/variants', queryMap, optionsMap)
        .then(function(modelInstances) {
            self.variants = modelInstances;
            return modelInstances;
        })
};

FireModelInstanceTest.prototype.createVariant = function(queryMap) {
    var self = this;
    return this._model.models.TestVariant._create(this._model.endpoint + '/' + this.id + '/variants', queryMap)
        .then(function(createdModelInstance) {
            if(!self.variants) {
                self.variants = [];
            }

            // TODO: How should we sort these associations?
            self.variants.push(createdModelInstance);
            return createdModelInstance;
        });
};

FireModelInstanceTest.prototype.removeVariant = function(modelInstanceOrUUID) {
    var UUID = _getUUID(modelInstanceOrUUID);

    var self = this;
    return this._model.models.TestVariant._action('delete', this._model.endpoint + '/' + this.id + '/variants/' + UUID)
        .then(function(removedModelInstance) {
            for(var i = 0, il = self.variants.length; i < il; i++) {
                var modelInstance = self.variants[i];

                if(modelInstance.id === UUID) {
                    self.variants.splice(i, 1);
                    break;
                }
            }
            return removedModelInstance;
        });
};

FireModelInstanceTest.prototype.removeVariants = function(map) {
    var self = this;
    return this._model.models.TestVariant._action('delete', this._model.endpoint + '/' + this.id + '/variants', this._model._prepare(transformQueryMap(map)))
        .then(function(removedModelInstances) {
            var ids = removedModelInstances.map(function(modelInstance) {
                return modelInstance.id;
            });

            self.variants = self.variants.filter(function(modelInstance) {
                return (ids.indexOf(modelInstance.id) !== -1);
            });

            return removedModelInstances;
        });
};




function FireModelTest($http, $q, models) {
	FireModel.call(this, $http, $q, models);

	this.endpoint = '/api/tests';
}
FireModelTest.prototype = Object.create(FireModel.prototype);

FireModelTest.prototype.parseResult = function(setMapOrList, path) {
	if(Object.prototype.toString.call(setMapOrList) === '[object Array]') {
		var self = this;
		return setMapOrList.map(function(setMap) {
			return new FireModelInstanceTest(setMap, self, path);
		});
	}
	else {
		return new FireModelInstanceTest(setMapOrList, this, path);
	}
};



app.factory('TestModel', ['$http', '$q', 'FireModels', function($http, $q, FireModels) {
	return new FireModelTest($http, $q, FireModels);
}]);

function FireModelInstanceTestParticipant(setMap, model, path) {
	var self = this;

	

	Object.defineProperty(this, 'id', {
		get: function() {
			if(typeof self._changes['id'] != 'undefined') {
				return self._changes['id'];
			}

			return self._map['id'];
		},

		set: function(value) {
			self._changes['id'] = value;
		}
	});

	
	if(typeof setMap.sessions != 'undefined' && setMap.sessions !== null) {
		if(Array.isArray(setMap.sessions)) {
			setMap.sessions = setMap.sessions.map(function(object) {
                return new FireModelInstanceTestSession(object, model.models.TestSession, path + '/' + 'sessions');
			});
		}
		else {
			setMap.sessions = new FireModelInstanceTestSession(setMap.sessions, model.models.TestSession, path + '/' + 'sessions');
		}
	}
	

	Object.defineProperty(this, 'sessions', {
		get: function() {
			if(typeof self._changes['sessions'] != 'undefined') {
				return self._changes['sessions'];
			}

			return self._map['sessions'];
		},

		set: function(value) {
			self._changes['sessions'] = value;
		}
	});


	FireModelInstance.call(this, setMap, model, path);
}
FireModelInstanceTestParticipant.prototype = Object.create(FireModelInstance.prototype);




FireModelInstanceTestParticipant.prototype.getSessions = function(queryMap, optionsMap) {
    var self = this;
	return this._model.models.TestSession._find(this._model.endpoint + '/' + this.id + '/sessions', queryMap, optionsMap)
        .then(function(modelInstances) {
            self.sessions = modelInstances;
            return modelInstances;
        })
};

FireModelInstanceTestParticipant.prototype.createSession = function(queryMap) {
    var self = this;
    return this._model.models.TestSession._create(this._model.endpoint + '/' + this.id + '/sessions', queryMap)
        .then(function(createdModelInstance) {
            if(!self.sessions) {
                self.sessions = [];
            }

            // TODO: How should we sort these associations?
            self.sessions.push(createdModelInstance);
            return createdModelInstance;
        });
};

FireModelInstanceTestParticipant.prototype.removeSession = function(modelInstanceOrUUID) {
    var UUID = _getUUID(modelInstanceOrUUID);

    var self = this;
    return this._model.models.TestSession._action('delete', this._model.endpoint + '/' + this.id + '/sessions/' + UUID)
        .then(function(removedModelInstance) {
            for(var i = 0, il = self.sessions.length; i < il; i++) {
                var modelInstance = self.sessions[i];

                if(modelInstance.id === UUID) {
                    self.sessions.splice(i, 1);
                    break;
                }
            }
            return removedModelInstance;
        });
};

FireModelInstanceTestParticipant.prototype.removeSessions = function(map) {
    var self = this;
    return this._model.models.TestSession._action('delete', this._model.endpoint + '/' + this.id + '/sessions', this._model._prepare(transformQueryMap(map)))
        .then(function(removedModelInstances) {
            var ids = removedModelInstances.map(function(modelInstance) {
                return modelInstance.id;
            });

            self.sessions = self.sessions.filter(function(modelInstance) {
                return (ids.indexOf(modelInstance.id) !== -1);
            });

            return removedModelInstances;
        });
};




function FireModelTestParticipant($http, $q, models) {
	FireModel.call(this, $http, $q, models);

	this.endpoint = '/api/test-participants';
}
FireModelTestParticipant.prototype = Object.create(FireModel.prototype);

FireModelTestParticipant.prototype.parseResult = function(setMapOrList, path) {
	if(Object.prototype.toString.call(setMapOrList) === '[object Array]') {
		var self = this;
		return setMapOrList.map(function(setMap) {
			return new FireModelInstanceTestParticipant(setMap, self, path);
		});
	}
	else {
		return new FireModelInstanceTestParticipant(setMapOrList, this, path);
	}
};



app.factory('TestParticipantModel', ['$http', '$q', 'FireModels', function($http, $q, FireModels) {
	return new FireModelTestParticipant($http, $q, FireModels);
}]);

function FireModelInstanceTestSession(setMap, model, path) {
	var self = this;

	

	Object.defineProperty(this, 'id', {
		get: function() {
			if(typeof self._changes['id'] != 'undefined') {
				return self._changes['id'];
			}

			return self._map['id'];
		},

		set: function(value) {
			self._changes['id'] = value;
		}
	});

	
	if(typeof setMap.test != 'undefined' && setMap.test !== null) {
		if(Array.isArray(setMap.test)) {
			setMap.test = setMap.test.map(function(object) {
                return new FireModelInstanceTest(object, model.models.Test, path + '/' + 'tests');
			});
		}
		else {
			setMap.test = new FireModelInstanceTest(setMap.test, model.models.Test, path + '/' + 'tests');
		}
	}
	

	Object.defineProperty(this, 'test', {
		get: function() {
			if(typeof self._changes['test'] != 'undefined') {
				return self._changes['test'];
			}

			return self._map['test'];
		},

		set: function(value) {
			self._changes['test'] = value;
		}
	});

	
	if(typeof setMap.participant != 'undefined' && setMap.participant !== null) {
		if(Array.isArray(setMap.participant)) {
			setMap.participant = setMap.participant.map(function(object) {
                return new FireModelInstanceTestParticipant(object, model.models.TestParticipant, path + '/' + 'participants');
			});
		}
		else {
			setMap.participant = new FireModelInstanceTestParticipant(setMap.participant, model.models.TestParticipant, path + '/' + 'participants');
		}
	}
	

	Object.defineProperty(this, 'participant', {
		get: function() {
			if(typeof self._changes['participant'] != 'undefined') {
				return self._changes['participant'];
			}

			return self._map['participant'];
		},

		set: function(value) {
			self._changes['participant'] = value;
		}
	});

	

	Object.defineProperty(this, 'variant', {
		get: function() {
			if(typeof self._changes['variant'] != 'undefined') {
				return self._changes['variant'];
			}

			return self._map['variant'];
		},

		set: function(value) {
			self._changes['variant'] = value;
		}
	});

	

	Object.defineProperty(this, 'createdAt', {
		get: function() {
			if(typeof self._changes['createdAt'] != 'undefined') {
				return self._changes['createdAt'];
			}

			return self._map['createdAt'];
		},

		set: function(value) {
			self._changes['createdAt'] = value;
		}
	});


	FireModelInstance.call(this, setMap, model, path);
}
FireModelInstanceTestSession.prototype = Object.create(FireModelInstance.prototype);



FireModelInstanceTestSession.prototype.getTest = function(queryMap, optionsMap) {
    var self = this;
    return this._model.models.Test._find(this._model.endpoint + '/' + this.id + '/test', queryMap, optionsMap)
        .then(function(modelInstances) {
            if(modelInstances && modelInstances.length) {
                self.test = modelInstances[0];
                return modelInstances[0];
            }
            else {
                return null;
            }
        });
};

FireModelInstanceTestSession.prototype.createTest = function(queryMap) {
    var self = this;
    return this._model.models.Test._create(this._model.endpoint + '/' + this.id + '/test', queryMap)
        .then(function(modelInstance) {
            self.test = modelInstance;
            return modelInstance;
        });
};

FireModelInstanceTestSession.prototype.removeTest = function() {
    var self = this;
    return this._model.models.Test._action('delete', this._model.endpoint + '/' + this.id + '/test')
        .then(function(removeModelInstance) {
            self.test = null;
            return removeModelInstance;
        });
};





FireModelInstanceTestSession.prototype.getParticipant = function(queryMap, optionsMap) {
    var self = this;
    return this._model.models.TestParticipant._find(this._model.endpoint + '/' + this.id + '/participant', queryMap, optionsMap)
        .then(function(modelInstances) {
            if(modelInstances && modelInstances.length) {
                self.participant = modelInstances[0];
                return modelInstances[0];
            }
            else {
                return null;
            }
        });
};

FireModelInstanceTestSession.prototype.createParticipant = function(queryMap) {
    var self = this;
    return this._model.models.TestParticipant._create(this._model.endpoint + '/' + this.id + '/participant', queryMap)
        .then(function(modelInstance) {
            self.participant = modelInstance;
            return modelInstance;
        });
};

FireModelInstanceTestSession.prototype.removeParticipant = function() {
    var self = this;
    return this._model.models.TestParticipant._action('delete', this._model.endpoint + '/' + this.id + '/participant')
        .then(function(removeModelInstance) {
            self.participant = null;
            return removeModelInstance;
        });
};





function FireModelTestSession($http, $q, models) {
	FireModel.call(this, $http, $q, models);

	this.endpoint = '/api/test-sessions';
}
FireModelTestSession.prototype = Object.create(FireModel.prototype);

FireModelTestSession.prototype.parseResult = function(setMapOrList, path) {
	if(Object.prototype.toString.call(setMapOrList) === '[object Array]') {
		var self = this;
		return setMapOrList.map(function(setMap) {
			return new FireModelInstanceTestSession(setMap, self, path);
		});
	}
	else {
		return new FireModelInstanceTestSession(setMapOrList, this, path);
	}
};



app.factory('TestSessionModel', ['$http', '$q', 'FireModels', function($http, $q, FireModels) {
	return new FireModelTestSession($http, $q, FireModels);
}]);

function FireModelInstanceTestVariant(setMap, model, path) {
	var self = this;

	

	Object.defineProperty(this, 'id', {
		get: function() {
			if(typeof self._changes['id'] != 'undefined') {
				return self._changes['id'];
			}

			return self._map['id'];
		},

		set: function(value) {
			self._changes['id'] = value;
		}
	});

	

	Object.defineProperty(this, 'name', {
		get: function() {
			if(typeof self._changes['name'] != 'undefined') {
				return self._changes['name'];
			}

			return self._map['name'];
		},

		set: function(value) {
			self._changes['name'] = value;
		}
	});

	

	Object.defineProperty(this, 'numberOfParticipants', {
		get: function() {
			if(typeof self._changes['numberOfParticipants'] != 'undefined') {
				return self._changes['numberOfParticipants'];
			}

			return self._map['numberOfParticipants'];
		},

		set: function(value) {
			self._changes['numberOfParticipants'] = value;
		}
	});

	
	if(typeof setMap.test != 'undefined' && setMap.test !== null) {
		if(Array.isArray(setMap.test)) {
			setMap.test = setMap.test.map(function(object) {
                return new FireModelInstanceTest(object, model.models.Test, path + '/' + 'tests');
			});
		}
		else {
			setMap.test = new FireModelInstanceTest(setMap.test, model.models.Test, path + '/' + 'tests');
		}
	}
	

	Object.defineProperty(this, 'test', {
		get: function() {
			if(typeof self._changes['test'] != 'undefined') {
				return self._changes['test'];
			}

			return self._map['test'];
		},

		set: function(value) {
			self._changes['test'] = value;
		}
	});


	FireModelInstance.call(this, setMap, model, path);
}
FireModelInstanceTestVariant.prototype = Object.create(FireModelInstance.prototype);



FireModelInstanceTestVariant.prototype.getTest = function(queryMap, optionsMap) {
    var self = this;
    return this._model.models.Test._find(this._model.endpoint + '/' + this.id + '/test', queryMap, optionsMap)
        .then(function(modelInstances) {
            if(modelInstances && modelInstances.length) {
                self.test = modelInstances[0];
                return modelInstances[0];
            }
            else {
                return null;
            }
        });
};

FireModelInstanceTestVariant.prototype.createTest = function(queryMap) {
    var self = this;
    return this._model.models.Test._create(this._model.endpoint + '/' + this.id + '/test', queryMap)
        .then(function(modelInstance) {
            self.test = modelInstance;
            return modelInstance;
        });
};

FireModelInstanceTestVariant.prototype.removeTest = function() {
    var self = this;
    return this._model.models.Test._action('delete', this._model.endpoint + '/' + this.id + '/test')
        .then(function(removeModelInstance) {
            self.test = null;
            return removeModelInstance;
        });
};





function FireModelTestVariant($http, $q, models) {
	FireModel.call(this, $http, $q, models);

	this.endpoint = '/api/test-variants';
}
FireModelTestVariant.prototype = Object.create(FireModel.prototype);

FireModelTestVariant.prototype.parseResult = function(setMapOrList, path) {
	if(Object.prototype.toString.call(setMapOrList) === '[object Array]') {
		var self = this;
		return setMapOrList.map(function(setMap) {
			return new FireModelInstanceTestVariant(setMap, self, path);
		});
	}
	else {
		return new FireModelInstanceTestVariant(setMapOrList, this, path);
	}
};



app.factory('TestVariantModel', ['$http', '$q', 'FireModels', function($http, $q, FireModels) {
	return new FireModelTestVariant($http, $q, FireModels);
}]);


app.service('FireModels', ['$http', '$q', function($http, $q) {
	
	this.Test = new FireModelTest($http, $q, this);
	
	this.TestParticipant = new FireModelTestParticipant($http, $q, this);
	
	this.TestSession = new FireModelTestSession($http, $q, this);
	
	this.TestVariant = new FireModelTestVariant($http, $q, this);
	
}]);
function unwrap(promise, initialValue) {
    var value = initialValue;

    promise.then(function(newValue) {
        angular.copy(newValue, value);
    });

    return value;
};

app.service('fire', ['FireModels', '$http', '$q', function(FireModels, $http, $q) {
    function unwrap(promise, initialValue) {
        var value = initialValue;

        promise.then(function(newValue) {
            angular.copy(newValue, value);
        });

        return value;
    };
    this.unwrap = unwrap;
    this.models = FireModels;
}]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });



    $routeProvider.when('/', {
        templateUrl: '/templates/start.html',
        controller: 'StartController',
        resolve: {
        
            TextOfButtonTest: ['TextOfButtonTest', function(TextOfButtonTest) {
                return TextOfButtonTest.participate();
            }],
        
        }
    });


}]);
app.service('ChannelService', ['WebSocketService', '$rootScope', function(WebSocketService, $rootScope) {
	var channelsMap = {};

	function getChannelAddress(channelId, channelType) {
		return (channelType + ':' + channelId);
	}

	this.registerChannel = function(channel) {
		channelsMap[getChannelAddress(channel.id, channel.type)] = channel;

		this.sendMessageOnChannel({
			event: '_subscribe'
		}, channel);
	};

	this.getChannel = function(channelId, channelType) {
		return channelsMap[getChannelAddress(channelId, channelType)];
	};

	this.getUnknownMessage = function(messageMap, channelMap) { //jshint ignore:line
		console.log('Unknown message.');
	};

	this.sendMessageOnChannel = function(message, channel) {
		return WebSocketService.send({
			channel: {
				type: channel.type,
				id: channel.id
			},
			message: message
		});
	};

	var self = this;
	WebSocketService.parsePacket = function(packet) {
		var channel = self.getChannel(packet.channel.id, packet.channel.type);
		if(channel) {
			if(channel.delegate) {
				$rootScope.$apply(function() {
					channel.delegate(packet.message);
				});
			}
			else {
				console.log('Warning: no delegate set on channel.');
			}
		}
		else {
			$rootScope.$apply(function() {
				self.getUnknownMessage(packet.message, packet.channel);
			});
		}
	};
}]);

app.service('WebSocketService', ['$location', '$timeout', function($location, $timeout) {
	var queue = [];

	var reconnectInterval = 1000;
	var reconnectDecay = 1.5;
	var reconnectAttempts = 0;
	var reconnectMaximum = 60 * 1000;
	var socket = null;

	var self = this;
	var onOpen = function () {
		if(queue && queue.length > 0) {
			var queue_ = queue;
			queue = null;

			queue_.forEach(function(message) {
				self.send(message);
			});
		}
	};

	var onError = function(error) {
		console.log('error');
		console.log(error);
	};

	var onClose = function(event) {
		$timeout(connect, Math.max(reconnectMaximum, reconnectInterval * Math.pow(reconnectDecay, reconnectAttempts)));
	};

	var onMessage = function(event) {
		var packet = JSON.parse(event.data);

		// TODO: Change this to an event emitter instead. Now it's only possible to delegate the packets to 1 listeners.

		if(self.parsePacket) {
			self.parsePacket(packet);
		}
	};

	function connect() {
		reconnectAttempts++;

		socket = new WebSocket('ws://' + $location.host() + ($location.port() ? ':' + $location.port() : ''));
		socket.onopen = onOpen;
		socket.onerror = onError;
		socket.onclose = onClose;
		socket.onmessage = onMessage;
	}

	this.send = function(message) {
		if(queue !== null) {
			queue.push(message);
		}
		else {
			console.log(socket);

			socket.send(JSON.stringify(message));
		}
	};
	this.parsePacket = null;

	connect();
}]);


/* global window, app */
app.service('_StorageService', [function _StorageService() {
	var storage = {};

	this.get = function(key) {
		if(typeof storage[key] != 'undefined') {
			return storage[key];
		}
		else {
			return window.localStorage.getItem(key);
		}
	};

	this.set = function(key, value) {
		try {
			window.localStorage.setItem(key, value);
		}
		catch(error) {
			storage[key] = value;
		}
	};

	this.unset = function(key) {
		if(typeof storage[key] != 'undefined') {
			delete storage[key];
		}
		else {
			window.localStorage.removeItem(key);
		}
	};
}]);

app.provider('TestsService', [function() {
	var _delegate = null;
	this.delegate = function(delegate) {
		_delegate = delegate;
	};

	this.$get = function() {
		return {
			participate: function(test, variant) {
				if(_delegate === null) {
					throw new Error('Please set the TestsService.delegate');
				}
				else if(typeof _delegate != 'function') {
					throw new Error('TestsService#delegate must be a function.');
				}
				else {
					_delegate(test, variant);
				}
			}
		};
	}
}]);


app.service('TextOfButtonTest', ['$q', '$http', '_StorageService', 'TestsService', function TextOfButtonTest($q, $http, _StorageService, TestsService) {
	var self = this;

	this.participate = function() {
		var variant = _StorageService.get('TextOfButtonTest');

		if(variant) {
			TestsService.participate('TextOfButtonTest', variant);
			return self;
		}
		else {
			var defer = $q.defer();

			$http.post('/tests/text-of-button-test')
				.success(function(data) {
					_StorageService.set('TextOfButtonTest', data.variant);

					TestsService.participate('TextOfButtonTest', data.variant);

					defer.resolve(self);
				})
				.error(function() {
					defer.reject(new Error());
				});

			return defer.promise;
		}
	};

	this.getVariant = function() {
		var variant = _StorageService.get('TextOfButtonTest');

		if(variant) {
			return variant;
		}
		else {
			throw new Error('Not participated');
		}
	};
}]);

