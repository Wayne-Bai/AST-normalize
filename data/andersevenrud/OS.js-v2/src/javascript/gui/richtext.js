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
   * Richt Text Element
   *
   * @param String    name    Name of GUIElement (unique)
   * @param Object    opts    A list of options
   *
   * @option opts String    fontName      Name of the font used
   * @option opts Function  onInited      Callback when inited
   *
   * @see OSjs.Core.GUIElement
   * @api OSjs.GUI.RichText
   *
   * @extends GUIElement
   * @class
   */
  var RichText = function(name, opts) {
    opts = opts || {};
    if ( !OSjs.Compability.richtext ) { throw new Error('Your platform does not support RichText editing'); }

    this.$view          = null;
    this.opts           = opts || {};
    this.opts.fontName  = this.opts.fontName || 'Arial';
    this.opts.onInited  = this.opts.onInited || function() {};
    this.opts.isIframe  = true;
    this.loadContent    = null;
    this.strlen         = 0;

    GUIElement.apply(this, [name, opts]);
  };

  RichText.prototype = Object.create(GUIElement.prototype);

  RichText.prototype.init = function() {
    var el = GUIElement.prototype.init.apply(this, ['GUIRichText']);
    var self = this;

    this.$view = document.createElement('iframe');
    this.$view.setAttribute('border', '0');

    el.appendChild(this.$view);

    return el;
  };

  RichText.prototype.update = function() {
    if  ( this.inited ) { return; }
    GUIElement.prototype.update.apply(this, arguments);

    var wm = OSjs.Core.getWindowManager();
    var theme = (wm ? wm.getSetting('theme') : 'default') || 'default';
    var themeSrc = OSjs.API.getThemeCSS(theme);
    var self = this;
    var template = '<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="' + themeSrc + '" /></head><body contentEditable="true"></body></html>';
    var doc;
    try {
      doc = this.getDocument();
      doc.open();
      doc.write(template);
      doc.close();
    } catch (error) {
      console.error('Failed to write RichText template', error);
    }

    if ( doc ) {
      doc.body.style.fontFamily = this.opts.fontName;

      try {
        this.$view.execCommand('styleWithCSS', false, false);
      } catch(e) {
        try {
          this.$view.execCommand('useCSS', false, null);
        } catch(ex) {
          try {
            this.$view.execCommand('styleWithCSS', false, false);
          } catch(exx) {
          }
        }
      }

      try {
        this.$view.contentWindow.onfocus = function() {
          self.focus();
        };
        this.$view.contentWindow.onblur = function() {
          self.blur();
        };
        var _timeout;
        this._addEventListener(this.$view.contentWindow, 'keypress', function(ev) {
          if ( _timeout ) {
            clearTimeout(_timeout);
            _timeout = null;
          }
          _timeout = setTimeout(function() {
            var strlen = self.getContent().length;
            if ( self.strlen !== strlen ) {
              self.hasChanged = true;
            }
            self.strlen = strlen;
          }, 100);
        });
      } catch ( e ) {
        console.warn('Failed to bind focus/blur on richtext', e);
      }

      if ( this.opts.onInited ) {
        this.opts.onInited.apply(this, []);
      }

      if ( this.loadContent ) {
        this.loadContent();
        this.loadContent = null;
      }
    }
  };

  /**
   * Send a command
   *
   * @param   String      cmd       Command name
   * @parm    boolean     defaultUI ???
   * @param   Array       args      Command argument list
   *
   * @return  Mixed                 Result or 'false'
   *
   * @method  RichText::command()
   */
  RichText.prototype.command = function(cmd, defaultUI, args) {
    var d = this.getDocument();
    if ( d ) {
      var argss = [];
      if ( typeof cmd         !== 'undefined' ) { argss.push(cmd); }
      if ( typeof defaultUI   !== 'undefined' ) { argss.push(defaultUI); }
      if ( typeof args        !== 'undefined' ) { argss.push(args); }

      try {
        var result = d.execCommand.apply(d, argss);
        this.hasChanged = true;
        return result;
      } catch ( e ) {
        console.warn('OSjs.GUI.RichText::command() failed', cmd, defaultUI, args, e);
      }
    }
    return false;
  };

  /**
   * Gets the current command value
   *
   * @param   String      q     The query
   *
   * @return  Mixed
   *
   * @method  RichText::commandValue()
   */
  RichText.prototype.commandValue = function(q) {
    try {
      return this.getDocument().queryCommandValue(q);
    } catch ( e ) {
      console.warn('RichText::commandValue()', q, 'error', e, e.stack);
    }
    return null;
  };

  /**
   * Set the content
   *
   * @param   String      c       Content (innerHTML)
   *
   * @return  boolean
   *
   * @method  RichText::setContent()
   */
  RichText.prototype.setContent = function(c) {
    this.hasChanged = false;
    this.strlen = c.length;

    var d = this.getDocument();
    if ( d && d.body ) {
      d.body.innerHTML = c;
      return true;
    }
    return false;
  };

  /**
   * Get the content
   *
   * @return  String      Content (innerHTML)
   *
   * @method  RichText::getContent()
   */
  RichText.prototype.getContent = function() {
    var self = this;
    function _getContent() {
      var d = self.getDocument();
      if ( d && d.body ) {
        return d.body.innerHTML;
      }
      return null;
    }

    if ( !this.inited ) {
      this.loadContent = _getContent;
      return null;
    }
    return _getContent();
  };

  /**
   * Get the document
   *
   * @return  DOMDocument
   *
   * @method  RichText::getDocument()
   */
  RichText.prototype.getDocument = function() {
    if ( this.$view ) {
      return this.$view.contentDocument || this.$view.contentWindow.document;
    }
    return null;
  };

  /**
   * Get the window
   *
   * @return  DOMWindow
   *
   * @method  RichText::getWindow()
   */
  RichText.prototype.getWindow = function() {
    if ( this.$view ) {
      return this.$view.contentWindow;
    }
    return null;
  };

  RichText.prototype.blur = function() {
    if ( !GUIElement.prototype.blur.apply(this, arguments) ) { return false; }
    if ( this.$view && this.$view.contentWindow ) {
      this.$view.contentWindow.blur();
    }
    return true;
  };

  RichText.prototype.focus = function() {
    if ( !GUIElement.prototype.focus.apply(this, arguments) ) { return false; }
    if ( this.$view && this.$view.contentWindow ) {
      this.$view.contentWindow.focus();
    }
    return true;
  };

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.GUI.RichText     = RichText;

})(OSjs.Core.GUIElement);
