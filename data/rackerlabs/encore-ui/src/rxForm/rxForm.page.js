/*jshint node:true*/
var Page = require('astrolabe').Page;
var _ = require('lodash');

var optionFromElement = function (optionElement) {

    return Page.create({

        /**
           @memberof rxForm.dropdown.option
           @returns {string} The text inside of the current option.
         */
        text: {
            get: function () {
                return optionElement.getText();
            }
        },

        /**
           Selects the option from the dropdown.
           @memberof rxForm.dropdown.option
           @function
           @returns {undefined}
         */
        select: {
            value: function () {
                exports.rxForm.slowClick(optionElement);
            }
        },

        /**
           @memberof rxForm.dropdown.option
           @returns {string} The "value" attribute from the option html tag.
         */
        value: {
            get: function () {
                return optionElement.getAttribute('value');
            }
        },

        /**
           @memberof rxForm.dropdown.option
           @function
           @returns {Boolean} Whether or no the option is currently the selected option.
         */
        isSelected: {
            value: function () {
                return optionElement.isSelected();
            }
        }

    });

};

var dropdown = {

    /**
       @memberof rxForm.dropdown
       @returns {string[]} The text of each option element in the dropdown.
     */
    options: {
        get: function () {
            return this.rootElement.$$('option').map(function (optionElement) {
                return optionFromElement(optionElement).text;
            });
        }
    },

    /**
       @memberof rxForm.dropdown
       @returns {string[]} The value of each option element in the dropdown.
     */
    values: {
        get: function () {
            return this.rootElement.$$('option').map(function (optionElement) {
                return optionFromElement(optionElement).value;
            });
        }
    },

    /**
       @memberof rxForm.dropdown
       @returns {rxForm.dropdown.option} Page object representing the currently selected option.
     */
    selectedOption: {
        get: function () {
            return optionFromElement(this.rootElement.$('option:checked'));
        }
    },

    /**
       @memberof rxForm.dropdown
       @function
       @returns {number} The number of options in the dropdown.
     */
    optionCount: {
        value: function () {
            return this.rootElement.$$('option').count();
        }
    },

    /**
       @memberof rxForm.dropdown
       @function
       @param {string} optionText - The text to check for existence in the dropdown.
       @returns {boolean} Whether or not the option exists.
     */
    optionExists: {
        value: function (optionText) {
            return this.rootElement.element(by.cssContainingText('option', optionText)).isPresent();
        }
    },

    /**
       @namespace
       @memberof rxForm.dropdown
       @param {string} optionText - Partial or total string matching the desired option to select.
       @returns {rxForm.dropdown.option} Page object representing an option.
     */
    option: {
        value: function (optionText) {
            var optionElement = this.rootElement.element(by.cssContainingText('option', optionText));
            return optionFromElement(optionElement);
        }
    },

    /**
       @memberof rxForm.dropdown
       @function
       @param {string} optionText - Partial or total string matching the desired option to select.
       @returns {undefined}
       @example
       ```js
       var dropdown = encore.rxForm.dropdown.initialize($('#country-select'));
       dropdown.select('United States');
       ```
     */
    select: {
        value: function (optionText) {
            return this.option(optionText).select();
        }
    }

};

/**
   @namespace
 */
