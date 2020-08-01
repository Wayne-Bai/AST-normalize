/**
 * FlappyBug bug in game.
 */
FlappyBug('Game').Bug = CLASS({

	statics : function(cls) {'use strict';

		// half collision size
		cls.halfCollisionWidth = 30 / 2;
		cls.halfCollisionHeight = 20 / 2;
	},

	init : function(cls, inner, self, onDie) {'use strict';
		//REQUIRED: onDie

		var
		// jump sound
		jumpSound = SOUND({
			mp3 : FlappyBug.R_URI('jump.mp3'),
			ogg : FlappyBug.R_URI('jump.ogg')
		}),

		// die sound
		dieSound = SOUND({
			mp3 : FlappyBug.R_URI('die.mp3'),
			ogg : FlappyBug.R_URI('die.ogg')
		}),

		// waiting loop count
		waitingLoopCount = 0,

		// gravity amount
		g = 9.80665,

		// gs
		gs,

		// left
		left = 60,

		// top
		top = 200,

		// half img width
		halfImgWidth,

		// half img height
		halfImgHeight,

		// degree
		degree,

		// is dead
		isDead,

		// frame count
		frameCount = 0,

		// animation loop
		animationLoop,

		// waiting loop
		waitingLoop,

		// gravity loop
		gravityLoop,

		// layer
		layer,

		// append to.
		appendTo,

		// remove.
		remove,

		// die.
		die,

		// jump.
		jump,

		// get position.
		getPosition;

		layer = USCREEN.LAYER();

		// load bug image.
		EVENT({
			node : IMG({
				src : FlappyBug.R('bug.png')
			}),
			name : 'load'
		}, function(e, img) {

			halfImgWidth = img.getWidth() / 2 / 2;
			halfImgHeight = img.getHeight() / 2;

			// init layer.
			layer.setClipWidth(halfImgWidth * 2);
			layer.setImg(img);
			layer.moveTo({
				left : left - halfImgWidth,
				top : top - halfImgHeight,
				zIndex : 3
			});
		});

		animationLoop = LOOP(20, function() {

			layer.setClipLeft(frameCount * halfImgWidth * 2);

			frameCount += 1;

			if (frameCount >= 2) {
				frameCount = 0;
			}
		});

		waitingLoop = LOOP(function() {

			waitingLoopCount += 0.1;

			top += Math.sin(waitingLoopCount) / 2;

			layer.moveTo({
				top : top - halfImgHeight
			});
		});

		// when remove layer.
		layer.addAfterRemoveProc(function() {

			if (animationLoop !== undefined) {
				animationLoop.remove();
			}

			if (waitingLoop !== undefined) {
				waitingLoop.remove();
			}

			if (gravityLoop !== undefined) {
				gravityLoop.remove();
			}
		});

		self.appendTo = appendTo = function(parent) {
			//REQUIRED: parent

			layer.appendTo(parent);

			return self;
		};

		self.remove = remove = function() {
			layer.remove();
		};

		self.die = die = function() {

			isDead = true;

			dieSound.play();

			animationLoop.remove();
			animationLoop = undefined;

			onDie();
		};

		self.jump = jump = function() {

			if (isDead !== true) {

				// init values.
				gs = -5;
				degree = -45;

				// play jump sound.
				jumpSound.play();

				if (gravityLoop === undefined) {

					// remove waiting loop.
					waitingLoop.remove();
					waitingLoop = undefined;

					// init gravity loop.
					gravityLoop = LOOP(function() {

						// fall.
						if (top + gs < 400 - cls.halfCollisionHeight) {

							top += gs;
							gs += g / 60 * 1.5;

							degree += 2;
							if (degree > 90) {
								degree = 90;
							}
						}

						// when touches ground.
						else {

							top = 400 - cls.halfCollisionHeight;

							if (isDead !== true) {
								die();
							}
						}

						// too high!
						if (top < 0) {
							top = 0;
						}

						// rotate bug.
						layer.rotate({
							centerLeft : 19,
							centerTop : 19,
							degree : degree
						});

						// change position.
						layer.moveTo({
							top : top - halfImgHeight
						});
					});
				}
			}
		};

		self.getPosition = getPosition = function() {

			return {
				left : left,
				top : top
			};
		};
	}
});
