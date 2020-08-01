! ✖ / env;
node;
ledgerImporter();
function ledgerImporter()  {
   var fs = require("fs"), winston = require("winston"), request = require("request"), moment = require("moment"), _ = require("lodash"), diff = require("deep-diff"), ripple = require("ripple-lib"), Ledger = require("../node_modules/ripple-lib/src/js/ripple/ledger").Ledger, options =  {} ;
   winston.add(winston.transports.File,  {
         filename:process.env.LOG_FILE || "importer.log"      }
   );
   var env = process.env.NODE_ENV || "development", config = require(process.env.DEPLOYMENT_ENVS_CONFIG || "../deployment.environments.json")[env], DBconfig = require(process.env.DB_CONFIG || "../db.config.json")[env], db = require("nano")(DBconfig.protocol + "://" + DBconfig.username + ":" + DBconfig.password + "@" + DBconfig.host + ":" + DBconfig.port + "/" + DBconfig.database), indexer = require("./indexer.js");
   var dbChecker = require("./dbchecker.js")(config);
   var options =  {} , DEBUG;
   if (! config.startIndex || config.startIndex < 32570) config.startIndex = 32570   var numericOptions = _.filter(_.map(process.argv, function(opt)  {
            return parseInt(opt, 10);
         }
      ), function(num)  {
         return num;
      }
   );
   if (numericOptions.length === 1)  {
      options.minLedgerIndex = numericOptions[0];
      options.stopAfter = true;
   }
    else if (numericOptions.length === 2)  {
      options.minLedgerIndex = _.min(numericOptions);
      options.lastLedger = _.max(numericOptions);
      options.stopAfter = true;
   }
    else  {
      options.checkDB = true;
   }
   if (process.argv.indexOf("debug3") !== - 1) DEBUG = 3   if (process.argv.indexOf("debug2") !== - 1) DEBUG = 2   if (process.argv.indexOf("debug1") !== - 1) DEBUG = 1   if (process.argv.indexOf("debug") !== - 1) DEBUG = 1   var live = process.argv.indexOf("live") !== - 1 ? true : false;
   var liveOnly = process.argv.indexOf("liveonly") !== - 1 ? true : false;
   config.debug = DEBUG;
   if (! liveOnly) importHistorical(options)   if (live || liveOnly) importLive()   function importHistorical(opts)  {
      if (! opts.minLedgerIndex)  {
         getLatestLedgerSaved(function(err, res)  {
               if (err) return winston.error("error getting ledger from DB: " + err)               if (! res || ! res.index) opts.minLedgerIndex = config.startIndex || 1                else opts.minLedgerIndex = res.index               winston.info("Starting historical import (" + opts.minLedgerIndex + " to LCL)");
               startImporting(opts, function(err, res)  {
                     if (err)  {
                        if (err.type && err.type == "parentHash" && err.index)  {
                           if (DEBUG) winston.info(err)                           importHistorical( {
                                 minLedgerHash:err.index, 
                                 checkDB:opts.checkDB                              }
                           );
                        }
                         else  {
                           winston.error(err);
                           winston.error("stopping historical import");
                        }
                     }
                      else  {
                        winston.info("finished historical import");
                        if (opts.checkDB) checkDB( {
                              checkDB:true                           }
                        )                     }
                  }
               );
            }
         );
      }
       else  {
         var range = opts.lastLedger ? opts.minLedgerIndex + " to " + opts.lastLedger : opts.minLedgerIndex + " to LCL";
         winston.info("Starting historical import (" + range + ")");
         startImporting(opts, function(err, res)  {
               if (err)  {
                  if (err.type && err.type == "parentHash" && err.index && ! opts.stopAfter)  {
                     if (DEBUG) winston.info(err)                     importHistorical( {
                           minLedgerHash:err.index, 
                           checkDB:opts.checkDB                        }
                     );
                  }
                   else  {
                     winston.error(err);
                     winston.error("stopping historical import");
                  }
               }
                else  {
                  if (opts.checkDB) checkDB( {
                        checkDB:true                     }
                  )                  winston.info("finished historical import");
               }
            }
         );
      }
   }
;
   function checkDB(opts)  {
      winston.info("checking DB....");
      dbChecker.checkDB(db, opts.lastLedger, function(res)  {
            if (! res.ledgerIndex || res.restartIndex)  {
               if (DEBUG) winston.error(res)               winston.info("restarting in a few seconds...");
               setTimeout(function()  {
                     opts.lastLedger = res.restartIndex;
                     checkDB(opts);
                  }, 
                  5000);
               return ;
            }
            if (DEBUG) winston.info(res)            var index = res.ledgerIndex;
            if (index > config.startIndex) importHistorical( {
                  minLedgerIndex:config.startIndex, 
                  lastLedger:index, 
                  checkDB:opts.checkDB               }
            )             else winston.info("DB check complete")         }
      );
   }
;
   function importLive()  {
      winston.info("Starting live import");
      getLedger( {
            identifier:null         }, 
         function(err, ledger)  {
            if (err)  {
               winston.error("error getting ledger: " + err);
               winston.info("restarting live import...");
               setTimeout(function()  {
                     importLive();
                  }, 
                  2000);
               return ;
            }
            saveBatchToCouchDb([ledger], function(err, saveRes)  {
                  if (err)  {
                     winston.error(err);
                     winston.info("restarting live import...");
                     setTimeout(function()  {
                           importLive();
                        }, 
                        2000);
                     return ;
                  }
                  startImporting( {
                        live:true, 
                        minLedgerIndex:ledger.ledger_index + 1                     }, 
                     function(err, res)  {
                        if (err)  {
                           winston.error(err);
                           winston.error("stopped live import");
                        }
                     }
                  );
               }
            );
         }
      );
   }
;
   function startImporting(opts, callback)  {
      var info;
      getLedgerBatch(opts, function(err, res)  {
            if (err)  {
               if (err.retry)  {
                  winston.error("problem getting ledger batch:", err);
                  winston.info("Trying again in a few seconds...");
                  opts.results = [];
                  setTimeout(function()  {
                        startImporting(opts, callback);
                     }, 
                     3000);
               }
                else callback(err)               return ;
            }
            if (res.results.length === 0) return             if (! res.reachedMinLedger)  {
               saveBatchToCouchDb(res.results, function(err, saveRes)  {
                     if (err)  {
                        winston.error("problem saving ledger batch:", err);
                        winston.info("trying again in a few seconds...");
                        opts.results = [];
                        setTimeout(function()  {
                              startImporting(opts, callback);
                           }, 
                           3000);
                        return ;
                     }
                     if (! opts.live && opts.checkDB && saveRes.numLedgersSaved < config.batchSize)  {
                        checkDB( {
                              checkDB:true, 
                              lastLedger:saveRes.earliestLedgerIndex + saveRes.numLedgersSaved                           }
                        );
                     }
                      else  {
                        setImmediate(function()  {
                              startImporting(opts, callback);
                           }
                        );
                     }
                  }
               );
            }
             else  {
               saveBatchToCouchDb(res.results, function(err, saveRes)  {
                     if (err)  {
                        winston.error("problem saving ledger batch:", err);
                        winston.info("trying again in a few seconds...");
                        opts.results = [];
                        setTimeout(function()  {
                              startImporting(opts, callback);
                           }, 
                           3000);
                        return ;
                     }
                     if (opts.live && ! saveRes.numLedgersSaved)  {
                        setTimeout(function()  {
                              startImporting( {
                                    minLedgerIndex:opts.startLedger + 1, 
                                    live:true                                 }, 
                                 callback);
                           }, 
                           3000);
                        return ;
                     }
                     if (saveRes.earliestLedgerIndex == config.startIndex)  {
                        callback(null,  {
                              message:"Reached first ledger"                           }
                        );
                        return ;
                     }
                     db.fetch( {
                           keys:[addLeadingZeros(saveRes.earliestLedgerIndex - 1), addLeadingZeros(saveRes.earliestLedgerIndex), addLeadingZeros(saveRes.earliestLedgerIndex + saveRes.numLedgersSaved), addLeadingZeros(saveRes.earliestLedgerIndex + saveRes.numLedgersSaved + 1)]                        }, 
                        function(err, res)  {
                           if (err)  {
                              winston.error(err);
                              winston.info("problem determining whether hash chain is complete, trying this batch again...");
                              return setImmediate(function()  {
                                    startImporting(opts, callback);
                                 }
                              );
                           }
                           if (! res || ! res.rows || res.rows.length === 0 || ! res.rows[0].doc || res.rows[0].doc.ledger_hash !== res.rows[1].doc.parent_hash)  {
                              info = "The parent_hash of the earliest ledger saved in this batch " + "(ledger_index: " + saveRes.earliestLedgerIndex + ") " + "did not match the ledger_hash of the ledger before it in the database. ";
                              if (opts.live)  {
                                 if (DEBUG) winston.info(info)                                 return setImmediate(function()  {
                                       startImporting( {
                                             minLedgerIndex:saveRes.earliestLedgerIndex - 10, 
                                             live:true                                          }, 
                                          callback);
                                    }
                                 );
                              }
                               else  {
                                 return callback( {
                                       error:info, 
                                       type:"parentHash", 
                                       index:saveRes.earliestLedgerIndex + saveRes.numLedgersSaved + 1                                    }
                                 );
                              }
                           }
                           if (! res.rows[2].error && ! res.rows[3].error && res.rows[2].doc.ledger_hash !== res.rows[3].doc.parent_hash)  {
                              info = "The ledger_hash of the last ledger saved in this batch " + "(ledger_index: " + saveRes.earliestLedgerIndex + saveRes.numLedgersSaved + ") " + "did not match the parent_hash of the ledger after them in the database. ";
                              if (opts.live)  {
                                 return setImmediate(function()  {
                                       startImporting( {
                                             minLedgerIndex:opts.minLedgerIndex, 
                                             live:true                                          }, 
                                          callback);
                                    }
                                 );
                              }
                              return callback( {
                                    error:info, 
                                    type:"parentHash", 
                                    index:saveRes.earliestLedgerIndex - 10                                 }
                              );
                           }
                           var index = saveRes.earliestLedgerIndex + saveRes.numLedgersSaved;
                           if (opts.live)  {
                              setTimeout(function()  {
                                    startImporting( {
                                          minLedgerIndex:opts.startLedger, 
                                          live:true                                       }, 
                                       callback);
                                 }, 
                                 2000);
                           }
                            else  {
                              callback(null,  {
                                    message:"Reached min ledger"                                 }
                              );
                           }
                        }
                     );
                  }
               );
            }
         }
      );
   }
;
   function getLedgerBatch(opts, callback)  {
      if (typeof opts === "function")  {
         callback = opts;
         opts =  {} ;
      }
      if (! opts.lastLedger)  {
         opts.lastLedger = null;
      }
      var batchSize = config.batchSize || 1000;
      if (! opts.results)  {
         opts.results = [];
      }
      getLedger( {
            identifier:opts.lastLedger         }, 
         function(err, ledger)  {
            if (err)  {
               callback( {
                     error:err, 
                     retry:true                  }
               );
               return ;
            }
            if (! opts.startLedger)  {
               opts.startLedger = ledger.ledger_index;
            }
            if (opts.minLedgerIndex < config.startIndex)  {
               callback( {
                     message:"minLedger index is outside required range", 
                     retry:false                  }
               );
               return ;
            }
            opts.results.push(ledger);
            if (typeof ledger.ledger_index === "number")  {
               opts.lastLedger = ledger.ledger_index - 1;
            }
             else  {
               callback( {
                     error:"Malformed ledger: " + JSON.stringify(ledger), 
                     retry:true                  }
               );
            }
            opts.prevLedgerIndex = ledger.ledger_index;
            var reachedMinLedger = opts.minLedgerIndex && opts.minLedgerIndex >= ledger.ledger_index || opts.minLedgerHash === ledger.ledger_hash;
            if (opts.results.length >= batchSize || reachedMinLedger)  {
               callback(null,  {
                     results:opts.results.slice(), 
                     reachedMinLedger:reachedMinLedger                  }
               );
               opts.results = [];
               if (reachedMinLedger && DEBUG && ! opts.live) winston.info("Reached Min Ledger: " + ledger.ledger_index)            }
             else  {
               setImmediate(function()  {
                     getLedgerBatch(opts, callback);
                  }
               );
            }
         }
      );
   }
;
   function getLedger(opts, callback)  {
      var identifier = opts.identifier, prevLedgerIndex = opts.prevLedgerIndex, servers = opts.servers;
      if (typeof identifier === "function" && ! callback)  {
         callback = identifier;
         identifier = null;
      }
      var reqData =  {
         method:"ledger", 
         params:[ {
            transactions:true, 
            expand:true         }
]      }
;
      if (typeof identifier === "number")  {
         reqData.params[0].ledger_index = identifier;
      }
       else  {
         reqData.params[0].ledger_index = "closed";
      }
      if (! servers)  {
         servers = _.map(config.rippleds, function(serv)  {
               return  {
                  server:serv, 
                  attempt:0               }
;
            }
         );
      }
      var serverEntry = _.min(servers, function(serv)  {
            return serv.attempt;
         }
      ), server = serverEntry.server;
      if (serverEntry.attempt >= 2)  {
         callback("ledger " + reqData.params[0].ledger_index || reqData.params[0].ledger_hash + " not available from any of the rippleds");
         return ;
      }
      if (DEBUG > 2)  {
         winston.info("Getting ledger " + identifier + " from server: " + server);
      }
      request( {
            url:server, 
            method:"POST", 
            json:reqData, 
            timeout:10000         }, 
         requestHandler);
      function requestHandler(err, res)  {
         if (err)  {
            var id = reqData.params[0].ledger_index || reqData.params[0].ledger_hash || "'CLOSED'";
            if (DEBUG > 2) winston.error("error getting ledger: " + id + " from server: " + server + " err: " + JSON.stringify(err) + "
Trying next server...")            _.find(servers, function(serv)  {
                  return serv.server === server;
               }
            ).attempt++;
            setImmediate(function()  {
                  getLedger( {
                        identifier:identifier, 
                        servers:servers                     }, 
                     callback);
               }
            );
            return ;
         }
         if (typeof res.body === "string" || res.body.constructor.name === "Buffer")  {
            _.find(servers, function(serv)  {
                  return serv.server === server;
               }
            ).attempt++;
            setTimeout(function()  {
                  getLedger( {
                        identifier:identifier, 
                        servers:servers                     }, 
                     callback);
               }, 
               1000);
            return ;
         }
         if (res.body.result.error === "ledgerNotFound")  {
            if (DEBUG) winston.error("Ledger not found.")            _.find(servers, function(serv)  {
                  return serv.server === server;
               }
            ).attempt++;
            setImmediate(function()  {
                  getLedger( {
                        identifier:identifier, 
                        prevLedgerIndex:prevLedgerIndex, 
                        servers:servers                     }, 
                     callback);
               }
            );
            return ;
         }
         if (! res || ! res.body || ! res.body.result || ! res.body.result.ledger && ! res.body.result.closed)  {
            if (DEBUG && res.body) winston.error("error getting ledger: " + JSON.stringify(res.body))             else if (DEBUG && res) winston.error("error getting ledger:", res)            _.find(servers, function(serv)  {
                  return serv.server === server;
               }
            ).attempt++;
            setImmediate(function()  {
                  getLedger( {
                        identifier:identifier, 
                        prevLedgerIndex:prevLedgerIndex, 
                        servers:servers                     }, 
                     callback);
               }
            );
            return ;
         }
         var remoteLedger = res.body.result.closed ? res.body.result.closed.ledger : res.body.result.ledger, ledger = formatRemoteLedger(remoteLedger);
         if (! ledger || ! ledger.ledger_index || ! ledger.ledger_hash)  {
            winston.info("got malformed ledger from " + server === "http://0.0.0.0:51234" ? "http://ct.ripple.com:51234" : server + ": " + JSON.stringify(ledger));
            _.find(servers, function(serv)  {
                  return serv.server === server;
               }
            ).attempt++;
            setImmediate(function()  {
                  getLedger( {
                        identifier:identifier, 
                        prevLedgerIndex:prevLedgerIndex, 
                        servers:servers                     }, 
                     callback);
               }
            );
            return ;
         }
         ledger.server = server === "http://0.0.0.0:51234" ? "http://ct.ripple.com:51234" : server;
         var ledgerJsonTxHash;
         try {
            ledgerJsonTxHash = Ledger.from_json(ledger).calc_tx_hash().to_hex();
         }
         catch (err) {
            winston.error("Error calculating transaction hash: " + ledger.ledger_index + " " + err);
            ledgerJsonTxHash = "";
         }
         if (ledgerJsonTxHash && ledgerJsonTxHash !== ledger.transaction_hash)  {
            winston.info("transactions do not hash to the expected value for " + "ledger_index: " + ledger.ledger_index + "
" + "ledger_hash: " + ledger.ledger_hash + "
" + "actual transaction_hash:   " + ledgerJsonTxHash + "
" + "expected transaction_hash: " + ledger.transaction_hash);
            _.find(servers, function(serv)  {
                  return serv.server === server;
               }
            ).attempt++;
            setImmediate(function()  {
                  getLedger( {
                        identifier:identifier, 
                        prevLedgerIndex:prevLedgerIndex, 
                        servers:servers                     }, 
                     callback);
               }
            );
            return ;
         }
         if (DEBUG > 2) winston.info("Got ledger: " + ledger.ledger_index)         callback(null, ledger);
      }
;
   }
;
   function formatRemoteLedger(ledger)  {
      ledger.close_time_rpepoch = ledger.close_time;
      ledger.close_time_timestamp = ripple.utils.toTimestamp(ledger.close_time);
      ledger.close_time_human = moment(ripple.utils.toTimestamp(ledger.close_time)).utc().format("YYYY-MM-DD HH:mm:ss Z");
      ledger.from_rippled_api = true;
      delete ledger.close_time;
      delete ledger.hash;
      delete ledger.accepted;
      delete ledger.totalCoins;
      delete ledger.closed;
      delete ledger.seqNum;
      ledger.ledger_index = parseInt(ledger.ledger_index, 10);
      ledger.total_coins = parseInt(ledger.total_coins, 10);
      ledger.transactions.forEach(function(transaction)  {
            if (! transaction.metaData)  {
               winston.info("transaction in ledger: " + ledger.ledger_index + " does not have metaData");
               return ;
            }
            transaction.metaData.AffectedNodes.forEach(function(affNode)  {
                  var node = affNode.CreatedNode || affNode.ModifiedNode || affNode.DeletedNode;
                  if (node.LedgerEntryType !== "Offer")  {
                     return ;
                  }
                  var fields = node.FinalFields || node.NewFields;
                  if (typeof fields.BookDirectory === "string")  {
                     node.exchange_rate = ripple.Amount.from_quality(fields.BookDirectory).to_json().value;
                  }
               }
            );
         }
      );
      return ledger;
   }
;
   function getLatestLedgerSaved(callback)  {
      db.list( {
            descending:true, 
            startkey:"_c", 
            limit:20         }, 
         function(err, res)  {
            if (err)  {
               callback(err);
               return ;
            }
            if (! res.rows.length) return callback(null,  {
                  index:null, 
                  hash:null               }
            )            var latestIndex = _.find(res.rows, function(row)  {
                  try {
                     return row.id.length === 10 && parseInt(row.id, 10) > config.startIndex;
                  }
                  catch (e) {
                     return false;
                  }
               }
            ).id;
            db.get(latestIndex, function(err, res)  {
                  if (err)  {
                     callback(err);
                     return ;
                  }
                  callback(null,  {
                        hash:res.ledger_hash, 
                        index:res.ledger_index                     }
                  );
               }
            );
         }
      );
   }
;
   function addLeadingZeros(number, digits)  {
      if (! digits) digits = 10      var numStr = String(number);
      while (numStr.length < digits)  {
            numStr = "0" + numStr;
         }
      return numStr;
   }
;
   function saveBatchToCouchDb(ledgerBatch, callback)  {
      var d = Date.now();
      ledgerBatch.sort(function(a, b)  {
            return a.ledger_index - b.ledger_index;
         }
      );
      _.each(ledgerBatch, function(ledger)  {
            ledger._id = addLeadingZeros(ledger.ledger_index);
         }
      );
      var firstLedger = Math.min(ledgerBatch[0].ledger_index, ledgerBatch[ledgerBatch.length - 1].ledger_index), lastLedger = Math.max(ledgerBatch[0].ledger_index, ledgerBatch[ledgerBatch.length - 1].ledger_index);
      db.fetch( {
            keys:_.map(_.range(firstLedger, lastLedger + 1), function(num)  {
                  return addLeadingZeros(num, 10);
               }
            )         }, 
         function(err, res)  {
            if (err)  {
               callback(err);
               return ;
            }
            _.each(res.rows, function(row)  {
                  var index = _.findIndex(ledgerBatch, function(ledger)  {
                        return row.id === ledger._id;
                     }
                  );
                  if (row.error)  {
                     return ;
                  }
                  ledgerBatch[index]._rev = row.value.rev;
                  var diffRes = diff(ledgerBatch[index], row.doc);
                  if (! diffRes || diffRes.length === 1 && diffRes[0].path[0] === "server")  {
                     ledgerBatch[index].noUpdate = true;
                  }
                   else  {
                     if (DEBUG > 2) winston.info("Replacing ledger " + row.doc.ledger_index + "
   Previous: " + JSON.stringify(row.doc) + "
   Replacement: " + JSON.stringify(ledgerBatch[index]))                      else if (DEBUG) winston.info("Replacing ledger " + row.doc.ledger_index)                  }
               }
            );
            var docs = _.filter(ledgerBatch, function(ledger)  {
                  return ! ledger.noUpdate;
               }
            );
            if (docs.length === 0)  {
               if (DEBUG > 1) winston.info("Saved 0 ledgers from " + firstLedger + " to " + lastLedger + " to CouchDB (" + moment().format("YYYY-MM-DD HH:mm:ss Z") + ")")               callback(null,  {
                     numLedgersSaved:0, 
                     earliestLedgerIndex:ledgerBatch[0].ledger_index                  }
               );
               return ;
            }
            db.bulk( {
                  docs:docs               }, 
               function(err)  {
                  if (err)  {
                     callback(err);
                     return ;
                  }
                  if (DEBUG)  {
                     var info;
                     if (docs.length == 1) info = "Saved ledger: " + firstLedger + " to CouchDB"                      else info = "Saved " + docs.length + " ledgers from " + firstLedger + " to " + lastLedger + " to CouchDB"                     d = Date.now() - d / 1000;
                     winston.info(info + " in " + d + "s. (" + moment().format() + ")");
                  }
                  indexer.pingCouchDB();
                  callback(null,  {
                        numLedgersSaved:docs.length, 
                        earliestLedgerIndex:ledgerBatch[0].ledger_index                     }
                  );
               }
            );
         }
      );
   }
;
}
;
