
var uploader = require("../../lib/steps/uploader");
var functions = require("../../lib/functions");
var fs = require("fs");
var debug = require("debug")("uploaderTest");
var EventEmitter = require("events").EventEmitter;
var bl = require("bl");

describe("uploader", function () {

  var instance = null;
  var client = null;
  var obj = null;
  var job = null;
  var sandbox = null;
  var func = null;
  var req = null;

  beforeEach(function (done) {
    sandbox = sinon.sandbox.create();

    client = new EventEmitter();
    client.putStream = sinon.stub();

    instance = uploader(client);

    func = functions.buildProcessingFunction("/w200/for/http://myurl/image.png");

    var readStream = fs.createReadStream(__dirname + "/../fixtures/mage/image.png").pipe(bl(function(err) {
      done(err);
    }));

    obj = {
      func: func,
      sourceUrl: "http://a/source/url",
      debug: debug,
      outStream: readStream
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should do nothing if resized is undefined", function (done) {
    obj.resized = undefined;
    instance(obj, function () {
      expect(client.putStream).not.to.have.been.called;
      done();
    });
  });

  it("should do nothing if resized is false", function (done) {
    obj.resized = false;
    instance(obj, function () {
      expect(client.putStream).not.to.have.been.called;
      done();
    });
  });

  it("should upload the full file data", function (done) {
    obj.resized = true;
    client.putStream.callsArgWith(3, null, { statusCode: 200 });

    var headers = {};
    headers['Content-Type'] = obj.func.mimeType;
    headers['x-amz-acl'] = 'public-read';
    headers['Content-Length'] = obj.outStream.length;

    instance(obj, function () {
      expect(client.putStream).to.have.been.calledWith(obj.outStream, func.destPath(), headers);
      done();
    });
  });

  it("should not return an error if the upload returned a wrong status code", function (done) {
    obj.resized = true;
    client.putStream.callsArgWith(3, null, { statusCode: 500 });
    instance(obj, function (err) {
      expect(err).to.be.undefined;
      done();
    });
  });

  it("should not return an error if the upload errored", function (done) {
    obj.resized = true;
    client.putStream.callsArgWith(3, new Error());
    instance(obj, function (err) {
      expect(err).to.be.undefined;
      done();
    });
  });
});
