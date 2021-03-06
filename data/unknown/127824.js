! ✖ / env;
node;
exports.test = function(done, assertions)  {
   var debug = ! ! true, emptyFn = function()  {
   }
, log = console.log, dbg = debug ? console.log : emptyFn, test_utils = require("./deps/test-utils"), inspect = test_utils.inspect, format = test_utils.format, Spade = require("../"), opt =  {
      socket: {
         address: {
            port:6379         }} , 
      security: {
         127.0.0.1:6379: {
            requirepass:"", 
            db:- 1         }} , 
      hiredis:false   }
, client = Spade(opt), evts = [], collected = client.logger.collected, exit = typeof done === "function" ? done : function()  {
   }
, assert = assertions || require("assert");
   log("- a new Spade client was created with with custom options:", inspect(client.options));
   log("- enable CLI logging.");
   client.cli(true, function(ename, args)  {
         dbg("  !%s %s", ename, format(ename, args || []));
      }, 
      true);
   log("- opening client connection.");
   evts.push("connect");
   client.connect(null, function()  {
         log("- now client is connected and ready to send/recieve.");
         evts.push("scanqueue", "ready");
         log("- send ECHO without arguments, command is not sent, encoding error will be expected.");
         evts.push("error");
         client.commands.echo();
      }
   );
   log("- wait 1 second to collect events..");
   setTimeout(function()  {
         log("- now disconnecting client.");
         client.disconnect(function()  {
               log("- client disconnected.");
               evts.push("offline", "lost");
            }
         );
         setTimeout(function()  {
               log("- check collected events from client, should be: %s.", inspect(evts));
               assert.deepEqual(collected.events, evts, "something goes wrong with client disconnection! got: " + inspect(collected.events));
               exit();
            }, 
            1000);
      }, 
      1000);
}
;
if (process.argv[1] === __filename) exports.test = exports.test()