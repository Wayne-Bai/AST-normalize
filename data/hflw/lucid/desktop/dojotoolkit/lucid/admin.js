dojo.provide("lucid.admin");

lucid.admin = {
    init: function(){
        lucid.xhr({
            backend: "core.user.info.isAdmin",
            load: function(data){
                lucid.admin.isAdmin = data.isAdmin;
            },
            sync: true,
            handleAs: "json"
        });
    },
    //  isAdmin: Boolean
    //      Is the current user an administrator?
    isAdmin: null,
	//	summary:
	//		Contains administration functions
	//		The user must be an administrator to use these, otherwise the
	//		server-side code will prevent any action from being taken.
	diskspace: function(/*Function*/onComplete, /*Function?*/onError){
		//	summary:
		//		Gets the amount of free space on the server
		//	onComplete:
		//		a callback function. Passes an object as an argument with two properties: 'free', and 'total'
        //	onError:
        //	    if there was an error with the request, this will be called.
		return lucid.xhr({
			backend: "core.administration.general.diskspace",
			load: onComplete,
            error: onError,
			handleAs: "json"
		}); // dojo.Deferred
	},
	shares: {
		//	summary:
		//		Share management
		list: function(/*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		List the permissions on the system
			//  onComplete:
			//		a callback function to pass the results to.
			//		The callback will get a single array of values as it's first argument.
			//		Each slot in the array will be a lucid.admin.permissions._listArgs object with the permission's information
            //	onError:
            //	    if there was a problem, then this will be called
			return lucid.xhr({
				backend: "core.administration.shares.list",
				load: onComplete,
                error: onError,
				handleAs: "json"
			}) // dojo.Deferred
		},
		add: function(/*lucid.admin.shares._listArgs*/args){
			//	summary:
			//		Creates a new share
			var d = new dojo.Deferred();
			if(args.onComplete) d.addCallback(args.onComplete);
			if(args.onError) d.addErrback(args.onError);
			lucid.xhr({
				backend: "core.administration.shares.add",
				content: args,
				load: function(data){
					d.callback(data.id);
				},
				error: dojo.hitch(d, "errback"),
				handleAs: "json"
			})
			return d; // dojo.Deferred
		},
		remove: function(/*Integer*/id, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		Remove a share from the system
            var d = new dojo.Deferred();
            if(onComplete) d.addCallback(onComplete);
            if(onError) d.addErrback(onError);
			lucid.xhr({
				backend: "core.administration.shares.delete",
				content: {
					id: id
				},
				load: function(data){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "onError")
			});
            return d; //dojo.Deferred
		},
		set: function(/*lucid.admin.shares._listArgs*/args){
			//	summary:
			//		Set share information
            var d = new dojo.Deferred();
			if(args.onComplete) d.addCallback(args.onComplete);
            if(args.onError) d.addErrback(args.onError);
			if(typeof args.groups != "undefined") args.groups = dojo.toJson(args.groups);
			lucid.xhr({
				backend: "core.administration.shares.set",
				content: args,
				load: function(data){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "errback")
			})
            return d; // dojo.Deferred
		},
		getGroups: function(/*Integer*/id, /*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		Get the groups of a share
			//	id:
			//		the id of the group to get the members of
			//	onComplete:
			//		callback function. First argument is an array of the users. See lucid.user.get for the attributes of each object in the array.
            //	onError:
            //	    if there was an error, this will be called
			return lucid.xhr({
				backend: "core.administration.shares.getGroups",
				content: {
					id: id
				},
				load: onComplete,
                error: onError,
				handleAs: "json"
			}); // dojo.Deferred
		},
		addGroup: function(/*Int*/id, /*String*/name, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		adds a group to a share
			//  id:
			//		the share id
			//	name:
			//		the group nane
			//	onComplete:
			//		a callback for once the operation has been completed
            //	onError:
            //	    if there was a problem, this will be called
			return lucid.xhr({
				backend: "core.administration.shares.addGroup",
				content: {
					shareid: id,
					groupname: name
				},
				load: onComplete,
                error: onError
			}); // dojo.Deferred
		},
		removeGroup: function(/*Integer*/id, /*Str*/name, /*Function?*/onComplete, onError){
			//	summary:
			//		removes a group from a share
			//	id:
			//		the share ID
			//	name:
			//		the group name
			//	callback:
			//		a callback for once the operation has been completed
			return lucid.xhr({
				backend: "core.administration.shares.removeGroup",
				content: {
					shareid: id,
					groupname: name
				},
				load: onComplete,
                error: onError
			}); // dojo.Deferred
		}
	},
	permissions: {
		//	summary:
		//		Permission/group management
		/*=====
		_listArgs: {
			//	name: String
			//		the name of the permission
			name: "",
			//	description: String
			//		what this permission restricts
			description: "",
			//	initial: Boolean
			//		the default value if it's not specified by the user's groups/permissions
			initial: true
		},
		=====*/
		list: function(/*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		List the permissions on the system
			//  onComplete:
			//		a callback function to pass the results to.
			//		The callback will get a single array of values as it's first argument.
			//		Each slot in the array will be a lucid.admin.permissions._listArgs object with the permission's information
            //	onError:
            //	    if there was a problem, then this will be called
			return lucid.xhr({
				backend: "core.administration.permissions.list",
				load: onComplete,
                error: onError,
				handleAs: "json"
			}) // dojo.Deferred
		},
		setDefault: function(/*String*/permission, /*Boolean*/value, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		Set the default value of a permission
			//	permission:
			//		the id of the permission to modify
			//	value:
			//		the default value of the permission
			//	callback:
			//		a callback function once the operation is completed
            var d = new dojo.Deferred();
            if(onComplete) d.addCallback(onComplete);
            if(onError) d.addErrback(onError);
			lucid.xhr({
				backend: "core.administration.permissions.setDefault",
				content: {
					id: permission,
					value: value
				},
				load: function(data){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "errback")
			});
            return d; // dojo.Deferred
		}
	},
	groups: {
		//	summary:
		//		Group management functions
		/*=====
		_listArgs: {
			//	name: String
			//		the name of the permission
			name: "",
			//	description: String
			//		what this permission restricts
			description: "",
			//	permissions: Object
			//		An object with permission information for the group
			permissions: {},
            //  onComplete: Function
            //      when a response is received, this will be called
            onComplete: function(items){},
            //  onError: Function?
            //      if there was an error, this will be called
            onError: function(){}
		},
		=====*/
		list: function(/*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		Lists groups on the server
			//	onComplete:
			//		a callback function. First arg is an array with lucid.admin.groups._listArgs objects (without the onComplete or onError functions)
            //	onError:
            //	    if there was an error, this will be called
			return lucid.xhr({
				backend: "core.administration.groups.list",
				load: onComplete,
                error: onError,
				handleAs: "json"
			}); // dojo.Deferred
		},
		add: function(/*lucid.admin.groups._listArgs*/args){
			//	summary:
			//		Creates a new group
            var d = new dojo.Deferred();
			if(args.onComplete) d.addCallback(args.onComplete);
            if(args.onError) d.addErrback(args.onError);
			args.permissions = dojo.toJson(args.permissions || {});
			lucid.xhr({
				backend: "core.administration.groups.add",
				content: args,
				load: function(data){
					d.callback(data.id);
				},
                error: dojo.hitch(d, "errback"),
				handleAs: "json"
			})
            return d; // dojo.Deferred
		},
		remove: function(/*Integer*/id, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		Remove a group from the system
			//	id:
			//		the id of the group to remove
			//	onComplete:
			//		a callback function once the operation is complete
            //	onError:
            //	    if there was an error, this will be called.
            var d = new dojo.Deferred();
            if(onComplete) d.addCallback(onComplete);
            if(onError) d.addErrback(onError);
			lucid.xhr({
				backend: "core.administration.groups.delete",
				content: {
					id: id
				},
				load: function(data){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "onError")
			});
            return d; //dojo.Deferred
		},
		set: function(/*lucid.admin.groups._listArgs*/args){
			//	summary:
			//		Set group information
            var d = new dojo.Deferred();
			if(args.onComplete) d.addCallback(args.onComplete);
            if(args.onError) d.addErrback(args.onError);
			if(typeof args.permissions != "undefined") args.permissions = dojo.toJson(args.permissions);
			lucid.xhr({
				backend: "core.administration.groups.set",
				content: args,
				load: function(data){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "errback")
			})
            return d; // dojo.Deferred
		},
		getMembers: function(/*Integer*/id, /*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		Get the members of a group
			//	id:
			//		the id of the group to get the members of
			//	onComplete:
			//		callback function. First argument is an array of the users. See lucid.user.get for the attributes of each object in the array.
            //	onError:
            //	    if there was an error, this will be called
			return lucid.xhr({
				backend: "core.administration.groups.getMembers",
				content: {
					id: id
				},
				load: onComplete,
                error: onError,
				handleAs: "json"
			}); // dojo.Deferred
		},
		addMember: function(/*Integer*/id, /*Ineger*/userid, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		adds a user to a group
			//	id:
			//		the group ID
			//	userid:
			//		the user's id
			//	onComplete:
			//		a callback for once the operation has been completed
            //	onError:
            //	    if there was a problem, this will be called
            var d = new dojo.Deferred();
            if(onComplete) d.addCallback(onComplete);
            if(onError) d.addErrback(onError);
			lucid.xhr({
				backend: "core.administration.groups.addMember",
				content: {
					groupid: id,
					userid: userid
				},
				load: function(data){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "errback")
			})
            return d; // dojo.Deferred
		},
		removeMember: function(/*Integer*/id, /*Integer*/userid, /*Function?*/callback){
			//	summary:
			//		removes a user from a group
			//	id:
			//		the group ID
			//	userid:
			//		the user's id
			//	callback:
			//		a callback for once the operation has been completed
            var d = new dojo.Deferred();
            if(onComplete) d.addCallback(onComplete);
            if(onError) d.addErrback(onError);
			lucid.xhr({
				backend: "core.administration.groups.removeMember",
				content: {
					groupid: id,
					userid: userid
				},
				load: function(data){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "errback")
			})
            return d; // dojo.Deferred
		}
	},
	users: {
		//	summary:
		//		Some user management functions
		//		for modifying user information see lucid.user
		list: function(/*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		list all users on the system
			//	onComplete:
			//		a callback function. Gets passed an array of lucid.user._setArgs objects
            //	onError:
            //	    if there was a problem, this will be called
			return lucid.xhr({
				backend: ("core.administration.users.list"),
				load: onComplete,
                error: onError,
                handleAs: "json"
			}); // dojo.Deferred
		},
		create: function(/*lucid.user._setArgs*/info){
			//	summary:
			//		Creates a user on the system
			//	info:
			//		A lucid.user._setArgs object, however, the callback gets passed the id of the new user as it's first argument.
			//		Also, you cannot specify the user's id. it is generated by the server.
            var d = new dojo.Deferred();
            if(info.onComplete) d.addCallback(info.onComplete);
            if(info.onError) d.addErrback(info.onError);
			info.permissions = dojo.toJson(info.permissions || []);
			info.groups = dojo.toJson(info.groups || []);
			lucid.xhr({
				backend: "core.administration.users.create",
				content: info,
				load: function(data){
					d.callback(data.id);
				},
                error: dojo.hitch(d, "errback"),
				handleAs: "json"
			});
            return d; // dojo.Deferred
		},
		remove: function(/*Integer*/id, /*Function*/onComplete, /*Function?*/onError)
		{
			//	summary:
			//		Permanently removes (deletes) a user from the system
			//	id:
			//		the id of the user to delete (NOT the username)
			//	onComplete:
			//		a callback function once the process is complete. passes a single parameter.
			//		If it's false the user's deletion failed. If true, it was successful.
            //	onError:
            //	    if there was a problem, this will be called
            var d = new dojo.Deferred();
            if(onComplete) d.addCallback(onComplete);
            if(onError) d.addErrback(onError);
			lucid.xhr({
				backend: "core.administration.users.delete",
				content: {
					id: id
				},
				load: function(data, ioArgs){
					d[data == "0" ? "callback" : "errback"]();
				},
                error: dojo.hitch(d, "errback")
			});
            return d; // dojo.Deferred
		},
		online: function(/*Function*/onComplete, /*Function?*/onError){
			//	summary:
			//		Gets the number of users currently using the system.
			//  onComplete:
			//		a callback function. Passes a single object as a parameter, with two keys;
			//		'total', the total number of users on the system, and 'online', the number of users currently online. 
			//		Both are integers.
            //	onError:
            //	    If there was an error, this will be called
			return lucid.xhr({
				backend: "core.administration.users.online",
				load: onComplete,
                error: onError,
				handleAs: "json"
			}); // dojo.Deferred
		}
	},
	quota: {
		//	summary:
		//		methods that can be used to set default quotas for objects on the system (groups, users)
		//	description:
		//		Quotas restrict the ammount of disk usage a user or group can use.
		//		If a quota is set to 0, then the quota would be limitless.
		//		if a specific object has a quota of -1, then it looks up the default quota for a user or group.
		//		you can use these functions to set that default value.
		list: function(/*Function*/onComplete, /*Function*/onError){
			//	summary:
			//		list the different quotas that you can set
            //	onComplete:
            //	    a callback method. First argument is the list of each quota. Example: [{"type":"user","size":"26214400"},{"type":"group","size":"0"}]
			return lucid.xhr({
				backend: "core.administration.quota.list",
				load: onComplete,
                error: onError,
				handleAs: "json"
			}) // dojo.Deferred
		},
		set: function(/*Object*/quotas, /*Function?*/onComplete, /*Function?*/onError){
			//	summary:
			//		Sets a default quota for a system object
			//	quotas:
			//		an object containing each quota's new value.
			//		quota sizes are in bytes.
			//		|{
			//		|	user: 1024,
			//		|	group: 0
			//		|}
            //	onComplete:
            //	    when the operation is complete, this will be called
            //	onError:
            //	    if there was a problem, this will be called
			return lucid.xhr({
				backend: "core.administration.quota.set",
				content: {
					quotas: dojo.toJson(quotas)
				},
				load: onComplete,
                error: onError
			}); // dojo.Deferred
		}
	}
}
