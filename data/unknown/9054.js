! ✖ / env;
node;
var Promise = require("bluebird");
var events = require("events");
var stream = require("stream");
var path = require("path");
var fs = require("fs");
var net = require("net");
var byline = require("byline");
var util = require("util");
var readline = require("readline");
var sprintf = require("sprintf").sprintf;
var utf8 = require("utf8");
var wrench = require("wrench");
var yaml = require("yamljs");
var optTargetHost = "127.0.0.1";
var optTargetPort = 9091;
var optHttpPort = 9092;
var optJsonProxyPort = 9093;
var optJsonProxy = false;
var optSourceSearchDirs = ["../ecmascript-testcases"];
var optDumpDebugRead = null;
var optDumpDebugWrite = null;
var optDumpDebugPretty = null;
var optLogMessages = false;
var UI_MESSAGE_CLIPLEN = 128;
var LOCALS_CLIPLEN = 64;
var EVAL_CLIPLEN = 4096;
var GETVAR_CLIPLEN = 4096;
var CMD_STATUS = 1;
var CMD_PRINT = 2;
var CMD_ALERT = 3;
var CMD_LOG = 4;
var CMD_BASICINFO = 16;
var CMD_TRIGGERSTATUS = 17;
var CMD_PAUSE = 18;
var CMD_RESUME = 19;
var CMD_STEPINTO = 20;
var CMD_STEPOVER = 21;
var CMD_STEPOUT = 22;
var CMD_LISTBREAK = 23;
var CMD_ADDBREAK = 24;
var CMD_DELBREAK = 25;
var CMD_GETVAR = 26;
var CMD_PUTVAR = 27;
var CMD_GETCALLSTACK = 28;
var CMD_GETLOCALS = 29;
var CMD_EVAL = 30;
var CMD_DETACH = 31;
var CMD_DUMPHEAP = 32;
var CMD_GETBYTECODE = 33;
var ERR_UNKNOWN = 0;
var ERR_UNSUPPORTED = 1;
var ERR_TOOMANY = 2;
var ERR_NOTFOUND = 3;
var DVAL_EOM =  {
   type:"eom"}
;
var DVAL_REQ =  {
   type:"req"}
;
var DVAL_REP =  {
   type:"rep"}
;
var DVAL_ERR =  {
   type:"err"}
;
var DVAL_NFY =  {
   type:"nfy"}
