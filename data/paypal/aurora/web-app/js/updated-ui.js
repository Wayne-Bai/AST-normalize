// Custom jQuery methods
jQuery.fn.extend({
    // Returns true if there are any elements in the jQuery wrapped set. Otherwise returns false.
    exists: function() {
        return jQuery(this).size() >= 1;
    },
    // Gets or sets the src attribute of an element in the jQuery wrapped set.
    src: function(newSrc) {
        return jQuery(this).attr('src', newSrc);
    },
    // Determines whether or not the input is checked.
    checked: function() {
        return jQuery(this).is(":checked");
    },
    // Gets an array of values from form elements
    values: function() {
        var result = [];
        jQuery(this).each(function() {
            result.push(this.value);
        });
        return value;
    },
    // Prevent typing illegal characters in special text inputs.
    restrictCharInput: function(charPattern) {
        jQuery(this).keypress(function(e) {
            var key = String.fromCharCode(e.keyCode || e.which);
            // Is the key allowed?
            if (!(charPattern.test(key))) {
                // Cancel the original event
                e.preventDefault();
                e.stopPropagation();
            }
        });
    },
    // Changes the background to yellow then fades it away to nothing
    yellowFade: function(millis) {
        jQuery(this).effect("highlight", {}, millis || 1500);
    }
});

jQuery.extend({
    // Convert a browser-specific element collection into a regular array. Copied from Prototype's $A function.
    array: function(iterable) {
        if (!iterable) {
            return [];
        }
        if ('toArray' in Object(iterable)) {
            return iterable.toArray();
        }
        var length = iterable.length || 0, results = new Array(length);
        while (length--) {
            results[length] = iterable[length];
        }
        return results;
    }
});
function removeFromArray(valueToRemove, array) {
    array = jQuery.grep(array, function(arrayItem) { return arrayItem != valueToRemove; });
    return array;
}
function addToArray(valueToAdd, array) {
    array.push(valueToAdd);
}
function isInArray(valueToCheck, array) {
    return (jQuery.inArray(valueToCheck, array) !=-1);
}

function in_array(value, array)
{
    for (var i = 0; i < array.length; i++)
    {
        if (array[i] == value)
            return true;
    }
    return false;
}
var config = {
    minRowCount: 3,
    maxDataCellCount: 9000,
    headerRowCount: 1
};

var prepareTableRows = function(table) {
    var r, c, row, cells, text;
    var rows = table.rows;
    for (r = 0; r < rows.length; r++) {
        row = rows[r];
        text = '';
        cells = row.cells;
        for (c = 0; c < cells.length; c++) {
            text += jQuery(cells[c]).text() + ' ';
        }
        row.filterContent = text.toLowerCase();
    }
    return true;
};

var runTableFilter = function(table) {

    var input, filterString, rowLists, jHits;
    input = this;
    filterString = input.value.toLowerCase();

    if (filterString && !jQuery(table).hasClass('fixedWidth')) {
        jQuery(table).width(jQuery(table).data('initWidth'));
    }
    else {
        resetAndRecordTableWidth(table);
    }

    // If the window is narrower than the table then keeping the old table width is bad
    if (jQuery(window).width() < jQuery(table).width()) {
        resetAndRecordTableWidth(table);
    }

    rowLists = identifyRows(table, filterString);
    jHits = jQuery(rowLists.hits);
    setOddAndEvenStylingOnRows(jHits).show();
    jQuery(rowLists.misses).hide();

    jQuery(table.filterCounter).text(rowLists.hits.length);
    return true;
};

var identifyRows = function(table, filterString) {
    var r, row, show;
    var rowLists = {
        hits: [],
        misses: []
    };
    var allRows = jQuery.array(table.rows);
    // All except header rows
    for (r = 0; r < config.headerRowCount; r++) {
        allRows.shift();
    }
    if (filterString) {
        for (r = 0; r < allRows.length; r++) {
            row = allRows[r];
            show = true;
            jQuery(filterString.split(' ')).each(function() {
                show = show && row.filterContent.indexOf(this) >= 0
            });
            if (show) {
                rowLists.hits.push(row);
            }
            else {
                rowLists.misses.push(row);
            }
        }
    }
    // No filter string? Then show all rows except header row.
    else {
        rowLists.hits = allRows;
    }
    return rowLists;
};

