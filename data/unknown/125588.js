! ✖ / env;
node;
var program = require("commander"), _ = require("lodash"), changeCase = require("change-case"), pkg = require("./../package.json"), smooth = require("./../lib"), customConfig =  {} , cmd;
program.version(pkg.version).option("-c, --config <path>", "set config file path. Defaults to ./" + smooth.defaultConfigFileName).parse(process.argv);
try {
   if (_.isUndefined(program.config))  {
      program.config = smooth.defaultConfigFileName;
   }
   customConfig = require(process.cwd() + "/" + program.config);
}
catch (exception) {
}
program.command("theme [action] [name]").description("Theme actions").option("-d, --dest <destination>").usage("[action]").usage("[name]").action(function(action, name, options)  {
      var dest = _.isUndefined(options.dest) ? process.cwd() + "/themes/" + name : process.cwd() + "/" + options.dest;
      console.log("Forking...");
      smooth.theme[action](customConfig, name, dest).then(function()  {
            console.log("Forked successfully in: " + dest);
         }
      ).catch(function(errorMsg)  {
            console.log(errorMsg);
         }
      ).finally(function()  {
            console.log("Done.");
         }
      );
   }
);
cmd = program.command("build");
cmd.description("Build package");
cmd.option("-d, --dest <destionation>");
smooth.iconSets.forEach(function(setName)  {
      cmd.option("--" + smooth.cmdIncludeIconSetPrefix + "-" + setName);
   }
);
cmd.action(function(options, icon)  {
      var icons = [], normalized = "";
      smooth.iconSets.forEach(function(setName)  {
            normalized = changeCase.camelCase(smooth.cmdIncludeIconSetPrefix + " " + setName);
            if (true === options[normalized])  {
               icons.push( {
                     bundle:setName                  }
               );
            }
         }
      );
      customConfig = _.merge(customConfig,  {
            compress:true, 
            path: {
               target:options.dest            }, 
            icons:icons         }
      );
      smooth.build.build(customConfig);
   }
);
program.command("watch").description("Develop and testing").action(function()  {
      smooth.build.watch(customConfig);
   }
);
program.command("help").description("Displays verbose help").action(function()  {
      program.help();
   }
);
program.parse(process.argv);
