define([
    'underscore',
    'dX/Model'
], function(
    _,
    dXModel
) {

    /**
     * Example of a simple Model.
     * 
     * @class ItemModel
     * @author Riplexus <riplexus@gmail.com>
     */
    
    return dXModel.extend(/** @lends ItemModel.prototype */{
        defaults: {
            key: 'value'
        }
    });
});