var resetAndRecordTableWidth = function(table) {
    jQuery(table).width('');
    jQuery(table).data('initWidth', jQuery(table).width() + 1);
};

var findControlBar = function(table) {
    var box = jQuery(table).parents('.box')[0];
    var toolbar = jQuery(box).find('.box-toolbar')[0];
    return jQuery(toolbar);
};

var addTableFilter = function(table, filterIndex) {
    var input, counter, filterContainer, timer;
    if (!filterIndex)
        filterIndex = '';

    // Avoid adding two inputs for a table on back button press
    if (table.filterInput) {
        return;
    }
    // Set the table width explicitly so it won't change when wide rows vanish
    resetAndRecordTableWidth(table);
    input = jQuery('<input placeholder="Filter..." id="filter' + filterIndex + '" type="text"/>').keyup(
            function() {
                var input = this;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    runTableFilter.call(input, table);
                }, 300);
                return true;
            }
    ).keypress(
            function(event) {
                var key = event.keyCode || event.which;
                return key != 13; // Allow normal behavior for all keys except Enter
            }
    );
    counter = jQuery('<span class="label label-blue" id="counter' + filterIndex + '"></span>');
    table.filterInput = input[0];
    table.filterCounter = counter[0];
    prepareTableRows(table);
    filterContainer = jQuery('<li class="filter" title="Separate word fragments by spaces for advanced filtering"/>');
    filterContainer.append(input).append(counter);

    var controlBar = findControlBar(table);
    controlBar.append(filterContainer);

    input.focus();
    runTableFilter.call(input[0], table);
};

var addInitializeButton = function(table) {
    var jInitListFilterButton = jQuery('<button id="initListFilter" class="initListFilter"><div>Initialize List Filter</div></button>');
    jInitListFilterButton.click(function(e) {
        e.preventDefault();
        setTimeout(function() {
            addTableFilter(table);
        }, 50);
        jInitListFilterButton.remove();
    });

    findControlBar(table).append(jInitListFilterButton);
    jQuery("input[type=submit], .buttons button, .buttons a").button();
};

var getStorageKey = function() {
    if (!config.storageKey) {
        config.storageKey = window.location.href + 'ListFilter';
    }
    return config.storageKey;
};

var setUpTableFilters = function() {
    var firstTable, jFirstInput;
    jQuery('table.filtered').each(function() {
        var i,
                rows = this.rows,
                cellCount = 0,
                longestRowCellCount = 0,
                doFilterInitOnPageLoad = false;
        // Fast approximation of cell count. Number of rows times longest of the first few rows.
        if (this.rows.length >= config.minRowCount) {
            for (i = 0; i < config.minRowCount; i++) {
                longestRowCellCount = Math.max(longestRowCellCount, rows[i].cells.length);
            }
            cellCount = longestRowCellCount * rows.length;
            if (cellCount <= config.maxDataCellCount) {
                doFilterInitOnPageLoad = true;
            }
            if (jQuery(this).hasClass('twoTablesOnPage') && cellCount <= config.maxDataCellCount)
                doFilterInitOnPageLoad = true;
        }

        if (doFilterInitOnPageLoad) {
            if (jQuery(this).hasClass('twoTablesOnPage'))
                addTableFilter(this, '_1');
            else
                addTableFilter(this);
            // Keep a reference to the first filtered table and its filter input.
            if (!firstTable) {
                firstTable = this;
                jFirstInput = jQuery(this.filterInput);
            }
        } else if (cellCount) {
            addInitializeButton(this);
        }
    });
    if (jFirstInput) {
        jFirstInput.focus();
    }

};
var setOddAndEvenStylingOnRows = function(jRows) {
    // Zebra-striping visible rows of a table where some rows are hidden. Not possible in CSS.
    // CSS even/odd is the opposite of Java iteration even/odd. Avoid page load flicker by reversing CSS meanings.
    jRows.filter(':even').removeClass('even').addClass('odd');
    jRows.filter(':odd').removeClass('odd').addClass('even');
    return jRows;
};
$(function() {
    setUpTableFilters();
    /*setTimeout(setUpTableFilters, 50);*/
});
/**
 SortTable
 version 2
 7th April 2007
 Stuart Langridge, www.kryogenix.org/code/browser/sorttable/
 
 Instructions:
 Add class="sortable" to any table you'd like to make sortable
 Click on the headers to sort
 
 Thanks to many, many people for contributions and suggestions.
 Licenced as X11: www.kryogenix.org/code/browser/licence.html
 This basically means: do what you want with it.
 */
