/**
* A Virtual Joystick
*/
Phaser.Plugin.VirtualJoystick = function (game, parent) {

    Phaser.Plugin.call(this, game, parent);

    this.x = 0;
    this.y = 0;
    this.limit = 10;

    this.baseCircle;

    this.baseBMD;
    this.nubBMD;

    this.base;
    this.nub;

    this.baseCenter;
    this.nubCenter;

    this.isDragging = false;

    this.angle = 0;
    this.distance = 0;
    this.force = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.speed = 0;

    this.pointer = null;

    this.callbackID = -1;
    
};

Phaser.Plugin.VirtualJoystick.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.VirtualJoystick.prototype.constructor = Phaser.Plugin.VirtualJoystick;

Phaser.Plugin.VirtualJoystick.prototype.init = function (x, y, baseDiameter, stickDiameter, limit, baseColor, stickColor) {

    if (typeof baseDiameter === 'undefined') { baseDiameter = 80; }
    if (typeof stickDiameter === 'undefined') { stickDiameter = 60; }
    if (typeof limit === 'undefined') { limit = Math.floor(baseDiameter / 2); }
    if (typeof baseColor === 'undefined') { baseColor = 'rgba(255, 0, 0, 0.5)'; }
    if (typeof stickColor === 'undefined') { stickColor = 'rgba(0, 255, 0, 0.7)'; }

    this.x = x;
    this.y = y;
    this.isDragging = false;

    this.limit = limit;
    this.limitPoint = new Phaser.Point(x, y);
    this.location = new Phaser.Point(x, y);

    var radius = Math.floor(baseDiameter / 2);
    var nr = Math.floor(stickDiameter / 2);

    this.baseCircle = new Phaser.Circle(x, y, baseDiameter);

    this.baseBMD = this.game.make.bitmapData(baseDiameter, baseDiameter);
    this.nubBMD = this.game.make.bitmapData(stickDiameter, stickDiameter);

    this.baseBMD.circle(radius, radius, radius, baseColor);
    this.nubBMD.circle(nr, nr, nr, stickColor);

    //  Base
    this.base = this.game.make.sprite(x, y, this.baseBMD);
    this.base.anchor.set(0.5);

    //  Nub (stick)
    this.nub = this.game.make.sprite(x, y, this.nubBMD);
    this.nub.anchor.set(0.5);

    this.nub.inputEnabled = true;
    this.nub.events.onInputDown.add(this.startDrag, this);
    this.nub.events.onInputUp.add(this.stopDrag, this);

};

Phaser.Plugin.VirtualJoystick.prototype.start = function () {

    this.game.stage.addChild(this.base);
    this.game.stage.addChild(this.nub);

    if (this.callbackID > -1)
    {
        this.game.input.deleteMoveCallback(this.callbackID);
    }
    
    this.callbackID = this.game.input.addMoveCallback(this.move, this);

    this.isDragging = false;

    this.distance = 0;
    this.speed = 0;
    this.force = 0;

    this.deltaX = 0;
    this.deltaY = 0;

    this.nub.x = this.base.x;
    this.nub.y = this.base.y;

    this.base.visible = true;
    this.nub.visible = true;

    this.limitPoint.set(this.base.x, this.base.y);
    this.location.set(this.base.x, this.base.y);

};

Phaser.Plugin.VirtualJoystick.prototype.stop = function () {

    // if (this.nub.parent === null || this.base.parent === null)
    // {
        // return;
    // }

    this.base.visible = false;
    this.nub.visible = false;

    this.nub.x = this.base.x;
    this.nub.y = this.base.y;

    // this.nub.input.enabled = false;

    // this.game.stage.removeChild(this.base);
    // this.game.stage.removeChild(this.nub);

    // this.game.input.deleteMoveCallback(this.callbackID);

};

Phaser.Plugin.VirtualJoystick.prototype.startDrag = function (nub, pointer) {

    this.isDragging = true;

    this.pointer = pointer;

    this.location.set(pointer.x, pointer.y);

    this.distance = Phaser.Point.distance(this.base, this.location, true);
    this.angle = this.game.math.wrapAngle(this.location.angle(this.base, true) + 180);
    this.force = this.game.math.percent(this.distance, this.limit);

    this.deltaX = Math.cos(this.game.math.degToRad(this.angle));
    this.deltaY = Math.sin(this.game.math.degToRad(this.angle));

};

Phaser.Plugin.VirtualJoystick.prototype.stopDrag = function (nub, pointer) {

    console.log('stopDrag');

    this.isDragging = false;

    this.distance = 0;
    this.angle = 0;
    this.force = 0;

    this.nub.x = this.base.x;
    this.nub.y = this.base.y;

    this.deltaX = 0;
    this.deltaY = 0;
    
    this.limitPoint.set(this.base.x, this.base.y);

};

Phaser.Plugin.VirtualJoystick.prototype.move = function (pointer, x, y) {

    if (!this.isDragging)
    {
        return;
    }

    this.location.set(x, y);

    this.distance = Phaser.Point.distance(this.base, this.location, true);
    this.angle = this.game.math.wrapAngle(this.location.angle(this.base, true) + 180);
    this.force = this.game.math.percent(this.distance, this.limit);

    if (this.distance < this.limit)
    {
        this.limitPoint.copyFrom(this.location);
    }
    else
    {
        this.baseCircle.circumferencePoint(this.angle, true, this.limitPoint);
    }

    this.nub.position.set(this.limitPoint.x, this.limitPoint.y);

    this.deltaX = Math.cos(this.game.math.degToRad(this.angle));
    this.deltaY = Math.sin(this.game.math.degToRad(this.angle));

};

/**
* Given the speed calculate the velocity and return it as a Point object, or set it to the given point object.
* One way to use this is: velocityFromAngle(angle, 200, sprite.velocity) which will set the values directly to the sprites velocity and not create a new Point object.
*
* @method Phaser.Plugin.VirtualJoystick#setVelocity
* @param {Phaser.Sprite} sprite - The Sprite to set the velocity on. The Sprite must have a physics body already set. The value will be set into Sprite.body.velocity.
* @param {number} [minSpeed=0] - The minimum speed the Sprite will move if the joystick is at its default (non-moved) position.
* @param {number} [maxSpeed=100] - The maximum speed the Sprite will move if the joystick is at its full extent.
* @return {Phaser.Sprite} The Sprite object.
*/
Phaser.Plugin.VirtualJoystick.prototype.setVelocity = function (sprite, minSpeed, maxSpeed) {

    if (typeof minSpeed === 'undefined') { minSpeed = 0; }
    if (typeof maxSpeed === 'undefined') { maxSpeed = 200; }

    if (this.force === 0 && minSpeed === 0)
    {
        sprite.body.velocity.set(0, 0);
    }
    else
    {
        var speed = (maxSpeed - minSpeed) * this.force;

        sprite.body.velocity.set(this.deltaX * speed, this.deltaY * speed);
    }

    return sprite;

};

Phaser.Plugin.VirtualJoystick.prototype.update = function () {

    if (this.isDragging && (!this.pointer.isDown || !this.pointer.withinGame))
    {
        this.stopDrag();
    }

};
