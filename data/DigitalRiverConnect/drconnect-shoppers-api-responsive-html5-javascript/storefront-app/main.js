(function($, dr) {
    // Get the configuration file and pass it to the app when it's being created.
    // If the JSON is already loaded, there's no need for the AJAX call.
    var config = $.storage.getItem("sampleAppConfig", "localStorage");
    var forceDefaultConfig = dr.api.util.getQueryStringParam(window.location.href, "defaultConfig")
    if(config && forceDefaultConfig!=1) {
        startApp(JSON.parse(config));
    } else {
        $.getJSON('appConfig.js', startApp);
    }
    
    function startApp(config) {
        // Create the app using the loaded config
        var app = new dr.acme.runtime.App(config);
        app.start();
    }
})(jQuery, dr);
