var regular = require('xregexp').XRegExp;

function patterns(callback) {

  require('fs').readdir(__dirname + '/spiders', function(error, files) {

    var patterns = [];

    files.forEach(function(file) {

      if(file == '.DS_Store') return;

      require(__dirname + '/spiders/' + file).patterns.forEach(function(pattern) {
        if(pattern != '') patterns.push({spider : file, pattern : pattern});
      });
    });

    callback(patterns); 

  });

}

module.exports = function(url, callback) {

  patterns(function(patterns) {

    var match = 0;

    patterns.forEach(function(data) {

      var result = regular.exec(url, regular(data.pattern, 'i'));

      if(result != null) {
        
        require(__dirname + '/spiders/' + data.spider).fetch({
          url     : url,
          pattern : data.pattern,
          result  : result
        }, callback);

        match = 1;

        return;

      }

    });

    // use the default spider
    if(match == 0) {
      require(__dirname + '/spiders/default.js').fetch({
        url     : url,
        pattern : null,
        result  : null
      }, callback);
    }

  });

}