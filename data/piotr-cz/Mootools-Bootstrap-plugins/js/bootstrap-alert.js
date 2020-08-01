/* ==========================================================
 * bootstrap-alert.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#alerts
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


!function ($, $$) {

  "use strict"; // jshint ;_;


 /* ALERT CLASS DEFINITION
  * ====================== */

  var dismiss = '[data-dismiss="alert"]'
    , Alert = function (el) {
        $(el).addEvent('click:relay(' + dismiss + ')', this.close)
      }

  Alert.prototype.close = function (e) {
    var $this = $(e && e.target || this)
      , selector = $this.get('data-target')
      , $parent

    if (!selector) {
      selector = $this.get('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = document.getElement(selector)

    e && e.preventDefault()

    $parent || ($parent = $this.hasClass('alert') ? $this : $this.getParent());

    // Create dummy event
    e = { 
      preventDefault: function(){ this.isDefaultPrevented = true
    }}

    $parent.fireEvent('close', e);
//  $parent.trigger(e = $.Event('close'))

    if (e.isDefaultPrevented) return

    $parent.removeClass('in')

    function removeElement() {
      $parent
        .fireEvent('closed', e)
        .dispose()
    }

    Browser.support.transition && $parent.hasClass('fade') ?
      $parent.addEvent(Browser.support.transition.end, removeElement) :
      removeElement()
  }


 /* ALERT PLUGIN DEFINITION
  * ======================= */

  var old = Element.prototype.alert

  Element.implement('alert', function (option) {
      var $this = $(this)
        , data = $this.retrieve('alert')
      if (!data) $this.store('alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
      return $this
  })

  Element.prototype.alert.Constructor = Alert


 /* ALERT NO CONFLICT
  * ================= */

  Element.alert.noConflict = function () {
    Element.alert = old
    return this
  }


 /* ALERT DATA-API
  * ============== */

  $(document).addEvent('click:relay(' + dismiss + ')', Alert.prototype.close);

}(document.id, document.getElements);