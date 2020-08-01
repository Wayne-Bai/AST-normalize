var 
	GitHubApi = require('github'),
	request   = require('request'),
	_         = require('lodash'),
	moment    = require('moment'),
    async     = require('async'),
    service   = require('../../infra/service'),
    User      = require('../../models/user'),
    Evernote  = require('evernote').Evernote,
    crypto    = require('crypto'),
    config
;

if (process.env.NODE_ENV === 'production'){
  config = require('../../infra/config'); 
}else{
  config = require('../../infra/config-dev');
}

var getEvernoteInfo = function(){
	if (process.env.NODE_ENV === 'production'){
		return require('../../evernoteInfo').info;		
	}else{
		return {
			API_CONSUMER_KEY    : config.API_CONSUMER_KEY,
		    API_CONSUMER_SECRET : config.API_CONSUMER_SECRET,
		    SANDBOX             : config.SANDBOX,
		    CALLBACK_URL        : config.CALLBACK_URL
		};
	}
};

exports.isEvernoteAuthenticated = function(req, res){
	if(req.session.evernote && req.session.evernote.oauthAccessToken){
		res.send({authenticated: true});
	}else{
		res.send({authenticated: false});
	}
};

var makeNote = function(noteStore, noteTitle, noteBody, resources, parentNotebook, callback) {
 
	// Create note object
	var ourNote = new Evernote.Note();
	if(noteTitle && noteTitle.length > 20){
		ourNote.title = noteTitle.substring(0,20);
	}else{
		ourNote.title = noteTitle;
	}

	// Build body of note
	var nBody = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
	nBody += "<!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\">";
	nBody += "<en-note>" + noteBody;

	if (resources && resources.length > 0) {
		// Add Resource objects to note body
		nBody += "<br /><br />";
		ourNote.resources = resources;
		for (i in resources) {
		  var md5 = crypto.createHash('md5');
		  var b = resources[i].data.body;
		  md5.update(b);
		  var hexhash = md5.digest('hex');
		  // resources[i].data.bodyHash = hexhash;
		  nBody += "Attachment with hash " + hexhash + ": <br /><en-media type=\"" + resources[i].mime + "\" hash=\"" + hexhash + "\" /><br />"
		}
	}

	nBody += "</en-note>";
	ourNote.content = nBody;

	// parentNotebook is optional; if omitted, default notebook is used
	if (parentNotebook && parentNotebook.guid) {
		ourNote.notebookGuid = parentNotebook.guid;
	}
 
	try{
		// Attempt to create note in Evernote account
		noteStore.createNote(ourNote, function(note) {
			if (note.errorCode) {
			  // Something was wrong with the note data
			  // See EDAMErrorCode enumeration for error code explanation
			  // http://dev.evernote.com/documentation/reference/Errors.html#Enum_EDAMErrorCode
			  console.log('errorCode=' + note.errorCode);
			  console.log(note);
			} else {
			  callback(note);
			}
  		});
 	}catch(err){
		console.log('error catched when creating note : ' + err);
	}
};

exports.saveNote = function(req, res){
	var accessToken = service.getAccessToken(req);
	var gistId = req.param('gist_id');
	if (!gistId) res.send({success:false});
	var gist;

	async.series(
	[
		function(cb){
			// get files of the gist
			var github = service.getGitHubApi(req);
			github.gists.get({id : gistId}, function(err, data){ 
				gist = data;
				cb(null, data); 
			});
		},

		function(cb){
			// get file content and create evernote's note
			if(gist && gist.files) {
				var filesArray = _.toArray(gist.files);

				var getFileContent = function(file, callback){
					request.get({
						url: file.raw_url + '?access_token=' + accessToken,
						timeout: 5000
					}, function(error, response, body){	
						var data = new Evernote.Data();
						data.size = file.size;
						data.bodyHash = body.toString('base64');
						data.body = body;
						
						var attributes = new Evernote.ResourceAttributes();
						attributes.fileName = file.filename;
						
						var resource = new Evernote.Resource();
						resource.mime = file.type;
						resource.data = data;
						resource.attributes = attributes;

						callback(null, resource);
					});
				};

				var createNote = function(error, result){
					var evernoteInfo = getEvernoteInfo();
					var client = new Evernote.Client({token: req.session.evernote.oauthAccessToken, sandbox: evernoteInfo.SANDBOX});
					var noteStore = client.getNoteStore();
					var noteTitle = gist.description || 'Created from GISTCAMP';
					var noteBody = '<h3>Created from GISTCAMP</h3><br />';
					var resources = result;

					makeNote(noteStore, noteTitle, noteBody, resources, null, function(){
						cb(null);
					});
				};

				// filter image files
				filesArray = _.filter(filesArray, function(file){
					return file.type.indexOf('image') === -1;
				});	

				async.map(filesArray, getFileContent, createNote);
			}
		}	
	],
	function(err, results){
		res.send({success:true});
	});
};

exports.auth = function(req, res) {
	var gistId = req.param('gist_id');
	var evernoteInfo = getEvernoteInfo();
	var callbackUrl = evernoteInfo.CALLBACK_URL;
	var client = new Evernote.Client({
		consumerKey    : evernoteInfo.API_CONSUMER_KEY,
		consumerSecret : evernoteInfo.API_CONSUMER_SECRET,
		sandbox        : evernoteInfo.SANDBOX
	});

	client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret, results){
		if(error) {
			req.session.error = JSON.stringify(error);
			res.redirect('/');
		}
		else { 
			// store the tokens in the session			
			req.session.evernote = {};
			req.session.evernote.oauthToken = oauthToken;
			req.session.evernote.oauthTokenSecret = oauthTokenSecret;

			// redirect the user to authorize the token
			setTimeout(function(){
				res.redirect(client.getAuthorizeUrl(oauthToken));
			}, 100);			
		}
	});
};

exports.authCallback = function(req, res) {
	var evernoteInfo = getEvernoteInfo();
	var client = new Evernote.Client({
		consumerKey    : evernoteInfo.API_CONSUMER_KEY,
		consumerSecret : evernoteInfo.API_CONSUMER_SECRET,
		sandbox        : evernoteInfo.SANDBOX
	});

	client.getAccessToken(
		req.session.evernote.oauthToken, 
		req.session.evernote.oauthTokenSecret, 
		req.param('oauth_verifier'), 
		function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
			if(error) {
				console.log('error');
				console.log(error);
				res.redirect('/');
			} else {
				console.log('success');
				// store the access token in the session
				req.session.evernote.oauthAccessToken = oauthAccessToken;
				req.session.evernote.oauthAccessTtokenSecret = oauthAccessTokenSecret;
				req.session.evernote.edamShard = results.edam_shard;
				req.session.evernote.edamUserId = results.edam_userId;
				req.session.evernote.edamExpires = results.edam_expires;
				req.session.evernote.edamNoteStoreUrl = results.edam_noteStoreUrl;
				req.session.evernote.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;
				res.redirect('/thanksEvernote');
			}
		}
	);
};
