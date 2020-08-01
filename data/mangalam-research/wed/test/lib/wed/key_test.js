/**
 * @author Louis-Dominique Dubeau
 * @license MPL 2.0
 * @copyright 2013, 2014 Mangalam Research Center for Buddhist Languages
 */
'use strict';
var requirejs = require("requirejs");

// This will be loaded instead of the read module.
requirejs.define("wed/browsers", function () {
    return {
        CHROME_31: false,
        MISE: false,
        OSX: false
    };
});

requirejs.config({
    baseUrl: __dirname + '/../../../build/standalone/lib'
});
var key = requirejs("wed/key");
var browsers = requirejs("wed/browsers");
var chai = require("chai");
var assert = chai.assert;

describe("key", function () {
    describe("makeKey", function () {
        it("makes a key", function () {
            var k = key.makeKey(1, true, 2, 3, true, false, true);
            assert.equal(k.which, 1);
            assert.equal(k.keyCode, 2);
            assert.equal(k.charCode, 3);
            assert.equal(k.ctrlKey, true);
            assert.equal(k.altKey, false);
            assert.equal(k.metaKey, true);
            assert.equal(k.keypress, true);
        });

        it("sets sensible defaults", function () {
            var k = key.makeKey(1);
            assert.equal(k.which, 1);
            assert.equal(k.keyCode, 1);
            assert.equal(k.charCode, 1);
            assert.equal(k.ctrlKey, false);
            assert.equal(k.altKey, false);
            assert.equal(k.metaKey, false);
            assert.equal(k.keypress, true);
        });

        it("returns the same value for same parameters", function () {
            var k1 = key.makeKey(1, true, 2, 3, true, false, true);
            var k2 = key.makeKey(1, true, 2, 3, true, false, true);
            assert.equal(k1, k2);
        });
    });

    describe("makeCtrlKey", function () {
        it("makes a control key", function () {
            var k = key.makeCtrlKey(1);
            assert.equal(k.which, 1);
            assert.equal(k.keyCode, 1);
            assert.equal(k.charCode, 0);
            assert.equal(k.ctrlKey, true);
            assert.equal(k.altKey, false);
            assert.equal(k.metaKey, false);
            assert.equal(k.keypress, false);
        });
    });

    describe("makeMetaKey", function () {
        it("makes a meta key", function () {
            var k = key.makeMetaKey(1);
            assert.equal(k.which, 1);
            assert.equal(k.keyCode, 1);
            assert.equal(k.charCode, 0);
            assert.equal(k.ctrlKey, false);
            assert.equal(k.altKey, false);
            assert.equal(k.metaKey, true);
            assert.equal(k.keypress, false);
        });
    });

    describe("makeCtrlEqKey", function () {
        it("makes a control key on non-OSX platforms", function () {
            var k = key.makeCtrlEqKey(1);
            assert.equal(k, key.makeCtrlKey(1));
        });

        it("makes a meta key on OSX platforms", function () {
            browsers.OSX = true;
            var k = key.makeCtrlEqKey(1);
            assert.equal(k, key.makeMetaKey(1));
        });

        afterEach(function() {
            browsers.OSX = false;
        });

    });


    describe("Key", function () {
        describe("anyModifier", function () {
            it("returns true if any modifier is set", function () {
                var k = key.makeCtrlKey(1);
                assert.isTrue(k.anyModifier());

                k = key.makeKey(1, false, 2, 3, false, true, false);
                assert.isTrue(k.anyModifier());

                k = key.makeKey(1, false, 2, 3, false, false, true);
                assert.isTrue(k.anyModifier());
            });
        });

        describe("matchesEvent", function () {
            it("matches keydown/keyup keys", function () {
                var k = key.makeCtrlKey(1);
                assert.isTrue(k.matchesEvent({which: 1, keyCode: 1,
                                              charCode: 0,
                                              ctrlKey: true, altKey: false,
                                              metaKey: false,
                                              type: "keydown"}));
                assert.isTrue(k.matchesEvent({which: 1, keyCode: 1,
                                              charCode: 0,
                                              ctrlKey: true, altKey: false,
                                              metaKey: false,
                                              type: "keyup"}));

            });

            it("matches a keypress key", function () {
                var k = key.makeKey(1);
                assert.isTrue(k.matchesEvent({which: 1, keyCode: 1,
                                              charCode: 1,
                                              ctrlKey: false, altKey: false,
                                              metaKey: false,
                                              type: "keypress"}));
            });

            it("returns false when not matching an event", function () {
                var k = key.makeCtrlKey(1);
                assert.isFalse(k.matchesEvent({which: 1, keyCode: 1,
                                               charCode: 1,
                                               ctrlKey: false, altKey: false,
                                               metaKey: false}));
            });

        });

        describe("setEventToMatch", function () {
            it("sets an event to match a ctrl key", function () {
                var event = {};
                var k = key.makeCtrlKey(1);
                k.setEventToMatch(event);
                assert.isTrue(k.matchesEvent(event));
                // Biased towards keydown
                assert.equal(event.type, "keydown");
            });

            it("sets an event to match a keypress", function () {
                var event = {};
                var k = key.makeKey(1);
                k.setEventToMatch(event);
                assert.isTrue(k.matchesEvent(event));
            });
        });


    });

});

//  LocalWords:  RequireJS Ctrl Mangalam MPL Dubeau requirejs chai
//  LocalWords:  makeKey makeCtrlKey anyModifier keyup matchesEvent
//  LocalWords:  keydown keypress setEventToMatch ctrl
