! ✖ / env;
node;
var shorty = require("./lib/shorty"), sys = require("util");
var shortyClient = shorty.createClient("config.json");
shortyClient.on("submit_sm_resp", function(pdu)  {
      console.log("sms marked as sent: " + pdu.sequence_number);
   }
);
shortyClient.on("bindSuccess", function(pdu)  {
      console.log("bind successful");
   }
);
shortyClient.on("bindFailure", function(pdu)  {
      console.log("bind failed");
   }
);
shortyClient.on("unbind", function(pdu)  {
      console.log("unbinding from server");
   }
);
shortyClient.on("unbind_resp", function(pdu)  {
      console.log("unbind confirmed");
   }
);
shortyClient.on("disconnect", function()  {
      console.log("disconnected");
   }
);
shortyClient.on("deliver_sm", function(pdu)  {
      console.log(pdu.source_addr.toString("utf8") + " " + pdu.destination_addr.toString("utf8") + " " + pdu.short_message.toString("utf8"));
   }
);
shortyClient.connect();
process.openStdin();
process.stdin.on("data", function(chunk)  {
      var line, parts, i, message, id;
      line = chunk.toString();
      line = line.substr(0, line.length - 1);
      parts = line.split(" ");
      message = "";
      for (i = 2; i < parts.length; i++)  {
            message = parts[i] + " ";
         }
      id = shortyClient.sendMessage( {
            souce_addr_ton:1, 
            source_addr:parts[0], 
            dest_addr_ton:1, 
            destination_addr:parts[1], 
            data_coding:3, 
            short_message:message         }, 
          {
            user_message_reference:102         }
      );
   }
);
var sighandle = function()  {
   process.stdin.end();
   shortyClient.unbind();
}
;
process.on("exit", sighandle);
