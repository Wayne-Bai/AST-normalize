"use strict";

var catalogModule = window.angular.module("catalogModule", []);

catalogModule.controller("CatalogCtrl", ["$scope", "$filter", "catalogDataService",
	function ($scope, $filter, catalogDataService) {
		$scope.catalog = catalogDataService.get();

		$scope.numberOfVisibleProducts = function () {
			/**
			 * The return expression breaks down like this...
			 * (catalog.products | filter:catalog.searchQuery | orderBy:catalog.sortOrder.type:catalog.sortOrder.reverse | startFrom:catalog.currentPage*catalog.productsPerPage | limitTo:catalog.productsPerPage).length
			**/

			return $filter("limitTo")($filter("startFrom")($filter("orderBy")($filter("filter")($scope.catalog.products, $scope.catalog.searchQuery), $scope.catalog.sortOrder.type, $scope.catalog.sortOrder.reverse), $scope.catalog.currentPage*$scope.catalog.productsPerPage), $scope.catalog.productsPerPage).length;
		};

		// When a search query is entered, reset the current page, so we can paginate through the filtered results.
		$scope.$watch("catalog.searchQuery", function (newValue, oldValue) {
			// Only reset if the value has actually changed. Don't reset on the initial assignment of $scope.catalog.
			// Resetting on initialisation will incorrectly set currentPage to 0 when navigating back to the catalog view from another view.
			if (newValue !== oldValue) {
				$scope.catalog.currentPage = 0;
			}
		});
	}
]);

catalogModule.directive("catalogProductList", [function () {
		return {
			restrict: "E",
			templateUrl: "/silverstripe-angularjs-modeladmin/javascript/modules/catalog/catalogProductList.html"
		};
	}
]);

catalogModule.directive("catalogPagination", ["catalogDataService",
	function (catalogDataService) {
		return {
			restrict: "E",
			templateUrl: "/silverstripe-angularjs-modeladmin/javascript/modules/catalog/catalogPagination.html",
			link: function (scope) {
				scope.catalog = catalogDataService.get();

				scope.paginate = function (event, nextPage) {
					event.preventDefault();

					if (window.$(event.target).closest(".step").is(".disabled")) {
						return;
					}

					scope.catalog.currentPage = nextPage;
				};

				scope.numberOfPages = function () {
					var numberOfPages = Math.ceil(scope.catalog.products.length / scope.catalog.productsPerPage);
					return isNaN(numberOfPages) ? 0 : numberOfPages;
				};

				scope.getNumberOfFilteredResults = function (n) {
					var num = isNaN(n) ? 0 : n;
					return new Array(Math.ceil(num));
				};
			}
		};
	}
]);
