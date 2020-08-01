! ✖ / env;
node;
var tickProcessorModule = require("../lib/tickprocessor");
var composer = require("../lib/composer");
var ArgumentsProcessor = tickProcessorModule.ArgumentsProcessor;
var TickProcessor = tickProcessorModule.TickProcessor;
var SnapshotLogProcessor = tickProcessorModule.SnapshotLogProcessor;
var PlotScriptComposer = composer.PlotScriptComposer;
var processFileLines = tickProcessorModule.processFileLines;
var args = process.argv.slice(2);
var processor = new ArgumentsProcessor(args);
var distortion_per_entry = 0;
var range_start_override = undefined;
var range_end_override = undefined;
if (! processor.parse()) processor.printUsageAndExit()var result = processor.result();
var distortion = parseInt(result.distortion);
if (isNaN(distortion)) processor.printUsageAndExit()distortion_per_entry = distortion / 1000000;
var rangelimits = result.range.split(",");
var range_start = parseInt(rangelimits[0]);
var range_end = parseInt(rangelimits[1]);
if (! isNaN(range_start)) range_start_override = range_startif (! isNaN(range_end)) range_end_override = range_endvar kResX = 1600;
var kResY = 700;
function log_error(text)  {
   console.error(text);
   quit(1);
}
;
var psc = new PlotScriptComposer(kResX, kResY, log_error);
var collector = psc.collectData(distortion_per_entry);
processFileLines(result.logFileName, function(readline)  {
      collector.processLine(readline);
   }, 
   function()  {
      collector.onDone();
      psc.findPlotRange(range_start_override, range_end_override);
      console.log("set terminal pngcairo size " + kResX + "," + kResY + " enhanced font 'Helvetica,10'");
      psc.assembleOutput(console.log);
   }
);
