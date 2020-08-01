//Main Book Content.
define([
  'jquery',
  'underscore',
  'backbone',
  'fancybox',
  'mespeak',
  '/javascripts/models/image.js',
  '/javascripts/models/alt.js',
  '/javascripts/views/edit_image.js',
  '/javascripts/views/duplicate_image.js',
  '/javascripts/views/image.js'
], function($, _, Backbone, fancybox, mespeak, ImageModel, Alt, EditImageView, DuplicateImageView, ImageView){
  var BookContentView = Backbone.View.extend({
    el: $('#book_content'),

    initialize: function() {
      //initialize meSpeak
      meSpeak.loadConfig("/javascripts/libs/mespeak/mespeak_config.json"); 
      meSpeak.loadVoice('/javascripts/libs/mespeak/voices/en/en-us.json'); 
    },

    render: function() {
      var contentView = this;
      var bookUrl = "/edit_book/content?book_id=" + $("#book_id").val() + "&book_fragment_id=" + $("#book_fragment_id").val();
      $.get(bookUrl, function(html) {
        var book = $('<html />').html(html);
        $(book).find("link").remove();
        $(book).find("img").attr("src", "");
        // .html strips illegal elements out (html, head, etc)
        contentView.$el.html(book.html());
        contentView.renderImages();
      });
    },

    renderImages: function() {
      var contentView = this;
      _.each(contentView.collection.models, function(image, i) {
        //Output form for first instance of image.
        contentView.outputEditForm(image, i);

        //handle all duplicates.
        contentView.renderDuplicates(image);
      });
    },

    outputEditForm: function(image, i) {
      var contentView = this;
      //Handle the first one.
      var domImage = $("img[img-id='" + image.get("id") + "']:first");
      var editImage = new EditImageView();
      image.set({path: image.get("image_source")});
      if (image.has("current_alt") && typeof(image.get("current_alt") != "undefined")) {
        image.set({alt: image.get("current_alt").alt});
      } else {
        image.set({alt: domImage.attr("alt")});
        //Set a listener to create the source record if a new one is created.
        editImage.sourceAlt = new Alt({alt: domImage.attr("alt"), dynamic_image_id: image.get("id"), from_source: true});
      }
      
      //See if the images parent div has a class of imggroup
      var parent = $(domImage).parent().eq(0);
      if ($(parent).hasClass("imggroup")) {
        var captionElement = $(".caption", parent);
        if (captionElement.length != 0) {
          image.set({caption: $(captionElement).text()});
        }
      } else if ($(parent).prop("tagName") == "figure") {
        var captionElement = $("figcaption", parent);
        if (captionElement.length != 0) {
          image.set({caption: $(captionElement).text()});
        }
      }
      editImage.model = image;
      editImage.previousImage = contentView.collection.models[i-1];
      editImage.nextImage = contentView.collection.models[i+1];
      var editDiv = editImage.render();
      var imageView = new ImageView();
      imageView.model = image;
      imageView.render();
      $(".domImage", editDiv.el).html(imageView.el);
      domImage.replaceWith(editDiv.el);
    },

    renderDuplicates: function(image) {
      var dupeImage = new DuplicateImageView();
      var template = dupeImage.render();
      var duplicates = $("img[img-id='" + image.get("id") + "']:not(:eq(0))");
      duplicates.each(function() {
        var domImage = $(this);
        domImage.attr("src", image.get("image_source"));
        $(".duplicate-container", dupeImage.el).prepend(domImage.clone());
        domImage.replaceWith(dupeImage.el);
      });
    }

  });
  return BookContentView;
});
