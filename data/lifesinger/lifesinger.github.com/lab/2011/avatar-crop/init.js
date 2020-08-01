seajs.config({

      debug: 2,

      alias: {
        'jquery': './libs/jquery/1.6.1/jquery-debug',
        'imgareaselect': './libs/imgareaselect/0.9.6/imgareaselect-debug',
        'imgareaselect-css': './libs/imgareaselect/0.9.6/css/imgareaselect-default.css'
      }

    });


define(function(require) {

  require('./avatar_crop').init();

});