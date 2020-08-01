/*
 * jQuery UI Autocomplete SC Extension
 */

$.widget('ui.sc_autocomplete', $.ui.autocomplete, {
  _renderItem: function(ul, item) {
    var view = this.options.itemViewClass.create({content:item, widget: this});
    view.appendTo(ul);
    return view.$();
  }
});
