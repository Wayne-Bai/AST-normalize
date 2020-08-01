/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

require.config({
    urlArgs: "bust=" + Date.now(),
    paths: {
        'jquery': '../node_modules/jquery/dist/jquery',
    }
});

require([
    'lego',
    'radio-group',
    'tabs',
    'panel-group',
    'draggable',
    'numeric-spinner',
    'flyout',
    'slideshow',
    'slider',
    'colorpicker'
], function ( Lego, RadioGroup, Tabs, PanelGroup, Draggable, NumericSpinner, Flyout, Slideshow, Slider, Colorpicker ) {
    var t = new RadioGroup( '.tabs a' );
    var p = new PanelGroup( '.panel', {
        tabGroups: [ t ]
    });

    var d = new Draggable( '.draggable' );

    var ns = new NumericSpinner( '.numeric-spinner-wrapper', {
        inputSelector: '.numeric-spinner'
    });

    var fo = new Flyout( '.flyout', {
        trigger: $( '.trigger' ),
        positionAround: {
            position: 'right',
            positionOffset: 15,
            align: 'top',
            alignOffset: -10
        }
    });

    var ss = new Slideshow( '.slideshow-wrapper' );

    var s1 = new Slider( '.slider.horizontal' );

    s1.on( 'slider-update-value', function ( evt, data ) {
        $( '.slider-value-horizontal' ).val( Math.round( data.x * 100 ) / 100 );
    });

    var s2 = new Slider( '.slider.vertical', { type: 'vertical' } );

    s2.on( 'slider-update-value', function ( evt, data ) {
        $( '.slider-value-vertical' ).val( Math.round( data.y * 100 ) / 100 );
    });

    var s3 = new Slider( '.slider.two-dimensional', { type: '2d' } );

    s3.on( 'slider-update-value', function ( evt, data ) {
        $( '.slider-value-2d-x' ).val( Math.round( data.x * 100 ) / 100 );
        $( '.slider-value-2d-y' ).val( Math.round( data.y * 100 ) / 100 );
    });

    var cp = new Colorpicker( '.colorpicker' );

    cp.on( 'colorpicker-update-value', function ( evt, data ) {
        $( '.rectangle' ).css( 'background-color', 'hsl(' + data.h + ', ' + data.s + '%, ' + data.l + '%)' );
    });
});
