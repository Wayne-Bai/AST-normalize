var nexe = require('nexe');

nexe.compile(
  {
    input: "./index.js",
    output: "",
    nodeVersion: "0.10.33",
    nodeTempDir: "",
    flags: true
  },
  function (err) {
    if (err) {
      console.log(err);
    }
  }
);
