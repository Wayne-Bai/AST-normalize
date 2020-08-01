var async  = require('async');
var fs = require('fs');
var lutil  = require('lutil');
var path   = require('path');
var request = require('request');
var _ = require('underscore');

var acl = require('acl');
var apiKeys = require('apiKeys');
var instruments = require('instruments');
var logger = require('logger').logger('posting');
var profileManager = require('profileManager');
var servezas = require('servezas');

var postMap = {};

function initPostMap() {
  servezas.serviceList().forEach(function(service) {
    var servicePath = path.join(__dirname, 'services', service, 'posting.js');
    try {
      postMap[service] = require(servicePath);
    } catch (E) {
      // That's ok, we just can't post there yet
    }
  });
}

function validateOneFromPerService(fromMap, res) {
  var tooMany = _.chain(fromMap)
    .map(function(froms, service) {
      if (froms.length > 1) {
        return service;
      }
    })
    .compact()
    .value();

  if (tooMany.length > 0) {
    var error = 'You may only include one "from" per service. ' +
                'Please pick one for: ' + tooMany.join(',');
    res.json(lutil.jsonErr(error), 400);
    return false;
  }

  return true;
}

function validateFromContainsID(fromMap, res) {
  var missingID = _.chain(fromMap)
    .map(function(froms, service) {
      // We know we have just one after validateOneFromPerService
      if (_.isEmpty(froms[0].profile)) return service;
    })
    .compact()
    .value();

  if (missingID.length > 0) {
    var error = 'Missing profile ID for ' + missingID.join(',') +
                '. Please use the syntax "id@service"';
    res.json(lutil.jsonErr(error), 400);
    return false;
  }

  return true;
}

function validateFrom(fromMap, res) {
  return validateOneFromPerService(fromMap, res) &&
         validateFromContainsID(fromMap, res);
}

function postToService(req, app, data, callback) {
  var service = data.to.service;
  var type    = data.type;

  if (!postMap[service] || !postMap[service][type]) {
    return callback(null, {
      error: 'Sharing ' + type + ' is not supported to "' + service + '".' +
             ' Try using /proxy.',
      see: 'https://singly.com/proxy'
    });
  }

  if (!apiKeys.hasOwnKeys(app, service)) return callback(null, {
      error: 'You must use your own API keys to post to ' + service + '.' +
             ' Please add them to your app configuration.',
      see: 'https://singly.com/apps/' + app.app
    }
  );

  var pid;
  req._authsome.profiles.forEach(function(profile) {
    if (profile.profile.indexOf(service) >= 0) pid = profile.profile;
  });

  if (!pid) return callback(null, {
    error: 'No ' + service + ' profile connected to this access token.'
  });

  profileManager.authGetAcct(pid, req._authsome.app, req._authsome.account, function(err, auth) {
    if (err) return callback(err, auth);
    data.auth = auth;
    var paramsName = service + '_params';
    var serviceParams = req.param(paramsName);
    if (serviceParams && typeof(serviceParams) !== 'object') {
      try {
        serviceParams = JSON.parse(serviceParams);
      } catch(E) {
        return callback(null, {error: paramsName + ' must be JSON.'});
      }
    }
    data[service + '_params'] = serviceParams;
    // If they have specific fields to pull in, get them
    if (postMap[service][type + "_fields"]) {
      var fields = postMap[service][type + "_fields"];
      fields.forEach(function(field) {
        data[field] = req.param(field);
      });
    }
    // Run the posting method
    postMap[service][type](data, callback);
  });
}

function countPosts(req, type, services) {
  instruments.increment([
    'app.all.types.post.type.' + type,
    'app.' + req._authsome.app + '.types.post.type.' + type
  ]);

  services.forEach(function(service) {
    instruments.increment([
      'app.all.types.post.service.' + service,
      'app.' + req._authsome.app + '.types.post.service.' + service
    ]);
  });
}

// Pass through if no awe.sm key.
// Otherwise shunt through them to get a modified URL and ID
function preAwesm(key, channel, tool, url, params, callback) {
  if(!key) return callback(url);

  var form = params;
  form.v = "3";
  form.tool = tool || "SQidx3";
  form.key = key;
  form.channel = channel;
  form.url = url;

  request.post("https://api.awe.sm/url.json", {
    form: form
  }, function(err, resp, body){
    if (err) logger.warn("awesm error", err);
    try {
      body = JSON.parse(body);
    } catch (E) {
      // Pass
    }
    if (!body || !body.awesm_id) {
      logger.warn("awesome bad body", typeof body, body);
      return callback(err);
    }
    return callback(err, body.awesm_url, body.awesm_id);
  });
}

