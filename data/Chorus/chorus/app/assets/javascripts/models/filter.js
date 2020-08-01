chorus.models.Filter = chorus.models.Base.extend({
    constructorName: "Filter",

    setColumn: function(column) {
        if (!this.get("column") || (this.get("column").cid !== column.cid)) {
            this.unset({comparator: void 0, input: void 0}, { silent: true });
            this.set({column: column});
        }
    },

    setComparator: function(comparator) {
        this.set({comparator: comparator});
    },

    setInput: function(inputHash) {
        this.set({input: inputHash});
    },

    getFilterMap: $.noop
});