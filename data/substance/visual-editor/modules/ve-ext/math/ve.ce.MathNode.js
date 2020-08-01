/**
 * ContentEditable math node.
 *
 * @class
 * @abstract
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.FocusableNode
 * @mixins ve.ce.ClickableNode
 *
 * @constructor
 * @param {ve.dm.MathNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.MathNode = function VeCeMathNode( model, config ) {
  // Parent constructor
  ve.ce.LeafNode.call( this, model, config );

  // Mixin constructors
  ve.ce.FocusableNode.call( this );

  // DOM changes
  this.$element.addClass( 've-ce-mathNode' );

  this.$element.on( 'click', ve.bind( this.onClick, this ) );

  this.$container = null;
  this.$forTex = null;
  this.$forAscii = null;

  this.model.connect( this, { 'update': 'onUpdate' } );

  this.render();
};

/* Inheritance */

OO.inheritClass( ve.ce.MathNode, ve.ce.LeafNode );

OO.mixinClass( ve.ce.MathNode, ve.ce.FocusableNode );

/* Static Properties */

ve.ce.MathNode.static.name = 'math';

ve.ce.MathNode.static.primaryCommandName = 'math';

ve.ce.MathNode.isFocusable = true;

/* Methods */

ve.ce.MathNode.prototype.render = function () {
  var self = this;

  var $container = $('<span>')
    .addClass('mathjax-wrapper')
    .attr('contenteditable', 'false');

  this.$container = $container;
  this.$focusable = $container;

  this.$forTex = $('<span>')
    .addClass('math-container')
    .addClass('math-container-tex')
    .text('\\(\\)');

  this.$forAscii = $('<span>')
    .addClass('math-container')
    .addClass('math-container-asciimath')
    .text('``');

  $container.append([
    this.$forTex,
    this.$forAscii
  ]);

  this.$element.empty().append( $container );

  // We run MathJax on the stub math container for preparation.
  // After that we can use the 'Update' command.

  // ATTENTION: this has to be done delayed so that the element
  // has been injected into the DOM before MathJax is run.
  // MathJax looks up certain elements by id, thus requires them to be in the DOM.
  window.setTimeout(function() {
    window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, $container[0]],
      function() {
        self.onUpdate();
      }
    );
  }, 0);
};

/**
 * Positions highlights.
 *
 * The base implementation is not give adequate results so it is overridden here.
 */
ve.ce.MathNode.prototype.positionHighlights = function () {
  if ( !this.highlighted ) {
    return;
  }

  var top, left, bottom, right,
    outerRect,
    surfaceOffset = this.surface.getSurface().$element[0].getClientRects()[0];

  this.$highlights.empty();

  outerRect = this.$element[0].getClientRects()[0];
  top = outerRect.top - surfaceOffset.top;
  left = outerRect.left - surfaceOffset.left;
  bottom = outerRect.bottom - surfaceOffset.top;
  right = outerRect.right - surfaceOffset.left;

  this.$highlights.append(
    this.createHighlight().css( {
      'top': top,
      'left': left,
      'height': outerRect.height,
      'width': outerRect.width
    } )
  );
  this.boundingRect = {
    top: top,
    left: left,
    bottom: bottom,
    right: right
  };
};


/**
 * Rerenders the formula according to the current model.
 *
 * This is called on each model change.
 */
ve.ce.MathNode.prototype.onUpdate = function () {
  var self = this;
  var formula = this.model.getFormula();
  var format = this.model.getFormat();

  var $mathEl;
  if (format === 'asciimath') {
    $mathEl = this.$forAscii;
  } else {
    $mathEl = this.$forTex;
  }

  this.$container.removeClass('tex')
    .removeClass('asciimath')
    .addClass(format);

  // Update the formula of the specific element
  var math = window.MathJax.Hub.getAllJax($mathEl[0])[0];

  // HACK: in certain cases (particularly, after undo) there is no cached mathjax container.
  // We ignore this as it does not seem to be critical.
  if (math) {
    window.MathJax.Hub.Queue(
      ["Text", math, formula],
      function() {
        // Make sure that the bounding box is rendered properly
        self.redrawHighlights();
      }
    );
  }
};

ve.ce.MathNode.prototype.onClick = function ( e ) {
  var surfaceModel = this.getRoot().getSurface().getModel(),
    selectionRange = surfaceModel.getSelection(),
    nodeRange = this.model.getOuterRange();

    surfaceModel.getFragment(
      e.shiftKey ?
        ve.Range.newCoveringRange(
          [ selectionRange, nodeRange ], selectionRange.from > nodeRange.from
        ) :
        nodeRange
    ).select();
};

/* Concrete subclasses */

/**
 * ContentEditable math block node.
 *
 * @class
 * @extends ve.ce.MathNode
 * @constructor
 * @param {ve.dm.MathBlockNode} model Model to observe
 */
ve.ce.MathBlockNode = function VeCeMathBlockNode( model ) {
  // Parent constructor
  ve.ce.MathNode.call( this, model );

  // DOM changes
  this.$element.addClass( 've-ce-mathBlockNode' );
};

/* Inheritance */

OO.inheritClass( ve.ce.MathBlockNode, ve.ce.MathNode );

/* Static Properties */

ve.ce.MathBlockNode.static.name = 'mathBlock';
ve.ce.MathBlockNode.static.tagName = 'div';

/**
 * ContentEditable math inline node.
 *
 * @class
 * @extends ve.ce.MathNode
 * @constructor
 * @param {ve.dm.MathInlineNode} model Model to observe
 */
ve.ce.MathInlineNode = function VeCeMathInlineNode( model ) {
  // Parent constructor
  ve.ce.MathNode.call( this, model );

  // DOM changes
  this.$element.addClass( 've-ce-mathInlineNode' );
};

/* Inheritance */

OO.inheritClass( ve.ce.MathInlineNode, ve.ce.MathNode );

/* Static Properties */

ve.ce.MathInlineNode.static.name = 'mathInline';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MathNode );
ve.ce.nodeFactory.register( ve.ce.MathBlockNode );
ve.ce.nodeFactory.register( ve.ce.MathInlineNode );
