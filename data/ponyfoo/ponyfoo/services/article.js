'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var estimate = require('estimate');
var env = require('../lib/env');
var Article = require('../models/Article');
var Subscriber = require('../models/Subscriber');
var commentService = require('./comment');
var cryptoService = require('./crypto');
var subscriberService = require('./subscriber');
var textService = require('./text');
var twitterService = require('./twitter');
var echojsService = require('./echojs');
var markupService = require('./markup');
var authority = env('AUTHORITY');

function noop () {}

function findInternal (method, query, options, done) {
  if (done === void 0) {
    done = options; options = {};
  }
  if (!options.sort) { options.sort = '-publication'; }

  var cursor = Article[method](query);

  if (options.populate) {
    cursor = cursor.populate(options.populate);
  }
  if (options.sort) {
    cursor = cursor.sort(options.sort);
  }
  if (options.skip) {
    cursor = cursor.skip(options.skip);
  }
  if (options.limit) {
    cursor = cursor.limit(options.limit);
  }
  cursor.exec(done);
}

var find = findInternal.bind(null, 'find');
var findOne = findInternal.bind(null, 'findOne');

function campaign (article, done) {
  if (done === void 0) {
    done = noop;
  }
  contra.concurrent([
    contra.curry(email, article),
    contra.curry(tweet, article),
    contra.curry(echojs, article)
  ], done);
}

function email (article, done) {
  if (article.email === false) {
    done(); return;
  }
  var teaser = markupService.compile(article.teaserHtml, { markdown: false, absolutize: true });
  var model = {
    subject: article.title,
    teaser: 'A new article is hot off the press on Pony Foo!',
    article: {
      title: article.title,
      permalink: '/articles/' + article.slug,
      tags: article.tags,
      teaserHtml: teaser
    }
  };
  subscriberService.broadcast('article-published', model, done);
}

function tweet (article, done) {
  if (article.tweet === false) {
    done(); return;
  }
  var formats = [
    'Published: "%s" %s',
    'Fresh content!  "%s" %s',
    '"%s" contains crisp new words! %s',
    '"%s" is hot off the press! %s',
    'Extra! Extra! "%s" has just come out! %s',
    '"%s" has just been published! %s',
    'This just out! "%s" %s'
  ];
  var fmt = _.sample(formats);
  var tag = article.tags.slice(0, 2).join(' #');
  var camelTag = textService.hyphenToCamel(tag);
  var links = util.format('%s/articles/%s #%s', authority, article.slug, camelTag);
  var status = util.format(fmt, article.title, links);
  twitterService.tweet(status, done);
}

function echojs (article, done) {
  if (article.echojs === false) {
    done(); return;
  }
  var data = {
    title: article.title,
    url: util.format('%s/articles/%s', authority, article.slug)
  };
  echojsService.submit(data, done);
}

function toJSON (source) {
  var text = [source.teaserHtml, source.bodyHtml].join(' ');
  var article = source.toJSON();

  article.readingTime = estimate.text(text);
  article.permalink = '/articles/' + article.slug;

  if (source.populated('comments')) {
    article.commentThreads = article.comments.sort(byPublication).reduce(threads, []);
    article.commentCount = article.comments.length;
  }

  if (source.populated('prev')) {
    article.prev = relevant(article.prev);
  } else {
    delete article.prev;
  }
  if (source.populated('next')) {
    article.next = relevant(article.next);
  } else {
    delete article.next;
  }
  if (source.populated('related')) {
    article.related = article.related.map(relevant);
  } else {
    delete article.related;
  }

  delete article.__v;
  delete article.sign;
  delete article.teaser;
  delete article.body;
  delete article.comments;
  return article;
}

function relevant (article) {
  return { slug: article.slug, title: article.title };
}

function threads (accumulator, comment) {
  var thread;
  var commentModel = commentService.toJSON(comment);
  if (commentModel.parent) {
    thread = _.find(accumulator, { id: commentModel.parent.toString() });
    thread.comments.push(commentModel);
  } else {
    thread = { id: commentModel._id.toString(), comments: [commentModel] };
    accumulator.push(thread);
  }
  return accumulator;
}

function byPublication (a, b) {
  return a.created - b.created;
}

module.exports = {
  find: find,
  findOne: findOne,
  campaign: campaign,
  toJSON: toJSON
};
