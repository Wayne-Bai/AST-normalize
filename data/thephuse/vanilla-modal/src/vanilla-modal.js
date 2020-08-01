/**
 * @class VanillaModal
 * @version 1.1.1
 * @author Ben Ceglowski
 */
class VanillaModal {
  
  /**
   * @param {Object} [userSettings]
   */
  constructor(userSettings) {
    
    this.$$ = {
      modal : '.modal',
      modalInner : '.modal-inner',
      modalContent : '.modal-content',
      open : '[rel="modal:open"]',
      close : '[rel="modal:close"]',
      page : 'body',
      class : 'modal-visible',
      loadClass : 'vanilla-modal',
      clickOutside : true,
      closeKey : 27,
      transitions : true,
      transitionEnd : null,
      onBeforeOpen : function() {},
      onBeforeClose : function() {},
      onOpen : function() {},
      onClose : function() {}
    };
    
    this._applyUserSettings(userSettings);
    this.error = false;
    this.isOpen = false;
    this.current = null;
    this.open = this._open.bind(this);
    this.close = this._close.bind(this);
    this.$$.transitionEnd = this._transitionEndVendorSniff();
    this.$ = this._setupDomNodes();
    
    if (!this.error) {
      this._addLoadedCssClass();
      this._events().add();
    } else {
      console.error('Please fix errors before proceeding.');
    }
    
  }
  
  /**
   * @param {Object} userSettings
   */
  _applyUserSettings(userSettings) {
    if (typeof userSettings === 'object') {
      for (var i in userSettings) {
        if (userSettings.hasOwnProperty(i)) {
          this.$$[i] = userSettings[i];
        }
      }
    }
  }
  
