/**
  Class Sprite
*/

Sprite.prototype = new Object2D();

function Sprite(x, y, w, h) {
  Object2D.call(this, x, y, w, h);
  this.frames = new Array();
  this.current = 0;
}

Sprite.prototype.draw = function(render) {
  render.renderImage(this.frames[this.current], this.pos);
  Object2D.prototype.draw.call(this,render);
}

Sprite.prototype.add_frame = function(url) {
  var img = new Image();
  img.src = url;
  this.frames.push(img);
}

Sprite.prototype.current_frame = function() {
  return this.frames[this.current];
}

Sprite.prototype.next_frame = function() {
  this.current = (this.current+1) % this.frames.length;    
}
