Talker.users = [];

// keeps track of active users in the room in Talker.users
Talker.Users = function(element) {
  var self = this;
  
  self.onLoaded = function() {
    self.onMessageReceived =
    self.onJoin = function(event) {
      self.add(event.user);
    }
    
    self.onLeave = function(event) {
      self.remove(event.user);
    }
    
    self.onUsers = function(event) {
      Talker.users = event.users;
    }
    // private
    self.add = function(user) {
      self.remove(user);
      Talker.users.push(user);
    };
  
    self.remove = function(user) {
      Talker.users = _.reject(Talker.users, function(u) { return u.id == user.id });
    };
  };
}

