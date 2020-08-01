/*jshint node:true*/
var Page = require('astrolabe').Page;

/**
   This is a shared function for getting one column's sort direction, and all columns' sort directions.
   @private
 */
var currentSortDirection = function (columnElement) {
    var imgSortIcon = columnElement.$('.sort-icon');
    return imgSortIcon.getAttribute('style').then(function (style) {
        if (style.indexOf('hidden') > -1) {
            // Sort arrow hidden; not sorted.
            return -1;
        } else {
            return imgSortIcon.getAttribute('class').then(function (className) {
                return className.indexOf('asc') > -1 ? 1 : 0;
            });
        }
    });
};

/**
   @namespace
 */
var rxSortableColumn = {

    btnSort: {
        get: function () {
            return this.rootElement.$('.sort-action');
        }
    },

    name: {
        get: function () {
            return this.rootElement.$('.sort-action .ng-scope').getText();
        }
    },

    /**
       Will repeatedly click the sort button until the column is sorted ascending.
       @function
       @returns {undefined}
     */
    sortAscending: {
        value: function () {
            this.sort({ isAscending: true });
        }
    },

    /**
       Will repeatedly click the sort button until the column is sorted descending.
       @function
       @returns {undefined}
     */
    sortDescending: {
        value: function () {
            this.sort({ isAscending: false });
        }
    },

    /**
       Prefer using {@link rxSortableColumn.sortAscending} and {@link rxSortableColumn.sortDescending} over this.
     */
    sort: {
        value: function (namedParams, attempts) {
            var page = this;
            // this can get stuck if sorting isn't hooked up correctly and doesn't respond to clicks to sort
            if (attempts === undefined) {
                attempts = 0;
            }

            return this.currentSortDirection.then(function (sortDirection) {
                if (attempts > 3) {
                    return page.name.then(page.ColumnSortRequestUnresponsiveError.thro);
                }

                /*jshint eqeqeq: false*/
                // Coercing -1 to Boolean results in -1 === true. We don't want that.
                // It's easier to leave as is since -1 != true and -1 != false.
                // Meaning we'll always sort the list at least once if it's currently unsorted.
                if (sortDirection != namedParams.isAscending) {
                    page.btnSort.click();
                    attempts += 1;
                    page.sort(namedParams, attempts);
                }
            });
        }
    },

    sortProperty: {
        get: function () {
            return this.rootElement.getAttribute('sort-property');
        }
    },

    /**
       @returns {Array} A list of all cell text in this column.
     */
    data: {
        get: function () {
            var defaultFn = function (cellElements) {
                return cellElements.map(function (cellElement) {
                    return cellElement.getText();
                });
            };

            return this.getDataUsing(defaultFn);
        }
    },

    /**
       Return a list of all cell contents in this column.
       Passes all cell elements to `customFn`, or if undefined, will return just the text of each cell.
       The second argument, `allByCssSelectorString` is used when your column's binding
       (which is used by `by.repeater().column`) is for some reason unreachable by protractor.
       A common reason why this wouldn't be the case is because the binding is not used as text
       within a web element, but instead used within the tag's attrs. An example of this is illustrated here:
       [Binding inside of a tag's attributes.]{@link http://goo.gl/HPjLU7}
       In these cases, you should specify a css selector that will select each element in the column you
       care about, since `by.binding` is not an option.
       @param {function} [customFn] - Specific work that must occur to all column cell elements.
       @param {String} [allByCssSelectorString] - Fallback `$$('.all-by-css')`-style call to select column cells.
       @returns {Array} Dependent on the return value of `customFn`.
       @example
       ```js
       var sumCurrency = function (columnElements) {
           return columnElements.reduce(function (acc, columnElement) {
               return columnElement.getText().then(function (text) {
                   return acc + encore.rxForm.currencyToPennies(text);
               });
           }, 0);
       };

       charges.column('Usage Charges').getDataUsing(sumCurrency).then(function (sum) {
           expect(currentUsage.estimate).to.eventually.equal(sum);
       });
       ```
     */
    getDataUsing: {
        value: function (customFn, allByCssSelectorString) {
            if (customFn === undefined) {
                return this.data;
            }

            var page = this;
            return this.sortProperty.then(function (sortProperty) {
                if (page.repeaterString === undefined) {
                    page.CellUndiscoverableError.thro('data');
                }

                if (allByCssSelectorString === undefined) {
                    return customFn(element.all(by.repeater(page.repeaterString).column(sortProperty)));
                } else {
                    var elements = element.all(by.repeater(page.repeaterString));
                    return customFn(elements.$$(allByCssSelectorString));
                }
            });
        }
    },

    /**
       The current sort direction of the column.

       - Ascending sort:  (1)  means the arrow is pointed down. [0-9, a-z]
       - Descending sort: (0)  means the arrow is pointed up.   [z-a, 9-0]
       - Not sorted:     (-1)  means there is no arrow for this column.
       @returns {Integer}: 1, 0, or -1 based on direction.
       Use {@link encore.module:rxSortableColumn.sortDirections} when testing your columns.
     */
    currentSortDirection: {
        get: function () {
            return currentSortDirection(this.rootElement);
        }
    },

    CellUndiscoverableError: {
        get: function () { return this.exception('repeaterString required at initialization to use'); }
    },

    ColumnSortRequestUnresponsiveError: {
        get: function () { return this.exception('no sort activity after clicking multiple times for column'); }
    }

};