  _transitionEndVendorSniff() {
    if (this.$$.transitions === false) return;
    var el = document.createElement('div');
    var transitions = {
      'transition':'transitionend',
      'OTransition':'otransitionend',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };
    for (var i in transitions) {
      if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
        return transitions[i];
      }
    }
  }
  
  /**
   * @param {String} selector
   * @param {Node} parent
   */
  _getNode(selector, parent) {
    var targetNode = parent || document;
    var node = targetNode.querySelector(selector);
    if (!node) {
      this.error = true;
      return console.error(selector + ' not found in document.');
    }
    return node;
  }
  
  _setupDomNodes() {
    var $ = {};
    $.modal = this._getNode(this.$$.modal);
    $.page = this._getNode(this.$$.page);
    $.modalInner = this._getNode(this.$$.modalInner, this.modal);
    $.modalContent = this._getNode(this.$$.modalContent, this.modal);
    return $;
  }
  
  _addLoadedCssClass() {
    this._addClass(this.$.page, this.$$.loadClass);
  }
  
  /**
   * @param {Node} el
   * @param {String} className
   */
  _addClass(el, className) {
    if (! el instanceof HTMLElement) return;
    var cssClasses = el.className.split(' ');
    if (cssClasses.indexOf(className) === -1) {
      cssClasses.push(className);
    }
    el.className = cssClasses.join(' ');
  }
  
  /**
   * @param {Node} el
   * @param {String} className
   */
  _removeClass(el, className) {
    if (! el instanceof HTMLElement) return;
    var cssClasses = el.className.split(' ');
    if (cssClasses.indexOf(className) > -1) {
      cssClasses.splice(cssClasses.indexOf(className), 1);
    }
    el.className = cssClasses.join(' ');
  }
  
  _setOpenId() {
    var id = this.current.id || 'anonymous';
    this.$.page.setAttribute('data-current-modal', id);
  }
  
  _removeOpenId() {
    this.$.page.removeAttribute('data-current-modal');
  }
  
  /**
   * @param {mixed} e
   */
  _getElementContext(e) {
    if (e && typeof e.hash === 'string') {
      return document.querySelector(e.hash);
    } else if (typeof e === 'string') {
      return document.querySelector(e);
    } else {
      return console.error('No selector supplied to open()');
    }
  }
  
  /**
   * @param {Event} e
   */
  _open(e) {
    this.current = this._getElementContext(e);
    if (this.current instanceof HTMLElement === false) return console.error('VanillaModal target must exist on page.');
    if (typeof this.$$.onBeforeOpen === 'function') this.$$.onBeforeOpen.call(this);
    this._captureNode();
    this._addClass(this.$.page, this.$$.class);
    this._setOpenId();
    this.isOpen = true;
    if (typeof this.$$.onOpen === 'function') this.$$.onOpen.call(this);
  }
  
  _detectTransition() {
    var css = window.getComputedStyle(this.$.modal, null);
    var transitionDuration = ['transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration'];
    var hasTransition = transitionDuration.filter(function(i) {
      if (typeof css[i] === 'string' && parseFloat(css[i]) > 0) {
        return true;
      }
    });
    return (hasTransition.length) ? true : false;
  }
    
  /**
   * @param {Event} e
   */
  _close(e) {
    if (typeof this.$$.onBeforeClose === 'function') this.$$.onBeforeClose.call(this);
    this._removeClass(this.$.page, this.$$.class);
    var transitions = this._detectTransition();
    if (this.$$.transitions && this.$$.transitionEnd && transitions) {
      this._closeModalWithTransition();
    } else {
      this._closeModal();
    }
  }
  
  _closeModal() {
    this._removeOpenId(this.$.page);
    this._releaseNode();
    this.isOpen = false;
    this.current = null;
    if (typeof this.$$.onClose === 'function') this.$$.onClose.call(this);
  }
  
  _closeModalWithTransition() {
    var _closeTransitionHandler = function() {
      this.$.modal.removeEventListener(this.$$.transitionEnd, _closeTransitionHandler);
      this._closeModal();
    }.bind(this);
    this.$.modal.addEventListener(this.$$.transitionEnd, _closeTransitionHandler);
  }
  
  _captureNode() {
    while (this.current.childNodes.length > 0) {
      this.$.modalContent.appendChild(this.current.childNodes[0]);
    }
  }
  
  _releaseNode() {
    while (this.$.modalContent.childNodes.length > 0) {
      this.current.appendChild(this.$.modalContent.childNodes[0]);
    }
  }
  
  /**
   * @param {Event} e
   */
  _closeKeyHandler(e) {
    if (typeof this.$$.closeKey !== 'number') return;
    if (e.which === this.$$.closeKey && this.isOpen === true) {
      e.preventDefault();
      this.close();
    }
  }
  
  /**
   * @param {Event} e
   */
  _outsideClickHandler(e) {
    if (this.$$.clickOutside !== true) return;
    var node = e.target;
    while(node != document.body) {
      if (node === this.$.modalInner) return;
      node = node.parentNode;
    }
    this.close();
  }
  
  /**
   * @param {Event} e
   * @param {String} selector
   */
  _matches(e, selector) {
    var el = e.target;
    var matches = (el.document || el.ownerDocument).querySelectorAll(selector);
    for (let i = 0; i < matches.length; i++) {
      let child = el;
      while (child !== document.body) {
        if (child === matches[i]) return child;
        child = child.parentNode;
      }
    }
    return null;
  }
  
  /**
   * @param {Event} e
   */
  _delegateOpen(e) {
    var matches = this._matches(e, this.$$.open);
    if (matches) {
      e.preventDefault();
      return this.open(matches);
    }
  }
  
  /**
   * @param {Event} e
   */
  _delegateClose(e) {
    if (this._matches(e, this.$$.close)) {
      e.preventDefault();
      return this.close();
    }
  }
  
  /**
   * @private {Function} add
   */
  _events() {
    
    let _closeKeyHandler = this._closeKeyHandler.bind(this);
    let _outsideClickHandler = this._outsideClickHandler.bind(this);
    let _delegateOpen = this._delegateOpen.bind(this);
    let _delegateClose = this._delegateClose.bind(this);
    
    var add = function() {
      this.$.modal.addEventListener('click', _outsideClickHandler);
      document.addEventListener('keydown', _closeKeyHandler);
      document.addEventListener('click', _delegateOpen);
      document.addEventListener('click', _delegateClose);
    };
  
    this.destroy = function() {
      this.close();
      this.$.modal.removeEventListener('click', _outsideClickHandler);
      document.removeEventListener('keydown', _closeKeyHandler);
      document.removeEventListener('click', _delegateOpen);
      document.removeEventListener('click', _delegateClose);
    };
    
    return {
      add : add.bind(this)
    };
    
  }
   
}

(function() {
  if (typeof define === 'function' && define.amd) {
    define('VanillaModal', function () {
      return VanillaModal;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = VanillaModal;
  } else {
    window.VanillaModal = VanillaModal;
  }
})();