appServices.factory('ExpensesService', function($http, $q, Options) {
	return {
		create: function(expense) {
			var deferred = $q.defer();

			$http.post(Options.baseUrl + '/expenses', expense).success(function(data) {
				deferred.resolve(data);
			}).error(function(data, status) {
				deferred.reject(data);
			});

			return deferred.promise;
		},

		readAllFromSheet: function(sheet_id) {
			var deferred = $q.defer();

			$http.get(Options.baseUrl + '/expenses/' + sheet_id).success(function(data) {
				deferred.resolve(data);
			}).error(function(data, status) {
				deferred.reject(data);
			});

			return deferred.promise;
		},

		read: function(sheet_id, id) {
			var deferred = $q.defer();

			$http.get(Options.baseUrl + '/expenses/' + sheet_id + '/' + id).success(function(data) {
				deferred.resolve(data);
			}).error(function(data, status) {
				deferred.reject(data);
			});

			return deferred.promise;
		},

		update: function(expense) {
			var deferred = $q.defer();

			$http.put(Options.baseUrl + '/expenses', expense).success(function(data) {
				deferred.resolve(data);
			}).error(function(data, status) {
				deferred.reject(data);
			});

			return deferred.promise;
		},

		delete: function(sheet_id, id) {
			var deferred = $q.defer();

			$http.delete(Options.baseUrl + '/expenses/' + sheet_id + '/' + id).success(function(data) {
				deferred.resolve(data);
			}).error(function(data, status) {
				deferred.reject(data);
			});

			return deferred.promise;
		}
	}
});