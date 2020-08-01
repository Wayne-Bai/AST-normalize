! ✖ / env;
node;
var fs = require("fs");
var util = require("util");
var MAX_LENGTH = 100;
var PATTERN = /^(?:fixup!\s*)?(\w*)(\(([\w\$\.\-\*/]*)\))?\: (.*)$/;
var IGNORED = /^WIP\:/;
var TYPES =  {
   feat:true, 
   fix:true, 
   docs:true, 
   style:true, 
   refactor:true, 
   perf:true, 
   test:true, 
   chore:true, 
   revert:true}
;
var error = function()  {
   console.error("INVALID COMMIT MSG: " + util.format.apply(null, arguments));
}
;
var validateMessage = function(message)  {
   var isValid = true;
   if (IGNORED.test(message))  {
      console.log("Commit message validation ignored.");
      return true;
   }
   if (message.length > MAX_LENGTH)  {
      error("is longer than %d characters !", MAX_LENGTH);
      isValid = false;
   }
   var match = PATTERN.exec(message);
   if (! match)  {
      error("does not match "<type>(<scope>): <subject>" ! was: " + message);
      return false;
   }
   var type = match[1];
   var scope = match[3];
   var subject = match[4];
   if (! TYPES.hasOwnProperty(type))  {
      error(""%s" is not allowed type !", type);
      return false;
   }
   return isValid;
}
;
var firstLineFromBuffer = function(buffer)  {
   return buffer.toString().split("
").shift();
}
;
exports.validateMessage = validateMessage;
if (process.argv.join("").indexOf("jasmine") === - 1)  {
   var commitMsgFile = process.argv[2];
   var incorrectLogFile = commitMsgFile.replace("COMMIT_EDITMSG", "logs/incorrect-commit-msgs");
   fs.readFile(commitMsgFile, function(err, buffer)  {
         var msg = firstLineFromBuffer(buffer);
         if (! validateMessage(msg))  {
            fs.appendFile(incorrectLogFile, msg + "
", function()  {
                  process.exit(1);
               }
            );
         }
          else  {
            process.exit(0);
         }
      }
   );
}
