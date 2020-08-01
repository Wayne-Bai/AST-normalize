var _ = require('underscore');
var Async = require('async');
var Cp = require('child_process');
var Cluster = require('cluster');
var Daemon = require('./daemon');
var Fs = require('fs');
var Http = require('http')
var Joi = require('joi');
var Path = require('path');
var Qs = require('querystring');
var Request = require('request');
var Statistics = require('./statistics');
var Table = require('easy-table');
var Url = require('url');
var Util = require('util');

var Errors = require('./errors');

// Joi Validation Presets
var N = Joi.Types.Number,
    S = Joi.Types.String,
    B = Joi.Types.Boolean,
    A = Joi.Types.Array;
var Flag = S().allow(false).allow(true);


Http.globalAgent.maxSockets = 4096;


var Client = function (options, env) {

    var self = this;
    self.options = self.validateOptions(options);
    self.env = env || {};
    
    // TODO: Move instantiations to initialize() once finalized
    self.url = null;
    self._ignoreRemoteData = false;
    self._soloBenchMode = false;
    self._startupMessagePrinted = false;
    self.version = require('../package.json').version;
    self.Math = new Statistics();
    self.outputPath = null;
    self._precalc = {};
    self.errors = {};
    self.isDisplayingOpsMetrics = false;
    
    self.initialize();
    
    var filename = self.options['<filename_or_url>']
    self.filenames = [];
    
    if (filename instanceof Array) {
        self.filenames = filename;
    }
    else {
        self._soloBenchMode = true;
        self.filenames = [filename];
    }
    
    Async.mapSeries(self.filenames, self.execBench.bind(self), self.printResults.bind(self));
};


Client.prototype._optionsSchema = {
    '<filename_or_url>': A(),
    '--help': Flag,
    '--verbose': Flag,
    '--silent': Flag,
    '--daemon': Flag,
    '--store-responses': B(),
    '--force': B(),
    '-m': Flag, // Method
    '-u': Flag, // URI 
    '-p': Flag, // Payload JSON file
    '-f': Flag, // Payload file
    // '-l': Flag, // Log file // FUTURE
    '-o': Flag, // Output file
    '-C': Flag, // Cookies (keyvalue pairs)
    '-H': Flag, // Custom Headers (as JSON)
    '-t': N(), // timeout
    
    '-n': N(), // Number of requests per batch
    '-c': S().regex(/(\d+\.\.\d+|\d+)/), // Range of concurrent requests to attempt per batch format: n..m
    '-i': N(), // Concurrent increment between batch endpoints
    '-z': N(), // Metric Interval
    
    '--host': S(),
    '--port': N(),
    '--https': B(),
    
    'rootPath': S(),
    '<url>': S().allow(false).allow(null).allow(true)
};


Client.prototype.validateOptions = function (options) {

    var o = _.clone(options);
    
    Joi.settings.saveConversions = true;
    Joi.settings.skipFunctions = true;
    
    var err = Joi.validate(o, this._optionsSchema);
    if (err) {
        throw "Invalid Option(s):  " + err._errors.map(function(d){ return d.path; });
    }
    
    return o;
};


Client.prototype.initialize = function () {

    this.payload = null;
    this._log = [];
    this.batchData = {};
    
    this.silentMode = this.options['--silent'];
    
    if (this.options['-p']) { // payload file
        this.payload = Fs.readFileSync(this.options['-p']).toString();
    }
    
    if (this.options['-f']) {
        this.payloadFile = Fs.readFileSync(this.options['-f']); // as buffer
    }
    
    if (this.options['-C']) { // cookie jar file
        this.cookiejar = Fs.readFileSync(this.options['-C']).toString();
    }
    
    // Handle cleanup
    process.on("SIGINT", this.bind(this.cleanup, this));
    process.on('uncaughtException', this.bind(this.cleanup, this));
};


Client.prototype.isURL = function (str) {

    return (str.indexOf('http') == 0);
};


Client.prototype.getAdminURL = function (uriPath) {

    var url = this.url;
    uriPath = uriPath || '/start';
    
    url = [url.protocol, '//', url.hostname, ':', (+url.port + 1), uriPath, "?metricInterval=" + this.options['-z']].join('');
    return url;
};


Client.prototype.log = function () {

    if (this.env.DEBUG || !this.silentMode) {
        console.log.apply(null, arguments);
    }
    else {
        this._log.push(Array.prototype.slice.apply(arguments));
    }
};


