! ✖ / env;
node;
var request = require("request");
var teslams = require("../teslams.js");
var fs = require("fs");
var util = require("util");
function argchecker(argv)  {
   if (argv.db == true) throw "MongoDB database name is unspecified. Use -d dbname or --db dbname"}
;
var usage = "Usage: $0 -u <username> -p <password> [-sz] [--file <filename> || --db <MongoDB database>] 
" + "   [--values <value list>] [--maxrpm <#num>] 
" + "# if --db <MongoDB database> argument is given, store data in MongoDB, otherwise in a flat file";
var p_url = "https://portal.vn.teslamotors.com/vehicles/";
var s_url = "https://streaming.vn.teslamotors.com/stream/";
var collectionS, collectionA;
var firstTime = true;
var MongoClient;
var stream;
var last = 0;
var rpm = 0;
var slast = 0;
var srpm = 0;
var lastss = "init";
var ss = "init";
var napmode = false;
var sleepmode = false;
var napTimeoutId;
var sleepIntervalId;
var pcount = 0;
var scount = 0;
var icount = 0;
var ncount = 0;
var argv = require("optimist").usage(usage).check(argchecker).alias("u", "username").describe("u", "Teslamotors.com login").alias("p", "password").describe("p", "Teslamotors.com password").alias("d", "db").describe("d", "MongoDB database name").alias("s", "silent").describe("s", "Silent mode: no output to console").alias("z", "zzz").describe("z", "enable sleep mode checking").boolean(["s", "z"]).alias("f", "file").describe("f", "Comma Separated Values (CSV) output file. Defaults to streaming.out").default("f", "streaming.out").alias("r", "maxrpm").describe("r", "Maximum number of requests per minute").default("r", 6).alias("N", "napcheck").describe("N", "Number of minutes between nap checks").default("N", 1).alias("S", "sleepcheck").describe("S", "Number of minutes between sleep checks").default("S", 1).alias("v", "values").describe("v", "List of values to collect").default("v", "speed,odometer,soc,elevation,est_heading,est_lat,est_lng,power,shift_state,range,est_range,heading").alias("?", "help").describe("?", "Print usage information");
var creds = require("./config.js").config(argv);
argv = argv.argv;
argv.napcheck = 60000;
argv.sleepcheck = 60000;
if (argv.help == true)  {
   console.log(usage);
   process.exit(1);
}
var nFields = argv.values.split(",").length + 1;
if (argv.db)  {
   console.log("database name", argv.db);
   MongoClient = require("mongodb").MongoClient;
   var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URI || "mongodb://127.0.0.1:27017/" + argv.db;
   MongoClient.connect(mongoUri, function(err, db)  {
         if (err) throw err         collectionS = db.collection("tesla_stream");
         collectionA = db.collection("tesla_aux");
      }
   );
}
 else  {
   stream = fs.createWriteStream(argv.file);
}
function tsla_poll(vid, long_vid, token)  {
   pcount++;
   if (pcount > 1)  {
      ulog("Too many pollers running, exiting this one");
      pcount = pcount - 1;
      return ;
   }
   if (napmode)  {
      ulog("Info: car is napping, skipping tsla_poll()");
      pcount = pcount - 1;
      return ;
   }
   if (long_vid == undefined || token == undefined)  {
      console.log("Error: undefined vehicle_id (" + long_vid + ") or token (" + token + ")");
      console.log("Exiting...");
      process.exit(1);
   }
   var now = new Date().getTime();
   if (now - slast < 60000)  {
      ulog(srpm + " of " + argv.maxrpm + " Stream requests since " + slast);
      if (now - slast < 0)  {
         ulog("Warn: Clock moved backwards - Daylight Savings Time??");
         srpm = 0;
         slast = now;
      }
       else if (srpm > argv.maxrpm)  {
         ulog("Warn: throttling due to too many streaming requests per minute");
         setTimeout(function()  {
               tsla_poll(vid, long_vid, token);
            }, 
            60000);
         pcount = pcount - 1;
         return ;
      }
   }
    else  {
      srpm = 0;
      slast = now;
   }
   if (argv.zzz == true && lastss == "" && ss == "")  {
      rpm++;
      teslams.get_charge_state(vid, function(cs)  {
            if (cs.charging_state == "Charging")  {
               ulog("Info: car is charging, continuing to poll for data");
            }
             else  {
               if (ncount == 0)  {
                  ncount++;
                  ulog("Info: 30 minute nap starts now");
                  napmode = true;
                  napTimeoutId = setTimeout(function()  {
                        ncount = 0;
                        clearInterval(sleepIntervalId);
                        scount = 0;
                        napmode = false;
                        ss = "nap";
                        lastss = "nap";
                        initstream();
                     }, 
                     1800000);
               }
                else  {
                  ulog("Debug: (" + ncount + ") Nap timer is already running. Not starting another");
               }
               if (scount == 0)  {
                  scount++;
                  sleepIntervalId = setInterval(function()  {
                        if (napmode == true)  {
                           rpm++;
                           teslams.vehicles( {
                                 email:creds.username, 
                                 password:creds.password                              }, 
                              function(vehicles)  {
                                 if (typeof vehicles.state != undefined)  {
                                    ulog("Vehicle state is: " + vehicles.state);
                                    if (vehicles.state == "asleep" || vehicles.state == "unknown")  {
                                       ulog("Stopping nap mode since car is now in (" + vehicles.state + ") state");
                                       clearTimeout(napTimeoutId);
                                       ncount = 0;
                                       clearInterval(sleepIntervalId);
                                       scount = 0;
                                       napmode = false;
                                       ss = "sleep";
                                       lastss = "sleep";
                                       initstream();
                                    }
                                 }
                                  else  {
                                    ulog("Nap checker: undefined vehicle state");
                                 }
                              }
                           );
                        }
                     }, 
                     argv.sleepcheck);
               }
                else  {
                  ulog("Debug: (" + scount + ") Sleep checker is already running. Not starting another");
               }
            }
         }
      );
      if (napmode == true)  {
         ulog("Info: code just entered nap mode but we will start one last poll");
      }
   }
   srpm++;
   request( {
         uri:s_url + long_vid + "/?values=" + argv.values, 
         method:"GET", 
         auth: {
            user:creds.username, 
            pass:token         }, 
         timeout:125000      }, 
      function(error, response, body)  {
         if (error)  {
            ulog("Polling again because poll returned HTTP error:" + error);
            setTimeout(function()  {
                  tsla_poll(vid, long_vid, token);
               }, 
               10000);
            pcount = pcount - 1;
            return ;
         }
          else if (response.statusCode == 200)  {
            if (body === undefined)  {
               ulog("WARN: HTTP returned OK but body is undefined");
               setTimeout(function()  {
                     tsla_poll(vid, long_vid, token);
                  }, 
                  10000);
               pcount = pcount - 1;
               return ;
            }
             else if (body === null)  {
               ulog("WARN: HTTP returned OK but body is null");
               setTimeout(function()  {
                     tsla_poll(vid, long_vid, token);
                  }, 
                  10000);
               pcount = pcount - 1;
               return ;
            }
             else  {
               ulog("Poll return HTTP OK and body is this:
" + body);
               setTimeout(function()  {
                     tsla_poll(vid, long_vid, token);
                  }, 
                  1000);
               pcount = pcount - 1;
               return ;
            }
         }
          else if (response.statusCode == 401)  {
            ulog("WARN: HTTP 401: Unauthorized - token has likely expired, reinitializing");
            setTimeout(function()  {
                  initstream();
               }, 
               1000);
            pcount = pcount - 1;
            return ;
         }
          else  {
            ulog("Unexpected problem with request:
    Response status code = " + response.statusCode + "  Error code = " + error + "
 Polling again in 10 seconds...");
            setTimeout(function()  {
                  tsla_poll(vid, long_vid, token);
               }, 
               10000);
            pcount = pcount - 1;
            return ;
         }
      }
   ).on("data", function(data)  {
         var d, vals, i, record, doc;
         d = data.toString().trim();
         vals = d.split(/[,\n\r]/);
         if (isNaN(vals[0]) || vals[0] < 1340348400000)  {
            ulog("Bad timestamp (" + vals[0] + ")");
         }
          else  {
            if (argv.db)  {
               record = vals.slice(0, nFields);
               doc =  {
                  ts:+ vals[0], 
                  record:record               }
;
               collectionS.insert(doc,  {
                     safe:true                  }, 
                  function(err, docs)  {
                     if (err) util.log(err)                  }
               );
               lastss = ss;
               ss = vals[9];
               if (napmode == true && ss != "")  {
                  ulog("Info: canceling nap mode because shift_state is now (" + ss + ")");
                  clearTimeout(napTimeoutId);
                  ncount = 0;
                  clearInterval(sleepIntervalId);
                  scount = 0;
                  napmode = false;
                  ss = "abort";
                  lastss = "abort";
                  initstream();
               }
            }
             else  {
               stream.write(data);
            }
         }
      }
   );
}
;
function getAux()  {
   var now = new Date().getTime();
   if (now - last < 60000)  {
      ulog("getAux: " + rpm + " of " + argv.maxrpm + " REST requests since " + last);
      if (now - last < 0)  {
         ulog("Warn: Clock moved backwards - Daylight Savings Time??");
         rpm = 0;
         last = now;
      }
       else if (rpm > argv.maxrpm)  {
         ulog("Throttling Auxiliary REST requests due to too much REST activity");
         return ;
      }
   }
    else  {
      rpm = 0;
      last = now;
   }
   if (napmode || sleepmode)  {
      ulog("Info: car is napping or sleeping, skipping auxiliary REST data sample");
      return ;
   }
    else  {
      rpm = rpm + 2;
      ulog("getting charge state Aux data");
      teslams.get_charge_state(getAux.vid, function(data)  {
            var doc =  {
               ts:new Date().getTime(), 
               chargeState:data            }
;
            collectionA.insert(doc,  {
                  safe:true               }, 
               function(err, docs)  {
                  if (err) throw err               }
            );
         }
      );
      ulog("getting climate state Aux data");
      teslams.get_climate_state(getAux.vid, function(data)  {
            var ds = JSON.stringify(data), doc;
            if (ds.length > 2 && ds != JSON.stringify(getAux.climate))  {
               getAux.climate = data;
               doc =  {
                  ts:new Date().getTime(), 
                  climateState:data               }
;
               collectionA.insert(doc,  {
                     safe:true                  }, 
                  function(err, docs)  {
                     if (err) throw err                  }
               );
            }
         }
      );
   }
}
;
function storeVehicles(vehicles)  {
   var doc =  {
      ts:new Date().getTime(), 
      vehicles:vehicles   }
;
   collectionA.insert(doc,  {
         safe:true      }, 
      function(err, docs)  {
         if (err) console.dir(err)      }
   );
   rpm = rpm + 2;
   teslams.get_vehicle_state(vehicles.id, function(data)  {
         ulog(util.inspect(data));
         doc =  {
            ts:new Date().getTime(), 
            vehicleState:data         }
;
         collectionA.insert(doc,  {
               safe:true            }, 
            function(err, docs)  {
               if (err) console.dir(err)            }
         );
      }
   );
   teslams.get_gui_settings(vehicles.id, function(data)  {
         ulog(util.inspect(data));
         doc =  {
            ts:new Date().getTime(), 
            guiSettings:data         }
;
         collectionA.insert(doc,  {
               safe:true            }, 
            function(err, docs)  {
               if (err) console.dir(err)            }
         );
      }
   );
}
;
function initdb(vehicles)  {
   storeVehicles(vehicles);
   getAux.vid = vehicles.id;
   setInterval(getAux, 60000);
}
;
function ulog(string)  {
   if (! argv.silent)  {
      util.log(string);
   }
}
;
function initstream()  {
   icount++;
   if (icount > 1)  {
      ulog("Debug: Too many initializers running, exiting this one");
      icount = icount - 1;
      return ;
   }
   if (napmode)  {
      ulog("Info: car is napping, skipping initstream()");
      icount = icount - 1;
      return ;
   }
   var now = new Date().getTime();
   if (now - last < 60000)  {
      ulog(rpm + " of " + argv.maxrpm + " REST requests since " + last);
      if (now - last < 0)  {
         ulog("Warn: Clock moved backwards - Daylight Savings Time??");
         rpm = 0;
         last = now;
      }
       else if (rpm > argv.maxrpm)  {
         util.log("Warn: throttling due to too many REST API requests");
         setTimeout(function()  {
               initstream();
            }, 
            60000);
         icount = icount - 1;
         return ;
      }
   }
    else  {
      last = now;
      rpm = 0;
   }
   rpm++;
   teslams.vehicles( {
         email:creds.username, 
         password:creds.password      }, 
      function(vehicles)  {
         if (typeof vehicles == "undefined")  {
            console.log("Error: undefined response to vehicles request");
            console.log("Exiting...");
            process.exit(1);
         }
         if (vehicles.state == undefined)  {
            ulog(util.inspect(vehicles));
         }
         if (argv.zzz && vehicles.state != "online")  {
            var timeDelta = Math.floor(argv.napcheck / 60000) + " minutes";
            if (argv.napcheck % 60000 != 0)  {
               timeDelta = " " + Math.floor(argv.napcheck % 60000 / 1000) + " seconds";
            }
            ulog("Info: car is in (" + vehicles.state + ") state, will check again in " + timeDelta);
            napmode = true;
            setTimeout(function()  {
                  napmode = false;
                  sleepmode = true;
                  initstream();
               }, 
               argv.napcheck);
            icount = icount - 1;
            return ;
         }
          else if (typeof vehicles.tokens == "undefined" || vehicles.tokens[0] == undefined)  {
            ulog("Info: car is in (" + vehicles.state + ") state, calling /charge_state to reveal the tokens");
            rpm++;
            teslams.get_charge_state(vehicles.id, function(resp)  {
                  if (resp.charging_state != undefined)  {
                     ulog("Debug: charge_state request succeeded (" + resp.charging_state + "). 
  Reinitializing...");
                     setTimeout(function()  {
                           initstream();
                        }, 
                        1000);
                     icount = icount - 1;
                     return ;
                  }
                   else  {
                     ulog("Warn: waking up with charge_state request failed.
  Waiting 30 secs and then reinitializing...");
                     setTimeout(function()  {
                           initstream();
                        }, 
                        30000);
                     icount = icount - 1;
                     return ;
                  }
               }
            );
         }
          else  {
            sleepmode = false;
            if (firstTime)  {
               firstTime = false;
               if (argv.db)  {
                  initdb(vehicles);
               }
                else  {
                  stream.write("timestamp," + argv.values + "
");
               }
            }
            tsla_poll(vehicles.id, vehicles.vehicle_id, vehicles.tokens[0]);
            icount = icount - 1;
            return ;
         }
      }
   );
}
;
ulog("timestamp," + argv.values);
initstream();
