var esmongo = require("./esmongo"),
    components = require("../components"),
    spawn = require('child_process').spawn;

module.exports = function(profile) {
  console.log("running profile " + profile.getName() + "\n");
  var task = profile.struct;

  var taskrunner = function() {
    Object.keys(task).forEach(function(cat) {
      Object.keys(task[cat]).forEach(function(entry) {
        if(task[cat][entry]) {
          var component = components[cat][entry],
              dir = component.dir;
          if(!dir) return;
          console.log("Starting component " + entry + " from " + dir);
          process.chdir(dir);

          var commands = component.run;

          if (typeof commands === 'string') {
            commands = [commands];
          }

          commands.forEach(function(command) {
            var args = command.split(' ');
            var child = spawn(args[0], args.slice(1));
            child.stdout.on('data', function (data) { process.stdout.write(data.toString()); });
            child.stderr.on('data', function (data) { process.stderr.write(data.toString()); });
            child.on('close', function (code) { console.log("closed"); });
          });

          process.chdir("..");
        }
      });
    });
  };

  // why is taskrunner sometimes running twice?
  esmongo.run(task, function() {
    taskrunner();
    taskrunner = function(){};
  });
};
