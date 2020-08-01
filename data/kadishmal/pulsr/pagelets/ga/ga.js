// ga.js
// Displays Google Analytics Code
define(['pagelet', 'underscore', 'fs', 'path', 'module', 'conf', 'fileCache'], function(Pagelet, _, fs, path, module, conf, fileCache) {
    var pagelet = new Pagelet();

    return _.extend(pagelet, {
        moduleUri: module.uri,
        run: function (display) {
            var gaCode = conf.get('pagelets.ga.code');

            if (gaCode) {
                // Get the pagelet layout.
                fileCache.templates.get(this.fullPath, function (err, template) {
                    var data;

                    if (err) {
                        console.log('Could not read ' + this.dir + ' pagelet.');
                    }
                    else{
                        data = template({
                            gaCode: gaCode,
                            domain: conf.get('pagelets.ga.domain')
                        });
                    }

                    display(data);
                });
            }
            else{
                display();
            }
        }
    });
});