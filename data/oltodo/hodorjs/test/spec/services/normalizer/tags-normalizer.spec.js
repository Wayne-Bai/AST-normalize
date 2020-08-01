'use strict';

describe('Tags normalizer', function () {
  var normalizer = require('../../../../src/js/services/normalizer/tags-normalizer');

  it('test case 1 - parent wrap child', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 2,
        end: 6
      }
    },{
      type: 'italic',
      offsets: {
        start: 3,
        end: 5
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'bold',
      range: {
        start: 2,
        end: 6
      }
    },{
      type: 'italic',
      range: {
        start: 3,
        end: 5
      }
    }]));
  });

  it('test case 2 - parent wrapped by child', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 3,
        end: 5
      }
    },{
      type: 'italic',
      offsets: {
        start: 1,
        end: 7
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'italic',
      range: {
        start: 1,
        end: 3
      }
    },{
      type: 'bold',
      range: {
        start: 3,
        end: 5
      }
    },{
      type: 'italic',
      range: {
        start: 3,
        end: 5
      }
    },{
      type: 'italic',
      range: {
        start: 5,
        end: 7
      }
    }]));
  });

  it('test case 3 - child contains parent start', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 3,
        end: 7
      }
    },{
      type: 'italic',
      offsets: {
        start: 1,
        end: 4
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'italic',
      range: {
        start: 1,
        end: 3
      }
    },{
      type: 'bold',
      range: {
        start: 3,
        end: 7
      }
    },{
      type: 'italic',
      range: {
        start: 3,
        end: 4
      }
    }]));
  });

  it('test case 4 - child contains parent end', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 3,
        end: 7
      }
    },{
      type: 'italic',
      offsets: {
        start: 4,
        end: 9
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'bold',
      range: {
        start: 3,
        end: 7
      }
    },{
      type: 'italic',
      range: {
        start: 4,
        end: 7
      }
    },{
      type: 'italic',
      range: {
        start: 7,
        end: 9
      }
    }]));
  });

  it('test case 5 - no intersection', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 1,
        end: 3
      }
    },{
      type: 'italic',
      offsets: {
        start: 4,
        end: 6
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'bold',
      range: {
        start: 1,
        end: 3
      }
    },{
      type: 'italic',
      range: {
        start: 4,
        end: 6
      }
    }]));
  });

  it('test case 6 - parent contains multiple child at same level', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 1,
        end: 9
      }
    },{
      type: 'italic',
      offsets: {
        start: 3,
        end: 5
      }
    },{
      type: 'italic',
      offsets: {
        start: 7,
        end: 9
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'bold',
      range: {
        start: 1,
        end: 9
      }
    },{
      type: 'italic',
      range: {
        start: 3,
        end: 5
      }
    },{
      type: 'italic',
      range: {
        start: 7,
        end: 9
      }
    }]));
  });

  it('test case 7 - multiple parent for un child', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 3,
        end: 5
      }
    },{
      type: 'bold',
      offsets: {
        start: 6,
        end: 8
      }
    },{
      type: 'italic',
      offsets: {
        start: 1,
        end: 10
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'italic',
      range: {
        start: 1,
        end: 3
      }
    },{
      type: 'bold',
      range: {
        start: 3,
        end: 5
      }
    },{
      type: 'italic',
      range: {
        start: 3,
        end: 5
      }
    },{
      type: 'italic',
      range: {
        start: 5,
        end: 6
      }
    },{
      type: 'bold',
      range: {
        start: 6,
        end: 8
      }
    },{
      type: 'italic',
      range: {
        start: 6,
        end: 8
      }
    },{
      type: 'italic',
      range: {
        start: 8,
        end: 10
      }
    }]));
  });

  it('test case 8 - multiple child split', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 3,
        end: 8
      }
    },{
      type: 'italic',
      offsets: {
        start: 1,
        end: 4
      }
    },{
      type: 'underline',
      offsets: {
        start: 7,
        end: 10
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
      type: 'italic',
      range: {
        start: 1,
        end: 3
      }
    },{
      type: 'bold',
      range: {
        start: 3,
        end: 8
      }
    },{
      type: 'italic',
      range: {
        start: 3,
        end: 4
      }
    },{
      type: 'underline',
      range: {
        start: 7,
        end: 8
      }
    },{
      type: 'underline',
      range: {
        start: 8,
        end: 10
      }
    }]));
  });

  it('test case 9 - complex structure', function () {
    var model = [{
      type: 'bold',
      offsets: {
        start: 3,
        end: 4
      }
    },{
      type: 'bold',
      offsets: {
        start: 7,
        end: 8
      }
    },{
      type: 'italic',
      offsets: {
        start: 1,
        end: 10
      }
    },{
      type: 'hyperlink',
      url: 'http://www.google.fr',
      offsets: {
        start: 2,
        end: 5
      }
    },{
      type: 'hyperlink',
      url: 'http://www.yahoo.fr',
      offsets: {
        start: 6,
        end: 9
      }
    }];

    var dataNormalized = normalizer.normalize(model);

    expect(JSON.stringify(dataNormalized)).toEqual(JSON.stringify([{
        "type": "italic",
        "range": {
          "start": 1,
          "end": 2
        }
      },{
        "type": "hyperlink",
        "url": "http://www.google.fr",
        "range": {
          "start": 2,
          "end": 5
        }
      },{
        "type": "italic",
        "range": {
          "start": 2,
          "end": 3
        }
      },{
        "type": "bold",
        "range": {
          "start": 3,
          "end": 4
        }
      },{
        "type": "italic",
        "range": {
          "start": 3,
          "end": 4
        }
      },{
        "type": "italic",
        "range": {
          "start": 4,
          "end": 5
        }
      },{
        "type": "italic",
        "range": {
          "start": 5,
          "end": 6
        }
      },{
        "type": "hyperlink",
        "url": "http://www.yahoo.fr",
        "range": {
          "start": 6,
          "end": 9
        }
      },{
        "type": "italic",
        "range": {
          "start": 6,
          "end": 7
        }
      },{
        "type": "bold",
        "range": {
          "start": 7,
          "end": 8
        }
      },{
        "type": "italic",
        "range": {
          "start": 7,
          "end": 8
        }
      },{
        "type": "italic",
        "range": {
          "start": 8,
          "end": 9
        }
      },{
        "type": "italic",
        "range": {
          "start": 9,
          "end": 10
        }
      }
    ]));
  });
});
