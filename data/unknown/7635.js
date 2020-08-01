! ✖ / env;
node;
var log = console.log, assert = require("assert"), util = require("util"), Spade = require("../"), tclients = 20, requests = 64 * 1024, list = [], channels = ["d", "e", "u", "c", "e", "s"], rc = tclients * requests + channels.length, cc = tclients, stime = 0, ttime = 0, long_string = "spadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespadespade", spade_opt =  {
   hiredis:! ! true}
, publisher = null, reply_messages = 0;
var count = function()  {
   if (--rc === 0)  {
      ttime = Date.now() - stime;
      log("-> subscribers (clients):", tclients);
      log("-> publishers:", 1);
      log("-> total reply messages for client subscriptions:", channels.length * tclients);
      assert.ok(reply_messages === channels.length * tclients, "wrong number of messages replies form subscribe!");
      log("-> total messages published:", requests);
      log("-> total messages received from publisher:", requests * tclients);
      log("-> total msecs:", ttime);
      log("-> rate:", Math.round(requests * tclients / ttime / 1000) + " msgs/sec");
      process.exit(0);
   }
}
;
var onError = function()  {
   log("error", arguments);
   process.exit(1);
}
;
var sendCommands = function()  {
   var i = 0, pcmd = publisher.commands.publish;
   stime = Date.now();
   for (; i < requests; ++i) pcmd("d", long_string)}
;
var enqueue = function()  {
   var me = this;
   me.commands.subscribe(channels, function()  {
         ++reply_messages;
      }
   );
   if (--cc === 0)  {
      sendCommands();
   }
}
;
var run = function()  {
   var i = 0, n = tclients, s = null;
   for (; i < n; ++i)  {
         s = Spade(spade_opt);
         list[i] = s;
         s.on("error", onError);
         s.on("message", count);
         s.once("ready", enqueue.bind(s));
      }
   for (; --i >= 0; )  {
         list[i].connect();
      }
}
;
var add = function()  {
   var s = Spade(spade_opt);
   publisher = s;
   s.once("ready", function()  {
         run();
      }
   );
   s.connect();
}
;
log("> Spade benchmark, %d subscribers / 1 publisher", tclients);
log("
-> using: "%s" parser.", Spade(spade_opt).parser.hreader ? "HIREDIS NATIVE" : "BORIS JS");
log("-> message length: (%d bytes)
", long_string.length);
add();
