// --------------------------------------------------------------------------------------------------------------------
//
// awssum.js - the base class for all web services in node-awssum
//
// Copyright (c) 2011 AppsAttic Ltd - http://www.appsattic.com/
// Written by Andrew Chilton <chilts@appsattic.com>
//
// License: http://opensource.org/licenses/MIT
//
// --------------------------------------------------------------------------------------------------------------------

// built-ins
var querystring = require('querystring');
var http = require('http');
var https = require('https');

// dependencies
var _ = require('underscore');
var xml2js = require('xml2js');

// our own
var esc = require('./lib/esc.js');

// load up package.json so that we can get the version string for the 'User-Agent'
var userAgent = 'awssum/' + require('./package.json').version;

// --------------------------------------------------------------------------------------------------------------------
// constants

var MARK = 'awssum: ';

var parser = new xml2js.Parser({
    attrkey : '@',
    valuekey : '#',
    normalize : false,
    trim : false,
    explicitRoot : true,
    explicitArray : false
});

var debug = false;

var noop = function(){};

// --------------------------------------------------------------------------------------------------------------------
// utility functions

function load(path) {
    // since NodeJS caches requires, we won't cache them here
    return require('./' + path);
}

function addParam(params, name, value) {
    params.push({ 'name' : name, 'value' : value });
}

function addParamIfDefined(params, name, value) {
    if ( ! _.isUndefined(value) ) {
        params.push({ 'name' : name, 'value' : value });
    }
}

// Takes an array and adds params with names like:
//
// * Name.0, Name.1, Name.2, Name.3, ...
//
// or if you specify 'extra', the names will be:
//
// * Name.Extra.0, Name.Extra.1, Name.Extra.2, ...
function addParamArray(params, name, value, prefix) {
    value = value || [];

    prefix = '' + name + '.' + (prefix ? prefix + '.' : '');

    // if it's a string, just add this single value
    if ( typeof value === 'string' ) {
        params.push({ 'name' : prefix + '1', 'value' : value });
        return;
    }

    // else it's an array, so add them all
    for ( var i = 0; i < value.length; i++ ) {
        params.push({ 'name' : prefix + (i+1), 'value' : value[i] });
    }
}

// Takes an array and adds params with names like (for three calls of 'Id', 'Name', 'Zone'):
//
// * SetName.1.Id,   SetName.2.Id,   SetName.3.Id,   ...
// * SetName.1.Name, SetName.2.Name, SetName.3.Name, ...
// * SetName.1.Zone, SetName.2.Zone, SetName.3.Zone, ...
function addParamArraySet(params, setName, name, value, prefix) {
    value = value || [];

    // if it's a string, just add this single value
    if ( typeof value === 'string' ) {
        params.push({ 'name' : setName + '.1.' + name, 'value' : value });
        return;
    }

    // else it's an array, so add them all
    _.each(value, function(v, i) {
        if ( _.isUndefined(v) ) {
            return;
        }
        params.push({ 'name' : setName + '.' + (i+1) + '.' + name, 'value' : v });
    });
}

// Takes an array of arrays and adds params with names like:
//
// * SetName.<i>.Name.<j>
// * Item.<i>.Attribute.<j>
// * Filter.<i>.Value.<j> (e.g. Amazon:EC2:DescribeInstances)
function addParam2dArray(params, setName, name, value) {
    value = value || [];

    if ( typeof value === 'undefined' ) {
        // nothing to do
        return;
    }

    // if it's a string, just add this single value
    if ( typeof value === 'string' ) {
        params.push({ 'name' : setName + '.1.' + name + '.1', 'value' : value });
        return;
    }

    // else it's an array, so add them all
    _.each(value, function(set, i) {
        if ( _.isUndefined(set) ) {
            return;
        }

        _.each(set, function(v, j) {
            params.push({ 'name' : setName + '.' + (i+1) + '.' + name + '.' + (j+1), 'value' : v });
        });
    });
}

