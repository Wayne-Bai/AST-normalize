module.exports = {};
var handlers = {};

// State:isolate state and access it from this file

// state, game logic & data handling

// var io;

// sample rooms object:
// { room1: 5, room2: 0, ... }
var rooms = {};
var timers = {}; 

// var xpToLevel = require('./level').level;

var enemies = require('./enemy').methods;
var users = require('./user').methods;

var mongoose = require('mongoose');
var Enemy = mongoose.model('Enemy');

module.exports.registerAll = function(io, socket) {

  var getEnemyData = function(enemyId) {
    return Enemy.findByIdAsync(enemyId);
  };

  var movePassiveEnemies = function(mapId) {

    var nums = [];

    for (var room in rooms) {
      if (rooms[room] && enemies.exist(room) && mapId === room) {
        for (var dbId in enemies.get(room)) {
          for (var id in enemies.get(room, dbId)){
            if (!enemies.isAttacking(room, dbId, id)) {
              nums[id] = {
                dir: Math.floor(Math.random() * 4),
                passive: true
              };
            } 
            else {
              nums[id] = {
                dir: void 0,
                passive: false
              };
            }
          }
        }
        emitToRoom(room, 'move enemies',{
          param: 'move the enemies!',
          nums: nums 
        });
      }
    }
  };

  var distance = function(enemy, player) {
    return Math.sqrt(Math.pow(enemy[0] - player[0], 2) + Math.pow(enemy[1] - player[1], 2));
  };

  var serverMessage = function(message) {
    io.emit('message', {
      user: 'Overlord',
      message: message
    });
  };

  var emitToRoom = function(room, event, data) {
    io.in(room).emit(event, data);
  };
//emitToRoom()
  var emitToAll = function(event, data) {
    io.emit(event, data);
  };

  handlers.login = function(user) {
    socket.user = user;
    users.login(user)
    .then(function() {
      serverMessage(user + ' has joined the game!');
    });
  };

  handlers.disconnect = function() {
    //console.log('a wild troll disappears');
    users.logout({
      user: socket.user
    });

    emitToAll('leave', {
      user: socket.user
    });
  };

  handlers.gameOver = function(data) {
    var room = data.room;
    var user = data.user;
    console.log('game over!!!!', data)

    users.gameOver(user, data);
    emitToRoom(room, 'gameOver', {
      user: user
    });
  };

  handlers.enemyMoving = function(data) {
    var room = data.room;
    var dbId = data._id;
    var enemyId = data.enemy;

    if (enemies.exist(room, dbId, enemyId)) {

      var enemy = enemies.get(room, dbId, enemyId);

      if (enemy) {
        enemy.position[0] = data.x;
        enemy.position[1] = data.y;

        if (enemy.attacking) {
          if (distance([data.x, data.y],[enemy.attacking.x, enemy.attacking.y]) > 37) {

            var num = enemies.calcDirection(enemy);
            emitToRoom(room, 'enemyMoving', {
              dir: num,
              dbId: dbId,
              serverId: enemyId
            });
          }
        }

        
      }



    }
  };

  handlers.resetAll = function(data) {
    users.resetAll(data.user);
  };

  handlers.freeXp = function(data) {
    var user = data.user;
    var xp = data.xp;

    var message = users.freeXp(user, xp);

    serverMessage(message);
  };

  handlers.regenerateEnemy = function(room, dbId, enemyId, toRegenerate) {
    // timeToRegenerate in DB is in seconds
    setTimeout(function() {
      enemies.regenerate(room, dbId, enemyId, toRegenerate);
      toRegenerate.room = room;
      toRegenerate.dbId = dbId;
      toRegenerate.enemyId = enemyId;
      emitToRoom(room, 'revive enemy', toRegenerate);
    }, toRegenerate.timeToRegenerate * 1000);
  }

  handlers.enemyDies = function(data) {
    var room = data.room;
    var user = data.user;
    var dbId = data._id;
    var enemyId = data.enemy;
    var xp = data.xp;

    var toRegenerate = enemies.get(room, dbId, enemyId);
    // simply regenerate with health = 5 and position = last position at this point and not attacking
    toRegenerate.health = 5;
    delete toRegenerate.attacking;
    handlers.regenerateEnemy(room, dbId, enemyId, toRegenerate);

    enemies.killEnemy(room, dbId, enemyId);
    emitToRoom(room, 'derender enemy', data);

    var message = user + ' has slain a ' + data.enemyName + ' for ' + xp + ' exp!';
    var userData = users.awardXp(user, xp);

    if (userData) {
      if (userData.levelUp) {
        message = user + ' reached level ' + users.level(user) + '!';
        serverMessage(message);
      }
      emitToRoom(room, 'addXP', {
        user: userData
      });
    }

  };

  handlers.damageEnemy = function(data) {
    var room = data.room;
    var dbId = data._id;
    var enemyId = data.enemy;
    var user = data.user;

    if (enemies.damage(room, dbId, enemyId)) {
      // enemy dies
      handlers.enemyDies(data);
    } else {
      enemies.attack(room, dbId, enemyId, users.get(user));
    }

    emitToRoom(room, 'damageEnemy', {
      serverId: data.enemy
    });
  };

  handlers.shoot = function(data) {
    emitToRoom(data.mapId, 'shoot', data);
  };

  handlers.stopEnemy = function(data) {

    var room = data.room;
    var dbId = data._id;
    var enemyId = data.enemy;

    enemies.setPosition(room, dbId, enemyId, [data.x, data.y]);
  };

  handlers.join = function(data) {
    var room = data.mapId;
    var user = data.user;
    var x = data.x;
    var y = data.y;
    var creatures = data.enemies;

    socket.join(room);

    rooms[room] && rooms[room]++;
    rooms[room] = rooms[room] || 1;

    //console.log('joined', rooms[room]);

    if (rooms[room] === 1) {
      // var passiveEnemyTimer = setInterval(movePassiveEnemies, 2500);
      var passiveEnemyTimer = setInterval(function() {
        movePassiveEnemies(room);
      }, 2500);
      timers[room] = passiveEnemyTimer;
    }

    users.extend(user, {
      name: user,
      room: room,
      x: x,
      y: y
    });

    // console.log(user + ' joined ' + room + ' in ' + x + ',' + y);

    if (creatures.length === 0) {
      emitToRoom(room, room, {
        user: user,
        others: users.others(user, room),
        x: x,
        y: y
      });

    } else if (enemies.exist(room)) {
      emitToRoom(room, room, {
        user: user,
        others: users.others(user, room),
        x: x,
        y: y,
        enemies: enemies.get(room)
      });

    } else {
      enemies.initRoom(room);
      for (var i = 0, _len = creatures.length; i < _len; i++) {
        var dbId = data.enemies[i].id;
        enemies.initDbId(room, dbId);

        for (var j = 0, _len2 = creatures[i].count; j < _len2; j++) {
          enemies.initEnemyId(room, dbId, j);
          enemies.setPosition(room, dbId, j, data.positions[dbId][j]);
        }
      }

      var callbacksFired = 0;

      for (var i = 0, _len = creatures.length; i < _len; i++) {

        var count = creatures[i].count;
        var enemyId = creatures[i].id;

        getEnemyData(enemyId).then(function(result){
          enemies.pushInfo(enemies.get(room, enemyId), {
            health: result.health,
            name: result.name,
            _id: result._id,
            png: result.png,
            speed: result.speed,
            xp: result.xp,
            timeToRegenerate: result.timeToRegenerate,
            attacking: false
          });

          callbacksFired++;
          if (callbacksFired === _len) {
            emitToRoom(room, room, {
              user: user,
              others: users.others(user, room),
              x: x,
              y: y,
              enemies: enemies.get(room)
            });
          }
        });
      }
    }
  };

  handlers.leave = function(data) {  
    var user = data.user;
    var room = data.mapId;


    rooms[room] && rooms[room]--;

    if (rooms[room] === 0) {
      //console.log('cleared interval');
      clearInterval(timers[room]);
    }

    emitToRoom(room, 'leave', {
      user: user
    });

    enemies.unattack(users.get(user), room);

    socket.leave(room);
    //console.log(user + ' left ' + room, rooms[room]);
  };

  handlers.move = function(data) {
    var user = data.user;
    var room = data.room;
    var dir = data.dir;
    
    var x = data.x;
    var y = data.y;

    // console.log(user + ' moves to ' + x + ',' + y);
    var set = users.setPosition(user, [x, y]);

    if (set) {
      emitToRoom(room, 'move', {
        user: user,
        dir: dir,
        x: x,
        y: y
      });
    }
  };

  handlers.message = function(data) {  
    var message = data.message.message;
    var user = data.message.user;

    //console.log('recieved message ' + message);

    emitToAll('message', {
      message: message,
      user: user
    });
  };


};

module.exports.handlers = handlers;







