"use strict";
describe('jqmButtonToggler', function() {

    var el, scope, listener;
    beforeEach(inject(function($rootScope, $compile, jqmButtonToggler) {
        scope = $rootScope.$new();
        el = angular.element('<div><span></span></div>');
        $compile(el)(scope);
        spyOn(el, 'bind');
        listener = jqmButtonToggler(el);
    }));

    it('should do nothing for mousedown on non-buttons', function() {
        listener.$mousedown({ target: el });
        expect(el).not.toHaveClass('ui-btn-up-' + scope.$theme);
        expect(el).not.toHaveClass('ui-btn-down-' + scope.$theme);
    });
    it('should do nothing for mouseover on non-buttons', function() {
        listener.$mouseover({ target: el });
        expect(el).not.toHaveClass('ui-btn-hover-' + scope.$theme);
    });

    describe('mousedown', function() {
        function expectBtnDown(isDown) {
            if (!isDown) {
                expect(el).toHaveClass('ui-btn-up-'+scope.$theme);
                expect(el).not.toHaveClass('ui-btn-down-'+scope.$theme);
            } else {
                expect(el).not.toHaveClass('ui-btn-up-'+scope.$theme);
                expect(el).toHaveClass('ui-btn-down-'+scope.$theme);
            }
        }

        beforeEach(function() {
            el.addClass('ui-btn-up-' + scope.$theme);
        });
        it('should change class on mousedown', function() {
            expectBtnDown(false);
            listener.$mousedown({ target: el[0], type: 'mousedown' });
            expectBtnDown(true);
        });
        it('should change class on touchstart', function() {
            expectBtnDown(false);
            listener.$mousedown({ target: el[0], type: 'touchstart' });
            expectBtnDown(true);
        });
        it('should do nothing on mousedown if already down', function() {
            expectBtnDown(false);
            listener.$mousedown({ target: el[0], type: 'mousedown' });
            expectBtnDown(true);
            listener.$mousedown({ target: el[0], type: 'mousedown' });
            expectBtnDown(true);
        });
        it('mousedown should restore btn up class on mousemove', function() {
            listener.$mousedown({ target: el[0], type: 'mousedown' });
            expectBtnDown(true);
            el.triggerHandler('mousemove');
            expectBtnDown(false);
            el.triggerHandler('mousemove');
            expectBtnDown(false);
        });
        it('mousedown should restore btn up class on mouseup', function() {
            listener.$mousedown({ target: el[0], type: 'mousedown' });
            expectBtnDown(true);
            el.triggerHandler('mouseup');
            expectBtnDown(false);
            el.triggerHandler('mouseup');
            expectBtnDown(false);
        });
        it('touchstart should restore btn up class on touchmove', function() {
            listener.$mousedown({ target: el[0], type: 'touchstart' });
            expectBtnDown(true);
            el.triggerHandler('touchmove');
            expectBtnDown(false);
        });
        it('touchstart should restore btn up class on touchend', function() {
            listener.$mousedown({ target: el[0], type: 'touchend' });
            expectBtnDown(true);
            el.triggerHandler('touchend');
            expectBtnDown(false);
        });
        it('touchstart should restore btn up class on touchcancel', function() {
            listener.$mousedown({ target: el[0], type: 'touchstart' });
            expectBtnDown(true);
            el.triggerHandler('touchcancel');
            expectBtnDown(false);
        });

        it('should work if the target is a child of a button', function() {
            var child = el.children();
            listener.$mousedown({ target: child[0], type: 'mousedown' });
            expectBtnDown(true);
            child.triggerHandler('mousemove');
            expectBtnDown(false);
        });
    });

    describe('mouseover', function() {
        function expectBtnHover(isHover) {
            if (isHover) {
                expect(el).toHaveClass('ui-btn-hover-' + scope.$theme);
            } else {
                expect(el).not.toHaveClass('ui-btn-hover-' + scope.$theme);
            }
        }

        beforeEach(function() {
            el.addClass('ui-btn');
        });
        
        it('should add hover class', function() {
            expectBtnHover(false);
            listener.$mouseover({ target: el[0] });
            expectBtnHover(true);
        });
        it('should do nothing if the button is down', function() {
            el.addClass('ui-btn-down-c');
            listener.$mouseover({ target: el[0] });
            expectBtnHover(false);
            el.removeClass('ui-btn-down-c');
            listener.$mouseover({ target: el[0] });
            expectBtnHover(true);
        });
        it('should do nothing if hovered already', function() {
            listener.$mouseover({ target: el[0] });
            expectBtnHover(true);
            listener.$mouseover({ target: el[0] });
            expectBtnHover(true);
        });
        it('should remove hover class on mouseout', function() {
            listener.$mouseover({ target: el[0] });
            expectBtnHover(true);
            el.triggerHandler('mouseout');
            expectBtnHover(false);
        });
        it('should do nothing if up already and mosueout', function() {
            expectBtnHover(false);
            el.triggerHandler('mouseout');
            expectBtnHover(false);
            listener.$mouseover({ target: el[0] });
            expectBtnHover(true);
            el.triggerHandler('mouseout');
            expectBtnHover(false);
        });
        it('should work on children of btn element', function() {
            var child = el.children();
            listener.$mouseover({ target: child[0] });
            expectBtnHover(true);
            child.triggerHandler('mouseout');
            expectBtnHover(false);
        });
    });
});