Client.prototype.debug = function () {

    if (this.env.DEBUG) {
        console.log.apply(null, arguments);
    }
};


Client.prototype.execBench = function (filename, callback) {

    var self = this;
    if (self.isURL(filename)) {
        self.url = Url.parse(filename);
        self.currentFilename = filename;
        self.remoteBench(filename, callback);
    }
    else {
        self.localBench(filename, callback);
    }
};


Client.prototype.printStartupMessage = function () {

    var self = this;
    if (!self._startupMessagePrinted) {
        self._startupMessagePrinted = true;
        
        // Startup messages
        self.log('This is Flod, version ' + self.version);
        self.log('\nBenchmarking (hold on)...\n');
    }
};


Client.prototype.printResults = function (err, batchData) {

    if (err) {
        throw err;
    }
    
    var self = this;
    var ts = Date.now();
    
    self.debug("=============");
    self.debug('batchData:')
    self.debug(JSON.stringify(batchData, null, 2));
    self.debug("=============");
    
    var rows = [];
    var fuzzyByteFormat = function (value) {

        if (value >= 1000000000) {
            return Math.floor(value / 1000000000).toString() + "G"
        }
        else if (value >= 1000000) {
            return Math.floor(value / 1000000).toString() + "M"
        }
        else if (value >= 1000) {
            return Math.floor(value / 1000).toString() + "K"
        }
        else {
            return value;
        }
    };
    
    
    self.filenames.forEach(function (filename, index) {

        var data = batchData[index];
        var info = data.info;
        Object.keys(data).filter(function(d){ return !isNaN(+d);}).forEach(function (rps, jIndex) {

            var row = {
                server: info.server || filename,
                rps: rps,
                latency: '',
                mem: '',
                load: ''
            };
            
            var hasError = self.errors && self.errors.hasOwnProperty(filename) && self.errors[filename].hasOwnProperty(rps);
            var isIncompleteBatch = data[rps].requestCounter != data[rps].responseCounter;
            if (hasError && isIncompleteBatch) {
                row.latency = 'n/a';
            }
            else {
                
                if (data[rps].latencies) {
                    row.latency = self.Math.mean(data[rps].latencies).toFixed(2) + " ± " + self.Math.stdDev(data[rps].latencies).toFixed(2);
                }
                if (data[rps].metrics) { // remoteBench with flod probe support
                    self.isDisplayingOpsMetrics = true; // if displaying once, display columns for all batches
                    
                    if (data[rps].metrics.mem) {
                        var mem = Object.keys(data[rps].metrics.mem).map(function(d){return data[rps].metrics.mem[d].rss;});
                        row.mem = fuzzyByteFormat(self.Math.mean(mem)) + " ± " + fuzzyByteFormat(self.Math.stdDev(mem));
                    }
                    if (data[rps].metrics.load) {
                        var load = Object.keys(data[rps].metrics.load).map(function(d){return data[rps].metrics.load[d][0];});
                        row.load = self.Math.mean(load).toFixed(2) + " ± " + self.Math.stdDev(load).toFixed(2);
                    }
                }
            }
            
            rows.push(row);
        });
    });
    
    // Pretty Print Rows
    var t = new Table;
    rows.forEach(function (r) {

        t.cell('Server', r.server);
        t.cell('Requests/sec', r.rps);
        t.cell('Latency (ms)', r.latency);
        if (self.isDisplayingOpsMetrics) {
            t.cell('Memory', r.mem);
            t.cell('Load', r.load);
        }
        t.newRow();
    });
    
    self.log(t.toString());
    
    if (self.outputPath) {
        Fs.writeFileSync(self.outputPath, JSON.stringify(batchData));
        console.log("Data written to " + self.outputPath);
    }
    
    if (Object.keys(self.errors).length > 0) {
        console.log('Errors thrown:')
        Object.keys(self.errors).forEach(function (filename, index) {

            Object.keys(self.errors[filename]).forEach(function (rps, index) {

                console.log('\t' + self.errors[filename][rps].message);
            });
        });
    }
    
    // // Log file
    // if (self.options['--daemon']) { 
    //     var logPath = self.options['--daemon'];
    //     if (logPath[0] !== '/') {
    //         logPath = Path.join(self.options.rootPath, logPath);
    //     }
    //     Fs.writeFileSync(Path.join(logPath, filename), self._log.join('\n'));
    // }
};


