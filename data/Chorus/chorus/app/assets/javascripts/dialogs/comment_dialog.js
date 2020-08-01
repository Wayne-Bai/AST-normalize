chorus.dialogs.Comment = chorus.dialogs.Base.include(
    chorus.Mixins.ClEditor
).extend({
    templateName:"comment",
    title:t("comments.new_dialog.title"),
    persistent:true,

    events: {
        "submit form":"save"
    },

    makeModel:function () {
        this._super("makeModel", arguments);

        this.model = new chorus.models.Comment({
            entityType: this.options.entityType,
            eventId: this.options.eventId
        });
        this.listenTo(this.model, "saved", this.saved);
    },

    additionalContext:function () {
        return { entityTitle: this.options.entityTitle };
    },

    postRender: function() {
        _.defer(_.bind(function() {
            this.makeEditor($(this.el), ".toolbar", "body", { width: 'auto', height: 200 });
        }, this));
    },

    showErrors:function (model) {
        this._super("showErrors");

        if (!model) {
            model = this.resource;
        }

        if (model.errors && model.errors.text) {
            var $input = this.$(".cleditorMain");
            this.markInputAsInvalid($input, model.errors.text, true);

            this.$("iframe").contents().find("text").css("margin-right", "20px");
        }
    },

    save:function (e) {
        e.preventDefault();
        this.model.save({ body: this.getNormalizedText(this.$("textarea[name=body]")) });
    },

    saved:function () {
        this.pageModel.trigger("invalidated");
        chorus.PageEvents.trigger("comment:added", this.model);
        this.closeModal();
    }
});
