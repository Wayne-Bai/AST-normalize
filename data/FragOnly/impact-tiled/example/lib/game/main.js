ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
    'plugins.tiledLoader',
    'game.entities.player'
)
.defines(function(){

MyGame = ig.Game.extend({
    gravity: 1000,

	init: function() {
        ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
        ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
        ig.input.bind(ig.KEY.UP_ARROW, 'jump');


        ig.game.loadTiledLevel('test.json');
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
	}
});


ig.main( '#canvas', MyGame, 60, 640, 480, 1 );

});
