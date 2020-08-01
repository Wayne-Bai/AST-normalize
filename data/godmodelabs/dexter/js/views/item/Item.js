define([
    'dX/ItemView'
], function(
    dXItemView
) {

    /**
     * Example of a simple item view.
     * It does not have to be in a subfolder, but if any view is,
     * you must prefix its dXName with the folder name.
     *
     * @class ItemView
     * @author Riplexus <riplexus@gmail.com>
     */

    return dXItemView.extend(/** @lends ItemView.prototype */{
        dXName: 'item__Item',

        /**
         * Bind the model attribute 'key' as text 
         * to the <li> node in our template.
         */
        
        bindings: {
            'li': 'text:key'
        }
    });
});