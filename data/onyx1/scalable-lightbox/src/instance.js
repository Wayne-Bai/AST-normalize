
  $.ScalableLightbox = function(options) {

    // Singleton pattern
    // ------------------
    // The `ScalableLightbox` plugin augments the singleton pattern
    // for better performance. After initial configuration via
    // the `options` attribute, the plugin may display one or
    // multiple `decks` in the *index and or lightbox module*.
    var instance = $.data(document.body, "ScalableLightbox"),
        args;

    if (!instance) {

      instance = {

        // Instance Vars
        // -------------
        // **Note:** All instance variables with a affix `$` sign
        // are `jQuery` objects.

        // Container element that holds the whole HTML code of
        // this plugin.
        $container:                 null,

        // These are *index module* related objects.
        $indexWrapper:              null,
        $indexOverlay:              null,
        $indexDecksContainer:       null,

        // The current state of the *index module*. Either `closed`
        // or `opened` (meaning it is displayed).
        indexState:                 "closed",

        // These are *lightbox module* related objects.
        $lightboxWrapper:           null,
        $lightboxOverlay:           null,
        $lightboxDecksContainer:    null,
        $lightboxCaptionContainer:  null,
        $lightboxCaptionLeft:       null,
        $lightboxCaptionCenter:     null,
        $lightboxCaptionRight:      null,

        // The current state of the *lightbox module*. Either `closed`
        // or `opened` (meaning it is displayed).
        lightboxState:              "closed",

        // Current `deck` object, relevant for portrayal in the
        // *lightbox module*.
        currentDeck:                null,
        currentIndex:               0,
        currentBlocking:            false,

        // Event bindings (whether click, touch, keyboard and
        // resize events were previously binded).
        binded: {
          clicks:                   false,
          touch:                    false,
          keys:                     false,
          resize:                   false
        },

        // Move to the previous scroll position. Necessary for the
        // annoying iOS address bar.
        prevScrollPosition:         [],

        // Whether the plugin or the masonry (if activated) has
        // been initialized.
        initPlugin:                 false,
        initMasonry:                false,

        // The `options` object, which is provided by the initial
        // plugin call and overwrites defaults defined in the
        // `settings` object below.
        options:                    null,
