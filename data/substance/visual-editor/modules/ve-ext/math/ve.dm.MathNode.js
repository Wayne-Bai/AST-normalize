/**
 * DataModel math node.
 *
 * @class
 * @abstract
 * @extends ve.dm.LeafNode
 * @mixins ve.dm.GeneratedContentNode
 *
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MathNode = function VeDmMathNode( element ) {
  // Parent constructor
  ve.dm.LeafNode.call( this, element );

  // Mixin constructors
  ve.dm.GeneratedContentNode.call( this );
};

/* Inheritance */

OO.inheritClass( ve.dm.MathNode, ve.dm.LeafNode );

OO.mixinClass( ve.dm.MathNode, ve.dm.GeneratedContentNode );


/**
 * A getter to retrieve the stored formula conveniently.
 *
 */
ve.dm.MathNode.prototype.getFormula = function () {
  return this.getAttribute('formula');
};

ve.dm.MathNode.prototype.getFormat = function () {
  return this.getAttribute('format');
};

/* Static members */

ve.dm.MathNode.static.name = 'math';

ve.dm.MathNode.static.storeHtmlAttributes = false;

ve.dm.MathNode.static.enableAboutGrouping = true;

ve.dm.MathNode.static.defaultAttributes = {
  'formula': '',
  'format': 'tex'
};

// Change this if you want to have a rendered MML output when saving
ve.dm.MathNode.static.storeMML = false;

ve.dm.MathNode.static.toDataElement = function ( domElements, converter ) {
  var isInline, type, $node, $formulaEl,
    formula = '',
    format = 'tex';

  isInline = this.isHybridInline( domElements, converter );
  type = isInline ? 'mathInline' : 'mathBlock';

  $node = $( domElements[0]);
  $formulaEl = $node.find('span[property=source]');

  if ($formulaEl.length > 0) {
    formula = $formulaEl[0].textContent;
    format = $formulaEl[0].getAttribute('data-format') || 'tex';
  }

  return {
    'type': type,
    'attributes': {
      'formula': formula,
      'format': format
    }
  };
};

ve.dm.MathNode.static.renderMathML = function(formula, outputEl, callback) {
  function getMML(jax, callback) {
    try {
      var mml = jax.root.toMathML("");
      window.MathJax.Callback(callback)(mml);
    } catch(err) {
      if (!err.restart) {
        throw err;
      }
      return window.MathJax.Callback.After([jax.root.toMathML, jax, callback], err.restart);
    }
  }
  outputEl.innerHTML = "\\(" + formula + "\\)";
  window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, outputEl],
    function() {
      var jax = window.MathJax.Hub.getAllJax(outputEl)[0];
      getMML(jax, function(mml) {
        outputEl.innerHTML = mml;
      });
    }
  );
};

ve.dm.MathNode.static.toDomElements = function ( dataElement, doc ) {
  var el, sourceEl, format, formula;

  if (dataElement.type === "mathInline") {
    el = doc.createElement('span');
  } else {
    el = doc.createElement('div');
  }
  el.setAttribute('typeof', 'math');

  formula = dataElement.attributes.formula;
  format = dataElement.attributes.format;

  sourceEl = doc.createElement('span');
  sourceEl.setAttribute('property', 'source');
  sourceEl.setAttribute('data-format', format);
  sourceEl.innerHTML = formula;

  el.appendChild(sourceEl);

  // TODO: append rendered mml, html, and svg output according to

  if (ve.dm.MathNode.static.storeMML) {
    var mmlEl = doc.createElement('span');
    mmlEl.setAttribute('property', 'output');
    mmlEl.setAttribute('data-format', 'mml');
    ve.dm.MathNode.static.renderMathML(formula, mmlEl, function() {
      // HACK: we hope that the asynchronous call is finished before the conversion ends.
    });
    el.appendChild(mmlEl);
  }

  return [ el ];
};

/* Concrete subclasses */

/**
 * DataModel mathBlock node.
 *
 * @class
 * @extends ve.dm.MathNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MathBlockNode = function VeDmMathBlockNode( length, element ) {
  // Parent constructor
  ve.dm.MathNode.call( this, length, element );
};

OO.inheritClass( ve.dm.MathBlockNode, ve.dm.MathNode );

ve.dm.MathBlockNode.static.name = 'mathBlock';

ve.dm.MathBlockNode.static.matchTagNames = ['div'];
ve.dm.MathBlockNode.static.matchRdfaTypes = ['math'];

/**
 * DataModel mathInline node.
 *
 * @class
 * @extends ve.dm.MathNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MathInlineNode = function VeDmMathInlineNode( length, element ) {
  // Parent constructor
  ve.dm.MathNode.call( this, length, element );
};

OO.inheritClass( ve.dm.MathInlineNode, ve.dm.MathNode );

ve.dm.MathInlineNode.static.name = 'mathInline';

ve.dm.MathInlineNode.static.matchTagNames = ['span'];
ve.dm.MathInlineNode.static.matchRdfaTypes = ['math'];

ve.dm.MathInlineNode.static.isContent = true;

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MathNode );
ve.dm.modelRegistry.register( ve.dm.MathBlockNode );
ve.dm.modelRegistry.register( ve.dm.MathInlineNode );
