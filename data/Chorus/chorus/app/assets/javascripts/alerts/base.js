chorus.alerts.Base = chorus.Modal.extend({
    constructorName: "Alert",
    templateName: "alert",

    events: {
        "click button.cancel": "cancelAlert",
        "click button.submit": "confirmAlert"
    },

    confirmAlert: $.noop,

    focusSelector: "button.cancel",

    cancelAlert: function() {
        this.closeModal();
    },

    additionalContext: function(ctx) {
        return {
            title: this.title,
            text: _.result(this, 'text'),
            body: this.body,
            ok: this.ok,
            cancel: this.cancel || t("actions.cancel")
        };
    },

    revealed: function() {
        $("#facebox").removeClass().addClass("alert_facebox");
    }
});