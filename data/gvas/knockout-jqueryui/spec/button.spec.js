/*global ko, $, jasmine, describe, it, beforeEach, afterEach, spyOn, expect*/
/*jslint maxlen:256*/
(function () {
    'use strict';

    describe('The button binding', function () {
        it('should handle each option of the widget', function () {
            testWidgetOptions('button', {
                disabled: [false, true],
                icons: [{ primary: null, secondary: null }, { primary: 'ui-icon-plus', secondary: null }],
                label: ['one', 'two'],
                text: [true, false]
            });
        });

        it('should handle each event of the widget', function () {
            var $element, vm;

            $element = $('<div data-bind="button: { create: createEventHandler }"></div>').prependTo('body');
            vm = { createEventHandler: jasmine.createSpy() }

            ko.applyBindings(vm, $element[0]);

            expect(vm.createEventHandler).toHaveBeenCalled();

            ko.removeNode($element[0]);
        });

        it('should write the element to the widget observable', function () {
            var $element, vm, disabled;

            $element = $('<div data-bind="button: { widget: widget, disabled: true }"></div>').prependTo('body');
            vm = { widget: ko.observable() };
            ko.applyBindings(vm, $element[0]);

            expect(vm.widget()).toBeDefined();

            disabled = vm.widget().button('option', 'disabled');

            expect(disabled).toBe(true);

            ko.removeNode($element[0]);
        });
    });
}());