exports.rxForm = {

    /**
      Transform `currencyString` (USD) to an integer representing pennies. Built to reverse Angular's 'currency' filter.
      If your currency string includes fractions of a penny, that precision will be lost!
      @param {string} currencyString - Raw text as output by Angular's `currency` filter.
      @example
      ```js
      encore.rxForm.currencyToPennies('$0.01')      ==  1
      encore.rxForm.currencyToPennies('$0.019')     ==  1
      encore.rxForm.currencyToPennies('$100 CAN')   ==  10000
      encore.rxForm.currencyToPennies('($100 AUS)') == -10000
      encore.rxForm.currencyToPennies('($1.011)')   == -101
      encore.rxForm.currencyToPennies('$1.10')      ==  110
      ```
    */
    currencyToPennies: function (currencyString) {
        var resFloat = parseFloat(currencyString.split(' ')[0].replace(/[,$()]/g, '').trim());

        // Negative number
        if (currencyString.indexOf('(') > -1 && currencyString.indexOf(')') > -1) {
            resFloat = -resFloat;
        }

        return parseInt(resFloat * 100, 10);
    },

    /**
       Equivalent to `browser.actions().mouseDown(elem).mouseUp().perform();`.
       This function should be used when dealing with odd or unusual behavior while interacting with click events
       that don't seem to work right. Either the element does not appear to respond to a normal `.click()` call, or
       the element is responding to more than one click event. This typically happens more often in Firefox than
       in other browsers. See {@link rxForm.dropdown.option.select} for an example of a function that will
       slow click an element to achieve consistent behavior.
       @param {WebElement} elem - Web element to "slow click".
       @returns {undefined}
     */
    slowClick: function (elem) {
        browser.actions().mouseDown(elem).mouseUp().perform();
    },

    /**
       @namespace
     */
    dropdown: {
        /**
           @param {WebElement} selectElement - Should be a `<select>` tag.
           @returns {rxForm.dropdown} Page object representing a dropdown.
         */
        initialize: function (selectElement) {
            dropdown.rootElement = {
                get: function () {
                    return selectElement;
                }
            };
            return Page.create(dropdown);
        }
    },

    /**
       @namespace
     */
    checkbox: {
        /**
           @param {WebElement} checkboxElement - Should be an `<input>` tag.
           @returns {rxForm.checkbox} Page object representing a checkbox.
        */
        initialize: function (checkboxElement) {
            return Page.create({
                rootElement: {
                    get: function () {
                        return checkboxElement;
                    }
                },

                /**
                   Abstraction over `checkboxObject.rootElement.isSelected()` to keep things shorter.
                   @memberof rxForm.checkbox
                   @function
                   @returns {boolean} Whether or not the checkbox is currently selected.
                */
                isSelected: {
                    value: function () {
                        return checkboxElement.isSelected();
                    }
                },

                /**
                   Selects the current checkbox.
                   @memberof rxForm.checkbox
                   @function
                   @returns {undefined}
                */
                select: {
                    value: function () {
                        return this.isSelected().then(function (selected) {
                            if (!selected) {
                                checkboxElement.click();
                            }
                        });
                    }
                },

                /**
                   Unselects the current checkbox.
                   @memberof rxForm.checkbox
                   @function
                   @returns {undefined}
                */
                unselect: {
                    value: function () {
                        return this.isSelected().then(function (selected) {
                            if (selected) {
                                checkboxElement.click();
                            }
                        });
                    }
                }
            });
        }
    },

    /**
       @namespace
     */
    radioButton: {

        /**
           @param {WebElement} radioElement - Should be an `<input>` tag.
           @returns {rxForm.radioButton} Page object representing a radio button.
        */
        initialize: function (radioElement) {
            return Page.create({
                rootElement: {
                    get: function () {
                        return radioElement;
                    }
                },

                /**
                   Abstraction over `radioObject.rootElement.isSelected()` to keep things shorter.
                   @memberof rxForm.radioButton
                   @function
                   @returns {boolean} Whether or not the radio button is currently selected.
                */
                isSelected: {
                    value: function () {
                        return radioElement.isSelected();
                    }
                },

                /**
                   Selects the current radio button.
                   @memberof rxForm.radioButton
                   @function
                   @returns {undefined}
                 */
                select: {
                    value: function () {
                        radioElement.click();
                    }
                }

            });
        }
    },

    /**
       @namespace
     */
    form: {
        /**
           Set `value` in `formData` to the page object's current method `key`.
           Aids in filling out form data via javascript objects.
           For an example of this in use, see [encore-ui's end to end tests]{@link http://goo.gl/R7Frwv}.
           @param {Object} reference - Context to evaluate under as `this` (typically, `this`).
           @param {Object} formData - Key-value pairs of deeply-nested form items, and their values to fill.
           @example
           ```js
           yourPage.fill({
               aTextbox: 'My Name',
               aRadioButton: 'Second Option'
               aSelectDropdown: 'My Choice'
               aModule: {
                   hasMethods: 'Can Accept Input Too',
                   deepNesting: {
                       might: 'be overkill at this level'
                   }
               }
           });
           ```
        */
        fill: function (reference, formData) {
            var next = this;
            var page = reference;
            _.forEach(formData, function (value, key) {
                if (_.isPlainObject(value)) {
                    // There is a deeply-nested function call in the form.
                    reference = page[key];
                    next.fill(reference, value);
                } else {
                    page[key] = value;
                }
            });
        }
    }

};

