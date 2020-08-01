'use strict';

function welcome (viewModel) {
  var message = [
    '%cWelcome, adventurer! Pony Foo is running on version %s.',
    'Feel free to play around with our globals: $, md, and moment!'
  ].join('\n');

  var css = 'color: #e92c6c; font-size: 2em; font-family: "Merriweather" "Helvetica Neue", HelveticaNeue, TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Helvetica, Arial, sans-serif;';

  console.log(message, css, viewModel.pkg.version);
}

module.exports = welcome;
