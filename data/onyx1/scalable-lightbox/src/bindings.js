
        // Binding Methods
        // ===============

        // Bind Method
        // -----------
        // **Private method**, wrapper for event binding which has to be
        // deactivated when the plugin is closed again.
        _bind: function(unbind) {

          unbind = (typeof unbind === "undefined") ? false : unbind;

          this._bindKeys(unbind);
          this._bindResize(unbind);
          this._bindCaptionLinks(unbind);

        },


        // Bind Keys Method
        // ----------------
        // **Private method**, for binding keyboard events.
        _bindKeys: function(unbind) {

          var self = this;

          if (unbind) {

            if ((this.options.index.enabled &&
                 this.options.index.controls.close) ||
                (this.options.lightbox.enabled &&
                 this.options.lightbox.controls.keys)) {

              $(window.document).unbind("keydown.scalableLightbox.navi");
              $(window.document).unbind("keydown.scalableLightbox.close");

              this._debug("info", "Unbinding keyboard events.");
              this.binded.keys = false;

            }

          } else if (!this.binded.keys) {

            if ((this.options.lightbox.enabled &&
                 this.options.lightbox.controls.keys)) {

              $(window.document)
                .bind("keydown.scalableLightbox.navi", function(event) {

                  switch (event.keyCode) {

                  case 37: // left arrow
                    if (self.lightboxState === "opened") {
                      self.prev();
                    }
                    break;

                  case 39: // right arrow
                    if (self.lightboxState === "opened") {
                      self.next();
                    }
                    break;

                  }

                });

            }


            if ((this.options.index.enabled &&
                 this.options.index.controls.keys) ||
                (this.options.lightbox.enabled &&
                 this.options.lightbox.controls.keys)) {

              $(window.document)
                .bind("keydown.scalableLightbox.close", function(event) {

                  switch (event.keyCode) {

                  case 27: // esc btn
                    if ((self.indexState === "opened" &&
                         self.options.index.controls.close) ||
                        (self.lightboxState === "opened" &&
                         self.options.lightbox.controls.close)) {

                      self.close();
                    }
                    break;

                  }

                });

              this._debug("info", "Binded key events.");
              this.binded.keys = true;

            }

          }

        },


        // Bind Resize Method
        // ------------------
        // **Private method**, for binding the window resize event.
        _bindResize: function(unbind) {

          var self    = this,
              defined = false,
              resizeTimeout;

          if (unbind) {

            // Unbind regular resize or `"smartresize"`.
            if (this.options.resize) {

              $(window).unbind("resize.scalableLightbox");
              this._debug("info", "Unbinding resize event.");
              this.binded.resize = false;

            }

          } else if (!this.binded.resize) {

            if (this.options.resize === "smartresize") {

              $(window).bind("resize.scalableLightbox", function() {

                if (resizeTimeout) {
                  clearTimeout(resizeTimeout);
                }

                resizeTimeout = setTimeout(function() {
                  self.resize();
                }, 200);
              });

              defined = true;

            } else if (this.options.resize) {

              $(window).bind("resize.scalableLightbox", function() {
                self.resize();
              });

              defined = true;

            }

            if (defined) {

              this.binded.resize = true;
              this._debug("info", "Binded resize event.");

            }

          }

        },


        // Bind Click Method
        // -----------------
        // **Private method**, for binding click events.
        _bindClicks: function(unbind) {

          var self       = this,
              defined    = false,
              classNames = this.options.classNames,
              funcAlt    = function() {

                if (unbind) {

                  if (self.options.index.enabled &&
                      self.options.index.controls.close) {

                    self.$indexWrapper
                      .off("click.scalableLightbox.indexClose");

                    defined = true;

                  }


                  if (self.options.lightbox.enabled &&
                      self.options.lightbox.controls.close) {

                    self.$lightboxWrapper
                      .off("click.scalableLightbox.lightboxClose");

                    defined = true;

                  }

                  if (self.options.lightbox.enabled &&
                      self.options.lightbox.controls.clicks) {

                    self.$lightboxDecksContainer
                      .off("click.scalableLightbox.lightboxItem");

                    self.$lightboxWrapper
                      .off("click.scalableLightbox.leftCursor");

                    self.$lightboxWrapper
                      .off("click.scalableLightbox.rightCursor");

                    defined = true;

                  }

                  if (defined) {

                    self._debug("info", "Unbinding click events.");
                    self.binded.clicks = false;

                  }

                } else if (!self.binded.clicks) {

                  if (self.options.index.enabled &&
                      self.options.index.controls.close) {

                    self.$indexWrapper
                      .on("click.scalableLightbox.indexClose", function() {
                        self.close();
                      });

                    defined = true;

                  }


                  if (self.options.lightbox.enabled &&
                      self.options.lightbox.controls.close) {

                    self.$lightboxWrapper
                      .on("click.scalableLightbox.lightboxClose", function() {
                        self.close();
                      });

                      defined = true;

                  }

                  if (self.options.lightbox.enabled &&
                      self.options.lightbox.controls.clicks) {

                    self.$lightboxDecksContainer
                      .on(
                        "click.scalableLightbox.lightboxItem",
                        "." + classNames.lightboxItem,
                        function(event) {
                          event.stopPropagation();
                        }
                      );

                    self.$lightboxWrapper
                      .on(
                        "click.scalableLightbox.leftCursor",
                        "." + classNames.lightboxCursor + ".left",
                        function(event) {
                          event.stopPropagation();
                          self.prev();
                        }
                      );

                    self.$lightboxWrapper
                      .on(
                        "click.scalableLightbox.rightCursor",
                        "." + classNames.lightboxCursor + ".right",
                        function(event) {
                          event.stopPropagation();
                          self.next();
                        }
                      );

                    defined = true;

                  }

                  if (defined) {

                    self._debug("info", "Binded click events.");
                    self.binded.clicks = true;

                  }

                }

              };


          if (typeof window.define === "function" && window.define.amd &&
              typeof Modernizr !== "undefined" &&
              Modernizr.touch) {

            require(["hammer"], function() {
              self._bindTouch(unbind);
            }, function() {
              funcAlt();
            });

          } else if ($.fn.hammer &&
                     typeof Modernizr !== "undefined" &&
                     Modernizr.touch) {

            this._bindTouch(unbind);

          } else {

            funcAlt();

          }

        },


        // Bind Touch Method
        // -----------------
        // **Private method**, for binding touch events on the *lightbox module*
        // (swipe left or right for displaying previous or next deck item).
        _bindTouch: function(unbind) {

          var self       = this,
              defined    = false,
              classNames = this.options.classNames;


          if (unbind) {

            if (this.options.index.enabled) {

              if(this.options.index.controls.close) {

                this.$indexWrapper
                  .hammer()
                  .off("tap.scalableLightbox.indexClose");

              }

              this.$indexWrapper
                .hammer()
                .off("drag.scalableLightbox.indexInner swipe.scalableLightbox.indexInner");

              this.$indexWrapper
                .hammer()
                .off("drag.scalableLightbox.indexOuter swipe.scalableLightbox.indexOuter");

              defined = true;

            }

            if (this.options.lightbox.enabled) {

              if(this.options.lightbox.controls.close) {

                this.$lightboxWrapper
                  .hammer()
                  .off("tap.scalableLightbox.lightboxClose");

              }

              this.$lightboxWrapper
                .hammer()
                .off("tap.scalableLightbox.leftCursor tap.scalableLightbox.rightCursor");

              this.$lightboxWrapper
                .hammer()
                .off("drag.scalableLightbox.navi");

              this.$lightboxDecksContainer
                .hammer()
                .off("swipe.scalableLightbox.navi");

              defined = true;

            }

            if (defined) {

              this._debug("info", "Unbinding touch events.");
              this.binded.touch = false;

            }

          } else if (!this.binded.touch) {

            if (this.options.index.enabled) {

              if(this.options.index.controls.close) {

                this.$indexWrapper
                  .hammer()
                  .on(
                    "tap.scalableLightbox.indexClose",
                    function(event) {
                      event.gesture.preventDefault();
                      self.close();
                    }
                  );

              }


              // Make index decks container scrollable.
              this.$indexWrapper
                .hammer()
                .on(
                  "drag.scalableLightbox.indexInner swipe.scalableLightbox.indexInner",
                  "." + classNames.indexDecksContainer,
                  function(event) {
                    event.stopPropagation();
                  }
                );

              // But disallow page scrolling of underlying divs in iOS.
              this.$indexWrapper
                .hammer()
                .on(
                  "drag.scalableLightbox.indexOuter swipe.scalableLightbox.indexOuter",
                  function(event) {
                    event.gesture.preventDefault();
                    event.gesture.stopPropagation();
                  }
                );

              defined = true;

            }

            if (this.options.lightbox.enabled) {

              if(this.options.lightbox.controls.close) {

                this.$lightboxWrapper
                  .hammer()
                  .on(
                    "tap.scalableLightbox.lightboxClose",
                    function(event) {
                      event.gesture.preventDefault();
                      self.close();
                    }
                  );

              }

              this.$lightboxWrapper
                .hammer()
                .on(
                  "tap.scalableLightbox.leftCursor",
                  "." + classNames.lightboxCursor + ".left",
                  function(event) {
                    event.stopPropagation();
                    self.prev();
                  }
                );

              this.$lightboxWrapper
                .hammer()
                .on(
                  "tap.scalableLightbox.rightCursor",
                  "." + classNames.lightboxCursor + ".right",
                  function(event) {
                    event.stopPropagation();
                    self.next();
                  }
                );

              this.$lightboxWrapper
                .hammer()
                .on(
                  "drag.scalableLightbox.navi",
                  function(event) {

                    if (event.target.className === "left" ||
                        event.target.className === "center" ||
                        event.target.className === "right") {

                      event.gesture.stopPropagation();

                    } else {

                      event.gesture.stopPropagation();
                      event.gesture.preventDefault();

                    }
                  }
                );

              this.$lightboxDecksContainer
                .hammer({ swipeVelocityX: 0.4 })
                .on(
                  "swipe.scalableLightbox.navi",
                  function(event) {
                    event.gesture.preventDefault();
                    event.gesture.stopPropagation();

                    switch (event.gesture.direction) {

                    case "left":
                      self.next();
                      break;

                    case "right":
                      self.prev();
                      break;

                    }
                  }

                );

              defined = true;

            }


            if (defined) {

              this._debug("info", "Binded touch events.");
              this.binded.touch = true;

            }

          }

        },


        // Bind Index Link Method
        // ----------------------
        // **Private method**, for binding links in the lightbox caption which
        // navigate to the *index module*.
        _bindIndexLink: function(unbind) {

          var self       = this,
              classNames = this.options.classNames,
              func       = function() {

                if (unbind) {

                  self.$lightboxWrapper
                    .hammer()
                    .off("tap.scalableLightbox.indexItem");

                } else {

                  self.$lightboxWrapper
                    .hammer()
                    .on(
                      "tap.scalableLightbox.indexItem",
                      "a." + classNames.lightboxIndexLink,
                      function(event) {
                        event.stopPropagation();

                        self.open({
                          module:   "index",
                          deck:     self.currentDeck.id
                        });
                      }
                    );

                }

              },
              funcAlt    = function() {

                if (unbind) {

                  self.$lightboxWrapper
                    .off("click.scalableLightbox.indexItem");

                } else {

                  self.$lightboxWrapper
                    .on(
                      "click.scalableLightbox.indexItem",
                      "a." + classNames.lightboxIndexLink,
                      function(event) {
                        event.preventDefault();
                        event.stopPropagation();

                        self.open({
                          module:   "index",
                          deck:     self.currentDeck.id
                        });
                      }
                    );

                }

              };


          if (typeof window.define === "function" && window.define.amd &&
              typeof Modernizr !== "undefined" &&
              Modernizr.touch) {

            require(["hammer"], function() {
              func();
            }, function() {
              funcAlt();
            });

          } else if ($.fn.hammer &&
                     typeof Modernizr !== "undefined" &&
                     Modernizr.touch) {

            func();

          } else {

            funcAlt();

          }

        },


        // Bind Index Item Method
        // ----------------------
        // **Private method**, for binding links on the thumbs in the *index module*
        // that navigate to the corresponding item in the *lightbox module*.
        _bindThumbLinks: function(unbind) {

          var self       = this,
              classNames = this.options.classNames,
              func       = function() {

                if (unbind) {

                  self.$indexWrapper
                    .hammer()
                    .off("tap.scalableLightbox.thumbLinks");

                } else {

                  self.$indexWrapper
                    .hammer()
                    .on(
                      "tap.scalableLightbox.thumbLinks",
                      "." + classNames.indexItem,
                      function(event) {
                        event.gesture.stopPropagation();

                        if (self.options.lightbox.enabled) {

                            self.open({
                              module:   "lightbox",
                              deck:     self.currentDeck.id,
                              index:    $(this).index()
                            });

                        } else {

                          self._debug("error", "The lightbox module cannot be opened, because it "+
                            "is not enabled!");

                        }
                      }
                    );

                }

              },

              funcAlt    = function() {

                if (unbind) {

                  self.$indexWrapper.off("click.scalableLightbox.thumbLinks");

                } else {

                  self.$indexWrapper
                    .on(
                      "click.scalableLightbox.thumbLinks",
                      "." + classNames.indexItem,
                      function(event) {
                        event.preventDefault();
                        event.stopPropagation();

                        if (self.options.lightbox.enabled) {

                          self.open({
                            module:   "lightbox",
                            deck:     self.currentDeck.id,
                            index:    $(this).index()
                          });

                        } else {

                          self._debug("error", "The lightbox module cannot be opened, because it "+
                            "is not enabled!");

                        }
                      }
                    );

                }
              };


          if (typeof window.define === "function" && window.define.amd &&
              typeof Modernizr !== "undefined" &&
              Modernizr.touch) {

            require(["hammer"], function() {
              func();
            }, function() {
              funcAlt();
            });

          } else if ($.fn.hammer &&
                     typeof Modernizr !== "undefined" &&
                     Modernizr.touch) {

            func();

          } else {

            funcAlt();

          }

        },


        // Bind Caption Links Method
        // -------------------------
        // **Private method**, for binding links in caption which come from the content
        // and should not bubble up to the parent element (closing the *index* or *lightbox module*).
        _bindCaptionLinks: function(unbind) {

          var self       = this,
              classNames = this.options.classNames,
              func       = function() {

                if (unbind) {

                  if (self.options.index.enabled) {

                    self.$indexDecksContainer
                      .hammer()
                      .off("tap.scalableLightbox.indexCaptionLinks");

                  }

                  if (self.options.lightbox.enabled) {

                    self.$lightboxCaptionContainer
                      .hammer()
                      .off("tap.scalableLightbox.lightboxCaptionLinks");

                  }

                } else {

                  if (self.options.index.enabled) {

                    self.$indexDecksContainer
                      .hammer()
                      .on(
                        "tap.scalableLightbox.indexCaptionLinks",
                        "." + classNames.indexItemCaption + " a",
                        function(event) {
                          event.gesture.stopPropagation();
                        }
                      );

                  }

                  if (self.options.lightbox.enabled) {

                    self.$lightboxCaptionContainer
                      .hammer()
                      .on(
                        "tap.scalableLightbox.lightboxCaptionLinks",
                        "a:not(." + classNames.lightboxIndexLink + ")",
                        function(event) {
                          event.gesture.stopPropagation();
                        }
                      );

                  }

                }

              },
              funcAlt    = function() {

                if (unbind) {

                  if (self.options.index.enabled) {
                    self.$indexDecksContainer
                      .off("click.scalableLightbox.indexCaptionLinks");
                  }

                  if (self.options.lightbox.enabled) {
                    self.$lightboxCaptionContainer
                      .off("click.scalableLightbox.lightboxCaptionLinks");
                  }

                } else {

                  if (self.options.index.enabled) {

                    self.$indexDecksContainer
                      .on(
                        "click.scalableLightbox.indexCaptionLinks",
                        "." + classNames.indexItemCaption + " a",
                        function(event) {
                          event.stopPropagation();
                        }
                      );

                  }

                  if (self.options.lightbox.enabled) {

                    self.$lightboxCaptionContainer
                      .on(
                        "click.scalableLightbox.lightboxCaptionLinks",
                        "a:not(." + classNames.lightboxIndexLink + ")",
                        function(event) {
                          event.stopPropagation();
                        }
                      );

                  }

                }

              };

          if (typeof window.define === "function" && window.define.amd &&
              typeof Modernizr !== "undefined" &&
              Modernizr.touch) {

            require(["hammer"], function() {
              func();
            }, function() {
              funcAlt();
            });

          } else if ($.fn.hammer &&
                     typeof Modernizr !== "undefined" &&
                     Modernizr.touch) {

            func();

          } else {

            funcAlt();

          }
        },

