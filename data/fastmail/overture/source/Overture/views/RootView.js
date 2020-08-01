// -------------------------------------------------------------------------- \\
// File: RootView.js                                                          \\
// Module: View                                                               \\
// Requires: View.js                                                          \\
// Author: Neil Jenkins                                                       \\
// License: © 2010-2014 FastMail Pty Ltd. MIT Licensed.                       \\
// -------------------------------------------------------------------------- \\

"use strict";

( function ( NS ) {

/*global window */

/**
    Class: O.RootView

    Extends: O.View

    An O.RootView instance uses an existing DOM node for its layer, and forms
    the root of the O.View tree making up your application. The root view adds
    DOM event listeners to its layer to observe and dispatch events for the
    whole view hierarchy.

        MyApp.views.mainWindow = new O.RootView( document );

    Normally, you will create an O.RootView instance with the document node for
    each window in your application, but if your application is not taking over
    the full page, it can be initiated with any other node already in the
    document.
*/
var RootView = NS.Class({

    Extends: NS.View,

    syncOnlyInDocument: false,

    layer: null,

    init: function ( node, mixin ) {
        RootView.parent.init.call( this, mixin );

        // Node.DOCUMENT_NODE => 9.
        var nodeIsDocument = ( node.nodeType === 9 ),
            doc = nodeIsDocument ? node : node.ownerDocument,
            win = doc.defaultView,
            events, l;

        events = [
            'click', 'mousedown', 'mouseup', 'dblclick',
            'keypress', 'keydown', 'keyup',
            'dragstart', 'selectstart',
            'touchstart', 'touchmove', 'touchend', 'touchcancel',
            'cut'
        ];
        for ( l = events.length; l--; ) {
            node.addEventListener( events[l], this, false );
        }
        // These events don't bubble: have to capture.
        // In IE, we use a version of focus and blur which will bubble, but
        // there's no way of bubbling/capturing change and input.
        // These events are automatically added to all inputs when created
        // instead.
        events = [ 'focus', 'blur', 'change', 'input' ];
        for ( l = events.length; l--; ) {
            node.addEventListener( events[l], this, true );
        }
        events = [ 'resize', 'orientationchange', 'scroll' ];
        for ( l = events.length; l--; ) {
            win.addEventListener( events[l], this, false );
        }

        this.isRendered = true;
        this.isInDocument = true;
        this.layer = nodeIsDocument ? node.body : node;
    },

    _onScroll: function ( event ) {
        var layer = this.get( 'layer' ),
            isBody = ( layer.nodeName === 'BODY' ),
            doc = layer.ownerDocument,
            win = doc.defaultView,
            html = doc.documentElement,
            left = isBody ?
                // pageXOffset for everything but IE8.
                win.pageXOffset || html.scrollLeft || 0 :
                layer.scrollLeft,
            top = isBody ?
                // pageYOffset for everything but IE8.
                win.pageYOffset || html.scrollTop || 0 :
                layer.scrollTop;
        this.beginPropertyChanges()
                .set( 'scrollLeft', left )
                .set( 'scrollTop', top )
            .endPropertyChanges();
        event.stopPropagation();
    }.on( 'scroll' ),

    preventRootScroll: NS.UA.isIOS ? function ( event ) {
        var view = event.targetView,
            ScrollView = NS.ScrollView,
            doc, win;
        if ( !( view instanceof ScrollView ) &&
                !view.getParent( ScrollView ) ) {
            doc = this.layer.ownerDocument;
            win = doc.defaultView;
            if ( this.get( 'pxHeight' ) <= win.innerHeight &&
                    !/^(?:INPUT|TEXTAREA)$/.test(
                        doc.activeElement.nodeName ) ) {
                event.preventDefault();
            }
        }
    }.on( 'touchmove' ) : null,

    hideAddressBar: function () {
        window.scrollTo( 0, 0 );
    },

    focus: function () {
        var layer = this.get( 'layer' ),
            activeElement = layer.ownerDocument.activeElement,
            view = NS.ViewEventsController.getViewFromNode( activeElement );
        if ( view instanceof NS.AbstractControlView ) {
            view.blur();
        } else if ( activeElement.blur ) {
            activeElement.blur();
        }
    },

    pxTop: 0,
    pxLeft: 0,

    handleEvent: function ( event ) {
        switch ( event.type ) {
        // We observe mousemove when mousedown.
        case 'mousedown':
            this.get( 'layer' ).ownerDocument
                .addEventListener( 'mousemove', this, false );
            break;
        case 'mouseup':
            this.get( 'layer' ).ownerDocument
                .removeEventListener( 'mousemove', this, false );
            break;
        // Window resize events: just notify parent has resized.
        case 'orientationchange':
            this.hideAddressBar();
            /* falls through */
        case 'resize':
            this.didResize();
            return;
        // Scroll events are special.
        case 'scroll':
            this._onScroll( event );
            return;
        }
        NS.ViewEventsController.handleEvent( event, null, this );
    }.invokeInRunLoop()
});

NS.RootView = RootView;

}( O ) );
