chorus.dialogs.WorkfilesImport = chorus.dialogs.Base.extend({
    constructorName: "WorkfilesImport",

    templateName: "workfiles_import",
    title: t("workfiles.import_dialog.title"),

    persistent: true,

    subviews: {
        ".location_picker": "executionLocationPickerList"
    },

    events: {
        "click button.submit": "upload",
        "submit form": "upload",
        "click button.choose": "chooseFile"
    },

    makeModel: function() {
        this.model = this.model || new chorus.models.Workfile({workspace: { id: this.options.pageModel.id } });
    },

    setup: function() {
        var self = this;

        this.config = chorus.models.Config.instance();

        $(document).one('close.facebox', function() {
            if (self.request) {
                self.request.abort();
            }
        });

        this.buildLocationPicker();

        this._super("setup");
    },

    buildLocationPicker: function () {
        this.executionLocationPickerList = new chorus.views.WorkFlowExecutionLocationPickerList();
        this.listenTo(this.executionLocationPickerList, "change", this.executionLocationChanged);
        this.listenTo(this.executionLocationPickerList, "error", this.showErrors);
        this.listenTo(this.executionLocationPickerList, "clearErrors", this.clearErrors);
    },

    toggleSubmitButton: function () {
        this.$("button.submit").prop("disabled", this.isAlpine() && !this.executionLocationPickerList.ready());
    },

    setPickedValues: function () {
        this.$('.execution_locations').empty();
        var selectedLocations = this.executionLocationPickerList.getSelectedLocations();

        var dialog = this;
        function buildHiddenField(index, name, location) {
            var hiddenField = $('<input type="hidden">');
            hiddenField.attr('name', 'workfile[execution_locations][' + index + '][' + _.underscored(name) + ']');
            hiddenField.attr('value', location.get(name));
            dialog.$('.execution_locations').append(hiddenField);
        }

        _.each(selectedLocations, function (location, ix) {
            _.each(['entityType', 'id'], function (name) {
                buildHiddenField(ix, name, location);
            });
        });
    },

    executionLocationChanged: function () {
        this.setPickedValues();
        this.toggleSubmitButton();
    },

    upload: function(e) {
        e && e.preventDefault();

        if (this.uploadObj) {
            this.request = this.uploadObj.submit();
            this.$("button.submit").startLoading("workfiles.import_dialog.uploading");
            this.$("button.choose").prop("disabled", true);
            this.$("input").addClass("hidden");
        }
    },

    closeModal: function(e) {
        if (e) {
            e.preventDefault();
        }
        if (this.request) {
            this.request.abort();
        }
        this._super("closeModal");
    },

    chooseFile: function(e) {
        if (!this.$("button.choose").disabled) {
            e.preventDefault();
            this.$("input").click();
        } else {
            this.$("input").removeClass("hidden");
        }
    },

    isAlpine: function () {
        return this.uploadExtension && this.uploadExtension.toLowerCase() === 'afm';
    },
    
    postRender: function() {
        var self = this;

        function validateFile(files) {
            self.clearErrors();
            if (!self.model) return;

            var maxFileSize = self.config.get("fileSizesMbWorkfiles");

            _.each(files, function(file) {
                if (file.size > (maxFileSize * 1024 * 1024)) {
                    self.model.serverErrors = {
                        "fields": {
                            "base": {
                                "FILE_SIZE_EXCEEDED": {
                                    "count": maxFileSize
                                }
                            }
                        }
                    };
                    self.showErrorAndDisableButton();
                }
            }, self);
        }

        function fileChosen(e, data) {
            function prepareFileIcon() {
                var iconSrc = chorus.urlHelpers.fileIconUrl(self.uploadExtension, "icon");
                self.$('img.file_icon').attr('src', iconSrc);
                self.$('img.file_icon').removeClass('hidden');
            }

            function recomposeForFileType(showingAlpine) {
                self.centerHorizontally();
                self.$el.toggleClass('dialog_wide', showingAlpine);
                self.$('.work_flow_detail').toggleClass("hidden", !showingAlpine);
                self.$(".comment").toggleClass("hidden", showingAlpine);
                self.toggleSubmitButton();
            }

            function acceptFile() {
                recomposeForFileType(false);
                self.$('input#entity_subtype').val('');
            }

            function acceptAlpineFile() {
                recomposeForFileType(true);
                self.$('input#entity_subtype').val('alpine');
            }

            if (data.files.length > 0) {
                var filename = data.files[0].name;
                self.uploadExtension = _.last(filename.split('.'));

                self.$(".empty_selection").addClass("hidden");
                self.uploadObj = data;
                prepareFileIcon();
                self.$('.file_name').text(filename).attr('title', filename);

                if (self.isAlpine()) {
                    acceptAlpineFile();
                } else {
                    acceptFile();
                }

                validateFile(data.files);
            }
        }

        function uploadFinished(e, json) {
            self.model = new chorus.models.Workfile();
            self.model.set(self.model.parse(JSON.parse(json.result)));
            chorus.toast("workfiles.uploaded.toast", {fileName: self.model.get("fileName"), toastOpts: {type: "success"}});
            self.closeModal();
            chorus.router.navigate(self.model.showUrl());
        }

        function uploadFailed(e, response) {
            e.preventDefault();
            if (response.jqXHR.status && response.jqXHR.status.toString() === '413') {
                self.displayNginxError();
            } else {
                if (response.jqXHR.responseText)  {
                    var errors = JSON.parse(response.jqXHR.responseText).errors;
                    if(errors.fields.contents_file_size && errors.fields.contents_file_size.LESS_THAN) {
                        var count = errors.fields.contents_file_size.LESS_THAN.count;
                        errors.fields.contents_file_size.LESS_THAN.count = count.split(" ")[0]/1024/1024 + " MB";
                    }
                    self.resource.serverErrors = errors;
                }
            }
            self.showErrorAndDisableButton();
        }

        // dataType: 'text' is necessary for FF3.6
        // see https://github.com/blueimp/jQuery-File-Upload/issues/422
        // see https://github.com/blueimp/jQuery-File-Upload/blob/master/jquery.iframe-transport.js
        this.$("input[type=file]").fileupload({
            change: fileChosen,
            add: fileChosen,
            done: uploadFinished,
            fail: uploadFailed,
            dataType: "text"
        });
    },

    showErrorAndDisableButton: function() {
        this.$("button.submit").stopLoading();
        this.$("button.submit").prop("disabled", true);
        this.$("button.choose").prop("disabled", false);
        this.$(".comment").addClass("hidden");
        this.resource.trigger("saveFailed");
    },

    displayNginxError: function() {
        var maxFileSize = this.config.get("fileSizesMbWorkfiles");
        this.resource.serverErrors = {"fields":{"base":{"FILE_SIZE_EXCEEDED":{"count":maxFileSize}}}};
    }
});
