function StatisticsBase($scope,Keyboard){
  var vm = this

  vm.hasNext = function(){ return true }
  vm.goToNext = vm.goToPrev = angular.noop

  var keyboard = new Keyboard()
  keyboard
    .when(37,function(){
      vm.goToPrev()
    })
    .when(39,function(){
      if(vm.hasNext()){
        vm.goToNext()
      }
    })

  ;(function registerInteractionEvents(){
    angular.element(document.body).on('keydown', keyboardShortcut)
  })();

  $scope.$on('$destroy', function(){
    angular.element(document.body).off('keydown', keyboardShortcut)
  })


  function keyboardShortcut(e){
    if( e.target.nodeName.toLowerCase() === 'input' ){
      return
    }
    keyboard.handle(e.keyCode)
  }

}
