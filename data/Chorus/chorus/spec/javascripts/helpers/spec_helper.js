(function() {

    // ** BEGIN JASMINE 2.0 COMPATIBILITY SHIM ZONE ** //

    // Add back in the old name of addCustomEqualityTester for compability (remove if jasmine-jquery
    // changes to know about addCustomEqualityTester)
    jasmine.getEnv().addEqualityTester = jasmine.getEnv().addCustomEqualityTester;

    jasmine.originalCreateSpy = jasmine.createSpy;
    jasmine.createSpy = function (name, originalFn) {
        var spy = jasmine.originalCreateSpy.apply(this, arguments);
        spy.andCallFake = function () {
            spy.and.callFake.apply(this, arguments);
            return spy;
        };
        spy.andReturn = function () {
            spy.and.returnValue.apply(this, arguments);
            return spy;
        };
        spy.andCallThrough = function () {
            spy.and.callThrough.apply(this, arguments);
            return spy;
        };
        spy.reset = function () {
            spy.calls.reset();
        };
        spy.lastCall = function () {
            return _.last(spy.calls.all());
        };
        spy.nthCall = function (n) {
            return spy.calls.all()[n];
        };
        return spy;
    };

    window.addCompatibilityShimmedMatchers = function(matchersToAdd) {
        for (var name in matchersToAdd) {
            var matcher = matchersToAdd[name];

            var wrappedMatcher = (function (matcher) {
                return function (util, customEqualityTesters) {
                    return {
                        compare: function (actual, expected) {
                            var fakeThis = {
                                actual: actual,
                                expected: expected
                            };

                            var result;
                            try {
                                result = {pass: matcher.apply(fakeThis, Array.prototype.slice.call(arguments, 1))};
                            } catch (e) {
                                result = {pass: false, message: e};
                            }

                            if (!result.pass && !result.message && fakeThis.message) {
                                result.message = fakeThis.message()[0]; // wat
                            }

                            return result;
                        }
                    };
                };
            }(matcher));

            var matchers = {};
            matchers[name] = wrappedMatcher;
            window.addMatchers(matchers);
        }
    };

    // ** END JASMINE 2.0 COMPATIBILITY SHIM ZONE ** //

    function clearRenderedDOM() {
        $('#jasmine_content').empty();
    }

    function checkTranslation(args) {
        var translationKey = args[0];
        var translatedText = t.apply(this, args);
        var missingParams = translatedText.match(/missing (\{\{\w+\}\}) value/);

        if (!I18n.lookup(translationKey)) {
            throw("Test error - Missing translation key '" + translationKey + "'");
        }
        if (missingParams) {
            throw("Test error - Missing parameter for translation key '" + translationKey + "':  " + missingParams[1]);
        }

        return translatedText;
    }

    var dealWithChromeBackgrounding = _.once(function() {
        // Code that only needs to be run once before all the tests run
        _.debounce = function(func, timeout) { return func; };

        $(window).focus(function(){
            jasmine.getEnv().updateInterval = jasmine.DEFAULT_UPDATE_INTERVAL;
        });

        $(window).blur(function() {
            // if you get 'unresponsive script' warnings in Firefox, you can override the dom.max_script_time variable
            jasmine.getEnv().updateInterval = 12000;
        });
    });

    if (window.location.search.indexOf('phantom=') === -1) {
        jasmine.HighlightingReporter = function() {
            this.started = false;
            this.finished = false;
            this.suites_ = [];
            this.results_ = {};
            this.reportRunnerResults = function() {
                $('body').append('<style>.stackTrace .relevant { color: red; }</style>');

                _.each($('.stackTrace'), function (el) {
                    var $el = $(el);
                    var spannedHtml = $el.html().split("\n").map(function (text) {
                        if (text.match(/application|__spec__|assets/)) {
                            return "<span class='relevant'>" + text + "</span>";
                        } else {
                            return text;
                        }
                    }).join("\n");
                    $el.html(spannedHtml);
                });
            };
        };

        jasmine.getEnv().addReporter(new jasmine.HighlightingReporter());
    }

    var backboneModelEqualityTester = function(a, b) {
        if(a instanceof Backbone.Model && b instanceof Backbone.Model) {
            if (a.constructor !== b.constructor) {
                return false;
            }

            if (!_.isUndefined(a.id) && !_.isUndefined(b.id)) {
                return (a.id === b.id);
            }

            if (!_.isUndefined(a.cid) && !_.isUndefined(b.cid)) {
                return (a.cid === b.cid);
            }
        }
    };

    beforeEach(function(done) {
        chorus.currentSpec = jasmine.getEnv().currentSpec.getFullName();
        window.afterSpecFunctions = [];
        dealWithChromeBackgrounding();
        stubDelay();
        stubClEditor();

        jasmine.getEnv().addEqualityTester(backboneModelEqualityTester);

        if (!window.backboneFixtures) {
            // load fixtures asyncronously
            BackboneFixtures.jasmineSetup(chorus.models, chorus.collections, chorus.models.Base, chorus.collections.Base, done);
        } else {
            done();
        }
    });

    beforeEach(function () {
        window.server = this.server = sinon.fakeServer.create();
        this.useFakeTimers = chorus.useFakeTimers;
        chorus.router.unbind();
        delete chorus.page;
        chorus.models.Config.instance().clear();
        window.qtipElements = {};
        window.stubToasts();

        clearRenderedDOM();

        window.addCompatibilityShimmedMatchers({
            toExist: function() {
                return this.actual.size() > 0;
            },

            toBeA: function(klass) {
                if (klass.prototype && klass.prototype.constructorName) {
                    this.message = function () {
                        return [
                            "Expected a '" + this.actual.constructorName + "' to be an instance of '" + klass.prototype.constructorName +"'.",
                            "Expected a '" + this.actual.constructorName + "' to be an instance of something other than '" + klass.prototype.constructorName +"'!"
                        ];
                    };
                }
                if (_.isFunction(klass)) {
                    return this.actual instanceof klass;
                } else {
                    return (typeof this.actual === klass);
                }
            },

            toBeEnabled: function() {
                return this.actual.is(':not(:disabled)');
            },

            toMatchTranslation: function(translationKey) {
                var translatedText = checkTranslation(arguments);

                this.message = function() {
                    return [
                        "Expected text '" + this.actual + "' to match the translation for '" + translationKey + "' (" + translatedText + ")",
                        "Expected text '" + this.actual + "' not to match the translation for '" + translationKey + "' (" + translatedText + ")"
                    ];
                };

                return this.actual === translatedText;
            },

            toContainTranslation: function(translationKey) {
                var actual = _.isString(this.actual) ? this.actual : this.actual.text();
                var translatedText = checkTranslation(arguments);

                this.message = function() {
                    return [
                        "Expected text '" + actual + "' to contain the translation for '" + translationKey + "' (" + translatedText + ")",
                        "Expected text '" + actual + "' not to contain the translation for '" + translationKey + "' (" + translatedText + ")"
                    ];
                };

                return actual && actual.indexOf(translatedText) !== -1;
            },

            toHaveBeenCalledOnSelector: function(selector) {
                return _.any(this.actual.calls.all(), function(call) {
                    return call.object.selector === selector;
                });
            },

            toHaveBeenCalledOn: function(object) {
                return _.any(this.actual.calls.all(), function(call) {
                    return call.object === object;
                });
            },

            toHaveBeenCalledWithSorta: function(object, exceptions) { // only works with 1-argument calls
                function cleanser(object) {
                    object = _.clone(object);
                    _.each(exceptions, function(exception) {
                        if (object.attributes) object.attributes[exception] = undefined;
                        else object[exception] = undefined;
                    });
                    return object;
                }

                var argumentsUsed = "";
                object = cleanser(object);
                if (_.any(this.actual.calls.all(), function(call) {
                    var arg0 = cleanser(call.args[0]);
                    argumentsUsed += "\n" + jasmine.pp(arg0);
                    return arg0.attributes ? _.isEqual(arg0.attributes, object.attributes) : _.isEqual(arg0, object);
                })) {
                    return true;
                }
                this.message = function() {
                    var foo = " to have been called with\n" + jasmine.pp(object) + "\n(ignoring fields " + jasmine.pp(exceptions) + ") as its first argument but was called with " + argumentsUsed + "\n as first arguments";
                    return [ "Expected" + foo , "Expected not" + foo ];
                };
            },

            toContainText: function(text) {
                var actualText = _.isString(this.actual) ? this.actual : this.actual.text();
                actualText = actualText.replace(/\s+/g, " ");
                this.message = function() {
                    return [
                        'Expected "' + actualText + '" to contain "' + text + '"',
                        'Expected "' + actualText + '" not to contain "' + text + '"'
                    ];
                };
                return actualText && actualText.indexOf(text) !== -1;
            },

            toHaveSpinner: function() {
                this.message = function() {
                    return [
                        'Expected "' + this.actual.selector + '" to have a spinner',
                        'Expected "' + this.actual.selector + '" not to have a spinner'
                    ];
                };
                return this.actual.find("div[aria-role=progressbar]").length;
            },

            toHaveModal: function(modalClass) {
                if (!modalClass) { throw "expected undefined modal class to have been launched."; }
                this.message = function() {
                    return [
                        "Expected modal '" + modalClass.prototype.constructorName + "' to have been launched",
                        "Expected modal '" + modalClass.prototype.constructorName + "' not to have been launched"
                    ];
                };
                return _.any(this.actual.modals(), function(modal) {
                    return modal instanceof modalClass;
                });
            },

            toHaveBeenTriggeredOn: function(target, args) {
                var call, eventName = this.actual;

                if (args) {
                    this.message = function() {
                        if (call) {
                            return [
                                "Expected event " + eventName + " to have been triggered on " + target + " with" + args + " but was triggered with " + call.args + " (did you forget to call this matcher with an array of arguments?)",
                                "Expected event " + eventName + " not to have been triggered on " + target + " with" + args + " but was triggered with " + call.args
                            ];
                        } else {
                            return [
                                "Expected event " + eventName + " to have been triggered on " + target + " with " + args + " but it was never triggered",
                                "Expected event " + eventName + " not to have been triggered on " + target + " with " + args + " but it was"
                            ];
                        }
                    };
                } else {
                    this.message = function() {
                        return [
                            "Expected event " + eventName + " to have been triggered on " + target,
                            "Expected event " + eventName + " not to have been triggered on " + target
                        ];
                    };
                }

                if (_.isString(target) || target instanceof jQuery) {
                    return jasmine.JQuery.events.wasTriggered(target, eventName);
                } else if (target._chorusEventSpies && target._chorusEventSpies[eventName]) {
                    call = _.last(target._chorusEventSpies[eventName].calls.all());
                    if (!call) return false;
                    if (args)  return (_.isEqual(call.args, args));
                    return true;
                } else {
                    throw "The event '" + eventName + "' has not been spied on, for the object " + target;
                }
            },

            toMatchUrl: function(target, options) {
                this.message = function() {
                    return [
                        "Expected url " + this.actual + " to be equivalent to url " + target,
                        "Expected url " + this.actual + " not to be equivalent to url " + target
                    ];
                };

                var paramsToIgnore = (options && options.paramsToIgnore) || [];
                var targetURI = new URI(decodeURI(target)).removeSearch(paramsToIgnore);
                var actualURI = new URI(decodeURI(this.actual)).removeSearch(paramsToIgnore);
                return (actualURI).equals(targetURI);
            },

            toContainQueryParams: function(queryParams) {
                var actualQueryParams = new URI(this.actual).query(true);
                var targetQueryParams = new URI("").addQuery(chorus.Mixins.Fetching.underscoreKeys(queryParams)).query(true);

                return _.all(targetQueryParams, function(targetValue, targetKey) {
                    if (targetValue instanceof Array) {
                        return _.difference(targetValue, actualQueryParams[targetKey]).length === 0;
                    } else {
                        return actualQueryParams[targetKey] === targetValue;
                    }
                });
            },

            toHaveUrlPath: function(targetPath) {
                var actualURI = new URI(this.actual);
                return actualURI.path() === targetPath;
            },

            toHaveHref: function(expectedHref) {
                var actualHref = this.actual.attr("href");
                this.message = function() {
                    return [
                        "Expected href " + actualHref + " to be an `a` and equivalent to href " + expectedHref,
                        "Expected href " + actualHref + " to be an `a` and not to be equivalent to href " + expectedHref
                    ];
                };
                return this.actual.is("a") && decodeURI(actualHref) === decodeURI(expectedHref);
            },

            toHaveVisibleQtip: function() {
                return this.actual.find('.qtip').attr('aria-hidden') === 'false';
            },

            toBeBetween: function(lowerBound, upperBound) {
                return (this.actual >= lowerBound) && (this.actual <= upperBound);
            },

            toHaveBeenFetched: function() {
                return !!window.server.lastFetchFor(this.actual);
            },

            toHaveAllBeenFetched: function() {
                return !!window.server.lastFetchAllFor(this.actual);
            },

            toHaveBeenCreated: function() {
                return !!window.server.lastCreateFor(this.actual);
            },

            toHaveBeenUpdated: function() {
                return !!window.server.lastUpdateFor(this.actual);
            },

            toHaveAttrs: function(args) {
                return _.all(args, function(val, key) {
                    return this.actual.attributes[key] === val;
                }, this);
            },

            toHaveSubscription: function(eventName, callback) {
                this.message = function() {
                    return [
                        "Expected to have subscription to event " + eventName + " with callback " + callback,
                        "Expected not to have subscription to event " + eventName + " with callback " + callback
                    ];
                };
                return _.any(chorus.PageEvents._events[eventName], function(subscription) {return subscription.callback === callback;});
            }
        });

        var fakeSpinner = {
            spin: jasmine.createSpy('MockSpinner.spin').andCallFake(function(parentEl) {
                this.el = $('<div aria-role="progressbar"/>')[0];
                parentEl && parentEl.appendChild(this.el);
                return this;
            }),

            stop: jasmine.createSpy('MockSpinner.stop').andCallFake(function() {
                if (this.el) {
                    $(this.el).detach();
                }
            })
        };

        window.Spinner = jasmine.createSpy('MockSpinner').andCallFake(function() {
            return fakeSpinner;
        });

        $.fx.off = true;
        spyOn(window.history, "back");
        spyOn(chorus, 'isDevMode').andReturn(false);

        chorus.PageEvents.off();
        chorus.session.sandboxPermissionsCreated = {};
        setLoggedInUser();
    });

    var specWhitelist = {
        id: true,
        env: true,
        suite: true,
        description: true,
        queue: true,
        afterCallbacks: true,
        spies_: true,
        results_: true,
        matchersClass: true
    };

    afterEach(function() {
        chorus.router.trigger("leaving");
        _.each(window.afterSpecFunctions, function (fn) { fn(); });

        delete chorus.models.Config._instance;

        $.cookie("userId", null);
        if (this instanceof jasmine.Spec) {
            _.each(this, function(_value, key) {
                if (this.hasOwnProperty(key) && !(key in specWhitelist)) {
                    if (this[key] && this[key].teardown) {
                        this[key].teardown();
                    }
                    delete this[key];
                }
            }, this);
        }
        chorus._navigated();
        window.server = undefined;
    });

    //global helpers
    window.context = window.describe;
    window.xcontext = window.xdescribe;
    window.specify = window.it;
    window.xspecify = window.xit;

    window.xitBehavesLike = {};
    _.each(window.itBehavesLike, function(value, key) { window.xitBehavesLike[key] = $.noop; });

    window.loadConfig = function() {
        chorus.models.Config.instance().set(backboneFixtures.config().attributes);
    };

    window.unsetLoggedInUser = function() {
        chorus.session.unset("id");
        delete chorus.session._user;
    };

    var jquerySpyOnEvent = window.spyOnEvent;
    var backboneSpyOnEvent = function(object, name) {
        var eventSpy = jasmine.createSpy(name + "Spy");
        object.bind(name, eventSpy);
        object._chorusEventSpies || (object._chorusEventSpies = {});
        object._chorusEventSpies[name] = eventSpy;
        return eventSpy;
    };

    window.spyOnEvent = function(object) {
        if (object.bind === Backbone.Events.bind) {
            return backboneSpyOnEvent.apply(this, arguments);
        } else {
            return jquerySpyOnEvent.apply(this, arguments);
        }
    };

    window.resetBackboneEventSpies = function(object) {
        if (object._chorusEventSpies) {
            _.each(object._chorusEventSpies, function(spy) {
                spy.reset();
            });
        }
    };

    window.setLoggedInUser = function(options, chorusObject) {
        var target = (chorusObject || chorus);
        if(options instanceof chorus.models.User) {
            options = options.attributes;
        }
        target.session = backboneFixtures.session({user: options});
    };

    window.stubToasts = function () {
        spyOn(Messenger(), 'post');
    };

    window.stubView = function(html, options) {
        options || (options = {});
        var stubClass = Backbone.View.extend({
            className: options.className,

            initialize: function() {
                _.bindAll(this, "render");
            },

            render: function() {
                this.$el.html(html);
                return this;
            },

            teardown: $.noop
        });

        return new stubClass();
    };

    window.stubModals = function() {
        spyOn($, "facebox");
        $.facebox.settings = {};
        var launchModalSpy = spyOn(chorus.Modal.prototype, "initialize").andCallThrough();

        return {
            lastModal: function() {
                return _.last(this.modals());
            },

            modals: function() {
                return _.map(launchModalSpy.calls.all(), function(call) {
                    return call.object;
                });
            },

            reset: function() {
                launchModalSpy.reset();
            }
        };
    };

    window.stubDelay = function() {
        spyOn(_, 'delay').andCallFake(function(func) {
            func();
        });
    };

    window.unstubDelay = function () {
        _.delay.andCallThrough();
    };

    window.qtipElements = {};
    window.stubQtip = function(selector) {
        selector || (selector = "*");
        qtipElements[selector] = $('<div></div>');
        $('#jasmine_content').append(qtipElements[selector]);

        if (!jasmine.isSpy($.fn.qtip)) {
            var qtip = $.fn.qtip;

            spyOn($.fn, 'qtip').andCallFake(function() {
                var jqueryObject = this;
                var options = arguments[0] || {};
                if (typeof options !== 'object') return;

                _.any(qtipElements, function(fakeQtipEl, selector) {
                    if (!jqueryObject.is(selector)) return false;
                    options.show || (options.show = {});
                    options.position || (options.position = {});
                    options.show.delay = 0;
                    options.position.container = fakeQtipEl;

                    qtip.call(jqueryObject, options);
                    return true;
                });
            });
        }

        qtipElements[selector].$ = qtipElements[selector].find;
        return qtipElements[selector];
    };

    window.stubSelectMenu = function() {
        var stubContainer = $('<div class="selectMenuStub"></div>');
        $('#jasmine_content').append(stubContainer);

        var selectmenu = $.fn.selectmenu;

        spyOn($.fn, 'selectmenu').andCallFake(function() {
            var jqueryObject = this;
            var options = arguments[0] || {};
            options.appendTo = stubContainer;
            selectmenu.call(jqueryObject, options);
            return true;
        });

        return stubContainer;
    };

    window.stubClEditor = function() {
        spyOn($.fn, "cleditor").andReturn([0]);
    };

    window.unstubClEditor = function () {
        $.fn.cleditor.andCallThrough();
    };

    window.enterTag = function(view, tagName) {
        var keyup = $.Event('keyup');
        keyup.keyCode = $.ui.keyCode.ENTER;
        var enter = $.Event('enterKeyPress');
        var input = view.$("input");
        input.val(tagName);
        input.focus();
        input.trigger(enter);
        input.trigger(keyup);
    };

    if ($.browser.msie && !window['con' + 'sole']) {
        (function(F, i, r, e, b, u, g, L, I, T, E) {
            if (F.getElementById(b))return;
            E = F[i + 'NS'] && F.documentElement.namespaceURI;
            E = E ? F[i + 'NS'](E, 'script') : F[i]('script');
            E[r]('id', b);
            E[r]('src', I + g + T);
            E[r](b, u);
            (F[e]('head')[0] || F[e]('body')[0]).appendChild(E);
            E = new Image();
            E[r]('src', I + L);
        })(document, 'createElement', 'setAttribute', 'getElementsByTagName', 'FirebugLite', '4', 'firebug-lite.js', 'releases/lite/latest/skin/xp/sprite.png', '/firebug-lite/build/', '#startOpened');
    }

    // Don't change urls in specs
    Backbone.History.prototype.navigate = function(fragment, triggerRoute) {
        if (triggerRoute) this.loadUrl(fragment);
    };

    //initialization
    (function safeStart() {

        var origLogin = chorus.requireLogin;
        var origHistory = chorus.startHistory;
        chorus.requireLogin = $.noop;
        chorus.startHistory = function () {
            Backbone.history.options = {root: '/'};
        };

        chorus.initialize();

        chorus.requireLogin = origLogin;
        chorus.startHistory = origHistory;

    })();
})();
