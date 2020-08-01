'use strict';

describe('Json converter', function () {
  var normalizer = require('../../../../src/js/services/normalizer/tags-normalizer');
  var converter = require('../../../../src/js/services/converter/json-converter');

  it('test case - no tags property', function () {

    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph'
    });

    expect(html).toBe('Lorem ipsum dolor.');
  });

  it('test case - space char', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 5,
          end: 6
        }
      },{
        type: 'italic',
        offsets: {
          start: 11,
          end: 12
        }
      }]
    });

    expect(html).toBe('Lorem<span class="hodorjs-stext__strong"> </span>ipsum<span class="hodorjs-stext__italic"> </span>dolor.');
  });

  it('test case 1 - parent wrap child', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 0,
          end: 18
        }
      },{
        type: 'italic',
        offsets: {
          start: 6,
          end: 11
        }
      }]
    });

    expect(html).toBe('<span class="hodorjs-stext__strong">Lorem <span class="hodorjs-stext__italic">ipsum</span> dolor.</span>');
  });

  it('test case 2 - parent wrapped by child', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 6,
          end: 11
        }
      },{
        type: 'italic',
        offsets: {
          start: 0,
          end: 18
        }
      }]
    });

    expect(html).toBe('<span class="hodorjs-stext__italic">Lorem </span><span class="hodorjs-stext__strong"><span class="hodorjs-stext__italic">ipsum</span></span><span class="hodorjs-stext__italic"> dolor.</span>');
  });

  it('test case 3 - child contains parent start', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 9,
          end: 18
        }
      },{
        type: 'italic',
        offsets: {
          start: 6,
          end: 11
        }
      }]
    });

    expect(html).toBe('Lorem <span class="hodorjs-stext__italic">ips</span><span class="hodorjs-stext__strong"><span class="hodorjs-stext__italic">um</span> dolor.</span>');
  });

  it('test case 4 - child contains parent end', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 6,
          end: 11
        }
      },{
        type: 'italic',
        offsets: {
          start: 9,
          end: 18
        }
      }]
    });

    expect(html).toBe('Lorem <span class="hodorjs-stext__strong">ips<span class="hodorjs-stext__italic">um</span></span><span class="hodorjs-stext__italic"> dolor.</span>');
  });

  it('test case 5 - no intersection', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 0,
          end: 5
        }
      },{
        type: 'italic',
        offsets: {
          start: 12,
          end: 17
        }
      }]
    });

    expect(html).toBe('<span class="hodorjs-stext__strong">Lorem</span> ipsum <span class="hodorjs-stext__italic">dolor</span>.');
  });

  it('test case 6 - parent contains multiple child at same level', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 0,
          end: 18
        }
      },{
        type: 'italic',
        offsets: {
          start: 6,
          end: 11
        }
      },{
        type: 'italic',
        offsets: {
          start: 12,
          end: 17
        }
      }]
    });

    expect(html).toBe('<span class="hodorjs-stext__strong">Lorem <span class="hodorjs-stext__italic">ipsum</span> <span class="hodorjs-stext__italic">dolor</span>.</span>');
  });

  it('test case 7 - multiple parent for un child', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 0,
          end: 5
        }
      },{
        type: 'bold',
        offsets: {
          start: 6,
          end: 11
        }
      },{
        type: 'italic',
        offsets: {
          start: 3,
          end: 9
        }
      }]
    });

    expect(html).toBe('<span class="hodorjs-stext__strong">Lor<span class="hodorjs-stext__italic">em</span></span><span class="hodorjs-stext__italic"> </span><span class="hodorjs-stext__strong"><span class="hodorjs-stext__italic">ips</span>um</span> dolor.');
  });

  it('test case 8 - multiple child split', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 6,
          end: 11
        }
      },{
        type: 'italic',
        offsets: {
          start: 3,
          end: 8
        }
      },{
        type: 'underline',
        offsets: {
          start: 9,
          end: 17
        }
      }]
    });

    expect(html).toBe('Lor<span class="hodorjs-stext__italic">em </span><span class="hodorjs-stext__strong"><span class="hodorjs-stext__italic">ip</span>s<span class="hodorjs-stext__underline">um</span></span><span class="hodorjs-stext__underline"> dolor</span>.');
  });

  it('test case 9 - complex structure', function () {
    var html = converter.asHtml({
      text: 'Lorem ipsum dolor.',
      type: 'paragraph',
      tags: [{
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
      }]
    });

    expect(html).toBe('L<span class="hodorjs-stext__italic">o</span><span class="hodorjs-stext__hyperlink" data-url="http://www.google.fr"><span class="hodorjs-stext__italic">r</span><span class="hodorjs-stext__strong"><span class="hodorjs-stext__italic">e</span></span><span class="hodorjs-stext__italic">m</span></span><span class="hodorjs-stext__italic"> </span><span class="hodorjs-stext__hyperlink" data-url="http://www.yahoo.fr"><span class="hodorjs-stext__italic">i</span><span class="hodorjs-stext__strong"><span class="hodorjs-stext__italic">p</span></span><span class="hodorjs-stext__italic">s</span></span><span class="hodorjs-stext__italic">u</span>m dolor.');
  });

  it('test case 10 - multiple space', function () {
    var html = converter.asHtml({
      text: 'Lorem   ipsum  dolor.',
      type: 'paragraph',
      tags: [{
        type: 'bold',
        offsets: {
          start: 0,
          end: 21
        }
      },{
        type: 'italic',
        offsets: {
          start: 8,
          end: 13
        }
      }]
    });

    expect(html).toBe('<span class="hodorjs-stext__strong">Lorem&nbsp;&nbsp; <span class="hodorjs-stext__italic">ipsum</span>&nbsp; dolor.</span>');
  });
});
