! ✖ / env;
node;
var ben = require("ben");
var Logger = require("../lib/bunyan");
var log = new Logger( {
      name:"svc", 
      streams:[ {
         path:__dirname + "/timechild.log"      }
,  {
         stream:process.stdout      }
], 
      serializers: {
         err:Logger.stdSerializers.err      }} );
console.log("Time `log.child`:");
var ms = ben(100000, function()  {
      var child = log.child();
   }
);
console.log(" - adding no fields:  %dms per iteration", ms);
var ms = ben(100000, function()  {
      var child = log.child( {
            a:1         }
      );
   }
);
console.log(" - adding one field:  %dms per iteration", ms);
var ms = ben(100000, function()  {
      var child = log.child( {
            a:1, 
            b:2         }
      );
   }
);
console.log(" - adding two fields: %dms per iteration", ms);
function fooSerializer(obj)  {
   return  {
      bar:obj.bar   }
;
}
;
var ms = ben(100000, function()  {
      var child = log.child( {
            a:1, 
            serializers: {
               foo:fooSerializer            }} );
   }
);
console.log(" - adding serializer and one field: %dms per iteration", ms);
var ms = ben(100000, function()  {
      var child = log.child( {
            a:1, 
            streams:[ {
               stream:process.stderr            }
]         }
      );
   }
);
console.log(" - adding a (stderr) stream and one field: %dms per iteration", ms);
var ms = ben(1000000, function()  {
      var child = log.child( {} , true);
   }
);
console.log(" - [fast] adding no fields:  %dms per iteration", ms);
var ms = ben(1000000, function()  {
      var child = log.child( {
            a:1         }, 
         true);
   }
);
console.log(" - [fast] adding one field:  %dms per iteration", ms);
var ms = ben(1000000, function()  {
      var child = log.child( {
            a:1, 
            b:2         }, 
         true);
   }
);
console.log(" - [fast] adding two fields: %dms per iteration", ms);
