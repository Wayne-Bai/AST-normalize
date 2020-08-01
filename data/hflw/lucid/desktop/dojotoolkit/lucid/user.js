dojo.provide("lucid.user");
dojo.require("dojox.encoding.base64");

lucid.user = {
	//	summary:
	//		functions that can be used to do user-related tasks
	init: function(){
		this.beforeUnloadEvent = dojo.addOnUnload(dojo.hitch(this, "quickLogout"));
        //makes sure we appear logged in according to the DB
        lucid.xhr({
            backend: "core.user.auth.quickLogin"
        });
	},
	/*=====
	_getArgs: {
		//	id: Integer?
		//		the Id of the user. If not provided, you must provide a name, username, or email.
		id: 1,
		//	name: String?
		//		the name of the user.
		name: "",
		//	username: String?
		//		the username of the user.
		username: "",
		//	email: String?
		//		the email of the user.
		email: "",
        //  users: Array?
        //      An array that contains objects with "id", "name", "username" and/or "email" params. Use this to fetch information in bulk.
        users: [],
		//	onComplete: Function
		//		A callback function. First argument is a lucid.user._setArgs object, excluding the callback property
        //		If the 'users' param is provided, the first argument will be an array lucid.user._setArgs, one for each object provided.
		onComplete: function(info){},
        //  onError: Function?
        //      if there was a problem while fetching the information, this will be called
        onError: function(){}
	},
	=====*/
	get: function(/*lucid.user._getArgs*/options){
		//	summary:
		//		Gets the information of a certain user
        var d = new dojo.Deferred();
        if(options.onComplete) d.addCallback(options.onComplete);
        if(options.onError) d.addErrback(options.onError);
        var fixParams = function(o){
    		if(!o.id && !o.username && !o.email){ o.id = "0"; }
            if(o.onComplete)
                delete o.onComplete;
            if(o.onError)
                delete o.onError;
            return o;
        }
        var objs = [];
        if(options.users){
            dojo.forEach(options.users, function(user){
                objs.push(fixParams(user));
            });
        }else{
            objs = [fixParams(options)];
        }
		lucid.xhr({
	        backend: "core.user.info.get",
			content: {
				users: dojo.toJson(objs)
			},
	        load: function(data, ioArgs){
                if(options.users)
                    d.callback(data);
                else
                    d.callback(data[0]);
			},
            error: dojo.hitch(d, "errback"),
            handleAs: "json"
        });
        return d; // dojo.Deferred
	},
	/*=====
	_setArgs: {
		//	id: Integer
		//		the user's id. If excluded, the current user will be used
		id: 1,
		//	name: String?
		//		the user's new name. Stays the same when not provided.
		name: "Foo Barson", //
		//	username: String?
		//		the user's username. Cannot change if you're not the admin. Stays the same when not provided.
		username: "foobar",
		//	email: String?
		//		the user's new email. Stays the same when not provided.
		email: "foo@bar.com",
		//	permissions: Array?
		//		the user's new permissions. Stays the same when not provided. Must be an admin to set.
		permissions: [],
		//	groups: Array?
		//		the user's new groups. Stays the same when not provided. Must be an admin to set.
		groups: [],
		//	quota: Integer?
		//		the user's disk quota, in bytes
        quota: 0,
		//	onComplete: Function?
		//		a callback function. Not required.
		onComplete: function(){},
        //  onError: Function?
        //      if there was an error while setting the info, then this will be called.
        onError: function(){}
	},
	=====*/
	set: function(/*lucid.user._setArgs*/op){
		//	summary:
		//		changes a user's information
        var d = new dojo.Deferred();
        if(op.onComplete) d.addCallback(op.onComplete);
        if(op.onError) d.addErrback(op.onError)
		if(op.password){
			//base64 encode it
			var b = [];
			for(var i = 0; i < op.password.length; ++i){
				b.push(op.password.charCodeAt(i));
			}
			op.password = dojox.encoding.base64.encode(b);
			delete b;
		}
		if(typeof op.permissions != "undefined") op.permissions = dojo.toJson(op.permissions);
		if(typeof op.groups != "undefined") op.groups = dojo.toJson(op.groups);
		lucid.xhr({
			backend: "core.user.info.set",
			content: op,
			load: dojo.hitch(d, "callback"),
            error: dojo.hitch(d, "errback")
		})
        return d; // dojo.Deferred
	},
	logout: function()
	{
		//	summary:
		//		logs a user out
		lucid.config.save(true, false);
		dojo.publish("desktoplogout", []);
		lucid.xhr({
			backend: "core.user.auth.logout",
			sync: true,
			load: function(data, ioArgs){
				if(data == "0")
				{
					dojo.style(document.body, "display", "none");
					history.back();
					window.close();
				}
				else
				{
					lucid.log("Error communicating with server, could not log out");
				}
			}
		});
	},
    quickLogout: function(){
        //  summary:
        //      Logs a user out, but doesn't clear their session.
        //      This basically just sets their 'logged' property to false in the database, so they appear to be logged out
        lucid.config.save(true, false);
        if(lucid.reload){ return false; }
        lucid.xhr({
            backend: "core.user.auth.quickLogout",
            sync: true
        });
    },
	authenticate: function(/*String*/password, /*Function?*/onComplete, /*Function?*/onError){
		//	summary:
		//		re-authenticates the user so that he/she can change their password
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		//first, base64 encode the password to stay at least somewhat secure
		var b = [];
		for(var i = 0; i < password.length; ++i){
			b.push(password.charCodeAt(i));
		}
		password = dojox.encoding.base64.encode(b);
		delete b;
		//then, send it to the server
		lucid.xhr({
			backend: "core.user.auth.login",
			content: {
				password: password
			},
			load: function(data){
				d[data == "0" ? "callback" : "errback"]();
			},
            error: dojo.hitch(d, "errback")
		})
        return d; // dojo.Deferred
	}
}
