var should = require('should'),
    helper = require("../lib/image-filename-helper"),
    bgi = require("../lib/background-imager"),
    fs = require("fs");

describe("BackgroundImager", function () {

    //
    // generatePixelDensityExpressions
    //

    describe("#generatePixelDensityExpressions", function () {
        // 1.5
        it("should return the expected array when density is \"1.5\"", function () {
            bgi.generatePixelDensityExpressions(1.5).should.eql([
                "(-webkit-min-device-pixel-ratio: 1.5)",
                "(min--moz-device-pixel-ratio: 1.5)",
                "(-o-min-device-pixel-ratio: 15/10)",
                "(min-device-pixel-ratio: 1.5)",
                "(min-resolution: 144dpi)",
                "(min-resolution: 1.5dppx)"
            ])
        })
        // 2
        it("should return the expected array when density is \"2\"", function () {
            bgi.generatePixelDensityExpressions(2).should.eql([
                "(-webkit-min-device-pixel-ratio: 2)",
                "(min--moz-device-pixel-ratio: 2)",
                "(-o-min-device-pixel-ratio: 2/1)",
                "(min-device-pixel-ratio: 2)",
                "(min-resolution: 192dpi)",
                "(min-resolution: 2dppx)"
            ])
        })
        // 2 and true
        it("should return the expected array when density is \"2\" and isMax is \"true\"", function () {
            bgi.generatePixelDensityExpressions(2, true).should.eql([
                "(-webkit-max-device-pixel-ratio: 2)",
                "(max--moz-device-pixel-ratio: 2)",
                "(-o-max-device-pixel-ratio: 2/1)",
                "(max-device-pixel-ratio: 2)",
                "(max-resolution: 192dpi)",
                "(max-resolution: 2dppx)"
            ])
        })
    })

    //
    // getImageFileInfo
    //

    describe("#getImageFileInfo", function () {
        // noodle@1x.png
        it("should return the expected file info \"noodle@1x+480w.png\"", function (done) {
            bgi.getImageFileInfo("test/images/noodle@1x+480w.png", function(err, imageFileInfo) {
                if (err) {
                    done(err);
                }

                imageFileInfo.should.include({
                    filepath: "test/images/noodle@1x+480w.png",
                    classname: "noodle",
                    queries: ["1x+480w"],
                    width: 32,
                    height: 32
                })
                done();
            })
        })
        // noodle@1x,2x+480w.png
        it("should return the expected file info \"noodle@1x,2x+480w.png\"", function (done) {
            bgi.getImageFileInfo("test/images/noodle@1x,2x+480w.png", function(err, imageFileInfo) {
                if (err) {
                    done(err);
                }

                imageFileInfo.should.include({
                    filepath: "test/images/noodle@1x,2x+480w.png",
                    classname: "noodle",
                    queries: [
                        "1x",
                        "2x+480w"
                    ],
                    width: 64,
                    height: 64
                })
                done();
            })
        })
        // noodle@2x.png
        it("should return the expected file info \"noodle@2x.png\"", function (done) {
            bgi.getImageFileInfo("test/images/noodle@2x.png", function(err, imageFileInfo) {
                if (err) {
                    done(err);
                }

                imageFileInfo.should.include({
                    filepath: "test/images/noodle@2x.png",
                    classname: "noodle",
                    queries: ["2x"],
                    width: 128,
                    height: 128
                })
                done();
            })
        })
    })

    //
    // getImageFileInfoArray
    //

    describe("#getImageFileInfoArray", function () {

        var filepaths = [
            "test/images/noodle@1x,2x+480w.png",
            "test/images/noodle@1x+480w.png",
            "test/images/noodle@2x.png"
        ];

        it("should return the expected file info array for images in \"test/images/\"", function (done) {
            bgi.getImageFileInfoArray(filepaths, function (err, imageFileInfoArray) {
                if (err) {
                    done(err);
                }
                imageFileInfoArray.should.be.instanceOf(Array);
                imageFileInfoArray.should.includeEql({
                    filepath: "test/images/noodle@1x,2x+480w.png",
                    classname: "noodle",
                    queries: [
                        "1x",
                        "2x+480w"
                    ],
                    width: 64,
                    height: 64
                })
                imageFileInfoArray.should.includeEql({
                    filepath: "test/images/noodle@1x+480w.png",
                    classname: "noodle",
                    queries: [
                        "1x+480w"
                    ],
                    width: 32,
                    height: 32
                })
                imageFileInfoArray.should.includeEql({
                    filepath: "test/images/noodle@2x.png",
                    classname: "noodle",
                    queries: ["2x"],
                    width: 128,
                    height: 128
                })
                done();
            })
        });
    })

    //
    // groupImageFileInfoByQuery
    //

    // NOTE: ugly test - is there a better way to do this?
    describe("#groupImageFileInfoByQuery", function () {
        var imageFileInfoArray = [{
            filepath: "test/images/noodle@1x,2x+480w.png",
            classname: "noodle",
            queries: [
                "1x",
                "2x+480w"
            ],
            width: 64,
            height: 64
        }, {
            filepath: "test/images/noodle@1x+480w.png",
            classname: "noodle",
            queries: [
                "1x+480w"
            ],
            width: 32,
            height: 32
        }, {
            filepath: "test/images/noodle@2x.png",
            classname: "noodle",
            queries: ["2x"],
            width: 128,
            height: 128
        }]

        var expectedImageFileInfoHash = {
            '1x': [{
                filepath: 'test/images/noodle@1x,2x+480w.png',
                classname: 'noodle',
                queries: [
                    "1x",
                    "2x+480w"
                ],
                width: 64,
                height: 64
            }],
            '2x+480w': [{
                filepath: 'test/images/noodle@1x,2x+480w.png',
                classname: 'noodle',
                queries: [
                    "1x",
                    "2x+480w"
                ],
                width: 64,
                height: 64 
            }],
            '1x+480w': [{
                filepath: 'test/images/noodle@1x+480w.png',
                classname: 'noodle',
                queries: [
                    "1x+480w"
                ],
                width: 32,
                height: 32
            }],
            '2x': [{
                filepath: 'test/images/noodle@2x.png',
                classname: 'noodle',
                queries: ["2x"],
                width: 128,
                height: 128
            }]
        }

        it("should return expected imageFileInfoHash", function () {
            bgi.groupImageFileInfoByQuery(imageFileInfoArray).should.eql(expectedImageFileInfoHash);
        })
    })

    //
    // generateRuleSet
    //

    describe("#generateRuleSet", function () {
        //
        it("should generate the correct ruleset from the \"noodle@1x,2x+480w.png\" ImageFileInfo object & \"1x\" query", function () {
            bgi.generateRuleSet({
                filepath: 'test/images/noodle@1x,2x+480w.png',
                classname: 'noodle',
                queries: [
                    "1x",
                    "2x+480w"
                ],
                width: 64,
                height: 64
            }, "1x", {

            }).should.eql({
                selector: ".noodle",
                rules: {
                    "background-image": "url(\"test/images/noodle@1x,2x+480w.png\")",
                    "width": "64px",
                    "height": "64px"
                }
            })
        })
        //
        it("should generate the correct ruleset from the \"noodle@1x,2x+480w.png\" ImageFileInfo object & \"2x+480w\" query", function () {
            bgi.generateRuleSet({
                filepath: 'test/images/noodle@1x,2x+480w.png',
                classname: 'noodle',
                queries: [
                    "1x",
                    "2x+480w"
                ],
                width: 64,
                height: 64
            }, "2x+480w", {

            }).should.eql({
                selector: ".noodle",
                rules: {
                    "background-image": "url(\"test/images/noodle@1x,2x+480w.png\")",
                    "background-size": "32px 32px"
                }
            })
        })
    })
})