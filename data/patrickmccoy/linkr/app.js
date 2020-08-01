/**
 *  Configuration Variables
 */

var host = 'localhost',
    port = 3001;


/**
 * Module dependencies.
 */

var express = require('express'),
	mongoose = require('mongoose');
	
var RedisStore = require('connect-redis')(express);
	
var db = mongoose.connect('mongodb://localhost/linkr');

var app = module.exports = express.createServer();




/**
 * Models 
 */
 
var users = require('./models/user').Users(db);
var links = require('./models/link').Links(db);


// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', {
			layout: true,
			title: 'linkr'
	});
	app.use(express.logger({ format: 'date=":date"\taddr=:remote-addr\tresponse_time=:response-time\tmethod=:method\turl=:url\tstatus=:status\treferrer=:referrer\tuser_agent=":user-agent"' }));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'keyboard cat', store: new RedisStore }));
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
	

});

app.configure('development', function(){
	
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
});


/**
 * Error Handling
 */

// NotFound hanldes not found errors
function NotFound(msg) {
	this.name = 'NotFound';
	this.msg = msg;
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;

// AuthError handles authentication errors
function AuthError(msg) {
	this.name = 'AuthError';
	this.msg = msg;
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}
AuthError.prototype.__proto__ = Error.prototype;

// APIAuthError handles errors regarding authentication when using the API
// Argument is an object with the HTTP response code and the txt message to display to the user
function APIAuthError(msg) {
	this.name = 'APIAuthError';

	this.msg = msg;
	this.msg.type = this.name;
	
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}
APIAuthError.prototype.__proto__ = Error.prototype;

// APINotFound hanldes not found errors for API endpoints
// Argument is an object with the HTTP response code and the txt message to display to the user
function APINotFound(msg) {
	this.name = 'APINotFound';
	this.msg = msg;
	this.msg.type = this.name;
	
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}
APINotFound.prototype.__proto__ = Error.prototype;

// APIError handles general API errors
// Takes either a string, or an object as the single argument with the code and the text
function APIError(msg) {
	this.name = 'APIError';
	if (msg instanceof Object) {
		this.msg = msg;
	} else {
		this.msg = {};
		this.msg.code = 500;
		this.msg.txt = msg;
	}
	
	this.msg.type = this.name;
	
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}
APIError.prototype.__proto__ = Error.prototype;



// NotFound errors
app.error(function(err, req, res, next) {
	if (err instanceof NotFound) {
		res.header('Content-Type', 'text/html; charset=utf-8');
		res.render('error/404', { title: 'linkr: not found', status: 404, message: err.msg });
	} else {
		next(err);
	}
});

// AuthError errors
app.error(function(err, req, res, next) {
	if (err instanceof AuthError) {
		res.header('Content-Type', 'text/html; charset=utf-8');
		res.render('error/403', { title: 'linkr: forbidden', status: 403, message: err.msg });
	} else {
		next(err);
	}
});

// APIAuthError errors
app.error(function(err, req, res, next) {
	if (err instanceof APIAuthError) {
		var response  = {},
			code = err.msg.code,
			headers = { 'Content-Type': 'application/json; charset=utf-8' };
		
		response.error = err.msg;
		
		// send the response
		res.send(JSON.stringify(response), headers, code);
	} else {
		next(err);
	}
});

// APINotFound errors
app.error(function(err, req, res, next) {
	if (err instanceof APINotFound) {
		var response  = {},
			code = err.msg.code,
			headers = { 'Content-Type': 'application/json; charset=utf-8' };
		
		response.error = err.msg;
		
		// send the response
		res.send(JSON.stringify(response), headers, code);
	} else {
		next(err);
	}
});


// APIError errors
app.error(function(err, req, res, next){
	if (err instanceof APIError) {
		var response  = {},
			code = err.msg.code,
			headers = { 'Content-Type': 'application/json; charset=utf-8' };
		
		response.error = err.msg;
		
		// send the response
		res.send(JSON.stringify(response), headers, code);
	} else {
		next(err);
	}
});

// All other errors
app.error(function(err, req, res, next){
	res.header('Content-Type', 'text/html; charset=utf-8');
	res.render('error/500', { title: 'linkr', status: 500, message: err.msg });
});




/**
 * Helper Middleware
 */

var auth = function(req, res, next) {
	if (req.session.security && (req.session.security.status == 'OK')) {
		next();
	} else {
		res.redirect('/login?redirect='+req.url);
	}
}

var restrictTo = function(role) {
  return function(req, res, next) {
    req.session.security.role == role
      ? next()
      : next(new AuthError('You are forbidden to see this page.'));
  }
}

// Routes

app.get('/', function(req, res){
    var user = false;
    if (req.session.security) {
        user = req.session.security.user;
    }
	res.render('index', {
		  title: 'linkr'
		, user: user
		, path: req.route.path
	});
});

app.get('/create', function(req, res){
    var user = false;
    if (req.session.security) {
        user = req.session.security.user;
    }
	res.render('create', {
	 	  title: 'linkr | create'
	 	, user: user
		, path: req.route.path
	});
});

app.post('/create', function(req, res){
	if (req.body.email && req.body.pass && (req.body.pass === req.body.confirm) && req.body.first && req.body.last) {
		var user = new users();
		user.first = req.body.first;
		user.last = req.body.last;
		user.role = 'user';
		user.email = req.body.email;
		user.password = req.body.pass;
		
		user.save(function(err){
			if (!err) {
				// set the session and redirect
				var security = {};
				security.user = user.serialize();
				security.status = 'OK';
				security.role = user.role;
			
				req.session.security = security;
				
				res.redirect('/home');
			} else {
				throw new Error('User Save Error!');
			}
		});
		
	} else  {
		res.redirect('back');
	}
});

app.get('/login', function(req, res){
    var user = false;
    if (req.session.security) {
        user = req.session.security.user;
    }
	res.render('login', {
		  title: 'linkr'
		, user: user
		, path: req.route.path
	})
});

app.post('/login', function(req, res){
	users.findOne({ email: req.body.email }).run(function(err, user){
		if (!err && user) {
			
			if (user.authenticate(req.body.password)) {
				// set the user in the request object
				var security = {};
				security.user = {};
				security.user = user.serialize();
				security.status = 'OK';
				security.role = user.role;
				
				req.session.security = security;
				
				if (req.body.remember_me) {
					var day = 3600000 * 24,
						month = day*30;
					req.session.cookie.expires = new Date(Date.now() + month);
					req.session.cookie.maxAge = month;
				}
				
				req.session.save();

				if (req.query.redirect) {
					res.redirect(req.query.redirect);
				} else {
					res.redirect('/home');
				}
				
			} else {
				res.redirect('/login');
			}
		} else if (err) {
    		throw new Error('Database error');
    	} else {
			res.redirect('/logout');
		}

	});

});

app.get('/logout', function(req, res){
	req.session.destroy();
	res.redirect('home');
});

/**
 * Authenticated Routes
 */
 
app.get('/account', auth, function(req, res){
	users.findById(req.session.security.user.id).run(function(err, user){
		if (!err && user) {
			res.render('account', {
				title: 'linkr | edit account',
				user: req.session.security.user,
				notifications: req.flash('account'),
				path: req.route.path
			});
		} else if (err) {
			throw new Error('Database error');
		} else {
			res.redirect('/logout');
		}
	});
	
});

app.put('/account', auth, function(req, res){
	users.findById(req.session.security.user.id).run(function(err, user){
		if (!err && user) {
		
			if (req.body.first != '' && (req.body.first != user.first)) {
				user.first = req.body.first;
				req.flash('account','First name updated');
			}
			if (req.body.last != '' && (req.body.last != user.last)) {
				user.last = req.body.last;
				req.flash('account','Last name updated');
			}
			if (req.body.email != '' && (req.body.email != user.email)) {
				user.email = req.body.email;
				req.flash('account','Email updated');
			}
			
			if (req.body.password && req.body.confirm) {
			 	if (req.body.password == req.body.confirm) {
					user.password = req.body.password;
					req.flash('account','Password updated');
				} else {
					req.flash('account','Your passwords must match');
				}
			}
			
			user.save(function(err){
				if (!err) {
					res.redirect('back')
				} else {
					throw new Error('User Save Error!');
				}
			});
			
			req.session.security.user = user.serialize();
			
		} else if (err) {
			throw new Error('Database error');
		} else {
			res.redirect('/logout');
		}
	});
});

app.get('/home', auth, function(req, res){
	links.find().where('owner', req.session.security.user.id).where('read', false).desc('priority').asc('time').run(function(err, link){
		if (!err && link) {
			res.render('home', {
				  title: 'linkr'
				, user: req.session.security.user
				, path: req.route.path
			});
		} else if (err) {
    		throw new Error('Database error');
    	} else {
			res.render('home', {
				  title: 'linkr'
				, user: req.session.security.user
				, path: req.route.path
			});
		}
		
	});
	
});

app.get('/home/add', auth, function(req, res){
	res.render('home/add', {
		  title: 'linkr | add'
		, user: req.session.security.user
		, path: req.route.path
	});
});

app.post('/home/add', auth, function(req, res){
	var link = new links();
	link.owner = req.session.security.user.id;
	link.link = req.body.url;
	
	link.save(function(err){
		if (!err) {
			res.redirect('/home');
		} else {
			throw new Error('Link Save Error!');
		}
	});
	
});

app.get('/home/archive', auth, function(req, res){
	links.find().where('owner',req.session.security.user.id).sort('time', -1).run(function(err, link){
		res.render('home', {
			title: 'linkr | link archive'
		  , user: req.session.security.user
		  , path: req.route.path
		});
	});
});

app.get('/link/:id', auth, function(req, res){
	links.findById(req.params.id, function(err, lnk){
		if (!err && lnk && (lnk.owner == req.session.security.user.id)) {
			lnk.read = true;
			lnk.readTime = new Date();
			lnk.save(function(err){
				if (!err) {
					res.redirect(lnk.link);
				} else {
					throw new Error('Link Save Error!');
				}
			});
		} else {
		
		}
	});
});

/**
 * API helper functions
 */

var APIAuth = function(req, res, next) {
	if (req.session.security && (req.session.security.status == 'OK')) {
		next();
	} else {
		next(new APIAuthError({ code: 403, txt: 'You must authenticate to view this content' }));
	}
}

var APIRestrictTo = function(role) {
	return function (req, res, next) {
		req.session.security.role == role
		  ? next()
		  : next(new APIAuthError({ code: 403, txt: 'You are forbidden to see this page.' }));
	}
}

var APILoadUser = function(req, res, next) {
	var user_id = (req.params.id) ? req.params.id : req.session.security.user.id;
	
	users.findById(user_id).run(function(err, user) {
		if (!err) {
			if (user) {
				req.user = user;
				next();
				
			} else {
				next(new APINotFound({ code: 404, txt: 'No content at this URI endpoint' }));
			}
		} else {
			next(new APIError('API Request Failed'));
		}
	});
}

var APILoadLink = function(req, res, next) {
	if (req.params.id) {
		
		links.findById(req.params.id).run(function(err, link) {
			if (!err) {
				if (link) {
					req.link = link;
					next();
					
				} else {
					next(new APINotFound({ code: 404, txt: 'No content at this URI endpoint' }));
				}
			} else {
				next(new APIError('API Request Failed'));
			}
		});
	} else {
		next(new APIError('You must provide a link id for this endpoint!'));
	}
}

// send the API Response
var API_Send  = function(req, res, data, code) {
    // default values
    code = code || 200;
    
    // the response depends on the callback query param, if callback is specified, then we return a JSONp response
    if (req.query.callback) {
        // set the content type
		res.header('Content-Type', 'application/x-javascript; charset=utf-8');
		// send the data
		res.send(req.query.callback+'('+JSON.stringify(data)+')', code);
	} else {
	    // set the content type
		res.header('Content-Type', 'application/json; charset=utf-8');
		// send the data
		res.send(JSON.stringify(data), code);
	}
}

/**
 * API Routes
 */


// Authentication and default content-type header for all api requests
app.all('/api', APIAuth, function(req, res, next){
	next();
});
app.all('/api/*', APIAuth, function(req, res, next){
	next();
});

/**
 * Link endpoints
 */

// return a list of all unread links for an authenticated user
app.get('/api', function(req, res, next){
	links.find().where('owner', req.session.security.user.id).where('read', false).desc('priority').asc('time').run(function(err, links){
		if (!err && links) {
			var response = { items: [], totalItems: links.length };
			
			links.forEach(function(lnk){
				response.items.push(lnk.serialize());
			});
			
			API_Send(req, res, response);
			
		} else {
			next(new APIError('API Request Failed'));
		}
	});
});

app.get('/api/archive', function(req, res, next){
	links.find({ owner: req.session.security.user.id }).sort('time', -1).run(function(err, links){
		if (!err && links) {
			var response = { items: [], totalItems: links.length };
			
			links.forEach(function(lnk){
				response.items.push(lnk.serialize());
			});
			
			API_Send(req, res, response);
		} else {
			next(new APIError('API Request Failed'));
		}
	});
});

// get the latest unread link for the user
app.get('/api/latest', function(req, res, next){
	links.find({ owner: req.session.security.user.id, read: false },[]).sort('priority', -1, 'time', 1).limit(1).run(function(err, links){
		if (!err) {
			if (links) {
				var response = links[0].serialize();
				
				API_Send(req, res, response);
				
			} else {
				var response = { user: req.session.security.user.id, error: { code: 204, type: 'NoContent', msg: 'You have no content to display!' } };
				API_Send(req, res, response);
			}
			
		} else {
			next(new APIError('API Request Failed'));
		}
	});
});

app.get('/api/link/:id', function(req, res, next){
	links.findById(req.params.id, function(err, lnk){
		if (!err) {
			if (lnk){
				if (lnk.owner == req.session.security.user.id) {
					var response = lnk.serialize();
					
					API_Send(req, res, response);
					
				} else {
					next(new APIAuthError({ code: 403, txt: 'You are forbidden from seeing this content' }));
				}
			} else {
				next(new APINotFound({ code: 404, txt: 'No content at this URI endpoint' }));
			}
			
		} else {
			next(new APIError('API Request Failed'));
		}
	});
});

app.post('/api/link/:id/position', APILoadLink, function(req, res, next) {
	if (req.link.owner == req.session.security.user.id) {
		var position = req.body.position;
		
		links.find({ owner: req.session.security.user.id, read: false },[]).sort('priority', -1, 'time', 1).skip(position).limit(1).run(function(err, link){
			if (!err) {
				if (link) {
					var new_priority = link[0].priority + 1;
					
					req.link.priority = new_priority;
					
					// make sure the links above are higher priority...
					if (position != 0) {
						links.find({ owner: req.session.security.user.id, read: false },[]).sort('priority', -1, 'time', 1).limit(position).run(function(err, link){
							if (!err) {
								if (link) {
									link.forEach(function(lnk){
										if (lnk.priority <= new_priority) {
											// increase the priority of the link
											lnk.priority = new_priority + 1;
											new_priority += 2;
											lnk.save();
										}
									});
								}
							}
						});
					}
					
					
					req.link.save(function(err){
						if (!err) {
							var response = req.link.serialize();
							
							if (req.query.callback) {
								res.send(req.query.callback+'('+JSON.stringify(response)+')');
							} else {
								res.send(JSON.stringify(response));
							}
						}
					});
				
				} else {
					var response = { user: req.session.security.user.id, error: { code: 204, type: 'NoContent', msg: 'You have no content to display!' } };
					API_Send(req, res, response);
				}
			}
		});
		
	} else {
		next(new APIAuthError({ code: 403, txt: 'You are forbidden from seeing this content' }));
	}
});

// create a new link
app.post('/api/link', function(req, res, next){
	var link = new links();
	link.owner = req.session.security.user.id;
	link.link = req.body.url;
	
		
	link.save(function(err){
		if (!err) {
			var response = link.serialize();
			
			res.header('Location',response.uri);
			
			API_Send(req, res, response, 201);
		} else {
			throw new APIError('Link Save Error!');
		}
	});
});

// create a new link from the bookmarklet
app.get('/api/bookmarklet_add', function(req, res, next){
	var link = new links();
	link.owner = req.session.security.user.id;
	link.link = req.query.url;
	
		
	link.save(function(err){
		if (!err) {
			var response = link.serialize();
			res.header('Location',response.uri);
			
			API_Send(req, res, response, 201);
		} else {
			throw new APIError('Link Save Error!');
		}
	});
});


/** END OF LINK ENDPOINTS */

/**
 * User endpoints
 */
app.get('/api/user/:id?', APILoadUser, APIRestrictTo('admin'), function(req, res, next) {
	var response = req.user.serialize();
	
	API_Send(req, res, response);
});




/** END OF USER ENDPOINTS */


/**
 * Catch-all and show a not found page
 */

app.all('*', function(req, res) {
	throw new NotFound('Page not found.');
});

/**
 * Export the app for use in Cluster
 */
module.exports = app;

