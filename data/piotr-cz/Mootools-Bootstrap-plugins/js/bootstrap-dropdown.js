/* ============================================================
 * bootstrap-dropdown.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
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
 * ============================================================ */


!function ($, $$) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).addEvent('click', this.toggle)
        $(document).addEvent('click', function () { // if `document.getElement('html')`, event not fired
          var $parent = $el.getParent()
          if ($parent) $parent.removeClass('open');
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.match('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      clearMenus()

      if (!isActive) {
        $parent.toggleClass('open')
      }

      $this.focus()

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.key)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.match('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      if (!isActive || (isActive && e.key == 27)) {
        if (e.which == 27) $parent.getElements(toggle).focus()
        return $this.fireEvent('click')
      }

      $items = $parent.getElements('[role=menu] li:not(.divider):visible a')

      if (!$items.length) return

      index = $items.indexOf( $parent.getElement('[role=menu] li:not(.divider):visible a:focus'));
//		items.each(function($item, i){ if ($item.match(':focus')) index = i });

      if (e.key == 38 && index > 0) index--                                        // up
      if (e.key == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items[index]
        .focus()
    }

  }

  function clearMenus() {
    $$(toggle).each(function ($this, i, arr) {
	  getParent($this).removeClass('open')
    })
  }

  function getParent($this) {
    var selector = $this.getProperty('data-target')
      , $parent

    if (!selector) {
      selector = $this.getProperty('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = selector && $(selector)

    if (!$parent) $parent = $this.getParent()

    return $parent
  }


  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  var old = Element.prototype.dropdown

  Element.implement('dropdown', function (option) {
    var $this = $(this)
      , data = $this.retrieve('dropdown')
    if (!data) $this.store('dropdown', (data = new Dropdown(this)))
    if (typeof option == 'string') data[option].call($this)
    return $this
  })

  Element.prototype.dropdown.Constructor = Dropdown


 /* DROPDOWN NO CONFLICT
  * ==================== */

  Element.dropdown.noConflict = function () {
    Element.dropdown = old
    return this
  }


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .addEvent('click', clearMenus)
    .addEvent('click:relay(.dropdown form)', function(e) { e && e.stopPropagation() })
    .addEvent('click', function(e) { e || e.stopPropagation && e.stopPropagation() })
    .addEvent('click:relay(' + toggle + ')', Dropdown.prototype.toggle)
    .addEvent('keydown:relay(' + toggle + ', [role=menu])', Dropdown.prototype.keydown)

}(document.id, document.getElements);
