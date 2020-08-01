'use strict';

var util = require('util');
var listOrSingle = require('./lib/listOrSingle');
var searchResults = require('./lib/searchResults');
var articleSearchService = require('../../services/articleSearch');
var tagSeparator = /[+/,_: ]+/ig;
var termSeparator = /[+/,_: -]+/ig;

module.exports = function (req, res, next) {
  var tags = req.params.tags.split(tagSeparator);
  var terms = req.params.terms.split(termSeparator);
  var handle = listOrSingle(res, searchResults(res, next));
  var fmt = 'Search results for "%s" in articles tagged "%s"';
  var title = util.format(fmt, terms.join('", "'), tags.join('", "'));

  res.viewModel = {
    model: {
      title: title,
      meta: {
        canonical: '/articles/search/' + terms.join('-') + '/tagged/' + tags.join('+'),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      },
      action: 'articles/search-results',
      query: articleSearchService.format(terms, tags)
    }
  };

  articleSearchService.query(terms, tags, handle);
};
