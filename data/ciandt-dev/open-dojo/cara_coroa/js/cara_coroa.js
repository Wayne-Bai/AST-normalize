function Game(score) {
	var faces = new Array('cara', 'coroa');

	this.score = function(face) {
		if (face === 'cara') {
			score *= 2;
		}else if(face === 'coroa'){
			score = Math.floor((score /3)*1);
		}
		return score;
	}

	this.play = function() {
		return "cara";
	}


}