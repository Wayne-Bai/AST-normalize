// Filename: main.js
require.config({
  baseUrl: "/javascripts/",
  shim: {
    jquery: {
      exports: '$' 
    },
    jquery_ui: {
      deps: ["jquery"],
      exports: "jquery-ui"
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    ckeditor_core: {
      deps: ["jquery"],
      exports: "ckeditor_core"
    },
    ckeditor: {
      deps: ["jquery", "ckeditor_core"],
      exports: "ckeditor"
    },
    'bootstrap/modal': { 
      deps: ['jquery'], 
      exports: '$.fn.modal' 
    },
    'bootstrap/tab': { 
      deps: ['jquery'], 
      exports: '$.fn.tab' 
    },
    fancybox: {
      deps: ["jquery"],
      exports: "fancybox"
    },
    mespeak: {
      exports: "mespeak"
    }
  },
  paths: {
    'jquery': 'jquery.min',
    'jquery-ui': 'jquery-ui.min',
    'underscore': 'libs/underscore-min',
    'backbone': 'libs/backbone-min',
    'text': 'libs/text',
    'ckeditor_core': 'libs/ckeditor/ckeditor',
    'ckeditor': 'libs/ckeditor/adapters/jquery',
    'bootstrap': 'libs/bootstrap',
    'fancybox': 'libs/fancybox/jquery.fancybox',
    'mespeak': 'libs/mespeak/mespeak.min'
  },
  mainConfigFile: '/javascripts/main.js',
  waitSeconds: 120
});

require([
  // Load our app module and pass it to our definition function
  'app',
], function(App){
  App.initialize();
});
