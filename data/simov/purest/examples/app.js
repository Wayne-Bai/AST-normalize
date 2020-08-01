
var purest = require('../lib/provider')
var cred = {
  app:require('../config/app'),
  user:require('../config/user')
}

var cmd = require('commander')
  .version('0.0.0')
  .option('-p, --provider <name>', 'REST API provider')
  .option('-e, --example <index>', 'Example index')
  .option('-i, --id [index]', 'ID index')
  .option('-t, --token [index]', 'Token index')
.parse(process.argv)

if (!cmd.provider) {
  return console.log('Pass in a REST API provider!')
}
if (!cred.user[cmd.provider]) {
  return console.log('Non existing provider!')
}
if (!cmd.example) {
  return console.log('Specify an example index to execute!')
}

var provider = cmd.provider

var p = new purest({
  provider:provider,
  key:cred.app[provider] ? cred.app[provider].key : null,
  secret:cred.app[provider] ? cred.app[provider].secret : null
})

var example = require('./provider/'+provider)(p)

if (example[cmd.example] == undefined) {
  return console.log('Specified example index does not exist!')
}

var config = require('../config/examples')

if (cmd.token) {
  cred.user[provider].token = config[provider].token[cmd.token]
  cred.user[provider].secret = 
    config[provider].secret ? config[provider].secret[cmd.token] : null
}

var id = (function () {
  if (!cmd.id) return null
  // fql IN (id,id,id)
  var ids = cmd.id.split(',')
  if (!ids.length) return cmd.id
  return ids.map(function (i) {
    return config[provider].id[i]
  }).join()
}())

example[cmd.example](id)
