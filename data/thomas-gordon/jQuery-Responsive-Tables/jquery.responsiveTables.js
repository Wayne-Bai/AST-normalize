(function($) {

    "use strict";

    $.fn.extend({

        tinyTables: function(options) {
            var defaults = {
                shrinkAt: 900,
                tableClass: 'tiny-tables',
                tableWrapperClass: 'tiny-tables-wrap' ,
                scrollingClass: 'tiny-tables-scroll',
                pinnedClass: 'tiny-tables-pinned'
            };

            options =  $.extend(defaults, options);

            return this.each(function() {
                var originalTable = $(this);

                originalTable.addClass(options.tableClass);

                updateTables(originalTable);

                $(window).bind("resize", function(){
                    updateTables(originalTable);
                });
            });

            function updateTables(originalTable) {
                if (($(window).width() < options.shrinkAt)) {
                    splitTable(originalTable);
                } else if (($(window).width() > options.shrinkAt)) {
                    undoSplit(originalTable);
                }
            }

            function splitTable(originalTable) {
                if (!originalTable.parent().hasClass(options.scrollingClass)) {
                    originalTable.wrap('<div class="' + options.tableWrapperClass + '" />');
                    var pinnedTable = originalTable.clone();
                    originalTable.closest('.' + options.tableWrapperClass).append(pinnedTable);
                    originalTable.wrap('<div class="' + options.scrollingClass + '" />');
                    pinnedTable.wrap('<div class="' + options.pinnedClass + '" />');
                }
            }

            function undoSplit(originalTable) {
                if (originalTable.parent().hasClass(options.scrollingClass)) {
                    $('.' + options.pinnedClass).remove();
                    originalTable.unwrap();
                    originalTable.unwrap();
                }
            }
        }
    });
})(jQuery);
