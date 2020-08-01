/*

See Left Scroll Template (template_leftScroll.js) for a
fully-commented explanation of methods and usage.

*/

var template_wordStack = function(id) {

	return {
	
		name: "Word Stack",
		defaultURL: "http://www.youtube.com/watch?v=6JDM4MY71G4",
		$el: $('<div class="modeContainer" id="'+id+'"></div>'),		
		template: true,	
		lineHeight: 80,
																
		// INITIALIZE MODE.
		// Do anything you want to do to set up your mode the first time here.
		// This gets called once after the mode is loaded.
		init: function() {
			this.$el.append("<div class='wordstack container'></div>");
		},

		// ENTER MODE.
		// This gets called each time you go to the mode.
		enter: function() {
			this.$el.find('.wordstack').empty();
		},

		// HANDLE INCOMING word MESSAGE.
		// Called each time a new word is ready. 
		handleWord: function(msg) {
			//console.log('word '+msg.word);
			this.appendWordInContext(msg);
		},
		
		// HANDLE INCOMING sentenceEnd MESSAGE.
		// Called each time a new sentence is complete.
		handleSentenceEnd: function(msg) {
			//console.log('sentenceEnd');	
		},
		
		// HANDLE INCOMING stats MESSAGE.
		// Called with each sentence.
		// Passes a collection of interesting language statistics.
		handleStats: function(msg) {
			//console.log(msg);
		},
		
		// APPEND WORD TO DOM.
		// This is where you insert your words into the DOM.
		appendWordInContext: function(msg) {
		 	
		 	if($.inArray('punct', msg.cats) < 0) 
		 	{
		 		var e = $('<div class= "bigText proxima-nova-400 white" style="opacity:0;">' + msg.word + '</div>');
			 	this.$el.find('.wordstack').prepend(e);

			 	setTimeout(function(element){
			 		element.css("opacity", "1");	
			 	},20,e);

			 	var h = this.lineHeight;
		 		this.$el.find('.wordstack').children().each(function(i){
			 		var t = h*i+"px";
			 		//console.log("i="+i+", t="+t);
			 		$(this).css("top", t);
		 		});
		 		//console.log($('.bigwords > .bigText').length*this.lineHeight+"px");

		 		this.$el.find('.wordstack').css('height', this.$el.find('.wordstack > .bigText').length*this.lineHeight+"px");
		 	}	 	
		},


	}
};