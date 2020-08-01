'use strict';

var _ = require('lodash');
var moment = require('moment');
var Article = require('../../models/Article');
var articleService = require('../../services/article');
var cryptoService = require('../../services/crypto');
var longDate = 'dddd Do, MMMM YYYY [at] HH:mm';

module.exports = getModel;

function getModel (req, res, next) {
  Article.find({}).sort('-created').exec(respond);

  function respond (err, articles) {
    if (err) {
      next(err); return;
    }
    var hydrated = articles.map(articleService.toJSON).map(hydrate);
    var sorted = _.sortBy(hydrated, sortByStatus);
    res.viewModel = {
      model: {
        title: 'Article Review',
        meta: {
          canonical: '/author/review'
        },
        articles: sorted
      }
    };
    next();
  }
}

function hydrate (article) {
  article._ = {};

  var when = moment(article.publication);
  var published = article.status === 'published';
  if (published) {
    article._.condition = 'Published ' + when.fromNow();
    article._.conditionLabel = 'Published on ' + when.format(longDate);
  } else {
    article.permalink += '?verify=' + cryptoService.md5(article._id);
    if (article.status === 'draft') {
      article._.condition = 'Draft';
      article._.conditionLabel = 'Edit the article in order to publish it';
    } else {
      article._.condition = 'Publishing ' + when.fromNow();
      article._.conditionLabel = 'Slated for publication on ' + when.format(longDate);
    }
  }
  return article;
}

function sortByStatus (article) {
  return { draft: 0, publish: 1, published: 2 }[article.status];
}
