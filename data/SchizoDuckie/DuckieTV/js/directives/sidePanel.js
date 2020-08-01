DuckieTV.factory('SidePanelState', function() {

    var service = {
        state: {
            isShowing: false,
            isExpanded: false
        },
        show: function() {
            document.body.style.overflowY = 'hidden';
            document.body.scrollTop = 0;
            service.state.isShowing = true;
            service.state.isExpanded = false;
        },
        hide: function() {
            document.body.style.overflowY = 'auto';
            service.state.isShowing = false;
            service.state.isExpanded = false;
        },
        expand: function() {
            service.state.isExpanded = true;
        },
        contract: function() {
            service.state.isExpanded = false;
        }
    };
    return service;
})

.directive('sidepanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/sidepanel/sidepanel.html',
        controllerAs: 'panel',
        bindToController: true,
        transclude: true,

        controller: function($rootScope, $scope, SidePanelState) {
            var panel = this;

            this.isShowing = false;
            this.isExpanded = false;

            Object.observe(SidePanelState.state, function(newValue) {
                panel.isShowing = newValue[0].object.isShowing;
                panel.isExpanded = newValue[0].object.isExpanded;
                $scope.$applyAsync();
            })
            if (SidePanelState.state.isShowing) {
                this.isShowing = true;
            }
            if (SidePanelState.state.isExpanded) {
                this.isExpanded = true;
            }

            this.toggle = function() {
                this.isShowing ? SidePanelState.hide() : SidePanelState.show();
            };
            this.hide = function() {
                SidePanelState.hide();
            };
        }
    }
})

/**
 * Click trap directive that catches clicks outside the sidepanel and hides it.
 */
.directive('clicktrap', ["SidePanelState",
    function(SidePanelState) {
        return {
            restrict: 'E',
            link: function($scope, iElement) {
                iElement[0].onclick = function() {
                    if (SidePanelState.state.isShowing) {
                        SidePanelState.hide();
                    }
                }
            }
        }
    }
]);