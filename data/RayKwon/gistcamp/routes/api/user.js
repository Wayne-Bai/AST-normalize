var 
	GitHubApi = require('github'),
	request   = require('request'),
	_         = require('lodash'),
	moment    = require('moment'),
  async     = require('async'),
  service   = require('../../infra/service'),
  User      = require('../../models/user'),
  config
;

if (process.env.NODE_ENV === 'production'){
  config = require('../../infra/config'); 
}else{
  config = require('../../infra/config-dev'); 
}

exports.getAuthUser = function(req, res){
	var github = service.getGitHubApi(req);
	
	github.user.get({}, function(err, data){
		res.send(data);
	});
};

exports.follow = function(req, res){
	var github = service.getGitHubApi(req);
	var login = req.params.login_id;
	var userId = service.getUserId(req);
	
	github.user.followUser({user:login}, function(err, data){
		User.update({id:userId}, {$addToSet:{followings:login}}, {}, function(err, numberAffected, raw){
			res.send(data);	
		});		
	});
};

exports.unfollow = function(req, res){
	var github = service.getGitHubApi(req);
	var login = req.params.login_id;
	var userId = service.getUserId(req);
	
	github.user.unFollowUser({user:login}, function(err, data){
		User.update({id:userId}, {$pull:{followings:login}}, {}, function(err, numberAffected, raw){
			res.send(data);	
		});		
	});
};

var getAllFollowings = function(github, pageNum, perPage, containerArray, callback){

	github.user.getFollowing({page:pageNum, per_page:perPage}, function(err, data){
		if (data){
			var logins = _.pluck(data, 'login');			
			_.each(logins, function(login){
				containerArray.push(login);
			});
			
			if (github.hasNextPage(data.meta.link)){
				getAllFollowings(github, pageNum+1, perPage, containerArray, callback);
			}else{
				callback(containerArray);
			}
		}else{
			callback(containerArray);
		}
	});
};

exports.getAllFollowings = function(req, res, accessToken, callback){
	var followings = [];
	var github;

	if(accessToken)
		github = service.getGitHubApiByAccessToken(accessToken);
	else
		github = service.getGitHubApi(req);

	getAllFollowings(github, 1, 100, followings, function(result){
		callback(result);
	});
};

var getUserInfo = function(req, data, cb){
  var github = service.getGitHubApi(req);
  async.each(
  	data, 
  	function(user, callback){
	    github.user.getFrom({user: user.login}, function(err, u){
	      /*user.name = u.name;
	      user.following    = u.following;
	      user.followers    = u.followers;
	      user.public_gists = u.public_gists;
	      user.blog         = u.blog;
	      user.html_url     = u.html_url;*/
	      _.extend(user, u);
	      callback(null);
	    });
  	},
  	function(err){
  		cb(null);
  	}
  );
  
};

var sendData = function(data, req, res){
  console.log('sendData');
  var github = service.getGitHubApi(req);

  async.series(
  	[
	    function(callback){
	    	async.parallel(
	    		[
		        /*function(cb){
		          setIsFollowing(req, data, cb);
		        },*/
		        function(cb){
		          getUserInfo(req, data, cb);
		        }
		      ],
	        function(err, results){
	          callback(null);
	        }
        )
	    },

	    function(callback){
	      res.send({
	        data: data, 
	        hasNextPage: github.hasNextPage(data),
	        linkHeader: data.meta ? data.meta.link ? data.meta.link : null : null
	      });     
	      callback(null);
	    }
    ]);
};

var getNextPage = function(linkHeader, req, res){
  var github = service.getGitHubApi(req);

  github.getNextPage(linkHeader,
    function(err, data){        
      if (data) sendData(data, req, res);         
    }
  );      
};

exports.getFollowing = function(req, res){
  var self = this;    
  var github = service.getGitHubApi(req);

  console.log('getFollowing');
  var linkHeader = req.param('linkHeader');   

  if (!linkHeader){
    github.user.getFollowing({per_page: 20},
      function(err, data){
        if (data) {
          sendData(data, req, res);
        }
      }
    );
  }else{
    getNextPage(linkHeader, req, res);
  }
};

exports.getFollowers = function(req, res) {
  var self = this;    
  var github = service.getGitHubApi(req);
  var loginName = service.getLoginName(req);

  console.log('getFollowers');
  console.log('loginName=' + loginName);
  var linkHeader = req.param('linkHeader');   

  if (!linkHeader){
    github.user.getFollowers({user: loginName, per_page: 20},
      function(err, data){
        if (data) {
          sendData(data, req, res);
        }
      }
    );
  }else{
    getNextPage(linkHeader, req, res);
  }
};

exports.getWatch = function(req, res){
  var github = service.getGitHubApi(req);
	var userId = service.getUserId(req);

	User.find({id: userId}).select('watch').lean().exec(function(err, docs){
		var watch = _.filter(docs[0].watch, function(w){
			return w;	// check if content is null
		});
		res.send(watch);
	});
};

exports.addWatch = function(req, res){
	var github = service.getGitHubApi(req);
	var login = req.params.login_id;
	var userId = service.getUserId(req);

	github.user.getFrom({user: login}, function(err, userInfo){
		User.update({id:userId}, {$pull: {watch: {login: login}}}, {}, function(err, numberAffected){
		  console.dir(userInfo);
		  var save = {};
		  _.extend(save, { 
		  	login        : userInfo.login,
		  	id           : userInfo.id,
		  	avatar_url   : userInfo.avatar_url,
		  	url          : userInfo.url,
		  	html_url     : userInfo.html_url,
		  	type         : userInfo.type,
		  	name         : userInfo.name,
		  	company      : userInfo.company,
		  	blog         : userInfo.blog,
		  	location     : userInfo.location,
		  	email        : userInfo.email,
		  	followers    : userInfo.followers,
		  	following    : userInfo.following,
		  	public_gists : userInfo.public_gists
		  });
	    User.update({id:userId}, {$addToSet:{watch:save}}, {}, function(err, numberAffected, raw){
				res.send(userInfo);	
			});		
		});		
	});
	
};

exports.deleteWatch = function(req, res){
	var github = service.getGitHubApi(req);
	var login = req.params.login_id;
	var userId = service.getUserId(req);

	User.update({id:userId}, {$pull: {watch: {login: login}}}, {}, function(err, numberAffected){
	  res.send({login: login});	
	});		

};

exports.sortWatch = function(req, res){
  var github = service.getGitHubApi(req);  
  var userId = service.getUserId(req);
  var login = req.params.login_id;
  var newIndex = req.params.new_index;

  console.log('login=' + login);
  console.log('newIndex=' + newIndex);

  if (!login || !newIndex)
  	res.send(404);

  User.find({id: userId}).select('watch').lean().exec(function(err, docs){
		// var oldWatch = docs[0].watch;
		var oldWatch = _.filter(docs[0].watch, function(w){
			return w;	// check if content is null
		});
		var watchToMove = _.find(oldWatch, function(w){
			return w.login === login;
		});
		var oldWatchWithout = _.reject(oldWatch, function(w){
			return w.login === login;
		});
		oldWatchWithout.splice(parseInt(newIndex), 0, watchToMove);
		User.update({id:userId}, {$set: {watch: oldWatchWithout}}, {}, function(err, numberAffected){
		  res.send({login: login});	
		});				
	});
};


