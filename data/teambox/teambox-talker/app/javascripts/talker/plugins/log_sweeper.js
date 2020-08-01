Talker.LogSweeper = function(logElement) {
  var self = this;
  var maxLogSize = 50;
  
  self.onJoin = 
  self.onLeave = 
  self.onMessageReceived = function() {
    if (logElement.find("tr").size() <= maxLogSize) return;
    
    var element = logElement.find("tr:first");
    if (element.hasClass("timestamp")) {
      // If it's a timestamp we remove one more
      element.next("tr").remove();
    }
    element.remove();
  };
};
