
lychee.define('game.entity.lycheeJS').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = {
		width:  256,
		height: 48
	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;


		lychee.game.Sprite.call(this, settings);

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.lycheeJS';


			return data;

		}

	};


	return Class;

});