/**
   @namespace
 */
var rxSortableColumns = {

    tblColumns: {
        get: function () {
            return this.rootElement.$$('rx-sortable-column');
        }
    },

    /**
       Return all column names in `tableElement`.
       If any special work needs to be done, pass in a custom `mapFn` to `getNamesUsing` instead.
       @returns {Array}: An array of strings representing text in each column in the table.
     */
    names: {
        get: function () {
            return this.getNamesUsing(function (columnElement) {
                return columnElement.$('.sort-action .ng-scope').getText();
            });
        }
    },

    getNamesUsing: {
        value: function (mapFn) {
            return this.tblColumns.map(mapFn);
        }
    },

    sorts: {
        get: function () {
            return this.tblColumns.map(currentSortDirection);
        }
    }

};

/**
   @exports encore.rxSortableColumn
 */
exports.rxSortableColumn = {

    /**
       @function
       @param {WebElement} rxSortableColumnElement - WebElement to be transformed into an rxSortableColumn object.
       @param {String} [repeaterString] - Repeater string from the table. Required for {@link rxSortableColumn.data}
       @returns {Page} Page object representing the {@link rxSortableColumn} object.
     */
    initialize: function (rxSortableColumnElement, repeaterString) {
        rxSortableColumn.rootElement = {
            get: function () { return rxSortableColumnElement; }
        };

        rxSortableColumn.repeaterString = {
            get: function () { return repeaterString; }
        };

        return Page.create(rxSortableColumn);
    },

    /**
       @function
       @param {WebElement} tableElement - Web element of the entire `<table>` node.
       @returns {Page} rxSortableColumns Page object representing the {@link rxSortableColumns} object.
     */
    byTable: function (tableElement) {
        rxSortableColumns.rootElement = {
            get: function () { return tableElement; }
        };

        return Page.create(rxSortableColumns);
    },

    /**
       @constant
       @returns {Object} sortDirections Lookup of integer codes for sort directions from human-readable ones.
       @example
       ```js
       var sorts = encore.rxSortableColumn.sorts;
       // ...
       it('should sort the column ascending by default', function () {
           expect(column.currentSortDirection).to.eventually.equal(sorts.ascending);
       });
       ```
     */
    sortDirections: {
        ascending: 1,
        descending: 0,
        notSorted: -1,
    }

};
