! ✖ / env;
node;
process.title = "starwars";
var net = require("net"), cursor = require("../")(process.stdout);
process.stdin.resume();
if (process.stdin.setRawMode)  {
   process.stdin.setRawMode(true);
}
 else  {
   require("tty").setRawMode(true);
}
var socket = net.connect(23, "towel.blinkenlights.nl");
socket.on("connect", function()  {
      cursor.hide();
      socket.pipe(process.stdout);
   }
);
process.stdin.on("data", function(data)  {
      if (data.toString() === "")  {
         socket.destroy();
         process.stdin.pause();
      }
   }
);
process.on("exit", function()  {
      cursor.show().write("
");
   }
);