/**
   Shared function in both one row's `isSelected`, and `selections` getter.
   @private
*/
var optionIsSelected = function (optionRowElement) {
    return optionRowElement.getAttribute('class').then(function (classNames) {
        return classNames.indexOf('selected') > -1;
    });
};

var optionIsDisabled = function (optionRowElement) {
    return optionRowElement.$('label input').getAttribute('disabled');
};

var optionFormRowFromElement = function (optionRowElement) {
    return Page.create({

        /**
           @memberof rxOptionFormTable.row
           @function
           @returns {boolean} Whether or not the row is currently selected.
         */
        isSelected: {
            value: function () {
                return optionIsSelected(optionRowElement);
            }
        },

        /**
           @memberof rxOptionFormTable.row
           @function
           @returns {boolean} Whether or not the row is visually marked as "current".
         */
        isCurrent: {
            value: function () {
                return optionRowElement.getAttribute('class').then(function (classNames) {
                    return classNames.indexOf('current') > -1;
                });
            }
        },

        /**
           Return the value of the cell by `columnName`, using `getText` by default.
           For more control, pass in a `customFn`.
           The reason `columnName` is used, as opposed to by binding, is due to some
           complexity contained within the `getContent` function in the rxOptionFormTable directive.
           [Link to the `getContent` function]{@link http://goo.gl/HKBoez}.
           There are columns that may contain static data (or expressions to be evaluated against `$scope`)
           for every row, and those data items are never bound to `$scope`. Although the column.keys that are
           passed into `$scope.getContent` that contain angular expressions can be located by binding, there are
           cases when plain text or HTML gets passed in. These never get bound to `$scope`. They can, however,
           be located by querying the column name via CSS selector, so that's used instead.
           @function
           @memberof rxOptionFormTable.row
           @param {string} columnName - Column name to grab the current row's cell under.
           @param {function} [customFn=getText()] - Special work to be done to the resulting `cellElement`.
         */
        cell: {
            value: function (columnName, customFn) {
                if (customFn === undefined) {
                    customFn = function (cellElement) {
                        return cellElement.getText();
                    };
                }

                var css = 'label[for^="' + columnName + '"]';
                return customFn(optionRowElement.$(css));
            }
        },

        /**
           Since checkboxes are a superset of radio input elements, a checkbox is used.
           @memberof rxOptionFormTable.row
           @returns {rxForm.checkbox} Page object representing a checkbox.
        */
        selectInput: {
            get: function () {
                var inputElement = optionRowElement.$('.option-table-input input');
                return exports.rxForm.checkbox.initialize(inputElement);
            }
        },

        /**
           Selects the current row.
           @memberof rxOptionFormTable.row
           @function
           @returns {undefined}
         */
        select: {
            value: function () {
                this.selectInput.select();
            }
        },

        /**
           Unselects the current row.
           @memberof rxOptionFormTable.row
           @function
           @returns {undefined}
         */
        unselect: {
            value: function () {
                this.selectInput.unselect();
            }
        }

    });
};

var cssForCellInColumn = function (columnName) {
    return 'tr td > label[for^="' + columnName + '"]';
};

/**
   Extract the row number that a certain cell was found in.
   This is tightly coupled to the implementation of the directive's data population scheme!
   See the rxFormOptionTable's html template, in the column repeater's `label[for]` html.
   If that ever changes, the functionality in this page object may become tedious to support later.
   @private
*/
var rowNumberFromCell = function (cellElement) {
    return cellElement.getAttribute('for').then(function (coordinates) {
        // 'optionTable_0' -> ['optionTable', '0'] -> 0
        return parseInt(_.last(coordinates.split('_')), 10);
    });
};

