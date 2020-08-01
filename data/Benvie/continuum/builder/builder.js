var fs = require('fs'),
    path = require('path');

var write    = fs.writeFileSync,
    basename = path.basename,
    extname  = path.extname

function dir(name){
  return fs.readdirSync(name).sort().map(function(file){
    return name + '/' + file;
  });
}

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function transformer(files, callback){
  return files.map(function(file){
    var name = basename(file).slice(0, -extname(file).length);
    return callback(name, read(file));
  });
}


function minify(src){
  var parse    = require('esprima').parse,
      generate = require('escodegen').generate,
      esmangle = require('esmangle'),
      mangle   = esmangle.mangle,
      optimize = esmangle.optimize,
      passes = [
        esmangle.require('lib/pass/transform-dynamic-to-static-property-access'),
        esmangle.require('lib/pass/reordering-function-declarations'),
        esmangle.require('lib/pass/remove-unused-label'),
        esmangle.require('lib/pass/remove-empty-statement'),
        esmangle.require('lib/pass/remove-wasted-blocks'),
        esmangle.require('lib/pass/transform-to-compound-assignment'),
        esmangle.require('lib/pass/transform-to-sequence-expression'),
        esmangle.require('lib/pass/transform-branch-to-expression'),
        esmangle.require('lib/pass/reduce-sequence-expression'),
        esmangle.require('lib/pass/reduce-branch-jump'),
        esmangle.require('lib/pass/reduce-multiple-if-statements'),
        esmangle.require('lib/pass/dead-code-elimination')
      ],
      post = [
        esmangle.require('lib/post/transform-static-to-dynamic-property-access'),
        esmangle.require('lib/post/rewrite-boolean'),
        esmangle.require('lib/post/rewrite-conditional-expression')
      ],
      a = { loc: true },
      b = { destructive: true },
      c = {
        comment: false,
        allowUnparenthesizedNew: true,
        format: {
          indent: {
            style: '  ',
            base: 0,
            adjustMultilineComment: false
          },
          json: false,
          renumber: true,
          hexadecimal: true,
          quotes: 'single',
          escapeless: false,
          compact: true,
          parentheses: true,
          semicolons: true,
          safeConcatenation: true
        }
      };

  function passer(node, pass){
    return pass(node);
  }

  minify = function minify(src){
    return generate(mangle(post.reduce(passer, optimize(parse(src, a), passes, b)), b), c);
  };

  return minify(src);
}



function Builder(){
  this.source = [];
}

Builder.prototype = {
  addSource: function addSource(code){
    if (code instanceof Array) {
      [].push.apply(this.source, code);
    } else {
      this.source.push(code);
    }

    return this;
  },
  addFiles: function addFiles(names, callback){
    if (!(names instanceof Array)) {
      names = [names];
    }
    if (callback) {
      this.addSource(transformer(names, callback));
    } else {
      this.addSource(names.map(read));
    }

    return this;
  },
  addDirectory: function addDirectory(name, callback){
    if (callback) {
      this.addSource(transformer(dir(name), callback));
    } else {
      this.addSource(dir(name).map(read));
    }

    return this;
  },
  combine: function combine(){
    return this.source.join('\n\n');
  },
  writeFile: function writeFile(name, options){
    var src = this.combine();
    options || (options = {});

    write(name+'.js', src);

    if (options.minify) {
      try {
        src = minify(src);
      } catch (e) {
        console.log(e);
        console.warn('You tried to make the minified version but likely are missing the'+
                     ' super duper custom things needed to make it, skipping minification');
      }
    }

    write(name+'.min.js', src);

    return this;
  }
};

Builder.create = function create(){
  return new this;
};

module.exports = Builder;
