// Open Source Initiative OSI - The MIT License (MIT):Licensing
//
// The MIT License (MIT)
// Copyright (c) 2012 DotCloud Inc (opensource@dotcloud.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var _ = require("underscore"),
    util = require("util"),
    events = require("events");

//Creates a new IOServer
function IOServer() {
    this._connectors = {};
    this._middleware = [];
}

util.inherits(IOServer, events.EventEmitter);

//Adds a new connector
//connector : object
//      The connector object to add
IOServer.prototype.connector = function(connector) {
    if(connector.name in this._connectors) {
        throw new Error("Connector of the name '" + connector.name + "' already added");
    }

    this._connectors[connector.name] = {
        connector: connector,
        middleware: []
    };
};

//Adds a new middleware
//connector : RegExp
//      The connector pattern for the middleware to active on
//service : RegExp
//      The service pattern for the middleware to active on
//method : RegExp
//      The method pattern for the middleware to active on
//middleware : function(req : object, res : object, next : function())
//      The middleware to add
IOServer.prototype.middleware = function(connector, service, method, middleware) {
    this._middleware.push({
        connector: connector,
        service: service,
        method: method,
        middleware: middleware
    });
};

//Starts a connector
//connector : object
//      The connector to start
IOServer.prototype._startConnector = function(connector) {
    var self = this;

    //Cache the middleware that could be applicable to the connector
    self._connectors[connector.name].middleware = _.filter(self._middleware, function(middleware) {
        return middleware.connector.test(connector.name);
    });

    //Called on user invocation
    connector.on("invoke", function(request, response) {
        var i = -1;
        var connectorMiddleware = self._connectors[connector.name].middleware;

        //Find the middleware applicable to the current service and method call
        var applicableMiddleware = _.filter(connectorMiddleware, function(middleware) {
            return middleware.service.test(request.service) && middleware.method.test(request.method);
        });

        //Extract the actual middleware function
        applicableMiddleware = _.map(applicableMiddleware, function(middleware) {
            return middleware.middleware;
        });

        //Create a next method to pass along in middleware calls
        var next = function() {
            i++;

            if(response.finished) {
                //Bail if the response object is finished
                return;
            } else if(i < applicableMiddleware.length) {
                //Execute the next middleware if there is one
                var middleware = applicableMiddleware[i];
                middleware(request, response, next);
            } else {
                //If there is no middleware left, the response is finished
                response.finish();
            }
        };

        next();
    });

    //Listen for errors in the connector
    connector.on("error", function(error) {
        self.emit("error", error);
    });

    //Start the connector!
    connector.listen();
};

//Starts the IOServer
IOServer.prototype.listen = function() {
    for(var connectorName in this._connectors) {
        this._startConnector(this._connectors[connectorName].connector);
    }
};

exports.ioServer = IOServer;