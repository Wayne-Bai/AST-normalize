// Smalleditor module
var smalleditor = angular.module('smalleditor');

// Smalleditor services
smalleditor.service('SmalleditorService', function() {
  // check browser
  this.isFirefox = navigator.userAgent.match(/firefox/i);
  this.isChrome = navigator.userAgent.match(/chrome/i);

  // set caret at the end of the text (cross browser)
  // http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
  this.setCaret = function(el){
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
      var range = document.createRange();
      if (!range) return;
      range.selectNodeContents(el);
      range.collapse(false);
      if (this.isFirefox) {
        range.setEndBefore($(el).find('br').get(0));
      }
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
    }
  };

  // http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contenteditable
  this.getSelectionStart = function(){
    var node = document.getSelection().anchorNode,
        startNode = (node && node.nodeType === 3 ? node.parentNode : node);
    return startNode;
  };

  // http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
  this.rangeSelectsSingleNode = function(range) {
    var startNode = range.startContainer;
    return startNode === range.endContainer &&
      startNode.hasChildNodes() &&
      range.endOffset === range.startOffset + 1;
  };

  this.getSelectedParentElement = function(){
    var spe = null;
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    if (this.rangeSelectsSingleNode(range)) {
      spe = range.startContainer.childNodes[range.startOffset];
    } else if (range.startContainer.nodeType === 3) {
      spe = range.startContainer.parentNode;
    } else {
      spe = range.startContainer;
    }
    return spe;
  };
});



