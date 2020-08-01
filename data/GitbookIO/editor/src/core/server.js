define([
    "hr/hr",
    "hr/utils",
    "hr/promise",
    "utils/analytic"
], function(hr, _, Q, analytic) {
    var http = node.require('http');
    var url = node.require('url');
    var send = node.require('send');

    var Server = hr.Class.extend({
        initialize: function() {
            Server.__super__.initialize.apply(this, arguments);

            this.running = null;
            this.port = 0;
            this.sockets = [];
        },

        // Return true if the server is running
        isRunning: function() {
            return this.running != null;
        },

        // Open the server if running
        open: function(article) {
            if (!this.isRunning()) return false;

            // Open a specific article directly
            var inPath = "";
            if (article && !article.isIntroduction()) inPath = article.get("path").slice(0, -3)+".html";

            node.gui.Shell.openExternal('http://localhost:'+this.port+"/"+inPath);
            return true;
        },

        // Stop the server
        stop: function() {
            var that = this;
            if (!this.isRunning()) return Q();

            analytic.track("server.stop");

            var d = Q.defer();
            this.running.close(function(err) {
                that.running = null;
                that.trigger("state", false);

                if (err) d.reject(err);
                else d.resolve();
            });

            for (var i = 0; i < this.sockets.length; i++) {
                this.sockets[i].destroy();
            }

            return d.promise;
        },

        // Start the server
        start: function(dir, port) {
            var that = this, pre = Q();
            port = port || 8004;

            if (that.isRunning()) pre = this.stop();
            return pre
            .then(function() {
                var d = Q.defer();

                analytic.track("server.start");

                that.running = http.createServer(function(req, res){
                    // Render error
                    function error(err) {
                        res.statusCode = err.status || 500;
                        res.end(err.message);
                    }

                    // Redirect to directory's index.html
                    function redirect() {
                        res.statusCode = 301;
                        res.setHeader('Location', req.url + '/');
                        res.end('Redirecting to ' + req.url + '/');
                    }

                    // Send file
                    send(req, url.parse(req.url).pathname)
                    .root(dir)
                    .on('error', error)
                    .on('directory', redirect)
                    .pipe(res);
                });

                that.running.on('connection', function (socket) {
                    that.sockets.push(socket);
                    socket.setTimeout(4000);
                    socket.on('close', function () {
                        that.sockets.splice(that.sockets.indexOf(socket), 1);
                    });
                });

                that.running.listen(port, function(err) {
                    if (err) return d.reject(err);

                    that.port = port;
                    that.trigger("state", true);
                    d.resolve();
                });

                return d.promise;
            });
        }
    });

    return (new Server());
});