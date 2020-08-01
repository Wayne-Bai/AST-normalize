(function (root, factory) {
    "use strict";

    if (typeof exports === "object") {
        // NodeJS. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require("../js/stardog.js"), require("expect.js"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["stardog", "expect"], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog, root.expect);
    }
}(this, function (Stardog, expect) {
    "use strict";

    // -----------------------------------
    // Gets DB Options
    // -----------------------------------

    describe ("Get DB Options Test Suite", function() {
        var conn;

        this.timeout(50000);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it ("should get NOT_FOUND status code trying to get the options of a non-existent DB.", function (done) {
            var optionsObj = {
                "search.enabled" : "",
                "icv.enabled" : ""
            };

            conn.onlineDB({ database: "nodeDB_test" }, function (dataOnline, responseOnline) {
                // put online if it"s not

                expect(responseOnline.statusCode).to.be(404);
                
                conn.getDBOptions({ "database": "nodeDB_test", "optionsObj": optionsObj }, function (data, response) {

                    expect(response.statusCode).to.be(500);
                    done();
                });
            });
        });

        it ("should get the options of an DB", function(done) {
            var optionsObj = {
                "search.enabled" : "",
                "icv.enabled" : ""
            };

            conn.onlineDB({ database: "nodeDB" }, function () {
                // put online if it"s not
                
                conn.getDBOptions({ "database": "nodeDB", "optionsObj": optionsObj }, function (data, respose2) {
                    expect(respose2.statusCode).to.be(200);

                    // check options retrieved
                    expect(data["search.enabled"]).not.to.be(undefined);
                    expect(data["search.enabled"]).to.be(true);

                    expect(data["icv.enabled"]).not.to.be();
                    expect(data["icv.enabled"]).to.be(false);
                    done();
                });
            });
        });

    });
}));
