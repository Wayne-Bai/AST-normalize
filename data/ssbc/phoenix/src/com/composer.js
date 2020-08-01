'use strict'
var h = require('hyperscript')
var com = require('./index')

module.exports = function (app, parent) {

  // forms
  var navitems = [['post', onchangeform, 'Post']]
  var forms = { post: com.postForm.bind(null, app) }
  app.getAll('composer').forEach(function (item) {
    forms[item.config.id] = item.fn
    navitems.push([item.config.id, onchangeform, item.config.label || 'Unlabeled'])
  })

  // markup

  var nav = com.nav({
    current: 'post',
    items: navitems
  })
  var container = h('div')
  var composer = h('.composer' + ((!!parent) ? '.reply' : ''),
    nav,
    h('p',
      h('small.text-muted', 
        'All posts are public. Markdown, @-mentions, and emojis are supported. ',
        h('a', { href: '#/action/cancel', onclick: cancel }, 'Cancel'))),
    container)
  setForm('post')

  function setForm (id) {
    container.innerHTML = ''
    container.appendChild(forms[id](parent))
  }

  // handlers

  function onchangeform (e) {
    e.preventDefault()

    // update selected
    var s = nav.querySelector('.selected')
    s && s.classList.remove('selected')
    e.target.classList.add('selected')

    // set current form
    setForm(e.target.dataset.item)
  }

  function cancel (e) {
    e.preventDefault()
    composer.parentNode.removeChild(composer)
  }

  return composer
}