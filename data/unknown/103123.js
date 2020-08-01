! ✖ / env;
node;
var conf = require("rc")("vimdebug",  {
      vim: {
         keys: {
            break:"C-p", 
            continue:"C-c", 
            down:"C-d", 
            in:"C-i", 
            next:"C-n", 
            out:"C-o", 
            up:"C-u"         }} , 
      agent: {
         port:3219      }, 
      debugger: {
         port:5858      }, 
      windowmanager:""   }
);
var portfinder = require("portfinder");
var spawn = require("child_process").spawn;
var argv = require("optimist").argv;
var NBAgent = require("../lib/agent.js");
var Debugger = require("v8-debugger");
var Repl = require("../lib/repl.js");
var dc = new Debugger.Client();
var agent = new NBAgent(conf);
if (argv._.length != 0)  {
   var child = spawn(process.execPath, ["--debug-brk=" + conf.debugger.port].concat(argv._));
   var banner = "";
   var waitBanner = true;
   child.stderr.on("data", function(data)  {
         if (! waitBanner)  {
            console.log("err > " + data);
            return ;
         }
         banner = data.toString();
         var m = banner.match(/debugger listening on port ([0-9]*)/i);
         if (m)  {
            waitBanner = false;
            setTimeout(function()  {
                  console.log("Debugger listening on port " + conf.debugger.port);
                  dc.connect(conf.debugger.port);
                  dc.on("ready", afterConnect);
               }, 
               300);
         }
      }
   );
   child.stdout.on("data", function(data)  {
         console.log("");
         data.toString().split("
").forEach(function(line)  {
               if (line)  {
                  console.log("out > %s", line);
               }
            }
         );
      }
   );
}
 else  {
   dc.connect(5858);
   dc.on("ready", afterConnect);
}
function afterConnect()  {
   agent.addDebuggerClient(dc);
   switch(conf.windowmanager) {
      case "tmux":
 
            if (process.env.TMUX)  {
               spawn("tmux", ["split-window", "-p", "25", "vim -nb"]);
               spawn("tmux", ["swap-pane", "-D"]);
            }
            break;
         
      case "i3":
 
            var i3 = require("i3").createClient();
            i3.command("split v");
            i3.command("resize grow height 10 ppt");
            i3.command("exec "konsole -e 'vim -nb'"");
            break;
         
      default:
 
            console.log("start vim with "vim -nb" command or type :nbs within vim");
            break;
         
}
;
   Repl(dc, agent);
   dc.repl.on("exit", function()  {
         process.exit();
      }
   );
}
;
