var umdBefore = [
'(function(root, factory) {',
'	var myExports = factory();',
'	for(var i = 0; i < myExports.length; i = i + 2) {',
'		var name = myExports[i+1];',
'		var fun = function() { return myExports[i]; };',
'		if (typeof define === \'function\' && define.amd) {',
'			define(fun);',
'		} else if (typeof exports === \'object\') {',
'			module.exports = fun();',
'		} else {',
'			root[name] = fun();',
'		}',
'	}',
'}(this, function(b) {',
].join('\n');

var umdAfter = [
  '  return SpillerExport;',
  '}));'
].join('\n');

module.exports = function(grunt) {
  grunt.registerMultiTask('umd', 'Create an UMD wrapper.', function() {
    this.files.forEach(function(f) {
      var src = umdBefore + '\n' + f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        return grunt.file.read(filepath);
      }).join('\n') + umdAfter;

      grunt.file.write(f.dest, src);
    });
  });
};