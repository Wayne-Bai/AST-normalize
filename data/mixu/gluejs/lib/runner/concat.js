var fs = require('fs'),
    runner = require('minitask').runner;

// this runner concatenates the files to stdout after running wrap-commonjs-web
module.exports = function(list, options) {
  var current = 0;

  // output the header
  console.log('/* header */');

  function next() {
    var last = runner(
      { stdout: fs.createReadStream(list.files[current].name) },
      [ require('../file-tasks/wrap-commonjs-web.js')]
    );
    last.stdout.on('end', function() {
      if(current == list.files.length){
        console.log('/* footer */');
        return;
      }
      next();
    });

    // log a file header
    console.log('\n/* file: '+list.files[current].name+' */');

    // need to do this here so we can catch the second-to-last stream's "end" event;
    last.stdout.pipe(process.stdout);
    current++;
  }

  next();
};
