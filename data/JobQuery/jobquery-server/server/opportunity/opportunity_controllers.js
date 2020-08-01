"use strict";

var Opportunity = require('./opportunity_model.js');

module.exports = exports = {

  getById: function (req, res) {
    Opportunity.findById(req.params.id)
    .populate([
      {path: 'company'},
      {path: 'tags.tag'},
      {path: 'survey.user'},
      {path: 'category'}
    ])
    .exec(function (err, opp) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(200, opp);
    });
  },

  putById: function (req, res) {
    Opportunity.findById(req.params.id, function (err, opp) {
      if (err) {
        res.json(500, err);
        return;
      }

      Opportunity.schema.eachPath(function (field) {
        if ( (field !== '_id') && (field !== '__v') ) {
          if (req.body[field] !== undefined) {
            // depopulate company
            if (field === 'company') {
              if (req.body.company && req.body.company._id) {
                req.body.company = req.body.company._id;
              }
            }
            // depopulate category
            if (field === 'category') {
              if (req.body.category && req.body.category._id) {
                req.body.category = req.body.category._id;
              }
            }
            // depopulate survey
            if (field === 'survey') {
              if (req.body.survey) {
                for (var i = 0; i < req.body.survey.length; i += 1) {
                  if (req.body.survey[i].user._id) {
                    req.body.survey[i].user = req.body.survey[i].user._id;
                  }
                }
              }
            }
            // depopulate tags
            if (field === 'tags') {
              if (req.body.tags) {
                for (var j = 0; j < req.body.tags.length; j += 1) {
                  if (req.body.tags[j].tag._id) {
                    req.body.tags[j].tag = req.body.tags[j].tag._id;
                  }
                }
              }
            }
            opp[field] = req.body[field];
          }
        }
      });

      opp.save(function (err, item) {
        if (err) {
          res.json(500, err);
          return;
        }
        res.json(200, {_id: item.id});
      });
    });
  },

  get: function (req, res) {
    Opportunity.find()
    .populate([
      {path: 'company'},
      // {path: 'tags.tag'},
      // {path: 'survey.user'},
      {path: 'category'}
    ])
    .exec(function (err, opps) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(200, opps);
    });
  },

  post: function (req, res) {
    Opportunity.create(req.body, function (err, opp) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(201, {_id: opp.id});
    });
  }

};
