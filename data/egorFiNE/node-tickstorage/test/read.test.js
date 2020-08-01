var
	chai = require('chai'),
	assert = chai.assert,
	Reader = require('../index.js').Reader;

describe("TickStorage/Reader", function() {
	it("should read storage version 1 correctly", function(done) {
		var reader = new Reader(__dirname + '/data/ticks-v1/LVS/20110104.ticks');
		reader.load(function(err) {
			assert.ok(!err, err);

			var tick;
			var ticksAmount = 0,
				totalVolume = 0,
				totalPrice = 0,
				totalMarketTicks = 0;

			while(tick = reader.nextTick()) {
				totalVolume += tick.volume;
				totalPrice += tick.price;
				ticksAmount++;
				totalMarketTicks += tick.isMarket ? 1 : 0;
			}

			assert.equal(totalVolume, 39222254, 'total volume');
			assert.equal(totalPrice, 55302035684, 'total price');
			assert.equal(ticksAmount, 118003, 'total count');
			assert.equal(totalMarketTicks, 116927, 'total market count');

			done();
		});
	});

	it("should read storage correctly", function(done) {
		var path = __dirname + '/data/ticks/LVS/20110104.ticks';
		var reader = new Reader(path);
		reader.load(function(err) {
			assert.ok(!err, err);

			var tick;
			var ticksAmount = 0,
				totalVolume = 0,
				totalPrice = 0,
				totalBid = 0,
				totalAsk = 0,
				totalBidSize = 0,
				totalAskSize = 0,
				totalMarketTicks = 0;

			while(tick = reader.nextTick()) {
				totalVolume += tick.volume;
				totalPrice += tick.price;
				totalBid += tick.bid;
				totalAsk += tick.ask;
				totalBidSize += tick.bidSize;
				totalAskSize += tick.askSize;
				totalMarketTicks += tick.isMarket ? 1 : 0;
				ticksAmount++;
			}

			assert.equal(totalVolume, 39222254, 'total volume');
			assert.equal(totalPrice, 55302035684, 'total price');
			assert.equal(ticksAmount, 118003, 'total count');
			assert.equal(totalBid, 7269892);
			assert.equal(totalAsk, 7285935);
			assert.equal(totalBidSize, 7259736);
			assert.equal(totalAskSize, 7249325);
			assert.equal(totalMarketTicks, 116927);

			done();
		});
	});

	it("should read first ticks correctly", function(done) {
		var path = __dirname + '/data/ticks/LVS/20110104.ticks';
		var reader = new Reader(path);
		reader.load(function(err) {
			assert.ok(!err, err);

			assert.deepEqual(reader.nextTick(), {
				"unixtime": 1294134747000,
				"volume": 100,
				"price": 465000,
				"bid": 101,
				"ask": 109,
				"bidSize": 89,
				"askSize": 109,
				"isMarket": false
			});

			assert.deepEqual(reader.nextTick(), {
				"unixtime": 1294143456000,
				"volume": 100,
				"price": 458300,
				"bid": 101,
				"ask": 54,
				"bidSize": 68,
				"askSize": 37,
				"isMarket": false
			});

			assert.deepEqual(reader.nextTick(), {
				"unixtime": 1294143481000,
				"volume": 100,
				"price": 458300,
				"bid": 94,
				"ask": 30,
				"bidSize": 78,
				"askSize": 21,
				"isMarket": false
			});

			done();
		});
	});

	it("should read from readable stream", function(done) {
		var path = __dirname + '/data/ticks/LVS/20110104.ticks';
		var stream = require('fs').createReadStream(path);
		var reader = new Reader(stream);
		reader.load(function(err) {
			assert.ok(!err, err);

			assert.deepEqual(reader.nextTick(), {
				"unixtime": 1294134747000,
				"volume": 100,
				"price": 465000,
				"bid": 101,
				"ask": 109,
				"bidSize": 89,
				"askSize": 109,
				"isMarket": false
			});

			assert.deepEqual(reader.nextTick(), {
				"unixtime": 1294143456000,
				"volume": 100,
				"price": 458300,
				"bid": 101,
				"ask": 54,
				"bidSize": 68,
				"askSize": 37,
				"isMarket": false
			});

			assert.deepEqual(reader.nextTick(), {
				"unixtime": 1294143481000,
				"volume": 100,
				"price": 458300,
				"bid": 94,
				"ask": 30,
				"bidSize": 78,
				"askSize": 21,
				"isMarket": false
			});

			done();
		});
	});

	it("should read ticks at random positions correctly", function(done) {
		var path = __dirname + '/data/ticks/LVS/20110104.ticks';
		var reader = new Reader(path);
		reader.load(function(err) {
			assert.ok(!err, err);

			var tickAtZero = {
				"unixtime": 1294134747000,
				"volume": 100,
				"price": 465000,
				"bid": 101,
				"ask": 109,
				"bidSize": 89,
				"askSize": 109,
				"isMarket": false
			};

			assert.deepEqual(reader.tickAtPosition(2), {
				"unixtime": 1294143481000,
				"volume": 100,
				"price": 458300,
				"bid": 94,
				"ask": 30,
				"bidSize": 78,
				"askSize": 21,
				"isMarket": false
			});

			assert.deepEqual(reader.tickAtPosition(0), tickAtZero);

			assert.deepEqual(reader.tickAtPosition(1), {
				"unixtime": 1294143456000,
				"volume": 100,
				"price": 458300,
				"bid": 101,
				"ask": 54,
				"bidSize": 68,
				"askSize": 37,
				"isMarket": false
			});

			// tickAtPosition() should not increment position
			assert.deepEqual(reader.nextTick(), tickAtZero);

			done();
		});
	});
	it("should throw error if not loaded", function() {
		var path = __dirname + '/data/ticks/non-existant.ticks';
		var reader = new Reader(path);

		try {
			reader.nextTick();
		} catch(e) {
			return;
		}
		assert.fail("Should throw error");
	});

	it("should throw error if file doesn't exist", function(done) {
		var path = __dirname + '/data/ticks/non-existant.ticks';
		var reader = new Reader(path);

		reader.load(function(err) {
			assert.ok(err);
			done();
		});
	});

	it("should return error on invalid file format", function(done) {
		var path = __dirname + '/data/ticks/invalid.ticks';
		var reader = new Reader(path);

		reader.load(function(err) {
			assert.ok(err);
			done();
		});
	});
});
