angular.module('app')
.controller('SettingsCtrl', function(Settings,Trello,utils){
  var vm = this

  Settings.get().then(function(settings){
    vm.settings = settings
  })

  Settings.changed(function(settings){
    if( !settings ){ return }
    vm.settings = settings
  })

  vm.toggle = function(prop){
    if( ['tickingSoundEnabled','ringingSoundEnabled'].indexOf(prop)>=0 ){
      if( vm.settings.soundsEnabled ){
        Settings.toggle(prop)
      }
    }else{
      Settings.toggle(prop)
    }
  }

  vm.todayEncoded = encodeURIComponent( utils.getCurrentDay() )

  vm.trello = Trello
})
