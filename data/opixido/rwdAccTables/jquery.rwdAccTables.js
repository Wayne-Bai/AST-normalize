/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


(function($) {
    /**
     * To count all the tables in the same page
     * @type Number
     */
    var nbTableResp = 1;

    $.fn.rwdAccTables = function(options) {

        var options = $.extend({}, $.fn.rwdAccTables.defaults, options);

        return this.each(function() {


            var self = $(this);

            /**
             * First DATA cell
             * From this cell we will find the number of columns for the row headers
             * And the number of rows for the columns headers
             * 
             * This is the first TD (data) cell found after the first row 
             * of the table
             */
            var firstCell = (self.find('tr:gt(0) td:eq(0)'));

            if (!firstCell) {
                /**
                 * No data cell OR no header line ...
                 * nothing to do for us here
                 */
                return;
            }

            /**
             * Number of columns with headers before every data cells
             */
            var nbColHeaders = 0,
                    /**
                     * Number of rows of headers above the data cells
                     */
                    nbRowHeaders = 0,
                    /**
                     * Uniqid of our menu
                     */
                    ide = nbTableResp,
                    /**
                     * Html obj of our list of checkboxes
                     */
                    ul = false;

            nbTableResp++;

            /**
             * Finding the number of columns for the row headers
             */
            self.findNbColHeaders = function() {
                /**
                 * The first should obviously have headings
                 */
                var colHeaders = firstCell.prevAll('th');

                /**
                 * Thoose headings might be spanned across many cells ...
                 */
                colHeaders.each(function() {
                    if ($(this).attr('colspan') > 0) {
                        nbColHeaders += $(this).attr('colspan');
                    } else {
                        nbColHeaders++;
                    }
                });
            };

            /**
             * On init / windows resize
             */
            self.update = function() {

                /**
                 * Getting all checkbox
                 */
                var inputs = ul.find('input').get();

                /**
                 * enabling them all to view all columns
                 */
                $(inputs).each(function() {
                    this.checked = true;
                    $(this).trigger('change');
                });

                /**
                 * Comparing to container width
                 */
                var pW = self.parent().width();
                var inp = false;
                while (self.width() > pW && inputs.length) {
                    /**
                     * While our table is larger than it's container
                     * we reduce the column list (starting from the right side)
                     */
                    inp = inputs.pop();
                    inp.checked = false;

                    /**
                     * And we trigger the "change" action to really hide the columns
                     */
                    $(inp).trigger('change');
                }

                ul.prev('a').html(options.text.replace('[NB]', ul.find('input:not(:checked)').length));
            };

            /**
             * Finds out the number of header lines above data cells
             */
            self.findNbRowHeaders = function() {
                /**
                 * From the first "data" cell, we find it's containing TR
                 * And then count all previous TRs
                 */
                var colHeaders = firstCell.closest('tr').prevAll('tr');
                nbRowHeaders = colHeaders.length;
            };


            self.toggleMenu = function(e) {
                e.preventDefault();
                ul.fadeToggle();

            };

            /**
             * Initialisation
             * @returns 
             */
            self.init = function() {

                /**
                 * Needed calculations
                 */
                self.findNbColHeaders();
                self.findNbRowHeaders();

                /**
                 * Default HTML structure for the menu inserted before our 
                 * table element
                 */
                self.before('<div class="tableHeaderToggle"><a href="#tableHeaderToggle_' + ide + '"></a><ul id="tableHeaderToggle_' + ide + '"></ul></div>');

                /**
                 * Our list of checkboxes
                 */
                ul = $('#tableHeaderToggle_' + ide + '');
                self.addClass('rwdAccTables_' + ide);


                /**
                 * Hidden by default
                 */
                ul.hide();

                ul.prev().click(self.toggleMenu);

                /**
                 * All the header cells found ABOVE data celles
                 */
                var topHeaders = self.find('tr:lt(' + nbRowHeaders + ') th');

                /**
                 * Adding each header to the checkbox list
                 */
                topHeaders.each(function() {
                    /**
                     * If this header cell has no data in it it's probably
                     * an empty useless cell
                     */
                    if ($(this).text().trim() === "") {
                        return;
                    }

                    /**
                     * Looking and parsing all "headers" attribute for this cell
                     */
                    var headers = $(this).attr('headers').trim().split(' ');
                    headers = headers.filter(function(v) {
                        return v !== '';
                    });

                    var obj = ul;
                    if (headers.length > 0) {
                        /**
                         * If this one has "headers" then it should not be inside 
                         * the first UL (first level)
                         * 
                         * So we are adding it to the appropriate LI
                         * (our first header) @todo OR LAST ?
                         */
                        obj = $('#checkfor_' + ide + '_' + headers[0]);
                        robj = obj.find('ul');
                        if (robj.length === 0) {
                            /**
                             * If this LI doesn't have an UL inside ... we add it
                             */
                            obj.append('<ul></ul>');
                            robj = obj.find('ul');
                        }
                        obj = robj;
                    }
                    /**
                     * And we append our checbox to the list !
                     */
                    $(obj).append('<li id="checkfor_' + ide + '_' + $(this).attr('id') + '">\
                                <label \
                                    for="respCols_' + ide + '_' + $(this).attr('id') + '" >\
                                <input \n\
                                id="respCols_' + ide + '_' + $(this).attr('id') + '"\
                                type="checkbox" class="respCols" \
                                name="respCols[]" \
                                value="' + $(this).attr('id') + '" \
                                checked="checked" /> \
                                ' + $(this).text() + '</label></li>');
                });

                /**
                 * Each inputs has it's change function
                 */
                $('#tableHeaderToggle_' + ide + ' input').change(self.onChangeInput);



                /**
                 * Updating when needed
                 */
                $(document).ready(self.update);
                $(window).resize(self.update);
            };

            /**
             * When an input is checked or unchecked
             * ...
             */
            self.onChangeInput = function() {
                /**
                 * It's value contains the header name
                 */
                var val = $(this).val();

                /**
                 * So we find the matching TR (with ID) and all the cells
                 * refering to this via HEADERS
                 */
                var objs = self.find('#' + val + ', [headers~="' + val + '"]');

                /**
                 * Hidding / showing ...
                 */
                if ($(this).is(':checked')) {
                    objs.removeClass('hidden');
                }
                else {
                    objs.addClass('hidden');
                }

            };

            self.init();

            return this;
        });
    };

    $.fn.rwdAccTables.defaults = {
        text: "[NB] hidden columns ...",
        divClass: "tableHeaderToggle"
    };

}(jQuery));