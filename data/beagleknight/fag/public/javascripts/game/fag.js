var NORMAL_MODE = 0;
var EXTREME_MODE = 1;
var DEBUG_MODE = 9;

$(document).ready(function() {
var begin = new Date().getTime();
var game = $('#canvas').game();
var difficulty = 0;
var new_difficulty = 0;
$('#score_enemies').val(0);
$('#score_time').val(0);

game.init = function() {
  var map = new TileMap(21,21,30,30,0,3);
  for(var i = 0; i < map.rows; i++) {
    for(var j = 0; j < map.cols; j++) {
      map.map[i][j] = rand(6)-1; 
    } 
  }
  for(var i = 1; i <= 6; i++) {
    map.add_tile('javascripts/game/sprites/space'+i+'.gif', 30, 30); 
  }
  
  game.addObject('map', map);
  game.addObject('player', new Player(300, 550, 38, 43));

  game.eventManager.assign('move_left', KEYBOARD, LEFT_ARROW);
  game.eventManager.assign('move_right', KEYBOARD, RIGHT_ARROW);
  game.eventManager.assign('move_up', KEYBOARD, UP_ARROW);
  game.eventManager.assign('move_down', KEYBOARD, DOWN_ARROW);

  //game.eventManager.assign('move_left', KEYBOARD, MINUS_A);
  //game.eventManager.assign('move_right', KEYBOARD, MINUS_D);
  //game.eventManager.assign('move_up', KEYBOARD, MINUS_W);
  //game.eventManager.assign('move_down', KEYBOARD, MINUS_S);

  game.eventManager.assign('shoot', KEYBOARD, SPACE);
  game.eventManager.assign('use_item', KEYBOARD, CTRL_R);
  game.eventManager.assign('pause_game', KEYBOARD, ESCAPE);

  game.eventManager.assign('select_mode_0', KEYBOARD, NUMBER_0);
  game.eventManager.assign('select_mode_1', KEYBOARD, NUMBER_1);
  game.mode_selected = -1;

  game.timerManager.addEvent('pause_game');

  $('#submit_score_container').hide();
}

function select_mode(mode) {
  var game = Game.getInstance();
  game.restart();
  game.mode_selected = mode;

  switch(mode) {
    case NORMAL_MODE: //normal mode
      game.timerManager.executeOnce(function() {
        game.timerManager.addTimer('enemy_respawn', function() {
          game.addObject('enemy',new Enemy(rand(600-40), -20, 40, 32));
        }, 800);

        game.timerManager.addTimer('enemy_pro_respawn', function() {
          game.addObject('enemy_pro',new EnemyPro(rand(600-40), -20, 40, 32));
        }, 20000);
      }, 2000);
      break;
    case EXTREME_MODE: //extreme mode
      game.timerManager.executeOnce(function() {
        game.timerManager.addTimer('enemy_respawn', function() {
          game.addObject('enemy',new Enemy(rand(600-40), -20, 40, 32));
        }, 200);

        game.timerManager.addTimer('enemy_pro_respawn', function() {
          game.addObject('enemy_pro',new EnemyPro(rand(600-40), -20, 40, 32));
        }, 10000);
      }, 2000);
      game.getObject('player').lives = 1;
      game.getObject('player').item = 0;
      break;
    case DEBUG_MODE:
      /*game.timerManager.executeOnce(function() {
        //game.addObject('enemy',new Enemy(rand(600-40), -20, 40, 32));
        game.addObject('enemy_pro',new EnemyPro(rand(600-40), -20, 40, 32));
      },1000);
      game.timerManager.addTimer('enemy_respawn', function() {
        game.addObject('enemy',new Enemy(rand(600-40), -20, 40, 32));
      }, 200);*/
      game.debug_mode = true;
      game.getObject('player').item = 2;
      break;
  }
}
/*--------------------------------------------------*/

game.loop = function() {
  var player = game.getObject('player');

  if(game.running) {
    game.draw();
    game.update();

    if(game.debug_mode) {
      game.render.drawText("Player_x: "+player.x,5,10,"#fff");
      game.render.drawText("Player_y_w: "+(player.x+player.w),5,20,"#fff");
      game.render.drawText("Player_y: "+player.y,5,30,"#fff","#fff");
      game.render.drawText("Player_y_h: "+(player.y+player.h),5,40,"#fff");
      game.render.drawText("Using item: "+player.using_item,5,50,"#fff");
      game.render.drawText("Item: "+player.item,5,60,"#fff");
    }

    if(game.mode_selected != -1) {
      if(player.lives <= 0) {
        game.stop();
        var now = new Date().getTime();
        var time = Math.ceil((now-begin)/1000);
        game.render.drawText('Game over!',200,50,"#000");
        game.render.drawText('Score: '+player.score+' enemies', 200, 60,"#000");
        game.render.drawText('Time: '+time+' seconds', 200, 70,"#000");
        //game.render.drawText('Press r to restart.', 200, 100,"#000")
        $('#score_enemies').val(player.score);
        $('#score_time').val(time);
        $('#submit_score_container').show();
      }

      if(player.pos.x > 0 && game.eventManager.happens('move_left')) {
        player.move(new Vector2D(-10,0));
      }
      else if(((player.pos.x+player.w) < game.render.canvas_width) && game.eventManager.happens('move_right')) {
        player.move(new Vector2D(10,0));
      }

      if(player.pos.y > 0 && game.eventManager.happens('move_up')) {
        player.move(new Vector2D(0,-10));
      }
      else if((player.pos.y+player.h) < game.render.canvas_height && game.eventManager.happens('move_down')) {
        player.move(new Vector2D(0,10));
      }

      if(game.eventManager.happens('shoot')) {
        player.shoot(); 
      }

      if(game.eventManager.happens('use_item')) {
        player.use_item();
      }

      if(player.score > 0 && (player.score % 50 == 0)) {
        new_difficulty = player.score*2; 
      }

      if(difficulty < 200 && difficulty != new_difficulty) {
        difficulty = new_difficulty;
        game.timerManager.changeTimer('enemy_respawn', 500-difficulty);
        game.timerManager.changeTimer('enemy_pro_respawn', 30000-difficulty*10);
      }
    } //game mode is not selected
    else {
      //HACK: Mode Selected by default
      //select_mode(9);

      game.render.drawText("SELECT MODE", 280, 300, "#fff");
      game.render.drawText("0 - normal mode", 275, 320, "#fff");
      game.render.drawText("1 - extreme mode", 275, 340, "#fff");

      if(game.eventManager.happens('select_mode_0')) {
        select_mode(0);
      }
      else if(game.eventManager.happens('select_mode_1')) {
        select_mode(1);
      }
    }
  }

  if(game.eventManager.happens('pause_game') && game.timerManager.elapsedTime('pause_game', 100)) {
    if(game.running) {
      game.render.clear();
      game.render.drawText("PAUSE",280,300,"#000");
      game.render.drawText("Press Esc to Resume",250,320,"#000");
    }
     
    game.pause();
  }
}

game.start();
});
