chorus.dialogs.EditWorkspace = chorus.dialogs.Base.include(
        chorus.Mixins.ClEditor
    ).extend({
        constructorName: "EditWorkspace",

        templateName: "workspace_edit_dialog",
        title: t("workspace.settings.title"),
        persistent: true,

        events: {
            "submit form": "updateWorkspace",
            "click .submit": "updateWorkspace"
        },

        additionalContext: function() {
            var sandbox = this.model.sandbox();
            var sandboxLocation = sandbox ? sandbox.canonicalName() : null;
            var owner = this.model.owner();

            return {
                imageUrl: this.model.fetchImageUrl(),
                hasImage: this.model.hasImage(),
                members: this.model.members().models,
                canSave: this.model.canUpdate(),
                canChangeOwner: this.model.workspaceAdmin(),
                canChangeShowSandboxDatasets: this.model.workspaceAdmin(),
                ownerName: owner.displayName(),
                ownerUrl: owner.showUrl(),
                sandboxLocation: sandboxLocation,
                active: this.model.isActive()
            };
        },

        setup: function() {
            this.imageUpload = new chorus.views.ImageUpload({
                model: this.model,
                addImageKey: "workspace.settings.image.add",
                changeImageKey: "workspace.settings.image.change",
                spinnerSmall: true,
                editable: this.model.workspaceAdmin()
            });

            this.listenTo(this.model, "saved", this.saved);
            this.listenTo(this.model, "validationFailed", this.saveFailed);
            this.listenTo(this.model, "saveFailed", this.saveFailed);
            this.model.members().sortAsc("lastName");
            this.model.members().loaded = false;
            this.model.members().fetchAll();

            $(document).one('reveal.facebox', _.bind(this.setupSelects, this));
        },

        setupSelects: function() {
            chorus.styleSelect(this.$("select.owner"));
        },

        subviews: {
            '.edit_photo': "imageUpload"
        },

        postRender: function() {
            var canUpdateName = false;
            if(this.model.workspaceAdmin()) {
                canUpdateName = true;
            } else if(this.model.canUpdate()) {
                this.$('input[name=public], input[name=status]').attr('disabled', 'disabled');
                canUpdateName = true;
            } else {
                this.$('input[name=name], input[name=public], textarea[name=summary], input[name=status]').attr('disabled', 'disabled');
            }

            this.$("select.owner").val(this.model.owner().get("id"));

            _.defer(_.bind(function() {
                var clEditor = this.makeEditor($(this.el), ".toolbar", "summary", {width: 'auto', height: 210});
                if(!canUpdateName) {
                    clEditor.disable(true);
                }
            }, this));
        },

        updateWorkspace: function(e) {
            e.preventDefault();
            var active = !!this.$("input#workspace_active").is(":checked");

            var attrs = {
                name: this.$("input[name=name]").val().trim(),
                summary: this.getNormalizedText(this.$("textarea[name=summary]")),
                "public": !!this.$("input[name=public]").is(":checked"),
                active: active,
                hasChangedSettings: true,
                archived: !active,
                isProject: !!this.$('input[name=make_project]').prop('checked')
            };

            if(this.$("select.owner").length > 0) {
                attrs.ownerId = this.$("select.owner").val();
            }

            if (this.model.sandbox()) {
                attrs.showSandboxDatasets = !!this.$(".show_sandbox_datasets").prop("checked");
            }

            this.$("button.submit").startLoading("actions.saving");
            this.model.save(attrs, {
                unprocessableEntity: function() {
                    /* Bypass page level error handling for this save */
                },
                wait: true
            });
        },

        saved: function() {
            chorus.toast("workspace.settings.edit_success.toast", {toastOpts: {type: "success"}});
            this.model.trigger("invalidated");
            this.closeModal();
        }
    });
