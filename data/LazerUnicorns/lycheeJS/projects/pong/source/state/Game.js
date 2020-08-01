
lychee.define('game.state.Game').requires([
	'lychee.effect.Color',
	'lychee.effect.Shake',
	'game.entity.Background',
	'game.entity.Ball',
	'game.entity.Paddle',
	'game.ui.Welcome',
	'lychee.ui.Label'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob  = attachments["json"].buffer;
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};

	var _boo   = attachments["boo.snd"];
	var _cheer = attachments["cheer.snd"];
	var _music = attachments["music.msc"];
	var _ping  = attachments["ping.snd"];
	var _pong  = attachments["pong.snd"];



	/*
	 * HELPERS
	 */

	var _on_touch = function(id, position, delta) {

		var renderer = this.renderer;
		if (renderer !== null) {

			position.y -= renderer.offset.y;
			position.y -= renderer.height / 2;

		}


		this.__player.target.y = position.y;

	};

	var _reset_game = function(winner) {

		winner = typeof winner === 'string' ? winner : null;


		var ball = this.queryLayer('game', 'ball');
		if (ball !== null) {

			var position = {
				x: 0,
				y: 0
			};

			var velocity = {
				x: 150 + Math.random() * 100,
				y: 100 + Math.random() * 100
			};

			if (Math.random() > 0.5) {
				velocity.y *= -1;
			}

			if (winner === 'player') {
				velocity.x *= -1;
			}

			ball.setPosition(position);
			ball.setVelocity(velocity);

		}


		if (winner === 'player') {
			this.jukebox.play(_cheer);
		} else if (winner === 'enemy') {
			this.jukebox.play(_boo);
		}


		var score = this.queryLayer('ui', 'score');
		if (score !== null) {
			score.setLabel(this.__score.player + ' - ' + this.__score.enemy);
		}


		this.queryLayer('game', 'player').setPosition({ y: 0 });
		this.queryLayer('game', 'enemy').setPosition({ y: 0 });

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.__ai = {
			clock:  null,
			delta:  500,
			target: { y: 0 }
		};

		this.__player = {
			target: { y: 0 }
		};

		this.__score = {
			player: 0,
			enemy:  0
		};


		this.deserialize(_blob);



		/*
		 * INITIALIZATION
		 */

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				var renderer = this.renderer;
				if (renderer !== null) {

					var entity = null;
					var width  = renderer.width;
					var height = renderer.height;


					this.getLayer('ui').reshape();
					this.getLayer('game').reshape();


					entity = this.queryLayer('background', 'background');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('ui', 'score');
					entity.setPosition({
						x: 0,
						y: -1/2 * height + 42
					});

					entity = this.queryLayer('game', 'player');
					entity.setPosition({ x: -1/2 * width + 42 });

					entity = this.queryLayer('game', 'enemy');
					entity.setPosition({ x:  1/2 * width - 42 });

				}

			}, this);

		}

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			var data = lychee.game.State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);

		},

		enter: function() {

			this.__score.enemy  = 0;
			this.__score.player = 0;
			this.__ai.target.y  = 0;


			_reset_game.call(this, null);


			lychee.game.State.prototype.enter.call(this);



			// Allow AI playing while welcome dialog is visible

			var welcome = this.queryLayer('ui', 'welcome');
			if (welcome !== null) {

				welcome.setVisible(true);
				welcome.bind('#touch', function(entity) {

					this.__score.enemy  = 0;
					this.__score.player = 0;
					this.__ai.target.y  = 0;

					_reset_game.call(this, null);

					entity.setVisible(false);

					this.input.bind('touch', _on_touch, this);

				}, this, true);

			}


			this.jukebox.play(_music);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

			this.input.unbind('touch', _on_touch, this);

		},

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);


			var jukebox    = this.jukebox;
			var renderer   = this.renderer;
			var background = this.queryLayer('background', 'background');
			var gamelayer  = this.getLayer('game');
			var uilayer    = this.getLayer('ui');

			var ball     = this.queryLayer('game', 'ball');
			var player   = this.queryLayer('game', 'player');
			var enemy    = this.queryLayer('game', 'enemy');
			var hwidth   = renderer.width / 2;
			var hheight  = renderer.height / 2;
			var position = ball.position;
			var velocity = ball.velocity;


			/*
			 * 1: WORLD BOUNDARIES
			 */

			if (position.y > hheight && velocity.y > 0) {
				position.y = hheight - 1;
				velocity.y = -1 * velocity.y;
			}

			if (position.y < -hheight && velocity.y < 0) {
				position.y = -hheight + 1;
				velocity.y = -1 * velocity.y;
			}


			if (position.x > hwidth) {
				this.__score.player++;
				_reset_game.call(this, 'player');
				return;
			} else if (position.x < -hwidth) {
				this.__score.enemy++;
				_reset_game.call(this, 'enemy');
				return;
			}



			/*
			 * 2: COLLISIONS
			 */

			if (ball.collidesWith(player) === true) {

				position.x = player.position.x + 24;
				velocity.x = Math.abs(velocity.x);
				jukebox.play(_ping);

				gamelayer.addEffect(new lychee.effect.Shake({
					type:     lychee.effect.Shake.TYPE.bounceeaseout,
					duration: 300,
					shake:    {
						x: (Math.random() * 16) | 0,
						y: (Math.random() * 16) | 0
					}
				}));

				uilayer.addEffect(new lychee.effect.Shake({
					type:     lychee.effect.Shake.TYPE.bounceeaseout,
					duration: 300,
					shake:    {
						x: (Math.random() * 16) | 0,
						y: (Math.random() * 16) | 0
					}
				}));

				background.setColor('#14a5e2');
				background.addEffect(new lychee.effect.Color({
					type:     lychee.effect.Color.TYPE.linear,
					duration: 1000,
					color:    '#050a0d'
				}));

			} else if (ball.collidesWith(enemy) === true) {

				position.x = enemy.position.x - 24;
				velocity.x = -1 * Math.abs(velocity.x);
				jukebox.play(_pong);

				gamelayer.addEffect(new lychee.effect.Shake({
					type:     lychee.effect.Shake.TYPE.bounceeaseout,
					duration: 300,
					shake:    {
						x: (Math.random() * 16) | 0,
						y: (Math.random() * 16) | 0
					}
				}));

				uilayer.addEffect(new lychee.effect.Shake({
					type:     lychee.effect.Shake.TYPE.bounceeaseout,
					duration: 300,
					shake:    {
						x: (Math.random() * 16) | 0,
						y: (Math.random() * 16) | 0
					}
				}));

				background.setColor('#de1010');
				background.addEffect(new lychee.effect.Color({
					type:     lychee.effect.Color.TYPE.easeout,
					duration: 1000,
					color:    '#050a0d'
				}));

			}



			/*
			 * 3: AI LOGIC
			 */

			var ai = this.__ai;

			if (ai.clock === null) {
				ai.clock = clock;
			}

			if ((clock - ai.clock) > ai.delta) {

				ai.target.y = position.y;
				ai.clock    = clock;

				if (ai.target.y > enemy.position.y - 10 && ai.target.y < enemy.position.y + 10) {

					ai.target.y = enemy.position.y;
					enemy.setVelocity({ y: 0 });

				} else {

					if (ai.target.y > enemy.position.y - 10) {
						enemy.setVelocity({ y:  200 });
					}

					if (ai.target.y < enemy.position.y + 10) {
						enemy.setVelocity({ y: -200 });
					}

				}

			}



			/*
			 * 4: PLAYER LOGIC
			 */

			var target = this.__player.target;
			if (target.y !== null) {

				if (target.y > player.position.y - 10 && target.y < player.position.y + 10) {

					player.setVelocity({ y: 0 });
					target.y = null;

				} else {

					if (target.y > player.position.y - 10) {
						player.setVelocity({ y:  250 });
					}

					if (target.y < player.position.y + 10) {
						player.setVelocity({ y: -250 });
					}

				}

			}

		}

	};


	return Class;

});
