/* ==========================================================
 * bootstrap-carousel.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * ==========================================================
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
 * ========================================================== */


/*
---

script: bootstrap-carousel.js

name: Bootstrap.Carousel

description: Twitter Bootstrap plugin for cycling through elements like a carousel

license: APLv2

authors:
  - Twitter

requires:
  - Core/Element.Delegation
  - More/Events.Pseudos

provides: [Element.carousel]

...
*/

!function ($, $$) {

  "use strict"; // jshint ;_;

 /* CAROUSEL CLASS DEFINITION
  * ========================= */

  var Carousel = function (element, options) {
    this.$element = $(element)
    this.$indicators = this.$element.getElement('.carousel-indicators')
    this.options = options
    this.options.pause == 'hover' && this.$element
      .addEvent('mouseenter', this.pause.bind(this)) // $.proxy(this.pause, this)
      .addEvent('mouseleave', this.cycle.bind(this))
  }

  Carousel.prototype = {

    cycle: function (e) {
      if (!e) this.paused = false
      if (this.interval) clearInterval(this.interval);
      this.options.interval
        && !this.paused
        && (this.interval = setInterval(this.next.bind(this), this.options.interval))
      return this
    }

  , getActiveIndex: function () {
      this.$active = this.$element.getElement('.item.active')
      this.$items = this.$active.getParent().getChildren()
      return Array.from(this.$items).indexOf(this.$active)
    }

  , to: function (pos) {
      var activeIndex = this.getActiveIndex()
        , that = this

      if (pos > (this.$items.length - 1) || pos < 0) return

      if (this.sliding) {
        return this.$element.addEvent('slid:once', function () {
          that.to(pos)
        })
      }

      if (activeIndex == pos) {
        return this.pause().cycle()
      }

      return this.slideX(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
    }

  , pause: function (e) {
      if (!e) this.paused = true
      if (this.$element.getElements('.next, .prev').length && Browser.support.transition.end) {
        this.$element.fireEvent(Browser.support.transition.end)
        this.cycle(true)
      }
      clearInterval(this.interval)
      this.interval = null
      return this
    }

  , next: function () {
      if (this.sliding) return
      return this.slideX('next')
    }

  , prev: function () {
      if (this.sliding) return
      return this.slideX('prev')
    }

  , slideX: function (type, next) {
      var $active = this.$element.getElement('.item.active')
        , $next = next || (!$active ? null : type == 'next' ? $active.getNext() : $active.getPrevious())
        , isCycling = this.interval
        , direction = type == 'next' ? 'left' : 'right'
        , fallback  = type == 'next' ? '* ^' : '* !^' // first or last
        , that = this
        , e

      this.sliding = true

      isCycling && this.pause()

      if (!$next) $next = this.$element.getElement(fallback + ' .item')
      if (!$next) return this // Sorry

      e = {
        relatedTarget: $next
      , direction: direction
      , preventDefault: function(){ this.preventedDefault = true }
      , isDefaultPrevented: function(){ return this.preventedDefault }
      }

      if ($next.hasClass('active')) return

      if (this.$indicators && this.$indicators.getElement('.active')) {  // Fix for when clicking too fast on arrows: `Uncaught TypeError: Cannot call method 'removeClass' of null`
        this.$indicators.getElement('.active').removeClass('active')
        this.$element.addEvent('slid:once', function () {
          var $nextIndicator = $(that.$indicators.getChildren()[that.getActiveIndex()])
          $nextIndicator && $nextIndicator.addClass('active')
        })
      }

      if (Browser.support.transition && this.$element.hasClass('slide')) {
        this.$element.fireEvent('slide', e)
        if (e.isDefaultPrevented()) return
        $next.addClass(type)
        $next.offsetWidth // force reflow
        $active.addClass(direction)
        $next.addClass(direction)
        this.$element.addEvent(Browser.support.transition.end + ':once', function () {
          $next.removeClass(type).removeClass(direction).addClass('active')
          $active.removeClass('active').removeClass(direction)
          that.sliding = false
          setTimeout(function () { that.$element.fireEvent('slid') }, 0)
        })
      } else {
        this.$element.fireEvent('slide', e)
        if (e.isDefaultPrevented()) return
        $active.removeClass('active')
        $next.addClass('active')
        this.slididng = false
        this.$element.fireEvent('slid')
      }

      isCycling && this.cycle()

      return this
    }

  }


 /* CAROUSEL PLUGIN DEFINITION
  * ========================== */

  var old = Element.carousel

  Element.implement( 'carousel', function (option) {
    var $this = this
      , data = $this.retrieve('carousel')
      , options = Object.append({}, Element.prototype.carousel.defaults, typeof option == 'object' && option)
      , action = typeof option == 'string' ? option : options.slide
    if (!data) $this.store('carousel', (data = new Carousel(this, options)))
    if (typeof option == 'number') data.to(option)
    else if (action) data[action]()
    else if (options.interval) data.pause().cycle()
    return this
  })

  Element.prototype.carousel.defaults = {
    interval: 5000
  , pause: 'hover'
  }

  Element.prototype.carousel.Constructor = Carousel


 /* CAROUSEL NO CONFLICT
  * ==================== */

  Element.carousel.noConflict = function () {
    Element.carousel = old
    return this
  }

 /* CAROUSEL DATA-API
  * ================= */

  $(document).addEvent('click:relay([data-slide], [data-slide-to])', function(e) {
    var $this = $(this), href
      , $target = document.getElement($this.get('data-target') || (href = $this.get('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      , options = Object.merge({}, dataset($target), dataset($this)) // TODO: dataset for IE7
      , slideIndex

    $target.carousel(options)

    if (slideIndex = $this.get('data-slide-to')) {
      $target.retrieve('carousel').pause().to(slideIndex).cycle() // Problem: Got Div
    }

    e.preventDefault()
  })


  // Helper. Relies on dataset support (IE8+)
  function dataset ($el) {
    var data = {};

    // jQuery auto typecast & camelcase (haha)
    for (var k in $el.dataset) {
      data[k.camelCase()] = (!isNaN($el.dataset[k]))
        ? Number($el.dataset[k])
        : $el.dataset[k]
      ;
    }

    return data;

    // Or
//  return $el.dataset;
  }

}(document.id, document.getElements);