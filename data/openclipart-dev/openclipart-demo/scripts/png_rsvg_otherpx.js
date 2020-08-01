var path = require('path');
var glob = require('glob');
var child_process = require('child_process');

if (process.argv.length != 3 || process.argv[2] == "--help") {
  console.log();
  console.log("Usage: "+path.basename(process.argv[1])+' [--help] path_to_svg');
  console.log();
  return;
}

var svg_path = process.argv[2];
if (path.extname(svg_path) != ".svg")
  throw "No .svg extension found: "+svg_path;

glob(path.dirname(svg_path)+'/*px-'+path.basename(svg_path, '.svg')+'.png', function(err, files) {
  var png_heights = [];
  files.forEach(function(el) { png_heights.push((path.basename(el).match(/([0-9]+)px-.*\.png/)[1]));});

  png_heights.forEach(function(el) {
    // 250px, 800px and 2000px are generated in png_rsvg_defaultpx.js
    if (el == 250 || el == 800 || el == 2000) return;
    var png_path = path.dirname(svg_path)+'/'+el+'px-'+path.basename(svg_path, '.svg')+'.png';
    var cmd = 'rsvg-convert -h '+el+' '+svg_path+' -o '+png_path+'.rsvg';
    child_process.exec(cmd, function(err, stdout, stderr) {
      if (stdout || stderr || err) console.log(cmd);
      process.stdout.write(stdout);
      process.stderr.write(stderr);
      if (err) {
        console.log('Error '+err);
        throw new Error();
      }
    });
  });
});
