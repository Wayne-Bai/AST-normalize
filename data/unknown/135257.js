! ✖ / env;
phantomjs;
var htmlFile;
var configFile;
var args = require("system").args;
if (args.length === 1)  {
   console.log("Pass the path of the HTML file as the first argument.");
   phantom.exit();
}
 else  {
   htmlFile = args[1];
   configFile = args[2] || "./defaults.json";
}
var config = require(configFile);
var page = require("webpage").create();
page.onConsoleMessage = function(msg)  {
   console.log(msg);
}
;
page.onLoadFinished = function(status)  {
   if (status === "success")  {
      page.evaluate(function(htmlFile)  {
            $("#splash-frame").prop("src", htmlFile);
         }, 
         htmlFile);
      processNextDefaultSize();
   }
    else  {
      console.log(status);
      phantom.exit();
   }
   page.onLoadFinished = null;
}
;
page.open("./frame.html");
function processNextDefaultSize()  {
   if (config.length == 0)  {
      phantom.exit();
      return ;
   }
   var size = config.shift();
   page.evaluate(function(size)  {
         $("#splash-frame").prop("width", size.width).prop("height", size.height);
         console.log("size = " + JSON.stringify(size));
      }, 
      size);
   page.clipRect =  {
      left:0, 
      top:0, 
      width:size.width, 
      height:size.height   }
;
   setTimeout(function()  {
         page.render("out/" + size.filename);
         processNextDefaultSize();
      }, 
      1000);
}
;
