'use strict'
var h = require('hyperscript')
var mlib = require('ssb-msgs')
var pull = require('pull-stream')
var multicb = require('multicb')
var infiniscroll = require('infiniscroll')
var com = require('../com')

var mustRenderOpts = { mustRender: true }
module.exports = function (app, opts) {
  opts = opts || {}

  var feedState = opts.state
  var feedContainer = null
  if (!feedState)
    feedState = module.exports.makeStateObj()

  if (!opts.feed)
    opts.feed = app.ssb.createFeedStream

  var cursor = function (msg) {
    if (msg)
      return [msg.value.timestamp, msg.value.author]
  }

  // markup
 
  if (!feedState.tbody)
    feedState.tbody = makeUnselectable(h('tbody'))
  else {
    // update message states
    var stateObj = { read: false }
    Array.prototype.forEach.call(feedState.tbody.querySelectorAll('tr'), function (el) {   
      com.messageSummary.fetchRowState(app, el)
    })
  }

  feedContainer = infiniscroll(h('.message-feed-container.full-height', 
    h('table.message-feed', feedState.tbody)),
    { fetchTop: fetchTop, fetchBottom: fetchBottom })
  feedState.tbody.onclick = onclick

  // message fetch

  if (!feedState.tbody.hasChildNodes())
    fetchBottom()

  function fetchTop (cb) {
    fetchTopBy(30)
    function fetchTopBy (amt) {
      var fetchopts = { reverse: false }
      fetchopts.gt = cursor(feedState.topCursor)
      var topmsgEl = feedState.tbody.children[0]

      doFetch(fetchopts, function (err, _msgs) {
        if (_msgs && _msgs.length) {
          // nothing new? stop
          if (feedState.topCursor && feedState.topCursor.key == _msgs[_msgs.length - 1].key)
            return (cb && cb())

          // advance cursors
          feedState.topCursor = _msgs[_msgs.length - 1]
          if (!feedState.bottomCursor)
            feedState.bottomCursor = _msgs[0]

          // filter
          if (opts.filter)
            _msgs = _msgs.filter(opts.filter)

          // render
          var lastEl = feedState.tbody.firstChild
          for (var i=_msgs.length-1; i >= 0; i--) {            
            var el = com.messageSummary(app, _msgs[i], mustRenderOpts)
            el && feedState.tbody.insertBefore(el, lastEl)
          }

          // maintain scroll position (fetchTop-only behavior)
          if (topmsgEl)
            feedContainer.scrollTop = topmsgEl.offsetTop

          // fetch more if needed
          var remaining = amt - _msgs.length
          if (remaining > 0)
            return fetchTopBy(remaining)
        }

        cb && cb()
      })
    }
  }
  function fetchBottom (cb) {
    fetchBottomBy(30)
    function fetchBottomBy (amt) {
      var fetchopts = { reverse: true }
      fetchopts.lt = cursor(feedState.bottomCursor)
      
      doFetch(fetchopts, function (err, _msgs) {
        if (_msgs && _msgs.length) {
          // nothing new? stop
          if (feedState.bottomCursor && feedState.bottomCursor.key == _msgs[_msgs.length - 1].key)
            return (cb && cb())

          // advance cursors
          feedState.bottomCursor = _msgs[_msgs.length - 1]
          if (!feedState.topCursor)
            feedState.topCursor = _msgs[0]

          // filter
          if (opts.filter)
            _msgs = _msgs.filter(opts.filter)

          // render
          _msgs.forEach(function (msg) {
            var el = com.messageSummary(app, msg, mustRenderOpts)
            el && feedState.tbody.appendChild(el)
          })

          // fetch more if needed
          var remaining = amt - _msgs.length
          if (remaining > 0)
            return fetchBottomBy(remaining)
        }

        cb && cb()
      })
    }
  }

  function doFetch (fetchopts, cb) {
    fetchopts.limit = fetchopts.limit || 30
    pull(opts.feed(fetchopts), pull.collect(function (err, _msgs) {
      cb(err, _msgs)
    }))
  }

  // handlers

  // bubble-up click handler to make re-binding events easier when dom elements used from memory
  function onclick (e) {
    // find a click target
    var el = e.target
    while (el) {
      if (el.tagName == 'A' || el.className == 'message-feed' || el.classList.contains('message-summary'))
        break
      el = el.parentNode
    }

    // act on el
    if (el.classList.contains('message-summary'))
      navToMsg(e, el)
    if (el.classList.contains('upvote'))
      vote(e, el, 1)
    if (el.classList.contains('downvote'))
      vote(e, el, -1)
  }

  function navToMsg (e, el) {
    e.preventDefault()
    e.stopPropagation()
    var key = el.dataset.msg
    if (key)
      window.location.hash = '#/msg/'+key
  }
  function vote (e, el, vote) {
    e.preventDefault()
    e.stopPropagation()
    var row = el.parentNode.parentNode.parentNode.parentNode.parentNode // a bit brittle...
    var key = row.dataset.msg
    if (key) {
      // get current state by checking if the control is selected
      // this won't always be the most recent info, but it will be close and harmless to get wrong,
      // plus it will reflect what the user expects to happen happening
      var selected = el.classList.contains('selected')
      if (selected)
        vote = 0 // toggle behavior: unset
      el.classList.toggle('selected') // do optimistic update for ui smoothness
      // :TODO: use msg-schemas
      app.ssb.publish({ type: 'vote', voteTopic: { msg: key }, vote: vote }, function (err) {
        if (err) swal('Error While Publishing', err.message, 'error')
        else {
          com.messageSummary.fetchRowState(app, row, key)
        }
      })
    }
  }

  return feedContainer
}

module.exports.makeStateObj = function () {
  return {
    msgs: [],
    topCursor: null,
    bottomCursor: null,
    tbody: null,
    lastScrollTop: 0
  } 
}

function makeUnselectable (elem) {
  elem.onselectstart = function() { return false; };
  elem.style.MozUserSelect = "none";
  elem.style.KhtmlUserSelect = "none";
  elem.unselectable = "on";
  return elem
}