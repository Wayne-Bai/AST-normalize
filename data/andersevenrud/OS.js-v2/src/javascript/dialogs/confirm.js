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
(function(API, Utils, _StandardDialog) {
  'use strict';

  /**
   * Confirmation Dialog
   *
   * @param   String          msg     Confirm message
   * @param   Function        onClose Callback on close => fn(button)
   * @param   Object          args    List of arguments (Will be passed on to _StandardDialog)
   *
   * @api OSjs.Dialogs.Confirm
   * @see OSjs.Dialogs._StandardDialog
   *
   * @extends _StandardDialog
   * @class
   */
  var ConfirmDialog = function(msg, onClose, args) {
    args = Utils.mergeObject({
      title: API._('DIALOG_CONFIRM_TITLE'),
      icon: 'status/dialog-question.png',
      message: msg,
      buttons: ['cancel', 'ok']
    }, (args || {}));
    _StandardDialog.apply(this, ['ConfirmDialog', args, {width:350, height:120}, onClose]);
  };
  ConfirmDialog.prototype = Object.create(_StandardDialog.prototype);

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Dialogs.Confirm            = ConfirmDialog;

})(OSjs.API, OSjs.Utils, OSjs.Dialogs._StandardDialog);
