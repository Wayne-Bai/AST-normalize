chorus.alerts.PublishInsight = chorus.alerts.Confirm.extend({
    constructorName: "PublishInsight",

    setup: function(options){
        this.publish = options.publish;
        this.title = this.publish ? t("insight.publish.alert.title") : t("insight.unpublish.alert.title");
        this.text = this.publish ? t("insight.publish.alert.body") : t("insight.unpublish.alert.body");
        this.ok = this.publish ? t("insight.publish.alert.button") : t("insight.unpublish.alert.button");
        this.body = "";
    },

    confirmAlert:function () {
        this.publish ? this.model.publish() : this.model.unpublish();
        this.closeModal();
    }
});
