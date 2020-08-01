// hostmeta-test.js
//
// Test the module interface
//
// Copyright 2012, StatusNet Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var assert = require("assert"),
    vows = require("vows"),
    express = require("express"),
    wf = require("../lib/webfinger");

var suite = vows.describe("RFC6415 (host-meta) interface");

suite.addBatch({
    "When we run an HTTP app that just supports host-meta with XRD": {
        topic: function() {
            var app = express(),
                callback = this.callback;

            // parse queries
            app.use(express.query());

            app.get("/.well-known/host-meta", function(req, res) {
                res.status(200);
                res.set("Content-Type", "application/xrd+xml");
                res.end("<?xml version='1.0' encoding='UTF-8'?>\n"+
                        "<XRD xmlns='http://docs.oasis-open.org/ns/xri/xrd-1.0'>\n" +
                        "<Link rel='lrdd' type='application/xrd+xml' template='http://localhost/lrdd?uri={uri}' />"+
                        "</XRD>");
            });
            app.get("/lrdd", function(req, res) {
                var uri = req.query.uri,
                    parts = uri.split("@"),
                    username = parts[0],
                    hostname = parts[1];

                res.status(200);
                res.set("Content-Type", "application/xrd+xml");
                res.end("<?xml version='1.0' encoding='UTF-8'?>\n"+
                        "<XRD xmlns='http://docs.oasis-open.org/ns/xri/xrd-1.0'>\n" +
                        "<Subject>"+uri+"</Subject>"+
                        "<Link rel='profile' href='http://localhost/profile/"+username+"' />"+
                        "</XRD>");
            });
            app.on("error", function(err) {
                callback(err, null);
            });
            app.listen(80, function() {
                callback(null, app);
            });
        },
        "it works": function(err, app) {
            assert.ifError(err);
        },
        teardown: function(app) {
            if (app && app.close) {
                app.close();
            }
        },
        "and we get a webfinger with the webfingerOnly flag set": {
            topic: function() {
                var callback = this.callback;
                wf.webfinger("alice@localhost", null, {webfingerOnly: true}, function(err, jrd) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(new Error("Unexpected success"));
                    }
                });
            },
            "it fails correctly": function(err) {
                assert.ifError(err);
            }
        }
    }
});

suite["export"](module);
