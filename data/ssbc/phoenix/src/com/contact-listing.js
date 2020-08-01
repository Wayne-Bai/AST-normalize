var h = require('hyperscript')
var schemas = require('ssb-msg-schemas')
var com = require('./index')
var u = require('../lib/util')

module.exports = function (app, profile, follows) {

  // markup 

  var id = profile.id
  var otherNames = u.getOtherNames(app, profile)

  function f (e) { follow(e, id) }
  function unf (e) { unfollow(e, id) }
  function r (e) { rename(e, id) }

  var followbtn, renamebtn
  if (id === app.user.id) {
    followbtn = h('span.text-muted.pull-right', { style: 'padding-right: 1em' }, 'you!')
  } else {
    if (!follows[app.user.id][id])
      followbtn = h('button.btn.btn-primary', { title: 'Follow', onclick: f }, com.icon('plus'), ' Follow')
    else
      followbtn = h('button.btn.btn-primary', { title: 'Unfollow', onclick: unf }, com.icon('minus'), ' Unfollow')
  }
  renamebtn = h('button.btn.btn-primary.btn-xs', { title: 'Rename', onclick: r }, com.icon('pencil'))

  return h('tr.contact-listing',
    h('td.profpic', com.userHexagon(app, id, 60)),
    h('td.details',
      h('p.name', 
        h('strong', com.a('#/profile/'+id, app.users.names[id]||u.shortString(id, 20)), com.nameConfidence(id, app), ' ', renamebtn)),
      h('p',
        (otherNames.length)
          ? h('small.text-muted', 'aka ', otherNames.join(', '))
          : '')),
    h('td.actions', followbtn))

  // handlers
    
  function rename (e, pid) {
    e.preventDefault()
    app.ui.setNamePrompt(pid)
  }

  function follow (e, pid) {
    e.preventDefault()
    if (!follows[app.user.id][pid]) {
      schemas.addContact(app.ssb, pid, { following: true }, function(err) {
        if (err) swal('Error While Publishing', err.message, 'error')
        else app.refreshPage()
      })
    }
  }

  function unfollow (e, pid) {
    e.preventDefault()
    if (follows[app.user.id][pid]) {
      schemas.addContact(app.ssb, pid, { following: false }, function(err) {
        if (err) swal('Error While Publishing', err.message, 'error')
        else app.refreshPage()
      })
    }
  }
}