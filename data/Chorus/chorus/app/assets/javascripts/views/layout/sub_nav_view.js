chorus.views.SubNav = chorus.views.Base.extend({
    constructorName: "SubNavView",
    templateName:"sub_nav",
    tagName:"ul",

    setup:function (options) {
        this.resource = this.resource || options.workspace;
    },

    postRender:function () {
        this.$("li").removeClass("selected");
        var selected = this.$("li." + this.options.tab);
        selected.addClass("selected");
    },

    additionalContext: function() {
        return {
            limitMilestones: chorus.models.Config.instance().license().limitMilestones(),
            limitJobs: chorus.models.Config.instance().license().limitJobs()
        };
    }
});