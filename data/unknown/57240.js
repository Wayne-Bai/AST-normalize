! ✖ / env;
node;
var colors = require("colors"), fs = require("fs"), _ = require("underscore"), metrics = require("metrics"), before = process.argv[2], after = process.argv[3];
if (! before || ! after)  {
   console.log("Please supply two file arguments:");
   var n = __filename;
   n = n.substring(n.lastIndexOf("/", n.length));
   console.log("    ./" + n + " multiBenchBefore.txt multiBenchAfter.txt");
   console.log("To generate multiBenchBefore.txt, run");
   console.log("    node multi_bench.js > multiBenchBefore.txt");
   console.log("Thank you for benchmarking responsibly.");
   return ;
}
var before_lines = fs.readFileSync(before, "utf8").split("
"), after_lines = fs.readFileSync(after, "utf8").split("
");
console.log("Comparing before,", before.green, "(", before_lines.length, "lines)", "to after,", after.green, "(", after_lines.length, "lines)");
var total_ops = new metrics.Histogram.createUniformHistogram();
before_lines.forEach(function(b, i)  {
      var a = after_lines[i];
      if (! a || ! b || ! b.trim() || ! a.trim())  {
         return ;
      }
      b_words = b.split(" ").filter(is_whitespace);
      a_words = a.split(" ").filter(is_whitespace);
      var ops = [b_words, a_words].map(function(words)  {
            return parseInt10(words.slice(- 2, - 1));
         }
      ).filter(function(num)  {
            var isNaN = ! num && num !== 0;
            return ! isNaN;
         }
      );
      if (ops.length != 2) return       var delta = ops[1] - ops[0];
      total_ops.update(delta);
      delta = humanize_diff(delta);
      console.log(command_name(a_words) == command_name(b_words) ? command_name(a_words) + ":" : "404:", ops.join(" -> "), "ops/sec (∆", delta, ")");
   }
);
console.log("Mean difference in ops/sec:", humanize_diff(total_ops.mean()));
function is_whitespace(s)  {
   return ! ! s.trim();
}
;
function parseInt10(s)  {
   return parseInt(s, 10);
}
;
function humanize_diff(num)  {
   if (num > 0)  {
      return "+" + num.green;
   }
   return "" + num.red;
}
;
function command_name(words)  {
   var line = words.join(" ");
   return line.substr(0, line.indexOf(","));
}
;
