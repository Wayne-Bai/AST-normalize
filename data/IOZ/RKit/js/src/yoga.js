/**
 * RKit: yoga
 * move block from one place to another with reverting when breakpoint was leave
 *
 * Used data attributes
 * data-push="{selector}"
 * data-dir="{after|before|append|prepend}"
 * data-bp="{media{M|T|D}}"
 */
RKit.Yoga = (function($) {
   'use strict';

    var api, config;

    /* default config */
    config = {
        dataPush: "push"
    };

    api = {};

    /**
     * Blocks storage
     * @type {Array}
     */
    api.blocksStorage = [];

    /**
     * Cache all blocks
     */
    api.getBlocks = function() {
        var $block, $pushTo, pushDir, pushBreakPoint, $startBlockPos, startDir;
        $("[data-" + config.dataPush +"]").each(function() {
            $block = $(this);
            $pushTo = $($block.data(config.dataPush));
            pushDir = $block.data('dir');
            pushBreakPoint = $block.data('bp');

            /* find initial block position */
            if ($block.prev().length) {
                $startBlockPos = $block.prev();
                startDir = "after";
            } else if ($block.next().length) {
                $startBlockPos = $block.next();
                startDir = "before";
            } else {
                $startBlockPos = $block.parent();
                startDir = "append";
            }

            api.blocksStorage.push({
                $block: $block,
                $pushTo: $pushTo,
                pushDir: pushDir,
                pushBreakPoint: pushBreakPoint,
                $startBlockPos: $startBlockPos,
                startDir: startDir,
                isInsert: false
            });
        });
    };

    /**
     * Move block
     * @param media
     */
    api.move = function(media) {
        var i, len, $pushTo, $block, isInsert, breakPoint, dir, $startBlockPos, startDir;
        len = api.blocksStorage.length;
        for (i = 0; i < len; i++) {

            $pushTo = api.blocksStorage[i].$pushTo;
            $block = api.blocksStorage[i].$block;
            breakPoint = api.blocksStorage[i].pushBreakPoint;
            dir = api.blocksStorage[i].pushDir;
            $startBlockPos = api.blocksStorage[i].$startBlockPos;
            startDir = api.blocksStorage[i].startDir;
            isInsert = api.blocksStorage[i].isInsert;

            if ( breakPoint == media && !isInsert ) {
                switch (dir) {
                    case 'before':
                        $block.insertBefore($pushTo);
                        break;
                    case 'after':
                        $block.insertAfter($pushTo);
                        break;
                    case 'append':
                        $block.appendTo($pushTo);
                        break;
                    case 'prepend':
                        $block.prependTo($pushTo);
                        break;
                }
                api.blocksStorage[i].isInsert = true;
            } else if ( breakPoint == media && isInsert ) {
                switch (dir) {
                    case 'before':
                        $block.insertBefore($pushTo);
                        break;
                    case 'after':
                        $block.insertAfter($pushTo);
                        break;
                    case 'append':
                        $block.appendTo($pushTo);
                        break;
                    case 'prepend':
                        $block.prependTo($pushTo);
                        break;
                }
            } else if ( breakPoint !== media && isInsert ) {
                switch (startDir) {
                    case 'before':
                        $block.insertBefore($startBlockPos);
                        break;
                    case 'after':
                        $block.insertAfter($startBlockPos);
                        break;
                    case 'append':
                        $block.appendTo($startBlockPos);
                        break;
                    case 'prepend':
                        $block.prependTo($startBlockPos);
                        break;
                }
            }
        }
    };

    /**
     * Initialize
     */
    api.init = function() {
        api.getBlocks();
    };

    return api;
})(jQuery);

RKit.Y = RKit.Yoga;
