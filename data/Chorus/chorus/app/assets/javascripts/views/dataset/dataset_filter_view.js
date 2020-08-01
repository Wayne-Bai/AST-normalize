chorus.views.DatasetFilter = chorus.views.Filter.extend({
    className: "dataset",

    setup: function() {
        this._super("setup", arguments);
        this.model = this.model || new chorus.models.DatasetFilter();
    },

    postRender: function() {
        chorus.datePicker({
            "%Y": this.$(".filter.date input[name='year']"),
            "%m": this.$(".filter.date input[name='month']"),
            "%d": this.$(".filter.date input[name='day']")
        });

        this._super("postRender", arguments);
    },

    fieldValues: function() {
        switch (this.map.type) {
        case "Time":
            return { value: this.$(".filter.time input").val() };
        case "Date":
            var year = this.$(".filter.date input[name='year']").val(),
                    month = this.$(".filter.date input[name='month']").val(),
                    day = this.$(".filter.date input[name='day']").val();
            return {
                    year: year,
                    month: month,
                    day: day,
                    value: ((year + month + day).length > 0) ? [year, month, day].join("/") : ""
                };
        default:
            return { value: this.$(".filter.default input").val() };
        }
    }
});
