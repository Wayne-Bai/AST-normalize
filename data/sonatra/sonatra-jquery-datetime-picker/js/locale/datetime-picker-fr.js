/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global define*/
/*global jQuery*/

/**
 * @typedef {object} define.amd
 */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'sonatra-jquery-datetime-picker'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    // DATETIME PICKER CLASS DEFINITION
    // ================================

    $.fn.datetimePicker.Constructor.LANGUAGES = $.extend(true, {}, $.fn.datetimePicker.Constructor.LANGUAGES, {
        fr: $.extend(true, $.fn.datetimePicker.Constructor.LANGUAGES.en, {
            date:    'Date',
            time:    'Heure',
            cancel:  'Annuler',
            clear:   'Effacer',
            define:  'Definir'
        })
    });

}));
