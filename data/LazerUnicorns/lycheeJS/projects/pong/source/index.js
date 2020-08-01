
(function(lychee, global) {

	var environment = new lychee.Environment({
		id:       'pong',
		debug:    true,
		sandbox:  true,
		build:    'game.Main',
		packages: [
			new lychee.Package('game', '../lychee.pkg')
		],
		tags:     {
			platform: [ 'html' ]
		}
	});


	lychee.setEnvironment(environment);

	lychee.init(function(sandbox) {

		var lychee = sandbox.lychee;
		var game   = sandbox.game;

		// This allows using #MAIN in JSON files
		sandbox.MAIN = new game.Main();
		sandbox.MAIN.init();

	});

})(lychee, typeof global !== 'undefined' ? global : this);

