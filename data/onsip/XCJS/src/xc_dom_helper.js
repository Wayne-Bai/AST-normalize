/**
 * @namespace
 * Helper functions for XML DOM manipulation.
 *
 * <p>The IE DOM Core Level 2 is incomplete:</p>
 * <p>These functions were originally mixed into Node.prototype, however
 * IE doesn't implement the Node prototype, rather than bending over backwards
 * to make it look like it does I've accepted this instead...</p>
 * @see <a href="http://msdn.microsoft.com/en-us/library/dd282900%28VS.85%29.aspx#domproto">MSDN DOM prototypes</a>
 */
var XC_DOMHelper = {
  /**
   * An integer indicating which type of node this is.
   *
   * @see <a href="http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247">NodeType Specification</a>
   */
  NodeTypes: {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  },

  /**
   * Get the first child from a document fragment that is an Element.
   *
   * @param {Element|Node} el The document fragment to search.
   * @returns {Node|null} The node if it exists or null.
   */
  getFirstElementChild: function (el) {
    var nodeType = XC_DOMHelper.NodeTypes.ELEMENT_NODE;
    for (var i = 0, l = el.childNodes.length; i < l; i++) {
      if (el.childNodes[i].nodeType === nodeType) {
        return el.childNodes[i];
      }
    }
    return null;
  },

  /**
   * Retrieve all immediate children that have a XML namespace (xmlns) that
   * is matching the nsURI argument.
   *
   * @param {Element|Node} el The document fragment to search.
   * @param {String} nsURI The namespace URI to search for.
   * @returns {Element[]|Array} A list of elements or an empty array.
   */
  getElementsByNS: function (el, nsURI) {
    var ret = [];
    var nodeType = XC_DOMHelper.NodeTypes.ELEMENT_NODE;
    for (var i = 0, l = el.childNodes.length; i < l; i++) {
      if (el.childNodes[i].nodeType === nodeType &&
          el.childNodes[i].namespaceURI === nsURI) {
        ret.push(el.childNodes[i]);
      }
    }
    return ret;
  },

  /**
   * Get the text of an XML element.
   *
   * @param {Element|Node} el The document fragment to get the text of.
   * @returns {String} The inner text of the fragment.
   */
  getTextContent: function (el) {
    return el && (el.text || el.textContent);
  },

  /**
   * Set the text of an XML element.
   *
   * @param {Element|Node} el The document fragment to get the text of.
   * @param {String} text The inner text of the fragment.
   * @returns {void}
   */
  setTextContent: function (el, text) {
    if (el) {
      if ("textContent" in el) {
        el.textContent = text;
      } else {
        el.text = text;
      }
    }
  },

  /**
   * Serialize the Document / Element into a string.
   *
   * @param {Element|Node} node The document to serialize into a string.
   * @returns {String} The document fragment as a string.
   */
  serializeToString: function (node) {
    if ("XMLSerializer" in window) {
      return (new XMLSerializer()).serializeToString(node);
    } else {
      return node.xml;
    }
  },

  /**
   * Internet Explorer doesn't implement createElementNS.
   *
   * @param {String} ns The namespace of the elment to create.
   * @param {String} tagName The name of the tag to create.
   * @returns {Element} The namespaced element.
   */
  createElementNS: function (ns, tagName) {
    if ("createElementNS" in document) {
      return document.createElementNS(ns, tagName);
    } else {
      var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      return xmlDoc.createNode(1, tagName, ns);
    }
  }
};
