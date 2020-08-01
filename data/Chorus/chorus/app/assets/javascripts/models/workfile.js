(function() {
    var extensionRegex = /\.([^\.]+)$/;
    var IMAGE = 'image';
    var SQL = 'sql';
    var CODE = 'code';
    var TEXT = 'text';
    var ALPINE = 'alpine';
    var TABLEAU = 'tableau_workbook';
    var XML_TYPE = 'xml';
    var OTHER = 'other';

    chorus.models.Workfile = chorus.models.Base.include(
        chorus.Mixins.Attachment
    ).extend({
        constructorName: "Workfile",
        nameAttribute: 'fileName',
        entityType: "workfile",

        baseShowUrl: function() {
            return this.showUrl({baseOnly: true});
        },

        urlTemplate: function(options) {
            if(this.isNew()) {
                return "workspaces/{{workspace.id}}/workfiles";
            }

            if (this.isLatestVersion()) {
                return "workfiles/{{id}}";
            } else {
                return "workfiles/{{id}}/versions/{{versionInfo.id}}";
            }
        },

        showUrlTemplate: function(options) {
            options || (options = {});
            if ((this.isLatestVersion() && !options.version) || options.baseOnly) {
                return "workspaces/{{workspace.id}}/workfiles/{{id}}";
            } else {
                var version = options.version || this.get('versionInfo').id;
                return "workspaces/{{workspace.id}}/workfiles/{{id}}/versions/" + version;
            }
        },

        initialize: function() {
            if (this.collection && this.collection.attributes && this.collection.attributes.workspaceId) {
                this.set({workspace: { id: this.collection.attributes.workspaceId}}, {silent: true});
            }
        },

        workspace: function() {
            this._workspace = (this._workspace || new chorus.models.Workspace(this.get("workspace")));
            return this._workspace;
        },

        setWorkspace: function(workspace) {
            this.workspace().set({id: workspace.id});
        },

        updateExecutionSchema:function(schema){
            delete this._executionSchema;
            return this.save({executionSchema: {id: schema.get("id")}}, {wait: true});
        },

        sandbox: function() {
            return this.workspace().sandbox();
        },

        schema: function() {
            return this.executionSchema();
        },

        executionSchema: function() {
            if(!this._executionSchema) {
                var executionSchema = this.get("executionSchema");
                this._executionSchema = executionSchema && new chorus.models.Schema(executionSchema);
            }
            return this._executionSchema;
        },

        modifier: function() {
            return new chorus.models.User(this.get("versionInfo") && this.get("versionInfo").modifier);
        },

        content: function(newContent, options) {
            if (arguments.length) {
                this.get("versionInfo").content = newContent;
                this.set({content: newContent}, options);
            } else {
                return this.get("versionInfo").content;
            }
        },

        lastComment: function() {
            var commentsJson = this.get("recentComments");
            if (commentsJson && commentsJson.length > 0) {
                var comment = new chorus.models.Comment({
                    body: commentsJson[0].body,
                    author: commentsJson[0].author,
                    commentCreatedStamp: commentsJson[0].timestamp
                });

                comment.loaded = true;
                return comment;
            }
        },

        createDraft: function() {
            var draft = new chorus.models.Draft({workfileId: this.get("id"), workspaceId: this.workspace().id, content: this.content()});
            draft.bind("saved", function() {
                this.isDraft = true;
                this.set({ hasDraft: true }, { silent: true });
            }, this);
            return draft;
        },

        allVersions: function() {
            return new chorus.collections.WorkfileVersionSet([], {
                workfileId: this.get("id")
            });
        },

        declareValidations: function(newAttrs) {
            this.require("fileName", newAttrs);
        },

        attrToLabel: {
            "fileName": "workfiles.validation.name"
        },

        isImage: function() {
            return this.get("fileType") === IMAGE;
        },

        isSql: function() {
            return this.get("fileType") === SQL;
        },

        isText: function() {
            return _.include([SQL, TEXT, CODE], this.get("fileType"));
        },

        isAlpine: function() {
            return this.get("fileType") === ALPINE;
        },

        isPartialFile: function() {
            return this.get('versionInfo') && !!this.get('versionInfo').partialFile;
        },

        isTableau: function() {
            return this.get("fileType") === TABLEAU;
        },

        isBinary: function() {
            return this.get("fileType") === OTHER;
        },

        isXml: function() {
            return this.get("fileType") === XML_TYPE;
        },

        extension: function() {
            var fileName = this.get("fileName");
            var matches = fileName && fileName.match(extensionRegex);
            return matches && matches[1].toLowerCase();
        },

        downloadUrl: function() {
            if(this.isLatestVersion()) {
                return "workfiles/" + this.get("id") + "/download";
            } else {
                return "workfiles/" + this.get("id") + "/download?version_id=" + this.get("versionInfo").id;
            }
        },

        workfilesUrl: function() {
            return this.workspace().workfilesUrl();
        },

        canEdit: function() {
            return this.isLatestVersion() && this.workspace().isActive() && this.workspace().canUpdate();
        },

        isLatestVersion: function() {
            var versionNum = this.get('versionInfo') && this.get('versionInfo').id;
            return (!versionNum || versionNum === this.get("latestVersionId"));
        },

        save: function(attrs, options) {
            if (this.isNew() || this.canEdit()) {
                options = options || {};
                attrs = attrs || {};
                var overrides = {};

                if (options.updateWorkfileVersion) {
                    overrides.url = "/workfiles/" + this.get("id") + "/versions/" + this.get("versionInfo").id;
                    attrs['lastUpdatedStamp'] = this.get("versionInfo").lastUpdatedStamp;
                }

                if (options.newWorkfileVersion) {
                    overrides = {
                        method: 'create',
                        url: "/workfiles/" + this.get("id") + "/versions"
                    };
                }

                options = _.omit(options, "updateWorkfileVersion", "newWorkfileVersion");

                return this._super("save", [attrs, _.extend(options, overrides)]);
            }
        },

        iconUrl: function(options) {
            if (this.isImage() && this.get("versionInfo")) {
                return this.get("versionInfo").iconUrl;
            } else {
                return chorus.urlHelpers.fileIconUrl(this.extension(), options && options.size);
            }
        },

        hasOwnPage: function() {
            return true;
        },

        hasConflict: function() {
            return this.serverErrors && this.serverErrors.fields && this.serverErrors.fields.version && this.serverErrors.fields.version.INVALID;
        }
    });
})();
