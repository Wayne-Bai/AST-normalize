var setupMode = (process.argv.indexOf('--setup') !== -1);
var debugMode = (process.argv.indexOf('--debug') !== -1);

module.exports = function (server,app,appName) {

    app.debugMode = debugMode;

    var silenceLog = function (e) {
        if (!debugMode)
            e.stopPropagation = true;
    };
    app.prependListener('log',silenceLog);

    app.setConfig({
        "servername": "*",
        "cache": true,

        "import": [
            "../../blongular/config/",
            "../../blongular/classes/",
            "../../blongular/models/",
            "../../blongular/setup/",
            "../../blongular/editor/modules/",
            "../../blongular/editor/resources/",
            "../../blongular/editor/controllers/",
            "../../blongular/editor/rest/",
            "../../blongular/editor/"
        ],

        "components": {
            // Blongular Server
            "blongular": {
                "class": "BlongularServer"
            },

            // DbConnection configuration (remove comment to enable)
            "database": {
                "class": "DbConnection",
                "alias": "db",
                "engine": "mongo",
                "address": "127.0.0.1",
                "port": 27017,
                "database": "blongular"
            }
        }
    });

    app.importFromConfig();
    app.getComponent('classCompiler').run();
    app.getConfig().import = [];
    console.log(app.c);
    app.preloadComponents();

    server.getComponent('http').attachModule(appName,app);
    var blongular = app.getComponent('blongular');

    app.once('ready', function () {

        app.express.use(require('method-override')('X-HTTP-Method-Override'));

        app.getEvent('log').removeListener(silenceLog);

        var port = server.getComponent('http').getConfig('listen') || 27890;
        var self = app;

        // Moment
        self.moment=require('moment');

        // Debug MongoDB
        if (self.db.getConfig('debug') || debugMode)
            self.db.dataObject.driver.set('debug',true);

        // DB Connection Message
        self.db.once('connect',function (e,err,conn) {
            if (err)
            {
                self.e.log('Failed to connect to DATABASE.');
                self.setupMode = true;
            }

            if (self.setupMode)
                self.e.log('Running on SETUP mode.');
            else
                self.e.log('BLONGULAR is ready.');

            self.e.log('Access your blongular at http://127.0.0.1:'+port+'/');
        });

        // Block request if not ready.
        self.prependListener('newRequest',function (e,req,resp) {
            if (!self.db.connected && !self.setupMode)
            {
                resp.statusCode = 503;
                resp.end();
            } else
                e.next();
        });

    });

    app.m={};

    app.setupMode = app.setupMode || setupMode;

    for (m in server.m)
    {
        app.getModel();
        app.m[m] = function () {
            var model = server.m[m]();
            model.blongular = blongular;
            return model;
        }
    }

};
