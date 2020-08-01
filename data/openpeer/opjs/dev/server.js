
const PATH = require("path");
const EXPRESS = require("express");
const HBS = require("hbs");
const GLOB = require("glob");
const FS = require("fs-extra");
const MARKED = require("marked");
const WAITFOR = require("waitfor");

const PORT = process.env.PORT || 8081;


var serviceUid = false;
if (FS.existsSync(PATH.join(__dirname, "../service.json"))) {
    serviceUid = JSON.parse(FS.readFileSync(PATH.join(__dirname, "../service.json"))).uid;
}

var config = {};
if (FS.existsSync(PATH.join(__dirname, "../../../config.js"))) {
    config = require("../../../config").getConfig();
}

exports.main = function(callback) {
    try {
        var app = EXPRESS();

        app.use(function(req, res, next) {
            if (serviceUid) {
                res.setHeader("x-service-uid", serviceUid);
            }
            return next();
        });

        app.use(EXPRESS.bodyParser());

        require("./helpers/bootstrapper").hook({
            host: "localhost:" + PORT
        }, app);
        require("./helpers/identity").hook({
            host: "localhost:" + PORT
        }, app);
        require("./helpers/namespace").hook({
            host: "localhost:" + PORT
        }, app);
        require("./helpers/lockbox").hook({
            host: "localhost:" + PORT
        }, app);
        require("./helpers/rolodex").hook({
            host: "localhost:" + PORT
        }, app);

        var extraServers = [];

        return require("./helpers/websocket-test-server/server").main({}, function(err, info) {
            if (err) return callback(err);
            console.log('[websocket-test-server] server started on port ' + info.port);
            extraServers.push(info.server);

            return require("./helpers/finder-server/server").main({}, function(err, info) {
                if (err) return callback(err);
                console.log('[finder-server] server started on port ' + info.port);
                extraServers.push(info.server);

                info.hook(app);

                return require("./helpers/p2p-relay-server/server").main({}, function(err, info) {
                    if (err) return callback(err);
                    console.log('[p2p-relay-server] websocket server started on port ' + info.wsServerPort);
                    console.log('[p2p-relay-server] tcp server started on port ' + info.tcpServerPort);
                    extraServers.push(info.wsServer);
                    extraServers.push(info.tcpServer);
/*
                    return require("./helpers/finder-proxy-server/tests/client").getFinderServer(function(err, finderInfo) {
                        if (err) return callback(err);

                        console.log('[finder-proxy-server] connecting to remote finder at: ' + finderInfo.hostname + ':' + finderInfo.port);

                        return require("./helpers/finder-proxy-server/server").main({
                            finderHostname: finderInfo.hostname,
                            finderPort: finderInfo.port,
                        }, function(err, info) {
                            if (err) return callback(err);

                            console.log('[finder-proxy-server] server started on port ' + info.port);
                            extraServers.push(info.server);
*/

                            var hbs = HBS.create();

                            app.set("view engine", "hbs");

                            app.engine("hbs", hbs.__express);
                            app.set("views", PATH.join(__dirname, "views"));
                            app.get(/^\/($|test$|test\/.*$)/, function(req, res, next) {
                                var page = req.params[0] || "index";
                                return getTemplateData(page, function(err, data) {
                                    if (err) return next(err);
                                    try {

                                        data.config = config;

                                        res.render(page.split("/")[0], data);
                                    } catch(err) {
                                        return next(err);
                                    }
                                });
                            });

                            mountStaticDir(app, /^\/tests-browser-standalone\/(.*)$/, PATH.join(__dirname, "tests-browser-standalone"));
                            mountStaticDir(app, /^\/ui\/(.*)$/, PATH.join(__dirname, "ui"));
                            mountStaticDir(app, /^\/tests\/(.*)$/, PATH.join(__dirname, "tests-browser"));
                            mountStaticDir(app, /^\/mocks\/(.*)$/, PATH.join(__dirname, "mocks"));
                            mountStaticDir(app, /^\/lib\/opjs\/(.*)$/, PATH.join(__dirname, "../lib"));
                            mountStaticDir(app, /^\/lib\/opjs-primitives\/(.*)$/, PATH.join(__dirname, "../node_modules/opjs-primitives/lib"));
                            mountStaticDir(app, /^\/lib\/ortc\/(.*)$/, PATH.join(__dirname, "../node_modules/ortc-over-rtc/lib"));
                            mountStaticDir(app, /^\/lib\/cifre\/(.*)$/, PATH.join(__dirname, "../node_modules/cifre"));
                            mountStaticDir(app, /^\/lib\/q\/(.*)$/, PATH.join(__dirname, "node_modules/q"));

                            var server = app.listen(PORT);
                            var origClose = server.close;
                            server.close = function(callback) {
                                var waitfor = WAITFOR.serial(function(err) {
                                    if (err) return callback(err);
                                    return origClose(callback);
                                });
                                extraServers.forEach(function(server) {
                                    waitfor(server.close);
                                });
                            }

                            console.log("open http://localhost:" + PORT + "/");

                            return callback(null, {
                                server: server,
                                port: PORT
                            });
//                        });
//                    });
                });
            });
        });

    } catch(err) {
        return callback(err);
    }
}


function mountStaticDir(app, route, path) {
    app.get(route, function(req, res, next) {
        var originalUrl = req.url;
        req.url = req.params[0];
        EXPRESS.static(path)(req, res, function() {
            req.url = originalUrl;
            return next.apply(null, arguments);
        });
    });
};


var tests = null;
function getTemplateData(page, callback) {
    if (page === "index") {
        if (tests) return callback(null, tests);
        return getTests(function(err, files) {
            if (err) return callback(err);
            tests = {
                tests: {}
            };
            files.forEach(function(filepath) {
                var parts = filepath.split("/");
                if (!tests.tests[parts[0]]) {
                    tests.tests[parts[0]] = {
                        label: parts[0],
                        tests: []
                    };
                }
                var name = parts[1].replace(/\.js$/, "");
                tests.tests[parts[0]].tests.push({
                    url: "/test/" + parts[0] + "/" + name,
                    label: name.replace(/^(\d*)-/, "$1 - ")
                });
            });
            return callback(null, tests);
        });
    } else
    if (page === "test") {
        return getTests(function(err, files) {
            if (err) return callback(err);
            var tests = [];
            files.forEach(function(filepath, index) {
                tests.push({
                    id: "tests/" + filepath.replace(/\.js$/, ""),
                    more: (index < (files.length-1)) ? true : false
                });
            });
            return callback(null, {
                tests: tests
            });
        });
    } else {
        var m = page.match(/^test\/(.*)$/)
        if (!m) return callback(null, {});
        var m2 = FS.readFileSync(PATH.join(__dirname, "tests-browser", m[1] + ".js")).toString().match(/\/\*!markdown\s*\n([\s\S]*?)\n\*\//);
        return callback(null, {
            docs: (m2 && m2[1] && MARKED(m2[1])) || "",
            tests: [
                {
                    id: "tests/" + m[1],
                    more: false
                }
            ]
        });
    }
}

function getTests(callback) {
    return GLOB("**/*.js", {
        cwd: PATH.join(__dirname, "tests-browser")
    }, function (err, files) {
        if (err) return callback(err);
        if (!files || files.length === 0) return callback(new Error("No tests found! This should not happen."));
        return callback(null, files);
    });
}


if (require.main === module) {
    exports.main(function(err) {
        if (err) {
            console.error(err.stack);
            process.exit(1);
        }
    });
}
