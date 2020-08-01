"use strict";
describe("jqmFlip", function () {
    var ng, jqm, ngElement, jqmElement;
    beforeEach(function () {
        ng = testutils.ng;
        jqm = testutils.jqm;
        module('templates/jqmFlip.html');
    });

    function compile(ngAttrs, jqmAttrs) {
        ngElement = ng.init('<div jqm-flip ng-model="model" ' + ngAttrs + ' ' +
                            'on-label="on" on-value="onValue" off-label="off" off-value="offValue">' +
                              'label' +
                            '</div>');
        jqmElement = jqm.init('<div><label for="flip-1">label</label>' +
                              '<select name="flip-1" id="flip-1" data-role="slider" ' + jqmAttrs + '>' +
                                '<option value="offValue">off</option>' +
                                '<option value="onValue">on</option>' +
                              '</select></div>');
    }

    function compare() {
        var ngLabel = ngElement.find('label');
        var jqmLabel = jqmElement.find('label');
        testutils.compareElementRecursive(ngLabel, jqmLabel);

        var ngSlider = ngElement.find('div');
        var jqmSlider = jqmElement.find('div');
        testutils.compareElementRecursive(ngSlider, jqmSlider);
        expect((ngSlider.find('span').attr('style') || '').trim())
          .toBe((jqmSlider.find('span').attr('style') || '').trim());
    }

    function flip () {
        ngElement.children('div').triggerHandler('click');
        jqmElement.children('div').trigger('mousedown').trigger('mouseup');
    }

    function trigger (event) {
        ngElement.children('div').triggerHandler(event);
        jqmElement.children('div').trigger(event);
    }


    describe('markup compared to jqm', function () {
        it('has same markup if unflipped', function () {
            compile();
            compare();
        });
        it('has same markup if flipped', function () {
            compile();
            flip();
            compare();
        });
        it('has the same markup when pressed', function () {
            compile();
            trigger('mousedown');
            compare();
        });
        it('has same markup when disabled', function() {
            compile('disabled="disabled"','disabled="disabled"');
            compare();
        });
        it('has same markup with mini option', function () {
            compile('data-mini="true"','data-mini="true"');
            compare();
        });
    });

    describe('with other jqm-directives', function() {
        it('uses theme from jqm-theme to create markup', function() {
            compile('jqm-theme="someTheme"', 'data-track-theme="someTheme" data-theme="someTheme"');
            compare();
        });
        it('uses mini option of parent controlgroup', function() {
            ngElement = ng.init('<div jqm-controlgroup data-mini="true"><div jqm-flip ng-model="model" on-label="on" on-value="onValue" off-label="off" off-value="offValue">label</div></div>');
            var ngSlider = ngElement.find('div').find('div').find('div');
            expect(ngSlider).toHaveClass('ui-mini');
        });
    });

    describe('details', function() {
        it('allows label interpolation', function () {
            ngElement = ng.init('<div jqm-flip ng-model="model" on-label="on" on-value="onValue" off-label="off" off-value="offValue">{{label}}</div>');
            ng.scope.label = 'someLabel';
            ng.scope.$apply();
            var ngLabel = ngElement.find('label').eq(0).text();
            expect(ngLabel).toEqual(ng.scope.label);
        });
        it('allows disabled interpolation', function() {
            ngElement = ng.init('<div jqm-flip ng-disabled="disabled" ng-model="model" on-label="on" on-value="onValue" off-label="off" off-value="offValue">label</div>');
            expect(ngElement.find('div').hasClass("ui-disabled")).toBe(false);
            ng.scope.disabled = true;
            ng.scope.$apply();
            expect(ngElement.find('div').hasClass("ui-disabled")).toBe(true);
        });
        it('works with ng-model without using $parent', function() {
            ngElement = ng.init('<div ng-init="model=\'onValue\';"><div jqm-flip ng-model="model" on-label="on" on-value="onValue" off-label="off" off-value="offValue">label</div></div>');
            expect(ngElement.scope().model).toEqual('onValue');
            ngElement.children('div').find('div').triggerHandler('click');
            expect(ngElement.scope().model).toEqual('offValue');
        });
        it('sets model value in scope if not defined', function() {
            ngElement = ng.init('<div ng-init=""><div jqm-flip ng-model="model" on-label="on" on-value="onValue" off-label="off" off-value="offValue"></div></div>');
            expect(ngElement.scope().model).toBe('offValue');
        });
        it('handles boolean values', function() {
            ngElement = ng.init('<div ng-init="model=true;"><div jqm-flip ng-model="model" on-label="on" on-value="true" off-label="off" off-value="false">label</div></div>');
            expect(ngElement.scope().model).toEqual(true);
            ngElement.children('div').find('div').triggerHandler('click');
            expect(ngElement.scope().model).toEqual(false);
        });
        it('has default values', function() {
            ngElement = ng.init('<div ng-init=""><div jqm-flip ng-model="model"/></div>');
            expect(ngElement.scope().model).toEqual(false);
            ngElement.children('div').find('div').triggerHandler('click');
            expect(ngElement.scope().model).toEqual(true);
        });
    });
});
