var CrudItemView = require("./CrudItemView");

module.exports = Backbone.Marionette.CompositeView.extend({
    modelType: null,
    template: "items",
    ui: {
        "form": "form"
    },
    childView: CrudItemView,
    childViewContainer: "[data-items]",
    childViewOptions: function() {
        return {
            parentView: this
        };
    },
    events: {
        "click @ui.add": "handleFormSubmit",
        "submit @ui.form": "handleFormSubmit"
    },
    initialize: function() {
        this.model = new Backbone.Model();

        if (this.initialData) {
            var data = window[this.initialData];
            this.collection.reset(data.toJSON());
        }

    },
    handleFormSubmit: function(e) {
        e.preventDefault();

        if (!this.model.get('name')) {
            return;
        }

        var attr = this.model.attributes;

        this.collection.create(attr, {wait: true, error: function(model, response, options) {
            // console.log(response.responseJSON.error);
            // alert(response.responseJSON.error);
        }});
        // model.save();

        this.model.clear();

    },
    handleEdit: function(model) {
        var modal = new this.ModalView({
            model: new Backbone.Model(model.toJSON()),
            originalModel: model,
            parentView: this
        });

        this.$el.append(modal.render().$el);
        modal.$el.show();
    },
    onRender: function() {
        this.stickit();
    },
    onBeforeClose: function() {
        this.unstickit();
    }
});