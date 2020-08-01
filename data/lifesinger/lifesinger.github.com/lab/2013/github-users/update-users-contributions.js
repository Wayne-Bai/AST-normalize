
var util = require('./util')

var stats = require('./github-users-stats.json')
util.getPages(getProfileUrls(Object.keys(stats)), saveContributions, function() {
  util.saveStats('github-users-stats.json', stats)

  stats = require('./github-users-stats-china.json')
  util.getPages(getProfileUrls(Object.keys(stats)), saveContributions, function() {
    util.saveStats('github-users-stats-china.json', stats)
  })
})


function saveContributions(html, url) {
  var username = getUsername(url)
  stats[username].contributions = parseContributions(html)
}


function getProfileUrls(usernames) {
  return usernames.map(function(username) {
    return 'https://github.com/' + username
  })
}


function parseContributions(html) {
  var m = html.match(/<span class="num">([\d,]+) Total<\/span>/) || []
  return parseInt((m[1] || '').replace(/,/g, '')) || 0
}


function getUsername(url) {
  var parts = url.split('/')
  return parts[parts.length - 1]
}
