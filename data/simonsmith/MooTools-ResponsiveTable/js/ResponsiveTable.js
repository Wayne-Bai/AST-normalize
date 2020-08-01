
/*
    name: ResponsiveTable

    description:
            Port of Filament Groups jQuery plugin that allows columns to be shown/hidden with
            checkboxes based on media queries
            http://filamentgroup.com/examples/rwd-table-patterns/

    authors:
        Simon Smith - http://blink-design.net
        https://github.com/simonsmith/MooTools-ResponsiveTable

    license: MIT-style license.

    version: 1.1

    requires:
      - Core/Event
      - Core/Element
      - Core/Class
      - More/Element.Shortcuts

    provides:
      - ResponsiveTable
*/

(function (name, global, definition) {
	if (typeof module !== 'undefined') module.exports = definition(name, global);
	else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
	else global[name] = definition(name, global);
})('ResponsiveTable', this, function (name, global) {

    'use strict';

    return new Class({

        Implements: [Options, Events],

        options: {
            classes: {
                enhanced: 'enhanced',
                persist: 'persist',
                colHidden: 'col-hidden',
                colVisible: 'col-visible'
            },
            displayMenu: {
                linkText: 'Display columns',
                position: 'top'
            },
            checkInputEvents: ['orientationchange', 'resize']
        },

        /**
         * @param {Element|String} table
         * @param {Object} options
         */
        initialize: function(table, options) {

            this.setOptions(options);

            this.table = document.getElement(table);

            this.table.addClass(this.options.classes.enhanced);
            this.container = new Element('div.responsive-table-container').wraps(this.table);

            this.displayMenu = this.createDisplayMenu();
            this.associateColumns();
            this.displayMenu.inject(this.container, this.options.displayMenu.position);
            this.checkboxes = this.displayMenu.getElements('input');

            this.setInputState();
            this.attachCheckInputEvents();

        },

        /**
         * Checks a column's visibility and sets relevant state of the checkbox
         *
         * @public
         */
        setInputState: function() {

            this.checkboxes.each(function(checkbox) {
                var column = checkbox.retrieve('th');
                var display = column.getStyle('display');
                var state = (display === 'table-cell' ? true : false);

                checkbox.set('checked', state);
            });

            this.fireEvent('checkInputState', [this.checkboxes]);

        },

        /**
         * Attaches 'setInputState' to events, e.g resize
         *
         * @protected
         */
        attachCheckInputEvents: function() {
            
            var events = this.options.checkInputEvents;
            var boundFn = this.setInputState.bind(this);

            // Allow single event to be set as a string
            if (typeof events === 'string') events = [events];
            
            for (var i = 0, len = events.length; i < len; i++) {
                global.addEvent(events[i], boundFn);
            }
            
        }.protect(),

        /**
         * Links a 'thead th' with it's column of 'td' elements
         *
         * @protected
         */
        associateColumns: function() {

            var table = this.table;

            table.getElements('thead th').each(function(th, index) {

                var thClass;
                var column = new Elements();
                var elemIndex = (index + 1);
                var columnClass = 'column-' + elemIndex;

                th.addClass(columnClass);
                thClass = th.get('class');

                table.getElements('tbody tr').each(function(row) {
                    var cells = row.getElements('th, td');
                    cells[index].addClass(thClass);
                    column.push(cells[index]);
                });

                th.store('column', column);

                this.createColumnToggle(th, elemIndex);

            }, this);

        }.protect(),

        /**
         * Creates a list element containing a label and checkbox
         * Attaches change event and adds to the display menu
         *
         * @param {Element} th
         * @param {Number} index
         * @protected
         */
        createColumnToggle: function(th, index) {

            if (th.hasClass(this.options.classes.persist)) return;

            var options = this.options;
            var listElem = new Element('li.display-list-item');
            var label = new Element('label', {
                'text': th.get('text'),
                'for': 'display-checkbox-' + index,
                // Fix for iOS - http://stackoverflow.com/a/6472181/617615
                'onclick': ''
            });
            var checkbox = new Element('input', {
                'type': 'checkbox',
                'class': 'display-checkbox',
                checked: true,
                id: 'display-checkbox-' + index
            });

            checkbox.store('th', th);

            checkbox.addEvent('change', function() {
                var column = th.retrieve('column');
                var displayClasses = (this.get('checked') ?
                    [options.classes.colHidden, options.classes.colVisible] :
                    [options.classes.colVisible, options.classes.colHidden]);

                [th, column].each(function(elem) {
                    elem.swapClass(displayClasses[0], displayClasses[1]);
                });
            });

            label.grab(checkbox, 'top');
            listElem.grab(label).inject(this.displayMenu.getElement('ul'));

        }.protect(),

        /**
         * Creates initial skeleton of the display menu
         *
         * @returns {Element}
         * @protected
         */
        createDisplayMenu: function() {

            var self = this;
            var displayMenu = new Element('div.display-menu');
            var displayList = new Element('ul.display-list');
            var displayLink = new Element('a', {
                text: this.options.displayMenu.linkText,
                'class': 'display-link',
                href: '#',
                events: {
                    click: function(event) {
                        displayList.toggle();
                        self.fireEvent('displayMenuToggle', [event, this]);
                        event.preventDefault();
                    }        
                }
            });
            
            return displayMenu.adopt(displayLink, displayList);
            
        }.protect()

    });

});
