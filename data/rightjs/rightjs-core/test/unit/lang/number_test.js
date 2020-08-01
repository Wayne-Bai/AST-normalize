/**
 * The Number class extentions unit-test
 *
 * Copyright (C) 2008-2011 Nikolay V. Nemshilov
 */
var NumberTest = TestCase.create({
  name: 'NumberTest',

  testTimes: function() {
    var four = 4, times = 0;

    this.assertSame(four, four.times(function() { times ++; }));
    this.assertEqual(4, times);
  },

  testTimesWithScope: function() {
    this.list = [];

    (4).times(function(i) {
      this.list.push(i);
    }, this);

    this.assertEqual([0,1,2,3], this.list);
  },

  testUpto: function() {
    this.list = [];

    (2).upto(8, function(i) {
      this.list.push(i * 2);
    }, this);

    this.assertEqual([4,6,8,10,12,14,16], this.list);
  },

  testDownto: function() {
    this.list = [];

    (8).downto(4, function(i) {
      this.list.push(i / 2);
    }, this);

    this.assertEqual([4,3.5,3,2.5,2], this.list);
  },

  testTo: function() {
    this.assertEqual([1,2,3,4], 1..to(4));
    this.assertEqual([4,3,2,1], 4..to(1));

    this.assertEqual([2,4,6,8], 1..to(4, function(i) { return i * 2; }));
  },

  testAbs: function() {
    this.assert((-4).abs() == 4);
  },

  testRound: function() {
    this.assert((4.4).round() == 4);
    this.assert((4.6).round() == 5);
  },

  testRoundWithOption: function() {
    this.assert(4.444.round(1) == 4.4);
    this.assert(4.444.round(2) == 4.44);
    this.assert(4.444.round(3) == 4.444);
  },

  testCeil: function() {
    this.assert((4.4).ceil() == 5);
  },

  testFloor: function() {
    this.assert((4.6).floor() == 4);
  },

  testMin: function() {
    this.assertEqual(2.2, 2.2.min(2.1));
    this.assertEqual(2.2, 2.1.min(2.2));
  },

  testMax: function() {
    this.assertEqual(2.2, 2.2.max(2.4));
    this.assertEqual(2.2, 2.4.max(2.2));
  }
});
