/**
* Dependencies
*/

var exec = require('co-exec');

require('chai').should();
require('mocha-generators')();

var Image = require('../');


/**
* Fixtures
*/

var testImage = {
  path: __dirname + '/fixtures/image.jpg',
  meta: null
};


/**
* Tests
*/

describe ('Magician', function () {
  before (function *() {
    var image = new Image(testImage.path);
    image.name.should.equal('image.jpg');
    var meta = yield image.meta();
    testImage.meta = meta;
  });

  describe ('Convert', function () {
    it ('should convert image and save it to a temporary file', function *() {
      var image = new Image(testImage.path);
      image.format('png');
      var convertedImage = yield image.save();			
      convertedImage.path.should.match(/^\/tmp\//);
      var meta = yield convertedImage.meta();

      meta.width.should.equal(testImage.meta.width);
      meta.height.should.equal(testImage.meta.height);
      meta.format.should.equal('PNG');
      meta.size.should.be.above(0);
    });

    it ('should convert image and save it to a specified path', function *() {
      var image = new Image(testImage.path);
      image.format('png')

      var convertedImage = yield image.save('/tmp/image.png')
      convertedImage.path.should.equal('/tmp/image.png');
      convertedImage.name.should.equal('image.png');

      var meta = yield convertedImage.meta();
      meta.width.should.equal(testImage.meta.width);
      meta.height.should.equal(testImage.meta.height);
      meta.format.should.equal('PNG');
      meta.size.should.be.above(0);
    });
  });

  describe ('Resize', function () {
    it ('should resize image to a specified width', function *() {
      var image = new Image(testImage.path);
      image.width(300)

      var resizedImage = yield image.save();
      var meta = yield resizedImage.meta();
      meta.width.should.equal(300);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });

    it ('should resize image to a specified height', function *() {
      var image = new Image(testImage.path);
      image.height(300)

      var resizedImage = yield image.save();
      var meta = yield resizedImage.meta();
      meta.height.should.equal(300);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });

    it ('should resize image to a specified width & height while preserving aspect ratio', function *() {
      var image = new Image(testImage.path);
      image.width(300)
      .height(300);

      var resizedImage = yield image.save()
      var meta = yield resizedImage.meta();
      meta.width.should.equal(300);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });

    it ('should resize image to a specified width & height while preserving aspect ratio and fitting into boundaries using clip strategy', function *() {
      var image = new Image(testImage.path);
      image.width(300)
      .height(250)
      .fit('clip');

      var resizedImage = yield image.save();
      var meta = yield resizedImage.meta();
      meta.width.should.equal(300);
      meta.height.should.equal(250);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });

    it ('should resize image to a specified width & height while preserving aspect ratio and fitting into boundaries using crop strategy', function *() {
      var image = new Image(testImage.path);
      image.width(300)
      .height(250)
      .fit('crop');

      var resizedImage = yield image.save();
      var meta = yield resizedImage.meta();
      meta.width.should.equal(300);
      meta.height.should.equal(250);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });

    it ('should resize image to a specified width & height without preserving aspect ratio', function *() {
      var image = new Image(testImage.path);
      image.width(300)
      .height(300)
      .force();

      var resizedImage = yield image.save();
      var meta = yield resizedImage.meta();
      meta.width.should.equal(300);
      meta.height.should.equal(300);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });

    it ('should resize image to a specified width & height using a resize method while preserving aspect ratio', function *() {
      var image = new Image(testImage.path);
      image.resize(300, 300)
      .save();

      var resizedImage = yield image.save();
      var meta = yield resizedImage.meta();
      meta.width.should.equal(300);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });

    it ('should resize image to a specified width & height using a resize method without preserving aspect ratio', function *() {
      var image = new Image(testImage.path);
      image.resize(300, 300)
      .force();

      var resizedImage = yield image.save();
      var meta = yield resizedImage.meta();
      meta.width.should.equal(300);
      meta.height.should.equal(300);
      meta.format.should.equal('JPEG');
      meta.size.should.be.above(0);
    });
  });

  describe ('Crop', function () {
    it ('should crop an image', function *() {
      var image = new Image(testImage.path);
      image.crop(5, 5, 50, 50);

      var croppedImage = yield image.save();
      var meta = yield croppedImage.meta();
      meta.width.should.equal(50);
      meta.height.should.equal(50);
      meta.format.should.equal('JPEG');
    });
  });

  describe ('Presets', function () {
    var mobilePreset;

    it ('should define a preset', function () {
      mobilePreset = Image.preset('mobile');
      mobilePreset.width(500)
      .height(350)
      .force()
      .crop(5, 5, 100, 100)
      .format('png');

      mobilePreset.config.width.should.equal(500);
      mobilePreset.config.height.should.equal(350);
      mobilePreset.config.force.should.equal(true);
      mobilePreset.config.crop[0].should.equal(5);
      mobilePreset.config.crop[1].should.equal(5);
      mobilePreset.config.crop[2].should.equal(100);
      mobilePreset.config.crop[3].should.equal(100);
      mobilePreset.config.format.should.equal('png');

      mobilePreset.args['-resize'].should.equal('500x350!');
      mobilePreset.args['-crop'].should.equal('100x100+5+5');

      mobilePreset.resize(200, 250);

      mobilePreset.config.width.should.equal(200);
      mobilePreset.config.height.should.equal(250);
      mobilePreset.config.force.should.equal(true);

      mobilePreset.args['-resize'].should.equal('200x250!');
      mobilePreset.args['-crop'].should.equal('100x100+5+5');
    });

    it ('should use a preset', function () {
      var image = new Image(testImage.path);
      image.width(300)
      .height(300);

      image.config.width.should.equal(300);
      image.config.height.should.equal(300);

      image.args['-resize'].should.equal('300x300');

      image.use(mobilePreset);

      image.config.width.should.equal(200);
      image.config.height.should.equal(250);
      image.config.force.should.equal(true);
      image.config.crop[0].should.equal(5);
      image.config.crop[1].should.equal(5);
      image.config.crop[2].should.equal(100);
      image.config.crop[3].should.equal(100);
      image.config.format.should.equal('png');

      image.args['-resize'].should.equal('200x250!');
      image.args['-crop'].should.equal('100x100+5+5');
    });

    it ('should save a preset', function () {
      mobilePreset.save();

      should.exist(Image.presets['mobile']);
    });
  });

  describe ('Filters', function () {
    it ('should use a filter', function *() {
      var image = new Image(testImage.path);
      image.use(function *(next) {
        this.set('-type', 'Grayscale');

        yield next;
      });

      var monoImage = yield image.save();
      var meta = yield monoImage.meta();
      meta.width.should.equal(testImage.meta.width);
      meta.height.should.equal(testImage.meta.height);
      meta.format.should.equal(testImage.meta.format);
      meta.size.should.be.above(0);
    });
  });

  after(function *() {
    yield exec('rm -f /tmp/*.png /tmp/*.jpg');
  });
});
