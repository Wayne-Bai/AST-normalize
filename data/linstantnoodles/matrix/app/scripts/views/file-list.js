"use strict";

define([
  "backbone",
  "underscore",
  "handlebars",
  "views/file",
  "views/pagination",
  "text!templates/file-list-view.html",
  "moment"
], function(Backbone, _, Handlebars,
  fileView, paginationView, filelistTemplate,
  moment) {

  var Filelist = Backbone.View.extend({

    el: "#file-list",

    template: Handlebars.compile(filelistTemplate),

    initialize: function() {
      this.listenTo(this.collection, "reset", this.render);
      this.listenTo(this.collection, "change", this.reRender);
      this.listenTo(this.collection, "add", this.reRender);
      this.listenTo(this.collection, "pagination:update", this.reRender);
      this.collection.fetch({reset: true});
      Handlebars.registerHelper("formatDatetime", function(datetime) {
        return moment(datetime).fromNow();
      });
      Handlebars.registerHelper("hasFiles", function(files) {
        return (files.length > 0) ? true : false;
      });
      this.pagination = new paginationView({collection: this.collection});
      // Keep updated
      setInterval(_.bind(this.collection.fetch, this.collection), 10000);
      this.previewOn = false;
    },

    events: {
      "click .delete-file": "deleteFile",
      "click .toggle-publish": "togglePublish",
      "click .view-file": "viewFile"
    },

    viewFile: function(ev) {
      var linkEl = this.$(ev.target);
      var modalEl = this.$("#preview-modal");
      modalEl
        .find(".modal-content")
        .html(
          new fileView({
            model: this.collection.get(linkEl.data("id"))
          }).render().el
        );
      modalEl.modal("show");
      this.previewOn = true;
      // Turn off preview
      modalEl.one("hidden.bs.modal", _.bind(function() {
        this.previewOn = false;
      }, this));
    },

    deleteFile: function(ev) {
      var linkEl = this.$(ev.target);
      var confirmEl = this.$("#confirm-modal .confirm");
      var noConfirmEl = this.$("#confirm-modal .no-confirm");
      confirmEl.one("click", _.bind(function() {
        noConfirmEl.off("click");
        linkEl.parents("tr").fadeOut(300);
        this.collection
          .get(linkEl.data("id"))
          .destroy({wait: true});
      }, this));
      noConfirmEl.one("click", function() {
        confirmEl.off("click");
      });
    },

    togglePublish: function(ev) {
      this.collection
        .get(this.$(ev.target).data("id"))
        .togglePublish();
    },

    reRender: function() {
      // Don't render while preview is on
      if (!this.previewOn) {
        this.render();
      }
    },

    render: function() {
      var models = this.collection.models;

      var files = (this.pagination) ?
        this.pagination.getPageFiles() :
        _.map(models, function(model) {
        return model.attributes;
      });

      this.$el.html(this.template({
        files: files,
        hasFiles: (files.length > 0) ? true : false
      }));

      this.$("table").after(this.pagination.render().el);
      // Redelegate b.c pagination el gets wiped
      this.pagination.delegateEvents();
      this.$el.hide().fadeIn(300);
      return this;
    }
  });

  return Filelist;
});

