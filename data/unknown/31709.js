! ✖ / env;
node;
var app = module.exports = function(params)  {
   params = params ||  {} ;
   params.root = params.root || __dirname;
   return require("compound").createServer(params);
}
;
if (! module.parent || module.parent.isApplicationLoader)  {
   var port = process.env.PORT || 3000;
   var host = process.env.HOST || "0.0.0.0";
   var server = app();
   server.listen(port, host, function()  {
         console.log("Compound server listening on %s:%d within %s environment", host, port, server.set("env"));
      }
   );
}
