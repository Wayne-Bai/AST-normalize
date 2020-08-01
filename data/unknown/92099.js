! ✖ / env;
node;
var chalk = require("chalk"), fs = require("q-io/fs"), path = require("path"), util = require("util"), argv = require("minimist")(process.argv.slice(2)), pkg = require("../package.json"), print = require("../lib/helper/print"), argsHelper = require("../lib/helper/args");
var t0 = new Date().getTime();
var availableActions = [ {
   name:"create", 
   action:"../actions/create"}
,  {
   name:"platform", 
   action:"../actions/platform"}
,  {
   name:"plugin", 
   action:"../actions/plugin"}
,  {
   name:"prepare", 
   action:"../actions/prepare"}
,  {
   name:"info", 
   action:"../actions/info"}
,  {
   name:"config", 
   action:"../actions/config"}
,  {
   name:"build", 
   action:"../actions/build"}
,  {
   name:"run", 
   action:"../actions/run"}
,  {
   name:"clean", 
   action:"../actions/clean"}
,  {
   name:"cls", 
   action:"../actions/clean"}
,  {
   name:"check", 
   action:"../actions/check"}
,  {
   name:"hockeyapp", 
   action:"../actions/hockeyapp"}
,  {
   name:"update", 
   action:"../actions/update"}
,  {
   name:"watch", 
   action:"../actions/watch"}
], singleOptions = [ {
   small:"v", 
   name:"version", 
   action:printVersion}
,  {
   small:"h", 
   name:"help", 
   action:printHelp}
];
function printHelp(errMessage)  {
   if (errMessage) print(errMessage)   fs.read(path.join(__dirname, "usage.txt")).then(function(help)  {
         print(help);
         process.exit(0);
      }
   );
}
;
function printVersion()  {
   print(pkg.version);
   process.exit(0);
}
;
function matchAction(args)  {
   var actions = availableActions.map(function(a)  {
         return a.name;
      }
   );
   return args._[0] && actions.indexOf(args._[0]) >= 0;
}
;
function actionSuccess(val)  {
   var t = new Date().getTime();
   print(chalk.magenta("done in ~ %ds"), Math.floor(t - t0 / 1000));
   process.exit();
}
;
function actionError(name)  {
   return function(err)  {
      print.trace(err);
      process.exit(1);
   }
;
}
;
function main(args)  {
   for (var i = 0, l = singleOptions.length; i < l; i++)  {
         if (argsHelper.matchSingleOptionWithArguments(args, singleOptions[i].small, singleOptions[i].name, [0]))  {
            return singleOptions[i].action();
         }
      }
   if (matchAction(args))  {
      var action = args._.shift(0), actionName = availableActions.filter(function(a)  {
            return a.name == action;
         }
      )[0].action;
      require(actionName)(args).done(actionSuccess, actionError(action));
   }
    else  {
      printHelp(args._.length && util.format("Tarifa does not know command '%s'
", args._.join(" ")));
   }
}
;
main(argv);
