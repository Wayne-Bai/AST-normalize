'use strict';

var koast = require('koast');

koast.configure()
  .then(function (config) {
    if ('development' === process.env.NODE_ENV) {
      console.info('This is your configuration: ', config);
    }
  });

koast.serve();
