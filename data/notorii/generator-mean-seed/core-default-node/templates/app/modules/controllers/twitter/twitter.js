/**
Handles Twitter login / authentication

Unlike g+ & facebook, twitter does NOT support oauth2 or clientside javascript auth.. have to do it on backend and do a redirect (rather than a pop-up, etc.) so it's messier.. LAME!
Docs:
- https://npmjs.org/package/node-twitter-api
- http://stackoverflow.com/questions/800827/twitter-oauth-callbackurl-localhost-development
- https://dev.twitter.com/docs/api/1.1
- https://dev.twitter.com/docs/auth/implementing-sign-twitter


NOTE: this currently relies on global.cfgJson to exist and be set correctly
Uses config.json twitter properties (config.twitter) for configuration
@example config.twitter
{
    consumerKey: 'your consumer Key',
	consumerSecret: 'your consumer secret',
	callback: 'http://yoururl.tld/something'
}

@module twitter
@class twitter

@toc
public methods
1. requestToken
2. accessToken
3. tweetWithPicture

private methods
*/

'use strict';

var cfg =global.cfgJson;

/**
@property twitterData Twitter requires these values to be passed to get the access token but because of the redirect (no client side javascript to be able to stay on the same page), we can't keep this / pass through on the frontend so need to save it here to can use it later..)
@type Object
*/
var twitterData ={
	requestToken: false,
	requestTokenSecret: false
};

var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
	consumerKey: cfg.twitter.consumerKey,
	consumerSecret: cfg.twitter.consumerSecret,
	callback: cfg.twitter.callback_url
});

var crypto =require('crypto');
var moment = require('moment');
var Q = require('q');
var lodash = require('lodash');
// var fs =require('fs');
var fs =require('node-fs');		//want recursive directory/folder creating
var path =require('path');
var request = require('request');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var StringMod =require(pathParts.services+'string/string.js');
var MongoDBMod =require(pathParts.services+'mongodb/mongodb.js');

var AuthMod =require(pathParts.controllers+'auth/auth.js');
var UserMod =require(pathParts.controllers+'user/user.js');

//hardcoded
var imageInfo ={
	basePath: 'app',
	imgPath: 'src/common/img'
};
//end: hardcoded

//global values that will be set by passed in objects (to avoid having to require in every file)
// var db;
var self;

var defaults =
{
	
};

/**
@param {Object} options
	// @param {Object} db
*/
function Twitter(options)
{
	this.opts = lodash.merge({}, defaults, options||{});
	self = this;
}

/**
@toc 1.
@method requestToken
@param {Object} data
	// @param {String} callback_url
@param {Object} params
@return {Object} (via Promise)
	@param {String} request_token
	@param {String} request_token_secret
**/
Twitter.prototype.requestToken = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Twitter.requestToken '};
	
	twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
		if (error) {
			ret.code =1;
			ret.msg +="Error getting OAuth request token : " + error;
			deferred.reject(ret);
		} else {
			//save for later
			twitterData ={
				requestToken: requestToken,
				requestTokenSecret: requestTokenSecret
			};
			
			ret.request_token =requestToken;
			ret.request_token_secret =requestTokenSecret;
			deferred.resolve(ret);
		}
	});

	return deferred.promise;
};

