/**
NOTE: this currently relies on global.cfgJson to exist and be set correctly for configuration
@example config
{
	"google":{
		"clientId": "xxxx.apps.googleusercontent.com",
		"clientIdComment":"Make sure to CHANGE this!",
		"clientSecret": "xxxx",
		"callback_url": "http://localhost:3000/callback-google-auth"
	}
}

@module google
@class google

@toc
1. auth
*/

'use strict';

var google = require('googleapis');

var Q = require('q');
var lodash = require('lodash');
var request = require('request');
var qs =require('qs');
// var fs =require('fs');
var fs =require('node-fs');		//want recursive directory/folder creating
var path =require('path');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var AuthMod =require(pathParts.controllers+'auth/auth.js');
var UserMod =require(pathParts.controllers+'user/user.js');

var cfg =global.cfgJson;

//hardcoded
var imageInfo ={
	imgPath: 'src/common/img'
};
//end: hardcoded


var self;

var defaults = {
};

/**
Google module constructor
@class Google
@constructor
@param options {Object} constructor options
**/
function Google(options){
    this.opts = lodash.merge({}, defaults, options||{});

	self = this;
}

/**
@toc 1.
@method auth
@param {Object} data
	@param {String} code The google code to get access token & user info for
	@param {Number} [pull_pic =1] 0 to NOT pull profile image from google. This will be better for performance and avoiding creating image files on the server if you are not using user pictures. By default, it WILL pull the image IF it does not exist (i.e. no overwrites will happen in case the user set their profile picture manually we do not want to change it on each login!)
	@param {String} [pic_directory ='user'] Where to save the user image
@param {Object} params
@return {Object} (via Promise)
		@param {Number} code
		@param {String} msg
		@param {Object} user
**/
Google.prototype.auth = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Google.auth ', user:false};

	if(data.pull_pic ===undefined) {
		data.pull_pic =1;
	}
	else {
		data.pull_pic =parseInt(data.pull_pic, 10);
	}
	if(data.pic_directory ===undefined) {
		data.pic_directory ='user';
	}
	
	var OAuth2 = google.auth.OAuth2;
	var oauth2Client = new OAuth2(cfg.google.clientId, cfg.google.clientSecret, cfg.google.callback_url);
	/*
	// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
		'https://www.googleapis.com/auth/plus.me'
		// 'https://www.googleapis.com/auth/plus.login'
	];
	var url = oauth2Client.generateAuthUrl({
		access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
		scope: scopes // If you only need one scope you can pass it as string
	});
	*/
	oauth2Client.getToken(data.code, function(err, tokens) {
	// Now tokens contains an access_token and an optional refresh_token. Save them.
		if(!err) {
			//lookup user
			oauth2Client.setCredentials({
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token
			});
			var plus = google.plus('v1');
			plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
				if(err) {
					ret.msg +=err;
					deferred.reject(ret);
				}
				else {
					//do user import & login
					var user ={};
					//name
					if(response.name !==undefined) {
						if(response.name.givenName !==undefined) {
							user.first_name =response.name.givenName;
						}
						if(response.name.familyName !==undefined) {
							user.last_name =response.name.familyName;
						}
					}
					//gender
					if(response.gender !==undefined) {
						user.gender =response.gender;
					}
					//email
					if(response.emails !==undefined && response.emails.length >0) {
						user.email =response.emails[0].value;
					}
					
					//age: do not bother with age since we only get a "range" from google
					
					//image
					if(data.pull_pic) {
						if(response.image !==undefined && response.image.url !==undefined) {
							user._imageUrl =response.image.url;
						}
					}
					
					var vals ={
						type: 'google',
						user: user,
						socialData: {
							id: response.id,
							token: tokens.access_token,
							response_token: tokens.response_token
						}
					};
					
					vals.pic_directory =data.pic_directory;		//pass through
					
					AuthMod.socialLogin(db, vals, {})
					.then(function(retLogin) {
						deferred.resolve(retLogin);
					}, function(err) {
						deferred.reject(err);
					});
				}
			});
		}
	});

	return deferred.promise;
};

/**
Module exports
@method exports
@return {Google} Google constructor
**/
module.exports = new Google({});