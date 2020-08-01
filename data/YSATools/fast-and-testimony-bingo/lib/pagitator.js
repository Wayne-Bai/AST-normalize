(function () {
  "use strict";

  var cliches = require('./cliches')
    , shuffle = require('./fisher-yates')
    , free = "I know the Gospel is true (FREE)"
    , max = 25
    ;

  function addPage(addSquare) {
    var i = 0
      ;

    cliches = shuffle(cliches);

    for (i; i < max; i += 1) {
      if (12 === i) {
        addSquare(free);
        continue;
      }
      addSquare(cliches[i], i);
    }
  }

  module.exports.addPage = addPage;
}());