/**
   @namespace
 */
var rxOptionFormTable = {

    tblRows: {
        get: function () {
            return this.rootElement.all(by.repeater('row in data'));
        }
    },

    tblColumns: {
        get: function () {
            return this.rootElement.$('thead').all(by.repeater('column in columns'));
        }
    },

    lblEmptyWarningMessage: {
        get: function () {
            return this.rootElement.$('.empty-data');
        }
    },

    /**
       @function
       @returns {boolean} Whether or not the table's  the empty message label is currently present.
     */
    isEmpty: {
        value: function () {
            return this.lblEmptyWarningMessage.isPresent();
        }
    },

    /**
       @returns {string|null} The currently displayed empty message label text, or `null` if not present.
     */
    emptyMessage: {
        get: function () {
            var page = this;
            return this.isEmpty().then(function (empty) {
                return empty ? page.lblEmptyWarningMessage.getText() : null;
            });
        }
    },

    /**
       @namespace
       @param {number} rowIndex - Index of the row in the table.
       @returns {rxOptionFormTable.row} Page object representing a row.
     */
    row: {
        value: function (rowIndex) {
            return optionFormRowFromElement(this.tblRows.get(rowIndex));
        }
    },

    /**
       Will default to the first selected row if many are selected.
       Be certain you have a selected row before calling this, or a
       NoSuchElementError will be thrown.
       @returns {rxOptionFormTable.row} Page object representing a row.
    */
    selectedRow: {
        get: function () {
            return optionFormRowFromElement(this.rootElement.$('.selected'));
        }
    },

    /**
       @returns {string[]} Every column heading's text, as an array.
     */
    columnNames: {
        get: function () {
            return this.tblColumns.map(function (columnElement) {
                return columnElement.getText();
            });
        }
    },

    /**
       Return the value of the cells found under `columnName`, using `getText` by default.
       For more control, pass in a `customFn`.
       @function
       @param {string} columnName - Column name containing the cell elements to be retrieved.
       @param {function} [customFn=getText()] - Special work to be done on the column's cell elements.
       @returns {*|string[]} Array of return values specified in `customFn`, or an array of strings from `getText()`
       @example
       ```js
       // three rows, with ['$0.00', '$1.00', '$2.00'] in their cells, respectively.
       var penniesData = [0, 100, 200];
       var penniesFn = function (cellElements) {
           return cellElements.map(function (cellElement) {
               return cellElement.getText().then(rxForm.currencyToPennies);
           });
       };

       // without the second argument, each cell will have `.getText()` called on it
       expect(optionTable.columnData('Surcharge', penniesFn)).to.eventually.eql(penniesData);
       ```
    */
    columnData: {
        value: function (columnName, customFn) {
            if (customFn === undefined) {
                customFn = function (cellElements) {
                    return cellElements.map(function (cellElement) {
                        return cellElement.getText();
                    });
                };
            }

            var css = cssForCellInColumn(columnName);
            return customFn(this.rootElement.$$(css));
        }
    },

    /**
       Unselects every row in the rxOptionFormTable.
       @function
       @returns {undefined}
     */
    unselectAll: {
        value: function () {
            this.tblRows.map(function (rowElement) {
                optionFormRowFromElement(rowElement).unselect();
            });
        }
    },

    /**
       Unselect a row by the `columnName` that contains `columnText`.
       This function uses cssContainingText, be certain your column name and text is unique.
       @function
       @param {string} columnName - Name of the column that contains the cell to select.
       @param {string} columnText - Cell text that uniquely identifies the selection.
       @returns {undefined}
    */
    unselectByColumnText: {
        value: function (columnName, columnText) {
            var page = this;
            var css = cssForCellInColumn(columnName);
            var cellElement = this.rootElement.element(by.cssContainingText(css, columnText));
            return rowNumberFromCell(cellElement).then(function (rowNumber) {
                optionFormRowFromElement(page.tblRows.get(rowNumber)).unselect();
            });
        }
    },

    /**
       Unselect options where each `{ columnName: columnText }` in `selections` is passed to
       {@link rxOptionFormTable.unselectByColumnText}.
       @function
       @param {Object[]} selections - Array of single key-value pairs to unselect.
       @returns {undefined}
       @example
       ```js
       unselectMany([{ 'Name': 'Item 1' },
                     { 'Name': 'Item 2' }]);
       ```
    */
    unselectMany: {
        value: function (selections) {
            var page = this;
            _.forEach(selections, function (selection) {
                page.unselectByColumnText(_.first(_.keys(selection)), _.first(_.values(selection)));
            });
        }
    },

    /**
       Select a row by the `columnName` that contains `columnText`.
       This function uses cssContainingText, be certain your column name and text is unique.
       @function
       @param {string} columnName - Name of the column that contains the cell to select.
       @param {string} columnText - Cell text that uniquely identifies the selection.
       @returns {undefined}
    */
    selectByColumnText: {
        value: function (columnName, columnText) {
            var page = this;
            var css = cssForCellInColumn(columnName);
            var cellElement = this.rootElement.element(by.cssContainingText(css, columnText));
            return rowNumberFromCell(cellElement).then(function (rowNumber) {
                optionFormRowFromElement(page.tblRows.get(rowNumber)).select();
            });
        }
    },

    /**
       Select options where each `{ columnName: columnText }` in `selections` is passed to
       {@link rxOptionFormTable.selectByColumnText}.
       @function
       @param {Object[]} selections - Array of single key-value pairs to select.
       @returns {undefined}
       @example
       ```js
       selectMany([{ 'Name': 'Item 1' },
                   { 'Name': 'Item 2' }]);
       ```
    */
    selectMany: {
        value: function (selections) {
            var page = this;
            _.forEach(selections, function (selection) {
                page.selectByColumnText(_.first(_.keys(selection)), _.first(_.values(selection)));
            });
        }
    },

    /**
       Return a list of row indexes that are currently selected.
       Get the row yourself if you need more information about the row's contents.
       @returns {number[]} All selected rows' indexes from the rxOptionFormTable.
    */
    selections: {
        get: function () {
            return this.tblRows.map(function (rowElement, index) {
                return optionIsSelected(rowElement).then(function (selected) {
                    if (selected) {
                        return index;
                    }
                });
            }).then(function (indexes) {
                // `.map` will return `undefined` for non-selected rows. Drop those results.
                return _.reject(indexes, _.isUndefined);
            });
        }
    },

    /**
       Return a list of row indexes that are currently disabled.
       @returns {number[]} All disabled row indexes from the rxOptionFormTable
     */
    disabledOptions: {
        get: function () {
            return this.tblRows.map(function (rowElement, index) {
                return optionIsDisabled(rowElement).then(function (disabled) {
                    if (disabled) {
                        return index;
                    }
                });
            }).then(function (indexes) {
                // `.map` will return `undefined` for enabled rows. Drop those results.
                return _.reject(indexes, _.isUndefined);
            });
        }
    }

};

/**
   @exports encore.rxOptionFormTable
 */
exports.rxOptionFormTable = {

    /**
       @param {WebElement} rxOptionFormTableElement - Web element to become an rxOptionFormTable object.
       @returns {rxOptionFormTable} Page object representing the rxOptionFormTable object.
     */
    initialize: function (rxOptionFormTableElement) {
        rxOptionFormTable.rootElement = {
            get: function () {
                return rxOptionFormTableElement;
            }
        };
        return Page.create(rxOptionFormTable);
    },

    /**
       @returns {rxOptionFormTable} Page object representing the _first_ rxOptionFormTable object found on the page.
     */
    main: (function () {
        rxOptionFormTable.rootElement = {
            get: function () {
                return $('rx-form-option-table');
            }
        };
        return Page.create(rxOptionFormTable);
    })()

};
