chorus.models.TableauWorkbook = chorus.models.Base.extend({
    constructorName: "TableauWorkbook",
    entityType: "tableau_workbook",
    paramsToSave: ['name', 'createWorkFile', 'tableau_username', 'tableau_password', 'tableau_site_name', 'tableau_project_name'],

    declareValidations:function (newAttrs) {
        this.require('name', newAttrs);
        this.require('tableau_username', newAttrs, "tableau.dialog.username_required");
        this.require('tableau_password', newAttrs, "tableau.dialog.password_required");
    },

    url: function() {
        return "/workspaces/" + this.get('dataset').get('workspace').id + "/datasets/" + this.get('dataset').get('id') + "/tableau_workbooks";
    }
});