// Takes an array of arrays and adds params with names like:
//
// * SetName.X.SubSetName.Y.Id
// * Item.X.Attribute.Y.Id
// * Item.X.Attribute.Y.Id
function addParam2dArraySet(params, setName, subsetName, name, value) {
    value = value || [];

    // if it's a string, just add this single value
    if ( typeof value === 'string' ) {
        params.push({ 'name' : setName + '.1.' + subsetName + '.1.' + name, 'value' : value });
        return;
    }

    // else it's an array, so add them all
    _.each(value, function(set, i) {
        if ( _.isUndefined(set) ) {
            return;
        }

        _.each(set, function(v, j) {
            params.push({ 'name' : setName + '.' + (i+1) + '.' + subsetName + '.' + (j+1) + '.' + name, 'value' : v });
        });
    });
}

// Takes an array of objects and adds params with names like:
//
// * Item.X.Key1
// * Item.X.Key2
// * Item.Y.Key1
// * Item.Y.Key2
//
// or
//
// * Item.prefix.X.Key1
// * Item.prefix.X.Key2
// * Item.prefix.Y.Key1
// * Item.prefix.Y.Key2
function addParamArrayOfObjects(params, name, array, prefix) {
    prefix = prefix ? '.' + prefix : '';

    // loop through all the array elements
    _.each(array, function(obj, i) {
        if ( _.isUndefined(obj) ) {
            return;
        }

        // loop through all the keys in this object
        _.each(obj, function(value, key) {
            params.push({ 'name' : name + prefix + '.' + (i+1) + '.' + key, 'value' : '' + value });
        });
    });
}

// Takes an array of objects and adds params with names like:
//
// * Item.prefix.1.Key1.Something
// * Item.prefix.1.Key2.Else
// * Item.prefix.2.Key1.Whatever.Is.Here
// * Item.prefix.2.Key1.prefix.1.Name
// * Item.prefix.2.Key1.prefix.1.Value
// * Item.prefix.2.Key2.prefix.2.Whatever
// * Item.prefix.2.Key2.prefix.2.Whatever
function addParamData(params, name, data, prefix) {
    var member = prefix ? '.' + prefix : '';

    if ( _.isString(data) || _.isNumber(data) || _.isBoolean(data) ) {
        params.push({ 'name' : name, 'value' : '' + data });
        return;
    }

    if ( _.isArray(data) ) {
        // console.log('array=', data);
        _.each(data, function(value, i) {
            // should be another data structure, so recurse down it
            addParamData(params, name + member + '.' + (i+1), value, prefix);
        });
        return;
    }

    if ( _.isObject(data) ) {
        // console.log('object=', data);
        _.each(data, function(value, key) {
            // should be another data structure, so recurse down it
            addParamData(params, name + '.' + key, value, prefix);
        });
        return;
    }
}

function addParamJson(field, name, value) {
    if ( ! _.isUndefined(value) ) {
        field.push({ 'name' : name, 'value' : JSON.stringify(value) });
    }
}

function addFormIfDefined(field, name, value) {
    if ( ! _.isUndefined(value) ) {
        field.push({ 'name' : name, 'value' : value });
    }
}

function addJsonIfDefined(json, name, value) {
    if ( ! _.isUndefined(value) ) {
        json[name] = value;
    }
}

function setHeader(header, name, value) {
    header[name] = value;
}

function setHeaderIfDefined(header, name, value) {
    if ( ! _.isUndefined(value) ) {
        header[name] = value;
    }
}

// do our own stringify query, since querystring.stringify doesn't do what we want (for AWS and others)
function stringifyQuery(params) {
    // console.log('Params :', params);
    var query = _(params)
        .chain()
        .map(function(v, i) {
            return _.isUndefined(v.value) ?
                esc(v.name)
                : esc(v.name) + '=' + esc(v.value)
                ;
        })
        .join('&')
        .value()
    ;
    // console.log('Query :', query);
    return query;
};

// --------------------------------------------------------------------------------------------------------------------
// AwsSum and functions to be overriden by inheriting class

