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

var model = require("./lib/model"),
    server = require("./lib/server"),
    client = require("./lib/client"),
    auth = require("./lib/middleware/auth");

var connectors = {
    "SocketIOConnector": "socketio"
};

var middleware = {
    zerorpcMiddleware: "backend/zerorpc",
    printMiddleware: "debug/print",
    builtinsMiddleware: "etc/builtins"
};

for(var connectorName in connectors) {
    exports[connectorName] = require("./lib/connectors/" + connectors[connectorName]);
}

for(var middlewareName in middleware) {
    exports[middlewareName] = require("./lib/middleware/" + middleware[middlewareName]);
}

exports.createSyntheticError = model.createSyntheticError;
exports.Session = model.Session;
exports.Request = model.Request;
exports.Response = model.Response;
exports.useOAuth = auth.useOAuth;
exports.useNormalAuth = auth.useNormalAuth;

exports.ioServer = server.ioServer;
exports.io = client.ioClient;
exports.requireSession = client.requireSession;