"use strict"

define([
  "backbone",
  "underscore",
  "handlebars",
  "markdown",
  "mousetrap",
  "select2",
  "jquery",
  "models/session",
  "collections/label-list",
  "text!templates/edit-view.html"
], function(Backbone, _, Handlebars, Markdown,
  Mousetrap, Select2, $, session,
  labelList, editTemplate) {

  session = session.getSession();

  var Editor = Backbone.View.extend({

    el: "#content",

    template: Handlebars.compile(editTemplate),

    initialize: function() {
      // mod is a generic helper that sets cross platform shortcut
      // maps to cmd for Mac and ctrl for Windows and Linux
      Mousetrap.bind("mod+s", _.bind(this.save, this));
      Mousetrap.bind("mod+h", _.bind(this.highlightTitle, this));
      Mousetrap.bind("mod+b", _.bind(this.boldText, this));
      Mousetrap.bind("mod+i", _.bind(this.italicizeText, this));
      Mousetrap.bind("mod+l", _.bind(this.linkText, this));
      Mousetrap.bind("tab", _.bind(this.indentText, this));
      Mousetrap.bind("mod+shift+c", _.bind(this.formatCodeBlock, this));
      Mousetrap.bind("mod+shift+x", _.bind(this.formatCodeInline, this));
      Mousetrap.bind("mod+shift+l", _.bind(this.formatList, this));
      this.model.fetch({
        success: _.bind(this.render, this)
      });
      this.previewVisible = false;
      this.saveTimerId = null;
    },

    events: {
      "click a.show-preview": "openPreview",
      "click a.hide-preview": "closePreview",
      "keyup textarea": "updatePreviewAndAutoSave",
      "click #urlModal button": "hideModal",
      "click #save": "save"
    },

    postInitialize: function() {
      // Setup searching
      this.setupLabelSearch();
      this.setupFileSearch();
      this.$("textarea").focus();
      // select2 issue #1436
      $.fn.modal.Constructor.prototype.enforceFocus = function() {};
    },

    setupLabelSearch: function() {
      var labelsEl = this.$("#labels");
      var format = function(item) {
        return item.name;
      };
      labelsEl.select2({
        multiple: true,
        width: "copy",
        ajax: {
          url: session.getBaseUrl() + "/api/labels",
          dataType: "json",
          data: function(term, page) {
            return {q: term};
          },
          results: function(data, page) {
            return {
              results: data,
              text: "name"
            };
          }
        },
        formatResult: format,
        formatSelection: format
      });
      // Set existing labels
      labelsEl.select2("data", this.model.get("labels"));
    },

    setupFileSearch: function() {
      var format = function(item) {
        return item.title;
      };
      this.$("#url").select2({
        id: function(obj) {
          return session.getBlogUrl() + "/file/" + obj.id;
        },
        ajax: {
          url: session.getBaseUrl() + "/api/files/search",
          dataType: "json",
          data: function(term, page) {
            return {q: term};
          },
          results: function(term, page) {
            return {
              results: term,
              text: "title"
            };
          }
        },
        formatSelection: format,
        formatResult: format
      });
    },

    replaceText: function(sStartTag, sEndTag, cb) {
      var oMsgInput = this.$("textarea")[0],
        nSelStart = oMsgInput.selectionStart,
        nSelEnd = oMsgInput.selectionEnd,
        sOldText = oMsgInput.value,
        sHighlightedText = sOldText.substring(nSelStart, nSelEnd);
        sHighlightedText = (cb) ? cb(sHighlightedText) : sHighlightedText;
      oMsgInput.value = sOldText.substring(0, nSelStart) +
        sStartTag + sHighlightedText + sEndTag +
        sOldText.substring(nSelEnd);
      oMsgInput.setSelectionRange(nSelStart + sStartTag.length,
        nSelEnd + sStartTag.length);
      oMsgInput.focus();
    },

    getLineFormatClosure: function(iterator) {
      return function(text) {
        return text.split("\n").map(function(line) {
          return iterator(line);
        }).join("\n");
      };
    },

    getAnimatorClosure: function(el) {
      return function(model) {
        el.slideDown();
        setTimeout(function() {
          el.slideUp();
        }, 1000);
      };
    },

    formatCodeBlock: function(e) {
      e.preventDefault();
      this.replaceText("", "",
        this.getLineFormatClosure(function(line) {
          // 4 spaces
          return "    " + line;
        })
      );
    },

    formatCodeInline: function(e) {
      e.preventDefault();
      this.replaceText("`", "`");
    },

    formatList: function(e) {
      e.preventDefault();
      this.replaceText("", "",
        this.getLineFormatClosure(function(line) {
          return "* " + line;
        })
      );
    },

    indentText: function(e) {
      e.preventDefault();
      this.replaceText("", "",
        this.getLineFormatClosure(function(line) {
          // 2 spaces
          return "  " + line;
        })
      );
    },

    boldText: function(e) {
      e.preventDefault();
      this.replaceText("**", "**");
    },

    italicizeText: function(e) {
      e.preventDefault();
      this.replaceText("_", "_");
    },

    hideModal: function(e) {
      this.$("#urlModal").modal("hide");
    },

    linkText: function(e) {
      e.preventDefault();
      var that = this;
      this.$("#urlModal")
        .modal("show")
        .one("hidden.bs.modal", function (e) {
        that.replaceText("[","](" + that.$("#url").val() + ")");
      });
    },

    openPreview: function() {
      this.previewVisible = true;
      this.updatePreview();
    },

    updatePreview: function() {
      if (!this.previewVisible) {
        return;
      }
      var previewEl = this.$("#editing-preview");
      var previewContentEl = previewEl.find(".panel-body");
      var textareaEl = this.$("textarea");
      previewContentEl.html(Markdown.toHTML(textareaEl.val()));
      previewEl.slideDown(400);
    },

    highlightTitle: function(e) {
      e.preventDefault();
      this.$("#title").select();
    },

    autoSave: function() {
      if (this.saveTimerId) {
        clearTimeout(this.saveTimerId);
      }
      this.saveTimerId = setTimeout(_.bind(
        this.save, this,
        null, true), 10000);
    },

    updatePreviewAndAutoSave: function() {
      this.updatePreview();
      this.autoSave();
    },

    closePreview: function() {
      this.previewVisible = false;
      this.$("#editing-preview").slideUp(400);
    },

    save: function(e, noAlert) {
      if (e) {
        e.preventDefault();
      }
      var labelsEl = this.$("#labels");
      var textareaEl = this.$("textarea");
      var titleEl = this.$("#title");
      var notificationEl = this.$(".notification");

      var newLabelIds = labelList.getIds(labelsEl.val().split(","));
      var oldLabelIds = labelList.getIds(this.model.get("labels"));
      var content = textareaEl.val();
      var title = titleEl.val();
      var newLabels = this.$("#labels").select2("data");

      var attr = {
        title: title,
        content: content,
        labels: newLabels,
        add_labels: labelList.getAdded(oldLabelIds, newLabelIds),
        delete_labels: labelList.getDeleted(oldLabelIds, newLabelIds)
      };

      var options = {
        wait: true,
      };

      // First comparison a workaround for mousetrap combo arg
      if (typeof noAlert === "string" || !noAlert) {
        var successAlertEl = notificationEl.find(".alert-success");
        var errorAlertEl = notificationEl.find(".alert-danger");
        options.success = this.getAnimatorClosure(successAlertEl);
        options.error = this.getAnimatorClosure(errorAlertEl);
      }

      this.model.save(attr, options);
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      this.postInitialize();
      return this;
    }
  });

  return Editor;
});

