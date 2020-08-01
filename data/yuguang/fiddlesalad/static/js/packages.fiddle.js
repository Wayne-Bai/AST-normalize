(function(){

    var packages = [
        {
            "name": "jquery-history",
            "filename": "jquery.history.min.js",
            "version": "1.9",
            "description": "jQuery history plugin helps you to support back/forward buttons and bookmarks in your javascript applications.",
            "homepage": "https://github.com/tkyk/jquery-history-plugin",
            "keywords": [
                "jquery",
                "history"
            ],
            "maintainers": [
                {
                    "name": "Takayuki Miwa",
                    "web": "http://github.com/tkyk/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/tkyk/jquery-history-plugin.git"
                }
            ]

        }
        ,
        {
            "name": "jquery-gamequery",
            "filename": "jquery.gamequery.min.js",
            "version": "0.7.0",
            "description": "gameQuery is a jQuery plug-in to help make javascript game development easier by adding some simple game-related classes",
            "homepage": "http://gamequeryjs.com",
            "keywords": [
                "jquery",
                "game",
                "sprite",
                "animation",
                "collision",
                "tile map"
            ],
            "maintainers": [
                {
                    "name": "Selim Arsever",
                    "web": "https://github.com/onaluf"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "git://github.com/onaluf/gameQuery.git"
                }
            ]
        },
        {
            "name": "processing.js",
            "filename": "processing-api.min.js",
            "version": "1.4.1",
            "description": "A port of the Processing visualization language to JavaScript.",
            "homepage": "http://processingjs.org",
            "keywords": [
                "html5",
                "canvas"
            ],
            "maintainers": [
                {
                    "name": "John Resig",
                    "twitter": "jeresig",
                    "web": "http://ejohn.org"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jeresig/processing-js"
                }
            ]

        }
        ,
        {
            "name": "visibility.js",
            "filename": "visibility.min.js",
            "version": "0.6.2",
            "description": "A wrapper for the Page Visibility API",
            "homepage": "https://github.com/ai/visibility.js",
            "keywords": [
                "polyfill",
                "html5",
                "visibility"
            ],
            "maintainers": [
                {
                    "name": "Andrey Sitnik",
                    "email": "andrey@sitnik.ru",
                    "web": "http://sitnik.ru/"
                }
            ],
            "bugs": "https://github.com/ai/visibility.js/issues",
            "licenses": [
                {
                    "type": "LGPL",
                    "url": "https://github.com/ai/visibility.js/blob/master/LICENSE"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/ai/visibility.js"
                }
            ]
        }
        ,
        {
            "name": "masonry",
            "filename": "jquery.masonry.min.js",
            "version": "2.1.05",
            "description": "A dynamic layout plugin for jQuery.",
            "homepage": "http://masonry.desandro.com/",
            "keywords": [
                "jquery",
                "layout",
                "float"
            ],
            "maintainers": [
                {
                    "name": "David DeSandro",
                    "web": "http://desandro.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/desandro/masonry"
                }
            ]

        }
        ,
        {
            "name": "js-signals",
            "filename": "js-signals.min.js",
            "version": "0.8.1",
            "description": "Custom Event/Messaging system for JavaScript.",
            "homepage": "http://millermedeiros.github.com/js-signals/",
            "keywords": [
                "event",
                "messaging",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Miller Medeiros",
                    "web": "http://www.millermedeiros.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/millermedeiros/js-signals"
                }
            ]

        }
        ,
        {
            "name": "headjs",
            "filename": "head.min.js",
            "version": "0.98",
            "description": "Achieve responsive design. Load scripts on demand. Target CSS for different screens, paths, states and browsers. Make it the only script in your HEAD. A concise solution to universal issues.",
            "homepage": "http://headjs.com",
            "keywords": [
                "loader",
                "polyfill",
                "html5",
                "css3",
                "popular"
            ],
            "bugs": "https://github.com/headjs/headjs/issues",
            "maintainers": [
                {
                    "name": "Tero Piirainen",
                    "web": "http://cloudpanic.com/about.html"
                },
                {
                    "name": "Robert Hoffmann",
                    "web": "http://robert-hoffmann.name"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/headjs/headjs"
                }
            ]
        }
        ,
        {
            "name": "jsxgraph",
            "filename": "jsxgraphcore.js",
            "version": "0.96",
            "description": "JSXGraph is a cross-browser library for interactive geometry, function plotting, charting, and data visualization in a web browser.",
            "homepage": "http://jsxgraph.org/",
            "keywords": [
                "dynamic geometry",
                "function plotting",
                "mathematics education"
            ],
            "maintainers": [
                {
                    "name": "JSXGraph group at University of Bayreuth, Germany"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jsxgraph/jsxgraph.git"
                },
                {
                    "type": "git",
                    "url": "http://git.code.sf.net/p/jsxgraph/code"
                }
            ]
        }
        ,
        {
            "name": "spinejs",
            "filename": "spine.min.js",
            "version": "0.0.4",
            "description": "Spine is a lightweight framework for building JavaScript web applications",
            "homepage": "http://maccman.github.com/spine/",
            "keywords": [
                "mvc",
                "models",
                "controllers",
                "events",
                "routing",
                "popular",
                "orm"
            ],
            "maintainers": [
                {
                    "name": "Alex MacCaw",
                    "email": "info@eribium.org",
                    "web": "http://alexmaccaw.co.uk"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/maccman/spine"
                }
            ]
        }
        ,
        {
            "name": "jquery-noty",
            "filename": "jquery.noty.js",
            "version": "2.0.3",
            "description": "jQuery plugin that makes it easy to create alert, success, error, warning, information or confirmation messages as an alternative the standard alert dialog.",
            "homepage": "http://needim.github.com/noty/",
            "keywords": [
                "notifications",
                "alert",
                "dialog",
                "noty"

            ],
            "maintainers": [
                {
                    "name": "Nedim Arabacı",
                    "web": "http://ned.im"

                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/needim/noty"
                }
            ]

        },
        {
            "name": "dat-gui",
            "filename": "dat.gui.min.js",
            "version": "0.5",
            "description": "A lightweight graphical user interface for changing variables in JavaScript.",
            "homepage": "http://code.google.com/p/dat-gui/",
            "keywords": [
                "ui",
                "DataArtsTeam"
            ],
            "maintainers": [
                {
                    "name": "George Michael Brower",
                    "web": "http://www.georgemichaelbrower.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://code.google.com/p/dat-gui/"
                }
            ]
        }
        ,
        {
            "name": "html5shiv",
            "filename": "html5shiv.js",
            "version": "3.6.1",
            "description": "html5shiv is an HTML5 JavaScript shim for IE to recognise and style the HTML5 elements",
            "homepage": "https://github.com/aFarkas/html5shiv",
            "keywords": [
                "shim",
                "ie",
                "html5"
            ],
            "maintainers": [
                {
                    "name": "Alexander Farkas",
                    "email": "info@corrupt-system.de"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/aFarkas/html5shiv.git"
                }
            ]
        }
        ,
        {
            "author": "Eduardo Cereto Carvalho (http://www.cardinalpath.com)",
            "name": "gas",
            "filename": "gas.min.js",
            "description": "Google Analytics on Steroids, a Google Analytics implementation with extra features.",
            "version": "1.10.1",
            "homepage": "https://github.com/CardinalPath/gas",
            "keywords": [
                "Google Analytics",
                "Web Analytics"
            ],
            "repository": {
                "type": "git",
                "url": "git://https://github.com/CardinalPath/gas.git"
            },
            "bugs": "https://github.com/CardinalPath/gas/issues",
            "license": "MIT"
        }
        ,
        {
            "name": "SyntaxHighlighter",
            "filename": "scripts/shCore.js",
            "version": "3.0.83",
            "description": "SyntaxHighlighter is a fully functional self-contained code syntax highlighter developed in JavaScript.",
            "homepage": "http://alexgorbatchev.com/SyntaxHighlighter",
            "keywords": [
                "highlight",
                "highlighter"
            ],
            "maintainers": [
                {
                    "name": "Alex Gorbatchev"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/alexgorbatchev/SyntaxHighlighter.git"
                }
            ]
        },
        {
            "name": "labjs",
            "filename": "LAB.min.js",
            "version": "2.0.3",
            "description": "LABjs (Loading And Blocking JavaScript) is an open-source (MIT license) project supported by Getify Solutions. The core purpose of LABjs is to be an all-purpose, on-demand JavaScript loader, capable of loading any JavaScript resource, from any location, into any page, at any time. Loading your scripts with LABjs reduces resource blocking during page-load, which is an easy and effective way to optimize your site's performance.",
            "homepage": "http://labjs.com/",
            "keywords": [
                "loader",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Kyle Simpson",
                    "website": "http://getify.me/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/getify/LABjs"
                }
            ]

        }
        ,
        {
            "name": "json3",
            "version": "3.2.4",
            "filename": "json3.min.js",
            "description": "A modern JSON implementation compatible with nearly all JavaScript platforms.",
            "homepage": "http://bestiejs.github.com/json3",
            "main": "json3",
            "keywords": [
                "json",
                "spec",
                "ecma",
                "es5",
                "lexer",
                "parser",
                "stringify"
            ],
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://kit.mit-license.org"
                }
            ],
            "author": {
                "name": "Kit Cambridge",
                "web": "http://kitcambridge.github.com"
            },
            "maintainers": [
                {
                    "name": "Kit Cambridge",
                    "web": "http://kitcambridge.github.com"
                }
            ],
            "bugs": "http://github.com/bestiejs/json3/issues",
            "repository": {
                "type": "git",
                "url": "git://github.com/bestiejs/json3.git"
            }
        },
        {
            "name": "jquery-mockjax",
            "filename": "jquery.mockjax.js",
            "version": "1.5.1",
            "description": "Mockjax. The jQuery Mockjax Plugin provides a simple and extremely flexible interface for mocking or simulating ajax requests and responses.",
            "homepage": "http://code.appendto.com/plugins/jquery-mockjax/",
            "keywords": [ "ajax", "mock", "unit" ],
            "author": "Jonathan Sharp (http://jdsharp.com/)",
            "bugs": "http://github.com/appendto/jquery-mockjax/issues",
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://appendto.com/open-source-licenses"
                },
                {
                    "type": "GPLv2",
                    "url": "http://appendto.com/open-source-licenses"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "http://github.com/appendto/jquery-mockjax.git"
                }
            ],
            "dependencies": {
                "jquery": [ "1.3.2", "1.4.4", "1.5.2", "1.6.4", "1.7" ]
            },
            "maintainers": [
                {
                    "name": "Jonathan Sharp",
                    "email": "jsharp@appendto.com"
                }
            ]
        }
        ,
        {
            "name": "css3pie",
            "version": "1.0.0",
            "filename": "PIE.js",
            "homepage": "http://css3pie.com",
            "description": "CSS3 PIE JavaScript edition. Enables rendering of common CSS3 decoration properties in Internet Explorer 6-9.",
            "keywords": [
                "polyfill",
                "css3",
                "ie"
            ],
            "maintainers": [
                {
                    "name": "Jason Johnston",
                    "email": "jason@css3pie.com",
                    "web": "http://lojjic.com"
                }
            ],
            "bugs": "https://github.com/lojjic/PIE/issues/",
            "licenses": [
                {
                    "type": "Apache-2.0",
                    "url": "https://github.com/lojjic/PIE/blob/master/LICENSE-APACHE2.txt"
                },
                {
                    "type": "GPL-2.0",
                    "url": "https://github.com/lojjic/PIE/blob/master/LICENSE-GPL2.txt"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/lojjic/PIE.git"
                }
            ]
        }
        ,
        {
            "name": "bonsai",
            "filename": "bonsai.min.js",
            "version": "0.4.1",
            "description": "BonsaiJS is a graphics library and renderer",
            "homepage": "http://bonsaijs.org",
            "keywords": [
                "graphics",
                "svg",
                "vector"
            ],
            "maintainers": [{
                "name": "uxebu Inc.",
                "email": "contact+bonsaijs@uxebu.com",
                "web": "http://uxebu.com"
            }],
            "repositories": [{
                "type": "git",
                "url": "https://github.com/uxebu/bonsai/"
            }]
        }
        ,
        {
            "name": "highcharts",
            "filename": "highcharts.js",
            "version": "2.3.1",
            "description": "Highcharts is a charting library written in pure JavaScript, offering an easy way of adding interactive charts to your web site or web application. Highcharts currently supports line, spline, area, areaspline, column, bar, pie and scatter chart types. Highcharts is NOT free for commercial use.  See the license here: http://highcharts.com/license",
            "homepage": "http://highcharts.com/",
            "keywords": [
                "charts",
                "graphs"
            ],
            "maintainers": [
                {
                    "name": "Torstein Hønsi (Highslide Software)",
                    "web": "http://highsoft.com/"
                }
            ]
        }
        ,
        {
            "name": "davis.js",
            "filename": "davis.min.js",
            "version": "0.9.5",
            "description": "Davis.js is a small JavaScript library using HTML5 history.pushState that allows simple Sinatra style routing for your JavaScript apps.",
            "homepage": "http://davisjs.com",
            "keywords": [
                "routing",
                "pushState",
                "restful"
            ],
            "maintainers": [
                {
                    "name": "Oliver Nightingale",
                    "email": "oliver.nightingale1@gmail.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/olivernn/davis.js"
                }
            ]
        }
        ,
        {
            "name": "sammy.js",
            "filename": "sammy.min.js",
            "version": "0.7.2",
            "description": "Sammy is a tiny javascript framework built on top of jQuery, It's RESTful Evented Javascript.",
            "homepage": "http://sammyjs.org/",
            "keywords": [
                "framework",
                "restful",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Aaron Quint"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/quirkey/sammy"
                }
            ]

        }
        ,
        {
            "name": "d3",
            "filename": "d3.v2.min.js",
            "version": "2.10.0",
            "description": "A small, free JavaScript library for manipulating documents based on data.",
            "keywords": [
                "dom",
                "w3c",
                "visualization",
                "svg",
                "animation",
                "canvas"
            ],
            "homepage": "http://mbostock.github.com/d3/",
            "author": {
                "name": "Mike Bostock",
                "email": "mbostock@gmail.com",
                "url": "http://bost.ocks.org/mike"
            },
            "repository": {
                "type": "git",
                "url": "http://github.com/mbostock/d3.git"
            }
        }
        ,
        {
            "name": "jquery.activity-indicator",
            "filename": "jquery.activity-indicator.min.js",
            "version": "1.0.0",
            "description": "A jQuery plugin that renders a translucent activity indicator (spinner) using SVG or VML.",
            "homepage": "http://neteye.github.com/activity-indicator.html",
            "keywords": [
                "jquery",
                "loader",
                "indicator"
            ],
            "maintainers": [
                {
                    "name": "Felix Gnass",
                    "email": "felix.gnass@riotfamily.org",
                    "web": "http://fgnass.github.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/neteye/jquery-plugins"
                }
            ]
        }
        ,
        {
            "filename": "text.js",
            "name": "require-text",
            "version": "2.0.3",
            "description": "A RequireJS/AMD loader plugin for loading text resources.",
            "homepage": "https://github.com/requirejs/text",
            "keywords": [
                "requirejs",
                "text"
            ],
            "maintainers": [
                {
                    "name": "James Burke",
                    "email": "jrburke@gmail.com",
                    "web": "http://tagneto.blogspot.ru/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/requirejs/text"
                }
            ]
        }
        ,
        {
            "name": "backbone.js",
            "filename": "backbone-min.js",
            "version": "0.9.9",
            "description": "Backbone supplies structure to JavaScript-heavy applications by providing models with key-value binding and custom events, collections with a rich API of enumerable functions, views with declarative event handling, and connects it all to your existing application over a RESTful JSON interface.",
            "homepage": "http://documentcloud.github.com/backbone/",
            "keywords": [
                "collections",
                "models",
                "controllers",
                "events",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Jeremy Ashkenas",
                    "email": "jashkenas@gmail.com",
                    "web": "http://ashkenas.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/documentcloud/backbone"
                }
            ]

        }
        ,
        {
            "name": "sugar",
            "version": "1.3.7",
            "filename": "sugar.min.js",
            "description": "Sugar is a Javascript library that extends native objects with helpful methods. It is designed to be intuitive, unobtrusive, and let you do more with less code.",
            "keywords": [
                "functional",
                "utility",
                "ender"
            ],
            "homepage": "http://sugarjs.com/",
            "author": "Andrew Plummer",
            "main": "./1.3.6/sugar.min.js",
            "directories": {
                "lib": "./lib"
            },
            "repository": {
                "type": "git",
                "url": "https://github.com/andrewplummer/Sugar.git"
            },
            "engines": {
                "node": ">= 0.4.0"
            },
            "scripts": {
                "test": "./unit_tests/node.sh"
            }
        }
        ,
        {
            "name": "moment.js",
            "filename": "moment.min.js",
            "version": "1.7.2",
            "description": "A lightweight (4.3k) javascript date library for parsing, manipulating, and formatting dates.",
            "homepage": "http://momentjs.com/",
            "keywords": [
                "date",
                "moment",
                "time"
            ],
            "maintainers": [
                {
                    "name": "Tim Wood"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/timrwood/moment"
                }
            ]
        }
        ,
        {
            "name": "knockout.mapping",
            "filename": "knockout.mapping.js",
            "version": "2.3.4",
            "description": "Object mapping plugin for Knockout",
            "homepage": "http://knockoutjs.com/documentation/plugins-mapping.html",
            "keywords": [
                "knockout",
                "mvvm",
                "ui",
                "templating",
                "mapping"
            ],
            "maintainers": [
                {
                    "name": "Steven Sanderson",
                    "email": "steve@codeville.net",
                    "web": "http://blog.stevensanderson.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/SteveSanderson/knockout.mapping"
                }
            ]
        },
        {
            "name": "mousetrap",
            "filename": "mousetrap.min.js",
            "version": "1.2.2",
            "description": "Mousetrap is a standalone library with no external dependencies. It weighs in at around 1.7kb minified and gzipped and 3kb minified.",
            "homepage": "http://craig.is/killing/mice",
            "keywords": [
                "keyboard",
                "shortcut",
                "mouse"
            ],
            "maintainers": [
                {
                    "name": "Craig Campbell"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/ccampbell/mousetrap.git"
                }
            ]
        }
        ,
        {
            "name": "yepnope",
            "filename": "yepnope.min.js",
            "version": "1.5.4",
            "description": "yepnope is a small wrapper around the super-fast LABjs script loader, and it allows you to load only the scripts that your users need.",
            "homepage": "http://yepnopejs.com/",
            "keywords": [
                "loader",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Alex Sexton",
                    "twitter": "SlexAxton",
                    "web": "http://alexsexton.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/SlexAxton/yepnope.js"
                }
            ]

        }
        ,
        {
            "name": "path.js",
            "filename": "path.min.js",
            "version": "0.8.4",
            "description": "PathJS is a lightweight, client-side routing library that allows you to create 'single page' applications using Hashbangs and/or HTML5 pushState.",
            "homepage": "https://github.com/mtrpcic/pathjs",
            "keywords": [
                "path",
                "routing",
                "fragment",
                "hash",
                "push-state"
            ],
            "maintainers": [
                {
                    "name": "mtrpcic"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/mtrpcic/pathjs"
                }
            ]
        },
        {
            "name": "jquery.formalize",
            "filename": "jquery.formalize.min.js",
            "version": "1.2",
            "description": "teach your forms some manners",
            "homepage": "http://formalize.me/",
            "keywords": [
                "forms",
                "formalize",
                "form",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Nathan Smith (Author)",
                    "web": "https://plus.google.com/115310247179926591656/about"
                },
                {
                    "name": "Markus Reiter",
                    "web": "http://reitermark.us/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/nathansmith/formalize"
                }
            ]
        }
        ,
        {
            "name": "flot",
            "filename": "jquery.flot.min.js",
            "version": "0.7",
            "description": "Attractive Javascript plotting for jQuery",
            "homepage": "http://code.google.com/p/flot/",
            "keywords": [
                "jquery",
                "plot",
                "chart",
                "graph",
                "visualization",
                "canvas",
                "graphics",
                "web"
            ],
            "maintainers": [
                {
                    "name": "Ole Laursen"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/flot/flot"
                }
            ]

        }
        ,
        {
            "name": "showdown",
            "filename": "showdown.min.js",
            "version": "0.3.1",
            "description": "A JavaScript port of Markdown",
            "homepage":  "https://github.com/coreyti/showdown",
            "keywords": [
                "markdown",
                "converter"
            ],
            "contributors": [
                "John Gruber",
                "John Fraser",
                "Corey Innis",
                "Remy Sharp",
                "Konstantin Käfer",
                "Roger Braun",
                "Dominic Tarr",
                "Cat Chen",
                "Titus Stone",
                "Rob Sutherland",
                "Pavel Lang",
                "Ben Combee",
                "Adam Backstrom",
                "Pascal Deschênes"
            ],
            "repositories": [
                {
                    "type": "git",
                    "url":  "https://github.com/coreyti/showdown"
                }
            ],
            "licenses": [{
                "type": "BSD",
                "url":  "https://github.com/coreyti/showdown/raw/master/license.txt"
            }]
        },
        {
            "name": "zepto",
            "filename": "zepto.min.js",
            "description": "Zepto.js is a minimalist JavaScript library for modern browsers, with a jQuery-compatible API",
            "version": "1.0rc1",
            "homepage": "http://zeptojs.com",
            "keywords": [
                "mobile",
                "framework"
            ],
            "maintainers": [
                {
                    "name": "Thomas Fuchs"
                }
            ],
            "repository": {
                "type": "git",
                "url": "https://github.com/madrobby/zepto.git"
            },
            "bugs": "https://github.com/madrobby/zepto/issues",
            "licenses": [
                {
                    "type": "MIT",
                    "url": "https://raw.github.com/madrobby/zepto/master/MIT-LICENSE"
                }
            ]
        },
        {
            "name": "punycode",
            "version": "1.0.0",
            "filename": "punycode.min.js",
            "description": "A robust Punycode converter that fully complies to RFC 3492 and RFC 5891, and works on nearly all JavaScript platforms.",
            "homepage": "http://mths.be/punycode",
            "main": "punycode.js",
            "keywords": [
                "punycode",
                "unicode",
                "idn",
                "url",
                "domain"
            ],
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://mths.be/mit"
                }
            ],
            "author": {
                "name": "Mathias Bynens",
                "email": "mathias@qiwi.be",
                "web": "http://mathiasbynens.be/"
            },
            "maintainers": [
                {
                    "name": "Mathias Bynens",
                    "email": "mathias@qiwi.be",
                    "web": "http://mathiasbynens.be/"
                },
                {
                    "name": "John-David Dalton",
                    "email": "john@fusejs.com",
                    "web": "http://allyoucanleet.com/"
                }
            ],
            "bugs": "https://github.com/bestiejs/punycode.js/issues",
            "repository": {
                "type": "git",
                "url": "https://github.com/bestiejs/punycode.js.git"
            },
            "engines": [
                "node",
                "rhino"
            ],
            "directories": {
                "doc": "docs",
                "test": "tests"
            }
        },
        {
            "name": "1140",
            "filename": "1140.css",
            "version": "2.0",
            "description": "The 1140 grid fits perfectly into a 1280 monitor. On smaller monitors it becomes fluid and adapts to the width of the browser.",
            "homepage": "http://cssgrid.net/",
            "keywords": [
                "1140"
            ],
            "maintainers": [
                {
                    "name": "Andy Taylor",
                    "web": "http://www.andytlr.com/"
                }
            ],
            "repositories": []
        }
        ,
        {
            "name": "crossroads",
            "filename": "crossroads.min.js",
            "version": "0.11.0",
            "description": "Flexible router which can be used in multiple environments",
            "homepage": "http://millermedeiros.github.com/crossroads.js/",
            "keywords": [
                "routes",
                "event",
                "observer",
                "routing",
                "router"
            ],
            "maintainers": [
                {
                    "name": "Miller Medeiros",
                    "web": "http://millermedeiros.com/",
                    "email": "contact@millermedeiros.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/millermedeiros/crossroads.js.git"
                }
            ],
            "dependencies": {
                "signals": "<2.0"
            },
            "licenses" : [
                {
                    "type": "MIT",
                    "url": "http://opensource.org/licenses/mit-license.php"
                }
            ],
            "bugs": "https://github.com/millermedeiros/crossroads.js/issues"
        }
        ,
        {
            "name": "chosen",
            "filename": "chosen.jquery.min.js",
            "version": "0.9.11",
            "description": "Chosen is a JavaScript plugin that makes long, unwieldy select boxes much more user-friendly. It is currently available in both jQuery and Prototype flavors.",
            "homepage": "http://harvesthq.github.com/chosen",
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/harvesthq/chosen.git"
                }
            ]
        }
        ,
        {
            "filename": "cs.js",
            "name": "require-cs",
            "version": "0.4.2",
            "description": "Load files written in CoffeeScript.",
            "homepage": "https://github.com/jrburke/require-cs",
            "keywords": [
                "requirejs",
                "coffeescript",
                "coffee"
            ],
            "maintainers": [
                {
                    "name": "James Burke",
                    "email": "jrburke@gmail.com",
                    "web": "http://tagneto.blogspot.ru/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jrburke/require-cs"
                }
            ]
        }
        ,
        {
            "name": "augment.js",
            "filename": "augment.min.js",
            "version": "0.4.2",
            "description": "Enables use of modern JavaScript by augmenting built in objects with the latest JavaScript methods.",
            "homepage": "http://augmentjs.com",
            "keywords": [
                "es5",
                "ECMAScript 5",
                "shim",
                "compatibility",
                "modernization"
            ],
            "maintainers": [
                {
                    "name": "Oliver Nightingale",
                    "email": "oliver.nightingale1@gmail.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/olivernn/augment.js"
                }
            ]
        }
        ,
        {
            "name": "lazyload",
            "filename": "lazyload-min.js",
            "version": "2.0.3",
            "description": "Tiny, dependency-free async JavaScript and CSS loader.lo",
            "homepage": "https://github.com/rgrove/lazyload/",
            "keywords": [
                "loader",
                "modules",
                "asynchronous"
            ],
            "maintainers": [
                {
                    "name": "Ryan Grove",
                    "email": "ryan@wonko.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/rgrove/lazyload/"
                }
            ]

        }
        ,
        { "name"            : "sylvester"
            , "filename"	    : "sylvester.js"
            , "description"     : "Vector and Matrix math for JavaScript"
            , "homepage"        : "http://sylvester.jcoglan.com/"
            , "author"          : "James Coglan <jcoglan@gmail.com> (http://jcoglan.com/)"
            , "keywords"        : ["vector", "matrix", "geometry", "math"]

            , "version"         : "0.1.3"
            , "engines"         : {"node": ">=0.4.0"}
            , "main"            : "./lib/sylvester"
            , "devDependencies" : {"jsclass": ""}

            , "scripts"         : {"test": "node test/console.js"}

            , "bugs"            : "http://github.com/jcoglan/sylvester/issues"

            , "licenses"        : [ { "type"    : "MIT"
            , "url"     : "http://www.opensource.org/licenses/mit-license.php"
        }
        ]

            , "repositories"    : [ { "type"    : "git"
            , "url"     : "git://github.com/jcoglan/sylvester.git"
        }
        ]
        }
        ,
        {
            "name": "shred",
            "filename": "shred.bundle.min.js",
            "version": "0.7.12",
            "description": "Shred is an HTTP client library for browsers and node.js. Shred supports gzip, cookies, https, proxies, and redirects.",
            "homepage": "https://github.com/automatthew/shred",
            "keywords": [
                "http",
                "xhr",
                "ajax",
                "browserify"
            ],
            "maintainers": [
                {
                    "name": "Spire.io",
                    "email": "contact@spire.io",
                    "web": "http://spire.io"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/spire-io/shred"
                }
            ]
        }
        ,
        {
            "name": "numeral.js",
            "filename": "numeral.min.js",
            "version": "1.4.5",
            "description": "A lightweight javascript library to format and manipulate numbers.",
            "homepage": "http://numeraljs.com/",
            "keywords": [
                "numeral",
                "number",
                "format",
                "time",
                "money",
                "percentage"
            ],
            "maintainers": [
                {
                    "name": "Adam Draper"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/adamwdraper/Numeral-js"
                }
            ]
        },
        {
            "name": "graphael",
            "filename": "g.raphael-min.js",
            "version": "0.5.0",
            "description": "gRaphael's goal is to help you create stunning charts on your website. It is based on Raphaël graphics library.",
            "homepage": "http://g.raphaeljs.com/",
            "keywords": [
                "chart",
                "charts",
                "charting",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Dmitry Baranovskiy",
                    "web": "http://dmitry.baranovskiy.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/DmitryBaranovskiy/g.raphael/"
                }
            ]

        }
        ,
        {
            "name": "socket.io",
            "filename": "socket.io.min.js",
            "version": "0.9.10",
            "description": "Browser-side code for Socket.IO. Socket.IO aims to make realtime apps possible in every browser and mobile device, blurring the differences between the different transport mechanisms.",
            "homepage": "http://socket.io",
            "keywords": [
                "websockets",
                "node",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "LearnBoost"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "git://github.com/LearnBoost/Socket.IO.git"
                }
            ]
        }
        ,
        {
            "name": "angular.js",
            "filename": "angular.min.js",
            "description": "AngularJS is an MVC framework for building web applications. The core features include HTML enhanced with custom component and data-binding capabilities, dependency injection and strong focus on simplicity, testability, maintainability and boiler-plate reduction.",
            "version": "1.0.3",
            "homepage": "http://angularjs.org",
            "keywords": [
                "framework",
                "mvc",
                "AngularJS",
                "angular",
                "angular.js"
            ],
            "contributors": [
                {
                    "name": "Miško Hevery"
                },
                {
                    "name": "Igor Minár"
                },
                {
                    "name": "Vojta Jína"
                },
                {
                    "name": "Adam Abrons"
                },
                {
                    "name": "Brad Green"
                }
            ],
            "repositories": [{
                "type": "git",
                "url": "git://github.com/angular/angular.js.git"
            }],
            "bugs": "https://github.com/angular/angular.js/issues",
            "licenses": [
                {
                    "type": "MIT",
                    "url": "https://github.com/angular/angular.js/blob/master/LICENSE"
                }
            ]
        }
        ,
        {
            "name": "placeholder-shiv",
            "filename": "placeholder-shiv.js",
            "description": "A tiny polyfill for the placeholder attribute. Requires Prototype.js or jQuery",
            "version": "0.2",
            "homepage": "https://github.com/walterdavis/placeholder-shiv",
            "keywords": [
                "html5",
                "polyfill"
            ],
            "maintainers": [
                {
                    "name": "Walter Davis"
                }
            ],
            "repository": {
                "type": "git",
                "url": "https://github.com/walterdavis/placeholder-shiv.git"
            },
            "bugs": "https://github.com/walterdavis/placeholder-shiv/issues",
            "licenses": [
                {
                    "type": "BSD",
                    "url": "https://github.com/walterdavis/placeholder-shiv/blob/master/LICENSE.txt"
                }
            ]
        },
        {
            "filename": "domReady.js",
            "name": "require-domReady",
            "version": "2.0.1",
            "description": "Wait for the DOM is ready.",
            "homepage": "https://github.com/requirejs/domReady",
            "keywords": [
                "requirejs",
                "domready"
            ],
            "maintainers": [
                {
                    "name": "James Burke",
                    "email": "jrburke@gmail.com",
                    "web": "http://tagneto.blogspot.ru/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/requirejs/domReady"
                }
            ]
        }
        ,
        {
            "name": "jplayer",
            "filename": "jquery.jplayer.min.js",
            "version": "2.2.0",
            "description": "The jQuery HTML5 Audio / Video Library",
            "homepage": "http://www.jplayer.org/",
            "keywords": [
                "framework",
                "audio",
                "video",
                "html5"
            ],
            "maintainers": [
                {
                    "name": "Happyworm",
                    "web": "http://www.happyworm.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/happyworm/jPlayer.git"
                }
            ]
        },
        {
            "name": "jo",
            "filename": "jo.min.js",
            "description": "Jo is a thin (~12K) candy shell for PhoneGap apps. It's an HTML5 mobile app framework which provides UI widgets, a flexible event model, a wrapper for sound, and a light data layer.",
            "version": "0.4.1",
            "homepage": "http://joapp.com",
            "keywords": [
                "mobile",
                "framework"
            ],
            "maintainers": [
                {
                    "name": "David Balmer"
                }
            ],
            "repository": {
                "type": "git",
                "url": "https://github.com/davebalmer/jo.git"
            },
            "bugs": "https://github.com/davebalmer/jo/issues",
            "licenses": [
                {
                    "type": "Redistribution",
                    "url": "http://joapp.com/docs/#License"
                }
            ]
        },
        {
            "name": "jquery.tablesorter",
            "filename": "jquery.tablesorter.min.js",
            "version": "2.5.2",
            "description": "tablesorter is a jQuery plugin for turning a standard HTML table with THEAD and TBODY tags into a sortable table without page refreshes. tablesorter can successfully parse and sort many types of data including linked data in a cell.",
            "author": "Christian Bach, Mottie",
            "homepage": "http://mottie.github.com/tablesorter/docs/",
            "repository": {
                "type": "git",
                "url": "https://github.com/Mottie/tablesorter.git"
            }
        }
        ,
        {
            "name": "prototype",
            "filename": "prototype.js",
            "version": "1.7.1.0",
            "description": "Prototype is a JavaScript Framework that aims to ease development of dynamic web applications.",
            "homepage": "http://prototypejs.org/",
            "keywords": [
                "framework",
                "toolkit",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Prototype Core Team"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/sstephenson/prototype.git"
                }
            ]
        }
        ,
        {
            "name": "jquery",
            "filename": "jquery.min.js",
            "version": "1.8.3",
            "description": "jQuery is a fast and concise JavaScript Library that simplifies HTML document traversing, event handling, animating, and Ajax interactions for rapid web development. jQuery is designed to change the way that you write JavaScript.",
            "homepage": "http://jquery.com/",
            "keywords": [
                "framework",
                "toolkit",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "The jQuery Project"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jquery/jquery.git"
                }
            ]
        }
        ,
        {
            "name": "jquery-tools",
            "filename": "jquery.tools.min.js",
            "version": "1.2.6",
            "description": "jQuery Tools is a collection of the most important user-interface components for modern websites. Used by large sites all over the world.",
            "homepage": "http://jquerytools.org/",
            "keywords": [
                "jquery",
                "ui",
                "tools"
            ],
            "maintainers": [
                {
                    "name": "jQuery Tools",
                    "email": "tipiirai+jquerytools@gmail.com",
                    "web": "http://jquerytools.org/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jquerytools/jquerytools"
                }
            ]

        }
        ,
        {
            "name": "pubnub",
            "filename": "pubnub.min.js",
            "version": "3.1.2",
            "description": "PubNub, a new kind of Cloud-Hosted Broadcasting Service for Mass Communication.",
            "homepage": "http://www.pubnub.com/",
            "keywords": [
                "realtime",
                "messaging",
                "broadcasting",
                "publish",
                "subscribe",
                "mobile",
                "tablet",
                "android",
                "iphone",
                "html5",
                "webos",
                "cloud",
                "service",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "PubNub + TopMambo INC"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/pubnub/pubnub-api.git"
                }
            ]
        }
        ,
        {
            "name": "ninjaui",
            "filename": "jquery.ninjaui.min.js",
            "version": "1.0.1",
            "description": "The jQuery plugin for lethal interaction",
            "homepage": "http://ninjaui.com/",
            "keywords": [
                "ninjaui",
                "ui",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Jamie R. Hoover and Faisal N. Jawdat",
                    "web": "http://ninjaui.com/"
                }
            ],
            "bugs": "https://github.com/ninja/ui/issues/",

            "repositories": [
                {
                    "type": "plain file",
                    "url": "https://github.com/ninja/ui/"
                }
            ]

        }
        ,
        {
            "name": "ocanvas",
            "filename": "ocanvas.min.js",
            "version": "2.2.2",
            "description": "oCanvas is a JavaScript library that makes development with HTML5 canvas easy, by using an object-based approach.",
            "homepage": "http://ocanvas.org/",
            "keywords": [
                "html5",
                "canvas"
            ],
            "maintainers": [
                {
                    "name": "Johannes Koggdal",
                    "twitter": "JohannesKoggdal",
                    "web": "http://koggdal.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/koggdal/ocanvas"
                }
            ]

        }
        ,
        {
            "name": "jquery.colorbox",
            "filename": "jquery.colorbox-min.js",
            "version": "1.3.20.1",
            "description": "A lightweight customizable lightbox plugin for jQuery",
            "author": "Jack Moore (http://www.jacklmoore.com/)",
            "homepage": "http://www.jacklmoore.com/colorbox",
            "repository": {
                "type": "git",
                "url": "git://github.com/jackmoore/colorbox.git"
            }
        },
        {
            "name": "qunit",
            "filename": "qunit-1.10.0.js",
            "version": "1.10.0",
            "description": "An easy-to-use JavaScript Unit Testing framework.",
            "homepage": "http://qunitjs.com/",
            "keywords": [
                "framework",
                "toolkit",
                "popular",
                "unit tests"
            ],
            "maintainers": [
                {
                    "name": "The jQuery Foundation.",
                    "web": "http://jquery.org/team/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jquery/qunit.git"
                }
            ]
        }
        ,
        {
            "name": "script.js",
            "filename": "script.min.js",
            "version": "1.3",
            "description": "$script.js is an asynchronous JavaScript loader and dependency manager with an astonishingly impressive lightweight footprint",
            "homepage": "http://www.dustindiaz.com/scriptjs/",
            "keywords": [
                "loader",
                "asynchronous",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Dustin Diaz",
                    "web": "http://www.dustindiaz.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/ded/script.js"
                }
            ]

        }
        ,
        {
            "name": "remoteStorage",
            "version": "0.6.9",
            "filename": "remoteStorage.min.js",
            "description": "Client-side Javascript library to make apps remoteStorage-compatible.",
            "homepage": "http://remotestoragejs.com",
            "repositories": [
                {"type": "git", "url": "https://github.com/unhosted/remoteStorage.js"}
            ],
            "maintainers": [
                {"name": "Niklas Cathor", "url": "nil.niklas@googlemail.com"}
            ],
            "licenses": [
                {"type": "AGPL", "url": "https://www.gnu.org/licenses/agpl-3.0.en.html"},
                {"type": "MIT", "url": "http://opensource.org/licenses/MIT"}
            ],
            "keywords": [
                "remoteStorage",
                "unhosted",
                "storage",
                "cloud",
                "read-write-web",
                "webdav",
                "webfinger",
                "oauth",
                "xrd"
            ]
        }
        ,
        {
            "name": "datejs",
            "filename": "date.min.js",
            "version": "1.0",
            "description": "Datejs is an open source JavaScript Date library for parsing, formatting and processing.",
            "homepage": "http://www.datejs.com",
            "keywords": [
                "date",
                "datetime",
                "time",
                "parser"
            ],
            "maintainers": [
                {
                    "name": "Geoffrey Mcgill",
                    "email":"geoff@geoff.ca",
                    "twitter":"datejs"
                }
            ],
            "repositories": [
                {
                    "type": "Google SVN",
                    "url": "http://code.google.com/p/datejs/source"
                },
                {
                    "type": "git",
                    "url": "https://github.com/datejs/Datejs"
                }
            ]

        },
        {
            "name": "selectivizr",
            "filename": "selectivizr-min.js",
            "version": "1.0.2",
            "description": "selectivizr is a JavaScript utility that emulates CSS3 pseudo-classes and attribute selectors in Internet Explorer 6-8. Simply include the script in your pages and selectivizr will do the rest.",
            "homepage": "http://selectivizr.com/",
            "keywords": [
                "css3",
                "ie"
            ],
            "maintainers": [
                {
                    "name": "Keith Clark",
                    "email": "create@keithclark.co.uk",
                    "web": "http://www.keithclark.co.uk/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/keithclark/selectivizr"
                }
            ]
        }
        ,
        {
            "name": "paper.js",
            "filename": "paper.js",
            "version": "0.22",
            "description": "Paper.js is an open source vector graphics scripting framework that runs on top of the HTML5 Canvas.",
            "homepage": "http://paperjs.org/",
            "keywords": [
                "paper",
                "paper.js"
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/paperjs/paper.js.git"
                }
            ]

        }
        ,
        {
            "name": "rickshaw",
            "filename": "rickshaw.min.js",
            "version": "1.1.0",
            "description": "JavaScript toolkit for creating interactive real-time graphs",
            "keywords": [
                "graphs",
                "charts",
                "interactive",
                "time-series",
                "svg",
                "d3",
                "bars",
                "lines",
                "scatterplot"
            ],
            "homepage": "http://code.shutterstock.com/rickshaw/",
            "author": {
                "name": "David Chester",
                "email": "david@shutterstock.com"
            },
            "repository": {
                "type": "git",
                "url": "https://github.com/shutterstock/rickshaw.git"
            }
        }
        ,
        {
            "name": "psd.js",
            "filename": "psd.min.js",
            "version": "0.4.5",
            "description": "A Photoshop (PSD) file parser in Javascript/Coffeescript",
            "homepage": "http://meltingice.github.com/psd.js/",
            "keywords": [
                "images",
                "popular",
                "psd",
                "parser",
                "node"
            ],
            "maintainers": [
                {
                    "name": "Ryan LeFevre",
                    "web": "http://meltingice.net"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/meltingice/psd.js.git"
                }
            ]
        }
        ,
        {
            "name": "mobilizejs",
            "filename": "mobilize.min.js",
            "description": "A HTML5 and Javascript framework to transform websites to mobile sites.",
            "version": "0.9",
            "homepage": "http://mobilizejs.com",
            "keywords": [
                "mobile",
                "framework"
            ],
            "maintainers": [
                {
                    "name": "Mikko Ohtamaa",
                    "name": "Jussi Toivola"
                }
            ],
            "repository": {
                "type": "git",
                "url": "https://github.com/mobilizejs/mobilize.js.git"
            },
            "bugs": "https://github.com/mobilizejs/mobilize.js/issues",
            "licenses": [
                {
                    "type": "Creative Commons",
                    "url": "http://mobilizejs.com/documentation/"
                }
            ]
        },
        {
            "name": "backbone.syphon",
            "filename": "backbone.syphon.min.js",
            "version": "0.4.1",
            "description": "Serialize a Backbone.View in to a JavaScript object",
            "homepage": "http://github.com/derickbailey/backbone.syphon/",
            "keywords": [
                "modelbinding",
                "models"
            ],
            "maintainers": [
                {
                    "name": "Derick Bailey",
                    "email": "derickbailey@gmail.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/derickbailey/backbone.syphon"
                }
            ]
        },
        {
            "name": "stapes",
            "filename": "stapes.min.js",
            "author" : "Hay Kranen <hay@bykr.org>",
            "homepage" : "http://hay.github.com/stapes",
            "description": "A (really) tiny Javascript MVC microframework.",
            "keywords": ["mvc", "framework", "lightweight"],
            "version": "0.5.1",
            "repository" : {
                "type" : "git",
                "url" : "http://github.com/hay/stapes.git"
            },
            "maintainers": [
                {
                    "name": "Hay Kranen",
                    "email": "hay@bykr.org",
                    "web": "http://www.haykranen.nl"
                }
            ]
        },
        {
            "name": "cannon.js",
            "filename": "cannon.min.js",
            "version": "0.4.3",
            "description": "A lightweight 3D physics engine written in JavaScript.",
            "homepage": "http://schteppe.github.com/cannon.js",
            "keywords": [
                "javascript",
                "physics"
            ],
            "maintainers": [
                {
                    "name": "Stefan Hedman",
                    "web": "http://steffe.se/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/schteppe/cannon.js"
                }
            ]
        }
        ,
        {
            "name": "knockout",
            "filename": "knockout-min.js",
            "version": "2.2.0",
            "description": "Simplify dynamic JavaScript UIs by applying the Model-View-View Model (MVVM)",
            "homepage": "http://knockoutjs.com/",
            "keywords": [
                "mvvm",
                "ui",
                "templating"
            ],
            "maintainers": [
                {
                    "name": "Steven Sanderson",
                    "email": "steve@codeville.net",
                    "web": "http://blog.stevensanderson.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/SteveSanderson/knockout"
                }
            ]
        }
        ,
        {
            "name": "jquery-jcrop",
            "filename": "jquery.Jcrop.js",
            "version": "0.9.10",
            "description": "Jcrop is the quick and easy way to add image cropping functionality to your web application.",
            "homepage": "http://deepliquid.com/content/Jcrop.html",
            "keywords": [
                "jquery",
                "crop"
            ],
            "maintainers": [
                {
                    "name": "Kelly Hallman",
                    "web": "http://deepliquid.com/blog/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/tapmodo/Jcrop"
                }
            ]
        },
        {
            "name": "lodash.js",
            "version": "1.0.0-rc.3",
            "filename": "lodash.min.js",
            "description": "An alternative to Underscore.js, delivering consistency, customization, performance, and extra features.",
            "homepage": "http://lodash.com",
            "main": "lodash",
            "keywords": [
                "browser",
                "client",
                "functional",
                "performance",
                "server",
                "speed",
                "util"
            ],
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://lodash.com/license"
                }
            ],
            "maintainers": [
                {
                    "name": "John-David Dalton",
                    "web": "http://allyoucanleet.com/"
                }
            ],
            "author": {
                "name": "John-David Dalton",
                "email": "john.david.dalton@gmail.com",
                "web": "http://allyoucanleet.com/"
            },
            "bugs": "https://github.com/bestiejs/lodash/issues",
            "repository": {
                "type": "git",
                "url": "https://github.com/bestiejs/lodash.git"
            },
            "engines": [
                "node",
                "rhino"
            ],
            "directories": {
                "doc": "./doc",
                "test": "./test"
            }
        },
        {
            "name": "wysihtml5",
            "filename": "wysihtml5.min.js",
            "version": "0.3.0",
            "description": "wysihtml5 is an open source rich text editor based on HTML5 technology and the progressive-enhancement approach.  It uses a sophisticated security concept and aims to generate fully valid HTML5 markup by preventing unmaintainable tag soups and inline styles.  The code is completely library agnostic: No jQuery, Prototype or similar is required.",
            "homepage": "http://xing.github.com/wysihtml5/",
            "keywords": [
                "html5",
                "wysiwyg",
                "textarea",
                "editor"
            ],
            "maintainers": [
                {
                    "name": "XING AG",
                    "web": "http://www.xing.com/"
                }
            ],
            "bugs": "https://github.com/xing/wysihtml5/issues",
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/xing/wysihtml5"
                }
            ]
        },
        {
            "name": "hinclude",
            "filename": "hinclude.js",
            "version": "0.9.1",
            "description": "declarative client-side inclusion for the Web",
            "homepage": "http://mnot.github.com/hinclude/",
            "keywords": [
                "include"
            ],
            "maintainers": [
                {
                    "name": "Mark Nottingham",
                    "email": "mnot@mnot.net",
                    "web": "http://www.mnot.net/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/mnot/hinclude"
                }
            ]
        }
        ,
        {
            "name": "jquery.nanoscroller",
            "filename": "jquery.nanoscroller.min.js",
            "version": "0.6.8",
            "description": "A jQuery plugin that offers a simplistic way of implementing Lion OS scrollbars",
            "homepage": "http://jamesflorentino.github.com/nanoScrollerJS/",
            "keywords": [
                "scrollbar",
                "custom",
                "lion",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "James Florentino",
                    "web": "http://jamesflorentino.com"
                },{
                    "name": "Krister Kari",
                    "web": "http://krister.fi/"
                }

            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jamesflorentino/nanoScrollerJS"
                }
            ]
        }
        ,
        {
            "name": "jquery.transit",
            "filename": "jquery.transit.min.js",
            "version": "0.9.9",
            "description": "Super-smooth CSS3 transformations and transitions for jQuery.",
            "homepage": "http://ricostacruz.com/jquery.transit/",
            "keywords": [
                "css3",
                "transitions",
                "transformations",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Rico Sta. Cruz",
                    "web": "http://ricostacruz.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/rstacruz/jquery.transit"
                }
            ]
        }
        ,
        {
            "name": "jquery-easing",
            "filename": "jquery.easing.min.js",
            "version": "1.3",
            "description": "Additional easings for jQuery.",
            "homepage": "http://gsgd.co.uk/sandbox/jquery/easing/",
            "keywords": [
                "jquery",
                "easing"
            ],
            "maintainers": [
                {
                    "name": "George Smith",
                    "web": "http://gsgd.co.uk"
                }
            ],
            "repositories": [
                {
                    "type": "plain file",
                    "url": "http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js"
                }
            ]

        }
        ,
        {
            "name": "scion",
            "filename": "scion-min.js",
            "version": "0.0.3",
            "description": "StateCharts Interpretation and Optimization eNgine (SCION) is an implementation of SCXML/Statecharts in JavaScript.",
            "keywords": [
                "scxml",
                "statecharts",
                "w3c",
                "javascript"
            ],
            "maintainers": [{
                "name": "Jacob Beard",
                "email": "jbeard4@cs.mcgill.ca",
                "url": "http://echo-flow.com"
            }],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jbeard4/SCION.git"
                }
            ]
        }
        ,
        {
            "name": "jquery-url-parser",
            "filename": "purl.min.js",
            "version": "2.2.1",
            "description": "utility to parse urls and provide easy access to their attributes (such as the protocol, host, port etc)",
            "homepage": "https://github.com/allmarkedup/jQuery-URL-Parser",
            "keywords": [
                "jquery-url-parser",
                "purl"
            ],
            "maintainers": [
                {
                    "name": "Mark Perkins"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/allmarkedup/jQuery-URL-Parser"
                }
            ]
        }
        ,
        {
            "name": "jquery-validate",
            "filename": "jquery.validate.min.js",
            "version": "1.10.0",
            "description": "Form Validation plugin for jQuery",
            "homepage": "http://bassistance.de/jquery-plugins/jquery-plugin-validation//",
            "keywords": [
                "jQuery",
                "forms",
                "validate",
                "validation"
            ]
        },
        {
            "name": "kerning.js",
            "filename": "kerning.min.js",
            "version": "0.2",
            "description": "Take control of your web typography.",
            "homepage": "http://kerningjs.com/",
            "keywords": [
                "design",
                "typography",
                "kerning",
                "font",
                "fonts",
                "letters",
                "words"
            ],
            "maintainers": [
                {
                    "name": "Joshua Gross",
                    "web": "http://unwieldy.net"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/endtwist/kerning.js"
                }
            ]
        }
        ,
        {
            "name": "hashgrid",
            "filename": "hashgrid.js",
            "version": "6",
            "description": "A little tool that inserts a layout grid in web pages, allows you to hold it in place, and toggle between displaying it in the foreground or background.",
            "homepage": "http://hashgrid.com/",
            "keywords": [
                "grid",
                "layout",
                "design",
                "columns"
            ],
            "maintainers": [
                {
                    "name": "Analog Coop",
                    "email": "hello@analog.coop",
                    "web": "http://analog.coop/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/dotjay/hashgrid"
                }
            ]
        }
        ,
        {
            "name": "fancybox",
            "filename": "jquery.fancybox.pack.js",
            "version": "2.1.1",
            "description": "fancyBox is a tool that offers a nice and elegant way to add zooming functionality for images, html content and multi-media on your webpages. It is built at the top of the popular JavaScript framework jQuery and is both easy to implement and a snap to customize.",
            "homepage": "http://fancyapps.com/fancybox/",
            "keywords": [
                "fancybox",
                "jquery",
                "images",
                "image",
                "zoom",
                "zooming"
            ],
            "maintainers": [
                {
                    "name": "Janis Skarnelis",
                    "web": "http://fancyapps.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/fancyapps/fancyBox"
                }
            ]
        }
        ,
        {
            "name": "javascript-state-machine",
            "filename": "state-machine.min.js",
            "version": "2.0.0",
            "description": "A finite state machine javascript micro framework.",
            "homepage": "https://github.com/jakesgordon/javascript-state-machine",
            "keywords": [
                "state-machine",
                "fsm"
            ],
            "maintainers": [
                {
                    "name": "Jake S. Gordon"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jakesgordon/javascript-state-machine.git"
                }
            ]
        }
        ,
        {
            "name": "tinyscrollbar",
            "filename": "jquery.tinyscrollbar.min.js",
            "version": "1.66",
            "description": "A lightweight jQuery plugin to scroll content.",
            "homepage": "http://baijs.nl/tinyscrollbar/",
            "keywords": [
                "scrollbar",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Maarten Baijs",
                    "web": "http://baijs.nl"
                }
            ],
            "repositories": [
                {
                    "type": "plain file",
                    "url": "http://baijs.nl/tinyscrollbar/js/jquery.tinyscrollbar.min.js"
                }
            ]

        }
        ,
        {
            "name": "jqueryui",
            "filename": "jquery-ui.min.js",
            "version": "1.9.2",
            "description": "jQuery UI provides abstractions for low-level interaction and animation, advanced effects and high-level, themeable widgets, built on top of the jQuery JavaScript Library, that you can use to build highly interactive web applications.",
            "homepage": "http://jqueryui.com/",
            "keywords": [
                "ui",
                "themeing",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "JQuery UI Team"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jquery/jquery-ui"
                }
            ]
        }
        ,
        {
            "name": "pie",
            "filename": "PIE.js",
            "version": "1.0beta5",
            "description": "A behavior for Internet Explorer allowing it to recognize and render various CSS3 box decoration properties.",
            "homepage": "http://css3pie.com/",
            "keywords": [
                "ie",
                "internet",
                "explorer",
                "css3",
                "pie"
            ],
            "maintainers": [
                {
                    "name": "Jason Johnston",
                    "email": "jason@css3pie.com",
                    "web": "https://github.com/lojjic"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/lojjic/PIE"
                }
            ]

        }
        ,
        {
            "name": "jquery-timeago",
            "filename": "jquery.timeago.js",
            "version": "0.11.4",
            "description": "Timeago is a jQuery plugin that makes it easy to support automatically updating fuzzy timestamps (e.g. '4 minutes ago' or 'about 1 day ago') from ISO 8601 formatted dates and times embedded in your HTML (à la microformats).",
            "homepage": "http://timeago.yarp.com/",
            "keywords": [
                "time",
                "jquery",
                "dateformat",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Ryan McGeary",
                    "email": "ryan@mcgeary.org",
                    "web": "http://ryan.mcgeary.org/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/rmm5t/jquery-timeago"
                }
            ]

        }
        ,
        {
            "name": "jquery-sparklines",
            "filename": "jquery.sparkline.min.js",
            "version": "2.0.0",
            "description": "This jQuery plugin generates sparklines (small inline charts) directly in the browser using data supplied either inline in the HTML, or via javascript",
            "homepage": "http://omnipotent.net/jquery.sparkline",
            "keywords": [
                "jquery",
                "sparkline"
            ],
            "maintainers": [
                {
                    "name": "Splunk"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/gwatts/jquery.sparkline.git"
                }
            ]
        }
        ,
        {
            "name": "jquery.address",
            "filename": "jquery.address.min.js",
            "version": "1.5",
            "description": "The jQuery Address plugin provides powerful deep linking capabilities and allows the creation of unique virtual addresses that can point to a website section or an application state. It enables a number of important capabilities including bookmarking in a browser or social website sending links via email or instant messenger, finding specific content using the major search engines and utilizing browser history and reload buttons.",
            "homepage": "http://www.asual.com/jquery/address/",
            "keywords": [
                "utility",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Asual",
                    "web": "http://www.asual.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/asual/jquery-address.git"
                }
            ]
        }
        ,
        {
            "name": "jStorage",
            "filename": "jstorage.min.js",
            "version": "0.3.0",
            "description": "Simple wrapper plugin for Prototype, MooTools, and jQuery to store data on browser side.",
            "homepage": "http://jstorage.info/",
            "keywords": [
                "storage",
                "offline",
                "webstorage",
                "localStorage"
            ],
            "maintainers": [
                {
                    "name": "Andris Reinman",
                    "email": "andris.reinman@gmail.com",
                    "web": "http://andrisreinman.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/andris9/jStorage"
                }
            ]
        }
        ,
        {
            "name": "pagedown",
            "filename": "Markdown.Converter.js",
            "version": "1.0",
            "description": "PageDown is the JavaScript Markdown previewer used on Stack Overflow and the rest of the Stack Exchange network. It includes a Markdown-to-HTML converter and an in-page Markdown editor with live preview.",
            "homepage": "http://code.google.com/p/pagedown/wiki/PageDown",
            "keywords": [
                "markdown",
                "converter"
            ],
            "maintainers": [
                {
                    "name": "StackOverflow"
                }
            ],
            "repositories": [
                {
                    "type": "hg",
                    "url": "https://code.google.com/p/pagedown/"
                }
            ]

        }
        ,
        {
            "name": "ember.js",
            "filename": "ember-1.0.0-pre.2.min.js",
            "version": "1.0.0-pre.2",
            "description": "Ember is a JavaScript framework for creating ambitious web applications that eliminates boilerplate and provides a standard application architecture.",
            "homepage": "http://emberjs.com/",
            "keywords": [
                "ember",
                "ember.js"
            ],
            "maintainers": [
                {
                    "name": "Ember.js",
                    "web": "http://emberjs.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/emberjs/ember.js"
                }
            ]

        }
        ,
        {
            "name": "960gs",
            "filename": "960.css",
            "version": "0",
            "description": "The 960 Grid System is an effort to streamline web development workflow by providing commonly used dimensions, based on a width of 960 pixels.",
            "homepage": "http://960.gs",
            "keywords": [
                "960",
                "960gs",
                "grid system"
            ],
            "maintainers": [
                {
                    "name": "Nathan Smith",
                    "web": "http://sonspring.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/nathansmith/960-Grid-System/blob/master/code/css/960.css"
                }
            ]

        },
        {
            "name": "jquery-backstretch",
            "filename": "jquery.backstretch.min.js",
            "version": "2.0.3",
            "description": "Backstretch is a simple jQuery plugin that allows you to add a dynamically-resized, slideshow-capable background image to any page or element. The image will stretch to fit the page/element, and will automatically resize as the window/element size changes.",
            "homepage": "http://srobbin.com/jquery-plugins/backstretch/",
            "keywords": [
                "jquery",
                "background",
                "photo",
                "stretch"
            ],
            "maintainers": [
                {
                    "name": "Scott Robbin",
                    "email": "scott@robbin.co",
                    "web": "http://srobbin.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/srobbin/jquery-backstretch"
                }
            ]
        },
        {
            "name": "dd_belatedpng",
            "filename": "dd_belatedpng.min.js",
            "version": "0.0.8",
            "description": "Allows the use of transparent PNGs in images and CSS backgrounds in IE6.",
            "homepage": "http://www.dillerdesign.com/experiment/DD_belatedPNG/",
            "keywords": [
                "ie6",
                "png"
            ],
            "maintainers": [
                {
                    "name": "Drew Diller",
                    "web": "https://www.dillerdesign.com/"
                }
            ],
            "repositories": [
            ]
        }
        ,
        {
            "name": "prettify",
            "filename": "prettify.js",
            "version": "188.0.0",
            "description": "A Javascript module and CSS file that allows syntax highlighting of source code snippets in an html page.",
            "homepage": "http://code.google.com/p/google-code-prettify/",
            "keywords": [
                "code syntax highlighting"
            ],
            "repositories": [
                {
                    "type": "svn",
                    "url": "http://google-code-prettify.googlecode.com/svn/trunk/"
                }
            ]

        }
        ,
        {
            "name": "history.js",
            "filename": "native.history.js",
            "version": "1.7.1",
            "description": "Provides a cross-compatible experience for the History API on all HTML5 Browsers and backwards-compatible one on older ones using a hash-fallback.",
            "homepage": "https://github.com/balupton/History.js/",
            "keywords": [
                "history",
                "state",
                "html5",
                "onhashchange"
            ],
            "maintainers": [
                {
                    "name": "Benjamin Arthur Lupton",
                    "web": "http://lupton.cc"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/balupton/history.js.git"
                }
            ]

        }
        ,
        {
            "name": "raven.js",
            "filename": "raven.min.js",
            "version": "0.6.0",
            "description": "JavaScript client for the Sentry realtime event logging and aggregation platform.",
            "homepage": "https://github.com/lincolnloop/raven-js",
            "keywords": [
                "raven",
                "sentry"
            ],
            "maintainers": [
                {
                    "name": "Lincoln Loop"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/lincolnloop/raven-js"
                }
            ]
        }
        ,
        {
            "name": "jquery.imagesloaded",
            "filename": "jquery.imagesloaded.min.js",
            "version": "2.1.0",
            "description": "jQuery plugin that triggers a callback after all images have been loaded",
            "homepage": "http://desandro.github.com/imagesloaded/",
            "keywords": [
                "images",
                "load",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "David DeSandro",
                    "web": "http://desandro.com/"
                },
                {
                    "name": "Matías Hernández Arellano (msdark)",
                    "web": "http://about.me/msdark"
                }

            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/desandro/imagesloaded"
                }
            ]
        },
        {
            "name": "jquery-textext",
            "filename": "jquery.textext.min.js",
            "version": "1.3.0",
            "description": "TextExt plugin for jquery",
            "homepage": "http://textextjs.com/",
            "keywords": [
                "jquery",
                "textext"
            ]
        }
        ,
        {
            "name" : "URI.js",
            "filename" : "URI.min.js",
            "version" : "1.7.2",
            "description" : "URI.js is a javascript library for working with URLs. It offers a \"jQuery-style\" API (Fluent Interface, Method Chaining) to read and write all regular components and a number of convenience methods like .directory() and .authority(). URI.js offers simple, yet powerful ways of working with query string, has a number of URI-normalization functions and converts relative/absolute paths.",
            "homepage" : "http://medialize.github.com/URI.js/",
            "keywords" : [
                "uri",
                "url",
                "uri mutation",
                "url mutation",
                "uri manipulation",
                "url manipulation",
                "uri template",
                "url template",
                "unified resource locator",
                "unified resource identifier",
                "query string",
                "RFC 3986",
                "RFC3986",
                "RFC 6570",
                "RFC6570"
            ],
            "maintainers" : [{
                "name" : "Rodney Rehm",
                "web" : "http://rodneyrehm.de/en/"
            }
            ],
            "repositories" : [{
                "type" : "git",
                "url" : "https://github.com/medialize/URI.js"
            }
            ]
        }
        ,
        {
            "name": "jquery-scrollTo",
            "filename": "jquery.scrollTo.min.js",
            "version": "1.4.3",
            "description": "Easy element scrolling using jQuery..",
            "homepage": "http://flesler.blogspot.com/2007/10/jqueryscrollto.html",
            "keywords": [
                "scroll",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Ariel Flesler",
                    "web": "http://flesler.blogspot.com"
                }
            ],
            "repositories": [
                {
                    "type": "svn",
                    "url": "http://code.google.com/p/flesler-plugins/"
                }
            ]
        }
        ,
        {
            "name": "platform",
            "version": "0.4.0",
            "filename": "platform.min.js",
            "description": "A platform detection library that works on nearly all JavaScript platforms.",
            "homepage": "https://github.com/bestiejs/platform.js",
            "main": "platform",
            "keywords": [
                "environment",
                "platform",
                "ua",
                "useragent"
            ],
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://mths.be/mit"
                }
            ],
            "author": {
                "name": "John-David Dalton",
                "email": "john@fusejs.com",
                "web": "http://allyoucanleet.com/"
            },
            "maintainers": [
                {
                    "name": "John-David Dalton",
                    "email": "john@fusejs.com",
                    "web": "http://allyoucanleet.com/"
                },
                {
                    "name": "Mathias Bynens",
                    "email": "mathias@qiwi.be",
                    "web": "http://mathiasbynens.be/"
                }
            ],
            "bugs": "https://github.com/bestiejs/platform.js/issues",
            "repository": {
                "type": "git",
                "url": "https://github.com/bestiejs/platform.js.git"
            },
            "engines": [
                "node",
                "rhino"
            ],
            "directories": {
                "doc": "docs",
                "test": "tests"
            }
        },
        {
            "name": "twitter-bootstrap",
            "filename": "bootstrap.min.js",
            "version": "2.2.2",
            "description": "Javascript plugins for the Twitter Bootstrap toolkit",
            "homepage": "http://twitter.github.com/bootstrap/",
            "keywords": [
                "twitter",
                "bootstrap"
            ],
            "maintainers": [
                {
                    "name": "Twitter, Inc."
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/twitter/bootstrap"
                }
            ]
        }
        ,
        {
            "name": "mootools",
            "filename": "mootools-core-full-compat-yc.js",
            "version": "1.4.5",
            "description": "MooTools is a compact, modular, Object-Oriented JavaScript framework designed for the intermediate to advanced JavaScript developer. It allows you to write powerful, flexible, and cross-browser code with its elegant, well documented, and coherent API.",
            "homepage": "http://mootools.net/",
            "keywords": [
                "framework",
                "toolkit",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Valerio Proietti",
                    "web": "http://mad4milk.net/"
                },
                {
                    "name": "Mootools Dev Team"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/mootools/mootools-core.git"
                }
            ]
        }
        ,
        {
            "name": "leaflet",
            "filename": "leaflet.js",
            "version": "0.4.5",
            "description": "Leaflet is a modern open-source JavaScript library for mobile-friendly interactive maps.",
            "homepage": "http://leafletjs.com/",
            "keywords": [
                "maps",
                "mobile"
            ],
            "maintainers": [
                {
                    "name": "CloudMade"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/cloudmade/leaflet.git"
                }
            ]
        }
        ,
        {
            "name": "backbone.modelbinder",
            "filename": "Backbone.ModelBinder.min.js",
            "version": "0.1.5",
            "description": "Simple, flexible and powerful Model-View binding for Backbone.",
            "homepage": "https://github.com/theironcook/Backbone.ModelBinder#prerequisites",
            "keywords": [
                "modelbinding",
                "models",
                "events"
            ],
            "maintainers": [
                {
                    "name": "Bart Wood",
                    "email": "bartwood@gmail.com",
                    "web": "https://github.com/theironcook"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/theironcook/Backbone.ModelBinder"
                }
            ]

        }
        ,
        {
            "name": "jquery-powertip",
            "filename": "jquery.powertip-1.1.0.min.js",
            "version": "1.1.0",
            "description": "A jQuery plugin that creates hover tooltips.",
            "homepage": "http://stevenbenner.github.com/jquery-powertip/",
            "keywords": [
                "jquery-powertip"
            ],
            "maintainers": [
                {
                    "name": "Steven Benner"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/stevenbenner/jquery-powertip"
                }
            ]
        }
        ,
        {
            "name": "normalize",
            "filename": "normalize.css",
            "version": "2.0.1",
            "description": "Normalize.css makes browsers render all elements consistently and in line with modern standards.",
            "homepage": "http://necolas.github.com/normalize.css/",
            "keywords": [
                "cross browser"
            ],
            "maintainers": [
                {
                    "name": "Nicolas Gallagher",
                    "web": "http://nicolasgallagher.com/"
                },
                {
                    "name": "Jonathan Neal",
                    "web": "http://twitter.com/jon_neal/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/necolas/normalize.css"
                }
            ]

        }
        ,
        {
            "name": "pusher",
            "filename": "pusher.min.js",
            "version": "1.12.5",
            "description": "Pusher Javascript library",
            "homepage": "http://pusher.com/",
            "keywords": [
                "pusher",
                "websockets",
                "realtime"
            ],
            "maintainers": [
                {
                    "name": "Pusher",
                    "twitter": "pusher",
                    "web": "http://pusher.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "http://github.com/pusher/pusher-js"
                }
            ]

        },
        {
            "name": "ICanHaz.js",
            "filename": "ICanHaz.min.js",
            "version": "0.10",
            "description": "A clean solution for templating with Mustache.js and jQuery or Zepto",
            "homepage": "http://icanhazjs.com",
            "keywords": [
                "templating",
                "mustache",
                "jquery",
                "zepto"
            ],
            "maintainers": [
                {
                    "name": "&yet",
                    "email": "contact@andyet.net",
                    "web": "http://andyet.net"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/andyet/ICanHaz.js"
                }
            ]
        }
        ,
        {
            "name": "select2",
            "filename": "select2.min.js",
            "version": "3.2",
            "description": "Select2 is a jQuery based replacement for select boxes. It supports searching, remote data sets, and infinite scrolling of results. Look and feel of Select2 is based on the excellent Chosen library.",
            "homepage": "http://ivaynberg.github.com/select2/",
            "keywords": [
                "select",
                "jquery",
                "dropdown",
                "ui"
            ],
            "maintainers": [
                {
                    "name": "Igor Vaynberg",
                    "email": "igor.vaynberg@gmail.com",
                    "web": "https://github.com/ivaynberg"
                }
            ],
            "bugs": "https://github.com/ivaynberg/select2/issues",
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/ivaynberg/select2"
                }
            ]
        },
        {
            "name": "foundation",
            "filename": "javascripts/foundation.min.js",
            "version": "3.2.2",
            "description": "The most advanced responsive front-end framework in the world. Quickly create prototypes and production code for sites and apps that work on any kind of device.",
            "homepage": "http://foundation.zurb.com",
            "keywords": [
                "foundation",
                "responsive"
            ],
            "maintainers": [
                {
                    "name": "zurb"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/zurb/foundation.git"
                }
            ]
        }
        ,
        {
            "name": "hogan.js",
            "filename": "hogan.js",
            "version": "2.0.0",
            "description": "A mustache compiler.",
            "homepage": "http://twitter.github.com/hogan.js/",
            "keywords": ["mustache", "template"],
            "author": "Twitter Inc.",
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/twitter/hogan.js.git"
                }
            ]
        },
        {
            "name": "jquery.ba-bbq",
            "filename": "jquery.ba-bbq.min.js",
            "version": "1.2.1",
            "description": "jQuery BBQ leverages the HTML5 hashchange event to allow simple, yet powerful bookmarkable #hash history. In addition, jQuery BBQ provides a full .deparam() method, along with both hash state management, and fragment / query string parse and merge utility methods",
            "homepage": "http://benalman.com/projects/jquery-bbq-plugin/",
            "keywords": [
                "jquery",
                "history"
            ],
            "maintainers": [
                {
                    "name": "Ben Alman",
                    "web": "http://benalman.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/cowboy/jquery-bbq"
                }
            ]

        }

        ,
        {
            "name": "sizzle",
            "filename": "sizzle.min.js",
            "version": "1.4.4",
            "description": "A pure-JavaScript CSS selector engine designed to be easily dropped in to a host library.",
            "homepage": "http://sizzlejs.com/",
            "keywords": [
                "dom",
                "selector",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "John Resig",
                    "web": "http://ejohn.org/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jeresig/sizzle"
                }
            ]

        }
        ,
        {
            "name": "alloy-ui",
            "filename": "aui-min.js",
            "version": "1.0.1",
            "description": "Alloy is a UI metaframework that provides a consistent and simple API for building web applications across allthree levels of the browser: structure, style and behavior.",
            "homepage": "https://github.com/liferay/alloy-ui",
            "keywords": [
                "ui",
                "themeing",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Liferay",
                    "web": "http://www.liferay.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/liferay/alloy-ui"
                }
            ]
        },
        {
            "name": "stats.js",
            "filename": "Stats.js",
            "version": "r11",
            "description": "JavaScript Performance Monitor.",
            "homepage": "https://github.com/mrdoob/stats.js/",
            "keywords": [
                "fps",
                "framerate"
            ],
            "maintainers": [
                {
                    "name": "Mr. Doob"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/mrdoob/stats.js/"
                }
            ]
        }
        ,
        {
            "name": "galleria",
            "filename": "galleria.min.js",
            "version": "1.2.8",
            "description": "The JavaScript Image Gallery.",
            "homepage": "http://galleria.io/",
            "keywords": [
                "gallery",
                "framework",
                "jquery",
                "slideshow",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Aino",
                    "website": "http://aino.se"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/aino/galleria"
                }
            ]
        }
        ,
        {
            "name": "firebug-lite",
            "filename": "firebug-lite.js",
            "version": "1.4.0",
            "description": "Firebug Lite is a powerful console logging, modifying and inspecting tool.",
            "homepage": "https://getfirebug.com/firebuglite/",
            "keywords": ["firebug", "development","debug"]
        }
        ,
        {
            "name": "backbone.eventbinder",
            "filename": "backbone.eventbinder.min.js",
            "version": "0.1.0",
            "description": "Manage Backbone Events Better",
            "homepage": "http://github.com/marionettejs/backbone.eventbinder",
            "keywords": [
                "events",
                "popular"
            ],
            "devDependencies": {
                "backbone.js":         "0.9.2"
            },
            "maintainers": [
                {
                    "name": "Derick Bailey",
                    "email": "derickbailey@gmail.com",
                    "web": "http://derickbailey.lostechies.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "http://github.com/marionettejs/backbone.eventbinder"
                }
            ]

        }
        ,
        {
            "name": "jquery-nivoslider",
            "filename": "jquery.nivo.slider.pack.js",
            "version": "3.1",
            "description": "Described as 'The world's most awesome jQuery slider' Nivo Slider is a jQuery plugin that makes displaying your gallery of images a beautiful experience, by using amazing transition effects ranging from slicing and sliding to fading and folding.",
            "homepage": "http://nivo.dev7studios.com",
            "keywords": [
                "slider",
                "jquery",
                "image",
                "slideshow"
            ],
            "maintainers": [
                {
                    "name": "Dev7studios",
                    "web": "http://dev7studios.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/gilbitron/Nivo-Slider"
                }
            ]

        }
        ,
        {
            "name": "datatables",
            "version": "1.9.4",
            "filename": "jquery.dataTables.min.js",
            "description": "DataTables enhances HTML tables with the ability to sort, filter and page the data in the table very easily. It provides a comprehensive API and set of configuration options, allowing you to consume data from virtually any data source.",
            "homepage": "http://datatables.net",
            "maintainers": [
                {
                    "name": "Allan Jardine",
                    "url": "http://sprymedia.co.uk"
                }
            ],
            "licenses": [
                {
                    "type": "BSD",
                    "url": "http://datatables.net/license_bsd"
                },
                {
                    "type": "GPLv2",
                    "url": "http://datatables.net/license_gpl2"
                }
            ],
            "dependencies": {
                "jquery": "1.3 - 1.7"
            },
            "keywords": [
                "DataTables",
                "DataTable",
                "table",
                "grid",
                "filter",
                "sort",
                "page",
                "internationalisable"
            ]
        },
        {
            "name": "mustache.js",
            "filename": "mustache.min.js",
            "version": "0.7.0",
            "description": "Logic-less {{mustache}} templates with JavaScript",
            "author": "mustache.js Authors <http://github.com/janl/mustache.js>",
            "homepage": "https://github.com/janl/mustache.js",
            "keywords": [
                "templates",
                "templating",
                "mustache",
                "template",
                "ejs"
            ],
            "maintainers": [
                {
                    "name": "Jan Lehnardt",
                    "email": "jan@apache.org",
                    "web": "http://jan.prima.de/plok/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/janl/mustache.js"
                }
            ]

        }

        ,
        {
            "name": "three.js",
            "filename": "three.min.js",
            "version": "r53",
            "description": "three.js is a lightweight 3D library with a very low level of complexity. The library provides <canvas>, <svg> and WebGL renderers.",
            "homepage": "http://mrdoob.github.com/three.js/",
            "keywords": [
                "3d",
                "WebGL"
            ],
            "maintainers": [
                {
                    "name": "Mr.doob",
                    "web": "http://mrdoob.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/mrdoob/three.js.git"
                }
            ]
        }
        ,
        {
            "name": "datatables-fixedheader",
            "version": "2.0.6",
            "filename": "FixedHeader.min.js",
            "description": "The FixedHeader plug-in will freeze in place the header, footer and left and/or right most columns in a DataTable, ensuring that title information will remain always visible.",
            "homepage": "http://datatables.net/extras/fixedheader/",
            "maintainers": [
                {
                    "name": "Allan Jardine",
                    "url": "http://sprymedia.co.uk"
                }
            ],
            "licenses": [
                {
                    "type": "BSD",
                    "url": "http://datatables.net/license_bsd"
                },
                {
                    "type": "GPLv2",
                    "url": "http://datatables.net/license_gpl2"
                }
            ],
            "dependencies": {
                "jquery": "1.3 - 1.7"
            },
            "keywords": [
                "DataTables",
                "DataTable",
                "table",
                "grid",
                "filter",
                "sort",
                "page",
                "internationalisable"
            ]
        },
        {
            "name": "webfont",
            "filename": "webfont.js",
            "version": "1.1.0",
            "description": "The WebFont Loader is a JavaScript library that gives you more control over font loading than the Google Font API provides.",
            "homepage": "http://code.google.com/apis/webfonts/docs/webfont_loader.html",
            "keywords": [
                "ui",
                "font"
            ],
            "maintainers": [
                {
                    "name": "Google"
                },
                {
                    "name": "Typekit"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/typekit/webfontloader.git"
                }
            ]
        }
        ,
        {
            "name": "jquery-throttle-debounce",
            "filename": "jquery.ba-throttle-debounce.min.js",
            "version": "1.1",
            "description": "jQuery throttle / debounce allows you to rate-limit your functions in multiple useful ways.",
            "homepage": "https://github.com/cowboy/jquery-throttle-debounce",
            "keywords": [
                "jquery",
                "throttle",
                "debounce",
                "ratelimit"
            ],
            "maintainers": [
                {
                    "name": "Ben Alman",
                    "web": "http://benalman.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/cowboy/jquery-throttle-debounce.git"
                }
            ]
        }
        ,
        {
            "name": "backbone-localstorage.js",
            "filename": "backbone.localStorage-min.js",
            "version": "1.0",
            "description": "A simple module to replace Backbone.sync with localStorage-based persistence. Models are given GUIDS, and saved into a JSON object. Simple as that.",
            "homepage": "https://github.com/jeromegn/Backbone.localStorage",
            "keywords": [
                "localstorage",
                "backbone"
            ],
            "maintainers": [
                {
                    "name": "Jerome Gravel-Niquet",
                    "email": "jeromegn@gmail.com",
                    "web": "http://jgn.me/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jeromegn/Backbone.localStorage"
                }
            ]

        }
        ,
        {
            "name": "es5-shim",
            "filename": "es5-shim.min.js",
            "version": "1.2.4",
            "description": "Provides compatibility shims so that legacy JavaScript engines behave as closely as possible to ES5.",
            "homepage": "https://github.com/kriskowal/es5-shim",
            "keywords": [
                "es5",
                "ECMAScript 5",
                "shim",
                "compatibility",
                "modernization"
            ],
            "maintainers": [
                {
                    "name": "Kristopher Michael Kowal",
                    "email": "rfobic@gmail.com",
                    "web": "http://jeditoolkit.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/kriskowal/es5-shim"
                }
            ]

        }
        ,
        {
            "name": "jqModal",
            "filename": "jqModal.js",
            "version": "r14",
            "description": "jqModal is a plugin for jQuery to help you display notices, dialogs, and modal windows in a web browser.",
            "homepage": "http://dev.iceburg.net/jquery/jqModal/",
            "keywords": [
                "jquery",
                "dialog"
            ],
            "maintainers": [
                {
                    "name": "Brice Burgess"
                }
            ]
        },
        {
            "name": "scriptaculous",
            "filename": "scriptaculous.js",
            "version": "1.9.0",
            "description": "script.aculo.us provides you with easy-to-use, cross-browser user interface JavaScript libraries to make your web sites and web applications fly.",
            "homepage": "http://script.aculo.us/",
            "keywords": [
                "ui",
                "toolkit",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Thomas Fuchs",
                    "web": "http://mir.aculo.us/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/madrobby/scriptaculous.git"
                }
            ]
        }
        ,
        {
            "name": "bootstrap-growl",
            "filename": "jquery.bootstrap-growl.min.js",
            "description": "Pretty simple jQuery plugin that turns standard Bootstrap alerts into \"Growl-like\" notifications.",
            "version": "1.0.0",
            "homepage": "https://github.com/ifightcrime/bootstrap-growl",
            "keywords": [
                "bootstrap",
                "growl",
                "notification",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Nick Larson"
                }
            ],
            "repository": {
                "type": "git",
                "url": "https://github.com/ifightcrime/bootstrap-growl.git"
            },
            "bugs": "https://github.com/ifightcrime/bootstrap-growl/issues",
            "licenses": [
                {
                    "type": "MIT",
                    "url": "https://github.com/ifightcrime/bootstrap-growl/blob/master/LICENSE.md"
                }
            ]
        }
        ,
        {
            "name": "can.js",
            "filename": "can.jquery.min.js",
            "version": "1.1.3",
            "description": "CanJS is a MIT-licensed, client-side, JavaScript framework that makes building rich web applications easy.",
            "homepage": "http://canjs.us/",
            "keywords": [
                "can.js",
                "canjs",
                "javascript",
                "mvc",
                "framework",
                "model",
                "view",
                "controller",
                "popular"
            ],
            "maintainers": [
                {
                    "name" : "Bitovi",
                    "email" : "contact@bitovi.com",
                    "web" : "http://bitovi.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/bitovi/canjs"
                }
            ]
        },
        {
            "name": "embedly-jquery",
            "version": "2.2.0",
            "filename": "jquery.embedly.min.js",
            "description": "Embedly - jQuery is a jQuery Library for Embedly that will replace links with content. It follows the oEmbed spec (oembed.com) for content retrieval, while utilizing http://api.embed.ly as a single endpoint.",
            "homepage": "https://github.com/embedly/embedly-jquery",
            "maintainers": [
                {
                    "name": "Andrew Pellett",
                    "url": "https://github.com/anrope"
                },
                {
                    "name": "Art Gibson",
                    "url": "https://github.com/artgibson"
                },
                {
                    "name": "Bob Corsaro",
                    "url": "https://github.com/dokipen"
                },
                {
                    "name": "John Emhoff",
                    "url": "https://github.com/JohnEmhoff"
                },
                {
                    "name": "Sean Creeley",
                    "url": "https://github.com/screeley"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/embedly/embedly-jquery"
                }
            ],
            "licenses": [
                {
                    "type": "BSD",
                    "url": "http://github.com/embedly/embedly-jquery/tree/master/LICENSE/"
                }
            ],
            "dependencies": {
                "jquery": "1.3.1 or greater"
            },
            "keywords": [
                "oEmbed",
                "jQuery",
                "embed"
            ]
        },
        {
            "name": "simplecartjs",
            "filename": "simplecart.min.js",
            "version": "3.0.5",
            "description": "A simple javascript shopping cart that easily integrates with your current website.",
            "homepage": "http://simplecartjs.org",
            "keywords": [
                "cart",
                "shopping",
                "simple",
                "paypal"
            ],
            "maintainers": [
                {
                    "name": "Brett Wejrowski",
                    "web": "http://wojodesign.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/wojodesign/simplecart-js"
                }
            ]

        }
        ,
        {
            "name": "css3finalize",
            "filename": "jquery.css3finalize.min.js",
            "version": "3.2",
            "description": "Skip vendor prefixes",
            "homepage": "https://github.com/codler/jQuery-Css3-Finalize",
            "keywords": [
                "css",
                "css3"
            ],
            "maintainers": [
                {
                    "name": "Han Lin Yap",
                    "web": "http://zencodez.net/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/codler/jQuery-Css3-Finalize"
                }
            ]

        }
        ,
        {
            "name": "jquery-cookie",
            "filename": "jquery.cookie.min.js",
            "version": "1.2",
            "description": "A simple, lightweight jQuery plugin for reading, writing and deleting cookies.",
            "homepage": "https://github.com/carhartl/jquery-cookie",
            "keywords": [
                "jquery",
                "cookie"
            ],
            "repositories": [
                {
                    "type": "git",
                    "url" : "https://github.com/carhartl/jquery-cookie"
                }
            ]
        },
        {
            "name": "jquery.SPServices",
            "filename": "jquery.SPServices-0.7.2.min.js",
            "version": "0.7.2",
            "description": "SPServices is a jQuery library which abstracts SharePoint's Web Services and makes them easier to use. It also includes functions which use the various Web Service operations to provide more useful (and cool) capabilities. It works entirely client side and requires no server install.",
            "homepage": "http://spservices.codeplex.com/",
            "keywords": [
                "jquery",
                "spservices",
                "sharepoint",
                "services",
                "service"
            ],
            "maintainers": [
                {
                    "name": "Marc D Anderson",
                    "web": "http://sympmarc.com/"
                }
            ]

        },
        {
            "name": "ResponsiveSlides.js",
            "filename": "responsiveslides.min.js",
            "version": "1.32",
            "description": "Simple & lightweight responsive slider plugin",
            "homepage": "http://responsive-slides.viljamis.com/",
            "keywords": [
                "ResponsiveSlides",
                "responsive slider",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Viljami Salminen (Author)",
                    "web": "http://viljamis.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/viljamis/ResponsiveSlides.js"
                }
            ]
        }
        ,
        {
            "name": "use.js",
            "filename": "use.js",
            "version": "0.2.0",
            "description": "RequireJS plugin for loading incompatible code.",
            "homepage": "https://github.com/tbranyen/use.js",
            "keywords": ["requirejs", "amd"],
            "author": "Tim Branyen",
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/tbranyen/use.js.git"
                }
            ]
        }
        ,
        {
            "name": "openlayers",
            "filename": "OpenLayers.js",
            "version": "2.11",
            "description": "OpenLayers is a JavaScript library for building map applications on the web. OpenLayers is made available under a BSD-license. Please see license.txt in this distribution for more details.",
            "homepage": "http://openlayers.org/",
            "keywords": [
                "map",
                "openlayers",
                "maps"
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/openlayers/openlayers"
                }
            ]

        }
        ,
        {
            "name": "eve.js",
            "filename": "eve.min.js",
            "version": "0.8.1",
            "description": "A JavaScript meta-framework for scoped event delegation.",
            "homepage": "http://evejs.com",
            "maintainers": [
                {
                    "name": "Michelle Steigerwalt",
                    "web": "http://msteigerwalt.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/Yuffster/Eve.js"
                }
            ]
        }
        ,
        {
            "name": "jquery.lifestream",
            "filename": "jquery.lifestream.min.js",
            "version": "0.3.4",
            "description": "Show a stream of your online activity.",
            "homepage": "https://github.com/christianv/jquery-lifestream",
            "keywords": [
                "lifestream",
                "social networks",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Christian Vuerings",
                    "web": "http://denbuzze.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/christianv/jquery-lifestream.git"
                }
            ]
        }
        ,
        {
            "name": "jquery-countdown",
            "filename": "jquery.countdown.min.js",
            "version": "1.6.0",
            "description": "Countdown for jQuery.",
            "homepage": "http://keith-wood.name/countdown.html",
            "keywords": [
                "jquery",
                "countdown"
            ],
            "maintainers": [
                {
                    "name": "Keith Wood",
                    "web": "http://keith-wood.name"
                },
                {
                    "name": "Keith Wood",
                    "web": "https://github.com/kbwood/countdown"
                }
            ]
        }
        ,
        {
            "name": "backbone.validation",
            "filename": "backbone-validation-min.js",
            "version": "0.7.0",
            "description": "A validation plugin for Backbone.js that validates both your model as well as form input.",
            "homepage": "http://thedersen.com/projects/backbone-validation",
            "keywords": [
                "validation",
                "events",
                "models",
                "views"
            ],
            "maintainers": [
                {
                    "name": "Thomas Pedersen",
                    "web": "http://thedersen.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "http://github.com/thedersen/backbone.validation.git"
                }
            ]
        }
        ,
        {
            "filename": "i18n.js",
            "name": "require-i18n",
            "version": "2.0.1",
            "description": "Load string bundles used in internationalization (i18n) that are made up of separate country/language/locale-specific bundles.",
            "homepage": "http://github.com/requirejs/i18n",
            "keywords": [
                "requirejs",
                "i18n"
            ],
            "maintainers": [
                {
                    "name": "James Burke",
                    "email": "jrburke@gmail.com",
                    "web": "http://tagneto.blogspot.ru/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "http://github.com/requirejs/i18n"
                }
            ]
        }
        ,
        {
            "name": "jquery.selectboxit",
            "filename": "jquery.selectBoxIt.min.js",
            "version": "2.2.0",
            "description": "A jQuery plugin that progressively enhances an HTML Select Box into a single option dropdown list. The dropdown list can be optionally styled with jQuery ThemeRoller and optionally animated with jQueryUI show/hide effects.",
            "homepage": "http://www.selectboxit.com",
            "keywords": [
                "jquery",
                "jqueryui",
                "select box"
            ],
            "maintainers": [
                {
                    "name": "Greg Franko",
                    "web": "http://gregfranko.com/"
                }
            ]

        }
        ,
        {
            "name": "xuijs",
            "filename": "xui.min.js",
            "description": "A lightweight, dead simple, micro-tiny, super modular JavaScript framework for building mobile web applications. Its true: the minified code is super tiny.",
            "version": "2.3.2",
            "homepage": "http://xuijs.com",
            "keywords": [
                "mobile",
                "framework"
            ],
            "maintainers": [
                {
                    "name": "Brian Leroux"
                }
            ],
            "repository": {
                "type": "git",
                "url": "https://github.com/xui/xui.git"
            },
            "bugs": "https://github.com/xui/xui/issues",
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://xuijs.com/license"
                }
            ]
        },
        {
            "name": "dropbox.js",
            "filename": "dropbox.min.js",
            "version": "0.7.2",
            "description": "Client library for the Dropbox API",
            "homepage": "https://dropbox.com/developers",
            "keywords": [
                "dropbox",
                "filesystem",
                "storage"
            ],
            "maintainers": [
                {
                    "name": "Victor Costan",
                    "email": "victor@costan.us",
                    "web": "http://www.costan.us"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/dropbox/dropbox-js"
                }
            ]
        }
        ,
        {
            "name": "zxcvbn",
            "version": "1.0",
            "filename": "zxcvbn-async.js",
            "homepage": "http://tech.dropbox.com/?p=165",
            "description": "Realistic password strength estimation, based on common words, patterns, and keyboard adjacency.",
            "keywords": [
                "passwords",
                "forms",
                "security"
            ],
            "maintainers": [
                {
                    "name": "Dan Wheeler",
                    "email": "dan@dropbox.com",
                    "web": "https://github.com/lowe"
                }
            ],
            "bugs": "https://github.com/lowe/zxcvbn/issues",
            "licenses": [
                {
                    "type": "MIT",
                    "url": "https://github.com/lowe/zxcvbn/blob/master/LICENSE.txt"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "git://github.com/lowe/zxcvbn.git"
                }
            ]
        }
        ,
        {
            "name": "backbone.marionette",
            "filename": "backbone.marionette.min.js",
            "version": "0.10.2",
            "description": "Make your Backbone.js apps dance with a composite application architecture!",
            "homepage": "http://github.com/marionettejs/backbone.marionette",
            "keywords": [
                "collections",
                "models",
                "controllers",
                "events",
                "popular"
            ],
            "devDependencies": {
                "backbone.js":          "0.9.2",
                "backbone.wreqr":       "0.0.0",
                "backbone.eventbinder": "0.1.0"
            },
            "maintainers": [
                {
                    "name": "Derick Bailey",
                    "email": "derickbailey@gmail.com",
                    "web": "http://derickbailey.lostechies.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "http://github.com/marionettejs/backbone.marionette"
                }
            ]

        }
        ,
        {
            "name": "font-awesome",
            "filename": "font-awesome.css",
            "version": "2.0",
            "description": "Font Awesome",
            "homepage": "http://fortawesome.github.com/Font-Awesome/",
            "keywords": [
                "css", "font", "icons"
            ]
        }
        ,
        {
            "name": "handlebars.js",
            "filename": "handlebars.min.js",
            "version": "1.0.rc.1",
            "description": "Handlebars provides the power necessary to let you build semantic templates effectively with no frustration. Mustache templates are compatible with Handlebars, so you can take a Mustache template, import it into Handlebars, and start taking advantage of the extra Handlebars features.",
            "homepage": "http://www.handlebarsjs.com",
            "keywords": [
                "template",
                "mustache"
            ],
            "maintainers": [
                {
                    "name": "Yehuda Katz",
                    "web": "http://www.yehudakatz.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/wycats/handlebars.js"
                }
            ]

        },
        {
            "name": "jquery-mobile",
            "filename": "jquery.mobile.min.js",
            "version": "1.2.0",
            "description": "A unified, HTML5-based user interface system for all popular mobile device platforms, built on the rock-solid jQuery and jQuery UI foundation.",
            "homepage": "http://jquerymobile.com/",
            "keywords": [
                "framework",
                "toolkit",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "The jQuery Project"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jquery/jquery-mobile.git"
                }
            ]
        },
        {
            "name": "openajax-hub",
            "filename": "OpenAjaxUnmanagedHub.min.js",
            "version": "2.0.7",
            "description": "The central feature of the OpenAjax Hub is its publish/subscribe event manager (the \"pub/sub manager\"), which enables loose assembly and integration of Ajax components. With the pub/sub manager, one Ajax component can publish (i.e., broadcast) an event to which other Ajax components can subscribe, thereby allowing these components to communicate with each other through the Hub, which acts as an intermediary message bus.",
            "homepage": "http://www.openajax.org/member/wiki/OpenAjax_Hub_1.0_Specification",
            "keywords": [
                "publish",
                "subscribe",
                "pub/sub",
                "hub",
                "messaging",
                "broadcast",
                "decoupling"
            ],
            "maintainers": [
                {
                    "name": "OpenAjax Alliance",
                    "web": "http://www.openajax.org/"
                }
            ],
            "repositories": [
                {
                    "type": "svn",
                    "url": "https://openajaxallianc.svn.sourceforge.net/svnroot/openajaxallianc",
                    "path": "hub20/trunk/src/OpenAjax.js"
                }
            ]
        }
        ,
        {
            "name": "flexie",
            "filename": "flexie.min.js",
            "version": "1.0.0",
            "description": "Cross-browser support for the CSS3 Flexible Box Model.",
            "homepage": "http://flexiejs.com/",
            "keywords": [
                "css",
                "css3",
                "flexible",
                "box",
                "model",
                "polyfill",
                "flexbox"
            ],
            "maintainers": [
                {
                    "name": "Richard Herrera"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/doctyper/flexie"
                }
            ]

        }
        ,
        {
            "name": "noisy",
            "filename": "jquery.noisy.min.js",
            "version": "1.1.1",
            "description": "Adds random noise to the background of a given element.",
            "homepage": "http://rappdaniel.com/noisy/",
            "keywords": [
                "noisy",
                "noise generator",
                "canvas"
            ],
            "maintainers": [
                {
                    "name": "Daniel Rapp",
                    "email": "danielrappt@gmail.com",
                    "web": "http://rappdaniel.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/DanielRapp/Noisy"
                }
            ]
        }
        ,
        {
            "name": "ember-data.js",
            "filename": "ember-data-latest.min.js",
            "version": "0.8.0-latest20121123",
            "description": "A data persistence library for Ember.js.",
            "homepage": "https://github.com/emberjs/data",
            "keywords": [
                "ember",
                "ember.js",
                "ember-data",
                "ember-data.js"
            ],
            "maintainers": [
                {
                    "name": "Ember.js",
                    "web": "http://emberjs.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/emberjs/data"
                }
            ]

        }
        ,
        {
            "name": "waypoints",
            "filename": "waypoints.min.js",
            "version": "1.1.6",
            "description": "Waypoints is a small jQuery plugin that makes it easy to execute a function whenever you scroll to an element.",
            "homepage": "http://imakewebthings.github.com/jquery-waypoints",
            "keywords": [
                "jquery",
                "scrolling"
            ],
            "maintainers": [
                {
                    "name": "Caleb Troughton",
                    "web": "http://imakewebthings.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/imakewebthings/jquery-waypoints"
                }
            ]

        }
        ,
        {
            "name": "vertx",
            "filename": "vertxbus.min.js",
            "version": "1.3.0",
            "description": "Effortless asynchronous application development for the modern web and enterprise. This library internally uses SockJS to send and receive data to a SockJS vert.x server called the SockJS bridge. http://vertx.io/core_manual_js.html#sockjs-eventbus-bridge",
            "homepage": "http://vertx.io/",
            "keywords": [
                "vertx",
                "vert.x",
                "vertxbus",
                "eventbus",
                "SockJS"
            ],
            "maintainers": [
                {
                    "name": "Tim Fox",
                    "web": "http://vertx.io/community.html"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/vert-x/vert.x"
                }
            ]
        }
        ,
        {
            "name": "tweet",
            "filename": "jquery.tweet.js",
            "version": "2.1",
            "description": "put twitter on your website with tweet, an unobtrusive javascript plugin for jquery",
            "homepage": "http://tweet.seaofclouds.com",
            "keywords": [
                "twitter",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Steve Purcell"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "git://github.com/seaofclouds/tweet.git"
                }
            ]
        }
        ,
        {
            "name": "kiwi",
            "description": "Simple, modular, fast and lightweight template engine, based on jQuery templates syntax.",
            "version": "0.2.1",
            "author": "Pierre Matri <pierre.matri@coolony.com>",
            "filename": "kiwi.min.js",
            "contributors": [
                { "name": "Pierre Matri", "email": "pierre.matri@coolony.com" }
            ],
            "dependencies": {
                "frame": "*",
                "underscore": "*",
                "moment": "*"
            },
            "devDependencies": {
                "mocha": "*",
                "should": "*",
                "uglify-js": "*",
                "jshint": "*"
            },
            "keywords": ["kiwi", "asynchronous", "template", "web", "express", "engine", "html"],
            "repository": "git://github.com/coolony/kiwi",
            "main": "index",
            "scripts": {
                "test": "make test"
            },
            "engines": { "node":">= 0.6.0" }
        },
        {
            "name": "dancer.js",
            "filename": "dancer.min.js",
            "version": "0.3.1",
            "description": "high-level audio API, designed to make sweet visualizations",
            "homepage": "http://jsantell.github.com/dancer.js",
            "keywords": [
                "audio"
            ],
            "maintainers": [
                {
                    "name": "Jordan Santell",
                    "email": "jsantell@gmail.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jsantell/dancer.js"
                }
            ]
        }
        ,
        {
            "name": "twitterlib.js",
            "filename": "twitterlib.min.js",
            "version": "1.0.8",
            "description": "Library for doing all things Twitter API related, with added sauce for filtering, paging and paging",
            "homepage": "https://github.com/remy/twitterlib/",
            "keywords": [
                "twitter"
            ],
            "maintainers": [
                {
                    "name": "Remy Sharp"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/remy/twitterlib/"
                }
            ]

        },
        {
            "name": "treesaver",
            "filename": "treesaver-0.10.0.js",
            "version": "0.10.0",
            "description": "JavaScript library for creating column and page-based layouts.",
            "homepage": "https://github.com/Treesaver/treesaver",
            "keywords": [
                "responsive",
                "layout"
            ],
            "maintainers": [
                {
                    "name": "Andrea Campi",
                    "web": "https://github.com/andreacampi"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/Treesaver/treesaver"
                }
            ]

        }
        ,
        {
            "name": "ext-core",
            "filename": "ext-core.js",
            "version": "3.1.0",
            "description": "Ext JS is the developer's choice for building powerful desktop web applications using JavaScript and web standards.",
            "homepage": "http://www.sencha.com/products/extjs/",
            "keywords": [
                "framework",
                "toolkit",
                "desktop",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Sencha"
                }
            ]
        }
        ,
        {
            "name": "raphael",
            "filename": "raphael-min.js",
            "version": "2.1.0",
            "description": "Raphaël is a small JavaScript library that should simplify your work with vector graphics on the web.",
            "homepage": "http://raphaeljs.com/",
            "keywords": [
                "vector",
                "graphics",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Dmitry Baranovskiy",
                    "web": "http://dmitry.baranovskiy.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/DmitryBaranovskiy/raphael/"
                }
            ]
        }
        ,
        {
            "name": "jquery-hashchange",
            "filename": "jquery.ba-hashchange.min.js",
            "version": "v1.3",
            "description": "This jQuery plugin enables very basic bookmarkable #hash history via a cross-browser window.onhashchange event.",
            "homepage": "http://benalman.com/projects/jquery-hashchange-plugin/",
            "keywords": [
                "jquery",
                "history"
            ],
            "maintainers": [
                {
                    "name": "Ben Alman",
                    "email": "cowboy@rj3.net",
                    "web": "http://benalman.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/cowboy/jquery-hashchange"
                }
            ]
        }
        ,
        {
            "name": "cookiejar",
            "filename": "cookiejar.js",
            "version": "0.5",
            "description": "JavaScript code to store data as JSON strings in cookies. It uses Prototype.js 1.5.1 (http://prototypejs.org) or later. Apache Software licensed",
            "homepage": "http://www.lalit.org/lab/jsoncookies",
            "keywords": [
                "javascript",
                "cookies",
                "json"
            ],
            "maintainers": [
                {
                    "name": "Lalit Patel",
                    "web": "http://www.lalit.org/"
                }
            ],
            "repositories": [
                {
                    "type": "http",
                    "url": "http://www.lalit.org/wordpress_new/wp-content/uploads/2008/06/cookiejar.js"
                }
            ]

        }
        ,
        {
            "name": "qtip2",
            "filename": "jquery.qtip.min.js",
            "version": "2.0.0",
            "description": "Pretty powerful tooltips. The second generation of the advanced qTip plugin for the ever popular jQuery framework.",
            "homepage": "http://craigsworks.com/projects/qtip2/",
            "keywords": [
                "tooltips",
                "qtip",
                "qtip2",
                "jQuery",
                "plugin"
            ],
            "licenses": [
                {
                    "type": "MIT",
                    "url": "https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt"
                },
                {
                    "type": "GPL",
                    "url": "http://opensource.org/licenses/gpl-license.php"
                }
            ],
            "author": {
                "name": "Craig Michael Thompson",
                "email": "craig@craigsworks.com",
                "web": "http://craigsworks.com"
            },
            "repositories": {
                "type": "git",
                "url": "https://github.com/Craga89/qTip2.git"
            },
            "bugs": "https://github.com/Craga89/qTip2/issues"
        },
        {
            "name": "prefixfree",
            "filename": "prefixfree.min.js",
            "version": "1.0.7",
            "description": "A script that lets you use only unprefixed CSS properties everywhere. It works behind the scenes, adding the current browser’s prefix to any CSS code, only when it’s needed.",
            "homepage": "http://leaverou.github.com/prefixfree/",
            "keywords": [
                "css"
            ],
            "maintainers": [
                {
                    "name": "Lea Verou"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/leaverou/prefixfree/"
                }
            ]
        }
        ,
        {
            "name": "gmaps4rails",
            "filename": "gmaps4rails.googlemaps.js",
            "description": "Enables easy display of items (taken from a Rails 3 model) with Google Map, OpenLayers, Bing or Mapquest. Geocoding + Directions included. ",
            "version": "1.5.2",
            "homepage": "https://rubygems.org/gems/gmaps4rails",
            "keywords": [
                "rails",
                "maps"
            ],
            "maintainers": [
                {
                    "name": "Benjamin Roth"
                }
            ],
            "repository": {
                "type": "git",
                "url": "git://github.com/apneadiving/Google-Maps-for-Rails.git"
            },
            "licenses": [
                {
                    "type": "MIT",
                    "url": "https://github.com/apneadiving/Google-Maps-for-Rails/blob/master/MIT-LICENSE"
                }
            ]
        }
        ,
        {
            "name": "amplifyjs",
            "filename": "amplify.min.js",
            "version": "1.1.0",
            "description": "AmplifyJS is a set of components designed to solve common web application problems with a simplistic API.",
            "homepage": "http://amplifyjs.com/",
            "keywords": [
                "amplifyjs",
                "amplify",
                "api"
            ],
            "maintainers": [
                {
                    "name": "appendTo",
                    "web": "http://appendto.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/appendto/amplify"
                }
            ]

        }
        ,
        {
            "name": "benchmark",
            "version": "0.3.0",
            "filename": "benchmark.min.js",
            "description": "A benchmarking library that works on nearly all JavaScript platforms, supports high-resolution timers, and returns statistically significant results.",
            "homepage": "http://benchmarkjs.com/",
            "main": "benchmark",
            "keywords": [
                "benchmark",
                "node",
                "narwhal",
                "performance",
                "ringo",
                "speed"
            ],
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://mths.be/mit"
                }
            ],
            "contributors": [
                {
                    "name": "John-David Dalton",
                    "email": "john@fusejs.com",
                    "web": "http://allyoucanleet.com/"
                },
                {
                    "name": "Mathias Bynens",
                    "email": "mathias@benchmarkjs.com",
                    "web": "http://mathiasbynens.be/"
                }
            ],
            "bugs": "https://github.com/bestiejs/benchmark.js/issues",
            "repository": {
                "type": "git",
                "url": "https://github.com/bestiejs/benchmark.js.git"
            }
        },
        {
            "name": "meyer-reset",
            "filename": "reset.css",
            "version": "2.0",
            "description": "Eric Meyer CSS reset",
            "homepage": "http://meyerweb.com/eric/tools/css/reset/",
            "keywords": [
                "css", "reset"
            ],
            "maintainers": [
                {
                    "name": "Eric Meyer",
                    "web": "http://meyerweb.com//"
                }
            ]
        }
        ,
        {
            "name": "yui",
            "filename": "yui-min.js",
            "version": "3.3.0",
            "description": "The YUI Library is a set of utilities and controls, written with JavaScript and CSS, for building richly interactive web applications using techniques such as DOM scripting, DHTML and AJAX.",
            "homepage": "http://developer.yahoo.com/yui/",
            "keywords": [
                "ui",
                "framework",
                "toolkit",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Yahoo! Inc."
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/yui/yui3.git"
                }
            ]
        }
        ,
        {
            "name": "jquery.form",
            "filename": "jquery.form.js",
            "version": "3.20",
            "description": "The jQuery Form Plugin allows you to easily and unobtrusively upgrade HTML forms to use AJAX",
            "homepage": "http://jquery.malsup.com/form/",
            "keywords": [
                "ajax",
                "forms",
                "form",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Mike Alsup (Author)",
                    "web": "https://github.com/malsup"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/malsup/form"
                }
            ]
        }
        ,
        {
            "name": "jquery-infinitescroll",
            "filename": "jquery.infinitescroll.min.js",
            "version": "2.0b2.110713",
            "description": "This plugin aims to progressively enhance your page, providing a more rich browsing experience when scrolling big amount of data.",
            "homepage": "http://www.infinite-scroll.com/infinite-scroll-jquery-plugin/",
            "keywords": [
                "jquery",
                "scroll",
                "infinite",
                "masonry"
            ],
            "maintainers": [
                {
                    "name": "Luke Shumard",
                    "web": "http://www.lukeshumard.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/paulirish/infinitescroll.git"
                }
            ]
        }
        ,
        {
            "name": "cufon",
            "filename": "cufon-yui.js",
            "version": "1.09i",
            "description": "Fast text replacement with canvas and VML - no Flash or images required.",
            "homepage": "http://cufon.shoqolate.com/",
            "keywords": [
                "font",
                "canvas",
                "vml",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Simo Kinnunen",
                    "web": "https://twitter.com/sorccu"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/sorccu/cufon/"
                }
            ]
        }
        ,
        {
            "name": "crafty",
            "filename": "crafty-min.js",
            "version": "0.5.3",
            "homepage": "http://craftyjs.com/",
            "title": "Crafty game framework",
            "author": {
                "name": "Louis Stowasser",
                "url": "http://craftyjs.com/"
            },
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://www.opensource.org/licenses/mit-license.php"
                },
                {
                    "type": "GPL",
                    "url": "http://www.opensource.org/licenses/gpl-license.php"
                }
            ],
            "description": "Crafty is a modern component and event based framework for javascript games that targets DOM and canvas.",
            "keywords": [
                "framework",
                "javascript"
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/craftyjs/Crafty.git"
                }
            ]
        }
        ,
        {
            "name": "swfobject",
            "filename": "swfobject.js",
            "version": "2.2",
            "description": "SWFObject is an easy-to-use and standards-friendly method to embed Flash content, which utilizes one small JavaScript file",
            "homepage": "http://code.google.com/p/swfobject/",
            "keywords": [
                "swf",
                "flash"
            ],
            "maintainers": [
                {
                    "name": "bobbyvandersluis"
                },
                {
                    "name": "aran.rhee"
                }
            ],
            "repositories": [
                {
                    "type": "svn",
                    "url": "http://swfobject.googlecode.com/svn/trunk/"
                }
            ]
        }
        ,
        {
            "name": "jquery.cycle",
            "filename": "jquery.cycle.all.min.js",
            "version": "2.9999.8",
            "description": "Cycle is an easy-to-use slideshow plugin that provides many options and effects for creating beautiful slideshows.",
            "homepage": "http://jquery.malsup.com/cycle/",
            "keywords": [
                "jquery",
                "slideshow",
                "cycle"
            ],
            "maintainers": [
                {
                    "name": "Mike Alsup",
                    "email": "malsup@gmail.com",
                    "web": "http://jquery.malsup.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/malsup/cycle"
                }
            ]

        }
        ,
        {
            "name": "jqueryui-touch-punch",
            "filename": "jquery.ui.touch-punch.min.js",
            "version": "0.2.2",
            "description": "A small hack that enables the use of touch events on sites using the jQuery UI user interface library.",
            "homepage": "http://touchpunch.furf.com/",
            "keywords": [
                "touch",
                "jquery",
                "events"
            ],
            "maintainers": [
                {
                    "name": "David Furfero",
                    "web": "http://furf.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/furf/jquery-ui-touch-punch.git"
                }
            ]
        }
        ,
        {
            "name": "highlight.js",
            "filename": "highlight.min.js",
            "version": "7.3",
            "description": "Easy-to-use, Javascript-based syntax highlighter",
            "homepage": "http://highlightjs.org",
            "keywords": [
                "highlight",
                "syntax highlighter"
            ],
            "maintainers": [
                {
                    "name": "Diwaker Gupta"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/isagalaev/highlight.js"
                }
            ]
        }
        ,
        {
            "name": "underscore.js",
            "filename": "underscore-min.js",
            "version": "1.4.3",
            "description": "Underscore is a utility-belt library for JavaScript that provides a lot of the functional programming support that you would expect in Prototype.js (or Ruby), but without extending any of the built-in JavaScript objects. It's the tie to go along with jQuery's tux.",
            "homepage": "http://documentcloud.github.com/underscore/",
            "keywords": [
                "utility",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Jeremy Ashkenas",
                    "email": "jashkenas@gmail.com",
                    "web": "http://ashkenas.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/documentcloud/underscore/"
                }
            ]
        }
        ,
        {
            "name": "less.js",
            "filename": "less.min.js",
            "version": "1.3.1",
            "description": "LESS extends CSS with dynamic behavior such as variables, mixins, operations and functions. LESS runs on both the client-side (IE 6+, Webkit, Firefox) and server-side, with Node.js.",
            "homepage": "http://lesscss.org/",
            "keywords": [
                "css",
                "css3",
                "html",
                "html5",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Alexis Sellier",
                    "website": "http://cloudhead.io/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/cloudhead/less.js"
                }
            ]
        }
        ,
        {
            "name": "json2",
            "filename": "json2.js",
            "version": "20121008",
            "description": "This file creates a global JSON object containing two methods: stringify and parse.",
            "homepage": "https://github.com/douglascrockford/JSON-js",
            "keywords": [
                "json",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Douglas Crockford",
                    "web": "http://crockford.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/douglascrockford/JSON-js"
                }
            ]

        }
        ,
        {
            "name": "swipe",
            "filename": "swipe.min.js",
            "version": "1.0",
            "description": "Swipe is a lightweight mobile slider with 1-to-1 touch movement.",
            "homepage": "http://swipejs.com/",
            "keywords": [
                "swipe",
                "touch",
                "mobile",
                "slider"
            ],
            "maintainers": [
                {
                    "name": "Brad Birdsall",
                    "web": "http://bradbirdsall.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/bradbirdsall/Swipe.git"
                }
            ]
        },
        {
            "name": "camanjs",
            "filename": "caman.full.min.js",
            "version": "3.3.0",
            "description": "Pure Javascript (Ca)nvas (Man)ipulation.",
            "homepage": "http://camanjs.com/",
            "keywords": [
                "html5",
                "canvas",
                "image",
                "filter",
                "manipulate",
                "pixel",
                "effects"
            ],
            "maintainers": [
                {
                    "name": "Ryan LeFevre",
                    "website": "http://meltingice.net"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/meltingice/CamanJS"
                }
            ]

        }
        ,
        {
            "name": "modernizr",
            "filename": "modernizr.min.js",
            "version": "2.6.2",
            "description": "Modernizr adds classes to the <html> element which allow you to target specific browser functionality in your stylesheet. You don't actually need to write any Javascript to use it.",
            "homepage": "http://www.modernizr.com/",
            "keywords": [
                "css",
                "css3",
                "html",
                "html5",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Faruk Ates"
                },
                {
                    "name": "Alex Sexton"
                },
                {
                    "name": "Paul Irish"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/Modernizr/Modernizr"
                }
            ]

        }
        ,
        {
            "name": "morris.js",
            "filename": "morris.min.js",
            "version": "0.3.3",
            "description": "Pretty time-series line graphs",
            "homepage": "http://oesmith.github.com/morris.js/",
            "keywords": [
                "graphs",
                "line",
                "time",
                "charts"
            ],
            "maintainers": [
                {
                    "name": "Olly Smith",
                    "url": "http://www.oesmith.co.uk"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/oesmith/morris.js.git"
                }
            ]
        },
        {
            "name": "store.js",
            "filename": "store.min.js",
            "keywords": [
                "storage"
            ],
            "description": "A localStorage wrapper for all browsers without using cookies or flash. Uses localStorage, globalStorage, and userData behavior under the hood",
            "version": "1.1.1",
            "homepage": "https://github.com/marcuswestin/store.js",
            "author": "Marcus Westin <narcvs@gmail.com> (http://marcuswest.in)",
            "maintainers": [
                {
                    "name": "Marcus Westin",
                    "email": "narcvs@gmail.com",
                    "web": "http://marcuswest.in"
                }
            ],
            "contributors": [
                "Matt Pizzimenti <mjpizz+github@gmail.com> (http://mjpizz.com)",
                "Long Ouyang (https://github.com/longouyang)",
                "Paul Irish (http://paulirish.com)",
                "Guillermo Rauch <rauchg@gmail.com> (https://github.com/guille)",
                "whitmer (https://github.com/whitmer)",
                "Steven Black <steveb@stevenblack.com> (https://github.com/StevenBlack)",
                "Marcus Tucker <info@marcustucker.com> (https://github.com/MarcusJT)"
            ],
            "repository": {
                "type": "git",
                "url": "git://github.com/marcuswestin/store.js.git"
            },
            "bugs": "http://github.com/marcuswestin/store.js/issues",
            "engines": {
                "browser": "*",
                "node": "*"
            },
            "licenses": [
                {
                    "type": "MIT",
                    "url": "http://github.com/marcuswestin/store.js/raw/master/LICENSE"
                }
            ],
            "main": "store",
            "directories": {
                "lib": "."
            },
            "files": [
                ""
            ]
        }
        ,
        {
            "name": "garlic.js",
            "filename": "garlic.min.js",
            "version": "0.0.1",
            "description": "Garlic.js allows you to automatically persist your forms' text field values locally, until the form is submitted. This way, your users don't lose any precious data if they accidentally close their tab or browser.",
            "homepage": "http://garlicjs.org/",
            "keywords": [
                "html",
                "form",
                "forms"
            ],
            "maintainers": [
                {
                    "name": "Guillaume Potier",
                    "email": "guillaume@wisembly.com",
                    "web": "http://guillaumepotier.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/guillaumepotier/Garlic.js"
                }
            ]

        }
        ,
        {
            "name": "dygraph",
            "filename": "dygraph-combined.js",
            "version": "1.2",
            "description": "dygraphs is an open source JavaScript library that produces produces interactive, zoomable charts of time series. It is designed to display dense data sets and enable users to explore and interpret them.",
            "homepage": "http://dygraphs.com/",
            "keywords": [
                "graphs",
                "charts",
                "interactive"
            ],
            "maintainers": [
                {
                    "name": "Dan Vanderkam"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/danvk/dygraphs.git"
                }
            ]
        }
        ,
        {
            "name": "underscore.string",
            "filename": "underscore.string.min.js",
            "version": "2.3.0",
            "description": "Underscore.string is JavaScript library for comfortable manipulation with strings, extension for Underscore.js inspired by Prototype.js, Right.js, Underscore and beautiful Ruby language.",
            "homepage": "http://epeli.github.com/underscore.string/",
            "keywords": [
                "utility",
                "string",
                "underscore"
            ],
            "maintainers": [
                {
                    "name": "Esa-Matti Suuronen",
                    "email": "esa-matti@suuronen.org",
                    "web": "http://esa-matti.suuronen.org"

                },
                {
                    "name": "Edward Tsech",
                    "email": "edtsech@gmail.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/epeli/underscore.string"
                }
            ]
        }
        ,
        {
            "name": "chrome-frame",
            "filename": "CFInstall.min.js",
            "version": "1.0.2",
            "description": "Google Chrome Frame is an open source plug-in that seamlessly brings Google Chrome's open web technologies and speedy JavaScript engine to Internet Explorer.",
            "homepage": "http://code.google.com/chrome/chromeframe/",
            "keywords": [
                "plugin",
                "plug-in",
                "chrome",
                "frame"
            ],
            "maintainers": [
                {
                    "name": "Google"
                }
            ]
        }
        ,
        {
            "name": "jade",
            "filename": "jade.min.js",
            "version": "0.27.7",
            "description": "Jade template engine",
            "homepage": "http://jade-lang.com/",
            "keywords": [
                "template",
                "jade"
            ],
            "maintainers": [
                {
                    "name": "TJ Holowaychuk",
                    "email": "tj@vision-media.ca",
                    "web": "http://tjholowaychuk.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "git://github.com/visionmedia/jade"
                }
            ]
        }
        ,
        {
            "name": "require.js",
            "filename": "require.min.js",
            "version": "0.26.0",
            "description": "Require.js merged with jQuery for loader goodness!",
            "homepage": "https://github.com/jrburke/require-jquery",
            "keywords": [
                "loader",
                "modules",
                "asynchronous",
                "popular",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "James Burke",
                    "web": "http://tagneto.blogspot.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jrburke/require-jquery"
                }
            ]

        }
        ,
        {
            "name": "qooxdoo",
            "filename": "q.min.js",
            "author" : "Martin Wittemann <martin.wittemann@1und1.de>",
            "homepage" : "http://qooxdoo.org",
            "description": "qooxdoo is a cross-browser DOM manipulation library to enhance websites with a rich user experience.",
            "keywords": ["framework", "toolkit", "dom"],
            "version": "2.1",
            "repository" : {
                "type" : "git",
                "url" : "https://github.com/qooxdoo/qooxdoo.git"
            },
            "maintainers": [
                {
                    "name": "Martin Wittemann",
                    "email": "martin.wittemann@1und1.de"
                },
                {
                    "name": "Daniel Wagner",
                    "email": "daniel.wagner@1und1.de"
                }
            ]
        },
        {
            "name": "bootstrap-lightbox",
            "filename": "bootstrap-lightbox.js",
            "version": "0.4",
            "description": "A simple lightbox plugin based on the bootstrap modal plugin.",
            "homepage": "http://jbutz.github.com/bootstrap-lightbox/",
            "keywords": [
                "bootstrap",
                "lightbox",
                "modal"
            ],
            "maintainers": [
                {
                    "name": "Jason Butz",
                    "web": "http://jasonbutz.info/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jbutz/bootstrap-lightbox"
                }
            ]

        }
        ,
        {
            "name": "sopa",
            "filename": "stopcensorship.js",
            "version": "1.0",
            "description": "Use this script on your site to protest censorship of the Internet.",
            "homepage": "https://github.com/dougmartin/Stop-Censorship",
            "keywords": [
                "sopa"
            ],
            "maintainers": [
                {
                    "name": "Doug Martin"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/dougmartin/Stop-Censorship"
                }
            ]

        }
        ,
        {
            "name": "sockjs-client",
            "filename": "sockjs.min.js",
            "version": "0.3.4",
            "description": "SockJS is a browser JavaScript library that provides a WebSocket-like object. SockJS gives you a coherent, cross-browser, Javascript API which creates a low latency, full duplex, cross-domain communication channel between the browser and the web server.",
            "homepage": "https://github.com/sockjs/sockjs-client",
            "keywords": [
                "websockets",
                "node"
            ],
            "maintainers": [
                {
                    "name": "Marek Majkowski"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url":  "https://github.com/sockjs/sockjs-client"
                }
            ]
        }
        ,
        {
            "author": "Jerome Gravel-Niquet <jeromegn@gmail.com> (http://jgn.me)",
            "name": "documentup",
            "description": "Pretty documentation generator for Github projects with proper Readme.",
            "version": "0.1.1",
            "homepage": "http://documentup.com",
            "repository": {
                "type": "git",
                "url": "git://github.com/jeromegn/documentup.git"
            },
            "engines": {
                "node": "~0.6.1"
            },
            "filename": "documentup.min.js",
            "dependencies": {},
            "devDependencies": {
                "coffee-script": "~1.1.0",
                "stylus":        "0.22.6",
                "nib":           "0.3.2",
                "uglify-js":     "1.2.5",
                "ender":         "0.8.3",
                "async":         "0.1.15"
            }
        }
        ,
        {
            "name": "jquery-mousewheel",
            "filename": "jquery.mousewheel.min.js",
            "version": "3.0.6",
            "description": "A jQuery plugin that adds cross-browser mouse wheel support.",
            "homepage": "http://brandonaaron.net/code/mousewheel/docs",
            "keywords": [
                "mouse",
                "cross-browser",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Brandon Aaron",
                    "web": "http://brandonaaron.net"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/brandonaaron/jquery-mousewheel"
                }
            ]
        }
        ,
        {
            "name": "jsoneditor",
            "filename": "jsoneditor-min.js",
            "version": "1.6.2",
            "description": "JSON Editor Online is a web-based tool to view, edit, and format JSON. It shows your data side by side in a clear, editable treeview and in formatted plain text.",
            "homepage": "http://jsoneditoronline.org",
            "keywords": [
                "json",
                "html",
                "editor"
            ],
            "licenses": [
                {
                    "type": "Apache License 2.0",
                    "url": "http://www.apache.org/licenses/"
                }
            ],
            "author": {
                "name": "Jos de Jong",
                "web": "http://github.com/wjosdejong"
            },
            "maintainers": [
                {
                    "name": "Jos de Jong",
                    "web": "http://github.com/wjosdejong"
                }
            ],
            "bugs": "http://github.com/wjosdejong/jsoneditoronline/issues",
            "repository": {
                "type": "git",
                "url": "git://github.com/wjosdejong/jsoneditoronline.git"
            }
        },
        {
            "name": "backbone.wreqr",
            "filename": "backbone.wreqr.min.js",
            "version": "0.0.0",
            "description": "A simple infrastructure for decoupling Backbone and Backbone.Marionette application modules and components.",
            "homepage": "http://github.com/marionettejs/backbone.wreqr",
            "keywords": [
                "events",
                "popular"
            ],
            "devDependencies": {
                "backbone.js":         "0.9.2"
            },
            "maintainers": [
                {
                    "name": "Derick Bailey",
                    "email": "derickbailey@gmail.com",
                    "web": "http://derickbailey.lostechies.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "http://github.com/marionettejs/backbone.wreqr"
                }
            ]

        }
        ,
        {
            "name": "string_score",
            "filename": "string_score.min.js",
            "version": "0.1.10",
            "description": "string_score - JavaScript string ranking library",
            "homepage": "https://github.com/joshaven/string_score",
            "keywords": [
                "search",
                "string ranking",
                "algorithms"
            ],
            "maintainers": [
                {
                    "name": "Joshaven Potter",
                    "email": "yourtech@gmail.com",
                    "web": "http://www.joshaven.com/string_score/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/joshaven/string_score.git"
                }
            ]

        }

        ,
        {
            "name": "humane-js",
            "filename": "humane-3.0.5.min.js",
            "version": "3.0.5",
            "description": "human-js is a simple & modern, browser notification system ",
            "homepage": "http://wavded.github.com/humane-js/",
            "keywords": [
                "humane",
                "humane-js"
            ],
            "maintainers": [
                {
                    "name": "Marc Harter",
                    "email": "wavded@gmail.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/wavded/humane-js"
                }
            ]
        }
        ,
        {
            "name": "retina.js",
            "filename": "retina.js",
            "version": "1.0.1",
            "description": "retina.js makes it easy to serve high-resolution images to devices with retina displays.",
            "homepage": "http://retinajs.com/",
            "keywords": [
                "apple",
                "retina",
                "image"
            ],
            "maintainers": [
                {
                    "name": "Imulus",
                    "web": "http://imulus.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/imulus/retinajs.git"
                }
            ]
        }
        ,
        {
            "name": "jquery.touchswipe",
            "filename": "jquery.touchswipe.min.js",
            "version": "1.5.1",
            "description": "A jQuery plugin that supports touch events on mobile devices.",
            "homepage": "http://labs.skinkers.com/touchSwipe",
            "keywords": [
                "touch",
                "swipe",
                "mobile",
                "jquery"
            ],
            "maintainers": [
                {
                    "name": "Skinkers Labs",
                    "web": "http://labs.skinkers.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/mattbryson/TouchSwipe-Jquery-Plugin.git"
                }
            ]
        }
        ,
        {
            "name": "backbone.paginator",
            "filename": "backbone.paginator.min.js",
            "version": "0.154",
            "description": "Pagination component for backbone.js",
            "homepage": "https://github.com/addyosmani/backbone.paginator",
            "keywords": [
                "backbone",
                "pagination"
            ],
            "maintainers": [
                {
                    "name": "Addy Osmani",
                    "email": "addyosmani@gmail.com",
                    "web": "http://www.addyosmani.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/addyosmani/backbone.paginator.git"
                }
            ]

        }
        ,
        {
            "name": "respond.js",
            "filename": "respond.min.js",
            "version": "1.1.0",
            "description": "A fast & lightweight polyfill for min/max-width CSS3 Media Queries (for IE 6-8, and more).",
            "homepage": "https://github.com/scottjehl/Respond",
            "keywords": [
                "polyfill",
                "queries",
                "responsive",
                "max-width",
                "min-width"
            ],
            "maintainers": [
                {
                    "name": "Scott Jehl",
                    "email": "scott@scottjehl.com",
                    "web": "http://scottjehl.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/scottjehl/Respond"
                }
            ]

        },
        {
            "name": "file-uploader",
            "filename": "fineuploader.min.js",
            "version": "3.1.1",
            "description": "Multiple file upload plugin with progress-bar, drag-and-drop. ",
            "homepage": "http://fineuploader.com",
            "keywords": [
                "uploader",
                "multiple",
                "drag-and-drop"
            ],
            "maintainers": [
                {
                    "name": "valums"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/valums/file-uploader.git"
                }
            ]
        },
        {
            "name": "require.js",
            "filename": "require.min.js",
            "version": "2.1.1",
            "description": "RequireJS is a JavaScript file and module loader. It is optimized for in-browser use, but it can be used in other JavaScript environments, like Rhino and Node",
            "homepage": "http://requirejs.org/",
            "keywords": [
                "loader",
                "modules",
                "asynchronous",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "James Burke",
                    "web": "http://tagneto.blogspot.com"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jrburke/requirejs"
                }
            ]

        }
        ,
        {
            "name": "spin.js",
            "filename": "spin.min.js",
            "keywords": [
                "spinner",
                "utility"
            ],
            "description": "An animated CSS3 loading spinner with VML fallback for IE.",
            "version": "1.2.7",
            "homepage": "http://fgnass.github.com/spin.js/",
            "author": "Felix Gnass (http://fgnass.github.com/)",
            "maintainers": [
                {
                    "name": "Felix Gnass",
                    "web": "http://fgnass.github.com/"
                }
            ],
            "contributors": [
                "Felix Gnass (http://fgnass.github.com/)"
            ],
            "repository": {
                "type": "git",
                "url": "git://github.com/fgnass/spin.js.git"
            }
        }
        ,
        {
            "name": "async",
            "filename": "async.min.js",
            "version": "1.22",
            "description": "Higher-order functions and common patterns for asynchronous code",
            "author": "Caolan McMahon",
            "repository" : {
                "type" : "git",
                "url" : "http://github.com/caolan/async.git"
            },
            "licenses" : [
                {
                    "type" : "MIT",
                    "url" : "http://github.com/caolan/async/raw/master/LICENSE"
                }
            ],
            "devDependencies": {
                "nodeunit": ">0.0.0",
                "uglify-js": "1.2.x",
                "nodelint": ">0.0.0"
            }
        },
        {
            "name": "xregexp",
            "filename": "xregexp-min.js",
            "version": "2.0.0",
            "description": "Extended JavaScript regular expressions",
            "homepage": "http://xregexp.com/",
            "keywords": [
                "regex",
                "regexp"
            ],
            "maintainers": [
                {
                    "name": "Steven Levithan",
                    "email": "steves_list@hotmail.com",
                    "web": "http://stevenlevithan.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/slevithan/XRegExp.git"
                }
            ]
        }
        ,
        {
            "name": "mootools-more",
            "filename": "mootools-more-yui-compressed.js",
            "version": "1.4.0.1",
            "description": "MooTools is a compact, modular, Object-Oriented JavaScript framework designed for the intermediate to advanced JavaScript developer. It allows you to write powerful, flexible, and cross-browser code with its elegant, well documented, and coherent API.",
            "homepage": "http://mootools.net/",
            "keywords": [
                "framework",
                "toolkit",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Valerio Proietti",
                    "web": "http://mad4milk.net/"
                },
                {
                    "name": "Mootools Dev Team"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/mootools/mootools-more.git"
                }
            ]
        }
        ,
        {
            "name": "coffee-script",
            "filename": "coffee-script.min.js",
            "version": "1.3.3",
            "description": "CoffeeScript is a little language that compiles into JavaScript. Underneath all of those embarrassing braces and semicolons, JavaScript has always had a gorgeous object model at its heart. CoffeeScript is an attempt to expose the good parts of JavaScript in a simple way.",
            "homepage": "http://jashkenas.github.com/coffee-script/",
            "keywords": [
                "coffeescript",
                "compiler",
                "language",
                "coffee",
                "script",
                "popular"
            ],
            "maintainers": [
                {
                    "name": "Jeremy Ashkenas",
                    "email": "jashkenas@gmail.com",
                    "web": "http://ashkenas.com/"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/jashkenas/coffee-script.git"
                }
            ]

        }
        ,
        {
            "name": "jScrollPane",
            "version": "2.0.0beta12",
            "filename": "jquery.jscrollpane.min.js",
            "description": "jScrollPane - cross browser styleable scrollbars with jQuery and CSS",
            "homepage": "http://jscrollpane.kelvinluck.com",
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/vitch/jScrollPane.git"
                }
            ],
            "maintainers": [
                {
                    "name": "Kelvin Luck",
                    "web": "http://www.kelvinluck.com"
                }
            ],
            "keywords": [
                "framework",
                "toolkit",
                "popular",
                "jquery",
                "scroll",
                "jscrollpane"
            ]
        },
        {
            "name": "dojo",
            "filename": "dojo.js",
            "version": "1.8.1",
            "description": "Dojo saves you time, delivers powerful performance, and scales with your development process. It’s the toolkit experienced developers turn to for building superior desktop and mobile web experiences.",
            "homepage": "http://dojotoolkit.org/",
            "keywords": [
                "framework",
                "toolkit",
                "dojo",
                "JavaScript"
            ],
            "maintainers": [
                {
                    "name": "The Dojo Foundation"
                }
            ],
            "licenses": [
                {
                    "type": "AFLv2.1",
                    "url": "http://trac.dojotoolkit.org/browser/dojo/trunk/LICENSE#L43"
                },
                {
                    "type": "BSD",
                    "url": "http://trac.dojotoolkit.org/browser/dojo/trunk/LICENSE#L13"
                }
            ],
            "repositories": [
                {
                    "type": "svn",
                    "url": "http://svn.dojotoolkit.org/src/view/anon/all/trunk"
                }
            ]
        }
        ,
        {
            "name": "ace",
            "filename": "ace.js",
            "version": "0.2.0",
            "description": "Ace is a standalone code editor written in JavaScript.",
            "homepage": "http://ace.ajax.org/",
            "keywords": [
                "code",
                "editor"
            ],
            "maintainers": [
                {
                    "name": "The Ace Project"
                }
            ],
            "repositories": [
                {
                    "type": "git",
                    "url": "https://github.com/ajaxorg/ace/"
                }
            ]
        }];
    viewModel.packages(_.map(packages, function(package) {
        return {
            name: package.name,
            url: ["http://cdnjs.cloudflare.com/ajax/libs", package.name, package.version, package.filename].join('/')
        }
    }));
})();
