
//     node-bootstrap-readme-docs
//     Copyright (c) 2013- Prove <support@getprove.com> (https://getprove.com/)
//     MIT Licensed

var GitHubApi = require('github')
  , cheerio = require('cheerio')
  , connect = require('connect')
  , moment = require('moment')
  , marked = require('marked')
  , fs = require('fs')

module.exports = function(app) {

  function bin(fileName, callback) {

    fs.exists(fileName, function(exists) {
      if (!exists)
        return callback(new Error('File does not exist'))
      fs.readFile(fileName, 'utf-8', getReadme(callback))
    })

  }

  function middleware(user, repo, interval) {

    interval = (typeof interval === 'number') ? interval : 900000

    return function(req, res, next) {

      if (typeof user !== 'string' || typeof repo !== 'string')
        return next(new Error('Missing user or repo for generating docs'))

      if (typeof app.get('readmeDocs') !== 'object')
        app.set('readmeDocs', {})

      if (typeof app.settings.readmeDocs[user] !== 'object')
        app.settings.readmeDocs[user] = {}

      if (typeof app.settings.readmeDocs[user][repo] !== 'object')
        app.settings.readmeDocs[user][repo] = {}

      var obj = app.settings.readmeDocs[user][repo]

      if (obj.created
          && moment.isMoment(obj.created)
          && moment().diff(obj.created) <= interval)
        return next()

      var github = new GitHubApi({
          version: "3.0.0"
        , timeout: 5000
      })

      github.repos.getReadme({
          user: user
        , repo: repo
      }, getReadme(req, res, next, user, repo, obj))

    }

  }

  function getReadme(req, res, next, user, repo, obj) {

    // bin
    if (typeof req === 'function')
      return function(err, body) {
        if (err) return req(err)
        req(null, generateDocs(body))
      }

    // middleware
    return function(err, body) {
      if (err) return next(err)
      app.settings.readmeDocs[user][repo] = generateDocs(body)
      next()
    }

  }

  function generateDocs(body) {

    var buffer = (typeof body === 'object') ? new Buffer(body.content, body.encoding) : body
      , readme = marked(buffer.toString())
      , $ = cheerio.load(readme)
      , results = {}

    // Set created date, we use this for re-caching the readme docs (see above check)
    results.created = moment()

    // Convert index to navbar
    var $ul = $('h2').first().next('ul')

    // Make the first link active
    $ul.find('li').first().addClass('active')
    results.nav = $ul.html()
    $ul.remove()
    $('h2').first().remove()

    // Replace all header tags with anchor tags
    $('h1, h2, h3, h4, h5, h6').each(function(i, el) {
      // Remove <sup> from text
      var $sup = $(this).find('sup')
      if ($sup.length !== 0)
        $(this).find('sup').remove()
      var text = $(this).text().trim()
      // Prepare the link
      var link = text.replace(/\s/g, '-').toLowerCase()
      // Replace all characters that are not A-Z, 0-9, -, _, \s
      link = link.replace(/[^A-Za-z0-9_-\s]+/g, '')
      $(this).html('<a href="#' + link + '" name="' + link + '" id="' + link + '">' + text + '</a>' + (($sup.length !== 0) ? ' ' + $.html($sup) : '' ) )
      $(this).before('<hr />')
    })

    // Add prettyprint and linenums all <pre>'s
    $('pre').addClass('prettyprint linenums')

    // Add .table, .table-striped, .table-hover to all <table>'s
    $('table').addClass('table table-striped table-hover')

    results.body = $.html()

    return results
  }

  return {
      middleware: middleware
    , bin: bin
  }

}
