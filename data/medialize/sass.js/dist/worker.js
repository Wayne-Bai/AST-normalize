/*! sass.js - v0.0.0 - web worker - 2015-03-22 */'use strict';
/*global Sass, postMessage, onmessage:true, importScripts*/
importScripts('sass.min.js');

onmessage = function (event) {
  var result;
  var synchronous = true;
  switch (event.data.command) {
    case 'compile':
      result = Sass.compile(event.data.text);
      break;
    case 'options':
      result = Sass.options(event.data.options);
      break;
    case 'writeFile':
      result = Sass.writeFile(event.data.filename, event.data.text);
      break;
    case 'readFile':
      result = Sass.readFile(event.data.filename);
      break;
    case 'listFiles':
      result = Sass.listFiles();
      break;
    case 'removeFile':
      result = Sass.removeFile(event.data.filename);
      break;
    case 'lazyFiles':
      result = Sass.lazyFiles(event.data.base, event.data.directory, event.data.files);
      break;
    case 'preloadFiles':
      synchronous = false;
      Sass.preloadFiles(event.data.base, event.data.directory, event.data.files, function() {
        postMessage({
          id: event.data.id,
          result: undefined
        });
      });
      break;
    case '_eval':
      var func = new Function('return ' + event.data.func)();
      result = func.call(Sass);
    default:
      result = {line: 0, message: 'Unknown command ' + event.action};
      break;
  }

  synchronous && postMessage({
    id: event.data.id,
    result: result
  });
};
