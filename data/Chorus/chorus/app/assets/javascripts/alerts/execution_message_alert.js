chorus.alerts.ExecutionMessage = chorus.alerts.Base.extend({
    constructorName: "ExecutionMessage",

    cancel:t("actions.close_window"),
    additionalClass: "info",

    preRender: function() {
        this._super("preRender", arguments);
        var warnings = this.model.get("warnings");
        if(warnings && warnings.length) {
            this.body = warnings.join(" ");
        } else {
            this.body = t('sql_execution.success');
        }
    },

    setup: function() {
        this.title = this.getTitle();
    },

    getTitle:function () {

        if (this.model.get("workfile"))
            return t("workfile.execution.message.title");
        else
            return t("dataset.execution.message.title");
    }
});
