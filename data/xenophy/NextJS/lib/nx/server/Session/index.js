/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/*!
 * Next JS
 * Copyright (c)2011 Xenophy.CO.,LTD All rights Reserved.
 * http://www.xenophy.com
 */

// {{{ require

NX.require('NX.data.Store');
NX.require('NX.data.MemoryStore');
NX.require('NX.data.FileStore');

// }}}
// {{{ NX.server.Session

NX.define('NX.server.Session', {

    // {{{ alternateClassName

    alternateClassName: 'NX.Session',

    // }}}
    // {{{ constructor

    constructor: require('./constructor'),

    // }}}
    // {{{ resetMaxAge

    resetMaxAge: require('./resetMaxAge'),

    // }}}
    // {{{ save

    save: require('./save'),

    // }}}
    // {{{ resetLastAccess

    resetLastAccess: require('./resetLastAccess'),

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