/**
Gets an access token and then uses that info to call auth.socialLogin to signup/login this user. Ideally would also make Twitter REST API calls to get the user's email/phone but that's not accessible via Twitter API so only have id.
@toc 2.
@method accessToken
@param {Object} data
	// @param {String} user_id The id of the user to associate this access token with
	// @param {String} request_token
	// @param {String} request_token_secret
	@param {String} oauth_verifier
	@param {Number} [pull_pic =1] 0 to NOT pull profile image from twitter. This will be better for performance and avoiding creating image files on the server if you are not using user pictures. By default, it WILL pull the image IF it does not exist (i.e. no overwrites will happen in case the user set their profile picture manually we do not want to change it on each login!)
	@param {String} [pic_directory ='user'] Where to save the user image
@param {Object} params
@return {Object} (via Promise)
	@param {Object} user The existing or created user
	@param {String} access_token
	@param {String} access_token_secret
**/
Twitter.prototype.accessToken = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, err:false, msg:'Twitter.accessToken '};
	
	if(data.pull_pic ===undefined) {
		data.pull_pic =1;
	}
	else {
		data.pull_pic =parseInt(data.pull_pic, 10);
	}
	if(data.pic_directory ===undefined) {
		data.pic_directory ='user';
	}
	
	data.request_token =twitterData.requestToken;
	data.request_token_secret =twitterData.requestTokenSecret;
	
	twitter.getAccessToken(data.request_token, data.request_token_secret, data.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
		if (error) {
			ret.code =1;
			ret.msg +="Error getting OAuth access token";
			ret.err =error;
			ret.debug =data;
			deferred.reject(ret);
		} else {
		
			//Step 4: Verify Credentials belongs here
			
			//get user info (name, picture)
			twitter.users("show", {
				user_id: results.user_id
			}, accessToken, accessTokenSecret, function(error, dataUser, responseUser) {
				if (error) {
					ret.code =1;
					ret.msg +="Error getting user for Twitter id: "+results.user_id;
					ret.err =error;
					ret.debug =data;
					deferred.reject(ret);
				} else {
					// ret.response =responseUser;		//breaks things - too raw of data..
					ret.debug =dataUser;
					
					//separate name into first and last (default both to blank)
					var first_name ='';
					var last_name ='';
					if(dataUser.name !==undefined) {
						//if has a space
						var indexSpace =dataUser.name.indexOf(' ');
						if(indexSpace >-1) {
							first_name =dataUser.name.slice(0, indexSpace);
							last_name =dataUser.name.slice((indexSpace+1), dataUser.name.length);
						}
						else {
							first_name =dataUser.name;
						}
					}
					
					//do user import
					var vals ={
						type: 'twitter',
						user: {
							first_name: first_name,
							last_name: last_name
						},
						socialData: {
							id: results.user_id,
							token: accessToken,
							token_secret: accessTokenSecret
						}
					};
					
					AuthMod.socialLogin(db, vals, {})
					.then(function(retLogin) {
						
						//profile image: now that we have a user with a user id, IF user does NOT already have a profile image AND IF we have a profile image from Twitter, add that in for the user
						if(data.pull_pic && (retLogin.user.image ===undefined || retLogin.user.image.profile ===undefined || !retLogin.user.image.profile) && dataUser.profile_image_url !==undefined) {
							var imgUrl =dataUser.profile_image_url;
							var imgUrlStripped =imgUrl;
							//strip url params if they're there as this will mess up things (get an ESDIR or ENOENT error since the file extension isn't at the end)
							if(imgUrlStripped.indexOf('?') >-1) {
								imgUrlStripped =imgUrlStripped.slice(0, imgUrlStripped.indexOf('?'));
							}
							//get the file extension
							var posExt =imgUrlStripped.lastIndexOf('.');
							var ext =imgUrlStripped.slice(posExt, imgUrlStripped.length);
							
							//get the big sized image by removing the underscore part - https://dev.twitter.com/docs/user-profile-images-and-banners
							var posUnderscore =imgUrl.lastIndexOf('_');
							if(posUnderscore >-1 && posUnderscore >imgUrl.lastIndexOf('/')) {
								imgUrl =imgUrl.slice(0, posUnderscore) +ext;
							}
							
							var filename ='profile'+ext;
							var imgSavePath =data.pic_directory +'/'+retLogin.user._id;
							var folderWritePath =path.normalize(__dirname +'../../../../' +imageInfo.imgPath +'/' +imgSavePath);		//hardcoded - 4 '../' to get from this directory back to 'app/'. Very important to use path.normalize so it works on both windows and linux!!
							
							//recursively create directories / folders in case they don't exist yet
							fs.mkdirSync(folderWritePath, parseInt('777', 8), true);		//0777 octal in strict mode is not allowed
							
							var dbSavePath =imgSavePath +'/' +filename;		//what will be stored in the database
							var imgWritePath =folderWritePath +'/' +filename;
							var picStream =fs.createWriteStream(imgWritePath);
							picStream.on('close', function() {
								//update user with this image
								var userUpdate ={};
								if(retLogin.user.image !==undefined) {		//image key already exists
									userUpdate['image.profile'] =dbSavePath;		//have to do it this way for mongo db syntax and to avoid over-writing any other keys (other than 'profile') that may exist
									//update for return as well
									retLogin.user.image.profile =dbSavePath;
								}
								else {		//image key doesn't exist yet
									userUpdate.image ={
										profile: dbSavePath
									};
									//update for return as well
									retLogin.user.image ={
										profile: dbSavePath
									};
								}
								UserMod.update(db, {user_id: retLogin.user._id, user:userUpdate}, {})
								.then(function(retUserUpdate) {
									deferred.resolve(retLogin);
								}, function(retErr) {
									deferred.reject(retErr);
								});
							});
							request(imgUrl).pipe(picStream);
						}
						else {
							deferred.resolve(retLogin);
						}
						
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
Shares / posts on Twitter with a picture
@toc 3.
@method tweetWithPicture
@param {Object} data
	@param {String} user_id The id of the user to tweet for (used to look up access token and token secret)
	@param {String} tweet_text The text to tweet / status to post
	@param {Array} pictures Array of picture urls - NOTE: currently twitter only supports ONE picture so the LAST one specified will be used. The picture url should be relative to the 'app/' folder so it can be read here on the backend. E.g. 'src/common/img/pic1.jpg'
@param {Object} params
@return {Object} (via Promise)
	@param {String} code
	@param {String} msg

@usage
	var urlBase ='src/common/img';
	var vals ={
		user_id: '[userId]',
		tweet_text: 'my tweet!',
		pictures: [
			urlBase+'/ie-chrome-logo.png'
		]
	};
	Twitter.tweetWithPicture(db, vals, {})
	.then(function(ret1) {
		//success
	}, function(retErr) {
		//error
	});
**/
Twitter.prototype.tweetWithPicture = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, err:false, msg:'Twitter.tweetWithPicture '};
	
	//get twitter access token & secret for this user
	UserMod.read(db, {_id: data.user_id, fields:{social:1} }, {})
	.then(function(retUser) {
		if(retUser.result && retUser.result.social !==undefined && retUser.result.social.twitter !==undefined && retUser.result.social.twitter.token !==undefined && retUser.result.social.twitter.token_secret !==undefined) {
			var token =retUser.result.social.twitter.token;
			var tokenSecret =retUser.result.social.twitter.token_secret;
			
			//tweet
			//form full media paths for reading
			var ii, media =[];
			for(ii =0; ii<data.pictures.length; ii++) {
				media[ii] =imageInfo.basePath +'/'+data.pictures[ii];
			}
			
			twitter.statuses("update_with_media", {
				status: data.tweet_text,
				media: media
			}, token, tokenSecret, function(error, data, response) {
				if (error) {
					ret.code =1;
					ret.msg +="Error tweeting with picture for user id: "+data.user_id;
					ret.err =error;
					ret.debug =data;
					deferred.reject(ret);
				} else {
					// console.log(response);
					// ret.response =response;		//breaks things - too raw of data..
					ret.debug =data;
					deferred.resolve(ret);
				}
			});
			
		}
		else {
			ret.code =2;
			ret.msg +="Error get user Twitter token/secret for user id: "+data.user_id;
			deferred.reject(ret);
		}
		
	}, function(retErr) {
		deferred.reject(retErr);
	});

	return deferred.promise;
};

module.exports = new Twitter({});