Client.prototype.remoteBench = function (filename, callback) {

    var self = this;
    
    // Check output path
    var outputPath = self.outputPath = this.options['-o'];
    if (outputPath) { 
        var self = this;
        if (outputPath[0] !== '/') {
            outputPath = Path.join(self.env.PWD, outputPath);
        }
        
        if (Fs.existsSync(outputPath)){
            if (!this.options['--force']) {
                console.log("File (" + outputPath + ") exists. To overwrite use --force option.");
                return self.cleanup();
            }
        }
    }
    
    // Split into Batches
    self.concurrentStart = self.options['-c'];
    self.concurrentEnd = self.options['-c'];
    self.concurrentIncrement = (+self.options['-i']);
    var total = +self.options['-n'];
    
    if (self.options['-c'].indexOf('..') > 0) {
        var concSplit = self.options['-c'].split('..');
        self.concurrentStart = +concSplit[0];
        self.concurrentEnd = +concSplit[1];
        
        if (self.concurrentEnd < self.concurrentStart) {
            console.log("Concurrents x..y: y cannot be less than x");
            return self.cleanup();
        }
    }
    else {
        self.concurrentStart = +self.concurrentStart;
        self.concurrentEnd = +self.concurrentEnd;
    }
    
    if (self.concurrentStart > total || self.concurrentEnd > total) {
        var errormsg = "\nError: Concurrents (" + self.concurrentStart + ", " + self.concurrentEnd + ") cannot be greater than the total (" + total + ")";
        console.log(errormsg);
        return self.cleanup();
    }
    
    var batchCounter = self.concurrentStart;
    self.numBatches = 0;
    while (batchCounter <= self.concurrentEnd) {
        batchCounter += self.concurrentIncrement;
        self.numBatches++;
    }
    
    var executeBatch = function (i, cb) {

        // Identify current batch w/ concurrent requests per second to attempt
        self.currentBatch = self.concurrentStart + (i * self.concurrentIncrement);
        
        // Initialize batch data
        self.batchData[self.currentBatch] = {};
        self.batchData[self.currentBatch].metrics = null;
        self.batchData[self.currentBatch].responses = {};
        self.batchData[self.currentBatch].requestCounter = 0;
        self.batchData[self.currentBatch].responseCounter = 0;
        self.batchData[self.currentBatch].latencies = new Array(this.options['-n']);
        
        if (self.options['--store-responses']) {
            self.batchData[self.currentBatch].responses = new Array(this.options['-n']);
        }
        
        // Execute Batch
        Async.waterfall([
            self.bind(self.startBench, self),
            // self.bind(self.warmupBench, self),
            self.bind(self.bench, self),
            self.bind(self.finishBench, self)
        ], function (err, stats) {

            if (err) { 
                if (err instanceof Errors.RequestOverloadError) {
                    self.errors[self.url.href] = self.errors[self.url.href] || {};
                    self.errors[self.url.href][self.currentBatch] = err;
                }
                else if (err instanceof Errors.ConnectionError) {
                    self.errors[self.url.href] = self.errors[self.url.href] || {};
                    self.errors[self.url.href][self.currentBatch] = err;
                }
                else {
                    self.debug('waterfall err', err, stats);
                    return self.cleanup(err);
                }
            }
            
            // Store Batch data
            if (!self._ignoreRemoteData && stats) {
                self.batchData[self.currentBatch].metrics = stats;
                self.batchData.info = stats.info || {};
                delete self.batchData[self.currentBatch].metrics.info;
            }
            
            cb();
        });
    };
    
    self.printStartupMessage();
    
    // Execute Batches
    Async.timesSeries(self.numBatches, executeBatch.bind(self), function(err){

        // Copy data to prevent overwrite due to pass by reference
        var batchDataSlice = self.batchData;
        self.batchData = {};
        
        return callback(err, batchDataSlice);
    });
};


Client.prototype.sleep = function (callback, sleepTime) {

    sleepTime = sleepTime || 1000;
    
    setTimeout((function () {

        callback();
    }), sleepTime);
};


