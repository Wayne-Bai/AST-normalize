exports.generateAuthString = function (pi) {
  var email = decodeURIComponent(pi.auth.pid.substr(0, pi.auth.pid.length - 6));
  var buf = new Buffer("user=" + email + "\x01auth=Bearer " +
    pi.auth.token.access_token + "\x01\x01");
  //console.log("Building XOAUTH string from: " + buf.toString());
  return buf.toString("base64");
};
