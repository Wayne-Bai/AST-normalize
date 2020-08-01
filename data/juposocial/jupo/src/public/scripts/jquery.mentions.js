/*
 * Mentions Input
 * Version 1.0.2
 * Written by: Kenneth Auchenberg (Podio)
 *
 * Using underscore.js
 *
 * License: MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function ($, _, undefined) {

  // Settings
  var KEY = { BACKSPACE : 8, TAB : 9, RETURN : 13, ESC : 27, LEFT : 37, UP : 38, RIGHT : 39, DOWN : 40, COMMA : 188, SPACE : 32, HOME : 36, END : 35 }; // Keys "enum"
  var defaultSettings = {
    triggerChar     : '@',
    fullNameTrigger : false,
    onDataRequest   : $.noop,
    minChars        : 1,
    showAvatars     : true,
    elastic       : true,
    classes         : {
      autoCompleteItemActive : "active"
    },
    templates       : {
      wrapper                    : _.template('<div class="mentions-input-box"></div>'),
      autocompleteList           : _.template('<div class="mentions-autocomplete-list"></div>'),
      autocompleteListItem       : _.template('<li data-ref-id="<%= id %>" data-ref-type="<%= type %>" data-display="<%= display %>"><%= content %></li>'),
      autocompleteListItemAvatar : _.template('<img  src="<%= avatar %>" />'),
      autocompleteListItemIcon   : _.template('<div class="icon <%= icon %>"></div>'),
      mentionsOverlay            : _.template('<div class="mentions"><div></div></div>'),
      mentionItemSyntax          : _.template('@[<%= value %>](<%= type %>:<%= id %>)'),
      mentionItemHighlight       : _.template('<strong><span><%= value %></span></strong>')
    }
  };

  var utils = {
    htmlEncode       : function (str) {
      // return str;
      return _.escape(str);
    },
    highlightTerm    : function (value, term) {
      if (!term && !term.length) {
        return value;
      }
      return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    },
    setCaratPosition : function (domNode, caretPos) {
      if (domNode.createTextRange) {
        var range = domNode.createTextRange();
        range.move('character', caretPos);
        range.select();
      } else {
        if (domNode.selectionStart) {
          domNode.focus();
          domNode.setSelectionRange(caretPos, caretPos);
        } else {
          domNode.focus();
        }
      }
    },
    getCaratPosition : function (domNode) {
      if(typeof(domNode.selectionStart) == "number") {
        start = domNode.selectionStart;
        end = domNode.selectionEnd;
      }

      else if(document.selection) {
        var range = document.selection.createRange();
        if (range.parentElement().id == domNode.id) {
          // Create a selection of the whole textarea
          var range_all = document.body.createTextRange();
          range_all.moveToElementText(domNode);

          // Calculate selection start point by moving beginning of range_all to beginning of range
          for (start=0; range_all.compareEndPoints("StartToStart", range) < 0; start++) {
            range_all.moveStart('character', 1);
          }

          for (var i = 0; i <= start; i ++) {
            if (domNode.value.charAt(i) == '\n')
            start++;
          }

          // Create a selection of the whole textarea
          var range_all = document.body.createTextRange();
          range_all.moveToElementText(domNode);

          // Calculate selection end point by moving beginning of range_all to end of range
          for (end = 0; range_all.compareEndPoints('StartToEnd', range) < 0; end ++) {
            range_all.moveStart('character', 1);
          }

          // Get number of line breaks from textarea start to selection end and add them to end
          for (var i = 0; i <= end; i ++){
            if (domNode.value.charAt(i) == '\n') {
              end ++;
            }
          }
        }
      }
      return end;
    },
    rtrim: function(string) {
      return string.replace(/\s+$/,"");
    }
  };

  var MentionsInput = function (settings) {

    var domInput, elmInputBox, elmInputWrapper, elmAutocompleteList, elmWrapperBox, elmMentionsOverlay, elmActiveAutoCompleteItem;
    var mentionsCollection = [];
    var autocompleteItemCollection = {};
    var inputBuffer = [];
    var currentDataQuery;
    var cursorEndPosition;

    settings = $.extend(true, {}, defaultSettings, settings );

    function initTextarea() {
      elmInputBox = $(domInput);

      if (elmInputBox.attr('data-mentions-input') == 'true') {
        return;
      }

      elmInputWrapper = elmInputBox.parent();
      elmWrapperBox = $(settings.templates.wrapper());
      elmInputBox.wrapAll(elmWrapperBox);
      elmWrapperBox = elmInputWrapper.find('> div');

      elmInputBox.attr('data-mentions-input', 'true');
      elmInputBox.bind('keydown', onInputBoxKeyDown);
      elmInputBox.bind('keypress', onInputBoxKeyPress);
      elmInputBox.bind('input', onInputBoxInput);
      elmInputBox.bind('click', onInputBoxClick);
      elmInputBox.bind('blur', onInputBoxBlur);

      // Elastic textareas, internal setting for the Dispora guys
      if( settings.elastic ) {
        elmInputBox.elastic();
      }

      if (settings.fullNameTrigger) {
        elmInputBox.bind('keyup mousedown mouseup focus', saveCursorPosition);
      }
    }

    function initAutocomplete() {
      elmAutocompleteList = $(settings.templates.autocompleteList());
      elmAutocompleteList.appendTo(elmWrapperBox);
      elmAutocompleteList.delegate('li', 'mousedown', onAutoCompleteItemClick);
    }

    function initMentionsOverlay() {
      elmMentionsOverlay = $(settings.templates.mentionsOverlay());
      elmMentionsOverlay.prependTo(elmWrapperBox);
    }

    function saveCursorPosition(e) {
      cursorEndPosition = utils.getCaratPosition(e.target);
    }

    function updateValues() {
      var syntaxMessage = getInputBoxValue();

      _.each(mentionsCollection, function (mention) {
        var textSyntax = settings.templates.mentionItemSyntax(mention);
        syntaxMessage = syntaxMessage.replace(new RegExp(mention.value,"g"), textSyntax);
      });

      var mentionText = utils.htmlEncode(syntaxMessage);

      _.each(mentionsCollection, function (mention) {
        var formattedMention = _.extend({}, mention, {value: utils.htmlEncode(mention.value)});
        var textSyntax = settings.templates.mentionItemSyntax(formattedMention);
        var textHighlight = settings.templates.mentionItemHighlight(formattedMention);

        mentionText = mentionText.replace(new RegExp(textSyntax,"g"), textHighlight);
        
        elmInputBox.trigger('change');
        
      });

      mentionText = mentionText.replace(/\n/g, '<br />');
      mentionText = mentionText.replace(/ {2}/g, '&nbsp; ');

      elmInputBox.data('messageText', syntaxMessage);
      elmMentionsOverlay.find('div').html(mentionText);
    }

    function resetBuffer() {
      inputBuffer = [];
    }

    function updateMentionsCollection() {
      var inputText = getInputBoxValue();
      // console.log(mentionsCollection);

      mentionsCollection = _.reject(mentionsCollection, function (mention, index) {
        return !mention.value || inputText.indexOf(mention.value) == -1;
      });
      
      // mentionsCollection = _.filter(mentionsCollection, function (mention, index) {
        // var values;
        // values = mention.value.split(/\s+/);
        // values.push(mention.value);
        // var i;
        // for (i = 0; i < values.length; ++i) {
          // if (inputText.indexOf(values[i]) != -1) {
            // return true;
          // } 
        // }
      // });
      
      mentionsCollection = _.compact(mentionsCollection);
      // console.log(mentionsCollection);
    }

    function addMention(mention) {

      var currentMessage = getInputBoxValue();

      if (settings.fullNameTrigger) {
        // Get the actual carat position using some black magic
        var currentCaretPosition = cursorEndPosition;
        var startCaretPosition = currentCaretPosition - currentDataQuery.length;

        // Find where to start inserting mention
        var matchLen = mention.value.indexOf(currentDataQuery) + currentDataQuery.length;
        var curMessage = currentMessage.substring(0, currentCaretPosition);
        if(curMessage.substring(curMessage.length - matchLen) ==  mention.value.substring(0, matchLen)){
          startCaretPosition -= mention.value.indexOf(currentDataQuery);
        }
      }
      else {
        // Using a regex to figure out positions
        var regex = new RegExp("\\" + settings.triggerChar + currentDataQuery, "gi");
        regex.exec(currentMessage);

        var startCaretPosition = regex.lastIndex - currentDataQuery.length - 1;
        var currentCaretPosition = regex.lastIndex;
      }

      var start = currentMessage.substr(0, startCaretPosition);
      var end = currentMessage.substr(currentCaretPosition, currentMessage.length);
      var startEndIndex = (start + mention.value).length + 1;
      
      // Enable mentioning the same user multiple times
      if(!$.map(mentionsCollection,function(val,key){if(val.id === mention.id)return val}).length)
      {
        mentionsCollection.push(mention);
      }

      // Cleaning before inserting the value, otherwise auto-complete would be triggered with "old" inputbuffer
      resetBuffer();
      currentDataQuery = '';
      hideAutoComplete();

      // Mentions & syntax message
      var updatedMessageText = start + mention.value + end;
      elmInputBox.val(updatedMessageText);
      updateValues();

      // Set correct focus and selection
      elmInputBox.focus();
      utils.setCaratPosition(elmInputBox[0], startEndIndex);
    }

    function getInputBoxValue() {
      return $.trim(elmInputBox.val());
    }

    function onAutoCompleteItemClick(e) {
      var elmTarget = $(this);
      var mention = autocompleteItemCollection[elmTarget.attr('data-uid')];

      addMention(mention);

      return false;
    }

    function onInputBoxClick(e) {
      resetBuffer();
    }

    function onInputBoxBlur(e) {
      hideAutoComplete();
    }

    function onInputBoxInput(e) {
      updateValues();
      updateMentionsCollection();
      hideAutoComplete();

      var space_index = _.lastIndexOf(inputBuffer, " ");
      if (space_index > -1) {
        inputBuffer = inputBuffer.slice(space_index + 1);
      }

      if (settings.fullNameTrigger)
        currentDataQuery = inputBuffer.join('');
      else {
        var triggerCharIndex = _.lastIndexOf(inputBuffer, settings.triggerChar);
        if (triggerCharIndex > -1) {
          currentDataQuery = inputBuffer.slice(triggerCharIndex + 1).join('');
          currentDataQuery = utils.rtrim(currentDataQuery);
        }
      }
      _.defer(_.bind(doSearch, this, currentDataQuery));
    }

    function onInputBoxKeyPress(e) {
      if(e.keyCode !== KEY.BACKSPACE) {
        var typedValue = String.fromCharCode(e.which || e.keyCode);
        inputBuffer.push(typedValue);
      }
    }

    function onInputBoxKeyDown(e) {
      
      // This also matches HOME/END on OSX which is CMD+LEFT, CMD+RIGHT
      if (e.keyCode == KEY.LEFT || e.keyCode == KEY.RIGHT || e.keyCode == KEY.HOME || e.keyCode == KEY.END) {
        // Defer execution to ensure carat pos has changed after HOME/END keys
        _.defer(resetBuffer);

        // IE9 doesn't fire the oninput event when backspace or delete is pressed. This causes the highlighting
        // to stay on the screen whenever backspace is pressed after a highlighed word. This is simply a hack
        // to force updateValues() to fire when backspace/delete is pressed in IE9.
        if (navigator.userAgent.indexOf("MSIE 9") > -1) {
          _.defer(updateValues);
        }

        return;
      }

      if (e.keyCode == KEY.BACKSPACE) {
        inputBuffer = inputBuffer.slice(0, -1 + inputBuffer.length); // Can't use splice, not available in IE
        return;
      } 

      if (!elmAutocompleteList.is(':visible')) {
        return true;
      }

      switch (e.keyCode) {
        case KEY.UP:
        case KEY.DOWN:
          var elmCurrentAutoCompleteItem = null;
          if (e.keyCode == KEY.DOWN) {
            if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
              elmCurrentAutoCompleteItem = elmActiveAutoCompleteItem.next();
            } else {
              elmCurrentAutoCompleteItem = elmAutocompleteList.find('li').first();
            }
          } else {
            elmCurrentAutoCompleteItem = $(elmActiveAutoCompleteItem).prev();
          }

          if (elmCurrentAutoCompleteItem.length) {
            selectAutoCompleteItem(elmCurrentAutoCompleteItem);
          }

          return false;

        case KEY.RETURN:
        case KEY.TAB:
          if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
            elmActiveAutoCompleteItem.trigger('mousedown');
            return false;
          }

          break;
      }

      return true;
    }

    function hideAutoComplete() {
      elmActiveAutoCompleteItem = null;
      elmAutocompleteList.empty().hide();
    }

    function selectAutoCompleteItem(elmItem) {
      elmItem.addClass(settings.classes.autoCompleteItemActive);
      elmItem.siblings().removeClass(settings.classes.autoCompleteItemActive);

      elmActiveAutoCompleteItem = elmItem;
    }

    function populateDropdown(query, results) {
      elmAutocompleteList.show();

      // Filter items that has already been mentioned
      var mentionValues = _.pluck(mentionsCollection, 'value');

      if (!results.length) {
        hideAutoComplete();
        return;
      }

      elmAutocompleteList.empty();
      var elmDropDownList = $("<ul>").appendTo(elmAutocompleteList).hide();

      _.each(results, function (item, index) {
        var itemUid = _.uniqueId('mention_');

        autocompleteItemCollection[itemUid] = _.extend({}, item, {value: item.name});

        var elmListItem = $(settings.templates.autocompleteListItem({
          'id'      : utils.htmlEncode(item.id),
          'display' : utils.htmlEncode(item.name),
          'type'    : utils.htmlEncode(item.type),
          'content' : utils.highlightTerm(utils.htmlEncode((item.name)), query),
          'item'    : item
        })).attr('data-uid', itemUid);

        if (index === 0) {
          selectAutoCompleteItem(elmListItem);
        }

        if (settings.showAvatars) {
          var elmIcon;

          if (item.avatar) {
            elmIcon = $(settings.templates.autocompleteListItemAvatar({ avatar : item.avatar }));
          } else {
            elmIcon = $(settings.templates.autocompleteListItemIcon({ icon : item.icon }));
          }
          elmIcon.prependTo(elmListItem);
        }
        elmListItem = elmListItem.appendTo(elmDropDownList);
      });

      elmAutocompleteList.show();
      elmDropDownList.show();
    }

    function doSearch(query) {
      if (query && query.length && query.length >= settings.minChars) {
        if (settings.fullNameTrigger) {
          doSearchFullNameTrigger(query);
        } else {
          settings.onDataRequest.call(this, 'search', query, function (responseData) {
            populateDropdown(query, responseData);
          });
        }
      }
    }

    function doSearchFullNameTrigger(query) {
      query = query.substring(query.lastIndexOf(" ") + 1);
      var regexp = /[A-Z][a-z]/g;
      var arr = query.match(regexp);
      if(arr) {
        query = query.substring(query.lastIndexOf(arr[arr.length - 1]));
        if(query.length < settings.minChars) { return; }

        settings.onDataRequest.call(this, 'search', query, function (responseData) {
          currentDataQuery = query;
          populateDropdown(query, responseData);
        });
      }
    }

    function resetInput() {
      elmInputBox.val('');
      mentionsCollection = [];
      updateValues();
    }

    // Public methods
    return {
      init : function (domTarget) {

        domInput = domTarget;

        initTextarea();
        initAutocomplete();
        initMentionsOverlay();
        resetInput();

        if( settings.prefillMention ) {
          addMention( settings.prefillMention );
        }

      },

      val : function (callback) {
        if (!_.isFunction(callback)) {
          return;
        }

        var value = mentionsCollection.length ? elmInputBox.data('messageText') : getInputBoxValue();
        callback.call(this, value);
      },

      reset : function () {
        resetInput();
      },
      
      update: function() {
            var messageText = getInputBoxValue();
            // Strip codes
            // add each mention to mentionsCollection
            // And update

            var mentionText = utils.htmlEncode(getInputBoxValue());
            var re = /@\[(.*?)\]\((.*?):(.*?)\)+/g; // Searches through @[value](type:id)

            var match;
            var newMentionText = mentionText;
            while ((match = re.exec(mentionText)) != null) {    // Find all matches in a string
                console.log(match);
                newMentionText = newMentionText.replace(match[0],match[1]);
                mentionsCollection.push({   // Btw: match[0] is the complete match
                    'id': match[3],
                    'type': match[2],
                    'value': match[1]
                });
            }
            elmInputBox.val(newMentionText);
            updateValues();
      },

      getMentions : function (callback) {
        if (!_.isFunction(callback)) {
          return;
        }

        callback.call(this, mentionsCollection);
      }
    };
  };

  $.fn.mentionsInput = function (method, settings) {
    var outerArguments = arguments;

    if (typeof method === 'object' || !method) {
      settings = method;
    }

    return this.each(function () {
      var instance = $.data(this, 'mentionsInput') || $.data(this, 'mentionsInput', new MentionsInput(settings));

      if (_.isFunction(instance[method])) {
        return instance[method].apply(this, Array.prototype.slice.call(outerArguments, 1));

      } else if (typeof method === 'object' || !method) {
        return instance.init.call(this, this);

      } else {
        $.error('Method ' + method + ' does not exist');
      }

    });
  };

})(jQuery, _);
