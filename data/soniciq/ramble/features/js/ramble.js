/**
 * Cucumber Test Runner and Gherkin Parser
 * @author Jamie Hill <jamie@soniciq.com>
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires jQuery
 */
var Ramble = {
    debug: false,
    _debug: function() {
        if (this.debug) console.log(arguments);
    }
}

/**
 * Gherkin DSL parser
 * @version $Rev$
 * @requires Ramble
 */
Ramble.Parser = {
    parseFeatureFile: function(data) {
        var feature = new Ramble.Feature();
        var describingFeature = true;
        var lines = data.split('\n');
        var line, scenario, step;
        feature.title = lines.splice(0,1)[0];
        $.each(lines,function() {
            line = $.trim(this.toString());
            if (describingFeature) {
                // Really need to make a proper parser! Still, got a class for it now.
                if (line != "") {
                    feature.description += line + "\n";
                } else {
                    describingFeature = false;
                    return;
                }
            } else {
                if (line == "") {
                    return;
                } else if (this.indexOf('Scenario:') != -1) {
                    scenario = new Ramble.Scenario(feature);
                    feature.scenarios.push(scenario);
                    scenario.title = line;
                } else {
                    step = new Ramble.Step(scenario);
                    step.text = line;
                    if (line.indexOf('#') === 0) {
                        step.comment = true;
                    } else {
                        step.comment = false;
                    }
                    scenario.steps.push(step);
                }
            }
        });
        return feature;
    },
    getExampleCode: function(step, html) {
        var code = step.text.replace(/^(Given|When|Then|And)\s+/, '').replace(/"([^\"]*)"/, '"([^\"]*)"');
        var args = [];
        var quotes = step.text.match(/"/g);
        if(quotes) {
          for(i = 0; i < parseInt(quotes.length / 2); i++) {
            args.push('arg' + (i + 1));
          }
        }
        args = args.join(', ');
        var example = "Missing step definition:";
        example += html ? this.html_nl : "\n";
        example += html ? this.html_code_pre : "\n";
        example += 'ramble.match(/^' + code + '$/, function(' + args + ') {\n  // code\n});';
        example += html ? this.html_code_post : "";
        return example;
    },
    html_nl: "<br/>",
    html_code_pre: "<pre><code>",
    html_code_post: "</code></pre>"
};
Ramble.Feature = function() {
    this.type = "feature";
    this.title = '';
    this.description = '';
    this.scenarios = [];
}
Ramble.Scenario = function(feature) {
    this.type = "scenario";
    this.title = '';
    this.feature = feature;
    this.steps = [];
};
Ramble.Step = function(scenario) {
    this.type = "step";
    this.text = "";
    this.status = "";
    this.comment = false;
    this.scenario = scenario;
}
Ramble.Report = function() {
    this.scenarios = {
        'undefined' : 0,
        'pending' : 0,
        'passed' : 0,
        'failed' : 0
    }
    this.steps = {
        'undefined' : 0,
        'pending' : 0,
        'passed' : 0,
        'failed' : 0
    }
    this.time = 0
}
/**
 * Outputter Interface defines the methods all outputters should have.
 */
Ramble.IOutputter = {
    /**
     * Start output for a suite of features
     * @public
     * @returns void
     */
    start: function() {},
    /**
     * Output a step
     * @public
     * @param Ramble.Feature a ramble feature object (defining .title and .description)
     * @returns void
     */
    outputFeature: function(feature) {},
    /**
     * Output a step
     * @public
     * @param Ramble.Scenario a ramble scenario object (defining .title)
     * @returns void
     */
    outputScenario: function(scenario) {},
    /**
     * Output a step
     * @public
     * @param String step the string of the step definition
     * @param String status the pass / fail / undefined status of the test
     * @returns void
     */
    outputStep: function(step, status) {},
    /**
     * Stop output for a suite of features
     * @public
     * @returns void
     */
    stop: function() {}
};
Ramble.HtmlOutputter = {
    results : null,
    results_selector: '#results',
    start: function() {
        this.results = $(this.results_selector);
        this._beforeOutput();
        this._afterOutput();
    },
    outputFeature: function(feature) {
        this._beforeOutput();
        var div = $('<div/>', { 'class': 'ramble-feature' });
        this.results.append(div);
        div.append($('<h3/>', { text: feature.title }));
        var description = feature.description.split('\n').join('<br/>');
        div.append($('<p/>', { 'class': 'ramble-description', html:description }));
        this._currentFeature = div;
        this._afterOutput();
    },
    outputScenario: function(scenario) {
        this._beforeOutput();
        var div = $('<div/>', { 'class': 'ramble-scenario' });
        this._currentFeature.append(div);
        div.append($('<h4/>', { text: scenario.title }));
        this._currentScenario = div;
        this._currentSteps = $('<ul/>', { 'class': 'ramble-steps' });
        div.append(this._currentSteps);
        this._afterOutput();
    },
    outputStep: function(step) {
        this._beforeOutput();
        var status = step.status;
        var className = 'ramble-'+status;
        var text = step.text;
        if (status == "fail") {
            text += "<br /><em>" + step.error + "</em>";
        }
        if (status == "missing") {
            text += "<br />"+Ramble.Parser.getExampleCode(step, true);
        }
        var li = this._currentSteps.append($('<li/>', { 'class': className, html: text }));
        this._afterOutput();
    },
    stop: function(report) {
        this._beforeOutput();
        this._afterOutput();
    },
    _currentFeature : null,
    _currentScenario : null,
    _currentSteps : null,
    _shouldScroll : true,
    _beforeOutput : function() {
        var scrollCur = this.results.attr("scrollTop") + this.results.height();
        this._shouldScroll = ( scrollCur >= this.results.attr("scrollHeight") );
    },
    _afterOutput : function() {
        if ( this._shouldScroll ) this.results.attr({ scrollTop: this.results.attr("scrollHeight") });
    }
};

/**
 * Provides a the context of a step definition supplying helpers.
 * @author Jamie Hill <jamie@soniciq.com>
 * @version $Rev$
 */
Ramble.Context = { 
  iframe: null,
  contents: null,
  visit: function(url) {
      // should be checking for 404, 500 here with an ajax call, since
      // you can't get it in iframes?
      // could be tricky if a page is meant to be served N times only.
      if(!url) throw('Problem getting path for: ' + url);
      Ramble._debug("visit() ", url);
      this.iframe.trigger('urlChange.ramble', { href: url });
  },
  clickLink: function(text) {
    var link = this.contents.find('a').filter(function() { return $(this).text() == text; });
    if(!link.length) throw("Can't find link: " + text);
    link.click();
  },
  clickButton: function(text) {
    var button = this.contents.find('input[type="submit"]').filter(function() { return $(this).val() == text; })
    if(!button.length) throw("Can't find button named: " + text);
    button.click();
    this.pageLoading = true;
  },
  fillIn: function(labelText, value) {
    var label = this.contents.find('label').filter(function() { return $(this).text() == labelText; }).first();
    var field = this.contents.find('input#' + label.attr('for'));
    if(!field.length) throw("Can't find field for: " + labelText);
    field.val(value);
  },
  assertHasContent: function(content) {
    if(this.contents.text().indexOf(content) == -1) throw('Should have seen: ' + content);
  },
  assertCurrentPath: function(path) {
    this.assertEqual(path, this.currentPath());
  },
  currentPath: function() {
    return this.iframe[0].contentWindow.location.pathname;
  },
  assert: function(value, message) {
    if (!value) throw(message || ('Expected value to evaluate to true: ' + value));
  },
  assertEqual: function(expected, result) {
    if (expected != result) throw('Expected: ' + expected + ', got: ' + result);
  },
  // Proxy to this.contents that throws error if no elements found (maybe add as jQuery plugin).
  find: function(selector) {
    var result = this.contents.find(selector);
    this.assert(result.length, "Couldn't find element(s) for selector: " + selector);
    return result;
  }
}

/**
 * Loads and runs Gherkin feature files against Step matcher files
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 */
Ramble.Runner =  {
    workspaceSelector: '#workspace',
    outputter: Ramble.HtmlOutputter,
    parser: Ramble.Parser,
    paths: [],
    features: [],
    matchers: [],
    pageLoading: false,
    retryOnFailWithinMilliseconds: 0,
    options: {
        speed: "fast"
    },
    init: function(options) {
        this.options = $.extend(this.options, options);
        this.outputter.start();
        if (!this.iframe) {
            Ramble.Context.iframe = $('<iframe id="browser" />').appendTo(this.workspaceSelector);
            Ramble.Context.iframe.css({ width: 500, height: 300 });
            Ramble.Context.iframe.load(function() {
                Ramble.Runner.pageLoading = false;
                Ramble.Context.contents = $(this).contents();
                Ramble.Context.contents.find('a').click(function() {
                    Ramble.Context.visit($(this).attr('href'));
                })
                Ramble.Context.contents.find('form').submit(function() {
                    Ramble.Runner.pageLoading = true;
                });
                Ramble.Runner.run();
            }).bind('urlChange.ramble', function(event, data) {
                Ramble.Runner.pageLoading = true;
                $(this).attr('src', data.href);
            });
        }
    },
    /**
     * Loads a feature file using Ajax
     * @public
     * @param String file URL to load
     * @returns void
     */
    loadFeatureFile: function(file) {
        //Ramble._debug('loadFeatureFile', file);
        $.ajax({
            url: file,
            success: function(data) {
                Ramble.Runner._parseFeatureFile(data, file);
            },
            dataType: 'text/plain',
            async: false
        });
    },
    /**
     * Test run method, a "breaking queue"
     * @public
     * @returns void
     */
    run: function() {
        var self = this;
        
        while (this._queue_index < this._queue.length) {
            if (Ramble.Runner.pageLoading) {
                return;
            } else if (Ramble.Runner.options.speed != "fast") {
                var date = new Date();
                var time = date.getTime();
                clearTimeout(Ramble.Runner._time_out);
                Ramble.Runner._time_out = setTimeout(function() {
                    Ramble.Runner.run();
                }, 100);
                if (time < Ramble.Runner._time_next) {
                    return;
                }
                Ramble.Runner._time_next = time + Ramble.Runner._times[ Ramble.Runner.options.speed ];
            }
            
            
            var item = this._queue[ this._queue_index ];

            if ( item.start_time === undefined ) {
                Ramble.Runner.retryOnFailWithinMilliseconds = 0;
                var date = new Date();
                item.start_time = date.getTime();
            }

            var found;
            $.each(this._befores, function() {
                this.apply(Ramble.Context);
            });
            switch (item.type) {
                case "feature":
                    this.outputter.outputFeature(item);
                break;
                case "scenario":
                    this.outputter.outputScenario(item);
                break;
                case "step":
                    var step = item.text;
                    if (item.comment == true) {
                        item.status = "comment";
                    } else if ($.trim(step) == "pending") {
                        item.status = "pending";
                    } else {
                        found = null;
                        $.each(this.matchers, function() {
                            var match = step.replace(/^(Given|When|Then|And)\s+/, '').match(this.regexp);
                            if (match) {
                                found = { matches: match.slice(1), test: this.test };
                                return;
                            }
                        });
                        if (found !== null) {
                            try {
                                var result = found.test.apply(Ramble.Context, found.matches);
                                item.status = "pass";
                            } catch (error) {
                                item.status = "fail";
                                item.error = error;
                            }
                        } else {
                            item.status = "missing";
                        }
                    }

                    if (Ramble.Runner.retryOnFailWithinMilliseconds > 0) {
                      var date = new Date();
                      var time = date.getTime();
                      if ( time > item.start_time + Ramble.Runner.retryOnFailWithinMilliseconds ) {
                        Ramble.Runner.retryOnFailWithinMilliseconds = 0;
                      }
                    }

                    if (Ramble.Runner.retryOnFailWithinMilliseconds === 0 || item.status != "fail") {
                        this.outputter.outputStep(item);
                    }
                break;
            }
            if (Ramble.Runner.retryOnFailWithinMilliseconds === 0 || item.status != "fail") {
                this._queue_index++;
                if ( this._queue_index == this._queue.length ) {
                    this.outputter.stop();
                }
            }
        }
    },
    /**
     * Add a matcher
     * @public
     * @param RegExp match The regular expression match
     * @param Function test The test to run on the page
     * @return void
     */
    match: function(regexp, test) {
        var matcher = { regexp: regexp, test: test };
        Ramble._debug("add matcher", matcher);
        this.matchers.push(matcher);
    },
    /**
     * Adds a path matcher
     * @public
     * @param RegExp regexp The "name" of the page as a regex
     * @param String path The url of the page
     * @returns void
     */
    addPath: function(regexp, path) {
        this.paths.push({ regexp: regexp, path: path });
    },
    pathTo: function(path_name) {
        found = null;
        $.each(this.paths, function() {
            var match = path_name.match(this.regexp);
            if(match) {
                found = { matches: match.slice(1), path: this.path };
                return;
            };
        });

        if(found == null) {
            this.results.append($('<p/>', { text: "Couldn't find path for: " + path, 'class': 'error' }));
        } else {
            try {
                return typeof(found.path) == 'string' ? found.path : found.path.apply(ramble, found.matches);
            } catch(error) {
                this.results.append($('<p/>', { 
                    html: 'Problem with path: ' + path + '<br/> - ' + error, 'class': 'error' 
                }));
            }
        }
    },
    _parseFeatureFile: function(data, file) {
        var feature = Ramble.Parser.parseFeatureFile(data);
        this.addFeatureObject(feature);
    },
    addFeatureObject: function(feature) {
        var queue = this._queue;
        queue.push(feature);
        $.each(feature.scenarios, function() {
            queue.push(this)
            $.each(this.steps, function() {
                queue.push(this);
            })
        });
    },
    before: function(beforeFunction) {
        this._befores.push(beforeFunction);
    },
    _befores: [],
    _queue: [],
    _queue_index: 0,
    _times: {
        "medium":   600,
        "slow":     2000
    }
}
var ramble = Ramble.Runner;
