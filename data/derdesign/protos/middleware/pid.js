/**
  PID Middleware
 */

var app = protos.app;
var cluster = require('cluster');
var fs = require('fs');

function ProtosPID(config, middleware) {

  if (cluster.isMaster) {
    
    config = this.config = protos.extend({
      pidfile: 'pid',
      masterOnly: false
    }, config || {});
    
    var file = app.fullPath(config.pidfile);
 
    process.on('exit', function() {
      fs.unlink(file, protos.noop);
    });
    
    app.on('workers_up', function(workers) {
      var pids = [process.pid];
      if (!config.masterOnly) {
        for (var id in workers) {
          pids.push(workers[id].process.pid);
        }
      }
      fs.writeFileSync(file, pids.join('\n'), 'utf8');
    });
    
  }
  
}

module.exports = ProtosPID;