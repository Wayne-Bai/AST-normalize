! ✖ / env;
node;
var program = require("commander");
var chalk = require("chalk");
var Machinepacks = require("machinepack-machines");
var Machine = require("machine");
var _ = require("lodash");
var yargs = require("yargs");
var cliOpts = yargs.argv;
delete cliOpts._;
delete cliOpts.$0;
program.usage("[options]").parse(process.argv);
var machinepackIdentity;
var machineIdentity;
if (_.isString(program.args[0]))  {
   if (program.args[0].match(/\//))  {
      machinepackIdentity = program.args[0].split("/")[0];
      machineIdentity = program.args[0].split("/")[1];
   }
    else  {
      machinepackIdentity = program.args[0];
   }
}
program.unknownOption = function()  {
}
;
Machine.build( {
      inputs: {} , 
      defaultExit:"success", 
      exits: {
         success: {
            example: {
               machinepack: {
                  identity:"machinepack-whatever", 
                  variableName:"Whatever"               }, 
               machine: {
                  identity:"do-stuff", 
                  variableName:"doStuff"               }, 
               withInputs:[ {
                  name:"foobar", 
                  value:"fiddle diddle"               }
], 
               exited: {
                  exit:"success", 
                  jsonValue:"{"stuff": "things"}", 
                  inspectedValue:"{stuff: "things"}", 
                  void:false               }}          }, 
         error: {} , 
         invalidMachine: {
            example: {
               machine:"do-stuff"            }}       }, 
      fn:function(inputs, exits)  {
         var util = require("util");
         var inquirer = require("inquirer");
         var Http = require("machinepack-http");
         var Npm = require("machinepack-npm");
         var Machines = require("machinepack-machines");
         var enpeem = require("enpeem");
         console.log();
         console.log();
         console.log("Preview machine from registry");
         console.log("================================");
         console.log();
         var REGISTRY_BASE_URL = "http://node-machine.org";
         Http.sendHttpRequest( {
               baseUrl:REGISTRY_BASE_URL, 
               url:"/machinepacks"            }
         ).exec( {
               error:exits.error, 
               success:function(resp)  {
                  var machinepacks;
                  try {
                     machinepacks = JSON.parse(resp.body);
                  }
                  catch (e) {
                     return exits.error(e);
                  }
                  inquirer.prompt([ {
                        name:"machinepackIdentity", 
                        message:"Please choose a machinepack", 
                        type:"list", 
                        when:function()  {
                           return ! machinepackIdentity;
                        }, 
                        choices:_.reduce(machinepacks, function(memo, pack)  {
                              memo.push( {
                                    name:pack.friendlyName, 
                                    value:pack.identity                                 }
                              );
                              return memo;
                           }, 
                           [])                     }
], function(answers)  {
                        machinepackIdentity = machinepackIdentity || answers.machinepackIdentity;
                        Http.sendHttpRequest( {
                              baseUrl:REGISTRY_BASE_URL, 
                              url:util.format("/%s", machinepackIdentity)                           }
                        ).exec( {
                              error:exits.error, 
                              success:function(resp)  {
                                 var machinepack;
                                 try {
                                    machinepack = JSON.parse(resp.body);
                                 }
                                 catch (e) {
                                    return exits.error(e);
                                 }
                                 inquirer.prompt([ {
                                       name:"machineIdentity", 
                                       message:"Now choose a machine to run", 
                                       type:"list", 
                                       when:function()  {
                                          return ! machineIdentity;
                                       }, 
                                       choices:_.reduce(machinepack.machines, function(memo, machine)  {
                                             memo.push( {
                                                   name:machine.friendlyName, 
                                                   value:machine.identity                                                }
                                             );
                                             return memo;
                                          }, 
                                          [])                                    }
], function(answers)  {
                                       machineIdentity = machineIdentity || answers.machineIdentity;
                                       Http.sendHttpRequest( {
                                             baseUrl:REGISTRY_BASE_URL, 
                                             url:util.format("/%s/%s", machinepackIdentity, machineIdentity)                                          }
                                       ).exec( {
                                             error:exits.error, 
                                             notOk:exits.error, 
                                             success:function(resp)  {
                                                var machine;
                                                try {
                                                   machine = JSON.parse(resp.body);
                                                }
                                                catch (e) {
                                                   return exits.error(e);
                                                }
                                                console.log();
                                                console.log("Fetching code for NPM module "%s"@%s...", machinepack.npmPackageName, machinepack.version);
                                                Npm.downloadPackage( {
                                                      name:machinepack.npmPackageName, 
                                                      version:machinepack.version                                                   }
                                                ).exec( {
                                                      error:exits.error, 
                                                      success:function(machinepackPath)  {
                                                         var cwd = process.cwd();
                                                         process.chdir(machinepackPath);
                                                         console.log("Installing NPM dependencies for %s...", machinepackIdentity);
                                                         enpeem.install( {
                                                               dependencies:[], 
                                                               loglevel:"silent"                                                            }, 
                                                            function(err)  {
                                                               if (err) return exits.error(err)                                                               process.chdir(cwd);
                                                               console.log();
                                                               console.log("Running %s...", machineIdentity);
                                                               console.log();
                                                               Machines.runMachineInteractive( {
                                                                     machinepackPath:machinepackPath, 
                                                                     identity:machineIdentity, 
                                                                     inputValues:function()  {
                                                                        return _.reduce(cliOpts, function(memo, inputValue, inputName)  {
                                                                              memo.push( {
                                                                                    name:inputName, 
                                                                                    value:inputValue, 
                                                                                    protect:false                                                                                 }
                                                                              );
                                                                              return memo;
                                                                           }, 
                                                                           []);
                                                                     }
()                                                                  }
                                                               ).exec( {
                                                                     error:function(err)  {
                                                                        return exits.error(err);
                                                                     }, 
                                                                     invalidMachine:function()  {
                                                                        return exits.invalidMachine();
                                                                     }, 
                                                                     success:function(result)  {
                                                                        return exits.success(_.extend( {
                                                                                 machine: {
                                                                                    identity:machineIdentity, 
                                                                                    variableName:machine.variableName                                                                                 }, 
                                                                                 machinepack: {
                                                                                    identity:machinepackIdentity, 
                                                                                    variableName:machinepack.variableName                                                                                 }} , result));
                                                                     }} );
                                                            }
                                                         );
                                                      }} );
                                             }} );
                                    }
                                 );
                              }} );
                     }
                  );
               }} );
      }} ).exec( {
      error:function(err)  {
         console.error("Unexpected error occurred:
", typeof err === "object" && err instanceof Error ? err.stack : err);
      }, 
      invalidMachine:function(err)  {
         console.error("Cannot run machine `" + chalk.red(err.machine) + "`. Machine is invalid.  Error details:
", err);
      }, 
      success:function(result)  {
         console.log("___" + repeatChar("_") + "_˛");
         console.log("   " + repeatChar(" ") + "  ");
         console.log("   " + chalk.gray("%s.%s()"), chalk.bold(chalk.white(result.machinepack.variableName)), chalk.bold(chalk.yellow(result.machine.variableName)));
         console.log("  ");
         console.log(_.reduce(result.withInputs, function(memo, configuredInput)  {
                  memo = "   » " + chalk.white(configuredInput.name) + " " + chalk.gray(JSON.stringify(configuredInput.value));
                  memo = "
";
                  return memo;
               }, 
               ""));
         console.log("___" + repeatChar("_") + "_¸ ");
         console.log("  | ");
         var exitColor = function()  {
            if (result.exited.exit === "error")  {
               return "red";
            }
            if (result.exited.exit === "success")  {
               return "green";
            }
            return "blue";
         }
();
         console.log("  " + chalk.bold(chalk[exitColor]("•")) + " 
  The machine triggered its " + chalk.bold(chalk[exitColor](result.exited.exit)) + " exit" + function()  {
               if (! result.exited.void)  {
                  return " and returned a value:
   " + chalk.gray(result.exited.inspectedValue);
               }
               return ".";
            }
());
         console.log();
         console.log();
         console.log(chalk.white(" To run again:"));
         console.log(chalk.white(function()  {
                  var cmd = " treeline exec " + result.machinepack.identity + "/" + result.machine.identity;
                  _.each(result.withInputs, function(configuredInput)  {
                        if (configuredInput.protect) return                         cmd = " ";
                        cmd = "--" + configuredInput.name + "='" + configuredInput.value.replace(/'/g, "'\''") + "'";
                     }
                  );
                  return cmd;
               }
()));
         console.log();
      }} );
function repeatChar(char, width)  {
   width = width || 60;
   var borderStr = "";
   for (var i = 0; i < width; i++)  {
         borderStr = char;
      }
   return borderStr;
}
;