// If benchmark client is interrupted, let the server daemon know
Client.prototype.cleanup = function (err) {

    var self = this;
    if (err) {
        console.trace(err);
        self.log(err);
    }
    
    var gracefulStop = function () {

        if (self.daemon) {
            self.daemon.admin.stop();
            self.daemon.server && self.daemon.server.kill();
        }
        return setImmediate(function () {

            self.daemon = null;
            delete self.daemon;
            process.exit(1);
        });
    };
    
    if (!this._finishedBench) {
        self.debug('interrupted, sending finishBench request');
        this.finishBench(gracefulStop);
    }
    else {
        process.nextTick(gracefulStop);
    }
};


Client.prototype.startBench = function (callback) {

    var self = this;
    var req = {
        method: 'GET',
        uri: self.getAdminURL('/start')
        // pool: {maxSockets: 8}
    };
    self._finishedBench = false;
    self.debug("startBench");
    self.debug(["doing batch", self.currentBatch].join(" "));
    
    // Precalculate some numbers
    var concurrents = self.currentBatch; // targeted # of requests per second
    var max = +self.options['-n'];
    var waves = Math.ceil(max / concurrents);
    var performPrecalc = function (i, cb) {

        var precalc = concurrents;
        if ( (max - (i*concurrents)) < concurrents ) {
            precalc = max - (i*concurrents);
        }
        return cb(null, precalc);
    };
    
    var precalcWrapper = function (cb) {

        if (!self.hasOwnProperty('_precalc') || (self._precalc && !self._precalc.hasOwnProperty('concurrents'))) {
            self._precalc = self._precalc || {};
            Async.mapSeries(Array.apply(null, {length: waves}).map(Number.call, Number), performPrecalc, function (err_, result) {

                self._precalc[concurrents] = result;
                cb(err_, result);
            });
        }
        else {
            return cb(null, self._precalc["concurrents"]);
        }
    };
    
    Request(req, function (err, res, body) {

        if (err) {
            self.debug('startBench err', err)
            self._ignoreRemoteData = true;
            self.debug('[WARN]: server does not support flod.probe metrics, ignoring mem/cpu data')
            return callback();
        }
        self.debug('/start called', req);
        
        var data = body;
        if (res.headers['content-type'].indexOf('application/json;') == 0) {
            try {
                data = JSON.parse(body);
            }
            catch (e) {
                self.log.push("Error parsing JSON from startBench: " + e); // TODO: replace with something better
            }
        }
        
        self.debug('started at', data);
        
        precalcWrapper(function(){
            callback(err);
        });
        // return callback(err);
    });
};


Client.prototype.bench = function (callback) {

    var self = this;
    var concurrents = self.currentBatch; // targeted # of requests per second
    var max = +self.options['-n'];
    var waves = Math.ceil(max / concurrents);
    self.batchData.info = self.batchData.info || {};
    self.batchData.info.startTime = Date.now();
    self.debug("starting .bench")
    
    var handler = function (i, cb) {

        self.debug(['\thandler', i*concurrents, concurrents, max].join(" "));
        var start = Date.now();
        var shortcircuited = false;
        
        var timer = setTimeout((function () {

            shortcircuited = true;
            cb(new Errors.RequestOverloadError({rps:concurrents, url: self.currentFilename}));
        }), self.options['-t'] || 1500);
        
        var precalc = concurrents;
        if (self._precalc[i]) {
            precalc = self._precalc[i];
        }
        else {
            if ( (max - (i*concurrents)) < concurrents ) {
                precalc = max - (i*concurrents);
            }
        }
        
        self._bench(i, concurrents, max, precalc, function (err) {

            clearTimeout(timer);
            if (err) {
                self.debug('.bench err', err)
                return !shortcircuited && cb(err);
            }
            
            var end = Date.now();
            var elapsed = (end - start);
            var elapsedMax = self.options['-t'] || 1500; // = 1000
            // self.debug(['\t'+elapsed, "ms elasped for wave", i, end, start, self.batchData[self.currentBatch].latencies.length].join(" "));
            if (elapsed >= elapsedMax) {
                return !shortcircuited && cb(err);
            }
            else {
                setTimeout((function(){
                    !shortcircuited && cb(err);
                }), 1000 - elapsed);
            }
        });
    };
    
    Async.timesSeries(waves, self.bind(handler, self), function (err) {

        self.batchData.info.endTime = Date.now();
        return callback(err);
    });
};


