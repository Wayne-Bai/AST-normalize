/*jslint
    onevar: false, undef: true, newcap: true, nomen: false, es5: true,
    regexp: true, plusplus: true, bitwise: true, browser: true, indent: 4 */
/*global require, module, console, process */
(function () {
    var api = require('./api'),
        EventEmitter = require('events').EventEmitter,
        validate = require('./validate'),
        Util = require('util');
    
    /**
     * Per-step (for transactional rushes) metrics of a rush at time[i]
     */
    function makeStep(json) {
        return {
            duration: json.d,
            connect: json.c,
            errors: json.e,
            timeouts: json.t,
            asserts: json.a
        };
    }
    
    /**
     * Snapshot of a rush at time[i] containing information about hits, errors,
     * timeouts, etc.
     */
    function makePoint(json) {
        var steps = json.steps.map(function (item) {
            return makeStep(item);
        });
        
        return {
            timestamp: json.timestamp, 
            duration: json.duration,
            total: json.total,
            hits: json.executed,
            errors: json.errors,
            timeouts: json.timeouts,
            volume: json.volume,
            txbytes: json.txbytes,
            rxbytes: json.rxbytes,
            steps: steps
        };
    }

    /**
     * Result of the rush
     */
    function makeResult(json) {
        var result = json.result,
            timeline = result.timeline.map(function (item) {
                return makePoint(item);
            });
        return {
            region: result.region,
            timeline: timeline
        };
    }

    function Rush() {
        /**
         * Responsible for the Rushes. Uses api.client to make the requests and 
         * return a formatted Rush response
         */
        this.create = function (credentials, options) {
            var self = this,
                user = credentials.username,
                pass = credentials.apiKey,
                host = credentials.host,
                port = credentials.port,
                client = new api.Client(user, pass, host, port);
            return {
                execute: function () {
                    var attributes = validate(options);
                    if (!attributes.valid()) {
                        throw attributes.result();
                    }
                    else if (!options.pattern) {
                        throw 'missing pattern';
                    }
                    else {
                        client.on('queue', function (data) {
                            if (data.ok) {
                                var jobId = data.job_id;
                                //propagates the queue event from api
                                self.emit('queue', data);
                                
                                setTimeout(function () {
                                    //check api status
                                    client.jobStatus(jobId).on('status', function (job) {
                                        var result = job.result,
                                            timeout = setTimeout(function () {
                                                client.jobStatus(jobId);
                                            }, 2000);
                                        if (job.status === 'queued' || 
                                                (job.status === 'running' && !result)) {
                                            //if waiting or still running, wait 2 secs.    
                                            return;
                                        }
                                        else if (result && result.error) {
                                            //return an error if got an error 
                                            //from the escale engine
                                            self.emit('error', result);
                                            return;
                                        }
                                        else if (job.error) {
                                            //return an error if got an error 
                                            //from the server
                                            self.emit('error', job);
                                            return;
                                        }
                                        else if (!result) {
                                            //got here without any errors and result?
                                            throw "No Result";
                                        }
                                        if (job.status === 'completed') {
                                            //if we got here we can clear the interval
                                            //and change the event we will emit 
                                            self.emit('complete', makeResult(job));
                                            clearTimeout(timeout);
                                            return;
                                        }
                                        // we finally emit the status
                                        self.emit('status', makeResult(job));
                                    });
                                }, 2000);
                            }
                            else {
                                self.emit('error', data);
                            }
                        }).on('error', function (response) {
                            self.emit('error', response);
                        }).execute(options);
                    }
                    return self;
                },
                abort: function (jobId) {
                    client.abort(jobId).on('abort', function (response) {
                        self.emit('abort', JSON.stringify({ok: true}));
                    }).on('error', function (response) {
                        self.emit('error', response);
                    });
                    return self;
                }
            };
        };
    }
    Util.inherits(Rush, EventEmitter);
    module.exports = Rush;
}());