function postAwesm(key, awesmID, tool, channel, postID, reach) {
  var form = {};
  form.v = "3";
  form.tool = tool || "SQidx3";
  form.key = key;
  form.service_postid = [channel, postID].join(':');
  form.service_postid_reach = reach || 0;
  request.post("https://api.awe.sm/url/update/" + awesmID + ".json", {
    form:form
  }, function(err){
    if(err) console.warn("posting update to awesm failed", awesmID, err);
  });
}

function parseProfileList(list) {
  if (Array.isArray(list)) list = list.join(',');
  if (_.isEmpty(list)) list = '';

  // Using split() on an empty string returns [''].
  // Rather than clean it, this regex works more as expected.
  list = list.match(/[^,]+/g) || [];

  return _.map(list, function(to) {
    var service = to;
    var parts = to.split('@');
    var profile;

    if (parts.length > 1) {
      profile = parts[0];
      service = parts[1];
    }

    if (profile) profile = profile.trim();
    if (service) service = service.trim();

    return {
      profile: profile,
      service: service
    };
  });
}

exports.postType = function(req, res) {
  var type = req.param('type');

  var toList = parseProfileList(req.param('to') || req.param('services'));
  var fromList = parseProfileList(req.param('from'));
  var fromMap = _.groupBy(fromList, function(from) {
    return from.service;
  });

  if (!validateFrom(fromMap, res)) return;
  _.forEach(fromMap, function(froms, service) {
    fromMap[service] = froms[0]; // Just eliminate the array
  });

  if (toList.length === 0) return res.json(
    // TODO: Reference documentation when it exists
    // https://github.com/Singly/hallway/issues/484
    lutil.jsonErr('Must include a "to" parameter.'), 400
  );

  countPosts(req, type, _.pluck(toList, 'service'));

  var title = req.param('title');
  var body = req.param('body');
  var url = req.param('url');
  var photo = (req.files || {}).photo;
  var httpParams = _.extend({}, req.params, req.query, req.body);

  if ((type === 'statuses' || type === 'messages') &&
      (typeof(body) !== 'string' || body.match(/^\s*$/))) {
    return res.json(lutil.jsonErr('Must include a "body" parameter'), 400);
  }

  if (type === 'photos' && !photo) {
    return res.json(lutil.jsonErr('Must include a "photo" parameter'), 400);
  }

  logger.info('Posting ' + type + ' to ', toList, ' from ', fromMap);

  acl.getApp(req._authsome.app, function(err, appData) {
    // async.forEach's final callback receives an error, but using it will halt
    // the sequence. Instead, pass an object back with an `error` key for
    // display to the user.
    var responses = {};
    async.forEach(toList, function(to, callback) {
      // awe.sm is a pass-thru if no key
      var params = (req.query.awesm_key ? req.query : req.body); // be flexible
      delete params.access_token; // don't expose our token
      var awesmKey = params.awesm_key;
      var tool = req.param('tool');
      preAwesm(awesmKey, to.service, tool, url, params, function(err, awesmURL, awesmID) {
        // Swap out url in the body if it got replaced
        if (!err && awesmURL) body = body.replace(url, awesmURL);
        postToService(req, appData, {
          to: to,
          from: fromMap[to.service] || {service: to.service},
          type: type,
          title: title,
          body: body,
          url: awesmURL || url,
          photo: photo,
          httpParams: httpParams
        }, function(err, response) {
          responses[to.service] = response;
          callback(err);
          // in background ping back
          if(awesmKey && typeof response === "object") {
            var id = "missing";
            // would be nice to use dMap somehow for this but the type-mapping
            // more complicated than a couple if's right now
            if(to.service === 'twitter' && response.id_str) id = response.id_str;
            if(to.service === 'facebook' && response.id) id = response.id;
            postAwesm(awesmKey, awesmID, req.param('tool'), to.service, id, 0);
          }
        });
      });
    }, function(err) {
      res.json(responses);
    });
  });
};

initPostMap();

