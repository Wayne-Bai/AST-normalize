/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/*!
 * Next JS
 * Copyright (c)2011 Xenophy.CO.,LTD All rights Reserved.
 * http://www.xenophy.com
 */

// {{{ NX.app.Dispatcher

NX.define('NX.app.Dispatcher', {

    // {{{ requires

    requires: [
        'NX.app.controller.Abstract'
    ],

    // }}}
    // {{{ alternateClassName

    alternateClassName: require('./alternateClassName'),

    // }}}
    // {{{ singleton

    singleton: require('./singleton'),

    // }}}
    // {{{ dispatch

    dispatch: require('./dispatch')

    // }}}

});

// }}}

/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
