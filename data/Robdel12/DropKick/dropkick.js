/*
 * DropKick 2.1.3
 *
 * Highly customizable <select> lists
 * https://github.com/robdel12/DropKick
 *
*/

// Enable indexOf, forEach, and EventListener methods for IE
(function(){if(Array.prototype.indexOf||(Array.prototype.indexOf=function(a,b){var c,d,e=b?b:0;if(!this)throw new TypeError;if(d=this.length,0===d||e>=d)return-1;for(0>e&&(e=d-Math.abs(e)),c=e;d>c;c++)if(this[c]===a)return c;return-1}),Array.prototype.forEach||(Array.prototype.forEach=function(a){if(void 0===this||null===this)throw new TypeError;var b=Object(this),c=b.length>>>0;if("function"!=typeof a)throw new TypeError;for(var d=arguments.length>=2?arguments[1]:void 0,e=0;c>e;e++)e in b&&a.call(d,b[e],e,b)}),Event.prototype.preventDefault||(Event.prototype.preventDefault=function(){this.returnValue=!1}),Event.prototype.stopPropagation||(Event.prototype.stopPropagation=function(){this.cancelBubble=!0}),!Element.prototype.addEventListener){var a=[],b=function(b,c){var d=this,e=function(a){a.target=a.srcElement,a.currentTarget=d,c.handleEvent?c.handleEvent(a):c.call(d,a)};if("DOMContentLoaded"==b){var f=function(a){"complete"==document.readyState&&e(a)};if(document.attachEvent("onreadystatechange",f),a.push({object:this,type:b,listener:c,wrapper:f}),"complete"==document.readyState){var g=new Event;g.srcElement=window,f(g)}}else this.attachEvent("on"+b,e),a.push({object:this,type:b,listener:c,wrapper:e})},c=function(b,c){for(var d=0;d<a.length;){var e=a[d];if(e.object==this&&e.type==b&&e.listener==c){"DOMContentLoaded"==b?this.detachEvent("onreadystatechange",e.wrapper):this.detachEvent("on"+b,e.wrapper);break}++d}};Element.prototype.addEventListener=b,Element.prototype.removeEventListener=c,HTMLDocument&&(HTMLDocument.prototype.addEventListener=b,HTMLDocument.prototype.removeEventListener=c),Window&&(Window.prototype.addEventListener=b,Window.prototype.removeEventListener=c)} function CustomEvent(e,t){t=t||{bubbles:false,cancelable:false,detail:undefined};var n=document.createEvent("CustomEvent");n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail);return n}CustomEvent.prototype=window.Event.prototype;window.CustomEvent=CustomEvent;})();

