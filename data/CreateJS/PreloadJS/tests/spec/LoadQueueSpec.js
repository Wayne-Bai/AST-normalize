describe("PreloadJS.LoadQueue", function () {

	beforeEach(function () {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

		this.queue = new createjs.LoadQueue();

		var _this = this;
		this.loadFile = function (fileObj, preferXHR) {
			if (preferXHR === false || preferXHR === true) {
				_this.queue.preferXHR = preferXHR;
			}

			if (typeof fileObj == "string") {
				_this.queue.loadFile(this.getFilePath(fileObj));
			} else {
				fileObj.src = this.getFilePath(fileObj.src);
				_this.queue.loadFile(fileObj);
			}
		}
	});

	describe("Tag Loading", function () {
		beforeEach(function () {
			this.queue.setPreferXHR(false);
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 9000;
		});

		it("should load JSONp", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof Object).toBe(true);
				done();
			});
			this.loadFile({
				src: "static/jsonpSample.json",
				callback: "x",
				type: createjs.LoadQueue.JSONP
			}, false);
		});

		it("should load and execute Javascript (tag)", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(window.foo).toBe(true);
				done();
			});
			this.loadFile("static/scriptExample.js", false);
		});

		it("should load svg", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(typeof evt.result).toBe("object");
				done();
			});
			this.loadFile("art/gbot.svg", false);
		});

		it("should load sounds", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof HTMLMediaElement).toBe(true);
				done();
			});

			this.loadFile({
				src: "audio/Thunder.mp3",
				type: createjs.AbstractLoader.SOUND
			});
		});

		it("should load video", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof HTMLMediaElement).toBe(true);
				done();
			});

			this.loadFile({
				src: "static/video.mp4",
				type: createjs.AbstractLoader.VIDEO
			}, false);
		});

		it("should load an existing video tag", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result == tag).toBe(true);
				done();
			});

			var tag = document.createElement("video");
			tag.src = "static/video.mp4";

			this.queue.loadFile(tag);
		});

		it("should load an existing sound tag", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result == tag).toBe(true);
				done();
			});

			var tag = document.createElement("audio");
			tag.src = "audio/Thunder.mp3";
			this.queue.loadFile(tag);
		});

		it("tag sound loading send progress events.", function (done) {
			var _this = this;
			var callback = function (evt) {
				expect(true).toBe(true);
				sound.removeEventListener("progress", callback);
				done();
			};

			var sound = new createjs.SoundLoader({
				src: "audio/Thunder.mp3",
				type: createjs.LoadQueue.SOUND
			});
			sound.addEventListener("progress", callback);
			sound.load();
		});

		it("should load images (tag)", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof HTMLImageElement).toBe(true);
				done();
			});
			this.loadFile("art/image0.jpg", false);
		});

		it("should load an existing image tag", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result === tag).toBe(true);
				done();
			});

			var tag = document.createElement("img");
			tag.src = "art/image0.jpg";
			this.queue.loadFile(tag);
		});

		it("jsonP should error on a 404", function (done) {
			this.queue.addEventListener("error", function (evt) {
				expect(true).toBe(true);
				done();
			});
			this.loadFile({
				src: "static/no_jsonp_here.json",
				callback: "x",
				type: createjs.LoadQueue.JSONP
			}, false);
		});
	});

	describe("XHR Loading", function () {
		it("should load XML", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof Document).toBe(true);
				done();
			});
			this.loadFile("static/grant.xml");
		});

		it("should load JSON", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof Object).toBe(true);
				done();
			});
			this.loadFile("static/grant.json");
		});

		it("should load and execute Javascript (xhr)", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(window.foo).toBe(true);
				done();
			});
			this.loadFile("static/scriptExample.js", true);
		});

		it("should load css", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof HTMLElement).toBe(true);
				done();
			});
			this.loadFile("static/font.css");
		});

		it("should load images (xhr)", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof HTMLImageElement).toBe(true);
				done();
			});
			this.loadFile("art/Autumn.png", true);
		});

		it("should load binary data", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof ArrayBuffer).toBe(true);
				done();
			});
			this.loadFile({
				src: "audio/Thunder.mp3",
				type: createjs.AbstractLoader.BINARY
			});
		});

		it("should load svg (xhr)", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(typeof evt.result).toBe("object");
				done();
			});
			this.loadFile("art/gbot.svg", true);
		});

		it("should load text", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(typeof evt.result).toBe("string");
				done();
			});
			this.loadFile({src: "art/gbot.svg", type: createjs.LoadQueue.TEXT});
		});

		it("should load sounds (xhr)", function (done) {
			this.queue.addEventListener("fileload", function (evt) {
				expect(evt.result instanceof HTMLMediaElement).toBe(true);
				done();
			});

			this.loadFile({
				src: "audio/Thunder.mp3",
				type: createjs.AbstractLoader.SOUND
			}, true);
		});
	});

	// This fails in Opera and IE (expected, as crossOrigin is not supported)
	it("images should allow crossOrigin access", function (done) {
		this.queue.addEventListener("fileload", function (evt) {
			var canvas = document.createElement("canvas");
			var stage = new createjs.Stage(canvas);
			var bmp = new createjs.Bitmap(evt.result);

			stage.addChild(bmp);
			stage.update();

			expect(stage.hitTest(35, 25)).toBe(true);
			done();
		});

		this.queue.loadFile({
			src: "http://dev.gskinner.com/createjs/cors/daisy.png",
			crossOrigin: true
		});
	});

	it("should load a manifest and its children", function (done) {
		var func = {
			fileload: function () {
			}
		};

		spyOn(func, "fileload");

		this.queue.addEventListener("fileload", func.fileload);

		this.queue.addEventListener("complete", function (evt) {
			expect(func.fileload.calls.count()).toBe(5);
			done();
		});
		this.loadFile({
			src: "static/manifest.json",
			type: createjs.LoadQueue.MANIFEST
		});
	});

	it("should send progress events.", function (done) {
		var _this = this;
		var callback = function (evt) {
			expect(true).toBe(true);
			_this.queue.removeEventListener("progress", callback);
			done();
		};
		this.queue.addEventListener("progress", callback);
		this.loadFile({
			src: "audio/Thunder.mp3",
			type: createjs.LoadQueue.SOUND
		});
	});

	it("XHR should error on a 404", function (done) {
		this.queue.addEventListener("error", function (evt) {
			expect(evt.title).toBe("FILE_LOAD_ERROR");
			done();
		});
		this.loadFile("This_file_does_not_EXIST_.no");
	});

	it("should pass data through to the complete handler", function (done) {
		this.queue.addEventListener("fileload", function (evt) {
			expect(evt.item.data).toBe("foo");
			done();
		});
		this.loadFile({
			src: "art/gbot.svg",
			type: createjs.LoadQueue.TEXT,
			data: "foo"
		});
	});

	it("should have custom plugins", function (done) {
		var SamplePlugin = function () {
		}
		var s = SamplePlugin;
		s.getPreloadHandlers = function () {
			return {
				callback: s.preloadHandler, // Proxy the method to maintain scope
				types: [createjs.LoadQueue.JSON],
				extensions: ["json"]
			}
		};

		s.preloadHandler = function (loadItem) {
			var options = {};

			// Tell PreloadJS to skip this file
			if (options.stopDownload) {
				return false;
			}

			// Tell PreloadJS to continue normally
			if (options.doNothing) {
				return true;
			}

			loadItem.id = "foo";
			loadItem.data = "foo";

			return true; // Allow the loader to load this.
		};

		this.queue.installPlugin(SamplePlugin);

		this.queue.addEventListener("fileload", function (evt) {
			expect(evt.item.id).toBe("foo");
			expect(evt.item.data).toBe("foo");
			done();
		});
		this.loadFile("static/grant.json");
	});

	it("should POST data.", function (done) {
		var value = {foo: "bar"};
		this.queue.addEventListener("fileload", function (evt) {
			expect(evt.result).toBe(JSON.stringify(value));
			done();
		});

		// the grunt server will echo back whatever we send it.
		this.loadFile({
			src: "",
			method: createjs.LoadQueue.POST,
			values: value
		});
	});

	it("destroy() should remove all references in a LoadQueue", function () {
		this.queue.addEventListener("fileload", function (evt) {
		});
		this.loadFile({
			src: "art/gbot.svg",
			type: createjs.LoadQueue.TEXT,
			data: "foo"
		});

		this.queue.destroy();
		expect(this.queue.hasEventListener("fileload")).toBe(false);
		expect(this.queue.getItem()).not.toBeDefined();
		expect(this.queue.getItem(true)).not.toBeDefined();
	});

	it("removeAll() should remove all the items in a LoadQueue", function () {
		this.queue.loadFile("foo.baz", false);
		this.queue.loadFile("baz.foo", false);
		expect(this.queue._numItems).toBe(2);

		this.queue.removeAll();

		this.queue.load();

		expect(this.queue._numItems).toBe(0);
	});

	it("remove by src should remove foo from the LoadQueue", function (done) {
		var _this = this;

		this.queue.addEventListener("complete", function (evt) {
			expect(_this.queue.getItem("foo")).toBeDefined();
			_this.queue.remove(_this.getFilePath("art/gbot.svg"));
			expect(_this.queue.getItem("foo")).not.toBeDefined();
			done();
		});

		this.loadFile({
			src: "art/gbot.svg",
			id: "foo",
			type: createjs.LoadQueue.TEXT,
			data: "foo"
		});
	});

	it("remove by id should remove foo from the LoadQueue", function (done) {
		var _this = this;

		this.queue.addEventListener("complete", function (evt) {
			expect(_this.queue.getItem("foo")).toBeDefined();
			_this.queue.remove("foo");
			expect(_this.queue.getItem("foo")).not.toBeDefined();
			done();
		});

		this.loadFile({
			src: "art/gbot.svg",
			id: "foo",
			type: createjs.LoadQueue.TEXT,
			data: "foo"
		});
	});

	it("stopOnError should suppress events", function (done) {
		var _this = this;

		var func = {
			complete: function () {

			}
		};

		spyOn(func, 'complete');

		setTimeout(function () {
			expect(func.complete).not.toHaveBeenCalled();
			done();
		}, 750);

		this.queue.addEventListener("complete", func.complete);
		this.queue.stopOnError = true;
		this.queue.setMaxConnections(2);
		this.queue.loadManifest(['static/manifest.json', "FileWill404.html", "static/grant.xml", "static/grant.json"], true);

	});

});
