chorus.dialogs.Account = chorus.dialogs.Base.extend({
    constructorName: "AccountDialog",
    templateName: "data_source_account",
    translationKeys: {
        cancel: '',
        body: ''
    },

    events: {
        "submit form": "save"
    },

    additionalContext: function() {
        return {
            translationKeys: this.translationKeys,
            translationValues: {}
        };
    },

    makeModel: function() {
        this._super("makeModel", arguments);
        this.listenTo(this.model, "saved", this.saved);
    },

    save: function(e) {
        e.preventDefault();
        this.model.save({
            dbUsername: this.$("input[name=dbUsername]").val(),
            dbPassword: this.$("input[name=dbPassword]").val()
        });
    },

    saved: function() {
        this.closeModal();
        if(this.options.dataSource) {
            this.showSavedToast();
        }
    },

    showSavedToast: function() {
        chorus.toast("data_sources.account.updated.toast", {dataSourceName: this.options.dataSource.name(), toastOpts: {type: "success"}});
    }
});
