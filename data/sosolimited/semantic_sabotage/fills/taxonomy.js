var taxonomy = function(id) {

	return {
	
		name: "Taxonomy",
		author: "Sosolimited",
		
		defaultURL: "http://www.youtube.com/watch?v=w5R8gduPZw4&t=0m03s",
		
		$el: $('<div class="modeContainer" id="'+id+'"></div>'),

		index: 0, // defines global variable this.index used to keep track of sentence objects -- see below
		
		// INITIALIZE MODE.
		// Do anything you want to do to set up your mode the first time here.
		// This gets called once after the mode is loaded.
		init: function() {

			this.$el.empty(); // empty modeContainer div for setup

		}, // end init

		// ENTER MODE.
		// This gets called each time you go to the mode.
		enter: function() {

			this.$el.empty(); // empty modeContainer div for setup

			this.index = 0; // initializes this.index to keep track of sentence objects -- see below

			this.$el.append('<div class="container proxima-nova-700"></div>'); // appends container class to modeContainer for Taxonomy

			var so = document.createElement('div'); // creates new div for sentence object to be placed in the DOM
			$(so).addClass('so' + this.index); // creates a dummy class with this.index to keep track of sentence objects
			$(so).addClass('sentenceObject'); // adds sentenceObject class for css styling
			this.$el.find('.container').append(so); // attaches sentenceObject div to container

		}, // end enter

		// HANDLE INCOMING word MESSAGE.
		// Called each time a new word is ready. 
		handleWord: function(msg) {						
			this.appendWordInContext(msg);
		}, // end handleWord
		
		// HANDLE INCOMING sentenceEnd MESSAGE.
		// Called each time a new sentence is complete.
		handleSentenceEnd: function(msg) {
		}, // end handleSentenceEnd
		
		// HANDLE INCOMING stats MESSAGE.
		// Called with each sentence.
		// Passes a collection of interesting language statistics.
		handleStats: function(msg) {
		}, // end handleStats
		
		// APPEND WORD TO DOM.
		// This is where you insert your words into the DOM.
		appendWordInContext: function(msg) {

		 	if ($.inArray('endPunct', msg.cats) >= 0) { // checks to see if current message is classified as end punctuation

				this.$el.find('.so' + this.index).css('opacity','0'); // finds the current (just end-punctuated) sentence object and sets to fade out
				setTimeout( function() { this.$el.find('.so' + this.index).remove() }, 2000 ); // culls sentence object from DOM after delay

				this.index++; // increases index for sentence object tracking

				var so = document.createElement('div'); // creates new div for sentence object to be placed in the DOM
				$(so).addClass('so' + this.index); // creates a dummy class with this.index to keep track of sentence objects
				$(so).addClass('sentenceObject'); // adds sentenceObject class for css styling
				this.$el.find('.container').append(so); // attaches sentenceObject div to container

			}

			else if ($.inArray('punct', msg.cats) < 0) { // checks to see if current message is any kind of punctuation (which is ignored and not displayed in this mode)

				var cc = document.createElement('div'); // creates new div to list categories for current message
				$(cc).addClass('categoryContainer'); // adds categoryContainer class for css styling

				if (msg.cats.length <= 0) { // check to see if current message has no category designations
					$(cc).append('undefined'); // appends "undefined" to indicate that it doesn't fit into any categories
					$(cc).addClass('undefined'); // appends "undefined" to indicate that it doesn't fit into any categories
				}
				else {
					for (var i=0; i<msg.cats.length; i++) { // for each category designation, appends category names to the categoryContainer
						if (msg.cats[i] != msg.cats[i-1] && msg.cats[i] != 'sentencesmode') $(cc).append(msg.cats[i] + ' '); // checks for double-tagging (and for a LIWC SOSO artifact)
					}
				}
				
				var wc = document.createElement('div'); //creates new div for word container object, which will also contain the categoryContainer
				$(wc).addClass('wordContainer'); // adds wordContainer class for css styling
				$(wc).append(msg.word); // appends word to word continer for display
				$(wc).append(cc); // appends categoryContainer to wordContainer

				this.$el.find('.so' + this.index).append(wc); // finds the current sentenceObject and appends current wordContainer

				var wd = document.createElement('div'); //creates an additional wordContainer div to contain spacer object
				$(wd).addClass('wordContainer');
				$(wd).css('visibility','hidden');
//				$(wd).append('- '); // hyphen
				$(wd).append('&#8211; '); // en dash
//				$(wd).append('&#8212; '); // em dash

				this.$el.find('.so' + this.index).append(wd); // appends spacer wordObject to current sentenceObject

				this.$el.find('.so' + this.index).css('top', this.$el.find('.container').height()-this.$el.find('.so' + this.index).height() +'px'); // repositions sentence object when words begin to accumulate and word-wrap

		 		setTimeout( function() { $(cc).css('opacity','1') }, 250 ); // sets categoryObject to fade in over the word after a short delay

			}

		} // end appendWordInContext
	} // end return
}; // end var