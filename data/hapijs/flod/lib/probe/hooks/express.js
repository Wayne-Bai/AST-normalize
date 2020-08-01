module.exports = {
    '3.0.0': {
        'start': function (options, app, send, data) {

            app.server._startOrig = app.server.listen;
            app.server.listen = function (port, fn) {

                app._server = app.server._startOrig(port, function () {

                    send({
                        action: 'started', 
                        data: data || {}
                    });
                    fn && fn();
                });
            };
        },
        'stop': function (options, app) {

            app.server.close(function ( ){

                process.nextTick(function () {

                    process.exit(1);
                });
            });
        },
        'hook': function (options, app, send) {

            app.use(function (req, res, next) {

                var end = res.end;
                res.end = function (chunk, encoding) {

                    send({action: 'request', data: {}});
                    res.end = end;
                    res.end(chunk, encoding);
                };
                next();
            });
        }
    }
};