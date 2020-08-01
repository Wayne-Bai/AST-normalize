(function() {
  (function($) {
    var methods;
    methods = {
      edit: function(isEditing) {
        return this.each(function() {
          return $(this).attr("contentEditable", isEditing || false);
        });
      },
      save: function(callback) {
        return this.each(function() {
          return callback($(this).attr('id'), $(this).html());
        });
      },
      createlink: function() {
        var urlPrompt;
        urlPrompt = prompt("Enter URL:", "http://");
        return document.execCommand("createlink", false, urlPrompt);
      },
      insertimage: function() {
        var urlPrompt;
        urlPrompt = prompt("Enter Image URL:", "http://");
        return document.execCommand("insertimage", false, urlPrompt);
      },
      formatblock: function(block) {
        return document.execCommand("formatblock", null, block);
      },
      init: function(opts) {
        var $toolbar, button, command, commands, excludes, font, font_list, fontnames, fontsize, fontsizes, group, groups, options, shortcuts, size_list, _i, _j, _k, _l, _len, _len2, _len3, _len4;
        options = opts || {};
        groups = [
          [
            {
              name: 'bold',
              label: "<span style='font-weight:bold;'>B</span>",
              title: 'Bold (Ctrl+B)',
              classname: 'toolbar_bold'
            }, {
              name: 'italic',
              label: "<span style='font-style:italic;'>I</span>",
              title: 'Italic (Ctrl+I)',
              classname: 'toolbar_italic'
            }, {
              name: 'underline',
              label: "<span style='text-decoration:underline!important;'>U</span>",
              title: 'Underline (Ctrl+U)',
              classname: 'toolbar_underline'
            }, {
              name: 'strikethrough',
              label: "<span style='text-shadow:none;text-decoration:line-through;'>ABC</span>",
              title: 'Strikethrough',
              classname: 'toolbar_strikethrough'
            }, {
              name: 'removeFormat',
              label: "<i class='icon-minus'></i>",
              title: 'Remove Formating (Ctrl+M)',
              classname: 'toolbar_remove'
            }
          ], [
            {
              name: 'fontname',
              label: "F <span class='caret'></span>",
              title: 'Select font name',
              classname: 'toolbar_fontname dropdown-toggle',
              dropdown: true
            }
          ], [
            {
              name: 'FontSize',
              label: "<span style='font:bold 16px;'>A</span><span style='font-size:8px;'>A</span> <span class='caret'></span>",
              title: 'Select font size',
              classname: 'toolbar_fontsize dropdown-toggle',
              dropdown: true
            }
          ], [
            {
              name: 'forecolor',
              label: "<div style='color:#ff0000;'>A <span class='caret'></span></div>",
              title: 'Select font color',
              classname: 'toolbar_forecolor dropdown-toggle',
              dropdown: true
            }
          ], [
            {
              name: 'backcolor',
              label: "<div style='display:inline-block;margin:3px;width:15px;height:12px;background-color:#0000ff;'></div> <span class='caret'></span>",
              title: 'Select background color',
              classname: 'toolbar_bgcolor dropdown-toggle',
              dropdown: true
            }
          ], [
            {
              name: 'justifyleft',
              label: "<i class='icon-align-left' style='margin-top:2px;'></i>",
              title: 'Left justify',
              classname: 'toolbar_justifyleft'
            }, {
              name: 'justifycenter',
              label: "<i class='icon-align-center' style='margin-top:2px;'></i>",
              title: 'Center justify',
              classname: 'toolbar_justifycenter'
            }, {
              name: 'justifyright',
              label: "<i class='icon-align-right' style='margin-top:2px;'></i>",
              title: 'Right justify',
              classname: 'toolbar_justifyright'
            }, {
              name: 'justifyfull',
              label: "<i class='icon-align-justify' style='margin-top:2px;'></i>",
              title: 'Full justify',
              classname: 'toolbar_justifyfull'
            }
          ], [
            {
              name: 'createlink',
              label: '@',
              title: 'Link to a web page (Ctrl+L)',
              userinput: "yes",
              classname: 'toolbar_link'
            }, {
              name: 'insertimage',
              label: "<i style='margin-top:2px;' class='icon-picture'></i>",
              title: 'Insert an image (Ctrl+G)',
              userinput: "yes",
              classname: 'toolbar_image'
            }, {
              name: 'insertorderedlist',
              label: "<i class='icon-list-alt' style='margin-top:2px;'></i>",
              title: 'Insert ordered list',
              classname: 'toolbar_ol'
            }, {
              name: 'insertunorderedlist',
              label: "<i class='icon-list' style='margin-top:2px;'></i>",
              title: 'Insert unordered list',
              classname: 'toolbar_ul'
            }
          ], [
            {
              name: 'insertparagraph',
              label: 'P',
              title: 'Insert a paragraph (Ctrl+Alt+0)',
              classname: 'toolbar_p',
              block: 'p'
            }, {
              name: 'insertheading1',
              label: 'H1',
              title: "Heading 1 (Ctrl+Alt+1)",
              classname: 'toolbar_h1',
              block: 'h1'
            }, {
              name: 'insertheading2',
              label: 'H2',
              title: "Heading 2 (Ctrl+Alt+2)",
              classname: 'toolbar_h2',
              block: 'h2'
            }, {
              name: 'insertheading3',
              label: 'H3',
              title: "Heading 3 (Ctrl+Alt+3)",
              classname: 'toolbar_h3',
              block: 'h3'
            }, {
              name: 'insertheading4',
              label: 'H4',
              title: "Heading 4 (Ctrl+Alt+4)",
              classname: 'toolbar_h4',
              block: 'h4'
            }
          ], [
            {
              name: 'blockquote',
              label: "<i style='margin-top:2px;' class='icon-comment'></i>",
              title: 'Blockquote (Ctrl+Q)',
              classname: 'toolbar_blockquote',
              block: 'blockquote'
            }, {
              name: 'code',
              label: '{&nbsp;}',
              title: 'Code (Ctrl+Alt+K)',
              classname: 'toolbar_code',
              block: 'pre'
            }, {
              name: 'superscript',
              label: 'x<sup>2</sup>',
              title: 'Superscript',
              classname: 'toolbar_superscript'
            }, {
              name: 'subscript',
              label: 'x<sub>2</sub>',
              title: 'Subscript',
              classname: 'toolbar_subscript'
            }
          ]
        ];
        if (options.toolbar_selector != null) {
          $toolbar = $(options.toolbar_selector);
        } else {
          $(this).before("<div id='editor-toolbar'></div>");
          $toolbar = $('#editor-toolbar');
        }
        $toolbar.addClass('fresheditor-toolbar');
        $toolbar.append("<div class='btn-toolbar'></div>");
        excludes = options.excludes || [];
        for (_i = 0, _len = groups.length; _i < _len; _i++) {
          commands = groups[_i];
          group = '';
          for (_j = 0, _len2 = commands.length; _j < _len2; _j++) {
            command = commands[_j];
            if (jQuery.inArray(command.name, excludes) < 0) {
              button = "<a href='#' class='btn toolbar-btn toolbar-cmd " + command.classname + "' title='" + command.title + "' command='" + command.name + "'";
              if (command.userinput != null) {
                button += " userinput='" + command.userinput + "'";
              }
              if (command.block != null) {
                button += " block='" + command.block + "'";
              }
              if (command.dropdown) {
                button += " data-toggle='dropdown'";
              }
              button += ">" + command.label + "</a>";
              group += button;
            }
          }
          $('.btn-toolbar', $toolbar).append("<div class='btn-group'>" + group + "</div>");
        }
        $("[data-toggle='dropdown']").removeClass('toolbar-cmd');
        if (jQuery.inArray('fontname', excludes) < 0) {
          fontnames = ["Arial", "Arial Black", "Comic Sans MS", "Courier New", "Georgia", "Helvetica", "Sans Serif", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"];
          font_list = '';
          for (_k = 0, _len3 = fontnames.length; _k < _len3; _k++) {
            font = fontnames[_k];
            font_list += "<li><a href='#' class='fontname-option' style='font-family:" + font + ";'>" + font + "</a></li>";
          }
          $('.toolbar_fontname').after("<ul class='dropdown-menu'>" + font_list + "</ul>");
          $('.fontname-option').on('click', function() {
            document.execCommand("fontname", false, $(this).text());
            $(this).closest('.btn-group').removeClass('open');
            return false;
          });
        }
        if (jQuery.inArray('FontSize', excludes) < 0) {
          fontsizes = [
            {
              size: 1,
              point: 8
            }, {
              size: 2,
              point: 10
            }, {
              size: 3,
              point: 12
            }, {
              size: 4,
              point: 14
            }, {
              size: 5,
              point: 18
            }, {
              size: 6,
              point: 24
            }, {
              size: 7,
              point: 36
            }
          ];
          size_list = '';
          for (_l = 0, _len4 = fontsizes.length; _l < _len4; _l++) {
            fontsize = fontsizes[_l];
            size_list += "<li><a href='#' class='font-option fontsize-option' style='font-size:" + fontsize.point + "px;fontsize='" + fontsize.size + "'>" + fontsize.size + "(" + fontsize.point + "pt)</a></li>";
          }
          $('.toolbar_fontsize').after("<ul class='dropdown-menu'>" + size_list + "</ul>");
          $('a.fontsize-option').on('click', function() {
            document.execCommand("FontSize", false, $(this).attr('fontsize'));
            $(this).closest('.btn-group').removeClass('open');
            return false;
          });
        }
        if (jQuery.inArray('forecolor', excludes) < 0) {
          $('a.toolbar_forecolor').after("<ul class='dropdown-menu colorpanel'><input type='text' id='forecolor-input' value='#000000' /><div id='forecolor-picker'></div></ul>");
          $('#forecolor-picker').farbtastic(function(color) {
            $('#forecolor-input').val(color);
            document.execCommand("forecolor", false, color);
            $(this).closest('.btn-group').removeClass('open');
            $('.toolbar_forecolor div').css({
              "color": color
            });
            return false;
          });
        }
        if (jQuery.inArray('backcolor', excludes) < 0) {
          $('a.toolbar_bgcolor').after("<ul class='dropdown-menu colorpanel'><input type='text' id='bgcolor-input' value='#000000' /><div id='bgcolor-picker'></div></ul>");
          $('#bgcolor-picker').farbtastic(function(color) {
            $('#bgcolor-input').val(color);
            document.execCommand("backcolor", false, color);
            $(this).closest('.btn-group').removeClass('open');
            $('.toolbar_bgcolor div').css({
              "background-color": color
            });
            return false;
          });
        }
        $(this).on('focus', function() {
          var $this;
          $this = $(this);
          $this.data('before', $this.html());
          return $this;
        }).on('blur keyup paste', function() {
          var $this;
          $this = $(this);
          if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
          }
          return $this;
        });
        $("a.toolbar-cmd").on('click', function() {
          var ceNode, cmd, dummy, range;
          cmd = $(this).attr('command');
          if ($(this).attr('userinput') === 'yes') {
            methods[cmd].apply(this);
          } else if ($(this).attr('block')) {
            methods['formatblock'].apply(this, ["<" + ($(this).attr('block')) + ">"]);
          } else {
            if ((cmd === 'justifyright') || (cmd === 'justifyleft') || (cmd === 'justifycenter') || (cmd === 'justifyfull')) {
              try {
                document.execCommand(cmd, false, null);
              } catch (e) {
                if (e && e.result === 2147500037) {
                  range = window.getSelection().getRangeAt(0);
                  dummy = document.createElement('br');
                  ceNode = range.startContainer.parentNode;
                  while ((ceNode != null) && ceNode.contentEditable !== 'true') {
                    ceNode = ceNode.parentNode;
                  }
                  if (!ceNode) {
                    throw 'Selected node is not editable!';
                  }
                  ceNode.insertBefore(dummy, ceNode.childNodes[0]);
                  document.execCommand(cmd, false, null);
                  dummy.parentNode.removeChild(dummy);
                } else if (console && console.log) {
                  console.log(e);
                }
              }
            } else {
              document.execCommand(cmd, false, null);
            }
          }
          return false;
        });
        shortcuts = [
          {
            keys: 'Ctrl+l',
            method: function() {
              return methods.createlink.apply(this);
            }
          }, {
            keys: 'Ctrl+g',
            method: function() {
              return methods.insertimage.apply(this);
            }
          }, {
            keys: 'Ctrl+Alt+U',
            method: function() {
              return document.execCommand('insertunorderedlist', false, null);
            }
          }, {
            keys: 'Ctrl+Alt+O',
            method: function() {
              return document.execCommand('insertorderedlist', false, null);
            }
          }, {
            keys: 'Ctrl+q',
            method: function() {
              return methods.formatblock.apply(this, ["<blockquote>"]);
            }
          }, {
            keys: 'Ctrl+Alt+k',
            method: function() {
              return methods.formatblock.apply(this, ["<pre>"]);
            }
          }, {
            keys: 'Ctrl+.',
            method: function() {
              return document.execCommand('superscript', false, null);
            }
          }, {
            keys: 'Ctrl+Shift+.',
            method: function() {
              return document.execCommand('subscript', false, null);
            }
          }, {
            keys: 'Ctrl+Alt+0',
            method: function() {
              return methods.formatblock.apply(this, ["p"]);
            }
          }, {
            keys: 'Ctrl+b',
            method: function() {
              return document.execCommand('bold', false, null);
            }
          }, {
            keys: 'Ctrl+i',
            method: function() {
              return document.execCommand('italic', false, null);
            }
          }, {
            keys: 'Ctrl+Alt+1',
            method: function() {
              return methods.formatblock.apply(this, ["H1"]);
            }
          }, {
            keys: 'Ctrl+Alt+2',
            method: function() {
              return methods.formatblock.apply(this, ["H2"]);
            }
          }, {
            keys: 'Ctrl+Alt+3',
            method: function() {
              return methods.formatblock.apply(this, ["H3"]);
            }
          }, {
            keys: 'Ctrl+Alt+4',
            method: function() {
              return methods.formatblock.apply(this, ["H4"]);
            }
          }, {
            keys: 'Ctrl+m',
            method: function() {
              return document.execCommand("removeFormat", false, null);
            }
          }, {
            keys: 'Ctrl+u',
            method: function() {
              return document.execCommand('underline', false, null);
            }
          }, {
            keys: 'tab',
            method: function() {
              return document.execCommand('indent', false, null);
            }
          }, {
            keys: 'Ctrl+tab',
            method: function() {
              return document.execCommand('indent', false, null);
            }
          }, {
            keys: 'Shift+tab',
            method: function() {
              return document.execCommand('outdent', false, null);
            }
          }
        ];
        $.each(shortcuts, function(index, elem) {
          return shortcut.add(elem.keys, function() {
            elem.method();
            return false;
          }, {
            'type': 'keydown',
            'propagate': false
          });
        });
        return this.each(function() {
          var $this, data, tooltip;
          $this = $(this);
          data = $this.data('fresheditor');
          tooltip = $('<div/>', {
            text: $this.attr('title')
          });
          if (!data) {
            return $(this).data('fresheditor', {
              target: $this,
              tooltip: tooltip
            });
          }
        });
      }
    };
    return $.fn.freshereditor = function(method) {
      if (methods[method]) {
        methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === 'object' || !method) {
        methods.init.apply(this, arguments);
      } else {
        $.error('Method ' + method + ' does not exist on jQuery.contentEditable');
      }
    };
  })(jQuery);
}).call(this);
