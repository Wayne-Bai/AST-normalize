var Sorter = Datagrid.Sorter = Backbone.Model.extend({
  sort: function(column, order) {
    if (!order && this.get('column') === column) {
      this.toggleOrder();
    } else {
      this.set({
        column: column,
        order: order || Sorter.ASC
      });
    }
  },

  sortedBy: function(column) {
    return this.get('column') === column;
  },

  sortedASC: function() {
    return this.get('order') === Sorter.ASC;
  },

  sortedDESC: function() {
    return this.get('order') === Sorter.DESC;
  },

  toggleOrder: function() {
    if (this.get('order') === Sorter.ASC) {
      this.set('order', Sorter.DESC);
    } else {
      this.set('order', Sorter.ASC);
    }
  }
});

Sorter.ASC  = 'asc';
Sorter.DESC = 'desc';
