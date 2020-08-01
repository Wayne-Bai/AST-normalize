Talker.LogsJoinLeave = function(){
  var plugin = this;
  
  plugin.onLeave = function(event) {
    Talker.insertNotice(event, h(event.user.name) + ' has left the room');
  }
  plugin.onJoin = function(event) {
    Talker.insertNotice(event, h(event.user.name) + ' has entered the room');
  }  
}
