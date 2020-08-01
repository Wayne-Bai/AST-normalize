'use strict'
var h = require('hyperscript')
var mlib = require('ssb-msgs')
var pull = require('pull-stream')
var multicb = require('multicb')
var infiniscroll = require('infiniscroll')
var com = require('../com')

module.exports = function (app, opts) {
  opts = opts || {}

  // markup
 
  var feed = h('table.program-feed')
  var feedContainer = infiniscroll(h('.program-feed-container.full-height', feed), { fetchBottom: fetchBottom })

  // message fetch

  var cursor
  function fetchBottom (cb) {
    fetchBottomBy(30)
    function fetchBottomBy (amt) {
      var fetchopts = { reverse: true, type: 'phoenix-program', limit: 30, keys: true, values: true }
      fetchopts.lt = cursor && cursor.value.timestamp
      
      pull(app.ssb.messagesByType(fetchopts), pull.collect(function (err, _msgs) {
        if (_msgs && _msgs.length) {
          // nothing new? stop
          if (cursor && cursor.key === _msgs[_msgs.length - 1].key)
            return (cb && cb())

          // advance cursor
          cursor = _msgs[_msgs.length - 1]

          // filter
          if (opts.filter)
            _msgs = _msgs.filter(opts.filter)

          // render
          _msgs.forEach(function (msg) {
            var el = com.programSummary(app, msg)
            el && feed.appendChild(el)
          })

          // fetch more if needed
          var remaining = amt - _msgs.length
          if (remaining > 0)
            return fetchBottomBy(remaining)
        }

        cb && cb()
      }))
    }
  }
  fetchBottom()

  return feedContainer
}