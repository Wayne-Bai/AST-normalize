'use strict';

var articleService = require('../../../services/article');
var metadataService = require('../../../services/metadata');
var htmlService = require('../../../services/html');
var textService = require('../../../services/text');

function factory (res, options, next) {
  if (arguments.length < 3) {
    next = options;
    options = {};
  }
  return function listOrSingle (err, articles) {
    if (err) {
      next(err); return;
    }
    var model = res.viewModel.model;
    var article = articles.length === 1 && articles[0];
    var key = article ? 'article' : 'articles';

    if (!model.action) {
      model.action = 'articles/' + key;

      if (articles.length === 0 && options.skip !== false) {
        res.viewModel.skip = true;
        next(); return;
      }
    }

    if (article) {
      article.populate('prev next related comments', single);
    } else {
      model.articles = articles.map(articleService.toJSON);
      model.meta.keywords = metadataService.mostCommonTags(articles);
      model.meta.images = metadataService.extractImages(articles);
      next();
    }

    function single (err, article) {
      if (err) {
        next(err); return;
      }
      model.full = true;
      model.title = article.title;
      model.meta = {
        canonical: '/articles/' + article.slug,
        description: textService.truncate(htmlService.getText(article.teaserHtml), 170),
        keywords: article.tags,
        images: metadataService.extractImages(article)
      };
      model.article = articleService.toJSON(article);
      next();
    }
  };
}

module.exports = factory;
