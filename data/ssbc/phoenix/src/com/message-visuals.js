var mlib = require('ssb-msgs')

module.exports = function getVisuals (app, msg) {
  try {
    return ({
      init:   function ()  { return { cls: '.initmsg', icon: 'off' } },
      post:   function ()  { return { cls: '.postmsg', icon: 'comment' } },
      advert: function ()  { return { cls: '.advertmsg', icon: 'bullhorn' } },
      contact: function () { return { cls: '.contactmsg', icon: 'user' } },
      pub:    function ()  { return { cls: '.pubmsg', icon: 'cloud' } }
    })[msg.value.content.type]()
  } catch (e) { }

  return { cls: '.rawmsg', icon: 'th-list' }
}