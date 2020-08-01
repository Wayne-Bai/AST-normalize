'use strict';

var _ = require('lodash');
var url = require('url');
var util = require('util');
var moment = require('moment');
var cheerio = require('cheerio');
var minifyHtml = require('html-minifier').minify;
var env = require('../lib/env');
var authority = env('AUTHORITY');
var minifierOptions = {
  collapseWhitespace: true
};
var imageCache = {};

function absolutize (html) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);

  $('a[href]').each(resolve('href'));
  $('img[src]').each(resolve('src'));
  $('iframe[src]').each(resolve('src'));
  $('script[src]').each(resolve('src'));
  $('link[href]').each(resolve('href'));

  var absolute = $.html();
  var undeferred = undeferImages(absolute); // undo deferred image sources
  return undeferred;

  function resolve (prop) {
    return function each () {
      var elem = $(this);
      var href = elem.attr(prop);
      var absolute = url.resolve(authority, href);
      elem.attr(prop, absolute);
    };
  }
}

function fresh (item) {
  return item && moment().isBefore(item.expires);
}

function extractImages (key, html) {
  if (fresh(imageCache[key])) {
    return imageCache[key].value;
  }
  var $ = cheerio.load(html);
  var images = $('img[src]').map(src);
  var result = _(images).uniq().compact().value();

  imageCache[key] = {
    value: result,
    expires: moment().add(6, 'hours')
  };

  function src () {
    return $(this).attr('src');
  }
  return result;
}

function getText (html) {
  return cheerio.load(html)('*').text();
}

function minify (html) {
  return minifyHtml(html, minifierOptions);
}

function deferImages (html, startIndex) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);
  $('img[src]').each(defer);
  return $.html();

  function defer (i) {
    var start = startIndex || 0;
    var elem, fallback;
    if (i < start) {
      return;
    }
    elem = $(this);
    fallback = util.format('<noscript>%s</noscript>', $.html(elem));
    elem.attr('data-src', elem.attr('src'));
    elem.addClass('js-only');
    elem.removeAttr('src');
    elem.after(fallback);
  }
}

function undeferImages (html) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);
  $('img[data-src]').each(undefer);
  return $.html();

  function undefer () {
    var elem = $(this);
    elem.attr('src', elem.attr('data-src'));
    elem.removeClass('js-only');
    elem.removeAttr('data-src');
    elem.next('noscript').remove();
  }
}

function externalizeLinks (html) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);
  $('a[href]').attr('target', '_blank');
  $('a[href]').attr('rel', 'nofollow');
  return $.html();
}

module.exports = {
  absolutize: absolutize,
  extractImages: extractImages,
  getText: getText,
  minify: minify,
  deferImages: deferImages,
  undeferImages: undeferImages,
  externalizeLinks: externalizeLinks
};
