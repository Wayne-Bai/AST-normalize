/**
  Class Item
*/

var SHIELD = 0;
var DUAL_BULLETS = 1;
var BOMB = 2;

Item.prototype = new Sprite();

function Item(x,y,type) {
  Sprite.call(this, x, y, 0, 0);
  this.type = type;
  this.vy = 5;

  switch(type) {
    case SHIELD:
      this.add_frame('javascripts/game/sprites/escut.gif'); 
      this.w = 26;
      this.h = 33;
      break;
    case DUAL_BULLETS:
      this.add_frame('javascripts/game/sprites/bales.gif'); 
      this.w = 34;
      this.h = 40;
      break;
    case BOMB:
      this.add_frame('javascripts/game/sprites/bomba.gif'); 
      this.w = 26;
      this.h = 45;
      break;
  }
}

Item.prototype.update = function() {
  this.pos.y = this.pos.y + this.vy;
  this.alive = this.insideCanvas();

  var player = Game.getInstance().getObject('player');
  if(Game.getInstance().collisionManager.sprite_collision(player, this)) {
    this.alive = false;
    if(!player.using_item) {
      player.item = this.type;
    }
  }
}

