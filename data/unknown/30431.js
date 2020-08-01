! ✖ / env;
node;
var chalk = require("chalk");
var yargs = require("yargs");
var cliOpts = function()  {
   var _cliOpts = yargs.argv;
   delete _cliOpts._;
   delete _cliOpts.$0;
   return _cliOpts;
}
();
require("../").newApp( {
      name:process.argv[2]   }
).exec( {
      success:function()  {
         console.log("New Treeline app generated.");
      }, 
      error:function(err)  {
         console.log(chalk.red(err));
      }} );
