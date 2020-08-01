var game = null;

/**
 * @constructor
 */
function Game() {
	var state = null;

	this.setState = function(gameState, noClear) {
		// console.log("Game state became " + gameState.name);
		if (!noClear && state && state.clear) {
			state.clear();
		}
		state = gameState;
		if (!noClear) {
			gameState.activate();
		}
	};
	this.getState = function() {
		return state;
	};
	
	
	this.resize = function() {
		if (game.getState() != null && game.getState().resize) {
			game.getState().resize();
			game.backgroundState.resize();
		}
	};
	
	this.hideLoadingMessage = function() {
		var loadingMsg = $("#loadingMsg");
		if(loadingMsg.length > 0) {
			loadingMsg.remove();
			var globalBackground = $("#globalBackground");
			if(globalBackground.length > 0) {
				globalBackground['css']("z-index", 0);
			}
		}
	};
}

window.onload = function() {
	

	game = new Game();
	
	Device.init();
	Screen.init(game);
	
	
	game.backgroundState = new BackgroundState();
	game.backgroundState.activate();
	
	game.setState(new InitialLoadingGameState());
};
