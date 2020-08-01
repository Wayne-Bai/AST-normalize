'use strict';

var fs = require('fs');
var contra = require('contra');
var pkg = require('../package.json');
var env = require('../lib/env');
var name = env('NODE_ENV');
var authority = env('AUTHORITY');
var authorEmail = env('AUTHOR_EMAIL');
var bioService = require('../services/bio');

function read (file) {
  return function (next) {
    fs.readFile(file, { encoding: 'utf8' }, next);
  };
}

function getDefaultViewModel (done) {
  contra.concurrent({
    bioHtml: bioService.getHtml.bind(null, authorEmail),
    javascriptLoader: read('.bin/inline/javascript.js'),
    styleLoader: read('.bin/inline/styles.js'),
    fontLoader: read('.bin/inline/fonts.js')
  }, forward);

  function forward (err, data) {
    if (err) {
      done(err); return;
    }

    done(null, {
      author: {
        contact: 'Nicolas Bevacqua <foo@bevacqua.io>',
        twitter: '@nzgb'
      },
      description: '',
      model: {
        title: 'Pony Foo',
        pkg: {
          version: pkg.version
        },
        env: {
          name: name,
          authority: authority
        },
        meta: {
          description: 'Pony Foo is a technical blog maintained by Nicolas Bevacqua, where he shares his thoughts on JavaScript and the web. Nico likes writing, public speaking, and open-source.',
          images: [authority + '/img/thumbnail.png'],
          keywords: []
        },
        bioHtml: data.bioHtml
      },
      javascriptLoader: data.javascriptLoader,
      styleLoader: data.styleLoader,
      fontLoader: data.fontLoader
    });
  }
}

module.exports = getDefaultViewModel;
