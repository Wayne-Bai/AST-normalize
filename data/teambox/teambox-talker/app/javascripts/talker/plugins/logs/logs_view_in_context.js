Talker.LogsViewInContext = function(){
  var self = this;
  
  self.onMessageInsertion = function(event){
    var room = event.room.id;
    var id = event.id;
    
    Talker.getLastInsertion().prepend(
      $("<a/>").addClass('log')
        .attr("href", "/rooms/" + room + "/logs/" + FormatHelper.getUrlDate(event.time) + "#event_" + id)
        .text("View in context")
    );
  }
}