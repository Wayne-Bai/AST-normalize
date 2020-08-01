$(function(){

    var sources = {
        'small': {
            'src': 'http://placehold.it/320x240',
            'min': null,
            'max': 319
        },
        'medium': {
            'src': 'http://placehold.it/640x460',
            'min': 320,
            'max': 639
        },
        'large': {
            'src': 'http://placehold.it/800x600',
            'min': 640,
            'max': null
        }
    };

    function getSourceDefinition() {

        var sourceDefinition = [];
        $.each(sources, function (name, source) {
            sourceDefinition.push(
                '[' + source.src + ', (' +
                    (source.min !== null ? 'min-width: ' + source.min : '') +
                    (source.min !== null && source.max !== null ? ', ' : '') +
                    (source.max !== null ? 'max-width: ' + source.max : '') +
                ')]'
            )
        });
        return sourceDefinition.join(', ');

    }

    // QUnit

    var log = [];
    var testName;

    QUnit.done(function (test_results) {
        var tests = [];
        for(var i = 0, len = log.length; i < len; i++) {
            var details = log[i];
            tests.push({
                name: details.name,
                result: details.result,
                expected: details.expected,
                actual: details.actual,
                source: details.source
            });
        }
        test_results.tests = tests;

        window.global_test_results = test_results;
    });

    QUnit.testStart(function(testDetails){
        QUnit.log(function(details){
            if (!details.result) {
                details.name = testDetails.name;
                log.push(details);
            }
        });
    });

    QUnit.test('static-full', function(assert){

        var container = $('#test-static-full');
        var img = container.find('img');
        var done = assert.async();

        container.pufferfish({
            'afterChange': function(event){
                assert.equal(sources.large.src, event.element.attr('src'), 'static image should be using larger image source');
                done();
            }
        });

    });

    QUnit.test('static-half', function(assert){

        var container = $('#test-static-half');
        var img = container.find('img');
        var done = assert.async();

        container.pufferfish({
            'afterChange': function(event){
                assert.equal(sources.medium.src, event.element.attr('src'), 'static image should be using smaller image source');
                done();
            }
        });

    });

    QUnit.test('async-full', function(assert){

        var container = $('#test-async-full');
        var img = $('<img>', {'data-pufferfish': getSourceDefinition()}).appendTo(container);
        var done = assert.async();

        container.pufferfish({
            'afterChange': function(event){
                assert.equal(sources.large.src, event.element.attr('src'), 'async added image should be using larger image source');
                done();
            }
        });

    });

    QUnit.test('async-half', function(assert){

        var container = $('#test-async-half');
        var img = $('<img>', {'data-pufferfish': getSourceDefinition()}).appendTo(container);
        var done = assert.async();

        container.pufferfish({
            'afterChange': function(event){
                assert.equal(sources.medium.src, event.element.attr('src'), 'async added image should be using smaller image source');
                done();
            }
        });

    });

    QUnit.test('static-resize', function(assert){

        var container = $('#test-static-resize');
        var img = container.find('img');

        var doneLarge = assert.async();
        var doneMedium = assert.async();
        var doneSmall = assert.async();

        container.width(200);

        container.pufferfish({
            'afterChange': function(event){

                var width = container.width();

                if(width == 200){
                    assert.equal(sources.small.src, event.element.attr('src'), 'small image source should be used when container is 200px wide');
                    doneSmall();
                    container.width(500);
                    $.pufferfish.reflow();
                }
                else if(width === 500){
                    assert.equal(sources.medium.src, event.element.attr('src'), 'medium image source should be used when container is 500px wide');
                    doneMedium();
                    container.width(700);
                    $.pufferfish.reflow();
                }
                else if(width === 700){
                    assert.equal(sources.large.src, event.element.attr('src'), 'large image source should be used when container is 700px wide');
                    doneLarge();
                }

            }
        });

    });

    QUnit.test('prevent-default', function(assert){

        var container = $('#test-prevent-default');
        var img = container.find('img');

        var done = assert.async();

        container.pufferfish({
            'onChange': function(event){
                event.preventDefault();
            },
            'afterChange': function(event){
                assert.equal('http://placehold.it/50x50', event.element.attr('src'));
                done();
            }
        });

    });

    QUnit.start();

});