
var util = require('./util')

getLanguageStats('./github-users-sorted-stats.json', 'github-languages-stats.json')
getLanguageStats('./github-users-sorted-stats-china.json', 'github-languages-stats-china.json')


function getLanguageStats(inputfile, outputfile) {
  var stats = require(inputfile)
  var total = stats.length
  var languages = { Total: total }

  stats.forEach(function(stat) {
    var lang = stat.language
    languages[lang] = languages[lang] || 0
    languages[lang]++
  })

  languages = (sort(languages, total))

  util.saveStats(outputfile, languages)
}


function sort(obj, total) {
  var swap = {}

  Object.keys(obj).forEach(function(k, v) {
    v = obj[k]
    swap[v] = swap[v] || []
    swap[v].push(k)
  })

  var ret = {}
  for (var i = total; i >= 0; i--) {
    var k = swap[i]
    if (k) {
      k.forEach(function(lang) {
        ret[lang] = i
      })
    }
  }

  return ret
}
