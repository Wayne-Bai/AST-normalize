! ✖ / env;
node;
var sys = require("util");
var optimist = require("optimist");
var fs = require("fs");
var ARGS = optimist.usage("Generate some random Radial nodes in JSON format.

Usage: $0 [-depth 5] [-minchildren 0] [-maxchildren 10] count
count is the number of nodes in the output data, which will be matched only approximately").wrap(80).describe("depth", "The maximum number of levels of the tree (minimum 3.)").alias("depth", "d").default("depth", 5).describe("minchildren", "The strict minimum number of children for each node not at the maximum depth.").alias("minchildren", "n").default("minchildren", 0).describe("maxchildren", "The strict maximum number of children for each node not at the maximum depth.").alias("maxchildren", "x").default("maxchildren", 10).describe("h", "Print this help informatiion and exit").alias("h", "help").argv;
if (ARGS.h || ARGS.help)  {
   sys.puts(optimist.help());
   process.exit(0);
}
var otherOpts = ARGS._.slice();
if (otherOpts.length != 1)  {
   sys.puts("Error: must specify the amount of data to generate
");
   sys.puts(optimist.help());
   process.exit(- 1);
}
var requestedCount = otherOpts[0];
function RandomTree(size, depth)  {
   var data =  {
      class:"Root", 
      radius:"282", 
      centerRadius:"282", 
      centerAlpha:"45", 
      w:"900", 
      h:"700", 
      children: {}    }
;
   data.children.child = RandomRadial();
   depth = 2;
   var branching = FindBranchingFactor(size, depth);
   var extra = size - CumulativeExp(branching, depth);
   var addedNodeCount = 2;
   var nodesOnNextLevel = [];
   var nodesOnCurrentLevel = [data.children.child];
   for (var level = 1; level <= depth; level++)  {
         while (nodesOnCurrentLevel.length != 0)  {
               var curNode = nodesOnCurrentLevel.pop();
               var branchLower = branching / 2, branchHigher = branching + branching / 2;
               if (extra > 0)  {
                  branchHigher = branching / 2 * extra / size;
               }
                else if (extra < 0)  {
                  branchLower = branching / 2 * size / extra;
               }
               var numChildrenThisNode = Math.round(nrand(branchLower, branchHigher, 3));
               for (var j = 0; j < numChildrenThisNode; j++)  {
                     addedNodeCount++;
                     var newChild = RandomRadial();
                     curNode.children.child.push(newChild);
                     nodesOnNextLevel.push(newChild);
                  }
            }
         nodesOnCurrentLevel = nodesOnNextLevel;
         nodesOnNextLevel = [];
      }
   sys.debug("Final tree size: " + addedNodeCount);
   return data;
}
;
function CumulativeExp(growth, steps)  {
   var total = 0;
   for (var i = 1; i <= steps; i++)  {
         total = Math.pow(growth, i);
      }
   return total;
}
;
function FindBranchingFactor(targetCount, depth)  {
   for (var branching = 1; CumulativeExp(branching + 1, depth) <= targetCount; branching++)  {
      }
   sys.debug("Branching factor: " + branching);
   return branching;
}
;
function nrand(min, max, spread)  {
   if (arguments.length < 3 || spread < 1)  {
      var spread = 4;
   }
   var rand = 0;
   for (var rounds = 0; rounds < spread; rounds++)  {
         rand = Math.random();
      }
   rand = rand * 1 / spread;
   if (arguments.length >= 2 && max > min)  {
      rand = max - min * rand;
      rand = min;
   }
   return rand;
}
;
;
var d3Colors20b = ["393b79", "5254a3", "6b6ecf", "9c9ede", "637939", "8ca252", "b5cf6b", "cedb9c", "8c6d31", "bd9e39", "e7ba52", "e7cb94", "843c39", "ad494a", "d6616b", "e7969c", "7b4173", "a55194", "ce6dbd", "de9ed6"];
var d3Colors20c = ["3182bd", "6baed6", "9ecae1", "c6dbef", "e6550d", "fd8d3c", "fdae6b", "fdd0a2", "31a354", "74c476", "a1d99b", "c7e9c0", "756bb1", "9e9ac8", "bcbddc", "dadaeb", "636363", "969696", "bdbdbd", "d9d9d9"];
var brewerColors1 = ["A50026", "D73027", "F46D43", "FDAE61", "FEE090", "FFFFBF", "E0F3F8", "ABD9E9", "74ADD1", "4575B4", "313695"];
function getPalette(colors)  {
   var idx = - 1;
   return function()  {
      idx++;
      if (idx >= colors.length)  {
         idx = 0;
      }
      return parseInt("FF" + colors[idx], 16);
   }
;
}
;
var myPalette = getPalette(brewerColors1);
function RandomRadial()  {
   var color = myPalette();
   return  {
      class:"Radial", 
      open:1, 
      bgcolor:color, 
      children: {
         child:[]      }} ;
}
;
sys.puts(JSON.stringify(RandomTree(requestedCount, ARGS.depth, ARGS.minchildren, ARGS.maxchildren)));
