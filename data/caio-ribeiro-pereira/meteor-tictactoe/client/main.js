var clearGameSession = function(msg, room) {
  if(Session.equals('room', room)) {
    if(msg) { alert(msg); }
    Session.set('enemy', null);
    Session.set('room', null);
    Session.set('playing', false);
    Session.set('main_menu', true);
    Session.set('weapon', GameLogic.X);
    $('.gameboard i').detach();
  }
}

var checkGameOver = function(status) {
  if(status) {
    var user = Session.get('user');
    var enemy = Session.get('enemy');
    var room = Session.get('room');
    if(status === GameLogic.D) {
      GameStream.emit('draw', user);
      alert('Draw game!');
    } else {
      if(status === Session.get('weapon')) {
        GameStream.emit('winner', user);
        alert('Winner: '+ user);
      } else {
        GameStream.emit('loser', user);
        alert('Loser: '+ user);
      }
    }
    GameStream.emit('gameover', null, user, enemy, room);
  }
}

var changeUserPlay = function(room, weapon) {
  if(Session.equals('room', room) && Session.equals('weapon', weapon)) {
    Session.set('play', true);
  }
}

var refreshBoard = function(room, weapon, row, col, status) {
  if(Session.equals('room', room)) {
    var board = $('.gameboard');
    var target = board.find('.row[data-row="'+ row +'"]');
    target = target.find('.col[data-col="'+ col +'"]');
    if(!target.contents().length) {
      target.html('<i class="'+ weapon +'"></i>');
      checkGameOver(status);
      if(!Session.equals('weapon', weapon)) {
        Session.set('play', true);
      }
    } else {
      alert('Try another area!');
    }
  }
}

var prepareGame = function(user, enemy, room) {
  if(Session.equals('user', user)) {
    if(confirm('Do you wanna play against '+ enemy +'?')) {
      Session.set('enemy', enemy);
      Session.set('weapon', GameLogic.O);
      Session.set('room', room);
      Session.set('play', false);
      Session.set('playing', true);
      GameStream.emit('start', user, enemy, room, GameLogic.X);
    } else {
      GameStream.emit('cancel', 'Game canceled', room);
    }
  }
}

GameStream.on('request', function(user, enemy, room) {
  prepareGame(user, enemy, room);
});

GameStream.on('end', function(msg, room) {
  clearGameSession(msg, room);
});

GameStream.on('play', function(room, weapon) {
  changeUserPlay(room, weapon);
});

GameStream.on('refresh', function(room, weapon, row, col, status) {
  refreshBoard(room, weapon, row, col, status);
});