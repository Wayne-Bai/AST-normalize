(function () {
    require.config({
        baseUrl: 'src',
        paths: {
            'jquery': '/external/jquery/jquery',
            'underscore': '/external/underscore/underscore'
        },
        packages: [{
            name: 'WinterNote',
            location: './',
            main: 'WinterNote'
        }],
        callback: function () {
        }
    });
})();