// function protocol()             -> string (the default protocol for the HTTP request, https or http)
// function method()               -> string (the default method for the HTTP request)
// function host()                 -> string (the host for this service/region)
// function path()                 -> string (the default path for this service)
// function addExtras()            -> side effect, adds extra whatever
// function addCommonOptions(options, args) -> side effect, adds the common headers/params for this service
// function statusCode()           -> the expected status code
// function extractHeaders()       -> how to extract the headers from the response
// function extractBody()          -> how to extract the body from the response
// function extractBodyWhenError() -> how to extract the body from an error response

// constructor

var AwsSum = function(opts) {
    var self = this;
    opts = opts || {};

    // if we have been given an agent, store it for use
    if ( typeof opts.agent !== 'undefined' ) {
        self._agent = opts.agent;
    }

    // if we have been given a protocol, use that one
    if ( opts.protocol ) {
        self._protocol = opts.protocol;
    }

    return self;
};

AwsSum.prototype.agent = function() {
    return this._agent;
};

AwsSum.prototype.protocol = function() {
    if ( this._protocol ) {
        return this._protocol;
    }
    return 'https';
};

AwsSum.prototype.method = function() {
    return 'GET';
};

// AwsSum.prototype.host // no default

AwsSum.prototype.path = function() {
    return '/';
};

AwsSum.prototype.addExtras = function() { };

AwsSum.prototype.addCommonOptions = function(options, args) { };

AwsSum.prototype.statusCode = function(options) {
    return 200;
};

AwsSum.prototype.extractBody = function(options) {
    return 'none';
};

AwsSum.prototype.extractBodyWhenError = function(options) {
    // set default to be undefined, so it'll be defaulted to the extractBody value in the response processing
    return undefined;
};

AwsSum.prototype.extractHeaders = function() {
    // default to extracting _all_ of the headers
    return true;
};

// --------------------------------------------------------------------------------------------------------------------
// utility methods

// curry the send function for this operation
function makeOperation(operation) {
    return function(args, opts, callback) {
        var self = this;

        if ( arguments.length === 0 ) {
            // defined as fn()
            args = {};
            opts = {};
            callback = noop;
        }
        else if ( arguments.length === 1 ) {
            // defined as fn(callback)
            callback = args;
            args = {};
            opts = {};
        }
        else if ( arguments.length === 2 ) {
            // defined as fn(args, callback)
            callback = opts;
            opts = {};
        }
        else if ( arguments.length === 3 ) {
            // do nothing, we have everything, defined as fn(args, opts, callback)
        }

        self.send(operation, args, opts, callback);
    };
}

function decodeWwwFormUrlEncoded(body) {
    var form = {};
    // turn the buffer into a string before splitting
    body.toString('utf8').split('&').forEach(function(v, i) {
        var keyValueArray = v.split('=');
        form[keyValueArray[0]] = unescape(keyValueArray[1]);
    });
    return form;
}

function isStatusCodeOk(statusCode, received) {
    if ( _.isObject(statusCode) && statusCode[received] ) {
        return true;
    }

    if ( statusCode === received ) {
        return true;
    }

    return false;
}