// This function attempts to maintain `concurrents` # of requests per seconds
Client.prototype._bench = function (index, concurrents, max, precalc, callback) {

    if (!concurrents || isNaN(concurrents)) return callback('invalid concurrents value to _bench()');
    if (!max || isNaN(max)) return callback('invalid max value to _bench()');

    var self = this;
    var handler = self._request(self.options['-m'], self.url.href, index*concurrents);
    
    Async.times(precalc, self.bind(handler, self), function (err) {

        if (err) {
            var rawError = err;
            err = new Errors.ConnectionError({rps:concurrents, url: self.currentFilename});
        }
        
        return callback(err);
    });
};


Client.prototype._request = function (method, uri, index) {

    var self = this;
    index = index || 0;
    var req = {
        method: method,
        uri: uri
    };
    
    // Add headers
    if (self.options['-H']) {
        var headers = {};
        try {
            headers = JSON.parse(self.options['-H']);
        } catch (e) {
            console.log("Error: Unable to parse headers");
            throw e;
        }
        req.headers = headers;
    }
    
    // Add Payload
    if (method == 'POST' || method == 'PUT') {
        if (this.payloadFile) {
            req.body = this.payloadFile;
        }
        else if (this.payload) {
            req.json = this.payload;
        }
        else {
            req.body = "";
        }
    }
    
    // Add Cookies
    if (self.options['-C']) { 
        var cookies = Fs.readFileSync(self.options['-C']).toString().split('\n');
        var jar = Request.jar();
        cookies.forEach(function (cookie) {

            jar.add(cookie);
        });
        req.jar = jar;
    }
    
    return function (i, callback) {

        var start_time = Date.now();
        self.batchData[self.currentBatch].requestCounter++;
        var reqno = i+index;
        
        Request(req, function (err, res, body) {

            if (err) {
                self.debug('_request err', err, req, res, i);
                return callback(err);
            }
            
            var end_time = Date.now();
            if (!self.batchData.hasOwnProperty(self.currentBatch)) {
                return callback(err);
            }
            self.batchData[self.currentBatch].latencies[reqno] = end_time - start_time;
            self.batchData[self.currentBatch].responseCounter++;
            
            self.batchData[self.currentBatch].responses[reqno] = body;
            
            return callback(err);
        });
    }
}


Client.prototype.finishBench = function (callback) {

    var self = this;
    if (self._ignoreRemoteData) {
        return callback(null);
    }
    
    var req = {
        method: 'GET',
        uri: this.getAdminURL('/finish')
    };
    
    Request(req, function (err, res, body) {

        self._finishedBench = true;
        self.debug('/finish called');
        if (err) {
            self.debug('finishBench err', err);
            return callback(err);
        }
        
        var data = body;
        if (res.headers['content-type'].indexOf('application/json;') == 0) {
            try {
                data = JSON.parse(body);
            }
            catch (e) {
                self.log.push("Error parsing JSON from finishBench: " + e); // TODO: use levels.WARN or similar
            }
        }
        
        return callback(null, data);
    });
};


Client.prototype.localBench = function (filename, callback) {

    var self = this;
    var protocol = (this.options['--https'] ? 'https:' : 'http:');
    self.currentFilename = filename;
    this.url = {
        protocol: protocol,
        slashes: true,
        auth: null,
        host: this.options['--host'] + ':' + this.options['--port'],
        port: this.options['--port'],
        hostname: this.options['--host'],
        hash: null,
        search: null,
        query: null,
        pathname: this.options['-u'],
        path: this.options['-u'],
        href: [protocol, '//', this.options['--host'], ':', this.options['--port'], this.options['-u']].join("")
    };
    
    var settings = {
        filename: filename,
        hostname: this.options['--host'],
        port: this.options['--port'],
        metricInterval: this.options['-z'],
        rootPath: this.options.rootPath
    };
    
    self.daemon = new Daemon(settings, self.env);
    self.daemon.admin.start(function () {

        self.debug('server started on port ' + self.daemon.admin.info.port + " at " + Date.now());
        
        if (!self.options['--daemon']) {
            self.remoteBench(filename, function(err, batchData){

                self.daemon && self.daemon.admin.stop();
                process.nextTick(function(){

                    delete self.daemon;
                    self.daemon = null;
                    
                    return callback(err, batchData);
                });
            });
        }
    });
};


Client.prototype.bind = function (fn, self) {

    return function () {

        return fn.apply(self, arguments);
    };
};


module.exports = Client;