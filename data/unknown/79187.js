! ✖ / env;
iojs;
var _root = process.argv[2];
var _folder = __dirname.substr(_root.length);
var _port = parseInt(process.argv[3], 10);
var _host = process.argv[4] === "null" ? null : process.argv[4];
require(_root + "/lychee/build/nodejs/core.js")(_root);
function(lychee, global)  {
   var environment = new lychee.Environment( {
         debug:false, 
         sandbox:false, 
         build:"game.net.Server", 
         packages:[new lychee.Package("game", _folder + "/lychee.pkg")], 
         tags: {
            platform:["nodejs"]         }} );
   lychee.setEnvironment(environment);
   lychee.init(function(sandbox)  {
         var lychee = sandbox.lychee;
         var game = sandbox.game;
         sandbox.SERVER = new game.net.Server( {
               host:_host, 
               port:_port            }
         );
      }
   );
}
(lychee, typeof global !== "undefined" ? global : this);
