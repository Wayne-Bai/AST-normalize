define(['./module'], function (controllers) {
    'use strict';
    controllers.controller('AppCtrl2', ['$scope',function ($scope) {
		$scope.fruitOptions = {
			dataSource : {
				data : [{id: 1, name: "Apples"}, {id: 2, name: "Oranges"}]
			},
			dataTextField: "name",
			dataValueField: "id",
			placeholder: "Type 'Apples' or 'Oranges'",
			separator: ", ",
		}

		$scope.buttonCounter = 0;
		$scope.buttonClicked = function() {
			$scope.buttonCounter++;
		}

		$scope.thingsOptions = {
			dataSource: {
      			data: [{ name: "Thing 1", id: 1 },{ name: "Thing 2", id: 2 },{ name: "Thing 3", id: 3 }]
			},
    		dataTextField: "name",
    		dataValueField: "id",
    		optionLabel: "Select A Thing"
		}
    }]);
});