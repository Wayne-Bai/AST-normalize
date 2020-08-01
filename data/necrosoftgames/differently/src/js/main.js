Flatdoc.run({
  fetcher: Flatdoc.file('index.md')
});


$(document).on('flatdoc:ready', function() {
  fixHeaders()
  fixIDs()
  wrapElements()
  fixiFrame()
  configJSON()
})

/*
  Tries to fix the links if you use images as h elements.
  I think this works!
*/
function fixHeaders() {
  $('h1').each(function() {
    if ($(this).text().length == 0) {
      var key = 'id'
      var value = 'root'

      var text = $(this).children('img').attr('alt')
      var slug = Flatdoc.slugify(text)

      var rootItem = $('li#root-item.level-1').eq(0)
      var rootList = rootItem.children('ul#root-list.level-2')

      rootItem.attr(key, rootItem.attr(key).replace(value, slug))
      rootList.attr(key, rootList.attr(key).replace(value, slug))

      rootItem.prepend($('<a id=' + slug + '-link class=level-1 href=#' + slug + '>' + text + '</a>'))

      $(this).attr(key, slug)
    }
  })

  $('h2').each(function() {
    if ($(this).text().length == 0) {
      var key = 'id'
      var value = '-'
      var link = 'href'

      var text = $(this).children('img').attr('alt')
      var slug = Flatdoc.slugify(text)

      var rootItem = $('li#--item.level-2').eq(0)

      rootItem.attr(key, rootItem.attr(key).replace(value, (value + slug)))

      rootItem.find('*').each(function(index) {
        $(this).attr(key, $(this).attr(key).replace(value, (value + slug)))

        if (typeof($(this).attr(link)) !== typeof undefined && $(this).attr(link) !== false) {
          $(this).attr(link, $(this).attr(link).replace(value, (value + slug)))

          var fixId = $('[id*="--"]')
          fixId.attr(key, fixId.attr(key).replace(value, (value + slug)))
        }
      })

      rootItem.prepend($('<a id=-' + slug + '-link class=level-2 href=#-' + slug + '>' + text + '</a>'))

      $(this).attr(key, ('-' + slug))
    }
  })
}

/*
  Using an image a h1 technically breaks the links.
  This should fix them back to their original form.
*/
function fixIDs() {
  var key = 'id'
  var slug = ''
  var link = 'href'

  $('#root-list ul, #root-list li, #root-list a').each(function(index) {
    if ($(this).attr(key).substring(0, 1) !== '-') {
      slug = $(this).attr(key).slice(0, -5)
    }
    else {
      $(this).attr(key, (slug + $(this).attr(key)));

      if (typeof($(this).attr(link)) !== typeof undefined && $(this).attr(link) !== false) {
        $(this).attr(link, $(this).attr(link).replace('#', ('#' + slug)))
      }
    }
  })
}

/*
  Wrap the sub groups so they're easier to manage in CSS.
*/
function wrapElements() {
  var h1Div = ''
  var key = 'id'

  $('.content h1, .content h2, .content h3').each(function(index) {
    if ($(this).is('h1')) {
      h1Div = $(this).attr(key)
    }
    else if ($(this).is('h2')) {
      $(this).nextUntil('h1, h2').andSelf().wrapAll('<div ' + key + '=' + $(this).attr(key).substring(1, $(this).attr(key).length) + '/>')
      $(this).attr(key, (h1Div + $(this).attr(key)))
    }
    else if ($(this).is('h3')) {
      $(this).attr(key, (h1Div + $(this).attr(key)))
    }
  })
}

/*
  Puts div around iframe so it can be correctl resized
*/
function fixiFrame() {
  $('iframe').each(function(index) {
    $(this).wrap('<div class="iframe-container"/>')
  });
}

function configJSON()
{
  $.getJSON('config.json', function(json) {

    titleAndHeaderLinks(json['title'], json['largeLinks'], json['projectLinks'])
    bootstrapElements(json['layout'])

    if ($.isEmptyObject(json['googleAnalytics']) || json['googleAnalytics'].length === 0) { return }
    $('head').append('\
    <script>\
      var _gaq=[["_setAccount",' + json['googleAnalytics'] + '] ,["_trackPageview"]];\
      (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];\
        g.src=("https:""==location.protocol?""//ssl":""//www")+"".google-analytics.com/ga.js";\
        s.parentNode.insertBefore(g,s)}(document,"script"));\
    </script>')
  })
}

function titleAndHeaderLinks(title, largeLinks, projectLinks) {

  $('title').text(title)

  if ($.isEmptyObject(largeLinks) && $.isEmptyObject(projectLinks)) { return }

  $('.content-root').before('<div class="header"><div class="left"><ul></ul></div></div>')

  if (!$.isEmptyObject(largeLinks)) {
    $.each(largeLinks, function(index, data) {
      $('.left ul').append('<li><a href=' + data['link'] + '><h1>' + data['name'] + '</h1></a></li>')
    })
  }

  if (!$.isEmptyObject(projectLinks)) {
    $.each(projectLinks, function(index, data) {
      $('.left ul').append(' <li><a href=' + data['link'] + '>' +  data['name'] + '</a></li>')
    })
  }
}

/*
  Add tags required for bootstrap
*/
function bootstrapElements(json) {
  var key = 'id'

  $('.header').addClass('navbar navbar-default navbar-static-top')

  $('.content-root').addClass('container-fluid')

  $('.menubar').addClass('col-sm-3 col-md-3 sidebar')
  $('.menubar ul').first().addClass('nav nav-sidebar')

  $('.content').addClass('col-sm-9 col-md-9 main')
  $('.content h1').first().addClass('col-md-12')

  $('.content div').each(function(index, data) {
    if (typeof($(this).attr(key)) !== typeof undefined && $(this).attr(key) !== false) {

      var divID = $(this).attr(key)

      if ($.grep(json['40%_Width'], function (value, i) { return (divID.indexOf(value) >= 0) }).length > 0) {
        $(this).addClass('col-md-4')
      }
      else if ($.grep(json['50%_Width'], function (value, i) { return (divID.indexOf(value) >= 0) }).length > 0) {
        $(this).addClass('col-md-6')
      }
      else if ($.grep(json['60%_Width'], function (value, i) { return (divID.indexOf(value) >= 0) }).length > 0) {
      }
      else {
        $(this).addClass('col-md-12')
      }
    }
  })

  $('#' + json['60%_Width'][0]).nextUntil('.col-md-12').andSelf().wrapAll('<div class=col-md-8></div>')
}
