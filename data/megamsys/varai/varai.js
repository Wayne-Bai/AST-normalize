/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

/* 
 * This is modified by Megam Systems.
 */

var http = require('http');
var https = require('https');
var util = require("util");
var express = require("express");
var crypto = require("crypto");
var nopt = require("nopt");
var path = require("path");
var VARAI = require("./varai/varai.js");

var server;
var app = express();

var settingsFile = "./settings";
var flowFile;

var knownOpts = {
    "settings":[path],
    "v": Boolean,
    "help": Boolean
};
var shortHands = {
    "s":["--settings"],
    "?":["--help"]
};
nopt.invalidHandler = function(k,v,t) {
    // TODO: console.log(k,v,t);
}

var parsedArgs = nopt(knownOpts,shortHands,process.argv,2)

if (parsedArgs.help) {
    console.log("varai v"+VARAI.version());
    console.log("Usage: node varai.js [-v] [-?] [--settings settings.js] [flows.json]");
    console.log("");
    console.log("Options:");
    console.log("  -s, --settings FILE  use specified settings file");
    console.log("  -v                   enable verbose output");
    console.log("  -?, --help           show usage");
    console.log("");
    console.log("Documentation can be found at http://nodered.org");
    process.exit();
}

if (parsedArgs.argv.remain.length > 0) {
    flowFile = parsedArgs.argv.remain[0];
}

if (parsedArgs.settings) {
    settingsFile = parsedArgs.settings;
}
try {
    var settings = require(settingsFile);
} catch(err) {
    if (err.code == 'MODULE_NOT_FOUND') {
        console.log("Unable to load settings file "+settingsFile);
    } else {
        console.log(err);
    }
    process.exit();
}

if (parsedArgs.v) {
    settings.verbose = true;
}

if (settings.https) {
    server = https.createServer(settings.https,function(req,res){app(req,res);});
} else {
    server = http.createServer(function(req,res){app(req,res);});
}
server.setMaxListeners(0);

function formatRoot(root) {
    if (root[0] != "/") {
        root = "/" + root;
    }
    if (root.slice(-1) != "/") {
        root = root + "/";
    }
    return root;
}

if (settings.httpRoot === false) {
    settings.httpAdminRoot = false;
    settings.httpNodeRoot = false;
} else {
    settings.httpRoot = settings.httpRoot||"/";
}

if (settings.httpAdminRoot !== false) {
    settings.httpAdminRoot = formatRoot(settings.httpAdminRoot || settings.httpRoot || "/");
    settings.httpAdminAuth = settings.httpAdminAuth || settings.httpAuth;
}

if (settings.httpNodeRoot !== false) {
    settings.httpNodeRoot = formatRoot(settings.httpNodeRoot || settings.httpRoot || "/");
    settings.httpNodeAuth = settings.httpNodeAuth || settings.httpAuth;
}

settings.uiPort = settings.uiPort||1880;
settings.uiHost = settings.uiHost||"0.0.0.0";

settings.flowFile = flowFile || settings.flowFile;

VARAI.init(server,settings);

if (settings.httpAdminRoot !== false) {
    app.use(settings.httpAdminRoot,VARAI.httpAdmin);
}
if (settings.httpNodeRoot !== false) {
    app.use(settings.httpNodeRoot,VARAI.httpNode);
}


function getListenPath() {
    var listenPath = 'http'+(settings.https?'s':'')+'://'+
                    (settings.uiHost == '0.0.0.0'?'127.0.0.1':settings.uiHost)+
                    ':'+settings.uiPort;
    if (settings.httpAdminRoot !== false) {
        listenPath += settings.httpAdminRoot;
    } else if (settings.httpStatic) {
        listenPath += "/";
    }
    return listenPath;
}

VARAI.start().then(function() {
    if (settings.httpAdminRoot !== false || settings.httpNodeRoot !== false || settings.httpStatic) {
        server.on('error', function(err) {
            if (err.errno === "EADDRINUSE") {
                util.log('[varai] Unable to listen on '+getListenPath());
                util.log('[varai] Error: port in use');
            } else {
                util.log('[varai] Uncaught Exception:');
                util.log(err.stack);
            }
            process.exit(1);
        });
        server.listen(settings.uiPort,settings.uiHost,function() {
            if (settings.httpAdminRoot === false) {
                util.log('[varai] Admin UI disabled');
            }
            util.log('[varai] Server now running at '+getListenPath());
        });
    } else {
        util.log('[varai] Running in headless mode');
    }
});


process.on('uncaughtException',function(err) {
    util.log('[varai] Uncaught Exception:');
    util.log(err.stack);
    process.exit(1);
});

process.on('SIGINT', function () {
    VARAI.stop();
    // TODO: need to allow nodes to close asynchronously before terminating the
    // process - ie, promises 
    process.exit();
});
