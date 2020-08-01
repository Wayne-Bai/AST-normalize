chorus.views.ProjectListHeader = chorus.views.Base.extend({
    constructorName: "ProjectListHeaderView",
    templateName: "project_list_header",
    additionalClass: 'list_header',

    events: {
        'change .workspace_filter': 'triggerCollectionFilter'
    },

    setup: function() {
        this.projectCardListModel = new chorus.models.ProjectCardList();
        this.projectCardListModel.fetch({
            success: _.bind(function() {
                this.filterValue = this.projectCardListModel.get('option') || 'most_active';
                this.list.fillOutContent(this.filterValue);
            }, this)
        });
    },

    postRender: function(e) {
        _.defer(_.bind(function () {
            this.$("select.workspace_filter").val(this.filterValue);
            chorus.styleSelect(this.$("select.workspace_filter"));
        }, this));
    },

    triggerCollectionFilter: function (e) {
        e && e.preventDefault();

        var filterClass = this.$("select.workspace_filter").val();
        this.filterValue = filterClass;
        if(this.projectlist.mostActive) {
            if(filterClass === 'members_only' || filterClass === 'all') {
                this.list.fillOutContent(filterClass);
            }
        }
        else {
            if(filterClass === 'most_active') {
                this.list.fillOutContent('most_active');
            }
            else {
                this.projectlist.triggerRender(filterClass === 'all');
            }
        }
        this.projectCardListModel.save({optionValue: filterClass});
    }
});