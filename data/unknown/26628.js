! ✖ / env;
node;
var http = require("http");
var ejs = require("./ejs.js");
var lf = require("./lfcli.js");
var querystring = require("querystring");
var fs = require("fs");
var Canvas = require("canvas");
var logger = require("./logger.js");
var config = require("./config.js");
var overview = require("./overview.js");
var user = require("./user.js");
var inis = require("./inis.js");
var topics = require("./topics.js");
var area = require("./area.js");
var contacts = require("./contacts.js");
var initiative = require("./initiative.js");
var suggestion = require("./suggestion.js");
var issue = require("./issue.js");
var search = require("./search.js");
var showTopics = function(state)  {
   if (! state.session_key())  {
      state.sendToLogin();
      return ;
   }
   var finish = function()  {
      var ctx = state.context;
      ctx.meta.currentpage = "topics";
      if (ctx.units !== undefined)  {
         ejs.render(state, "/topics.tpl");
      }
   }
;
   topics.get(state, finish);
}
;
var showProfile = function(state)  {
   if (! state.session_key())  {
      state.sendToLogin();
      return ;
   }
   var finish = function()  {
      var ctx = state.context;
      if (ctx.user.isme)  {
         ctx.meta.currentpage = "profile";
      }
       else  {
         ctx.meta.currentpage = "otherprofile";
      }
      if (ctx.user !== undefined && ctx.user.units.length != 0)  {
         ejs.render(state, "/profile.tpl");
      }
   }
;
   user.get(state, finish, true);
}
;
var showArea = function(state)  {
   if (! state.session_key())  {
      state.sendToLogin();
      return ;
   }
   if (! state.url.query.area_id)  {
      logger(1, "Please provide area_id parameter");
      invalidURL(state);
      return ;
   }
   var page = state.url.query.page || 1;
   var memberpage = state.url.query.memberpage || 1;
   var my_involvment = state.url.query.my_involvment || 1;
   var issue_sort_criteria = state.url.query.issue_sort_criteria || "4";
   var finish = function()  {
      var ctx = state.context;
      ctx.meta.currentpage = "area";
      if (ctx.area !== undefined)  {
         ejs.render(state, "/area.tpl");
      }
   }
;
   area.show(state, finish, page, memberpage, my_involvment, issue_sort_criteria);
}
;
var showInitiative = function(state)  {
   if (! state.session_key())  {
      state.sendToLogin();
      return ;
   }
   if (! state.url.query.initiative_id)  {
      logger(1, "Please provide initiative_id parameter");
      invalidURL(state);
      return ;
   }
   var finish = function()  {
      var ctx = state.context;
      ctx.meta.currentpage = "initiative";
      if (ctx.initiative !== undefined)  {
         ejs.render(state, "/initiative.tpl");
      }
   }
;
   initiative.show(state, finish);
}
;
var showIssue = function(state)  {
   if (! state.session_key())  {
      state.sendToLogin();
      return ;
   }
   var ctx = state.context;
   ctx.meta.currentpage = "issue";
   ejs.render(state, "/issue.tpl");
}
;
var showTimeline = function(state)  {
   if (! state.session_key())  {
      state.sendToLogin();
      return ;
   }
   var finish = function()  {
      var ctx = state.context;
      ctx.meta.currentpage = "timeline";
      if (ctx.inis !== undefined)  {
         ejs.render(state, "/timeline.tpl");
      }
   }
;
   inis.lastInis(state, finish);
}
;
var invalidURL = function(state, logmessage, errorcode)  {
   if (! logmessage)  {
      logmessage = "Invalid resource requested";
   }
   if (! errorcode)  {
      errorcode = 404;
   }
   logger(1, "WARN: " + logmessage + " – Sent code " + errorcode + " to the client");
   var res = state.result;
   res.writeHead(errorcode,  {
         Content-Type:"text/plain"      }
   );
   res.end("Kuckst du woanders!
");
}
;
var serverError = function(state, logmessage, errorcode)  {
   if (! errorcode)  {
      errorcode = 500;
   }
   console.error("ERROR: " + logmessage + " – Sent code " + errorcode + " to the client");
   console.trace();
   var res = state.result;
   res.writeHead(500,  {
         Content-Type:"text/plain"      }
   );
   res.end("I feel blue. Guess I'll go swimming!
");
}
;
var performLogin = function(state)  {
   if (state.request.method !== "POST")  {
      state.sendToLogin();
      return ;
   }
   body = "";
   state.request.on("data", function(chunk)  {
         body = chunk;
      }
   );
   var finish = function(state, successfull, message)  {
      state.context.meta.do_refresh = true;
      state.context.meta.refresh_url = data["refresh-url"] || state.app_prefix + "/overview";
      state.context.login =  {
         success:successfull, 
         message:message      }
;
      ejs.render(state, "/loggedIn.tpl");
   }
;
   state.request.on("end", function()  {
         data = querystring.parse(body);
         lf.perform("/session",  {
               key:data.key            }, 
            state, function(res)  {
               if (res.session_key && res.status == "ok")  {
                  state.session_key(res.session_key);
                  lf.query("/info",  {} , state, function(res)  {
                        state.user_id(res.current_member_id);
                        finish(state, true);
                     }
                  );
               }
                else  {
                  finish(state, false, res.error);
               }
            }
         );
      }
   );
}
;
var performLogout = function(state)  {
   state.session_key(null);
   state.user_id(null);
   state.context.meta.do_refresh = true;
   state.context.meta.refresh_url = state.app_prefix + "/overview";
   ejs.render(state, "/loggedOut.tpl");
}
;
var serveStatic = function(state)  {
   filepath = __dirname + "/html" + state.local_path;
   logger(1, "Serving: " + filepath);
   fs.readFile(filepath, function(err, data)  {
         if (err)  {
            invalidURL(state);
            return ;
         }
         state.result.end(data);
         logger(1, "Served: " + filepath);
      }
   );
}
;
var sendPicture = function(state)  {
   var user_id = state.local_path.slice("/picbig/".length);
   logger(1, "Retrieving portrait for user " + user_id);
   var query_obj =  {
      type:"photo", 
      member_id:user_id   }
;
   lf.query("/member_image", query_obj, state, function(result)  {
         var response = state.result;
         if (result.status === "ok" && result.result.length)  {
            var image = result.result[0];
            response.setHeader("Content-Type", image.content_type);
            buf = new Buffer(image.data, "base64");
            response.write(buf);
            response.end();
         }
          else  {
            filepath = __dirname + "/html/img/placeholder.png";
            fs.readFile(filepath, function(err, data)  {
                  if (err)  {
                     state.fail("Failed to get placeholder user image: " + err);
                     return ;
                  }
                  state.result.end(data);
               }
            );
         }
      }
   );
}
;
var sendAvatar = function(state)  {
   var user_id = state.local_path.slice("/avatar/".length);
   logger(1, "Retrieving avatar for user " + user_id);
   var query_obj =  {
      type:"avatar", 
      member_id:user_id   }
;
   lf.query("/member_image", query_obj, state, function(result)  {
         var response = state.result;
         if (result.status === "ok" && result.result.length)  {
            var image = result.result[0];
            response.setHeader("Content-Type", image.content_type);
            buf = new Buffer(image.data, "base64");
            response.write(buf);
            response.end();
         }
          else  {
            filepath = __dirname + "/html/img/no_profilepic.png";
            fs.readFile(filepath, function(err, data)  {
                  if (err)  {
                     state.fail("Failed to get placeholder user avatar: " + err);
                     return ;
                  }
                  state.result.end(data);
               }
            );
         }
      }
   );
}
;
var sendSmallPicture = function(state)  {
   var Image = Canvas.Image;
   var img = new Image();
   img.onerror = function(err)  {
      throw err;
   }
;
   img.onload = function()  {
      var max = Math.max(img.width, img.height), width = img.width * 24 / max, height = img.height * 24 / max, canvas = new Canvas(width, height), ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBuffer(function(err, buf)  {
            var response = state.result;
            response.write(buf);
            response.end();
         }
      );
   }
;
   var user_id = state.local_path.slice("/picmini/".length);
   logger(2, "Retrieving smallpic for user " + user_id);
   var query_obj =  {
      type:"avatar", 
      member_id:user_id   }
;
   lf.query("/member_image", query_obj, state, function(result)  {
         if (result.status === "ok" && result.result.length)  {
            var image = result.result[0];
            state.result.setHeader("Content-Type", image.content_type);
            img.src = new Buffer(image.data, "base64");
         }
          else  {
            filepath = __dirname + "/html/img/no_profilepic24.png";
            fs.readFile(filepath, function(err, data)  {
                  if (err)  {
                     state.fail("Failed to get placeholder user avatar: " + err);
                     return ;
                  }
                  state.result.end(data);
               }
            );
         }
      }
   );
}
;
var url_mapping =  {
   /:overview.show, 
   /index.html:overview.show, 
   /overview:overview.show, 
   /login:performLogin, 
   /logout:performLogout, 
   /topics:showTopics, 
   /profile:showProfile, 
   /contacts:contacts.show, 
   /timeline:showTimeline, 
   /update_inis:overview.updateInis, 
   /update_news:overview.updateNews, 
   /favicon.ico:serveStatic, 
   /initiative:initiative.show, 
   /area:showArea, 
   /issue:issue.show, 
   /suggestion:suggestion.show, 
   /search:search.show, 
   /update_opinions:suggestion.updateOpinions, 
   /update_areas_table:topics.update_areas_table, 
   /update_issues_table:area.update_issues_table}
;
var pattern_mapping = [ {
   pattern:"/picbig/", 
   mapped:sendPicture}
,  {
   pattern:"/avatar/", 
   mapped:sendAvatar}
,  {
   pattern:"/picmini/", 
   mapped:sendSmallPicture}
,  {
   pattern:"/css/", 
   mapped:serveStatic}
,  {
   pattern:"/js/", 
   mapped:serveStatic}
,  {
   pattern:"/img/", 
   mapped:serveStatic}
,  {
   pattern:"/content_img/", 
   mapped:serveStatic}
,  {
   pattern:/^\/\w+\.html/, 
   mapped:serveStatic}
];
mapU2F = function(state, url_mappings, pattern_mappings)  {
   var i;
   var mapped;
   if (config.listen.baseurl)  {
      if (state.url.pathname.substring(0, state.app_prefix.length) != state.app_prefix)  {
         logger(1, state.url.pathname + " does not start with " + state.app_prefix);
         invalidURL(state);
         return ;
      }
   }
   var path = state.local_path;
   logger(1, "Request url: " + path + " (APP Path is " + state.app_prefix + ")");
   mapped = url_mappings[path];
   if (mapped)  {
      mapped(state);
   }
    else  {
      for (i = 0; ! mapped && i < pattern_mappings.length; i = i + 1)  {
            pattern = pattern_mappings[i].pattern;
            if (typeof pattern === "string" && path.slice(0, pattern.length) === pattern)  {
               mapped = pattern_mappings[i].mapped;
            }
             else if (pattern.test && typeof pattern.test === "function" && pattern.test(path))  {
               mapped = pattern_mappings[i].mapped;
            }
         }
      if (mapped)  {
         mapped(state);
      }
       else  {
         logger(1, path + " has not been mapped");
         invalidURL(state);
      }
   }
}
;
var State = require("./state.js")(serverError, invalidURL);
server = function()  {
   process.on("uncaughtException", function(err)  {
         if (err.stack)  {
            err = err.stack;
         }
         console.error("ERROR: Exception not handled properly: " + err);
      }
   );
   lf.query("/info",  {} , null, function(res)  {
         server = lf.getBaseURL();
         logger(0, "Connected to " + server.host + ":" + server.port);
         logger(0, "Core Version: " + res.core_version);
         logger(0, "API Version:  " + res.api_version);
         logger(0, "Bombay Crushed Version: 0.1.1");
      }
   );
   var server = http.createServer(function(req, res)  {
         var state = State.create(req, res);
         mapU2F(state, url_mapping, pattern_mapping);
      }
   );
   if (config.listen.host)  {
      server.listen(config.listen.port, config.listen.host);
      logger(0, "Server running at port " + config.listen.port + " on " + config.listen.host);
   }
    else  {
      server.listen(config.listen.port);
      logger(0, "Server running at port " + config.listen.port + " on all interfaces");
   }
   logger(1, "Server Base URL: " + config.listen.baseurl);
}
;
server();
