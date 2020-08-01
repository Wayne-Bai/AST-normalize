/* jslint node: true */

var User = require('./user_model.js');

module.exports = exports = {

  getById: function (req, res) {
    User.findById(req.params.id)
    .where('isAdmin').equals(false)
    .populate([
      {path: 'category'},
      {path: 'tags.tag'}
    ])
    .exec(function (err, user) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(200, user);
    });
  },

  putById: function (req, res) {
    User.findById(req.params.id, function (err, user) {
      if (err) {
        res.json(500, err);
        return;
      }

      User.schema.eachPath(function (field) {
        if ( (field !== '_id') && (field !== '__v') ) {
          if (req.body[field] !== undefined) {
            // depopulate tags
            if (field === 'tags') {
              if (req.body.tags) {
                for (var i = 0; i < req.body.tags.length; i += 1) {
                  if (req.body.tags[i].tag._id) {
                    req.body.tags[i].tag = req.body.tags[i].tag._id;
                  }
                }
              }
            }
            // depopulate category
            if (field === 'category') {
              if (req.body.category && req.body.category._id) {
                req.body.category = req.body.category._id;
              }
            }
            user[field] = req.body[field];
          }
        }
      });

      user.save(function (err, item) {
        if (err) {
          res.json(500, err);
          return;
        }
        res.json(200, {_id: item.id});
      });
    });
  },

  get: function (req, res) {
    User.find()
    .where('isAdmin').equals(false)
    .populate([
      {path: 'category'}
    ])
    .exec(function (err, users) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(200, users);
    });
  },

  post: function (req, res) {
    User.create(req.body, function (err, user) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(201, {_id: user.id});
    });
  },

  download: function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment');

    var tagOrder = [];

    var headerRow = [
      'name',
      'email',
      'github',
      'linkedin',
      'attending',
      'searchStage',
      'city',
      'state',
      'country',
      'category',
      'internalNotes'
    ];
    // write header row
    res.write(headerRow.join(','));

    User
    .find()
    .where('isAdmin').equals(false)
    .select('name email github linkedin attending searchStage tags internalNotes city state country category')
    .populate([
      {path: 'category', select: 'name'},
      {path: 'tags.tag', select: 'name'}
    ])
    .lean()
    .exec(function (err, users) {

      // generate tags information
      users[0].tags.forEach(function (tag) {
        tagOrder.push(tag.tag._id);
        res.write(',' + tag.tag.name); // write tags to header row
      });
      res.write('\n');

      // transform user data
      users.forEach(function (user) {
        if (!user.name) {
          user.name = '';
        }
        if (user.category) {
          user.category = user.category.name;
        }
        user.tags.forEach(function (tag) {
          user[tag.tag._id] = tag.privateValue || tag.value;
        });
        delete user.tags;
      });

      // iterate over userArray
      users.forEach(function (user) {
        // write normal fields
        headerRow.forEach(function (field) {
          res.write( (JSON.stringify(user[field] || '')).replace(/\,/g, ' ') + ',');
        });
        // write tag fields
        tagOrder.forEach(function (tagId) {
          res.write( (JSON.stringify(user[tagId] || '')).replace(/\,/g, ' ') + ',');
        });
        res.write('\n');
      });

      res.send();
    });
  }

};
