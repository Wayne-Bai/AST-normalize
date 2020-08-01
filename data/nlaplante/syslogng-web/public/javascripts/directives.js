angular.module('syslogng-web')
	.directive('popover', ['$window', '$document', function ($window, $document) {

		return {
			restrict: 'E',
			transclude: true,
			templateUrl: 'views/template/popover.html',
			scope: {
				title: '@',
				position: '@',
				trigger: '@'
			},
			link: function (scope, element, attrs) {

				var trigger = $(scope.trigger),
					position = trigger.offset(),
					w = trigger.width(),
					h = trigger.height(),
					popoverElement = element.find('.popover');
				
				scope.visible = false;
				
				scope.style = {
					display: 'none',
					top: position.top + h + 5,
					left: position.left + w - 150,
					width: 200
				};
				
				scope.$watch('visible', function (newVal, oldVal) {
					if (newVal && newVal !== oldVal) {
						scope.style.display = 'block';
					}
					else if (!newVal && newVal !== oldVal) {
						scope.style.display = 'none';					
					}
				});

				$($window).on('resize', function (e) {
					scope.$apply(function (s) {
						var position = trigger.offset();
						s.style.top = position.top + trigger.height() + 5;
						s.style.left = position.left + trigger.width() - 150;
					});			
				});

				$($document).on('click', function (e) {

					var $target = $(e.target),
						isTrigger = $target.is(trigger),
						isInsidePopover = $target.parents('.popover').length,
						hide = !isTrigger && !isInsidePopover;
					
					scope.$apply(function (s) {
						s.visible = !hide;
					});

					if (hide) {
						trigger.removeClass('active');
					}
					else {
						trigger.addClass('active');
					}
				});
			}
		}
	}]);
