/*!
 * OS.js - JavaScript Operating System
 *
 * Copyright (c) 2011-2015, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */
(function(GUIElement) {
  'use strict';

  /**
   * Label
   *
   * @param String    name    Name of GUIElement (unique)
   * @param Object    opts    A list of options
   *
   * @option  opts  String    label       The Label of Element
   * @option  opts  String    forInput    ID/Name of input element (optional HTML feature)
   *
   * @api OSjs.GUI.Label
   *
   * @extends GUIElement
   * @class
   */
  var Label = function(name, opts) {
    opts            = opts || {};
    opts.focusable  = false;
    opts.label      = opts.label || opts.value || '';

    GUIElement.apply(this, [name, opts]);
  };

  Label.prototype = Object.create(GUIElement.prototype);

  Label.prototype.init = function() {
    var el = GUIElement.prototype.init.apply(this, ['GUILabel', 'label']);
    el.appendChild(document.createTextNode(this.opts.label));
    if ( this.opts.forInput ) {
      el.setAttribute('for', this.opts.forInput);
    }
    return el;
  };

  /**
   * Set the label value
   *
   * @param   String    l       The value
   *
   * @return  void
   *
   * @method  Label::setLabel()
   */
  Label.prototype.setLabel = function(l) {
    this.opts.label = l;
    this.$element.innerHTML = '';
    this.$element.appendChild(document.createTextNode(this.opts.label));
  };

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.GUI.Label        = Label;

})(OSjs.Core.GUIElement);
