
var steps = ["downloader", "mind", "processor", "server", "uploader", "buffering"];

for (var step in steps) {
  step = steps[step];
  module.exports[step] = require("./" + step);
}