var setUpTableSortability = function() {

    var sorttable = {
        init: function() {
            // quit if this function has already been called
            if (arguments.callee.done) {
                return;
            }
            // flag this function so we don't do the same thing twice
            arguments.callee.done = true;

            if (!document.createElement || !document.getElementsByTagName) {
                return;
            }

            sorttable.DATE_RE = /^(\d\d?)[\/\.\-](\d\d?)[\/\.\-]((\d\d)?\d\d)$/;

            jQuery('table.sortable').each(function() {
                sorttable.makeSortable(this);
            });
        },
        makeSortable: function(table) {
            var i, sortbottomrows, the, tfo, headrow, mtch, sortrevind, sortfwdind, row_array, col, rows, tb, override;

            var headerClickHandler = function() {

                // Always try to return focus to the filter input for this table, and move cursor to end of line
                // in IE by replacing value with same value.
                if (table.filterInput) {
                    jQuery(table.filterInput).focus().val(table.filterInput.value);
                }

                var theadrow;
                if (this.className.search(/\bsorttable_sorted\b/) != -1) {
                    // if we're already sorted by this column, just
                    // reverse the table, which is quicker
                    sorttable.reverse(this.sorttable_tbody);
                    this.className = this.className.replace('sorttable_sorted',
                            'sorttable_sorted_reverse');
                    this.removeChild(document.getElementById('sorttable_sortfwdind'));
                    sortrevind = document.createElement('span');
                    sortrevind.id = "sorttable_sortrevind";
                    sortrevind.innerHTML = jQuery.browser.ie ? '&nbsp<font face="webdings">5</font>' : '&nbsp;&#x25B4;';
                    this.appendChild(sortrevind);
                    return;
                }
                if (this.className.search(/\bsorttable_sorted_reverse\b/) != -1) {
                    // if we're already sorted by this column in reverse, just
                    // re-reverse the table, which is quicker
                    sorttable.reverse(this.sorttable_tbody);
                    this.className = this.className.replace('sorttable_sorted_reverse',
                            'sorttable_sorted');
                    this.removeChild(document.getElementById('sorttable_sortrevind'));
                    sortfwdind = document.createElement('span');
                    sortfwdind.id = "sorttable_sortfwdind";
                    sortfwdind.innerHTML = jQuery.browser.ie ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
                    this.appendChild(sortfwdind);
                    return;
                }

                // remove sorttable_sorted classes
                theadrow = this.parentNode;
                jQuery(theadrow).find('th, td').removeClass('sorttable_sorted sorttable_sorted_reverse');
                sortfwdind = document.getElementById('sorttable_sortfwdind');
                if (sortfwdind) {
                    sortfwdind.parentNode.removeChild(sortfwdind);
                }
                sortrevind = document.getElementById('sorttable_sortrevind');
                if (sortrevind) {
                    sortrevind.parentNode.removeChild(sortrevind);
                }

                this.className += ' sorttable_sorted';
                sortfwdind = document.createElement('span');
                sortfwdind.id = "sorttable_sortfwdind";
                sortfwdind.innerHTML = jQuery.browser.ie ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
                this.appendChild(sortfwdind);

                // build an array to sort. This is a Schwartzian transform thing,
                // i.e., we "decorate" each row with the actual sort key,
                // sort based on the sort keys, and then put the rows back in order
                // which is a lot faster because you only do getInnerText once per row
                row_array = [];
                col = this.sorttable_columnindex;
                rows = this.sorttable_tbody.rows;
                for (var j = 0; j < rows.length; j++) {
                    row_array[row_array.length] = [sorttable.getInnerText(rows[j].cells[col]), rows[j]];
                }
                /* If you want a stable sort, uncomment the following line */
                sorttable.shaker_sort(row_array, this.sorttable_sortfunction);
                /* and comment out this one */
                //row_array.sort(this.sorttable_sortfunction);

                tb = this.sorttable_tbody;
                for (j = 0; j < row_array.length; j++) {
                    tb.appendChild(row_array[j][1]);
                }

                setOddAndEvenStylingOnRows(jQuery(tb).find('tr:visible'));
            };

            if (table.getElementsByTagName('thead').length === 0) {
                // table doesn't have a tHead. Since it should have, create one and
                // put the first table row in it.
                the = document.createElement('thead');
                the.appendChild(table.rows[0]);
                table.insertBefore(the, table.firstChild);
            }
            // Safari doesn't support table.tHead, sigh
            if (!table.tHead) {
                table.tHead = table.getElementsByTagName('thead')[0];
            }

            if (table.tHead.rows.length != 1) {
                return;
            } // can't cope with two header rows

            // Sorttable v1 put rows with a class of "sortbottom" at the bottom (as
            // "total" rows, for example). This is B&R, since what you're supposed
            // to do is put them in a tfoot. So, if there are sortbottom rows,
            // for backwards compatibility, move them to tfoot (creating it if needed).
            sortbottomrows = [];
            for (i = 0; i < table.rows.length; i++) {
                if (table.rows[i].className.search(/\bsortbottom\b/) != -1) {
                    sortbottomrows[sortbottomrows.length] = table.rows[i];
                }
            }
            if (sortbottomrows.length >= 1) {
                if (!table.tFoot) {
                    // table doesn't have a tfoot. Create one.
                    tfo = document.createElement('tfoot');
                    table.appendChild(tfo);
                }
                for (i = 0; i < sortbottomrows.length; i++) {
                    tfo.appendChild(sortbottomrows[i]);
                }
            }

            // work through each column and calculate its type
            headrow = table.tHead.rows[0].cells;
            for (i = 0; i < headrow.length; i++) {
                // manually override the type with a sorttable_type attribute
                if (!(headrow[i].className.match(/\bsorttable_nosort\b/)) &&
                        !(headrow[i].className.match(/\bcheckboxTd\b/))) { // skip this col
                    mtch = headrow[i].className.match(/\bsorttable_([a-z0-9]+)\b/);
                    if (mtch) {
                        override = mtch[1];
                    }
                    if (mtch && typeof sorttable["sort_" + override] == 'function') {
                        headrow[i].sorttable_sortfunction = sorttable["sort_" + override];
                    } else {
                        headrow[i].sorttable_sortfunction = sorttable.guessType(table, i);
                    }
                    // make it clickable to sort
                    headrow[i].sorttable_columnindex = i;
                    headrow[i].sorttable_tbody = table.tBodies[0];
                    jQuery(headrow[i]).click(headerClickHandler);
                }
            }
        },
        guessType: function(table, column) {
            var text, possdate, first, second;
            // guess the type of a column based on its first non-blank row
            var sortfn = sorttable.sort_alpha;
            for (var i = 0; i < table.tBodies[0].rows.length; i++) {
                text = sorttable.getInnerText(table.tBodies[0].rows[i].cells[column]);
                if (text != '') {
                    if (text.match(/^-?[$]?[\d,.]+%?$/)) {
                        return sorttable.sort_numeric;
                    }
                    // check for a date: dd/mm/yyyy or dd/mm/yy
                    // can have / or . or - as separator
                    // can be mm/dd as well
                    possdate = text.match(sorttable.DATE_RE);
                    if (possdate) {
                        // looks like a date
                        first = parseInt(possdate[1], 10);
                        second = parseInt(possdate[2], 10);
                        if (first > 12) {
                            // definitely dd/mm
                            return sorttable.sort_ddmm;
                        } else if (second > 12) {
                            return sorttable.sort_mmdd;
                        } else {
                            // looks like a date, but we can't tell which, so assume
                            // that it's dd/mm (English imperialism!) and keep looking
                            sortfn = sorttable.sort_ddmm;
                        }
                    }
                }
            }
            return sortfn;
        },
        getInnerText: function(node) {
            // gets the text we want to use for sorting for a cell.
            // strips leading and trailing whitespace.
            // this is *not* a generic getInnerText function; it's special to sorttable.
            // for example, you can override the cell text with a customkey attribute.
            // it also gets .value for <input> fields.

            var hasInputs = (typeof node.getElementsByTagName == 'function') &&
                    node.getElementsByTagName('input').length;
            var sortableText = '';
            var i, innerText = '';

            if (node.getAttribute("sorttable_customkey") !== null) {
                sortableText = node.getAttribute("sorttable_customkey");
            }
            else if (typeof node.textContent != 'undefined' && !hasInputs) {
                sortableText = node.textContent;
            }
            else if (typeof node.innerText != 'undefined' && !hasInputs) {
                sortableText = node.innerText;
            }
            else if (typeof node.text != 'undefined' && !hasInputs) {
                sortableText = node.text;
            }
            else {
                switch (node.nodeType) {
                    case 3:
                        sortableText = (node.nodeName.toLowerCase() === 'input') ? node.value : node.nodeValue;
                        break;
                    case 4:
                        sortableText = node.nodeValue;
                        break;
                    case 1:
                    case 11:
                        for (i = 0; i < node.childNodes.length; i++) {
                            innerText += sorttable.getInnerText(node.childNodes[i]);
                        }
                        sortableText = innerText;
                        break;
                    default:
                        sortableText = '';
                }
            }
            return sortableText.replace(/^\s+|\s+$/g, '');
        },
        reverse: function(tbody) {
            var i;
            // reverse the rows in a tbody
            var newrows = [];
            for (i = 0; i < tbody.rows.length; i++) {
                newrows[newrows.length] = tbody.rows[i];
            }
            for (i = newrows.length - 1; i >= 0; i--) {
                tbody.appendChild(newrows[i]);
            }
        },
        /* sort functions
         each sort function takes two parameters, a and b
         you are comparing a[0] and b[0] */
        sort_numeric: function(a, b) {
            var aa = parseFloat(a[0].replace(/[^0-9.\-]/g, ''));
            if (isNaN(aa)) {
                aa = 0;
            }
            var bb = parseFloat(b[0].replace(/[^0-9.\-]/g, ''));
            if (isNaN(bb)) {
                bb = 0;
            }
            return aa - bb;
        },
        sort_alpha: function(a, b) {
            if (a[0] == b[0]) {
                return 0;
            }
            if (a[0] < b[0]) {
                return -1;
            }
            return 1;
        },
        sort_ddmm: function(a, b) {
            var mtch = a[0].match(sorttable.DATE_RE);
            var y = mtch[3];
            var m = mtch[2];
            var d = mtch[1];
            if (m.length == 1) {
                m = '0' + m;
            }
            if (d.length == 1) {
                d = '0' + d;
            }
            var dt1 = y + m + d;
            mtch = b[0].match(sorttable.DATE_RE);
            y = mtch[3];
            m = mtch[2];
            d = mtch[1];
            if (m.length == 1) {
                m = '0' + m;
            }
            if (d.length == 1) {
                d = '0' + d;
            }
            var dt2 = y + m + d;
            if (dt1 == dt2) {
                return 0;
            }
            if (dt1 < dt2) {
                return -1;
            }
            return 1;
        },
        sort_mmdd: function(a, b) {
            var mtch = a[0].match(sorttable.DATE_RE);
            var y = mtch[3];
            var d = mtch[2];
            var m = mtch[1];
            if (m.length == 1) {
                m = '0' + m;
            }
            if (d.length == 1) {
                d = '0' + d;
            }
            var dt1 = y + m + d;
            mtch = b[0].match(sorttable.DATE_RE);
            y = mtch[3];
            d = mtch[2];
            m = mtch[1];
            if (m.length == 1) {
                m = '0' + m;
            }
            if (d.length == 1) {
                d = '0' + d;
            }
            var dt2 = y + m + d;
            if (dt1 == dt2) {
                return 0;
            }
            if (dt1 < dt2) {
                return -1;
            }
            return 1;
        },
        shaker_sort: function(list, comp_func) {
            // A stable sort function to allow multi-level sorting of data
            // see: en.wikipedia.org/wiki/Cocktail_sort
            // thanks to Joseph Nahmias
            var i, q;
            var b = 0;
            var t = list.length - 1;
            var swap = true;

            while (swap) {
                swap = false;
                for (i = b; i < t; ++i) {
                    if (comp_func(list[i], list[i + 1]) > 0) {
                        q = list[i];
                        list[i] = list[i + 1];
                        list[i + 1] = q;
                        swap = true;
                    }
                } // for
                t--;

                if (!swap) {
                    break;
                }

                for (i = t; i > b; --i) {
                    if (comp_func(list[i], list[i - 1]) < 0) {
                        q = list[i];
                        list[i] = list[i - 1];
                        list[i - 1] = q;
                        swap = true;
                    }
                } // for
                b++;

            } // while(swap)
        }
    };

    jQuery(document).ready(function() {
        setTimeout(sorttable.init, 10);
    });
};
setUpTableSortability();


