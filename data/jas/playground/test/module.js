/* global suite, beforeEach, afterEach, test, assert */

var fs = require('fs');
var path = require('path');
var temp = require('temp');
var rimraf = require('rimraf');
var walkSync = require('walk-sync');
var playground = require('..');

// Set CWD to the test output directory
process.chdir('./test/');

// Automatically track and cleanup files at exit
temp.track();

var FIXTURES_DIR = path.join(__dirname, 'fixtures');
var EXPECTED_DIR = path.join(__dirname, 'expected');
var OUTPUT_DIR = temp.mkdirSync('playground');

function assertDirectoryContents(actual, expected) {
  expected = path.join(EXPECTED_DIR, expected);

  assert.isDirectory(actual, 'playground exists');

  var actualFiles = walkSync(actual);
  var expectedFiles = walkSync(expected).filter(function(file) {
    return file.indexOf('.DS_Store') === -1; // ignore pesky .DS_Store
  });

  assert.deepEqual(actualFiles, expectedFiles, 'file structure');

  actualFiles.forEach(function(filePath) {
    if (filePath.charAt(filePath.length - 1) !== '/') {
      var expectedContents = fs.readFileSync(path.join(expected, filePath)).toString();
      assert.fileContent(path.join(actual, filePath), expectedContents, 'content of ' + filePath);
    }
  });
}

suite('Node.js module');

afterEach(function() {
  // clean up
  rimraf.sync(path.join(process.cwd(), 'MyPlayground.playground'));
  rimraf.sync(path.join(process.cwd(), 'Test.playground'));
  rimraf.sync(path.join(process.cwd(), 'Test2.playground'));
});

test('public methods exist', function() {
  assert.isFunction(playground.createFromFile, 'createFromFile');
  assert.isFunction(playground.createFromFiles, 'createFromFiles');
  assert.isFunction(playground.createFromString, 'createFromString');
});

test('createFromString, default options', function(done) {
  var markdown = fs.readFileSync(path.join(FIXTURES_DIR, 'Test.md')).toString();
  playground.createFromString(markdown, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(process.cwd(), 'MyPlayground.playground'), 'Test.playground');
    done();
  });
});

test('createFromString, "name" and "outputDirectory" options', function(done) {
  var markdown = fs.readFileSync(path.join(FIXTURES_DIR, 'Test.md')).toString();
  playground.createFromString(markdown, {
    name: 'CustomName',
    outputDirectory: OUTPUT_DIR
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'CustomName.playground'), 'Test.playground');
    done();
  });
});

test('createFromFile, given a file', function(done) {
  playground.createFromFile(path.join(FIXTURES_DIR, 'Test.md'), {
    outputDirectory: OUTPUT_DIR
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'Test.playground'), 'Test.playground');
    done();
  });
});

test('createFromFiles, given a array of files', function(done) {
  playground.createFromFiles([
    path.join(FIXTURES_DIR, 'Test.md'),
    path.join(FIXTURES_DIR, 'Test2.md')
  ], {
    outputDirectory: OUTPUT_DIR
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'Test.playground'), 'Test.playground');
    assertDirectoryContents(path.join(OUTPUT_DIR, 'Test2.playground'), 'Test2.playground');
    done();
  });
});

test('createFromFiles, given a directory', function(done) {
  playground.createFromFiles(FIXTURES_DIR, {
    outputDirectory: OUTPUT_DIR
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'Test.playground'), 'Test.playground');
    assertDirectoryContents(path.join(OUTPUT_DIR, 'Test2.playground'), 'Test2.playground');
    done();
  });
});

test('"platform" and "allowsReset" options', function(done) {
  playground.createFromFile(path.join(FIXTURES_DIR, 'iOS.md'), {
    outputDirectory: OUTPUT_DIR,
    platform: 'ios',
    allowsReset: false
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'iOS.playground'), 'iOS.playground');
    done();
  });
});

test('"stylesheet" option', function(done) {
  playground.createFromFile(path.join(FIXTURES_DIR, 'Stylesheet.md'), {
    outputDirectory: OUTPUT_DIR,
    stylesheet: path.join(FIXTURES_DIR, 'custom.css')
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'Stylesheet.playground'), 'Stylesheet.playground');
    done();
  });
});

test('Kramdown-style code blocks', function(done) {
  playground.createFromFile(path.join(FIXTURES_DIR, 'Kramdown.md'), {
    outputDirectory: OUTPUT_DIR
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'Kramdown.playground'), 'Kramdown.playground');
    done();
  });
});

test('reference-style links and images', function(done) {
  playground.createFromFile(path.join(FIXTURES_DIR, 'References.md'), {
    outputDirectory: OUTPUT_DIR
  }, function(err) {
    if (err) { return done(err); }
    assertDirectoryContents(path.join(OUTPUT_DIR, 'References.playground'), 'References.playground');
    done();
  });
});
