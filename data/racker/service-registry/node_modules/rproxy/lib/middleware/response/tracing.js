/**
 *  Copyright 2012 Tomaz Muraus
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var trace = require('tryfer').trace;

var tracingMiddleware = require('../request/tracing');

exports.processResponse = function(req, res, callback) {
  var serverRecvTrace, clientSendTrace;

  callback();



  if (req.tracing) {
    serverRecvTrace = req.tracing.serverRecvTrace;
    clientSendTrace = req.tracing.clientSendTrace;

    // Asynchronously record that we have received response from the backend
    clientSendTrace.record(trace.Annotation.clientRecv());

    // Asynchronously record that we sent response back to the client
    serverRecvTrace.record(trace.Annotation.string('http.response.code', res.statusCode.toString()));
    serverRecvTrace.record(trace.Annotation.serverSend());
  }
};
