/*
This controller handles the restaurant list. 
It listens for filter selection on the home page and update 
the list accordingly. It has also expose sorting 
functionalities to rank restaurant by Name, rating or price.
*/
app.controller('RestaurantCtrl', ['$scope', '$http', 'globalVariable',
	function RestaurantCtrl($scope, $http, globalVariable) {

		$scope.search = {}
		$scope.CUISINE_OPTIONS = globalVariable.cuisine

		//watch 'search' property for build url filtering  
		$scope.$watch('search', function (search) {

			//default url
			var url = '/api/cobject/v0/restaurant'
			var first = false;

			//support function for build parametric url 
			var setUrl = function (first, url, property, name) {
				if (first || url.indexOf('?') != -1)
					url = url + '&' + name + '=' + property
				else {
					url = url + '?' + name + '=' + property
					first = true
				}
				return url;
			}

			if (search.price) {
				url = setUrl(first, url, search.price, 'price')
			}
			if (search.cusine) {
				url = setUrl(first, url, search.cusine, 'cusine')
			}
			if (search.rating) {
				url = setUrl(first, url, search.rating, 'actions.ratings.avg')
			}

			//get the restaurant filtered
			$http({
				method: 'GET',
				url: url
			}).
			success(function (data, status) {
				$scope.restaurants = data.data;
				//default sorting value
				$scope.order = 'name'
			}).
			error(function (data, status) {
				$scope.error = 'Ops Something went wrong'
			});
		}, true)

		//function for added class on active element for sorting restaurant in table
		$scope.orderIs = function (order) {
			return order === $scope.order;
		}
}])