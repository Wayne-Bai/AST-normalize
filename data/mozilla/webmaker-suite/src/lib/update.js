var fs = require("fs-extra"),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    readlineSync = require('readline-sync'),
    commands = require("./commandstrings");

var clear = function() { process.stdout.write("\u001b[2J\u001b[0;0H"); };

module.exports = function(component, callback) {

  var repo = component.repo,
      dir = component.dir;

  process.chdir(dir);

  var git = spawn("git", ["fetch","mozilla"]);
  console.log("- running git fetch");
  git.stdout.on('data', function (data) { process.stdout.write(process.stdout.writedata.toString()); });
  git.stderr.on('data', function (data) { process.stderr.write(data.toString()); });
  git.on('close', function (code) {

    console.log("resetting develop and master");
    exec("git checkout -B master mozilla/master");
    exec("git checkout -B develop mozilla/develop");

    var npm = spawn(commands.npm, ["install"]);
    console.log("- npm install");
    npm.stdout.on('data', function (data) { process.stdout.write(data.toString()); });
    npm.stderr.on('data', function (data) { process.stderr.write(data.toString()); });
    npm.on('close', function (code) {

      npm = spawn(commands.npm, ["update"]);
      console.log("- npm update");
      npm.stdout.on('data', function (data) { process.stdout.write(data.toString()); });
      npm.stderr.on('data', function (data) { process.stderr.write(data.toString()); });
      npm.on('close', function (code) {
        process.chdir("..");
        callback();
      });

    });
  });

  console.log("installing: " + repo);
};
