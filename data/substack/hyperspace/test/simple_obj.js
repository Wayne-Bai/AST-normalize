var hyperspace = require('../');
var test = require('tape');
var concat = require('concat-stream');

var html = '<div class="row">'
    + '<div class="who"></div>'
    + '<div class="message"></div>'
    + '</div>'
;

test('simple obj', function (t) {
    t.plan(1);
    
    var hs = hyperspace(html, function (row) {
        return {
            '.who': row.who,
            '.message': row.message
        };
    });
    hs.pipe(concat(function (body) {
        t.equal(body.toString('utf8'), [
            '<div class="row">'
            + '<div class="who">robot</div>'
            + '<div class="message">beep boop</div>'
            + '</div>',
            '<div class="row">'
            + '<div class="who">t-rex</div>'
            + '<div class="message">rawr!</div>'
            + '</div>',
            '<div class="row">'
            + '<div class="who">mouse</div>'
            + '<div class="message">&#x3C;squeak&#x3E;</div>'
            + '</div>'
        ].join(''));
    }));
    
    hs.write({ who: 'robot', message: 'beep boop' });
    hs.write({ who: 't-rex', message: 'rawr!' });
    hs.write({ who: 'mouse', message: '<squeak>' });
    hs.end();
});
