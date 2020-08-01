
        // Resizing Methods
        // ================

        // Resize Method
        // -------------
        // **Public method** that is used to resize the plugin.
        // Whether the *index or lightbox module* is resized, depends on
        // what is currently active (have a look at the `indexState` and
        // `lightboxState` properties).
        resize: function(cb) {

          var self        = this,
              winWidth    = $(window).width(),
              winHeight   = $(window).height(),
              docWidth    = winWidth  -
                ((winWidth < 451 || winHeight < 400) ?
                  this.options.lightbox.padding.horizontalMobile :
                  this.options.lightbox.padding.horizontal),
              docHeight   = winHeight -
                ((winWidth < 451 || winHeight < 400) ?
                  this.options.lightbox.padding.verticalMobile :
                  this.options.lightbox.padding.vertical),
              currentImg, imgWidth, imgHeight;

          cb = typeof cb === "function" ? cb : false;

          // Resize the *index module*, if this module is currently active.
          if (this.indexState === "opened") {

            this._resizeIndex("current");

            // inline or general resize callback
            if (cb) {
              cb();
            } else if (typeof self.options.callbacks.resize === "function") {
              self.options.callbacks.resize();
            }

            this._debug("info", "Index module has been resized.");

          // Resize *lightbox module*, if it is currently active.
          } else if (this.lightboxState === "opened") {

            this.$lightboxCaptionContainer.hide();

            // Obtain the current image of the deck so that everything can
            // be resized according to its properties.
            currentImg  = this.currentDeck.items[this.currentIndex];

            if (currentImg) {

              imgWidth  = currentImg.width;
              imgHeight = currentImg.height;

              // Fix for small devices and full screen mode, as `$(window).height()`
              // calculates a *wrong value*.
              /*if (winWidth < 360) {
                docWidth = 280;

                if (window.innerHeight > winHeight) {
                  docHeight = window.innerHeight -
                    this.options.lightbox.padding.vertical;
                }

                // Annoying iOS address bar (hiding or not).
                if (self.prevScrollPosition.length === 0) {
                  this.prevScrollPosition = [$(document).scrollLeft(), $(document).scrollTop()];
                }

                setTimeout(function() {
                  window.scrollTo(0, 0);
                }, 500);

              }*/


              if (imgWidth > docWidth) {
                imgWidth  = docWidth;
                imgHeight = imgWidth * currentImg.ratio;
              }

              if (imgHeight > docHeight) {
                imgHeight = docHeight;
                imgWidth  = imgHeight * 1 / currentImg.ratio;
              }


              this._resizeLightboxCaptions(imgWidth);

              if (typeof Modernizr !== "undefined" &&
                  Modernizr.csstransitions) {

                this.$lightboxDecksContainer.css({
                  width:         imgWidth,
                  height:        imgHeight,
                  marginLeft:   -imgWidth/2,
                  marginTop:    -imgHeight/2
                });
                this.$lightboxCaptionContainer.show();

                // inline or general resize callback
                if (cb) {
                  cb();
                } else if (typeof self.options.callbacks.resize === "function") {
                  self.options.callbacks.resize();
                }

              } else {

                this.$lightboxDecksContainer.stop(true, false).animate({
                  width:         imgWidth,
                  height:        imgHeight,
                  marginLeft:   -imgWidth/2,
                  marginTop:    -imgHeight/2
                }, this.options.transitions.fadeLightboxItem, function() {
                  self.$lightboxCaptionContainer.show();

                  // inline or general resize callback
                  if (cb) {
                    cb();
                  } else if (typeof self.options.callbacks.resize === "function") {
                    self.options.callbacks.resize();
                  }

                });

              }

              this._debug("info", "Lightbox module has been resized.");

            } else {

              this._debug("error", "The current item of the Lightbox module " +
                "does not exist!");

            }

          }

        },


        // Resize Index Method
        // -------------------
        // **Private method** that is used to resize the *index module*.
        // If the `layout` was set to `"masonry"` and the masonry plugin
        // is available, it also resizes the masonry.
        _resizeIndex: function(type) {

          var self = this,
              wrapperVisible = this.$indexWrapper.is(":visible"),
              classNames     = this.options.classNames,
              func           = function() {
                  var $deck = $(this),
                    visible = $deck.is(":visible");

                if (!visible) {
                  $deck.show();
                }

                self._resizeIndexCaptions($deck);

                if ($.fn.masonry && self.options.index.layout === "masonry" &&
                    self.initMasonry) {
                  $deck.masonry("resize");
                }

                if (!visible) {
                  $deck.hide();
                }
              };


          if (!wrapperVisible) {
            this.$indexWrapper.show();
          }


          if (type === "all") {

            this.$indexDecksContainer
              .find("." + classNames.indexDeck)
              .each(func);

          } else if (type === "current") {

            this.$indexDecksContainer
              .find("#" + classNames.indexDeck + "-" + this.currentDeck.id)
              .each(func);

          }


          if (!wrapperVisible) {
            this.$indexWrapper.hide();
          }

        },


        // Resize Index Captions
        // ---------------------
        // **Private method** that adjusts the index thumb captions
        // according to the defined position.
        _resizeIndexCaptions: function($deck) {

          var self = this,
              position   = this.options.index.thumb.captionPosition,
              classNames = this.options.classNames;


          if (position === "above") {

            $deck
              .find("." + classNames.indexItem)
              .each(function() {

                var $me      = $(this),
                    $caption = $me.find("." + classNames.indexItemCaption),
                    height   = $caption.height() + self.options.index.thumb.captionVerticalMargin;


                $me.css("marginTop", "");
                $me.css({ "marginTop": parseInt($me.css("marginTop")) + height });
                $caption.css({ "top": - height });

              });

          } else if (position === "center") {

            $deck
              .find("." + classNames.indexItemCaption)
              .each(function() {

                var $me = $(this);
                $me.css({ "marginTop": - $me.height() / 2 });

              });

          } else if (position === "below") {

            $deck
              .find("." + classNames.indexItem)
              .each(function() {

                var $me      = $(this),
                    $caption = $me.find("." + classNames.indexItemCaption),
                    height   = $caption.height() + self.options.index.thumb.captionVerticalMargin;


                $me.css("marginBottom", "");
                $me.css({ "marginBottom": parseInt($me.css("marginBottom")) + height });
                $caption.css({ "bottom": - height });

              });

          }

        },


        // Resize Lightbox Captions
        // ------------------------
        // **Private method** that adjusts the lightbox captions
        // according to the defined position.
        _resizeLightboxCaptions: function(imgWidth) {

          var position       = this.options.lightbox.img.captionPosition,
              verticalMargin = this.options.lightbox.img.captionVerticalMargin,
              captionHeight, diffHeight;

          this.$lightboxCaptionContainer
            .css({ "width": imgWidth })
            .show();

          this.$lightboxCaptionLeft.css("height", "auto");
          this.$lightboxCaptionCenter.css("height", "auto");
          this.$lightboxCaptionRight.css("height", "auto");

          captionHeight = Math.max(
            this.$lightboxCaptionLeft.height(),
            this.$lightboxCaptionCenter.height(),
            this.$lightboxCaptionRight.height()
          );

          this.$lightboxCaptionLeft.css("height", "100%");
          this.$lightboxCaptionCenter.css("height", "100%");
          this.$lightboxCaptionRight.css("height", "100%");


          if (position === "above" || position === "below") {

            diffHeight = (captionHeight + 2 * verticalMargin) -
              (this.options.lightbox.padding.vertical / 2);

            if (diffHeight > 0) {
              captionHeight -= diffHeight;
            }

          }

          if (position === "above") {

            this.$lightboxCaptionContainer
              .css({ "top": - (captionHeight + verticalMargin) });

          } else if (position === "center") {

            this.$lightboxCaptionContainer
              .css({ "marginTop": - captionHeight / 2 });

          } else if (position === "below") {

            this.$lightboxCaptionContainer
              .css({ "bottom": - (captionHeight + verticalMargin) });

          }


          this.$lightboxCaptionContainer
            .css({ "width": "", "height": captionHeight })
            .hide();

        },
