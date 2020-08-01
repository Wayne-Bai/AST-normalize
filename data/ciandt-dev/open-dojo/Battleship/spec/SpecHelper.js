beforeEach(function() {
  this.addMatchers({
    toBePlaying: function(expectedSong) {
      var player = this.actual;
      return player.currentlyPlayingSong === expectedSong && 
             player.isPlaying;
    },

    toHaveIdenticalArray: function(array){
    	var field = this.actual;
    	console.dir(field);
    	var board = field.field;



    	if (array.length !== board.length) {
    		return false;
    	}

    	for (var i = 0; i < array.length; i++) {

    		if (array.length[j] !== board[j]) {
    			return false;
    		}

    		for (var j = 0; j<array.length[i]; j++){
    			if (array[i] != board[i]) {
    				return false;
    			}
    		}
    	}
    	return true;
    }
  });
});