// Define `smalleditor` directive
smalleditor.directive('smalleditor', [
  '$timeout',
  'SmalleditorCore',
  'SmalleditorService',
  function ($timeout, seUtils, seService) {
    'use strict';
    return {
      scope: {
        api: '=?api'
      },
      templateUrl: 'views/_se_toolbar.html',
      link: function (scope,  element, attrs) {

        // scope api
        var api = scope.api = {};

        // set default toolbar position
        scope.position = {
          top: 10,
          left: 10,
          // triangle direction
          below: false
        };

        // available buttons
        scope.buttons = {};
        (attrs.buttons || "b,i").split(',').reduce(function(o, k){
          var key = k.trim().toLowerCase();
          if (key) {
            o[key] = true;
          }
          return o;
        }, scope.buttons);

        // enable/disable toolbar
        scope.enableToolbar = (attrs.enabletoolbar != 'false'); // By default `true`

        // default toolbar status and placeholder
        scope.showToolbar = (attrs.showtoolbar == 'true'); // By default `false`
        scope.showPlaceholder = false;

        // placeholder text
        scope.placeholder = attrs.placeholder || "Type your text";

        // icon theme
        scope.iconTheme = attrs.icontheme;

        // Text paste
        scope.allowPaste = (attrs.paste != 'false');
        scope.plainPaste = (attrs.plain_paste != 'false');
        scope.htmlPaste = (attrs.html_paste == 'true');

        // block tags
        var blockTags = "p h1 h2 h3 h4 h5 h6 pre blockquote".split(' ');
        var blockSelector = blockTags.join(',');
        // unwanted tags
        var unwantedTags = "span em strong mark".split(' ');
        var unwantedSelector = unwantedTags.join(',');

        // toolbar container
        var $toolbar = element.find('.smalleditor-toolbar');
        // content container
        var $content = element.find('.smalleditor-content');
        // get body
        var $body = angular.element(document.getElementsByTagName('body'));

        // make content editable
        $content.attr('contenteditable', true);

        // Generate random number
        var generateRandomName = function() {
          return seUtils.generateRandomName();
        };

        // position the toolbar above or below the selected text
        var setToolbarPosition = function () {
          var toolbarHeight = $toolbar[0].offsetHeight;
          var toolbarWidth = $toolbar[0].offsetWidth;
          var spacing = 5;
          var selection = window.getSelection();
          var range = selection.getRangeAt(0);
          var boundary = range.getBoundingClientRect();

          var topPosition = boundary.top;
          var leftPosition = boundary.left;

          // if there isn't enough space at the top,
          // place it at the bottom of the selection
          if(boundary.top < (toolbarHeight + spacing)) {
            scope.position.top = topPosition + boundary.height + spacing;
            // set toolbar position if it's above or below the selection
            // used in the template to place the triangle above or below
            scope.position.below = true;
          } else {
            scope.position.top = topPosition - toolbarHeight - spacing;
            scope.position.below = false;
          }

          // center toolbar above selected text
         scope.position.left = leftPosition - (toolbarWidth/2) + (boundary.width/2);

         // cross-browser window scroll positions
         var scrollLeft = (window.pageXOffset !== undefined) ?
             window.pageXOffset :
             (document.documentElement || document.body.parentNode || document.body).scrollLeft;
         var scrollTop = (window.pageYOffset !== undefined) ?
             window.pageYOffset :
             (document.documentElement || document.body.parentNode || document.body).scrollTop;

         // add the scroll positions
         // because getBoundingClientRect gives us the position
         // relative to the viewport, not to the page
         scope.position.top += scrollTop;
         scope.position.left += scrollLeft;

         return this;
        };

        // get current selection and act on toolbar depending on it
        var checkSelection = function (e) {
          // if you click something from the toolbar don't do anything
          if(e && e.target && $toolbar.find(e.target).length) {
            return false;
          }

          // get new selection
          var newSelection = window.getSelection();

          // get selection node
          var anchorNode = newSelection.anchorNode;
          if (!anchorNode) {
            scope.showToolbar = false;
            return this;
          }

          // check if selection is in the current editor/directive container
          var parentNode = anchorNode.parentNode;
          while (parentNode.tagName !== undefined && parentNode !== $content.get(0)) {
            parentNode = parentNode.parentNode;
          }

          // if the selection is in the current editor
          if(parentNode === $content.get(0)) {
            // show the toolbar
            $timeout(function() {
              if(newSelection.toString().trim() === '' || !anchorNode) {
                scope.showToolbar = false;
              } else {
                scope.showToolbar = true;
                setToolbarPosition();
              }
            });
            // check selection styles and active buttons based on it
            checkActiveButtons();
          } else {
            // hide the toolbar
            $timeout(function() {
              scope.showToolbar = false;
            });
          }
          return this;
        };

        // Bind selection
        var bindSelection = function() {
          // check selection when selecting with the shift key
          $content.bind('keyup', checkSelection);

          // check the selection on every mouseup
          // it also triggeres when releasing outside the browser
          document.addEventListener('mouseup', checkSelection);

          var contentBlurTimer;
          $content.bind('blur', function() {
            if(contentBlurTimer) {
              clearTimeout(contentBlurTimer);
            }
            contentBlurTimer = setTimeout(checkSelection, 200);
          });
        };

        // check current selection styles and activate buttons
        var checkActiveButtons = function () {
          var parentNode = seService.getSelectedParentElement();
          scope.styles = {};
          // Iterate through all parent node and find all styles by its tagName
          while (parentNode && parentNode.tagName !== undefined && $content.get(0) != parentNode) {
            scope.styles[parentNode.tagName.toLowerCase()] = true;
            parentNode = parentNode.parentNode;
          }
        };

        // Placeholder activate
        var _ph_activate = function(){
          if ($content.get(0).textContent.replace(/^\s+|\s+$/g, '') === '') {
            scope.showPlaceholder = true;
          }
        };
        // Placeholder deactivate
        var _ph_deactivate = function(e){
          scope.showPlaceholder = false;
          if (!e || (e.type !== 'keypress' && e.type !== 'paste')) {
            _ph_activate();
          }
        };

        // set placeholders for empty textarea
        var setPlaceholders = function() {
          _ph_activate();
          $content.on('blur.placeholder', _ph_activate)
            .on('keypress.placeholder paste.placeholder', _ph_deactivate);
        };

        // Bind paste
        var bindPaste = function() {
          $content.on('paste.se_paste', function(e){
            e.preventDefault();
            if (!scope.allowPaste) {
              return false;
            }
            var oe = (e.originalEvent || e);
            if (oe.clipboardData) {
              if (oe.clipboardData.getData('text/plain') && scope.plainPaste) {
                var paragraphs = oe.clipboardData.getData('text/plain').split(/[\r\n]/g);
                var html = "";
                for (var p = 0; p < paragraphs.length; p += 1) {
                  if (paragraphs[p].trim() !== '') {
                    var ep = seUtils.htmlEntities(paragraphs[p].trim());
                    if (ep) {
                      if (p === 0) {
                        html += ep;
                      } else {
                        html += '<p name="' + generateRandomName() + '" class="se-elem se-elem--p">' + ep + '</p>';
                      }
                    }
                  }
                }
                if (!!html) {
                  document.execCommand('insertHTML', false, html);
                }
              } else if (oe.clipboardData.getData('text/html') && scope.htmlPaste) {
                // TODO HTML cleanup and paste
              }
            }
          });
        };

        // Avoid nested block tags
        var removeNested = function() {
          $content.find('> .se-elem').find(blockSelector).contents().unwrap();
        };

        // Remove unwanted
        var bindRemoveUnwanted = function() {
          // Prssing Enter/Deleting in `<blockquote>, <h1>, <h2> ...` generates `p` tags,
          // find closest `.se-elem` element and remove those `p` tags
          // Avoid `p` tag inside `block` tags like `blockquote`, `h1`, `h2`
          $content.on('keyup.internal_noise, paste.internal_noise, focus.internal_noise', function(){
            $timeout(function(){
              // firefox adds `<br type=_moz></br>`
              $content.find('> br[type=_moz], > br').remove();
              // chrome adds `<span style="...">text</span>` on backspace
              $content.find(unwantedSelector).contents().unwrap();
              $content.find('[style]').removeAttr('style');
              removeNested();
            });
          });
        };

        // Add first element class on every change
        // TODO why we need this? - remove it
        var addedNewElem = function() {
          $content.find('.se-elem--first').removeClass('se-elem--first');
          $content.find('.se-elem').first().addClass('se-elem--first');
        };

        // creates named paragraph with class`se-elem se-elem--p`
        var createNamedParagraph = function() {
          var newP = $('<p>', {
            name: generateRandomName(),
            class: 'se-elem se-elem--p'
          }).appendTo($content);
          newP.append('<br/>');
          seService.setCaret(newP.get(0));

          addedNewElem();

          return newP;
        };

        // Bind wrapping elements
        var bindWrapElements = function() {
          $content.on('blur keyup paste focus', function(){
            // If no `.se-elem` is there, create first paragraph
            var pList = $content.find('.se-elem');
            if (pList.size() === 0) {
              createNamedParagraph();
            }

            // wrap content text in p to avoid firefox problems
            $content.contents().each((function() {
              return function(index, field) {
                if (field.nodeName === '#text') {
                  document.execCommand('insertHTML',
                    false,
                    "<p name=" + generateRandomName() + " class='se-elem se-elem--p'>" + field.data + "<br/></p>");
                  addedNewElem();
                  return field.remove();
                }
              };
            })(this));
          });
        };

        // Bind create new
        var bindParagraphCreation = function() {
          $content.on('keyup.paragraph_creation', function(e){
            // Process only enter key
            if (e.which === 13) {
              if (!e.shiftKey) {
                // Insert `p` tag on enter
                document.execCommand('formatBlock', false, 'p');

                // Get closest `.se-elem`, add `name` and `class` to that element.

                // Enter key on `bold`, `italic` or `underline` elements generates `b` tag
                // and becomes `<p name='...' class='...'><b>example<b><p>`,
                // in that case find closest `.se-elem` add name/class attributes
                var node = seService.getSelectionStart();
                var closest = $(node).closest('.se-elem');
                if (closest.size() === 0) {
                  closest = $(node);
                }
                closest.attr('name', generateRandomName()).addClass('se-elem se-elem--p');
                addedNewElem();
              }
            }
          });
        };

        // Setup editor
        var setup = function () {
          setPlaceholders();
          bindSelection();
          bindPaste();
          bindParagraphCreation();
          bindRemoveUnwanted();
          bindWrapElements();
        };

        // simple edit action - bold, italic, underline
        scope.SimpleAction = function(action, elem) {
          elem = elem && elem.toLowerCase();
          document.execCommand('styleWithCSS', false, false);
          document.execCommand(action, false, elem);
          if (action == 'formatBlock') {
            var node = seService.getSelectionStart();
            var closest = $(node).closest(elem);
            if (closest.size() === 0) {
              closest = $(node).prev(elem);
            }
            closest.attr('name', generateRandomName()).addClass('se-elem se-elem--' + elem);
            removeNested();
            addedNewElem();
          }
        };

        // move the toolbar to the body,
        // we can use overflow: hidden on containers
        $body.append($toolbar);

        // setup editor
        setup();


        //
        // APIs
        //

        // Get current data model
        api.dataModel = function(dataModel) {
          if (!dataModel) {
            return seUtils.generateModel($content);
          }
          $content.html(seUtils.generateHTMLFromModel(dataModel));
          _ph_deactivate();
        };

        // Get html from data model
        api.getHTML = function(dataModel) {
          if (!dataModel) {
            return null;
          }
          return seUtils.generateHTMLFromModel(dataModel);
        };

        // compute delta
        api.computeDelta = seUtils.computeDelta;
        // apply delta
        api.applyDelta = seUtils.applyDelta;
      }
    };
  }
]);
