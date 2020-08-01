angular.module('wiz.validation.notEqualTo')

	.service('wizNotEqualToSvc', ['$filter', function ($filter) {
		this.values = [];

		this.cleanup = function () {
			this.values = [];
		};

		this.addValue = function (value) {
			if (typeof value.value === "undefined") {
				value.value = "";
			}

			var existingValue = false;
			for (var i = 0; i < this.values.length; i++) {
				if (this.values[i].name === value.name) {
					this.values[i] = value;
					existingValue = true;
					break;
				}
			}
			if (!existingValue) {
				this.values.push(value);
			}
		};

		this.isEqual = function (group) {
			var isEqual = true;
			var groupValues = $filter('filter')(this.values, { group: group }, true);
			for (var i = 0; i < groupValues.length; i++) {
				if (groupValues[i].value !== groupValues[0].value) {
					isEqual = false;
					break;
				}
			}
			return isEqual;
		};
	}]);