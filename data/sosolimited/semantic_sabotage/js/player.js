var Player = function(app) {

	
	// NOTE USE THIS TO EMPTY CACHED_MESSAGES
	//db.truncate("cached_messages");

	return {


		playbackTimeoutEvents : [], 		// Used for playing back blocks of messages.
		parseTimeoutEvents : [],			// Used for tracking message parsing with progress bar.
		messages : [],
		db : new localStorageDB("db", localStorage),
		parser : null,
		curMessage : 0,

		initialize: function(data) {
			parser = Parser();
			//this.clearDB(); // use this to reset db
			parser.initialize(this.db, this.messages);
			this.createMessages(data);
		},
	
		createMessages: function(data) {
			var ytID = data.youtube_id;
			var cc = data.cc;

			//console.log("load msgs "+cc);
			
			// check if messages exist in cache
			var res = this.db.query("cached_messages", {ytID: ytID});
			if (res && res.length > 0) {
				// console.log("Cached messages found");
				this.messages = res[0]['messages'];
				//app.start();
				// Give youTube movie time to cue before playing.
				// PEND Using a setTimeout is hackey. Do this right.	 	
				this.parseTimeoutEvents.push(setTimeout(function(){
					app.start();
				}, 100));
			} else {
				// console.log("Creating messages");
				// Delete previously cached messages.
		  	this.db.truncate("cached_messages");
  			this.db.truncate("word_instances");
		  	// Clear the message array. 
		  	this.messages.length = 0;

				var offset = 40;	// Milliseconds between line parses.			
				for (var i=0; i<cc.length; i++) {
					// Gotta use offset setTimeouts, so progress bar reflow can happen.
					this.parseTimeoutEvents.push(setTimeout(function(data, i){
						this.parser.parseLine(data[i]);
						Piecon.setProgress(Math.floor((i/data.length)*100));
						$('#progressBar').width((i/data.length)*100 + "%");		
					}, i*offset, cc, i));
				}
				
				// Once all messages are created, start!
				this.parseTimeoutEvents.push(setTimeout(function(){
					this.parser.cacheMessages(data.youtube_id);
					this.messages = this.parser.messages; // LM why is this necessary?
					app.start();
					// console.log(this.messages);
				}, cc.length*offset + 500));

			}
			// Reset curMessage index for playback.
			this.curMessage = 0;
		},

    //___________________________________________________________________________________________
    // Playback a block of messages using setTimeouts 
    // Start with start message and play up and including end message.
    playMessageBlock : function(start, end) {
    
     	if(start>=0 && start<this.messages.length &&
     	   		end>=0 && end<this.messages.length){ 	
	      	
	        for(var i=start; i<=end; i++){
	        	this.playbackTimeoutEvents.push(setTimeout(app.handleMessage, 
	        		this.messages[i].time-this.messages[start].time, this.messages[i]));
	        }       
      	}
			        
  	},

    // Check current time of youTube playback and release messages.
    // Uses playbacMessageBlock above as a helper function.
    updateMessagePlayback : function() {
    	if(ytCurState == ytStates.playing) {		
    		var t = this.messages[this.curMessage].time;
    		//console.log(ytPlayer.getCurrentTime()+", curMessage= "+curMessage+", t = "+t);

    		var start = this.curMessage;
    		
    		while(t <= document.getElementById("ytplayer").getCurrentTime()*1000 && 
    			this.curMessage < (this.messages.length-1)) {
    			//app.handleMessage(messages[curMessage]);
    			t = this.messages[this.curMessage].time;
    			this.curMessage++; 
    		}
    		if(this.curMessage > start) this.playMessageBlock(start, this.curMessage-1);
    	}
    },
   
  
    pausePlaybackMessages: function() {
    	// console.log("Pause playback");
	    for (var i=0; i<this.playbackTimeoutEvents.length; i++) {
		    clearTimeout(this.playbackTimeoutEvents[i]);
	    }
    },

    clearParseTimers: function() {
    	for (var i=0; i<this.parseTimeoutEvents.length; i++) {
		    clearTimeout(this.parseTimeoutEvents[i]);
	    }
    },

    resetPlaybackMessages: function() {
    	this.curMessage = 0;
    },

    clearDB: function() {
    	// console.log("Clearing db");
    	this.db.dropTable("cached_messages");
			this.db.dropTable("LIWC_words");
			this.db.dropTable("LIWC_words_wild");
    }

	};

};