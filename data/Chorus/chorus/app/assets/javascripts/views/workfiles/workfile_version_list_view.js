chorus.views.WorkfileVersionList = chorus.views.Base.extend({
    constructorName: "WorkfileVersionListView",
    templateName: "workfile_version_list",
    tagName: "ul",

    events: {
        "click a.version_link": "navigateToVersion"
    },

    collectionModelContext: function(workfileVersion) {
        var author = workfileVersion.modifier();

        var versionInfo = workfileVersion.get("versionInfo");
        var date = chorus.parseDateFromApi(versionInfo && versionInfo.updatedAt);
        var formattedDate = date && date.toString("MMMM dd, yyyy");
        var workspace = workfileVersion.workspace();
        return {
            canDelete: workspace.canUpdate() && workspace.isActive(),
            versionId: workfileVersion.get("versionInfo").id,
            versionNumber: workfileVersion.get("versionInfo").versionNum,
            authorName: author.displayName(),
            formattedDate: formattedDate
        };
    },

    navigateToVersion: function(e) {
        e.preventDefault();
        var versionId = parseInt($(e.target).parents("a").andSelf().attr("data-version-id"), 10);
        chorus.PageEvents.trigger("workfileVersion:changed", versionId);
    }
});