AwsSum.prototype.send = function(operation, args, opts, callback) {
    var self = this;

    var argName, spec; // for iterations later in the function

    // console.log(operation, args, opts, callback);

    // extend the args with the defaults for this operation (e.g. Action, Target)
    if ( operation.defaults ) {
        for (var key in operation.defaults) {
            if ( typeof operation.defaults[key] === 'function' ) {
                args[key] = operation.defaults[key].apply(self, [ operation, args ]);
            }
            else {
                // the default, just copy it over (even if undefined)
                args[key] = operation.defaults[key];
            }
        }
    }

    // check that we have all of the args we expected for this operation
    for ( argName in operation.args ) {
        spec = operation.args[argName];

        // see if this is required (and check it exists, even if it is undefined)
        if ( spec.required && !(argName in args) ) {
            callback({ Code : 'AwsSumCheck', Message : 'Provide a ' + argName });
            return;
        }
    }

    // ---

    // BUILD ALL OF THE OPTIONS

    // build all of the request options
    var options = {};

    // ---

    // REQUEST STUFF

    // build the method
    options.method = self.method();
    if ( operation.method ) {
        if ( typeof operation.method === 'string' ) {
            options.method = operation.method;
        }
        else if ( typeof operation.method === 'function' ) {
            options.method = operation.method.apply(self, [ options, args ]);
        }
        else {
            // since this is a program error, we're gonna throw this one
            throw 'Unknown operation.method : ' + typeof operation.method;
        }
    }

    // ---

    // build the protocol
    options.protocol = self.protocol();
    if ( operation.protocol ) {
        if ( typeof operation.protocol === 'string' ) {
            options.protocol = operation.protocol;
        }
        else if ( typeof operation.protocol === 'function' ) {
            options.protocol = operation.protocol.apply(self, [ options, args ]);
        }
        else {
            // since this is a program error, we're gonna throw this one
            throw 'Unknown operation.protocol : ' + typeof operation.protocol;
        }
    }

    // ---

    // build the host
    if (operation.redirectHost) {
      options.host = operation.redirectHost;
    } else {
      options.host = self.host(args);
      if ( operation.host ) {
          if ( typeof operation.host === 'function' ) {
              options.host = operation.host.apply(self, [ options, args ]);
          }
          else if ( typeof operation.host === 'string' ) {
              options.host = operation.host;
          }
          else {
              // since this is a program error, we're gonna throw this one
              throw 'Unknown operation.host : ' + typeof operation.host;
          }
      }
    }

    // ---

    // build the path
    options.path = self.path();
    if ( operation.path ) {
        if ( typeof operation.path === 'function' ) {
            options.path = operation.path.apply(self, [ options, args ]);
        }
        else if ( typeof operation.path === 'string' ) {
            options.path = operation.path;
        }
        else {
            // since this is a program error, we're gonna throw this one
            throw 'Unknown operation.path : ' + typeof operation.path;
        }
    }

    // ---

    // build all of the params and headers, and copy the body if user-supplied
    options.params = [];
    options.headers = {};
    options.forms = [];
    options.json = {};
    for ( argName in operation.args ) {
        spec = operation.args[argName];
        var name = spec.name || argName;

        // if this is a param type, add it there
        if ( spec.type === 'param' ) {
            addParamIfDefined( options.params, name, args[argName] );
        }
        else if ( spec.type === 'resource' ) {
            // for Amazon S3 .. things like /?acl, /?policy and /?logging
            addParam( options.params, name, undefined );
        }
        else if ( spec.type === 'param-array' ) {
            addParamArray( options.params, name, args[argName], spec.prefix );
        }
        else if ( spec.type === 'param-array-set' ) {
            addParamArraySet( options.params, spec.setName, name, args[argName] );
        }
        else if ( spec.type === 'param-2d-array' ) {
            addParam2dArray( options.params, spec.setName, name, args[argName] );
        }
        else if ( spec.type === 'param-2d-array-set' ) {
            addParam2dArraySet( options.params, spec.setName, spec.subsetName, name, args[argName] );
        }
        else if ( spec.type === 'param-array-of-objects' ) {
            addParamArrayOfObjects( options.params, spec.setName || name, args[argName] );
        }
        else if ( spec.type === 'param-data' ) {
            addParamData( options.params, spec.setName || name, args[argName], spec.prefix );
        }
        else if ( spec.type === 'param-json' ) {
            addParamJson( options.params, spec.setName || name, args[argName] );
        }
        else if ( spec.type === 'header' ) {
            setHeaderIfDefined( options.headers, name, args[argName] );
        }
        else if ( spec.type === 'header-base64' ) {
            if ( ! _.isUndefined(args[argName]) ) {
                setHeader( options.headers, name, (new Buffer(args[argName])).toString('base64') );
            }
        }
        else if ( spec.type === 'form' ) {
            addFormIfDefined( options.forms, name, args[argName] );
        }
        else if ( spec.type === 'form-array' ) {
            addParamArray( options.forms, name, args[argName], spec.prefix );
        }
        else if ( spec.type === 'form-data' ) {
            addParamData( options.forms, spec.setName || name, args[argName], spec.prefix );
        }
        else if ( spec.type === 'form-base64' ) {
            if ( ! _.isUndefined(args[argName]) ) {
                addParam( options.forms, name, (new Buffer(args[argName])).toString('base64') );
            }
        }
        else if ( spec.type === 'json' ) {
            addJsonIfDefined( options.json, name, args[argName] );
        }
        else if ( spec.type === 'body' ) {
            // there should be just one of these
            options.body = args[argName];
        }
        else if ( spec.type === 'special' ) {
            // this will be dealth with specifically later on - all ok
        }
        else {
            // since this is a program error, we're gonna throw this one
            throw 'Unknown argument type : ' + spec.type;
        }
    }

    // ---

    // if we already have a body, just use it, or build the body from either options.form,
    // options.json or using operation.body
    if ( !options.body ) {
        if ( operation.body ) {
            if ( typeof operation.body === 'string' ) {
                options.body = operation.body;
            }
            else if ( typeof operation.body === 'function' ) {
                options.body = operation.body.apply(self, [ options, args ]);
            }
            else {
                // since this is a program error, we're gonna throw this one
                throw 'Unknown operation.body : ' + typeof operation.body;
            }
        } else if ( options.forms && options.forms.length ) {
            var formParts = [];
            options.forms.forEach(function(v, i) {
                formParts[i] = v.name + "=" + escape(v.value);
            });
            options.body = formParts.join("&");
            options.headers['content-type'] = 'application/x-www-form-urlencoded';
        } else {
            options.body = JSON.stringify(options.json);
            if ( options.body === '{}' ) {
                options.body = undefined;
            }
        }
    }

    // ---

    // add anything extra into the request
    var addExtras = operation.addExtras || self.addExtras;
    if ( ! _.isArray(addExtras) ) {
        addExtras = [addExtras];
    }
    addExtras.forEach( function(extra) {
        if ( typeof extra === 'function' ) {
            extra.apply(self, [ options, args ]);
        }
        else {
            // since this is a program error, we're gonna throw this one
            throw 'Unknown addExtras : ' + typeof extra;
        }
    });

    // finally, add the common operations
    self.addCommonOptions(options, args);

    // ---

    // RESPONSE STUFF

    // get the status code we expect, either a number on the operation or the default for this service
    var statusCode = operation.statusCode || self.statusCode();
    // if this isn't a number or an object, it's an error
    if ( ! _.isNumber(statusCode) && ! _.isObject(statusCode) ) {
        // since this is a program error, we're gonna throw this one
        throw 'Unknown statusCode : ' + typeof statusCode;
    }

    // build which headers to extract
    var extractHeaders = operation.extractHeaders || self.extractHeaders();
    if ( typeof extractHeaders === 'string'
         || Array.isArray(extractHeaders)
         || _.isObject(extractHeaders)
         || _.isRegExp(extractHeaders)
         || _.isFunction(extractHeaders)
         || extractHeaders === true ) {
        // all ok
    }
    else {
        // since this is a program error, we're gonna throw this one
        throw 'Unknown extractHeaders : ' + typeof extractHeaders;
    }

    // build the extractBody stuff
    var extractBody = operation.extractBody || self.extractBody();
    if ( extractBody !== 'xml' &&
         extractBody !== 'json' &&
         extractBody !== 'blob' &&
         extractBody !== 'string' &&
         extractBody !== 'application/x-www-form-urlencoded' &&
         extractBody !== 'none' &&
         !_.isFunction(extractBody) ) {
        // since this is a program error, we're gonna throw this one
        throw 'Unknown extractBody : ' + typeof extractBody;
    }

    // build the extractBodyWhenError
    var extractBodyWhenError = operation.extractBodyWhenError || self.extractBodyWhenError();
    if ( ! extractBodyWhenError ) {
        // if nothing is defined, then default to the same as extractBody
        extractBodyWhenError = extractBody;
    }
    if ( extractBodyWhenError !== 'xml' &&
         extractBodyWhenError !== 'json' &&
         extractBodyWhenError !== 'blob' &&
         extractBodyWhenError !== 'string' &&
         extractBodyWhenError !== 'application/x-www-form-urlencoded' &&
         extractBodyWhenError !== 'none' &&
         !_.isFunction(extractBodyWhenError) ) {
        // since this is a program error, we're gonna throw this one
        throw 'Unknown extractBodyWhenError : ' + typeof extractBodyWhenError;
    }

    // see if the user wants to stream the response body for things like large binary downloads
    // (eg. Amazon:S3:GetObject)
    if ( opts.stream ) {
        options.stream = opts.stream;
    }

    // and finally ... add our own User-Agent so Amazon et al can help debug problems when they occur
    setHeader( options.headers, 'User-Agent', userAgent );

    // ---

    if ( debug ) {
        console.log('-------------------------------------------------------------------------------');
        console.log('Request:');
        console.log('- method         : ', options.method);
        console.log('- protocol       : ', options.protocol);
        console.log('- host           : ', options.host);
        console.log('- path           : ', options.path);
        console.log('- params         : ', options.params);
        console.log('- headers        : ', options.headers);
        console.log('- forms          : ', options.forms);
        console.log('- json           : ', options.json);
        console.log('- body           : ', options.body);
        console.log('Request:');
        console.log('- statusCode     :', statusCode);
        console.log('- extractHeaders :', extractHeaders);
        console.log('- extractBody :', extractBody);
        console.log('-------------------------------------------------------------------------------');
    }

    // now send the request
    self.request( options, function(err, res) {
        // an error with the request is an error full-stop
        if ( err ) {
            var requestError = {
                Code : 'AwsSum-Request',
                Message : 'Something went wrong during the request',
                OriginalError : err
            };

            callback(requestError);
            // console.log('CALLBACK: failed due to error from request');
            return;
        }

        if ( debug ) {
            console.log('-------------------------------------------------------------------------------');
            console.log('Response:');
            console.log('- statusCode :', res.statusCode);
            console.log('- headers :', res.headers);
            console.log('- body :', res.body.toString());
            console.log('-------------------------------------------------------------------------------');
        }

        if (res.statusCode == '307') {
          var redirectHost = '';
          parser.parseString(res.body.toString(), function (err, data) {
              if ( err ) {
                  result.Code    = 'AwsSum-ParseXml';
                  result.Message = 'Something went wrong during the XML parsing';
                  result.Error   = err;
                  result.Body    = res.body.toString();
              }
              else {
                  if (data.Error && data.Error.Endpoint) {
                    redirectHost = data.Error.Endpoint;
                  }
              }
          });
          if (redirectHost !== '') {
            operation.redirectHost = redirectHost;
            self.send(operation, args, opts, callback);
            return;
          }
        }
        // save the whole result in here
        var result = {};

        // (1) add the status code first
        result.StatusCode = res.statusCode;

        // (2) add some headers into the result
        if ( extractHeaders ) {
            // this should be removed in favour of a regex option
            if ( extractHeaders === 'x-amz' ) {
                result.Headers = {};
                _.each(res.headers, function(val, hdr) {
                    if ( hdr.match(/^x-amz-/) ) {
                        // ToDo: it'd be nice if we convert things like:
                        // x-amz-request-id             -> RequestId
                        // x-amz-id-2                   -> Id2
                        // x-amz-server-side-encryption -> ServerSideEncryption
                        // x-amz-version-id             -> VersionId
                        result.Headers[hdr] = val;
                    }
                });
            }
            else if ( _.isRegExp(extractHeaders) ) {
                result.Headers = {};
                _.each(res.headers, function(val, hdr) {
                    if ( hdr.match(extractHeaders) ) {
                        result.Headers[hdr] = val;
                    }
                });
            }
            else if ( Array.isArray(extractHeaders) ) {
                // just return the headers that are in this list
                result.Headers = {};
                extractHeaders.forEach(function(v) {
                    result.Headers[v] = res.headers[v];
                });
            }
            else if ( _.isObject(extractHeaders) ) {
                // just return the headers that are in this list
                result.Headers = {};
                _.each(extractHeaders, function(v, k) {
                    result.Headers[k] = res.headers[k];
                });
            }
            else if ( _.isFunction(extractHeaders) ) {
                // this should return a hash of headers
                result.Headers = extractHeaders.apply(self, [ res ]);
            }
            else if ( extractHeaders === true ) {
                // extract _all_ headers
                result.Headers = res.headers;
            }
        } // else, don't extract any headers

        // (3) streaming - if the user wants to stream, then we can't decode the body, so we'll just pass
        // the 'res' back to the user and call it done.
        if ( options.stream ) {
            result.Stream = res;

            // if the status code is ok, then the request is fine, else it's an error
            if ( isStatusCodeOk(statusCode, res.statusCode) ) {
                return callback(null, result);
            }
            else {
                return callback(result);
            }
        }

        // (4) we may extract the body differently depending on the status code
        //
        // It seems the following services can do this:
        //
        // * Amazon S3
        // * Amazon DynamoDB
        // * Amazon SWF

        // see if this is not a valid statusCode
        if ( ! isStatusCodeOk(statusCode, res.statusCode) ) {
            extractBody = extractBodyWhenError;
        }

        // (5) now extract the body

        // create the result and parse various things into it
        if ( extractBody === 'xml' ) {
            // decode the returned XML
            var ok = true;
            // Note: parseString is synchronous (not async)
            parser.parseString(res.body.toString(), function (err, data) {
                if ( err ) {
                    result.Code    = 'AwsSum-ParseXml';
                    result.Message = 'Something went wrong during the XML parsing';
                    result.Error   = err;
                    result.Body    = res.body.toString();
                }
                else {
                    result.Body = data;
                }
            });

            // see if the xml parsing worked
            if ( !result.Body ) {
                if ( options.writeStream ) {
                    options.writeStream.emit('error', result);
                    return;
                }
                callback(result, null);
                return;
            }
        }
        else if ( extractBody === 'json' ) {
            // get the JSON (should this be in a try/catch?)
            result.Body = JSON.parse(res.body.toString());
        }
        else if ( extractBody === 'blob' ) {
            // just return the body
            result.Body = res.body;
        }
        else if ( extractBody === 'application/x-www-form-urlencoded' ) {
            // decode the body and return it
            result.Body = decodeWwwFormUrlEncoded(res.body);
        }
        else if ( extractBody === 'none' ) {
            // no body, so just set a blank one
            result.Body = '';
        }
        else if ( extractBody === 'string' ) {
            // convert the body to a string
            result.Body = res.body.toString();
        }
        else if ( typeof extractBody === 'function' ) {
            result.Body = extractBody.apply(self, [ res ]);
        }
        else {
            // shouldn't ever be here since extractBody is checked above
            throw new Error("Program Error: Shouldn't ever be here");
        }

        // now we're ready to finally call the callback!!! :D
        if ( ! isStatusCodeOk(statusCode, res.statusCode) ) {
            // this was an error
            // console.log('CALLBACK: failed due to incorrect statusCode');
            if ( options.writeStream ) {
                options.writeStream.emit('error', result);
                return;
            }
            callback(result, null);
            return;
        }

        // everything so far looks fine, callback with the result
        // console.log('CALLBACK: success');
        callback(null, result);
    });
};

