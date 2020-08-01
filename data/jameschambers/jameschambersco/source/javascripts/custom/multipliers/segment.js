// -------------------------------------------------
//
// Set up a segment
// 
// -------------------------------------------------

function Segment(attributes) {

  var self = this;
  self.attributes = attributes;
  self.l = parseInt(self.attributes.length - (self.attributes.topPin + self.attributes.bottomPin), 10);
  self.x = 0;
  self.y = 0;
  self.width = self.l;
  self.height = self.attributes.width;
  // self.pattern = self.attributes.pattern;
  self.rotation = 0;
  self.cr = self.height / 2;

  self.color = self.attributes.color;

}


// -------------------------------------------------
//
// Draw a segment
// 
// -------------------------------------------------


Segment.prototype.draw = function(context) {

  var self = this,
    h = self.height,
    d = self.width + h, //top-right diagonal
    cr = self.cr; //corner radius

  // Initial Setup
  context.save();
  context.translate(self.x, self.y);
  context.rotate(self.rotation);
  // Draw the main body of the limb
  context.beginPath();
  context.fillStyle = self.color;

  var offset_x = 0;
  var offset_y = self.cr;
  context.save();
  context.translate(offset_x - self.attributes.topPin, offset_y);
  // Top, Left, limb length, limb width
  context.fillRect(0 - offset_x, -self.cr - offset_y, self.width + (self.attributes.topPin + self.attributes.bottomPin), self.height);
  context.restore();
  context.save();
  context.translate(-self.cr, 0);
  context.restore();
  // Close the path
  context.closePath();
  context.restore();

};


// -------------------------------------------------
//
// Get Pin utility function
// 
// -------------------------------------------------

Segment.prototype.getPin = function() {

  var self = this;

  return {
    x: self.x + Math.cos(self.rotation) * (self.width),
    y: self.y + Math.sin(self.rotation) * (self.width)
  };

};