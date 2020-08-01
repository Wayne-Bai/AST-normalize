! ✖ / env;
jackup;
exports.app = function(env)  {
   return  {
      status:200, 
      headers: {
         Content-Type:"text/plain"      }, 
      body:["jackconfig.js is the default file jackup looks for!"]   }
;
}
;
exports.development = function(app)  {
   return require("jack/commonlogger").CommonLogger(require("jack/showexceptions").ShowExceptions(require("jack/lint").Lint(require("jack/contentlength").ContentLength(app))));
}
;