// just takes the standard options and calls back with the result (or error)
//
// * options.method
// * options.host
// * options.path
// * options.params
// * options.headers
// * options.forms
// * options.json
// * options.body
AwsSum.prototype.request = function(options, callback) {
    var self = this;

    // check here that we have everything

    // since this can be called on both close and end, just do it once
    callback = _.once(callback);

    var reqOptions = {
        method  : options.method,
        host    : options.host,
        path    : options.path,
        headers : options.headers
    };

    // if we have a port, then put that onto the request (can make local testing easier with a local server)
    if ( options.port ) {
        reqOptions.port = options.port;
    }

    // if we have any params, put them onto the path
    if ( options.params && options.params.length ) {
        reqOptions.path += '?' + stringifyQuery( options.params );
    }

    // if we have any JSON fields, stick it in the body
    if ( options.json && options.json.length ) {
        options.body = JSON.stringify(options.json);
    }

    // if the user has explicitly set for no agent
    if ( self.agent() === false ) {
        reqOptions.agent = false;
    }
    else if ( self.agent() !== undefined ) {
        // else, they have specifically set one
        reqOptions.agent = self.agent();
    }
    else {
        // no agent, use the default one
    }

    if ( debug ) {
        console.log('awssum.js:request(): reqOptions = ', reqOptions);
        console.log('awssum.js:request(): body       = ', options.body);
    }

    // do the request
    var requestFn = options.protocol === 'https' ? https.request : http.request;
    var req = requestFn( reqOptions, function(res) {
        // if we want to stream, just callback now
        if ( options.stream ) {
            // call back now
            return callback(null, res);
        }

        // EVERYTHING from here on is because the user isn't streaming, we're doing our standard decode (as applicable)

        // save all of these buffers, but only if there is no writeStream
        var buffers = [];
        var length = 0;

        res.on('data', function(chunk) {
            // store the buffer and sum the lengths
            buffers.push(chunk);
            length += chunk.length;
        });

        // if the connection terminates before end is emitted, it's an error
        res.on('close', function(err) {
            callback(err, null);
        });

        // when we get our full response back, it's all good!
        res.on('end', function() {
            // process the complete body into res.body
            res.body = new Buffer(length);
            var offset = 0;
            buffers.forEach(function(v, i) {
                v.copy(res.body, offset);
                offset += v.length;
            });
            callback(null, res);
        });
    });

    // ---
    // catch things like "Error: getaddrinfo ENOENT"
    req.on('error', function(e) {
        if ( debug ) {
            console.log('awssum.js:request(): request error = ', e);
        }
        callback(e);
    });

    // ---

    // finally, if there is no body, just end the request
    if ( _.isUndefined(options.body) ) {
        req.end();
        return;
    }

    // if it's a string, send it and end it
    if ( typeof options.body === 'string' || options.body instanceof Buffer) {
        req.write(options.body);
        req.end();
        return;
    }

    // it must be a stream, but check it anyway
    if( typeof options.body.pipe === "function" && options.body.readable ) {
        // if the body is a readableStream, pipe it. (pipe automatically ends the request)
        options.body.pipe(req);
        options.body.on('error', function(err) {
            callback(err, null);
            req.end(); // todo: determine if this is necessary
        });
        return;
    }

    // if we're still here, it's presumably an empty body so just end the request as if ok!
    req.end();
    return;
};

// --------------------------------------------------------------------------------------------------------------------
// exports

// utilities for AwsSum plugins to use when 
exports.load                   = load;
exports.esc                    = esc;
exports.addParam               = addParam;
exports.addParamIfDefined      = addParamIfDefined;
exports.addParamArray          = addParamArray;
exports.addParamArraySet       = addParamArraySet;
exports.addParam2dArray        = addParam2dArray;
exports.addParam2dArraySet     = addParam2dArraySet;
exports.addParamArrayOfObjects = addParamArrayOfObjects;
exports.addParamData           = addParamData;
exports.setHeader              = setHeader;
exports.setHeaderIfDefined     = setHeaderIfDefined;
exports.stringifyQuery         = stringifyQuery;

// these are
exports.makeOperation          = makeOperation;

// ... and export AwsSum so other modules can inherit from it
exports.AwsSum                 = AwsSum;

// --------------------------------------------------------------------------------------------------------------------
