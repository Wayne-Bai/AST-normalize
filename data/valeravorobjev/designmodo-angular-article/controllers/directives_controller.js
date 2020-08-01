angular.module('angular-article').controller('DirectivesController',
    ['$scope', '$routeSegment','$sce', function ($scope, $routeSegment, $sce) {

        $scope.$routeSegment = $routeSegment;

        $scope.alerts = [
            {
                isSuccess: true,
                header: 'Success message',
                text: $sce.trustAsHtml('Something some some some text text text')
                },
            {
                isSuccess: 'info',
                header: 'Info message',
                text: $sce.trustAsHtml('Something some some some text text text')
            },
            {
                isSuccess: false,
                header: 'Error message',
                text: $sce.trustAsHtml('Something some some some text text text')
            },
            {
                isSuccess: 'warning',
                header: 'Warning message',
                text: $sce.trustAsHtml('Something some some some text text text')
            }
        ];

        $scope.alert = {
            isSuccess: false,
            header: 'Custom body error message'
        };

        $scope.isModalOpen = false;

        $scope.openModal = function(){
            if (!$scope.isModalOpen){
                $scope.isModalOpen = true;
            }
        };

        $scope.tags = ['C++', 'Java'];

        $scope.spinnerValue = 11;
        $scope.sliderValue = 11;


    }]);