angular.module('wiz.validation.file')

	.directive('wizValFile', function () {
		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {
				// array of valid file types e.g ['image/jpeg','image/gif']
				fileTypes: '=wizValFileTypes',
				// maximum file size in bytes
				fileSize: '=wizValFileSize',
				// number of files integer
				fileNumber: '=wizValFileNumber'
			},
			link: function (scope, elem, attrs, ngModel) {

				elem.bind('change', function () {
					validate(elem[0].files);
				});

				function validate(files) {
					var validType = true;
					var validSize = true;
					var validNumber = true;

					// if file type attribute exists check it.
					if (angular.isUndefined(scope.fileTypes)) {
						scope.fileTypes = [];
					}

					// if file number is not defined set it to one.
					if (angular.isDefined(scope.fileNumber) && files.length > scope.fileNumber) {
						validNumber = false;
					}

					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						// Check file type and size of each file
						if (scope.fileTypes.indexOf(file.type) === -1 && scope.fileTypes.length > 0) {
							validType = false;
						}
						if (angular.isNumber(scope.fileSize) && file.size > scope.fileSize) {
							validSize = false;
						}
						if (!validType || !validSize) {
							break;
						}
					}

					ngModel.$setValidity('wizValFileTypes', validType);
					ngModel.$setValidity('wizValFileSize', validSize);
					ngModel.$setValidity('wizValFileNumber', validNumber);
				}
			}
		};
	});