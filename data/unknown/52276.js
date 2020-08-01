! ✖ / env;
node;
var colors = require("colors");
var Step = require("step");
var bar = require("progress-bar");
var bitcoin = require("..");
var logger = require("../lib/logger");
var Util = require("../lib/util");
var BlockExplorer = require("../lib/websource/blockexplorer").BlockExplorer;
var createNode = require("./init").createNode;
var VerificationError = require("../lib/error").VerificationError;
logger.disable();
var node = createNode();
var blockChain = node.getBlockChain();
var blockExplorer = new BlockExplorer();
blockChain.on("initComplete", function()  {
      var topBlock = blockChain.getTopBlock();
      var stats =  {
         total:0, 
         match:0, 
         mismatch:0, 
         error:0      }
;
      Step(function()  {
            var localHeight = "" + topBlock.height;
            var localHash = "" + Util.encodeHex(new Buffer(topBlock.hash).reverse());
            console.log("");
            console.log("» Checking top block hash".bold);
            console.log("");
            console.log("  Local top block".bold);
            console.log("  Height:         " + localHeight.grey);
            console.log("  Hash:           " + localHash.grey);
            console.log("");
            this(null);
         }, 
         function()  {
            var callback = this;
            blockExplorer.getHashByCount(topBlock.height, function(err, hash)  {
                  var text = "  Block Explorer: ";
                  if (err)  {
                     stats.error++;
                     console.log(text + "ERROR ✗".yellow);
                  }
                   else  {
                     var hashText = Util.encodeHex(new Buffer(hash).reverse());
                     if (hash.compare(topBlock.hash) == 0)  {
                        hashText = " ✓";
                        hashText = hashText.green;
                        stats.match++;
                     }
                      else  {
                        hashText = " ✗";
                        hashText = hashText.red;
                        stats.mismatch++;
                     }
                     stats.total++;
                     console.log(text + hashText);
                  }
                  callback(null);
               }
            );
         }, 
         function()  {
            console.log("");
            var result = "";
            if (stats.match == stats.total)  {
               result = "✓ OK".green.bold;
            }
             else if (stats.mismatch)  {
               result = "✗ NOT OK".red.bold;
            }
             else  {
               result = "✗ WARNING".yellow.bold;
            }
            if (stats.error)  {
               var tmp = " " + stats.error + " failed;";
               result = tmp.grey;
            }
            result = " " + stats.match + "/" + stats.total + " matching";
            console.log("  " + result);
            console.log("");
            this(null);
         }, 
         function()  {
            var callback = this;
            var genesisBlock = blockChain.getGenesisBlock();
            console.log("» Verifying block chain integrity".bold);
            console.log("");
            console.log("  Depending on block chain size, this may take a while!");
            console.log("");
            var progress = bar.create(process.stdout);
            progress.width = 60;
            var processed = 0;
            var totalBlocks = topBlock.height + 1;
            var chunkSize = 200;
            function updateProgress()  {
               var format = "  $bar; ";
               format = "$percentage;% ".bold;
               format = "(" + processed + "/" + totalBlocks + ")".grey;
               progress.format = format;
               progress.update(processed / totalBlocks);
            }
;
            ;
            function verifyChunk(num)  {
               node.storage.Block.find( {
                     height: {
                        $gte:num * chunkSize, 
                        $lt:Math.min(num + 1 * chunkSize, topBlock.height + 1)                     }} , function(err, blocks)  {
                     try {
                        if (err)  {
                           throw err;
                        }
                        var isLast = + blocks[blocks.length - 1].height == + topBlock.height;
                        if (isLast && blocks.length !== topBlock.height + 1 % chunkSize)  {
                           throw new VerificationError("Blocks missing");
                        }
                         else if (! isLast && blocks.length !== chunkSize)  {
                           throw new VerificationError("Blocks missing");
                        }
                     }
                     catch (err) {
                        callback(err);
                        return ;
                     }
                     Step(function()  {
                           for (var i = 0, l = blocks.length; i < l; i++)  {
                                 verifyBlock(blocks[i], this.parallel());
                              }
                        }, 
                        function(err)  {
                           if (err)  {
                              callback(err);
                              return ;
                           }
                           processed = blocks.length;
                           updateProgress();
                           if (! isLast)  {
                              process.nextTick(verifyChunk.bind(this, num + 1));
                           }
                            else  {
                              callback(null);
                           }
                        }
                     );
                  }
               );
            }
;
            ;
            function verifyBlock(block, callback)  {
               node.storage.Transaction.find( {
                     _id: {
                        $in:block.txs                     }} , function(err, txs)  {
                     if (err)  {
                        callback(err);
                        return ;
                     }
                     try {
                        block.checkBlock();
                        callback(null);
                     }
                     catch (err) {
                        callback(err);
                     }
                  }
               );
            }
;
            ;
            updateProgress();
            verifyChunk(0);
         }, 
         function(err)  {
            console.log("");
            console.log("");
            var fail = false;
            var message = "";
            if (err && err.name == "VerificationError")  {
               fail = true;
               message = " - " + err.message;
            }
             else if (err)  {
               console.log(err.stack ? err.stack : err.toString());
               process.exit(0);
            }
            var result = "";
            if (! fail)  {
               result = "✓ OK".green.bold;
            }
             else  {
               result = "✗ NOT OK".red.bold;
               result = message;
            }
            console.log("  " + result);
            console.log("");
            process.exit(0);
         }
      );
   }
);
blockChain.init();
