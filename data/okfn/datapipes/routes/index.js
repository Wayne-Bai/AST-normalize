var fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , _ = require('underscore')
  ;

exports.wizard = function(req, res) {
  if (!req.query.url) {
    res.render('interactive.html', {
      query: {
        head: 10,
        delimiter: ','
      },
      output: 'html'
    });
    return;
  }

  queryStr = '?url=' + req.query.url;
  var tmp = _.extend({}, req.query);
  delete tmp.url;
  var output = req.query.output || 'html';
  delete tmp.output;

  var pipes = ['csv -d ' + tmp.delimiter];
  delete tmp.delimiter;

  pipes = pipes.concat(_.map(tmp, function(v, k) {
    return k + ' ' + v
  }));

  // csv is default output format
  if (output !== 'csv') {
    pipes.push(output);
  }
  pipes = pipes.join('/');

  var pipeline = req.protocol + '://' + req.get('host') + '/' + pipes + '/' + queryStr;

  var query = _.extend({}, tmp);
  query.delimiter = req.query.delimiter;

  var tmplData = {
    url: req.query.url,
    output: output,
    pipeline: pipeline,
    query: query
  };

  res.render('interactive.html', tmplData);
};

