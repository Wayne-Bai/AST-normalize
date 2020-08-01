Template.status.helpers({
  currentUser: function() {
    return Session.get('user');
  },
  hasRoom: function() {
    return Session.get('room');
  },
  canPlay: function() {
    return Session.get('play');
  }
});

Template.status.events({
  "click .quit": function(event) {
    var room = Session.get('room');
    var user = Session.get('user');
    var enemy = Session.get('enemy');
    var msg = user + ' give up.';
    GameStream.emit('gameover', msg, user, enemy, room);
    event.preventDefault();
  }
});