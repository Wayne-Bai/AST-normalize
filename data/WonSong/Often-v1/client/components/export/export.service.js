/**
 * =========================================================================
 * Update Log
 * =========================================================================
 * On 08/02/2014 by Won Song (http://wys.io)
 * - Created the initial file
 * =========================================================================
 */

angular.module('oftenApp').factory('Export', function Export($http) {

  /**
   * Extracts javascript, html and css code from the note content
   *
   * @method extractCode
   * @param content {String} content
   * @returns {{js: string, html: string, css: string}}
   */
  function extractCode(content) {

    var extractedCode = {
      js: '',
      html: '',
      css: ''
    };
    for (var i = 0; i < content.length; i++) {
      var $currentContent = angular.element(content[i]);
      if ($currentContent.hasClass('javascript') || $currentContent.hasClass('coffeescript') || $currentContent.hasClass('php')) {
        extractedCode['js'] += $currentContent.text();
      } else if ($currentContent.hasClass('html') || $currentContent.hasClass('xml') || $currentContent.hasClass('handlebars')) {
        extractedCode['html'] += $currentContent.text();
      } else if ($currentContent.hasClass('css') || $currentContent.hasClass('scss') || $currentContent.hasClass('less')) {
        extractedCode['css'] += $currentContent.text();
      }
    }
    return extractedCode;

  }

  /**
   * Create hidden fields for CodePen
   *
   * @method generateFieldsForCodePen
   * @param extracted_code {Object} object containing extracted code
   * @returns {Array} array containing hidden input fields for Code Pen export
   */
  function generateFieldsForCodePen(extracted_code) {

    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", 'data');
    hiddenField.setAttribute("value", JSON.stringify(extracted_code));
    return [hiddenField];

  }

  function generateFieldsForJSFiddle(extracted_code) {

    var fields = [];
    for (var key in extracted_code) {
      if (extracted_code.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", extracted_code[key]);
        fields.push(hiddenField);
      }
    }
    return fields;

  }

  function send(path, fields) {

    var form = document.createElement("form");
    form.setAttribute("method", 'post');
    form.setAttribute("action", path);
    form.setAttribute('target', '_blank');

    for (var i = 0; i < fields.length; i++) {
      form.appendChild(fields[i]);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

  }

  return {

    isEligibleForExport: function(content) {
      var isEligible = false;
      for (var i = 0; i < content.length; i++) {
        var $currentContent = angular.element(content[i]);
        if ($currentContent.hasClass('javascript') || $currentContent.hasClass('html') || $currentContent.hasClass('xml')
          || $currentContent.hasClass('css') || $currentContent.hasClass('scss') || $currentContent.hasClass('less')
          || $currentContent.hasClass('handlebars') || $currentContent.hasClass('php')) {
          isEligible = true;
          break;
        }
      }
      return isEligible;
    },
    exportCode: function (content, export_type) {
      var extractedCode = extractCode(content);
      switch (export_type) {
        case 'codepen':
          send('http://codepen.io/pen/define', generateFieldsForCodePen(extractedCode));
          break;
        case 'jsfiddle':
          send('http://jsfiddle.net/api/post/library/pure/', generateFieldsForJSFiddle(extractedCode));
          break;
      }
    }

  };

});