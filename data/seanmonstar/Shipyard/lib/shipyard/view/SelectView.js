var Class = require('../class/Class'),
    CollectionView = require('./CollectionView');

module.exports = new Class({

    Extends: CollectionView,

    tag: 'select',

    attributes: [],

    selected: null,

    itemViewOptions: {
        tag: 'option'
    },

    onElementCreated: function selectOnElementCreated() {
        this.emit('change');
    },

    onChange: function selectOnChange() {
        var index = this.get('element').get('selectedIndex');
        if (this.childViews[index]) {
            this.set('selected', this.childViews[index].get('content'));
        } else {
            this.set('selected', null);
        }
    }

});
