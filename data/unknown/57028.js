! ✖ / env;
node;
var DNode = require("dnode");
var sys = require("sys");
var EventEmitter = require("events").EventEmitter;
var server1 = DNode( {
      timesTen:function(n, reply)  {
         reply(n * 10);
      }} ).listen(6060);
var server2 = DNode( {
      timesTwenty:function(n, reply)  {
         reply(n * 20);
      }} ).listen(6061);
var moo = new EventEmitter();
server1.on("ready", function()  {
      server2.on("ready", function()  {
            DNode.connect(6060, function(remote1)  {
                  DNode.connect(6061, function(remote2)  {
                        moo.addListener("hi", function(x)  {
                              remote1.timesTen(x, function(res)  {
                                    sys.puts(res);
                                    remote2.timesTwenty(res, function(res2)  {
                                          sys.puts(res2);
                                       }
                                    );
                                 }
                              );
                           }
                        );
                        remote2.timesTwenty(5, function(n)  {
                              sys.puts(n);
                              remote1.timesTen(0.1, function(n)  {
                                    sys.puts(n);
                                 }
                              );
                           }
                        );
                     }
                  );
               }
            );
         }
      );
   }
);
setTimeout(function()  {
      moo.emit("hi", 100);
   }, 
   500);
setTimeout(function()  {
      server1.end();
      server2.end();
   }, 
   1000);
