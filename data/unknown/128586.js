! ✖ / env;
node;
var http = require("http"), url = require("url"), fs = require("fs"), args = [];
process.argv.forEach(function(val, idx, array)  {
      args[idx] = val;
   }
);
var usage = "
Usage: load_forms.js <path> <url>

" + "path    Path to a json forms file to upload.
" + "url     URL to medic database.

" + "Examples:

" + "node scripts/load_forms.js ~/generic-anc.json http://admin:pass@localhost/medic
";
if (! args[2] || ! args[3])  {
   return console.error(usage);
}
fs.readFile(args[2],  {
      encoding:"utf-8"   }, 
   function(err, data)  {
      if (err) throw err      var forms = JSON.parse(data), settings =  {
         forms: {}       }
;
      forms.forEach(function(form, idx)  {
            if (form.meta && form.meta.code)  {
               settings.forms[form.meta.code] = form;
            }
         }
      );
      var options = url.parse(args[3] + "/_design/medic/_rewrite/update_settings/medic?replace=1");
      options.method = "PUT";
      var req = http.request(options, function(res)  {
            res.setEncoding("utf8");
            res.on("data", function(chunk)  {
                  console.log(chunk);
               }
            );
         }
      );
      req.on("error", function(e)  {
            if (e) throw e         }
      );
      req.write(JSON.stringify(settings));
      req.end();
   }
);