;
var debugCommandNames = yaml.load("duk_debugcommands.yaml");
var debugCommandNumbers =  {} ;
debugCommandNames.forEach(function(k, i)  {
      debugCommandNumbers[k] = i;
   }
);
var DUK_HTYPE_STRING = 1;
var DUK_HTYPE_OBJECT = 2;
var DUK_HTYPE_BUFFER = 3;
var dukClassNames = yaml.load("duk_classnames.yaml");
var dukOpcodes = yaml.load("duk_opcodes.yaml");
if (dukOpcodes.opcodes.length != 64)  {
   throw new Error("opcode metadata length incorrect");
}
if (dukOpcodes.extra.length != 256)  {
   throw new Error("extraop metadata length incorrect");
}
var nybbles = "0123456789abcdef";
function bufferToDebugString(buf)  {
   var cp = [];
   var i, n;
   for (i = 0, n = buf.length; i < n; i++)  {
         cp[i] = String.fromCharCode(buf[i]);
      }
   return cp.join("");
}
;
function writeDebugStringToBuffer(str, buf, off)  {
   var i, n;
   for (i = 0, n = str.length; i < n; i++)  {
         buf[off + i] = str.charCodeAt(i) & 255;
      }
}
;
function stringToDebugString(str)  {
   return utf8.encode(str);
}
;
function prettyDebugValue(x)  {
   if (typeof x === "object" && x !== null)  {
      if (x.type === "eom")  {
         return "EOM";
      }
       else if (x.type === "req")  {
         return "REQ";
      }
       else if (x.type === "rep")  {
         return "REP";
      }
       else if (x.type === "err")  {
         return "ERR";
      }
       else if (x.type === "nfy")  {
         return "NFY";
      }
   }
   return JSON.stringify(x);
}
;
function prettyUiNumber(x)  {
   if (x === 1 / 0)  {
      return "Infinity";
   }
   if (x === - 1 / 0)  {
      return "-Infinity";
   }
   if (Number.isNaN(x))  {
      return "NaN";
   }
   if (x === 0 && 1 / x > 0)  {
      return "0";
   }
   if (x === 0 && 1 / x < 0)  {
      return "-0";
   }
   return x.toString();
}
;
function prettyUiString(x, cliplen)  {
   var ret;
   if (typeof x !== "string")  {
      throw new Error("invalid input to prettyUiString: " + typeof x);
   }
   try {
      ret = JSON.stringify(utf8.decode(x));
   }
   catch (e) {
      ret = "r"" + x.replace(/[\u0022\u0027\u0000-\u001f\u0080-\uffff]/g, function(match)  {
            var cp = match.charCodeAt(0);
            return "\x" + nybbles[cp >> 4 & 15] + nybbles[cp & 15];
         }
      ) + """;
   }
   if (cliplen && ret.length > cliplen)  {
      ret = ret.substring(0, cliplen) + "...";
   }
   return ret;
}
;
function prettyUiStringUnquoted(x, cliplen)  {
   var ret;
   if (typeof x !== "string")  {
      throw new Error("invalid input to prettyUiStringUnquoted: " + typeof x);
   }
   try {
      ret = utf8.decode(x);
   }
   catch (e) {
      ret = x.replace(/[\u0000-\u001f\u0080-\uffff]/g, function(match)  {
            var cp = match.charCodeAt(0);
            return "\x" + nybbles[cp >> 4 & 15] + nybbles[cp & 15];
         }
      );
   }
   if (cliplen && ret.length > cliplen)  {
      ret = ret.substring(0, cliplen) + "...";
   }
   return ret;
}
;
function prettyUiDebugValue(x, cliplen)  {
   if (typeof x === "object" && x !== null)  {
      if (x.type === "eom")  {
         return "EOM";
      }
       else if (x.type === "req")  {
         return "REQ";
      }
       else if (x.type === "rep")  {
         return "REP";
      }
       else if (x.type === "err")  {
         return "ERR";
      }
       else if (x.type === "nfy")  {
         return "NFY";
      }
       else if (x.type === "unused")  {
         return "unused";
      }
       else if (x.type === "undefined")  {
         return "undefined";
      }
       else if (x.type === "buffer")  {
         return "|" + x.data + "|";
      }
       else if (x.type === "object")  {
         return "[object " + dukClassNames[x.class] || "class " + x.class + " " + x.pointer + "]";
      }
       else if (x.type === "pointer")  {
         return "<pointer " + x.pointer + ">";
      }
       else if (x.type === "lightfunc")  {
         return "<lightfunc 0x" + x.flags.toString(16) + " " + x.pointer + ">";
      }
       else if (x.type === "number")  {
         var tmp = new Buffer(x.data, "hex");
         var val = tmp.readDoubleBE(0);
         return prettyUiNumber(val);
      }
   }
    else if (x === null)  {
      return "null";
   }
    else if (typeof x === "boolean")  {
      return x ? "true" : "false";
   }
    else if (typeof x === "string")  {
      return prettyUiString(x, cliplen);
   }
    else if (typeof x === "number")  {
      return prettyUiNumber(x);
   }
   return JSON.stringify(x);
}
;
function prettyDebugMessage(msg)  {
   return msg.map(prettyDebugValue).join(" ");
}
;
function prettyDebugCommand(cmd)  {
   return debugCommandNames[cmd] || String(cmd);
}
;
function decodeAndNormalizeSource(data)  {
   var tmp;
   var lines, line, repl;
   var i, n;
   var j, m;
   try {
      tmp = data.toString("utf8");
   }
   catch (e) {
      console.log("Failed to UTF-8 decode source file, ignoring: " + e);
      tmp = String(data);
   }
   lines = tmp.split(/\r?\n/);
   for (i = 0, n = lines.length; i < n; i++)  {
         line = lines[i];
         if (/\t/.test(line))  {
            repl = "";
            for (j = 0, m = line.length; j < m; j++)  {
                  if (line.charAt(j) === "	")  {
                     repl = " ";
                     while (repl.length % 8 != 0)  {
                           repl = " ";
                        }
                  }
                   else  {
                     repl = line.charAt(j);
                  }
               }
            lines[i] = repl;
         }
      }
   return lines.join("
");
}
;
function RateLimited(tokens, rate, cb)  {
   var _this = this;
   this.maxTokens = tokens;
   this.tokens = this.maxTokens;
   this.rate = rate;
   this.cb = cb;
   this.delayedCb = false;
   this.tokenAdder = setInterval(function()  {
         if (_this.tokens < _this.maxTokens)  {
            _this.tokens++;
         }
         if (_this.delayedCb)  {
            _this.delayedCb = false;
            _this.tokens--;
            _this.cb();
         }
      }, 
      this.rate);
}
;
RateLimited.prototype.trigger = function()  {
   if (this.tokens > 0)  {
      this.tokens--;
      this.cb();
   }
    else  {
      this.delayedCb = true;
   }
}
;
function SourceFileManager(directories)  {
   this.directories = directories;
   this.extensions =  {
      .js:true, 
      .jsm:true   }
;
   this.files;
}
;
SourceFileManager.prototype.scan = function()  {
   var _this = this;
   var fileMap =  {} ;
   var files;
   this.directories.forEach(function(dir)  {
         console.log("Scanning source files: " + dir);
         try {
            wrench.readdirSyncRecursive(dir).forEach(function(fn)  {
                  var absFn = path.normalize(path.join(dir, fn));
                  var ent;
                  if (fs.existsSync(absFn) && fs.lstatSync(absFn).isFile() && _this.extensions[path.extname(fn)])  {
                     fileMap[fn] = true;
                  }
               }
            );
         }
         catch (e) {
            console.log("Failed to scan " + dir + ": " + e);
         }
      }
   );
   files = Object.keys(fileMap);
   files.sort();
   this.files = files;
   console.log("Found " + files.length + " source files in " + this.directories.length + " search directories");
}
;
SourceFileManager.prototype.getFiles = function()  {
   return this.files;
}
;
SourceFileManager.prototype.search = function(fileName)  {
   var _this = this;
   function tryLookup()  {
      var i, fn, data;
      for (i = 0; i < _this.directories.length; i++)  {
            fn = path.join(_this.directories[i], fileName);
            if (fs.existsSync(fn) && fs.lstatSync(fn).isFile())  {
               data = fs.readFileSync(fn);
               return decodeAndNormalizeSource(data);
            }
         }
      return null;
   }
;
   return tryLookup(fileName);
}
;
function DebugProtocolParser(inputStream, protocolVersion, rawDumpFileName, textDumpFileName, textDumpFilePrefix, hexDumpConsolePrefix, textDumpConsolePrefix)  {
   var _this = this;
   this.inputStream = inputStream;
   this.closed = false;
   this.bytes = 0;
   this.dvalues = 0;
   this.messages = 0;
   this.requests = 0;
   this.prevBytes = 0;
   this.bytesPerSec = 0;
   this.statsTimer = null;
   this.readableNumberValue = true;
   events.EventEmitter.call(this);
   var buf = new Buffer(0);
   var msg = [];
   var versionIdentification;
   var statsInterval = 2000;
   var statsIntervalSec = statsInterval / 1000;
   this.statsTimer = setInterval(function()  {
         _this.bytesPerSec = _this.bytes - _this.prevBytes / statsIntervalSec;
         _this.prevBytes = _this.bytes;
         _this.emit("stats-update");
      }, 
      statsInterval);
   function consume(n)  {
      var tmp = new Buffer(buf.length - n);
      buf.copy(tmp, 0, n);
      buf = tmp;
   }
;
   inputStream.on("data", function(data)  {
         var i, n, x, v, gotValue, len, t, tmpbuf, verstr;
         var prettyMsg;
         if (_this.closed || ! _this.inputStream)  {
            console.log("Ignoring incoming data from closed input stream, len " + data.length);
            return ;
         }
         _this.bytes = data.length;
         if (rawDumpFileName)  {
            fs.appendFileSync(rawDumpFileName, data);
         }
         if (hexDumpConsolePrefix)  {
            console.log(hexDumpConsolePrefix + data.toString("hex"));
         }
         buf = Buffer.concat([buf, data]);
         if (protocolVersion == null)  {
            if (buf.length > 1024)  {
               _this.emit("transport-error", "Parse error (version identification too long), dropping connection");
               _this.close();
               return ;
            }
            for (i = 0, n = buf.length; i < n; i++)  {
                  if (buf[i] == 10)  {
                     tmpbuf = new Buffer(i);
                     buf.copy(tmpbuf, 0, 0, i);
                     consume(i + 1);
                     verstr = tmpbuf.toString("utf-8");
                     t = verstr.split(" ");
                     protocolVersion = Number(t[0]);
                     versionIdentification = verstr;
                     _this.emit("protocol-version",  {
                           protocolVersion:protocolVersion, 
                           versionIdentification:versionIdentification                        }
                     );
                     break;
                  }
               }
            if (protocolVersion == null)  {
               return ;
            }
         }
         while (buf.length > 0)  {
               x = buf[0];
               v = undefined;
               gotValue = false;
               if (x >= 192)  {
                  if (buf.length >= 2)  {
                     v = x - 192 << 8 + buf[1];
                     consume(2);
                  }
               }
                else if (x >= 128)  {
                  v = x - 128;
                  consume(1);
               }
                else if (x >= 96)  {
                  len = x - 96;
                  if (buf.length >= 1 + len)  {
                     v = new Buffer(len);
                     buf.copy(v, 0, 1, 1 + len);
                     v = bufferToDebugString(v);
                     consume(1 + len);
                  }
               }
                else  {
                  switch(x) {
                     case 0:
 
                           v = DVAL_EOM;
                           consume(1);
                           break;
                        
                     case 1:
 
                           v = DVAL_REQ;
                           consume(1);
                           break;
                        
                     case 2:
 
                           v = DVAL_REP;
                           consume(1);
                           break;
                        
                     case 3:
 
                           v = DVAL_ERR;
                           consume(1);
                           break;
                        
                     case 4:
 
                           v = DVAL_NFY;
                           consume(1);
                           break;
                        
                     case 16:
 
                           if (buf.length >= 5)  {
                              v = buf.readInt32BE(1);
                              consume(5);
                           }
                           break;
                        
                     case 17:
 
                           if (buf.length >= 5)  {
                              len = buf.readUInt32BE(1);
                              if (buf.length >= 5 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 5, 5 + len);
                                 v = bufferToDebugString(v);
                                 consume(5 + len);
                              }
                           }
                           break;
                        
                     case 18:
 
                           if (buf.length >= 3)  {
                              len = buf.readUInt16BE(1);
                              if (buf.length >= 3 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 3, 3 + len);
                                 v = bufferToDebugString(v);
                                 consume(3 + len);
                              }
                           }
                           break;
                        
                     case 19:
 
                           if (buf.length >= 5)  {
                              len = buf.readUInt32BE(1);
                              if (buf.length >= 5 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 5, 5 + len);
                                 v =  {
                                    type:"buffer", 
                                    data:v.toString("hex")                                 }
;
                                 consume(5 + len);
                              }
                           }
                           break;
                        
                     case 20:
 
                           if (buf.length >= 3)  {
                              len = buf.readUInt16BE(1);
                              if (buf.length >= 3 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 3, 3 + len);
                                 v =  {
                                    type:"buffer", 
                                    data:v.toString("hex")                                 }
;
                                 consume(3 + len);
                              }
                           }
                           break;
                        
                     case 21:
 
                           v =  {
                              type:"unused"                           }
;
                           consume(1);
                           break;
                        
                     case 22:
 
                           v =  {
                              type:"undefined"                           }
;
                           gotValue = true;
                           consume(1);
                           break;
                        
                     case 23:
 
                           v = null;
                           gotValue = true;
                           consume(1);
                           break;
                        
                     case 24:
 
                           v = true;
                           consume(1);
                           break;
                        
                     case 25:
 
                           v = false;
                           consume(1);
                           break;
                        
                     case 26:
 
                           if (buf.length >= 9)  {
                              v = new Buffer(8);
                              buf.copy(v, 0, 1, 9);
                              v =  {
                                 type:"number", 
                                 data:v.toString("hex")                              }
;
                              if (_this.readableNumberValue)  {
                                 v._value = buf.readDoubleBE(1);
                              }
                              consume(9);
                           }
                           break;
                        
                     case 27:
 
                           if (buf.length >= 3)  {
                              len = buf[2];
                              if (buf.length >= 3 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 3, 3 + len);
                                 v =  {
                                    type:"object", 
                                    class:buf[1], 
                                    pointer:v.toString("hex")                                 }
;
                                 consume(3 + len);
                              }
                           }
                           break;
                        
                     case 28:
 
                           if (buf.length >= 2)  {
                              len = buf[1];
                              if (buf.length >= 2 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 2, 2 + len);
                                 v =  {
                                    type:"pointer", 
                                    pointer:v.toString("hex")                                 }
;
                                 consume(2 + len);
                              }
                           }
                           break;
                        
                     case 29:
 
                           if (buf.length >= 4)  {
                              len = buf[3];
                              if (buf.length >= 4 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 4, 4 + len);
                                 v =  {
                                    type:"lightfunc", 
                                    flags:buf.readUInt16BE(1), 
                                    pointer:v.toString("hex")                                 }
;
                                 consume(4 + len);
                              }
                           }
                           break;
                        
                     case 30:
 
                           if (buf.length >= 2)  {
                              len = buf[1];
                              if (buf.length >= 2 + len)  {
                                 v = new Buffer(len);
                                 buf.copy(v, 0, 2, 2 + len);
                                 v =  {
                                    type:"heapptr", 
                                    pointer:v.toString("hex")                                 }
;
                                 consume(2 + len);
                              }
                           }
                           break;
                        
                     default:
 
                           _this.emit("transport-error", "Parse error, dropping connection");
                           _this.close();
                        
}
;
               }
               if (typeof v === "undefined" && ! gotValue)  {
                  break;
               }
               msg.push(v);
               _this.dvalues++;
               if (v === DVAL_EOM)  {
                  _this.messages++;
                  if (textDumpFileName || textDumpConsolePrefix)  {
                     prettyMsg = prettyDebugMessage(msg);
                     if (textDumpFileName)  {
                        fs.appendFileSync(textDumpFileName, textDumpFilePrefix || "" + prettyMsg + "
");
                     }
                     if (textDumpConsolePrefix)  {
                        console.log(textDumpConsolePrefix + prettyMsg);
                     }
                  }
                  _this.emit("debug-message", msg);
                  msg = [];
               }
            }
      }
   );
   inputStream.on("error", function(err)  {
         _this.emit("transport-error", err);
         _this.close();
      }
   );
   inputStream.on("close", function()  {
         _this.close();
      }
   );
}
;
DebugProtocolParser.prototype = Object.create(events.EventEmitter.prototype);
DebugProtocolParser.prototype.close = function()  {
   if (this.closed)  {
      return ;
   }
   this.closed = true;
   if (this.statsTimer)  {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
   }
   this.emit("transport-close");
}
;
function formatDebugValue(v)  {
   var buf, dec, len;
   if (typeof v === "object" && v !== null)  {
      if (v.type === "eom")  {
         return new Buffer([0]);
      }
       else if (v.type === "req")  {
         return new Buffer([1]);
      }
       else if (v.type === "rep")  {
         return new Buffer([2]);
      }
       else if (v.type === "err")  {
         return new Buffer([3]);
      }
       else if (v.type === "nfy")  {
         return new Buffer([4]);
      }
       else if (v.type === "unused")  {
         return new Buffer([21]);
      }
       else if (v.type === "undefined")  {
         return new Buffer([22]);
      }
       else if (v.type === "number")  {
         dec = new Buffer(v.data, "hex");
         len = dec.length;
         if (len !== 8)  {
            throw new TypeError("value cannot be converted to dvalue: " + JSON.stringify(v));
         }
         buf = new Buffer(1 + len);
         buf[0] = 26;
         dec.copy(buf, 1);
         return buf;
      }
       else if (v.type === "buffer")  {
         dec = new Buffer(v.data, "hex");
         len = dec.length;
         if (len <= 65535)  {
            buf = new Buffer(3 + len);
            buf[0] = 20;
            buf[1] = len >> 8 & 255;
            buf[2] = len >> 0 & 255;
            dec.copy(buf, 3);
            return buf;
         }
          else  {
            buf = new Buffer(5 + len);
            buf[0] = 19;
            buf[1] = len >> 24 & 255;
            buf[2] = len >> 16 & 255;
            buf[3] = len >> 8 & 255;
            buf[4] = len >> 0 & 255;
            dec.copy(buf, 5);
            return buf;
         }
      }
       else if (v.type === "object")  {
         dec = new Buffer(v.pointer, "hex");
         len = dec.length;
         buf = new Buffer(3 + len);
         buf[0] = 27;
         buf[1] = v.class;
         buf[2] = len;
         dec.copy(buf, 3);
         return buf;
      }
       else if (v.type === "pointer")  {
         dec = new Buffer(v.pointer, "hex");
         len = dec.length;
         buf = new Buffer(2 + len);
         buf[0] = 28;
         buf[1] = len;
         dec.copy(buf, 2);
         return buf;
      }
       else if (v.type === "lightfunc")  {
         dec = new Buffer(v.pointer, "hex");
         len = dec.length;
         buf = new Buffer(4 + len);
         buf[0] = 29;
         buf[1] = v.flags >> 8 & 255;
         buf[2] = v.flags & 255;
         buf[3] = len;
         dec.copy(buf, 4);
         return buf;
      }
       else if (v.type === "heapptr")  {
         dec = new Buffer(v.pointer, "hex");
         len = dec.length;
         buf = new Buffer(2 + len);
         buf[0] = 30;
         buf[1] = len;
         dec.copy(buf, 2);
         return buf;
      }
   }
    else if (v === null)  {
      return new Buffer([23]);
   }
    else if (typeof v === "boolean")  {
      return new Buffer([v ? 24 : 25]);
   }
    else if (typeof v === "number")  {
      if (Math.floor(v) === v && v !== 0 || 1 / v > 0 && v >= - 2147483648 && v <= 2147483647)  {
         if (v >= 0 && v <= 63)  {
            return new Buffer([128 + v]);
         }
          else if (v >= 0 && v <= 16383)  {
            return new Buffer([192 + v >> 8, v & 255]);
         }
          else if (v >= - 2147483648 && v <= 2147483647)  {
            return new Buffer([16, v >> 24 & 255, v >> 16 & 255, v >> 8 & 255, v >> 0 & 255]);
         }
          else  {
            throw new Error("internal error when encoding integer to dvalue: " + v);
         }
      }
       else  {
         buf = new Buffer(1 + 8);
         buf[0] = 26;
         buf.writeDoubleBE(v, 1);
         return buf;
      }
   }
    else if (typeof v === "string")  {
      if (v.length < 0 || v.length > 4294967295)  {
         throw new TypeError("cannot convert to dvalue, invalid string length: " + v.length);
      }
      if (v.length <= 31)  {
         buf = new Buffer(1 + v.length);
         buf[0] = 96 + v.length;
         writeDebugStringToBuffer(v, buf, 1);
         return buf;
      }
       else if (v.length <= 65535)  {
         buf = new Buffer(3 + v.length);
         buf[0] = 18;
         buf[1] = v.length >> 8 & 255;
         buf[2] = v.length >> 0 & 255;
         writeDebugStringToBuffer(v, buf, 3);
         return buf;
      }
       else  {
         buf = new Buffer(5 + v.length);
         buf[0] = 17;
         buf[1] = v.length >> 24 & 255;
         buf[2] = v.length >> 16 & 255;
         buf[3] = v.length >> 8 & 255;
         buf[4] = v.length >> 0 & 255;
         writeDebugStringToBuffer(v, buf, 5);
         return buf;
      }
   }
   throw new TypeError("value cannot be converted to dvalue: " + JSON.stringify(v));
}
;
function Debugger()  {
   events.EventEmitter.call(this);
   this.web = null;
   this.targetStream = null;
   this.outputPassThroughStream = null;
   this.inputParser = null;
   this.outputParser = null;
   this.protocolVersion = null;
   this.dukVersion = null;
   this.dukGitDescribe = null;
   this.targetInfo = null;
   this.attached = false;
   this.handshook = false;
   this.reqQueue = null;
   this.stats =  {
      rxBytes:0, 
      rxDvalues:0, 
      rxMessages:0, 
      rxBytesPerSec:0, 
      txBytes:0, 
      txDvalues:0, 
      txMessages:0, 
      txBytesPerSec:0   }
;
   this.execStatus =  {
      attached:false, 
      state:"detached", 
      fileName:"", 
      funcName:"", 
      line:0, 
      pc:0   }
;
   this.breakpoints = [];
   this.callstack = [];
   this.locals = [];
   this.messageLines = [];
   this.messageScrollBack = 100;
}
;
Debugger.prototype = events.EventEmitter.prototype;
Debugger.prototype.decodeBytecodeFromBuffer = function(buf, consts, funcs)  {
   var i, j, n, m, ins, pc;
   var res = [];
   var op, str, args, comments;
   for (i = 0, n = buf.length; i < n; i = 4)  {
         pc = i / 4;
         if (this.endianness === "little")  {
            ins = buf.readInt32LE(i) >>> 0;
         }
          else  {
            ins = buf.readInt32BE(i) >>> 0;
         }
         op = dukOpcodes.opcodes[ins & 63];
         if (op.extra)  {
            op = dukOpcodes.extra[ins >> 6 & 255];
         }
         args = [];
         comments = [];
         if (op.args)  {
            for (j = 0, m = op.args.length; j < m; j++)  {
                  switch(op.args[j]) {
                     case "A_R":
 
                           args.push("r" + ins >>> 6 & 255);
                           break;
                        
                     case "A_RI":
 
                           args.push("r" + ins >>> 6 & 255 + "(indirect)");
                           break;
                        
                     case "A_C":
 
                           args.push("c" + ins >>> 6 & 255);
                           break;
                        
                     case "A_H":
 
                           args.push("0x" + ins >>> 6 & 255.toString(16));
                           break;
                        
                     case "A_I":
 
                           args.push(ins >>> 6 & 255.toString(10));
                           break;
                        
                     case "A_B":
 
                           args.push(ins >>> 6 & 255 ? "true" : "false");
                           break;
                        
                     case "B_RC":
 
                           args.push(ins & 1 << 22 ? "c" : "r" + ins >>> 14 & 255);
                           break;
                        
                     case "B_R":
 
                           args.push("r" + ins >>> 14 & 511);
                           break;
                        
                     case "B_RI":
 
                           args.push("r" + ins >>> 14 & 511 + "(indirect)");
                           break;
                        
                     case "B_C":
 
                           args.push("c" + ins >>> 14 & 511);
                           break;
                        
                     case "B_H":
 
                           args.push("0x" + ins >>> 14 & 511.toString(16));
                           break;
                        
                     case "B_I":
 
                           args.push(ins >>> 14 & 511.toString(10));
                           break;
                        
                     case "C_RC":
 
                           args.push(ins & 1 << 31 ? "c" : "r" + ins >>> 23 & 255);
                           break;
                        
                     case "C_R":
 
                           args.push("r" + ins >>> 23 & 511);
                           break;
                        
                     case "C_RI":
 
                           args.push("r" + ins >>> 23 & 511 + "(indirect)");
                           break;
                        
                     case "C_C":
 
                           args.push("c" + ins >>> 23 & 511);
                           break;
                        
                     case "C_H":
 
                           args.push("0x" + ins >>> 23 & 511.toString(16));
                           break;
                        
                     case "C_I":
 
                           args.push(ins >>> 23 & 511.toString(10));
                           break;
                        
                     case "BC_R":
 
                           args.push("r" + ins >>> 14 & 262143);
                           break;
                        
                     case "BC_C":
 
                           args.push("c" + ins >>> 14 & 262143);
                           break;
                        
                     case "BC_H":
 
                           args.push("0x" + ins >>> 14 & 262143.toString(16));
                           break;
                        
                     case "BC_I":
 
                           args.push(ins >>> 14 & 262143.toString(10));
                           break;
                        
                     case "ABC_H":
 
                           args.push(ins >>> 6 & 67108863.toString(16));
                           break;
                        
                     case "ABC_I":
 
                           args.push(ins >>> 6 & 67108863.toString(10));
                           break;
                        
                     case "BC_LDINT":
 
                           args.push(ins >>> 14 & 262143 - 1 << 17);
                           break;
                        
                     case "BC_LDINTX":
 
                           args.push(ins >>> 14 & 262143 - 0);
                           break;
                        
                     case "ABC_JUMP":
 
                            {
                              var pc_add = ins >>> 6 & 67108863 - 1 << 25 + 1;
                              var pc_dst = pc + pc_add;
                              args.push(pc_dst + " (" + pc_add >= 0 ? "+" : "" + pc_add + ")");
                              break;
                           }
;
                        
                     default:
 
                           args.push("?");
                           break;
                        
}
;
               }
         }
         if (op.flags)  {
            for (j = 0, m = op.flags.length; j < m; j++)  {
                  if (ins & op.flags[j].mask)  {
                     comments.push(op.flags[j].name);
                  }
               }
         }
         if (args.length > 0)  {
            str = sprintf("%05d %08x   %-10s %s", pc, ins, op.name, args.join(", "));
         }
          else  {
            str = sprintf("%05d %08x   %-10s", pc, ins, op.name);
         }
         if (comments.length > 0)  {
            str = sprintf("%-44s ; %s", str, comments.join(", "));
         }
         res.push( {
               str:str, 
               ins:ins            }
         );
      }
   return res;
}
;
Debugger.prototype.uiMessage = function(type, val)  {
   var msg;
   if (typeof type === "object")  {
      msg = type;
   }
    else if (typeof type === "string")  {
      msg =  {
         type:type, 
         message:val      }
;
   }
    else  {
      throw new TypeError("invalid ui message: " + type);
   }
   this.messageLines.push(msg);
   while (this.messageLines.length > this.messageScrollBack)  {
         this.messageLines.shift();
      }
   this.emit("ui-message-update");
}
;
Debugger.prototype.sendRequest = function(msg)  {
   var _this = this;
   return new Promise(function(resolve, reject)  {
         var dvals = [];
         var dval;
         var data;
         var i;
         if (! _this.attached || ! _this.handshook || ! _this.reqQueue || ! _this.targetStream)  {
            throw new Error("invalid state for sendRequest");
         }
         for (i = 0; i < msg.length; i++)  {
               try {
                  dval = formatDebugValue(msg[i]);
               }
               catch (e) {
                  console.log("Failed to format dvalue, dropping connection: " + e);
                  console.log(e.stack || e);
                  _this.targetStream.destroy();
                  throw new Error("failed to format dvalue");
               }
               dvals.push(dval);
            }
         data = Buffer.concat(dvals);
         _this.targetStream.write(data);
         _this.outputPassThroughStream.write(data);
         if (optLogMessages)  {
            console.log("Request " + prettyDebugCommand(msg[1]) + ": " + prettyDebugMessage(msg));
         }
         if (! _this.reqQueue)  {
            throw new Error("no reqQueue");
         }
         _this.reqQueue.push( {
               reqMsg:msg, 
               reqCmd:msg[1], 
               resolveCb:resolve, 
               rejectCb:reject            }
         );
      }
   );
}
;
Debugger.prototype.sendBasicInfoRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_BASICINFO, DVAL_EOM]).then(function(msg)  {
         _this.dukVersion = msg[1];
         _this.dukGitDescribe = msg[2];
         _this.targetInfo = msg[3];
         _this.endianness =  {
            :"little", 
            :"mixed", 
            :"big"         }
[msg[4]] || "unknown";
         _this.emit("basic-info-update");
         return msg;
      }
   );
}
;
Debugger.prototype.sendGetVarRequest = function(varname)  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_GETVAR, varname, DVAL_EOM]).then(function(msg)  {
         return  {
            found:msg[1] === 1, 
            value:msg[2]         }
;
      }
   );
}
;
Debugger.prototype.sendPutVarRequest = function(varname, varvalue)  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_PUTVAR, varname, varvalue, DVAL_EOM]);
}
;
Debugger.prototype.sendInvalidCommandTestRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, 3735928559, DVAL_EOM]);
}
;
Debugger.prototype.sendStatusRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_TRIGGERSTATUS, DVAL_EOM]);
}
;
Debugger.prototype.sendBreakpointListRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_LISTBREAK, DVAL_EOM]).then(function(msg)  {
         var i, n;
         var breakpts = [];
         for (i = 1, n = msg.length - 1; i < n; i = 2)  {
               breakpts.push( {
                     fileName:msg[i], 
                     lineNumber:msg[i + 1]                  }
               );
            }
         _this.breakpoints = breakpts;
         _this.emit("breakpoints-update");
         return msg;
      }
   );
}
;
Debugger.prototype.sendGetLocalsRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_GETLOCALS, DVAL_EOM]).then(function(msg)  {
         var i;
         var locals = [];
         for (i = 1; i <= msg.length - 2; i = 2)  {
               locals.push( {
                     key:msg[i], 
                     value:prettyUiDebugValue(msg[i + 1], LOCALS_CLIPLEN)                  }
               );
            }
         _this.locals = locals;
         _this.emit("locals-update");
         return msg;
      }
   );
}
;
Debugger.prototype.sendGetCallStackRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_GETCALLSTACK, DVAL_EOM]).then(function(msg)  {
         var i;
         var stack = [];
         for (i = 1; i + 3 <= msg.length - 1; i = 4)  {
               stack.push( {
                     fileName:msg[i], 
                     funcName:msg[i + 1], 
                     lineNumber:msg[i + 2], 
                     pc:msg[i + 3]                  }
               );
            }
         _this.callstack = stack;
         _this.emit("callstack-update");
         return msg;
      }
   );
}
;
Debugger.prototype.sendStepIntoRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_STEPINTO, DVAL_EOM]);
}
;
Debugger.prototype.sendStepOverRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_STEPOVER, DVAL_EOM]);
}
;
Debugger.prototype.sendStepOutRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_STEPOUT, DVAL_EOM]);
}
;
Debugger.prototype.sendPauseRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_PAUSE, DVAL_EOM]);
}
;
Debugger.prototype.sendResumeRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_RESUME, DVAL_EOM]);
}
;
Debugger.prototype.sendEvalRequest = function(evalInput)  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_EVAL, evalInput, DVAL_EOM]).then(function(msg)  {
         return  {
            error:msg[1] === 1, 
            value:msg[2]         }
;
      }
   );
}
;
Debugger.prototype.sendDetachRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_DETACH, DVAL_EOM]);
}
;
Debugger.prototype.sendDumpHeapRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_DUMPHEAP, DVAL_EOM]).then(function(msg)  {
         var res =  {} ;
         var objs = [];
         var i, j, n, m, o, prop;
         res.type = "heapDump";
         res.heapObjects = objs;
         for (i = 1, n = msg.length - 1; i < n; )  {
               o =  {} ;
               o.ptr = msg[i++];
               o.type = msg[i++];
               o.flags = msg[i++] >>> 0;
               o.refc = msg[i++];
               if (o.type === DUK_HTYPE_STRING)  {
                  o.blen = msg[i++];
                  o.clen = msg[i++];
                  o.hash = msg[i++] >>> 0;
                  o.data = msg[i++];
               }
                else if (o.type === DUK_HTYPE_BUFFER)  {
                  o.len = msg[i++];
                  o.alloc = msg[i++];
                  o.data = msg[i++];
               }
                else if (o.type === DUK_HTYPE_OBJECT)  {
                  o["class"] = msg[i++];
                  o.proto = msg[i++];
                  o.esize = msg[i++];
                  o.enext = msg[i++];
                  o.asize = msg[i++];
                  o.hsize = msg[i++];
                  o.props = [];
                  for (j = 0, m = o.enext; j < m; j++)  {
                        prop =  {} ;
                        prop.flags = msg[i++];
                        prop.key = msg[i++];
                        prop.accessor = msg[i++] == 1;
                        if (prop.accessor)  {
                           prop.getter = msg[i++];
                           prop.setter = msg[i++];
                        }
                         else  {
                           prop.value = msg[i++];
                        }
                        o.props.push(prop);
                     }
                  o.array = [];
                  for (j = 0, m = o.asize; j < m; j++)  {
                        prop =  {} ;
                        prop.value = msg[i++];
                        o.array.push(prop);
                     }
               }
                else  {
                  console.log("invalid htype: " + o.type + ", disconnect");
                  _this.disconnectDebugger();
                  throw new Error("invalid htype");
                  return ;
               }
               objs.push(o);
            }
         return res;
      }
   );
}
;
Debugger.prototype.sendGetBytecodeRequest = function()  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_GETBYTECODE, DVAL_EOM]).then(function(msg)  {
         var idx = 1;
         var nconst;
         var nfunc;
         var val;
         var buf;
         var i, n;
         var consts = [];
         var funcs = [];
         var bcode;
         var preformatted;
         var ret;
         nconst = msg[idx++];
         for (i = 0; i < nconst; i++)  {
               val = msg[idx++];
               consts.push(val);
            }
         nfunc = msg[idx++];
         for (i = 0; i < nfunc; i++)  {
               val = msg[idx++];
               funcs.push(val);
            }
         val = msg[idx++];
         buf = new Buffer(val.length);
         writeDebugStringToBuffer(val, buf, 0);
         bcode = _this.decodeBytecodeFromBuffer(buf, consts, funcs);
         preformatted = [];
         consts.forEach(function(v, i)  {
               preformatted.push("; c" + i + " " + JSON.stringify(v));
            }
         );
         preformatted.push("");
         bcode.forEach(function(v)  {
               preformatted.push(v.str);
            }
         );
         preformatted = preformatted.join("
") + "
";
         ret =  {
            constants:consts, 
            functions:funcs, 
            bytecode:bcode, 
            preformatted:preformatted         }
;
         return ret;
      }
   );
}
;
Debugger.prototype.changeBreakpoint = function(fileName, lineNumber, mode)  {
   var _this = this;
   return this.sendRequest([DVAL_REQ, CMD_LISTBREAK, DVAL_EOM]).then(function(msg)  {
         var i, n;
         var breakpts = [];
         var deleted = false;
         for (i = 1, n = msg.length - 1; i < n; i = 2)  {
               breakpts.push( {
                     fileName:msg[i], 
                     lineNumber:msg[i + 1]                  }
               );
            }
         for (i = breakpts.length - 1; i >= 0; i--)  {
               var bp = breakpts[i];
               if (mode === "deleteall" || bp.fileName === fileName && bp.lineNumber === lineNumber)  {
                  deleted = true;
                  _this.sendRequest([DVAL_REQ, CMD_DELBREAK, i, DVAL_EOM], function(msg)  {
                     }, 
                     function(err)  {
                     }
                  );
               }
            }
         if (mode === "add" || mode === "toggle" && ! deleted)  {
            _this.sendRequest([DVAL_REQ, CMD_ADDBREAK, fileName, lineNumber, DVAL_EOM], function(msg)  {
               }, 
               function(err)  {
                  _this.uiMessage("debugger-info", "Failed to add breakpoint: " + err);
               }
            );
         }
         _this.sendBreakpointListRequest();
      }
   );
}
;
Debugger.prototype.disconnectDebugger = function()  {
   if (this.targetStream)  {
      this.targetStream.destroy();
      this.targetStream = null;
   }
   if (this.inputParser)  {
      this.inputParser.close();
      this.inputParser = null;
   }
   if (this.outputPassThroughStream)  {
   }
   if (this.outputParser)  {
      this.outputParser.close();
      this.outputParser = null;
   }
   this.attached = false;
   this.handshook = false;
   this.reqQueue = null;
   this.execStatus =  {
      attached:false, 
      state:"detached", 
      fileName:"", 
      funcName:"", 
      line:0, 
      pc:0   }
;
}
;
Debugger.prototype.connectDebugger = function()  {
   var _this = this;
   this.disconnectDebugger();
   console.log("Connecting to " + optTargetHost + ":" + optTargetPort + "...");
   this.targetStream = new net.Socket();
   this.targetStream.connect(optTargetPort, optTargetHost, function()  {
         console.log("Debug transport connected");
         _this.attached = true;
         _this.reqQueue = [];
         _this.uiMessage("debugger-info", "Debug transport connected");
      }
   );
   this.inputParser = new DebugProtocolParser(this.targetStream, null, optDumpDebugRead, optDumpDebugPretty, optDumpDebugPretty ? "Recv: " : null, null, null);
   this.outputPassThroughStream = stream.PassThrough();
   this.outputParser = new DebugProtocolParser(this.outputPassThroughStream, 1, optDumpDebugWrite, optDumpDebugPretty, optDumpDebugPretty ? "Send: " : null, null, null);
   this.inputParser.on("transport-close", function()  {
         _this.uiMessage("debugger-info", "Debug transport closed");
         _this.disconnectDebugger();
         _this.emit("exec-status-update");
         _this.emit("detached");
      }
   );
   this.inputParser.on("transport-error", function(err)  {
         _this.uiMessage("debugger-info", "Debug transport error: " + err);
         _this.disconnectDebugger();
      }
   );
   this.inputParser.on("protocol-version", function(msg)  {
         var ver = msg.protocolVersion;
         console.log("Debug version identification:", msg.versionIdentification);
         _this.protocolVersion = ver;
         _this.uiMessage("debugger-info", "Debug version identification: " + msg.versionIdentification);
         if (ver !== 1)  {
            _this.uiMessage("debugger-info", "Protocol version " + ver + " unsupported, dropping connection");
            _this.targetStream.destroy();
         }
          else  {
            _this.uiMessage("debugger-info", "Debug protocol version: " + ver);
            _this.handshook = true;
            _this.execStatus =  {
               attached:true, 
               state:"attached", 
               fileName:"", 
               funcName:"", 
               line:0, 
               pc:0            }
;
            _this.emit("exec-status-update");
            _this.emit("attached");
            _this.sendBasicInfoRequest();
         }
      }
   );
   this.inputParser.on("debug-message", function(msg)  {
         _this.processDebugMessage(msg);
      }
   );
   this.inputParser.on("stats-update", function()  {
         _this.stats.rxBytes = this.bytes;
         _this.stats.rxDvalues = this.dvalues;
         _this.stats.rxMessages = this.messages;
         _this.stats.rxBytesPerSec = this.bytesPerSec;
         _this.emit("debug-stats-update");
      }
   );
   this.outputParser.on("stats-update", function()  {
         _this.stats.txBytes = this.bytes;
         _this.stats.txDvalues = this.dvalues;
         _this.stats.txMessages = this.messages;
         _this.stats.txBytesPerSec = this.bytesPerSec;
         _this.emit("debug-stats-update");
      }
   );
}
;
Debugger.prototype.processDebugMessage = function(msg)  {
   var req;
   var prevState, newState;
   var err;
   if (msg[0] === DVAL_REQ)  {
      console.log("Unsolicited reply message, dropping connection: " + prettyDebugMessage(msg));
   }
    else if (msg[0] === DVAL_REP)  {
      if (this.reqQueue.length <= 0)  {
         console.log("Unsolicited reply message, dropping connection: " + prettyDebugMessage(msg));
         this.targetStream.destroy();
      }
      req = this.reqQueue.shift();
      if (optLogMessages)  {
         console.log("Reply for " + prettyDebugCommand(req.reqCmd) + ": " + prettyDebugMessage(msg));
      }
      if (req.resolveCb)  {
         req.resolveCb(msg);
      }
       else  {
      }
   }
    else if (msg[0] === DVAL_ERR)  {
      if (this.reqQueue.length <= 0)  {
         console.log("Unsolicited error message, dropping connection: " + prettyDebugMessage(msg));
         this.targetStream.destroy();
      }
      err = new Error(String(msg[2]) + " (code " + String(msg[1]) + ")");
      err.errorCode = msg[1] || 0;
      req = this.reqQueue.shift();
      if (optLogMessages)  {
         console.log("Error for " + prettyDebugCommand(req.reqCmd) + ": " + prettyDebugMessage(msg));
      }
      if (req.rejectCb)  {
         req.rejectCb(err);
      }
       else  {
      }
   }
    else if (msg[0] === DVAL_NFY)  {
      if (optLogMessages)  {
         console.log("Notify " + prettyDebugCommand(msg[1]) + ": " + prettyDebugMessage(msg));
      }
      if (msg[1] === CMD_STATUS)  {
         prevState = this.execStatus.state;
         newState = msg[2] === 0 ? "running" : "paused";
         this.execStatus =  {
            attached:true, 
            state:newState, 
            fileName:msg[3], 
            funcName:msg[4], 
            line:msg[5], 
            pc:msg[6]         }
;
         if (prevState !== newState && newState === "paused")  {
            this.sendBreakpointListRequest();
            this.sendGetLocalsRequest();
            this.sendGetCallStackRequest();
         }
         this.emit("exec-status-update");
      }
       else if (msg[1] === CMD_PRINT)  {
         this.uiMessage("print", prettyUiStringUnquoted(msg[2], UI_MESSAGE_CLIPLEN));
      }
       else if (msg[1] === CMD_ALERT)  {
         this.uiMessage("alert", prettyUiStringUnquoted(msg[2], UI_MESSAGE_CLIPLEN));
      }
       else if (msg[1] === CMD_LOG)  {
         this.uiMessage( {
               type:"log", 
               level:msg[2], 
               message:prettyUiStringUnquoted(msg[3], UI_MESSAGE_CLIPLEN)            }
         );
      }
       else  {
         console.log("Unknown notify, dropping connection: " + prettyDebugMessage(msg));
         this.targetStream.destroy();
      }
   }
    else  {
      console.log("Invalid initial dvalue, dropping connection: " + prettyDebugMessage(msg));
      this.targetStream.destroy();
   }
}
;
Debugger.prototype.run = function()  {
   var _this = this;
   this.connectDebugger();
   var sendRound = 0;
   var statusPending = false;
   var bplistPending = false;
   var localsPending = false;
   var callStackPending = false;
   setInterval(function()  {
         if (_this.execStatus.state !== "running")  {
            return ;
         }
         switch(sendRound) {
            case 0:
 
                  if (! statusPending)  {
                     statusPending = true;
                     _this.sendStatusRequest().finally(function()  {
                           statusPending = false;
                        }
                     );
                  }
                  break;
               
            case 1:
 
                  if (! bplistPending)  {
                     bplistPending = true;
                     _this.sendBreakpointListRequest().finally(function()  {
                           bplistPending = false;
                        }
                     );
                  }
                  break;
               
            case 2:
 
                  if (! localsPending)  {
                     localsPending = true;
                     _this.sendGetLocalsRequest().finally(function()  {
                           localsPending = false;
                        }
                     );
                  }
                  break;
               
            case 3:
 
                  if (! callStackPending)  {
                     callStackPending = true;
                     _this.sendGetCallStackRequest().finally(function()  {
                           callStackPending = false;
                        }
                     );
                  }
                  break;
               
}
;
         sendRound = sendRound + 1 % 4;
      }, 
      500);
}
;
function DebugWebServer()  {
   this.dbg = null;
   this.socket = null;
   this.keepaliveTimer = null;
   this.uiMessageLimiter = null;
   this.cachedJson =  {} ;
   this.sourceFileManager = new SourceFileManager(optSourceSearchDirs);
   this.sourceFileManager.scan();
}
;
DebugWebServer.prototype.handleSourcePost = function(req, res)  {
   var fileName = req.body && req.body.fileName;
   var fileData;
   console.log("Source request: " + fileName);
   if (typeof fileName !== "string")  {
      res.status(500).send("invalid request");
      return ;
   }
   fileData = this.sourceFileManager.search(fileName, optSourceSearchDirs);
   if (typeof fileData !== "string")  {
      res.status(404).send("not found");
      return ;
   }
   res.status(200).send(fileData);
}
;
DebugWebServer.prototype.handleSourceListPost = function(req, res)  {
   console.log("Source list request");
   var files = this.sourceFileManager.getFiles();
   res.header("Content-Type", "application/json");
   res.status(200).json(files);
}
;
DebugWebServer.prototype.handleHeapDumpGet = function(req, res)  {
   console.log("Heap dump get");
   this.dbg.sendDumpHeapRequest().then(function(val)  {
         res.header("Content-Type", "application/json");
         res.status(200).send(JSON.stringify(val, null, 4));
      }
   ).catch(function(err)  {
         res.status(500).send("Failed to get heap dump: " + err.stack || err);
      }
   );
}
;
DebugWebServer.prototype.run = function()  {
   var _this = this;
   var express = require("express");
   var bodyParser = require("body-parser");
   var app = express();
   var http = require("http").Server(app);
   var io = require("socket.io")(http);
   app.use(bodyParser.json());
   app.post("/source", this.handleSourcePost.bind(this));
   app.post("/sourceList", this.handleSourceListPost.bind(this));
   app.get("/heapDump.json", this.handleHeapDumpGet.bind(this));
   app.use("/", express.static(__dirname + "/static"));
   http.listen(optHttpPort, function()  {
         console.log("Listening on *:" + optHttpPort);
      }
   );
   io.on("connection", this.handleNewSocketIoConnection.bind(this));
   this.dbg.on("attached", function()  {
         console.log("Debugger attached");
      }
   );
   this.dbg.on("detached", function()  {
         console.log("Debugger detached");
      }
   );
   this.dbg.on("debug-stats-update", function()  {
         _this.debugStatsLimiter.trigger();
      }
   );
   this.dbg.on("ui-message-update", function()  {
         _this.uiMessageLimiter.trigger();
      }
   );
   this.dbg.on("basic-info-update", function()  {
         _this.emitBasicInfo();
      }
   );
   this.dbg.on("breakpoints-update", function()  {
         _this.emitBreakpoints();
      }
   );
   this.dbg.on("exec-status-update", function()  {
         _this.execStatusLimiter.trigger();
      }
   );
   this.dbg.on("locals-update", function()  {
         _this.emitLocals();
      }
   );
   this.dbg.on("callstack-update", function()  {
         _this.emitCallStack();
      }
   );
   this.uiMessageLimiter = new RateLimited(10, 1000, this.uiMessageLimiterCallback.bind(this));
   this.execStatusLimiter = new RateLimited(50, 500, this.execStatusLimiterCallback.bind(this));
   this.debugStatsLimiter = new RateLimited(1, 2000, this.debugStatsLimiterCallback.bind(this));
   this.keepaliveTimer = setInterval(this.emitKeepalive.bind(this), 30000);
}
;
DebugWebServer.prototype.handleNewSocketIoConnection = function(socket)  {
   var _this = this;
   console.log("Socket.io connected");
   if (this.socket)  {
      console.log("Closing previous socket.io socket");
      this.socket.emit("replaced");
   }
   this.socket = socket;
   this.emitKeepalive();
   socket.on("disconnect", function()  {
         console.log("Socket.io disconnected");
         if (_this.socket === socket)  {
            _this.socket = null;
         }
      }
   );
   socket.on("keepalive", function(msg)  {
      }
   );
   socket.on("attach", function(msg)  {
         if (_this.dbg.targetStream)  {
            console.log("Attach request when debugger already has a connection, ignoring");
         }
          else  {
            _this.dbg.connectDebugger();
         }
      }
   );
   socket.on("detach", function(msg)  {
         Promise.any([_this.dbg.sendDetachRequest(), Promise.delay(3000)]).finally(function()  {
               _this.dbg.disconnectDebugger();
            }
         );
      }
   );
   socket.on("stepinto", function(msg)  {
         _this.dbg.sendStepIntoRequest();
      }
   );
   socket.on("stepover", function(msg)  {
         _this.dbg.sendStepOverRequest();
      }
   );
   socket.on("stepout", function(msg)  {
         _this.dbg.sendStepOutRequest();
      }
   );
   socket.on("pause", function(msg)  {
         _this.dbg.sendPauseRequest();
      }
   );
   socket.on("resume", function(msg)  {
         _this.dbg.sendResumeRequest();
      }
   );
   socket.on("eval", function(msg)  {
         var input = stringToDebugString(msg.input);
         _this.dbg.sendEvalRequest(input).then(function(v)  {
               socket.emit("eval-result",  {
                     error:v.error, 
                     result:prettyUiDebugValue(v.value, EVAL_CLIPLEN)                  }
               );
            }
         );
         _this.dbg.sendGetLocalsRequest();
      }
   );
   socket.on("getvar", function(msg)  {
         var varname = stringToDebugString(msg.varname);
         _this.dbg.sendGetVarRequest(varname).then(function(v)  {
               socket.emit("getvar-result",  {
                     found:v.found, 
                     result:prettyUiDebugValue(v.value, GETVAR_CLIPLEN)                  }
               );
            }
         );
      }
   );
   socket.on("putvar", function(msg)  {
         var varname = stringToDebugString(msg.varname);
         var varvalue = msg.varvalue;
         if (typeof varvalue === "string")  {
            varvalue = stringToDebugString(msg.varvalue);
         }
         _this.dbg.sendPutVarRequest(varname, varvalue).then(function(v)  {
               console.log("putvar done");
            }
         );
         _this.dbg.sendGetLocalsRequest();
      }
   );
   socket.on("add-breakpoint", function(msg)  {
         _this.dbg.changeBreakpoint(msg.fileName, msg.lineNumber, "add");
      }
   );
   socket.on("delete-breakpoint", function(msg)  {
         _this.dbg.changeBreakpoint(msg.fileName, msg.lineNumber, "delete");
      }
   );
   socket.on("toggle-breakpoint", function(msg)  {
         _this.dbg.changeBreakpoint(msg.fileName, msg.lineNumber, "toggle");
      }
   );
   socket.on("delete-all-breakpoints", function(msg)  {
         _this.dbg.changeBreakpoint(null, null, "deleteall");
      }
   );
   socket.on("get-bytecode", function(msg)  {
         _this.dbg.sendGetBytecodeRequest().then(function(res)  {
               socket.emit("bytecode", res);
            }
         );
      }
   );
   this.cachedJson =  {} ;
   this.emitBasicInfo();
   this.emitStats();
   this.emitExecStatus();
   this.emitUiMessages();
   this.emitBreakpoints();
   this.emitCallStack();
   this.emitLocals();
}
;
DebugWebServer.prototype.cachedJsonCheck = function(cacheKey, msg)  {
   var newJson = JSON.stringify(msg);
   if (this.cachedJson[cacheKey] === newJson)  {
      return true;
   }
   this.cachedJson[cacheKey] = newJson;
   return false;
}
;
DebugWebServer.prototype.uiMessageLimiterCallback = function()  {
   this.emitUiMessages();
}
;
DebugWebServer.prototype.execStatusLimiterCallback = function()  {
   this.emitExecStatus();
}
;
DebugWebServer.prototype.debugStatsLimiterCallback = function()  {
   this.emitStats();
}
;
DebugWebServer.prototype.emitKeepalive = function()  {
   if (! this.socket)  {
      return ;
   }
   this.socket.emit("keepalive",  {
         nodeVersion:process.version      }
   );
}
;
DebugWebServer.prototype.emitBasicInfo = function()  {
   if (! this.socket)  {
      return ;
   }
   var newMsg =  {
      duk_version:this.dbg.dukVersion, 
      duk_git_describe:this.dbg.dukGitDescribe, 
      target_info:this.dbg.targetInfo, 
      endianness:this.dbg.endianness   }
;
   if (this.cachedJsonCheck("basic-info", newMsg))  {
      return ;
   }
   this.socket.emit("basic-info", newMsg);
}
;
DebugWebServer.prototype.emitStats = function()  {
   if (! this.socket)  {
      return ;
   }
   this.socket.emit("debug-stats", this.dbg.stats);
}
;
DebugWebServer.prototype.emitExecStatus = function()  {
   if (! this.socket)  {
      return ;
   }
   var newMsg = this.dbg.execStatus;
   if (this.cachedJsonCheck("exec-status", newMsg))  {
      return ;
   }
   this.socket.emit("exec-status", newMsg);
}
;
DebugWebServer.prototype.emitUiMessages = function()  {
   if (! this.socket)  {
      return ;
   }
   var newMsg = this.dbg.messageLines;
   if (this.cachedJsonCheck("output-lines", newMsg))  {
      return ;
   }
   this.socket.emit("output-lines", newMsg);
}
;
DebugWebServer.prototype.emitBreakpoints = function()  {
   if (! this.socket)  {
      return ;
   }
   var newMsg =  {
      breakpoints:this.dbg.breakpoints   }
;
   if (this.cachedJsonCheck("breakpoints", newMsg))  {
      return ;
   }
   this.socket.emit("breakpoints", newMsg);
}
;
DebugWebServer.prototype.emitCallStack = function()  {
   if (! this.socket)  {
      return ;
   }
   var newMsg =  {
      callstack:this.dbg.callstack   }
;
   if (this.cachedJsonCheck("callstack", newMsg))  {
      return ;
   }
   this.socket.emit("callstack", newMsg);
}
;
DebugWebServer.prototype.emitLocals = function()  {
   if (! this.socket)  {
      return ;
   }
   var newMsg =  {
      locals:this.dbg.locals   }
;
   if (this.cachedJsonCheck("locals", newMsg))  {
      return ;
   }
   this.socket.emit("locals", newMsg);
}
;
function DebugProxy(serverPort)  {
   this.serverPort = serverPort;
   this.server = null;
   this.socket = null;
   this.targetStream = null;
   this.inputParser = null;
   this.dval_eom = formatDebugValue(DVAL_EOM);
   this.dval_req = formatDebugValue(DVAL_REQ);
   this.dval_rep = formatDebugValue(DVAL_REP);
   this.dval_nfy = formatDebugValue(DVAL_NFY);
   this.dval_err = formatDebugValue(DVAL_ERR);
}
;
DebugProxy.prototype.determineCommandNumber = function(cmdString, cmdNumber)  {
   var ret;
   if (typeof cmdString === "string")  {
      ret = debugCommandNumbers[cmdString];
   }
   ret = ret || cmdNumber;
   if (typeof ret !== "number")  {
      throw Error("cannot figure out command number for "" + cmdString + "" (" + cmdNumber + ")");
   }
   return ret;
}
;
DebugProxy.prototype.commandNumberToString = function(id)  {
   return debugCommandNames[id] || String(id);
}
;
DebugProxy.prototype.formatDvalues = function(args)  {
   if (! args)  {
      return [];
   }
   return args.map(function(v)  {
         return formatDebugValue(v);
      }
   );
}
;
DebugProxy.prototype.writeJson = function(val)  {
   this.socket.write(JSON.stringify(val) + "
");
}
;
DebugProxy.prototype.writeJsonSafe = function(val)  {
   try {
      this.writeJson(val);
   }
   catch (e) {
      console.log("Failed to write JSON in writeJsonSafe, ignoring: " + e);
   }
}
;
DebugProxy.prototype.disconnectJsonClient = function()  {
   if (this.socket)  {
      this.socket.destroy();
      this.socket = null;
   }
}
;
DebugProxy.prototype.disconnectTarget = function()  {
   if (this.inputParser)  {
      this.inputParser.close();
      this.inputParser = null;
   }
   if (this.targetStream)  {
      this.targetStream.destroy();
      this.targetStream = null;
   }
}
;
DebugProxy.prototype.run = function()  {
   var _this = this;
   console.log("Waiting for client connections on port " + this.serverPort);
   this.server = net.createServer(function(socket)  {
         console.log("JSON proxy client connected");
         _this.disconnectJsonClient();
         _this.disconnectTarget();
         var socketByline = byline(socket);
         _this.socket = socket;
         socketByline.on("data", function(line)  {
               try {
                  var msg = JSON.parse(line.toString("utf8"));
                  var first_dval;
                  var args_dvalues = _this.formatDvalues(msg.args);
                  var last_dval = _this.dval_eom;
                  var cmd;
                  if (msg.request)  {
                     first_dval = _this.dval_req;
                     cmd = _this.determineCommandNumber(msg.request, msg.command);
                  }
                   else if (msg.reply)  {
                     first_dval = _this.dval_rep;
                  }
                   else if (msg.notify)  {
                     first_dval = _this.dval_nfy;
                     cmd = _this.determineCommandNumber(msg.notify, msg.command);
                  }
                   else if (msg.error)  {
                     first_dval = _this.dval_err;
                  }
                   else  {
                     throw new Error("Invalid input JSON message: " + JSON.stringify(msg));
                  }
                  _this.targetStream.write(first_dval);
                  if (cmd)  {
                     _this.targetStream.write(formatDebugValue(cmd));
                  }
                  args_dvalues.forEach(function(v)  {
                        _this.targetStream.write(v);
                     }
                  );
                  _this.targetStream.write(last_dval);
               }
               catch (e) {
                  console.log(e);
                  _this.writeJsonSafe( {
                        notify:"_Error", 
                        args:["Failed to handle input json message: " + e]                     }
                  );
                  _this.disconnectJsonClient();
                  _this.disconnectTarget();
               }
            }
         );
         _this.connectToTarget();
      }
   ).listen(this.serverPort);
}
;
DebugProxy.prototype.connectToTarget = function()  {
   var _this = this;
   console.log("Connecting to " + optTargetHost + ":" + optTargetPort + "...");
   this.targetStream = new net.Socket();
   this.targetStream.connect(optTargetPort, optTargetHost, function()  {
         console.log("Debug transport connected");
      }
   );
   this.inputParser = new DebugProtocolParser(this.targetStream, null, optDumpDebugRead, optDumpDebugPretty, optDumpDebugPretty ? "Recv: " : null, null, null);
   this.inputParser.readableNumberValue = false;
   this.inputParser.on("transport-close", function()  {
         console.log("Debug transport closed");
         _this.writeJsonSafe( {
               notify:"_Disconnecting"            }
         );
         _this.disconnectJsonClient();
         _this.disconnectTarget();
      }
   );
   this.inputParser.on("transport-error", function(err)  {
         console.log("Debug transport error", err);
         _this.writeJsonSafe( {
               notify:"_Error", 
               args:[String(err)]            }
         );
      }
   );
   this.inputParser.on("protocol-version", function(msg)  {
         var ver = msg.protocolVersion;
         console.log("Debug version identification:", msg.versionIdentification);
         _this.writeJson( {
               notify:"_Connected", 
               args:[msg.versionIdentification]            }
         );
         if (ver !== 1)  {
            console.log("Protocol version " + ver + " unsupported, dropping connection");
         }
      }
   );
   this.inputParser.on("debug-message", function(msg)  {
         var t;
         if (typeof msg[0] !== "object" || msg[0] === null)  {
            throw new Error("unexpected initial dvalue: " + msg[0]);
         }
          else if (msg.type === "eom")  {
            throw new Error("unexpected initial dvalue: " + msg[0]);
         }
          else if (msg.type === "req")  {
            if (typeof msg[1] !== "number")  {
               throw new Error("unexpected request command number: " + msg[1]);
            }
            t =  {
               request:_this.commandNumberToString(msg[1]), 
               command:msg[1], 
               args:msg.slice(2, msg.length - 1)            }
;
            _this.writeJson(t);
         }
          else if (msg[0].type === "rep")  {
            t =  {
               reply:true, 
               args:msg.slice(1, msg.length - 1)            }
;
            _this.writeJson(t);
         }
          else if (msg[0].type === "err")  {
            t =  {
               error:true, 
               args:msg.slice(1, msg.length - 1)            }
;
            _this.writeJson(t);
         }
          else if (msg[0].type === "nfy")  {
            if (typeof msg[1] !== "number")  {
               throw new Error("unexpected notify command number: " + msg[1]);
            }
            t =  {
               notify:_this.commandNumberToString(msg[1]), 
               command:msg[1], 
               args:msg.slice(2, msg.length - 1)            }
;
            _this.writeJson(t);
         }
          else  {
            throw new Error("unexpected initial dvalue: " + msg[0]);
         }
      }
   );
   this.inputParser.on("stats-update", function()  {
      }
   );
}
;
function main()  {
   console.log("((o) Duktape debugger");
   var argv = require("minimist")(process.argv.slice(2));
   if (argv["target-host"])  {
      optTargetHost = argv["target-host"];
   }
   if (argv["target-port"])  {
      optTargetPort = argv["target-port"];
   }
   if (argv["http-port"])  {
      optHttpPort = argv["http-port"];
   }
   if (argv["json-proxy-port"])  {
      optJsonProxyPort = argv["json-proxy-port"];
   }
   if (argv["json-proxy"])  {
      optJsonProxy = argv["json-proxy"];
   }
   if (argv["source-dirs"])  {
      optSourceSearchDirs = argv["source-dirs"].split(path.delimiter);
   }
   if (argv["dump-debug-read"])  {
      optDumpDebugRead = argv["dump-debug-read"];
   }
   if (argv["dump-debug-write"])  {
      optDumpDebugWrite = argv["dump-debug-write"];
   }
   if (argv["dump-debug-pretty"])  {
      optDumpDebugPretty = argv["dump-debug-pretty"];
   }
   if (argv["log-messages"])  {
      optLogMessages = true;
   }
   console.log("");
   console.log("Effective options:");
   console.log("  --target-host:       " + optTargetHost);
   console.log("  --target-port:       " + optTargetPort);
   console.log("  --http-port:         " + optHttpPort);
   console.log("  --json-proxy-port:   " + optJsonProxyPort);
   console.log("  --json-proxy:        " + optJsonProxy);
   console.log("  --source-dirs:       " + optSourceSearchDirs.join(" "));
   console.log("  --dump-debug-read:   " + optDumpDebugRead);
   console.log("  --dump-debug-write:  " + optDumpDebugWrite);
   console.log("  --dump-debug-pretty: " + optDumpDebugPretty);
   console.log("  --log-messages:      " + optLogMessages);
   console.log("");
   if (optJsonProxy)  {
      console.log("Starting in JSON proxy mode, JSON port: " + optJsonProxyPort);
      var prx = new DebugProxy(optJsonProxyPort);
      prx.run();
   }
    else  {
      var dbg = new Debugger();
      var web = new DebugWebServer();
      dbg.web = web;
      web.dbg = dbg;
      dbg.run();
      web.run();
   }
}
;
main();
