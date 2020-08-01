chorus.views.UserDashboardEditView = chorus.views.Base.extend({
    constructorName: "UserDashboardEditView",
    templateName: "user/dashboard_edit",
    events: {
        "submit form": "save",
        "click button.cancel": "goBack"
    },

    postRender: function() {
        this.$(".sortable").sortable({
            connectWith: ".sortable",
            containment: ".sortable_container"
        });

        this.toggleSubmitState();

        this.$(".sortable_container .module_list").on(
            "sortover sortout",
            _.bind(this.toggleDropTarget, this)
        );

        this.$(".selected_modules").on(
            "sortremove sortreceive",
            _.bind(this.toggleSubmitState, this)
        );
    },

    save: function(e) {
        e && e.preventDefault();

        this.model.save({modules: this.fieldValues()}, {
            silent: true,
            success: function() { chorus.router.navigate('/'); }
        });
    },

    fieldValues: function() {
        return _.map(this.$(".selected_modules ul.sortable > li"), function(el) {
            return el.id;
        });
    },

    goBack:function () {
        window.history.back();
    },

    additionalContext: function() {
        return {
            modules: this.mapModules(this.model.get("modules")),
            availableModules: this.mapModules(this.model.get("availableModules"))
        };
    },

    mapModules: function(ary) {
        return _.map(ary, function(name) {
            return {
                classKey: name,
                nameKey: "dashboard." + _.underscored(name)  + ".name",
                descKey: "dashboard." + _.underscored(name)  + ".description"
            };
        });
    },

    toggleDropTarget: function(event) {
        this.$(event.currentTarget).toggleClass("drop_target");
    },

    toggleSubmitState: function() {
        var disabled = this.fieldValues().length < 1;
        this.$("button.submit").prop("disabled", disabled);
    }
});
