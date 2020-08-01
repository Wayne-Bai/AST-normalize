chorus.alerts.ModelDelete = chorus.alerts.Confirm.extend({
    events: _.extend({}, chorus.alerts.Base.prototype.events, {
        "click button.submit": "deleteModel"
    }),
    constructorName: "ModelDelete",
    focusSelector: "button.cancel",
    additionalClass: "error",
    persistent: true, //here for documentation, doesn't actually do anything as we've overwritten bindCallbacks

    bindCallbacks: function() {
        this.model.bind("destroy", this.modelDeleted, this);
        this.model.bind("destroyFailed", this.render, this);
    },

    close: function() {
        this.model.unbind("destroy", this.modelDeleted);
        this.model.unbind("destroyFailed", this.render);
    },

    deleteModel: function(e) {
        e.preventDefault();
        this.model.destroy();
        this.$("button.submit").startLoading("actions.deleting");
    },

    deleteMessageParams: $.noop,

    modelDeleted: function() {
        this.closeModal(true);

        // toast "deletion" style
        var toastOpts = {toastOpts: {type: "deletion"}};
        var messageParams = this.deleteMessageParams();
        messageParams = (messageParams === undefined) ? {} : messageParams;
        _.extend(messageParams, toastOpts);
        chorus.toast(this.deleteMessage, messageParams);

        if(this.model.entityType) {
            chorus.PageEvents.trigger(this.model.entityType + ":deleted", this.model);
        }
        if (this.redirectUrl) {
            chorus.router.navigate(this.redirectUrl);
        }
    }
});