angular.module('app')
.service('Notifications', function($timeout,Settings,constants){
  var self = this

  var settings = {}

  var permissionLevels = {}
  permissionLevels[notify.PERMISSION_GRANTED] = 0
  permissionLevels[notify.PERMISSION_DEFAULT] = 1
  permissionLevels[notify.PERMISSION_DENIED] = 2

  Settings.get().then(function(_settings){
    settings = _settings
  })

  Settings.changed(function(_settings){
    settings = _settings
  })

  self.isSupported = function(){
    return notify.isSupported
  }

  self.permissionLevel = function(){
    return permissionLevels[notify.permissionLevel()]
  }

  self.requestPermission = function(cb) {
    notify.requestPermission(function() {
      $timeout(cb || angular.noop,0)
    })
  }

  self.createNotification = function(title,body,icon){
    if( !settings.notificationsEnabled ){
      return
    }
    if( self.permissionLevel() !== 0 ){
      self.requestPermission(function(){
        cn.apply(self, arguments)
      })
    }else{
      cn.apply(self, arguments)
    }
  }

  function cn(title,body,icon){
    var n = notify.createNotification(title || 'Pomodoro', {body: body || 'Body', icon: icon || '/favicon.png'})
    $timeout(function(){
      n.close()
    }, constants.notificationDismissTimeout)
  }
})
