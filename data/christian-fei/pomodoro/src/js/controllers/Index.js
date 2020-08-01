angular.module('app')
.controller('RootCtrl', function(constants){
  var vm = this
  vm.angularVersion = constants.version
  vm.build = constants.build
})