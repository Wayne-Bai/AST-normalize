dojo.provide("lucid.crosstalk");
lucid.crosstalk = {
	//	summary:
	//		An API that allows an app to communicate with other applications on a system-wide level. 
	//	session: Array
	//		handler storage
	session: [],
    //  msgQueue: Array
    //      a queue of messages for the dispacher to handle
    msgQueue: [],
	subscribe: function(/*String*/topic, /*Function*/handler, /*Int?*/instance)
	{
		//	summary:
		//		register an event handler
		//	instance:
		//		the current app ID. Pass this.id when using in an app.
		//		to capture system events, omit this
		//	topic:
		//		the topic to subscribe to
		//	handler:
		//		a handler function that is called when something for this event is published
		//	returns:
		//		returns a handle that you can use to unregister the handler (see unregisterHandler)
		var session = lucid.crosstalk.session;
		var p = session[session.length] = {
			appsysname: (instance ? lucid.app.instances[instance].sysname : -1),
			callback: handler,
			instance: instance || -1,
			topic: topic
		};
		return session.length-1;
	},
	unsubscribe: function(/*Handle*/handle)
	{
		//	summary:
		//		unregister an event handler
		//	handle:
		//		a handle that was returned from subscribe()
		delete lucid.crosstalk.session[handle];
	},
	_internalCheck: function()
	{
		//	summary:
		//		the crosstalk api checker, called every somewhat or so seconds, internally. then will handle it from the registered crap...
		
		//I'm commenting this out because the new system may have to launch the app when an event is recieved
		
		//var eventsToHandle = false;
		//dojo.forEach(this.session, function(i){
		//	if(i != null) eventsToHandle=true;
		//})
		//if (!eventsToHandle){ // no data in array (no handlers registered)
		//	//lucid.log("Crosstalk API: No events to process...");
		//	this.setup_timer();
		//}
		//else { // handlers found. ask to obtain any events.
			//lucid.log("Crosstalk API: Checking for events...");
        	lucid.xhr({
	        	backend: "api.crosstalk.io.checkForEvents",
				handleAs: "json",
	        	load: dojo.hitch(this, function(data){
                    dojo.forEach(data, function(msg){
                        this.msgQueue.push(msg);
                    }, this);
                    this._internalCheck2();
                }),
	        	error: function(type, error){ lucid.log("Error in Crosstalk call: "+error.message); }
        	});
		//}
	},
	exists: function(/*Int?*/id, /*Function*/onComplete, /*Function?*/onError)
	{
		//	summary:
		//		checks to see if an event exists
		//	id:
		//		the event ID to check
		//	onComplete:
		//		returns true exists or false nonexistant
        //	onError:
        //	    if there was error trying to find out if it exists, this will be called
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
   		lucid.xhr({
	    	backend: "api.crosstalk.io.eventExists",
   			handleAs: "json",
			content: {
				id: id
			},
			load: function(data, ioArgs){
				d.callback(data.exists);
			},
	    	error: function(type, error){
				lucid.log("Error in Crosstalk call: "+error.message);
                d.errback(error);
				this.setup_timer();
		    }
	    });
        return d; // dojo.Deferred
	},	
	publish: function(/*String*/topic, /*Array*/args, /*Int?*/userid, /*String*/appsysname, /*Int?*/instance, /*Function?*/onComplete, /*Function?*/onError)
	{
		//	summary:
		//		publish an event to be sent
		//	topic:
		//		the topic name to publish
		//	args:
		//		the arguments to pass to the handler
		//	userid:
		//		the specific user to send the event to.
		//		Omit to send to all users (the current user must be an admin to do this)
		//	appsysname:
		//		the appname to send it to. Omit to send as a system event
		//	instance:
		//		the specific app instance to send it to.
		//		omit to send it to all instances
		//	onComplete:
		//		will return a ID to cancel the request
        //	onError:
        //	    if there was an error when trying to publish the message, this will be called
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
        if(!userid){
            //publish locally
            this.msgQueue.push({topic: topic, instance: instance, appsysname: appsysname, sender: null});
            return;
        }
    	lucid.xhr({
	    	backend: "api.crosstalk.io.sendEvent",
			number: true,
			content: {
				topic: topic,
				userid: userid || -1,
				args: dojo.toJson(args),
				appsysname: appsysname || -1,
				instance: instance || -1
			},
			load: function(data, ioArgs){
				d.callback(data);
			},
	    		error: function(type, error){
				lucid.log("Error in Crosstalk call: "+error.message);
                d.errback(error);
				this.setup_timer();
			}
    	});
        return d; // dojo.Deferred
	},

	cancel: function(/*Int?*/id, /*Function*/onComplete, /*Function?*/onError)
	{
		//	summary:
		//		cancel a pending event
		//	id:
		//		the event ID to cancel
		//	onComplete:
		//		returns when cancel was successful
        //	onError:
        //	    If you don't have permission to cancel the event, or there was an error, this will be called.
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);

    	lucid.xhr({
	    	backend: "api.crosstalk.io.cancelEvent",
			content: {
				id: id
			},
			load: function(data, ioArgs){
				d[data == "0" ? "callback" : "errback"]();
			},
	    		error: function(type, error){
				lucid.log("Error in Crosstalk call: "+error.message);
                d.errback(error);
				this.setup_timer();
			}
    	});
        return d; // dojo.Deferred
	},
	
	_internalCheck2: function()
	{	
		//summary:
		//		the crosstalk api checker, stage2, compare the results with the handled handlers
		var data = this.msgQueue;
		if(data.length == 0){ this.setup_timer(); return; }
		// No events here.
		try {
			var checkForHandler = dojo.hitch(this, function(event){
				//cycle through the handlers stored and find a handler for the event
				var handled = false;
                dojo.forEach(this.session, function(handler){
					//A subscribed handler is required
					if(typeof handler == "undefined") return false;
					//matching the appid and topic are required
					if(handler.appsysname == event.appsysname
					&& handler.topic == event.topic){
						//matching the instance isn't
						//but if it's provided and this handler is not of he correct instance, return
						if(event.instance != -1
						&& event.instance != handler.instance) return false;
						//check to see if the topic matches
						if(event.topic != handler.topic) return false;
						//ok, we found a match
						var args = dojo.fromJson(event.args);
						args._crosstalk = {topic: event.topic, instance: event.instance, appsysname: event.appsysname, sender: event.sender};
						handler.callback(args);
						handled = true;
						return true;
					}
				}, this);
                return handled;
			})
			
            dojo.forEach(data, function(event, key){
                if(!event) return;
				var handled = checkForHandler(event);
				if(handled == false && (event.instance == -1 || event.instance == "null")){
					if(!event.appsysname) return; //system call - TODO: Handle?
					//check to see if there's allready an instance of this app running
					var instances = lucid.app.getInstances();
					for(var i=0;i<instances.length;i++){
						//if there is allready an instance running, it must not handle any crosstalk events. Skip the event.
						if(instances[i].sysname == event.appsysname) return;
					}
					//otherwise, launch the app
					lucid.app.launch(event.appsysname, {crosstalk: true}, dojo.hitch(this, function(app){
						//check for a handler again
						var handled = checkForHandler(event);
						//if there's still no handler, kill the app
						if(handled == false) app.kill();
					}))
				}
                delete data[key];
			}, this);
		}
		catch(err){
			console.log(err);
		}
		this.setup_timer();
	},
	init: function()
	{
		// start checking for events
		var listener = dojo.subscribe("configApply", dojo.hitch(this, function(){
            this.setup_timer();
            dojo.unsubscribe(listener);
        }));
		// internal events
		this.subscribe("quotaupdate", dojo.hitch(this, function(){
			dojo.publish("fsSizeChange", ["file://"]);
		}));
		this.subscribe("accountremoval", dojo.hitch(this, function(){
			lucid.user.logout();
		}));
	},
	setup_timer: function()
	{
		//	summary:
		//		Starts checking the server for messages
        var time = lucid.config.crosstalkPing || 100000;
        this.timer = setTimeout(dojo.hitch(this, "_internalCheck"), time);
        setTimeout(function(){
            dojo.publish("crosstalkInit", []);
        }, time+200);
	},
	stop: function()
	{
		//	summary:
		//		Stops crosstalk from checking the server for messages
		clearTimeout(this.timer);
	}
}
