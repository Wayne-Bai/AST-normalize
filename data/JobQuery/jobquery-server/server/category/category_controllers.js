"use strict";

var Category = require('./category_model.js');

module.exports = exports = {

  getByType: function (req, res) {
    Category.find({type: req.params.type})
    .where('active').equals(true)
    .exec(function (err, category) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(200, category);
    });
  },

  putById: function (req, res) {
    Category.findById(req.params.id, function (err, category) {
      if (err) {
        res.json(500, err);
        return;
      }

      Category.schema.eachPath(function (field) {
        if ( (field !== '_id') && (field !== '__v') ) {
          if (req.body[field] !== undefined) {
            category[field] = req.body[field];
          }
        }
      });

      category.save(function (err, item) {
        if (err) {
          res.json(500, err);
          return;
        }
        res.json(200, {_id: item.id});
      });
    });
  },

  get: function (req, res) {
    Category.find()
    .where('active').equals(true)
    .exec(function (err, categories) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(200, categories);
    });
  },

  post: function (req, res) {
    Category.create(req.body, function (err, category) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(201, {_id: category.id});
    });
  }

};