(function( window, document, undefined ) {


var

  // Browser testing stuff
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ),
  isIframe = (window.parent != window.self && location.host === parent.location.host),
  isIE = navigator.appVersion.indexOf("MSIE")!=-1,

  // The Dropkick Object
  Dropkick = function( sel, opts ) {
    var i, dk;

    // Safety if `Dropkick` is called without `new`
    if ( this === window ) {
      return new Dropkick( sel, opts );
    }

    if ( typeof sel === "string" && sel[0] === "#" ) {
      sel = document.getElementById( sel.substr( 1 ) );
    }

    // Check if select has already been DK'd and return the DK Object
    for ( i = 0; i < Dropkick.uid; i++) {
      dk = Dropkick.cache[ i ];

      if ( dk instanceof Dropkick && dk.data.select === sel ) {
        _.extend( dk.data.settings, opts );
        return dk;
      }
    }

    if ( !sel ) {
      console.error("You must pass a select to DropKick");
      return false;
    }

    if ( sel.nodeName === "SELECT" ) {
      return this.init( sel, opts );
    }
  },

  noop = function() {},
  _docListener,

  // DK default options
  defaults = {

    // Called once after the DK element is inserted into the DOM
    initialize: noop,

    // Called every time the select changes value
    change: noop,

    // Called every time the DK element is opened
    open: noop,

    // Called every time the DK element is closed
    close: noop,

    // Search method; "strict", "partial", or "fuzzy"
    search: "strict"
  },

  // Common Utilities
  _ = {

    hasClass: function( elem, classname ) {
      var reg = new RegExp( "(^|\\s+)" + classname + "(\\s+|$)" );
      return elem && reg.test( elem.className );
    },

    addClass: function( elem, classname ) {
      if( elem && !_.hasClass( elem, classname ) ) {
        elem.className += " " + classname;
      }
    },

    removeClass: function( elem, classname ) {
      var reg = new RegExp( "(^|\\s+)" + classname + "(\\s+|$)" );
      elem && ( elem.className = elem.className.replace( reg, " " ) );
    },

    toggleClass: function( elem, classname ) {
      var fn = _.hasClass( elem, classname ) ? "remove" : "add";
      _[ fn + "Class" ]( elem, classname );
    },

    // Shallow object extend
    extend: function( obj ) {
      Array.prototype.slice.call( arguments, 1 ).forEach( function( source ) {
        if ( source ) for ( var prop in source ) obj[ prop ] = source[ prop ];
      });

      return obj;
    },

    // Returns the top and left offset of an element
    offset: function( elem ) {
      var box = elem.getBoundingClientRect() || { top: 0, left: 0 },
        docElem = document.documentElement,
        offsetTop = isIE ? docElem.scrollTop : window.pageYOffset,
        offsetLeft = isIE ? docElem.scrollLeft : window.pageXOffset;

        return {
          top: box.top + offsetTop - docElem.clientTop,
          left: box.left + offsetLeft - docElem.clientLeft
        };
    },

    // Returns the top and left position of an element relative to an ancestor
    position: function( elem, relative ) {
      var pos = { top: 0, left: 0 };

      while ( elem !== relative ) {
        pos.top += elem.offsetTop;
        pos.left += elem.offsetLeft;
        elem = elem.parentNode;
      }

      return pos;
    },

    // Returns the closest ancestor element of the child or false if not found
    closest: function( child, ancestor ) {
      while ( child ) {
        if ( child === ancestor ) return child;
        child = child.parentNode;
      }
      return false;
    },

    // Creates a DOM node with the specified attributes
    create: function( name, attrs ) {
      var a, node = document.createElement( name );

      if ( !attrs ) attrs = {};

      for ( a in attrs ) {
        if ( attrs.hasOwnProperty( a ) ) {
          if ( a == "innerHTML" ) {
            node.innerHTML = attrs[ a ];
          } else {
            node.setAttribute( a, attrs[ a ] );
          }
        }
      }

      return node;
    },

    deferred: function( fn ) {
      return function() {
        var args = arguments,
          ctx = this;

        window.setTimeout(function() {
          fn.apply(ctx, args);
        }, 1);
      };
    }

  };


// Cache of DK Objects
Dropkick.cache = {}
Dropkick.uid = 0;


// Extends the DK objects's Prototype
Dropkick.prototype = {

  // Emulate some of HTMLSelectElement's methods

  /**
   * Adds an element to the select
   * @param {Node}         elem   HTMLOptionElement
   * @param {Node/Integer} before HTMLOptionElement/Index of Element
   */
  add: function( elem, before ) {
    var text, option, i;

    if ( typeof elem === "string" ) {
      text = elem;
      elem = document.createElement("option");
      elem.text = text;
    }

    if ( elem.nodeName === "OPTION" ) {
      option = _.create( "li", {
        "class": "dk-option",
        "data-value": elem.value,
        "innerHTML": elem.text,
        "role": "option",
        "aria-selected": "false",
        "id": "dk" + this.data.cacheID + "-" + ( elem.id || elem.value.replace( " ", "-" ) )
      });

      _.addClass( option, elem.className );
      this.length += 1;

      if ( elem.disabled ) {
        _.addClass( option, "dk-option-disabled" );
        option.setAttribute( "aria-disabled", "true" );
      }

      this.data.select.add( elem, before );

      if ( typeof before === "number" ) {
        before = this.item( before );
      }

      if ( this.options.indexOf( before ) > -1 ) {
        before.parentNode.insertBefore( option, before );
      } else {
        this.data.elem.lastChild.appendChild( option );
      }

      option.addEventListener( "mouseover", this );

      i = this.options.indexOf( before );
      this.options.splice( i, 0, option );

      if ( elem.selected ) {
        this.select( i );
      }
    }
  },

  /**
   * Selects an option in the lists at the desired index
   * (negative numbers select from the end)
   * @param  {Integer} index Index of element (positive or negative)
   * @return {Node}          The DK option from the list, or null if not found
   */
  item: function( index ) {
    index = index < 0 ? this.options.length + index : index;
    return this.options[ index ] || null;
  },

  /**
   * Removes an element at the given index
   * @param  {Integer} index Index of element (positive or negative)
   */
  remove: function( index ) {
    var dkOption = this.item( index );
    dkOption.parentNode.removeChild( dkOption );
    this.options.splice( index, 1 );
    this.data.select.remove( index );
    this.select( this.data.select.selectedIndex );
    this.length -= 1;
  },

  /**
   * Initializes the DK Object
   * @param  {Node}   sel  [description]
   * @param  {Object} opts Options to override defaults
   * @return {Object}      The DK Object
   */
  init: function( sel, opts ) {
    var i,
      dk =  Dropkick.build( sel, "dk" + Dropkick.uid );

    // Set some data on the DK Object
    this.data = {};
    this.data.select = sel;
    this.data.elem = dk.elem;
    this.data.settings = _.extend({}, defaults, opts );

    // Emulate some of HTMLSelectElement's properties
    this.disabled = sel.disabled;
    this.form = sel.form;
    this.length = sel.length;
    this.multiple = sel.multiple;
    this.options = dk.options.slice( 0 );
    this.selectedIndex = sel.selectedIndex;
    this.selectedOptions = dk.selected.slice( 0 );
    this.value = sel.value;

    // Add the DK Object to the cache
    this.data.cacheID = Dropkick.uid;
    Dropkick.cache[ this.data.cacheID ] = this;

    // Call the optional initialize function
    this.data.settings.initialize.call( this );

    // Increment the index
    Dropkick.uid += 1;

    // Add the change listener to the select
    if ( !this._changeListener ) {
      sel.addEventListener( "change", this );
      this._changeListener = true;
    }

    // Don't continue if we're not rendering on mobile
    if ( !( isMobile && !this.data.settings.mobile ) ) {

      // Insert the DK element before the original select
      sel.parentNode.insertBefore( this.data.elem, sel );
      sel.setAttribute( "data-dkCacheId", this.data.cacheID );

      // Bind events
      this.data.elem.addEventListener( "click", this );
      this.data.elem.addEventListener( "keydown", this );
      this.data.elem.addEventListener( "keypress", this );

      if ( this.form ) {
        this.form.addEventListener( "reset", this );
      }

      if ( !this.multiple ) {
        for ( i = 0; i < this.options.length; i++ ) {
          this.options[ i ].addEventListener( "mouseover", this );
        }
      }

      if ( !_docListener ) {
        document.addEventListener( "click", Dropkick.onDocClick );

        if ( isIframe ){
          parent.document.addEventListener( "click", Dropkick.onDocClick );
        }

        _docListener = true;
      }
    }

    return this;
  },

  /**
   * Closes the DK dropdown
   */
  close: function() {
    var i,
      dk = this.data.elem;

    if ( !this.isOpen || this.multiple ) {
      return false;
    }

    for ( i = 0; i < this.options.length; i++ ) {
      _.removeClass( this.options[ i ], "dk-option-highlight" );
    }

    dk.lastChild.setAttribute( "aria-expanded", "false" );
    _.removeClass( dk.lastChild, "dk-select-options-highlight" );
    _.removeClass( dk, "dk-select-open-(up|down)" );
    this.isOpen = false;

    this.data.settings.close.call( this );
  },

  /**
   * Opens the DK dropdown
   */
  open: _.deferred(function() {
    var dropHeight, above, below, direction, dkTop, dkBottom,
      dk = this.data.elem,
      dkOptsList = dk.lastChild;

    if ( isIE ) {
      dkTop = _.offset( dk ).top - document.documentElement.scrollTop;
    } else {
      dkTop = _.offset( dk ).top - window.scrollY;
    }

    dkBottom = window.innerHeight - ( dkTop + dk.offsetHeight );

    if ( this.isOpen || this.multiple ) return false;

    dkOptsList.style.display = "block";
    dropHeight = dkOptsList.offsetHeight;
    dkOptsList.style.display = "";

    above = dkTop > dropHeight;
    below = dkBottom > dropHeight;
    direction = above && !below ? "-up" : "-down";

    this.isOpen = true;
    _.addClass( dk, "dk-select-open" + direction );
    dkOptsList.setAttribute( "aria-expanded", "true" );
    this._scrollTo( this.options.length - 1 );
    this._scrollTo( this.selectedIndex );

    this.data.settings.open.call( this );
  }),

  /**
   * Disables or enables an option or the entire Dropkick
   * @param  {Node/Integer} elem     The element or index to disable
   * @param  {Boolean}      disabled Value of disabled
   */
  disable: function( elem, disabled ) {
    var disabledClass = "dk-option-disabled";

    if ( arguments.length === 0 || typeof elem === "boolean" ) {
      disabled = elem === undefined ? true : false;
      elem = this.data.elem;
      disabledClass = "dk-select-disabled";
      this.disabled = disabled;
    }

    if ( disabled === undefined ) {
      disabled = true;
    }

    if ( typeof elem === "number" ) {
      elem = this.item( elem );
    }

    _[ disabled ? "addClass" : "removeClass" ]( elem, disabledClass );
  },

  /**
   * Selects an option from the list
   * @param  {Node/Integer/String} elem     The element, index, or value to select
   * @param  {Boolean}             disabled Selects disabled options
   * @return {Node}                         The selected element
   */
  select: function( elem, disabled ) {
    var i, index, option, combobox,
      select = this.data.select;

    if ( typeof elem === "number" ) {
      elem = this.item( elem );
    }

    if ( typeof elem === "string" ) {
      for ( i = 0; i < this.length; i++ ) {
        if ( this.options[ i ].getAttribute( "data-value" ) == elem ) {
          elem = this.options[ i ];
        }
      }
    }

    // No element or enabled option
    if ( !elem || typeof elem === "string" ||
         ( !disabled && _.hasClass( elem, "dk-option-disabled" ) ) ) {
      return false;
    }

    if ( _.hasClass( elem, "dk-option" ) ) {
      index = this.options.indexOf( elem );
      option = select.options[ index ];

      if ( this.multiple ) {
        _.toggleClass( elem, "dk-option-selected" );
        option.selected = !option.selected;

        if ( _.hasClass( elem, "dk-option-selected" ) ) {
          elem.setAttribute( "aria-selected", "true" );
          this.selectedOptions.push( elem );
        } else {
          elem.setAttribute( "aria-selected", "false" );
          index = this.selectedOptions.indexOf( elem );
          this.selectedOptions.splice( index, 1 );
        }
      } else {
        combobox = this.data.elem.firstChild;

        if ( this.selectedOptions.length ) {
          _.removeClass( this.selectedOptions[0], "dk-option-selected" );
          this.selectedOptions[0].setAttribute( "aria-selected", "false" );
        }

        _.addClass( elem, "dk-option-selected" );
        elem.setAttribute( "aria-selected", "true" );

        combobox.setAttribute( "aria-activedescendant", elem.id );
        combobox.className = "dk-selected " + option.className;
        combobox.innerHTML = option.text;

        this.selectedOptions[0] = elem;
        option.selected = true;
      }

      this.selectedIndex = select.selectedIndex;
      this.value = select.value;

      if ( !disabled ) {
        this.data.select.dispatchEvent( new CustomEvent( "change" ) );
      }

      return elem;
    }
  },

  /**
   * Selects a single option from the list
   * @param  {Node/Integer} elem     The element or index to select
   * @param  {Boolean}      disabled Selects disabled options
   * @return {Node}                  The selected element
   */
  selectOne: function( elem, disabled ) {
    this.reset( true );
    this._scrollTo( elem );
    return this.select( elem, disabled );
  },

  /**
   * Finds all options who's text matches a pattern (strict, partial, or fuzzy)
   * @param  {String} string  The string to search for
   * @param  {Integer} mode   How to search; "strict", "partial", or "fuzzy"
   * @return {Array/Boolean}  An Array of matched elements
   */
  search: function( pattern, mode ) {
    var i, tokens, str, tIndex, sIndex, cScore, tScore, reg,
      options = this.data.select.options,
      matches = [];

    if ( !pattern ) return this.options;

    // Fix Mode
    mode = mode ? mode.toLowerCase() : "strict";
    mode = mode == "fuzzy" ? 2 : mode == "partial" ? 1 : 0;

    reg = new RegExp( ( mode ? "" : "^" ) + pattern, "i" );

    for ( i = 0; i < options.length; i++ ) {
      str = options[ i ].text.toLowerCase();

      // Fuzzy
      if ( mode == 2 ) {
        tokens = pattern.toLowerCase().split("");
        tIndex = sIndex = cScore = tScore = 0;

        while ( sIndex < str.length ) {
          if ( str[ sIndex ] === tokens[ tIndex ] ) {
            cScore += 1 + cScore;
            tIndex++;
          } else {
            cScore = 0;
          }

          tScore += cScore;
          sIndex++;
        }

        if ( tIndex == tokens.length ) {
          matches.push({ e: this.options[ i ], s: tScore, i: i });
        }

      // Partial or Strict (Default)
      } else {
        reg.test( str ) && matches.push( this.options[ i ] );
      }
    }

    // Sort fuzzy results
    if ( mode == 2 ) {
      matches = matches.sort( function ( a, b ) {
        return ( b.s - a.s ) || a.i - b.i;
      }).reduce( function ( p, o ) {
        p[ p.length ] = o.e;
        return p;
      }, [] );
    }

    return matches;
  },

  /**
   * Brings focus to the proper DK element
   */
  focus: function() {
    if ( !this.disabled ) {
      ( this.multiple ? this.data.elem : this.data.elem.children[0] ).focus();
    }
  },

  /**
   * Resets the DK and select element
   * @param  {Boolean} clear Defaults to first option if True
   */
  reset: function( clear ) {
    var i,
      select = this.data.select;

    this.selectedOptions.length = 0;

    for ( i = 0; i < select.options.length; i++ ) {
      select.options[ i ].selected = false;
      _.removeClass( this.options[ i ], "dk-option-selected" );
      this.options[ i ].setAttribute( "aria-selected", "false" );
      if ( !clear && select.options[ i ].defaultSelected ) {
        this.select( i, true );
      }
    }

    if ( !this.selectedOptions.length && !this.multiple ) {
      this.select( 0, true );
    }
  },

  /**
   * Rebuilds the DK Object
   * (use if HTMLSelectElement has changed)
   */
  refresh: function() {
    this.dispose().init( this.data.select, this.data.settings );
  },

  /**
   * Removes the DK Object from the cache and the element from the DOM
   */
  dispose: function() {
    delete Dropkick.cache[ this.data.cacheID ];
    this.data.elem.parentNode.removeChild( this.data.elem );
    this.data.select.removeAttribute( "data-dkCacheId" );
    return this;
  },

  // Private Methods

  handleEvent: function( event ) {
    if ( this.disabled ) return;

    switch ( event.type ) {
    case "click":
      this._delegate( event );
      break;
    case "keydown":
      this._keyHandler( event );
      break;
    case "keypress":
      this._searchOptions( event );
      break;
    case "mouseover":
      this._highlight( event );
      break;
    case "reset":
      this.reset();
      break;
    case "change":
      this.data.settings.change.call( this );
      break;
    }
  },

  _delegate: function( event ) {
    var selection, index, firstIndex, lastIndex,
      target = event.target;

    if ( _.hasClass( target, "dk-option-disabled" ) ) {
      return false;
    }

    if ( !this.multiple ) {
      this[ this.isOpen ? "close" : "open" ]();
      if ( _.hasClass( target, "dk-option" ) ) this.select( target );
    } else {
      if ( _.hasClass( target, "dk-option" ) ) {
        selection = window.getSelection();
        if ( selection.type == "Range" ) selection.collapseToStart();

        if ( event.shiftKey ) {
          firstIndex = this.options.indexOf( this.selectedOptions[0] );
          lastIndex = this.options.indexOf( this.selectedOptions[ this.selectedOptions.length - 1 ] );
          index =  this.options.indexOf( target );

          if ( index > firstIndex && index < lastIndex ) index = firstIndex;
          if ( index > lastIndex && lastIndex > firstIndex ) lastIndex = firstIndex;

          this.reset( true );

          if ( lastIndex > index ) {
            while ( index < lastIndex + 1 ) this.select( index++ );
          } else {
            while ( index > lastIndex - 1 ) this.select( index-- );
          }
        } else if ( event.ctrlKey || event.metaKey ) {
          this.select( target );
        } else {
          this.reset( true );
          this.select( target );
        }
      }
    }
  },

  _highlight: function( event ) {
    var i, option = event.target;

    if ( !this.multiple ) {
      for ( i = 0; i < this.options.length; i++ ) {
        _.removeClass( this.options[ i ], "dk-option-highlight" );
      }

      _.addClass( this.data.elem.lastChild, "dk-select-options-highlight" );
      _.addClass( option, "dk-option-highlight" );
    }
  },

  _keyHandler: function( event ) {
    var lastSelected, j,
      selected = this.selectedOptions,
      options = this.options,
      i = 1,
      keys = {
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        up: 38,
        down: 40
      };

    switch ( event.keyCode ) {
    case keys.up:
      i = -1;
      // deliberate fallthrough
    case keys.down:
      event.preventDefault();
      lastSelected = selected[ selected.length - 1 ];

      if ( _.hasClass( this.data.elem.lastChild, "dk-select-options-highlight" ) ) {
        _.removeClass( this.data.elem.lastChild, "dk-select-options-highlight" );
        for ( j = 0; j < options.length; j++ ) {
          if ( _.hasClass( options[ j ], "dk-option-highlight" ) ) {
            _.removeClass( options[ j ], "dk-option-highlight" );
            lastSelected = options[ j ];
          }
        }
      }

      i = options.indexOf( lastSelected ) + i;

      if ( i > options.length - 1 ) {
        i = options.length - 1;
      } else if ( i < 0 ) {
        i = 0;
      }

      if ( !this.data.select.options[ i ].disabled ) {
        this.reset( true );
        this.select( i );
        this._scrollTo( i );
      }
      break;
    case keys.space:
      if ( !this.isOpen ) {
        event.preventDefault();
        this.open();
        break;
      }
      // deliberate fallthrough
    case keys.tab:
    case keys.enter:
      for ( i = 0; i < options.length; i++ ) {
        if ( _.hasClass( options[ i ], "dk-option-highlight" ) ) {
          this.select( i );
        }
      }
      // deliberate fallthrough
    case keys.esc:
      if ( this.isOpen ) {
        event.preventDefault();
        this.close();
      }
      break;
    }
  },

  _searchOptions: function( event ) {
    var results,
      self = this,
      keyChar = String.fromCharCode( event.keyCode || event.which ),

      waitToReset = function() {
        if ( self.data.searchTimeout ) {
          clearTimeout( self.data.searchTimeout );
        }

        self.data.searchTimeout = setTimeout(function() {
          self.data.searchString = "";
        }, 1000 );
      };

    if ( this.data.searchString === undefined ) {
      this.data.searchString = "";
    }

    waitToReset();

    this.data.searchString += keyChar;
    results = this.search( this.data.searchString, this.data.settings.search );

    if ( results.length ) {
      if ( !_.hasClass( results[0], "dk-option-disabled" ) ) {
        this.selectOne( results[0] );
      }
    }
  },

  _scrollTo: function( option ) {
    var optPos, optTop, optBottom,
      dkOpts = this.data.elem.lastChild;

    if ( option === -1 || ( typeof option !== "number" && !option ) ||
        ( !this.isOpen && !this.multiple ) ) {
      return false;
    }

    if ( typeof option === "number" ) {
      option = this.item( option );
    }

    optPos = _.position( option, dkOpts ).top;
    optTop = optPos - dkOpts.scrollTop;
    optBottom = optTop + option.offsetHeight;

    if ( optBottom > dkOpts.offsetHeight ) {
      optPos += option.offsetHeight;
      dkOpts.scrollTop = optPos - dkOpts.offsetHeight;
    } else if ( optTop < 0 ) {
      dkOpts.scrollTop = optPos;
    }
  }
};

// Static Methods

/**
 * Builds the Dropkick element from a select element
 * @param  {Node} sel The HTMLSelectElement
 * @return {Object}   An object containing the new DK element and it's options
 */
Dropkick.build = function( sel, idpre ) {
  var selOpt, optList, i,
    options = [],

    ret = {
      elem: null,
      options: [],
      selected: []
    },

    addOption = function ( node ) {
      var option, optgroup, optgroupList, i,
        children = [];

      switch ( node.nodeName ) {
      case "OPTION":
        option = _.create( "li", {
          "class": "dk-option ",
          "data-value": node.value,
          "innerHTML": node.text,
          "role": "option",
          "aria-selected": "false",
          "id": idpre + "-" + ( node.id || node.value.replace( " ", "-" ) )
        });

        _.addClass( option, node.className );

        if ( node.disabled ) {
          _.addClass( option, "dk-option-disabled" );
          option.setAttribute( "aria-disabled", "true" );
        }

        if ( node.selected ) {
          _.addClass( option, "dk-option-selected" );
          option.setAttribute( "aria-selected", "true" );
          ret.selected.push( option );
        }

        ret.options.push( this.appendChild( option ) );
        break;
      case "OPTGROUP":
        optgroup = _.create( "li", { "class": "dk-optgroup" });

        if ( node.label ) {
          optgroup.appendChild( _.create( "div", {
            "class": "dk-optgroup-label",
            "innerHTML": node.label
          }));
        }

        optgroupList = _.create( "ul", {
          "class": "dk-optgroup-options"
        });

        for ( i = node.children.length; i--; children.unshift( node.children[ i ] ) );
        children.forEach( addOption, optgroupList );

        this.appendChild( optgroup ).appendChild( optgroupList );
        break;
      }
    };

  ret.elem = _.create( "div", {
    "class": "dk-select" + ( sel.multiple ? "-multi" : "" )
  });

  optList = _.create( "ul", {
    "class": "dk-select-options",
    "id": idpre + "-listbox",
    "role": "listbox"
  });

  sel.disabled && _.addClass( ret.elem, "dk-select-disabled" );
  ret.elem.id = idpre + ( sel.id ? "-" + sel.id : "" );
  _.addClass( ret.elem, sel.className );

  if ( !sel.multiple ) {
    selOpt = sel.options[ sel.selectedIndex ];
    ret.elem.appendChild( _.create( "div", {
      "class": "dk-selected " + selOpt.className,
      "tabindex": sel.tabindex || 0,
      "innerHTML": selOpt ? selOpt.text : '&nbsp;',
      "id": idpre + "-combobox",
      "aria-live": "assertive",
      "aria-owns": optList.id,
      "role": "combobox"
    }));
    optList.setAttribute( "aria-expanded", "false" );
  } else {
    ret.elem.setAttribute( "tabindex", sel.getAttribute( "tabindex" ) || "0" );
    optList.setAttribute( "aria-multiselectable", "true" );
  }

  for ( i = sel.children.length; i--; options.unshift( sel.children[ i ] ) );
  options.forEach( addOption, ret.elem.appendChild( optList ) );

  return ret;
};

/**
 * Focus DK Element when corresponding label is clicked; close all other DK's
 */
Dropkick.onDocClick = function( event ) {
  var t, tId, i;

  if (event.target.nodeType !== 1) {
    isClicked = false;

    return false;
  }

  if ( ( tId = event.target.getAttribute( "data-dkcacheid" ) ) !== null ) {
    Dropkick.cache[ tId ].focus();
  }

  for ( i in Dropkick.cache ) {
    if ( !_.closest( event.target, Dropkick.cache[ i ].data.elem ) && i !== tId ) {
      Dropkick.cache[ i ].disabled || Dropkick.cache[ i ].close();
    }
  }
};


// Expose Dropkick Globally
window.Dropkick = Dropkick;

// Add jQuery method
if ( window.jQuery !== undefined ) {
  window.jQuery.fn.dropkick = function () {
    var args = Array.prototype.slice.call( arguments );
    return window.jQuery( this ).each(function() {
      if ( !args[0] || typeof args[0] === 'object' ) {
        new Dropkick( this, args[0] || {} );
      } else if ( typeof args[0] === 'string' ) {
        Dropkick.prototype[ args[0] ].apply( new Dropkick( this ), args.slice( 1 ) );
      }
    });
  };
}

})( window, document );
