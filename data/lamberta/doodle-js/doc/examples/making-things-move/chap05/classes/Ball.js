function createBall (radius, color) {
  radius = (radius === undefined) ? 40 : radius;
  color = color || "#ff0000";
  return doodle.createSprite(function () {
    this.graphics.beginFill(color);
    this.graphics.circle(0, 0, radius);
    this.graphics.endFill();
  });
}
