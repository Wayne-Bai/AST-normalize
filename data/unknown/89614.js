! ✖ / env;
node;
var dep = require("path").join(__dirname, "./../.npm/jade/0.8.5/node_modules");
var depMet = require.paths.indexOf(dep) !== - 1;
var bundle = dep.replace(/node_modules$/, "package/node_modules");
var bundleMet = require.paths.indexOf(bundle) !== - 1;
var from = "./../.npm/jade/0.8.5/package/lib/parser";
if (! depMet) require.paths.unshift(dep)if (! bundleMet) require.paths.unshift(bundle)module.exports = require(from);
if (! depMet)  {
   var i = require.paths.indexOf(dep);
   if (i !== - 1) require.paths.splice(i, 1)}
if (! bundleMet)  {
   var i = require.paths.indexOf(bundle);
   if (i !== - 1) require.paths.slice(i, 1)}
