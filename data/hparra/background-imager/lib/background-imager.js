//
// background-imager.js
//
// Copyright (C) 2013 Hector Guillermo Parra Alvarez (@hgparra)
// Released under The MIT License (MIT) - http://opensource.org/licenses/MIT
//

//
// RE: GraphicsMagick/ImageMagick (GM/IM)
//
// this depends on https://github.com/aheckmann/gm
// `npm install gm`
//

//
// RE: CSS Media Queries
//
// by definition media query expresions contain enclosing parentheses
// e.g. `(min-device-pixel-ratio: 2)`
// Source: http://www.w3.org/TR/css3-mediaqueries/#syntax
//

var path = require('path')
    , Q = require('q')
    , gm = require('gm')
    , im = gm.subClass({ imageMagick: true })
    , ifh = require('./image-filename-helper');

// string representing a single tab space
var DEFAULT_TAB = "  ";

//
// PUBLIC
//

var BackgroundImager = {

    // accepts a pixel density number and optional isMax boolean
    // returns array with various cross-browser pixel density expressions
    generatePixelDensityExpressions: function (density, isMax) {

        if (typeof density === "undefined" || density === null || density <= 0) {
            throw new Error("Invalid density");
        }

        var BASE_DPI = 96,
            pixelDensityExps = [];

        // TODO: refactor?
        function createMediaQueryExpression(feature, value) {
            return "(" + feature + ": " + value + ")";
        }

        // 1 = 96dpi
        // 1.3 = 13/10 ~= 125dpi
        // 1.5 = 3/2 = 15/10 = 144dpi
        // 2.0 = 2 = 192dpi
        // 3.0 = 3 = 288dpi
        pixelDensityExps.push(createMediaQueryExpression("-webkit-min-device-pixel-ratio", density));
        pixelDensityExps.push(createMediaQueryExpression("min--moz-device-pixel-ratio", density));
        pixelDensityExps.push(createMediaQueryExpression("-o-min-device-pixel-ratio",
            (density % 1 === 0) ? density + "/1" : (density * 10) + "/10")); // sorry!
        pixelDensityExps.push(createMediaQueryExpression("min-device-pixel-ratio", density));
        pixelDensityExps.push(createMediaQueryExpression("min-resolution", Math.round(density * BASE_DPI) + "dpi"));
        pixelDensityExps.push(createMediaQueryExpression("min-resolution", density + "dppx"));

        if (isMax) {
            for (var i = 0; i < pixelDensityExps.length; i++) {
                pixelDensityExps[i] = pixelDensityExps[i].replace("min", "max");
            }
        }

        return pixelDensityExps;
    },

    // generates media queries each with different cross-browser pixel density expression
    // accepts an optional array of media query expressions to merge with each query
    // returns array of media queries
    generateMediaQueriesWithPixelDensity: function (density, isMax, exps) {

        var pixelDensityExps = this.generatePixelDensityExpressions(density, isMax),
            queries = [];
        
        if (typeof exps === "undefined" || exps === null) {
            exps = [];
        }

        for (var i = 0, length = pixelDensityExps.length; i < length; ++i) {
            var revisedExps = [];
            revisedExps = revisedExps.concat(exps);
            revisedExps.push(pixelDensityExps[i]);
            queries.push(this.generateMediaQuery(revisedExps));
        }

        return queries;
    },

    // accepts array of media query expressions
    // returns a single media query with `only screen` modifier and media type
    // e.g. `only screen and (min-device-pixel-ratio: 2)`
    generateMediaQuery: function (exps) {
        var mq = "only screen";
        if (exps.length > 0) {
            mq += " and ";
            mq += exps.join(" and ");
        }
        return mq;
    },

    // accepts array of media queries
    // returns a media query list as string
    generateMediaQueryList: function (queries) {
        var list = "";
        list += queries.join(",\n");
        return list;
    },

    // accepts image filename
    // generates a CSS RuleSet object containing selector and rules:
    // * `background-image`
    // * `width` and `height`, or `background-size`
    // returns promise of a RuleSet object
    generateRuleSet: function (imageFileInfo, query, options) {

        var settings;

        // options are optional
        if (typeof arguments[2] === "function") {
            settings = {};
            callback = arguments[2];
        } else {
            settings = options;
        }

        // set image url
        if (settings.urlPath) {
            settings.url = path.join(settings.urlPath, path.basename(imageFileInfo.filepath))
        } else {
            settings.url = imageFileInfo.filepath;
        }

        if (!settings.classPrefix) {
            settings.classPrefix = "";
        }

        var ruleset = {
            selector: "." + settings.classPrefix + imageFileInfo.classname,
            rules: {}
        };

        ruleset.rules["background-image"] = "url(\"" + settings.url + "\")";
        //ruleset.rules["background-repeat"] = "no-repeat";

        // ratio determines which math and rules to employ
        var ratio = ifh.getRatio(query) || 1,
            width = imageFileInfo.width / ratio + "px",
            height = imageFileInfo.height / ratio + "px";

        if (ratio > 1) {
            ruleset.rules["background-size"] = width + " " + height;
        } else {
            ruleset.rules["width"] = width;
            ruleset.rules["height"] = height;
        }

        return ruleset;
    },

    // accepts MediaRule object
    // returns MediaRule as CSS (string)
    generateMediaRule: function (mediaRule, tabSpacing) {

        //
        tabSpacing = tabSpacing || DEFAULT_TAB;

        // returns string with n `TAB`s
        // FIXME: not effecient that I'm internal, but convenient
        function tabs (n) {
            var tabs = "";   
            for (var i = 0; i < n; i++) {
                tabs += tabSpacing;
            }
            return tabs;
        }

        var mediaRuleString = "",
            t = 0; // ident (tab) level

        // write beginning of MediaRule and MediaQueries
        if (mediaRule.queries !== null) {
            mediaRuleString += tabs(t) + "@media\n";
            mediaRuleString += tabs(t) + BackgroundImager.generateMediaQueryList(mediaRule.queries) + " {\n";
            t += 1;
        }

        // write each RuleSet
        mediaRule.rulesets.forEach(function (ruleset) {
            mediaRuleString += tabs(t) + ruleset.selector + " {\n";
            t += 1;
            for (var i in ruleset.rules) {
                mediaRuleString += tabs(t) +  i + ": " + ruleset.rules[i] + ";\n";
            }
            t -= 1;
            mediaRuleString += tabs(t) + "}\n";
        });

        // write end of Rule
        if (mediaRule.queries !== null) {
            t -= 1;
            mediaRuleString += "}\n";
        }

        return mediaRuleString;
    },

    // accepts image file path
    // returns image file info object
    //  filepath
    //  classname
    //  queries
    getImageFileInfo: function (imageFilePath, callback) {

        // TODO: check if valid image first?

        var imageFileInfo = {
            filepath: imageFilePath,
            classname: ifh.getClassname(imageFilePath),
            queries: ifh.getMediaQueries(imageFilePath)
        };

        // read image width/height
        im(imageFilePath).size(function (err, size) {

            if (err) {
                return callback.call(null, err, null);
            }

            imageFileInfo.width = size.width;
            imageFileInfo.height = size.height;

            callback.call(null, null, imageFileInfo);
        });
    },

    // accepts array of image file paths
    // returns array of image file info objects
    getImageFileInfoArray: function (imageFilePaths, callback) {
        var self = this;
        Q.all(imageFilePaths.map(function (filepath) {
            var deferred = Q.defer();

            self.getImageFileInfo(filepath, function(err, info) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve(info);
            })

            return deferred.promise;

        })).then(function (imageFileInfoArray) {
            callback.call(null, null, imageFileInfoArray);
        }).fail(function (err) {
            callback.call(null, err, null);
        }).done();
    },

    // accepts ImageFileInfoArray
    // returns hash of ImageFileInfo arrays grouped by query which acts as key
    groupImageFileInfoByQuery: function (imageFileInfoArray) {
        var imageFileInfoHash = {};

        for (var i = 0; i < imageFileInfoArray.length; i++) {
            var queries = imageFileInfoArray[i].queries;
            for (var j = 0; j < queries.length; j++) {
                if (typeof imageFileInfoHash[queries[j]] === "undefined") {
                    imageFileInfoHash[queries[j]] = [];
                }

                imageFileInfoHash[queries[j]].push(imageFileInfoArray[i]);
            };
        };

        return imageFileInfoHash;
    },

    // accepts array of image filenames
    // returns array of MediaRules
    createMediaRules: function (imageFilenames, filepath, options, callback) {

        var settings;

        // options are optional
        if (typeof arguments[2] === "function") {
            settings = {};
            callback = arguments[2];
        } else {
            settings = options;
        }

        // attach full path to files
        for (var i = 0; i < imageFilenames.length; i++) {
            imageFilenames[i] = path.join(filepath, imageFilenames[i]);
        };

        // common to all code generators
        var self = this;
        this.getImageFileInfoArray(imageFilenames, function (err, imageFileInfoArray) {

            if (err) {
                return callback.call(null, err, null);
            }

            // for CSS generator
            var imageFileInfoHash = self.groupImageFileInfoByQuery(imageFileInfoArray);

            // replace each imageFileInfoArray entry with its Ruleset
            for (query in imageFileInfoHash) {
                for (var i = 0, arr = imageFileInfoHash[query]; i < arr.length; i++) {
                    imageFileInfoHash[query][i] = self.generateRuleSet(arr[i], query, options);
                }
            }

            var mediaRules = [];

            // translate ImageFileInfoHash into MediaRule array
            for (query in imageFileInfoHash) {
                var queries = [],
                    revisedQuery,
                    exps,
                    pixelDensity;

                // if query === "1x", then it has no query
                // if query has ratio == 1, then write query with remaining expressions only
                // if query has ratio > 1, then expand to multiple queries for pixel-ratio compatibility
                if (query === "1x") {
                    queries = null;
                } else if (ifh.getRatio(query) === 1 ) {
                    revisedQuery = ifh.removeMediaDescriptorByFeature(query, 'x');
                    exps = ifh.parseMediaQueryAsExpressions(revisedQuery);
                    queries.push(self.generateMediaQuery(exps));
                } else if (ifh.getRatio(query) > 1) {
                    pixelDensity = ifh.getRatio(query);
                    revisedQuery = ifh.removeMediaDescriptorByFeature(query, 'x');
                    exps = ifh.parseMediaQueryAsExpressions(revisedQuery);
                    // produce queries with "min-" pixel density descriptors by default
                    queries = self.generateMediaQueriesWithPixelDensity(pixelDensity, false, exps);
                } else {
                    exps = ifh.parseMediaQueryAsExpressions(query);
                    queries.push(self.generateMediaQuery(exps));
                }
            
                mediaRules.push({
                    query: query,
                    queries: queries,
                    rulesets: imageFileInfoHash[query]
                })
            }

            // sort by query to ensure proper cascading
            mediaRules.sort(function (a, b) {
                return ifh.compareMediaQueries(a.query, b.query);
            })

            callback.call(null, null, mediaRules);
        })
    },

    // accepts MediaRule array
    // returns CSS string
    generateCSS: function (mediaRules, tabSpacing) {
        var css = "";
        css += "/* Generated by background-imager.js */\n\n";
        mediaRules.forEach(function (mediaRule) {
            css += BackgroundImager.generateMediaRule(mediaRule, tabSpacing) + "\n";
        });
        return css;
    }
}

// export BackgroundImager
for (i in BackgroundImager) {
    exports[i] = BackgroundImager[i];
}
