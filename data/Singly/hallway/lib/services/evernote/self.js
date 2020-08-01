exports.sync = function(pi, cb) {
  // get the profile, must have an id field
  var profile = pi.auth.params;
  var profileId = pi.auth.params.edam_userId;
  profile.id = profileId;
  pi.auth.pid = profileId + '@evernote';

  var base = 'profile:' + profileId + '@evernote/self';
  var data = {};
  data[base] = [profile];
  
  cb(null, {
    auth: pi.auth,
    data: data
  });
};