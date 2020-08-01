chorus.views.TextWorkfileContent = chorus.views.Base.extend({
    constructorName: "TextWorkfileContent",

    templateName: "text_workfile_content",
    saveInterval: 30000,

    subviews: {
        ".editor": "editor"
    },

    setup: function() {
        var self = this;

        var extraKeys = _.reduce(this.options.hotkeys, function(acc, _value, key) {
            var hotkeyString = _.str.capitalize(chorus.hotKeyMeta) + "-" + key.toUpperCase();
            acc[hotkeyString] = function() { chorus.triggerHotKey(key); };
            return acc;
        }, {"Ctrl-Space": "autocomplete", "Shift-Space": "autocomplete"});

        this.editor = new chorus.views.CodeEditorView({
            model: this.model,
            readOnly: this.model.canEdit() ? false : "nocursor",
            mode: this.mode(),
            onChange: _.bind(this.startTimer, this),
            extraKeys: extraKeys,
            beforeEdit: function() {
                if (!chorus.modal && self.model.canEdit()) {
                    setTimeout(_.bind(self.editText, self), 100);
                }
            },
            onCursorActivity: function(editor) {
                if (editor.getSelection().length > 0) {
                    chorus.PageEvents.trigger("file:selectionPresent");
                } else {
                    chorus.PageEvents.trigger("file:selectionEmpty");
                }
            }
        });

        this.subscribePageEvent("file:replaceCurrentVersion", this.replaceCurrentVersion);
        this.subscribePageEvent("file:createNewVersion", this.createNewVersion);
        this.subscribePageEvent("file:replaceCurrentVersionWithSelection", this.replaceCurrentVersionWithSelection);
        this.subscribePageEvent("file:createNewVersionFromSelection", this.createNewVersionFromSelection);
        this.subscribePageEvent("file:editorSelectionStatus", this.editorSelectionStatus);
        this.subscribePageEvent("file:saveDraft", this.saveDraft);
        this.listenTo(this.model, "saveFailed", this.versionConflict);
    },

    mode: function() {
        return chorus.utilities.mime(this.model.extension());
    },

    versionConflict: function() {
        if (this.model.hasConflict()) {
            this.alert = new chorus.alerts.WorkfileConflict({ model: this.model });
            this.alert.launchModal();
        }
    },

    editText: function() {
        if (this.cursor) {
            this.editor.setCursor(this.cursor.line, this.cursor.ch);
        }

        this.editor.setOption("readOnly", false);
        this.editor.setOption("theme", "default editable");
        this.editor.focus();
    },

    startTimer: function() {
        if (!this.saveTimer) {
            this.saveTimer = setTimeout(_.bind(this.saveDraft, this), this.saveInterval);
        }
    },

    stopTimer: function() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            delete this.saveTimer;
        }
    },

    saveDraft: function() {
        this.stopTimer();
        chorus.PageEvents.trigger("file:autosaved");
        this.model.content(this.editor.getValue(), {silent: true});
        var overrides = {};
        if (this.model.get("hasDraft")) {
            overrides.method = 'update';
        }
        this.model.createDraft().save({}, overrides);
    },

    teardown: function() {
        if (this.saveTimer) {
            this.saveDraft();
        }
        this._super("teardown");
    },

    saveCursorPosition: function() {
        this.cursor = this.editor.getCursor();
    },

    replaceCurrentVersion: function() {
        this.saveCursorPosition();
        this.replaceCurrentVersionWithContent(this.editor.getValue());
    },

    createNewVersion: function() {
        this.saveCursorPosition();
        this.createNewVersionWithContent(this.editor.getValue());
    },

    replaceCurrentVersionWithSelection: function() {
        this.saveCursorPosition();
        this.replaceCurrentVersionWithContent(this.editor.getSelection());
    },

    createNewVersionFromSelection: function() {
        this.saveCursorPosition();
        this.createNewVersionWithContent(this.editor.getSelection());
    },

    editorSelectionStatus: function() {
        if (this.editor.getSelection() && this.editor.getSelection().length > 0) {
            chorus.PageEvents.trigger("file:selectionPresent");
        } else {
            chorus.PageEvents.trigger("file:selectionEmpty");
        }
    },

    replaceCurrentVersionWithContent: function(value) {
        this.stopTimer();
        this.model.content(value, {silent: true});
        var model = this.model;

        this.model.save({}, {
            updateWorkfileVersion: true,
            silent: true,
            notFound: function() {
                this.alert = new chorus.alerts.WorkfileConflict({ model: model });
                this.alert.launchModal();
            }
        }); // Need to save silently because content details and content share the same models, and we don't want to render content details

        this.render();
    },

    createNewVersionWithContent: function(value) {
        this.stopTimer();
        this.model.content(value, {silent: true});

        this.dialog = new chorus.dialogs.WorkfileNewVersion({ pageModel: this.model, pageCollection: this.collection });
        this.dialog.launchModal(); // we need to manually create the dialog instead of using data-dialog because qtip is not part of page
        this.listenTo(this.dialog.model, "change", this.render);
    }
});

