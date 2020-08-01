/* Register new user */

var rootPath = process.cwd(),
    UserModel = require(rootPath + '/models').UserModel,
    uuid = require('node-uuid');

module.exports = function (req, res) {
  var api_key = uuid.v1(),
      data = req.body,
      user = null;

  data.api_key = api_key;
  user = new UserModel(data);

  user.save(function (err, user) {
    if (err) {
      if (err.code == 11000)
        return res.send(409, {error: 'User exists'});
      else
        return res.send(500, {error: 'Server error'});
    }

    res.send(200, {api_key: api_key, username: data.username});
  });
};
