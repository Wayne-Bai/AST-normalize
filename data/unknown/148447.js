! ✖ / env;
node;
var https = require("https"), fs = require("fs");
module.exports = function(url, dest, cb)  {
   var file = fs.createWriteStream(dest);
   var request = https.get(url, function(response)  {
         response.pipe(file);
         file.on("finish", function()  {
               file.close(cb);
            }
         );
      }
   ).on("error", function(err)  {
         fs.unlink(dest);
         if (cb) cb(err.message)      }
   );
}
;
