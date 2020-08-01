'use strict';

var Article = require('../../models/Article');

module.exports = function (req, res, next) {
  var slug = req.params.slug;

  res.viewModel = {
    model: {
      title: 'Article Composer',
      meta: {
        canonical: '/author/compose'
      },
      article: { tags: [] },
      editing: !!slug
    }
  };

  if (slug) {
    Article.findOne({ slug: slug }).lean().exec(populate);
  } else {
    next();
  }

  function populate (err, article) {
    if (err) {
      next(err); return;
    }
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    res.viewModel.model.article = article;
    res.viewModel.model.article.tags = article.tags || [];
    next();
  }
};
