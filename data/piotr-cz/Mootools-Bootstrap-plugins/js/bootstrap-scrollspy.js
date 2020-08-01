/* =============================================================
 * bootstrap-scrollspy.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#scrollspy
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================== */


!function ($, $$) {

  "use strict"; // jshint ;_;


 /* SCROLLSPY CLASS DEFINITION
  * ========================== */

  function ScrollSpy(element, options) {
    var process = this.process.bind(this, arguments)
      , $element = $(element).match('body') ? $(window) : $(element)
      , href
    this.options = Object.append({}, Element.prototype.scrollspy.defaults, options)
    this.$scrollElement = $element.addEvent('scroll', process)
    this.selector = (this.options.target
      || ((href = $(element).getAttribute('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.$body = document.getElement('body')
    this.refresh()
	this.process()
  }

  ScrollSpy.prototype = {

      constructor: ScrollSpy

    , refresh: function () {
        var self = this
          , $targets

        this.offsets = []
        this.targets = []

        $targets = this.$body
          .getElements(this.selector) // nothing
          .map(function ($el) {
            var href = $el.retrieve('target') || $el.get('href')
              , $href = /^#\w/.test(href) && document.getElement(href)
            return ( $href
              && [ $href.getPosition().y + (!(window == self.$scrollElement) && self.$scrollElement.getScroll().y), href ] ) || null
          })
          .sort(function (a, b) { return a[0] - b[0] })
          .each(function ($this) {
            self.offsets.push($this[0])
            self.targets.push($this[1])
          })
      }

    , process: function () {
        var scrollTop = this.$scrollElement.getScroll().y + this.options.offset
          , scrollHeight = this.$scrollElement.scrollHeight || this.$body.scrollHeight
          , maxScroll = scrollHeight - this.$scrollElement.getSize().y
          , offsets = this.offsets
          , targets = this.targets
          , activeTarget = this.activeTarget
          , i

        if (scrollTop >= maxScroll) {
          return activeTarget != (i = Array.from(targets).getLast())
            && this.activate ( i )
        }

        for (i = offsets.length; i--;) {
          activeTarget != targets[i]
            && scrollTop >= offsets[i]
            && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
            && this.activate( targets[i] )
        }
      }

    , activate: function (target) {
        var active
          , selector

        this.activeTarget = target

        var $parent = document.getElement(this.selector).getParent('.active')
        if ($parent) $parent.removeClass('active')

        selector = this.selector
          + '[data-target="' + target + '"],'
          + this.selector + '[href="' + target + '"]'

        active = document.getElement(selector)
          .getParent('li')
          .addClass('active')

        if (active.getParent('.dropdown-menu'))  {
          active = active.getParent('li.dropdown').addClass('active')
        }

        active.fireEvent('activate')
      }

  }


 /* SCROLLSPY PLUGIN DEFINITION
  * =========================== */

  var old = Element.prototype.scrollspy

  Element.implement( 'scrollspy', function (option) {
    var $this = $(this)
      , data = $this.retrieve('scrollspy')
      , options = typeof option == 'object' && option
    if (!data) $this.store('scrollspy', (data = new ScrollSpy(this, options)))
    if (typeof option == 'string') data[options]()
    return $this
  })

  Element.prototype.scrollspy.Constructor = ScrollSpy

  Element.prototype.scrollspy.defaults = {
    offset: 10
  }


 /* SCROLLSPY NO CONFLICT
  * ===================== */

  Element.scrollspy.noConflict = function () {
    Element.scrollspy = old
    return this
  }


 /* SCROLLSPY DATA-API
  * ================== */

  window.addEvent('load', function () {
    document.getElements('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.getProperties('data-target')) // TODO $spy.scrollspy($spy.data())
    })
  })

}(document.id, document.getElements);