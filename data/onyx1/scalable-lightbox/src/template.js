
        // Template Methods
        // ================

        // Index Template
        // --------------
        // **Private method**, which creates the *index module* markup.
        _tmplIndex: function() {

          var classNames = this.options.classNames;

          // Add the index overlay div, if activated.
          if (this.options.index.overlay) {

            this.$indexOverlay = $("<div />")
              .addClass(classNames.indexOverlay);

            this.$container.append(this.$indexOverlay);

          }

          // Create index wrapper element.
          this.$indexWrapper = $("<div />")
            .addClass(classNames.indexWrapper);

          // Append decks container element to the index wrapper.
          this.$indexDecksContainer = $("<div />")
            .addClass(classNames.indexDecksContainer);

          if (this.options.index.layout === "float") {
            this.$indexDecksContainer
              .addClass(classNames.clearfix);
          }

          this.$indexWrapper.append(this.$indexDecksContainer);

          // Add everything to plugin's container element.
          this.$container.append(this.$indexWrapper);

          // Bind event delegation for links on the thumbnails.
          this._bindThumbLinks();

        },


        // Index Deck Template
        // -------------------
        // **Private method**, which creates a `deck` for the *index module*.
        _tmplIndexDeck: function(deck) {

          var classNames   = this.options.classNames,
              $div         = $("<div class=\"" + classNames.indexDeck + "\" " +
                               "id=\"" +classNames.indexDeck + "-" + deck.id + "\"></div>"),
              i = 0, total = deck.items.length;

          for (i; i < total; i++) {
            $div.append(this._tmplIndexItem(deck.items[i], i, total));
          }

          return $div;

        },


        // Index Item Template
        // -------------------
        // **Private method**, which adds an item to a `deck` of the *index module*.
        _tmplIndexItem: function(item, i, total) {

          var position   = this.options.index.thumb.captionPosition,
              classNames = this.options.classNames,
              $html      = $("<div class=\"" + classNames.indexItem + "\">" +
                "<div class=\"" + classNames.indexItemOverlay + "\"></div>" +
                "<div class=\"" + classNames.indexItemImg + "\">" +
                  "<div class=\"" + classNames.indexItemIndicator + "\"></div>" +
                "</div>" +
                "<div class=\"" + classNames.indexItemCaption + "\">" +
                  "<div class=\"" + classNames.indexItemCaptionInner + "\"></div>" +
                "</div>" +
              "</div>");


          if (!this.options.index.thumb.overlay) {
            $html.find("." + classNames.indexItemOverlay).remove();
          }

          if (position === "top" || position === "center" || position === "bottom") {
            $html.find("." + classNames.indexItemCaption).addClass(position);
          }

          $html.find("." + classNames.indexItemCaptionInner).html(
            this._getCaptionTxt(
              "index",
              this.options.index.thumb.caption,
              item,
              i,
              total
            )
          );

          $html.css({
            "height": this.options.index.thumb.width * item.ratio,
            "width":  this.options.index.thumb.width
          });

          return $html;

        },


        // Lightbox Template
        // -----------------
        // **Private method**, which creates the *lightbox module* markup.
        _tmplLightbox: function() {

          var position   = this.options.lightbox.img.captionPosition,
              classNames = this.options.classNames,
              $cursorLeft, $cursorRight;

          // Add the lightbox overlay, if activated.
          if (this.options.lightbox.overlay) {

            this.$lightboxOverlay = $("<div />")
              .addClass(classNames.lightboxOverlay);

            this.$container.append(this.$lightboxOverlay);

          }

          // Create lightbox wrapper element.
          this.$lightboxWrapper = $("<div />")
            .addClass(classNames.lightboxWrapper);

          // Append decks container element to the lightbox wrapper.
          this.$lightboxDecksContainer = $("<div />")
            .addClass(classNames.lightboxDecksContainer);

          this.$lightboxWrapper.append(this.$lightboxDecksContainer);


          // Add markup for click events (cursors), if enabled.
          if (this.options.lightbox.controls.clicks) {

            $cursorLeft = $("<div />")
              .addClass(classNames.lightboxCursor)
              .addClass("left");

            $cursorRight = $("<div />")
              .addClass(classNames.lightboxCursor)
              .addClass("right");


            this.$lightboxDecksContainer.append($cursorLeft);
            this.$lightboxDecksContainer.append($cursorRight);

          }


          // Append caption (left, center, right)
          this.$lightboxCaptionContainer = $("<div />")
            .addClass(classNames.lightboxItemCaptionContainer);

          if (position === "top" || position === "center" || position === "bottom") {
            this.$lightboxCaptionContainer.addClass(position);
          }


          this.$lightboxCaptionLeft   = $("<div />").addClass("left");
          this.$lightboxCaptionCenter = $("<div />").addClass("center");
          this.$lightboxCaptionRight  = $("<div />").addClass("right");

          this.$lightboxCaptionContainer.append(this.$lightboxCaptionLeft);
          this.$lightboxCaptionContainer.append(this.$lightboxCaptionCenter);
          this.$lightboxCaptionContainer.append(this.$lightboxCaptionRight);

          this.$lightboxDecksContainer.append(this.$lightboxCaptionContainer);

          // Add everything to plugin's container element.
          this.$container.append(this.$lightboxWrapper);

          // Bind event delegation for links on the index.
          this._bindIndexLink();

        },


        // Lightbox Deck Template
        // ----------------------
        // **Private method**, which creates a `deck` for the *lightbox module*.
        _tmplLightboxDeck: function(deck) {

          var classNames = this.options.classNames,
              $div = $("<div class=\"" + classNames.lightboxDeck + "\" " +
                       "id=\"" +classNames.lightboxDeck + "-" + deck.id + "\"></div>"),
              i = 0, total = deck.items.length;

          for (i; i < total; i++) {
            $div.append(
              "<div class=\"" + classNames.lightboxItem + "\">" +
                "<div class=\"" + classNames.lightboxItemIndicator + "\"></div>" +
              "</div>"
            );
          }

          return $div;

        },

