describe("chorus.dialogs.AssociateHdfsDatasetFromEntry", function() {
    beforeEach(function() {
        this.entry = backboneFixtures.hdfsFile();
        this.hdfsDataSourceID = this.entry.get('hdfsDataSource').id;
        this.dialog = new chorus.dialogs.AssociateHdfsDatasetFromEntry({pageModel: this.entry});

        this.modalSpy = stubModals();
        this.dialog.launchModal();
    });

    it("shows the right title", function() {
        expect(this.dialog.title).toMatchTranslation("associate_hdfs_dataset_from_entry.title");
    });

    it("should prefill name from selected file name", function() {
        expect(this.dialog.$('input.name').val()).toEqual(this.entry.get('name'));
    });

    it("should prefill file mask from the selected file's paths", function() {
        expect(this.dialog.$('input.file_mask').val()).toEqual(this.entry.getFullAbsolutePath());
    });

    it("should begin with the submit button disabled", function () {
        expect(this.dialog.$("button.submit")).toBeDisabled();
    });

    it("should have a link to the workspace picker dialog", function() {
        expect(this.dialog.$("a.workspace_picked")).toContainTranslation("associate_hdfs_dataset_from_entry.select_workspace");
    });

    itBehavesLike.aDialogLauncher("a.workspace_picked", chorus.dialogs.HdfsDatasetWorkspacePicker);

    context("after selecting a workspace", function() {
        beforeEach(function() {
            this.workspace = backboneFixtures.workspace({name: "Foo"});
            spyOn(this.dialog, "workspaceChosen").andCallThrough();
            this.dialog.$("a.workspace_picked").click();
            chorus.modal.trigger("workspace:selected", [this.workspace]);
        });

        it("should show the selected workspace in the link", function() {
            expect(this.dialog.workspaceChosen).toHaveBeenCalled();
            expect(this.dialog.$("a.workspace_picked")).toContainText(this.workspace.name());
        });

        it("should re-enable the submit button", function() {
            expect(this.dialog.$("button.submit")).toBeEnabled();
        });

        context("submitting the form", function() {
            beforeEach(function() {
                this.dialog.$("form").submit();
            });

            it("posts with the correct values", function() {
                var json = this.server.lastCreate().json()['hdfs_dataset'];
                expect(json['name']).toEqual(this.entry.get('name'));
                expect(json['data_source_id']).toEqual(this.hdfsDataSourceID);
                expect(json['file_mask']).toEqual(this.entry.getFullAbsolutePath());
                expect(json['workspace_id']).toEqual(this.workspace.id);
                expect(json['entity_subtype']).toEqual('HDFS');
            });

            it("starts the spinner loading", function () {
                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            });

            context("when the save succeeds", function () {
                beforeEach(function () {
                    spyOn(this.dialog, 'closeModal');
                    spyOn(chorus, 'toast');
                    spyOn(chorus.router, 'navigate');
                    this.server.completeCreateFor(this.dialog.model);
                });

                it("closes the modal", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });

                it("gives a toast", function() {
                    // var workspaceLink = Handlebars.helpers.linkTo(this.workspace.showUrl(), this.workspace.name());
                    // expect(chorus.toast).toHaveBeenCalledWith('associate_hdfs_dataset_from_entry.toast', {dataset: "", workspaceLink: workspaceLink, toastOpts: {type: "success"}});
                    expect(chorus.toast).toHaveBeenCalled();
                });
            });

            context("when the post fails", function () {
                beforeEach(function() {
                    this.server.lastCreateFor(this.dialog.model).failUnprocessableEntity();
                });

                it("displays server errors", function () {
                    expect(this.dialog.$('.errors')).not.toHaveClass('hidden');
                });

                it("stops the spinner", function() {
                    expect(this.dialog.$('button.submit').isLoading()).toBeFalsy();
                });
            });
        });
    });

    describe("#workspaceChosen", function() {
        beforeEach(function () {
            this.workspace = backboneFixtures.workspace({name: "Foo"});
            this.dialog.workspaceChosen([this.workspace]);
        });

        it("should set the workspace on the model", function () {
            expect(this.dialog.model.workspace().get("id")).toEqual(this.workspace.id);
        });

        it("should change the text of the workspace", function () {
            expect(this.dialog.$("a.workspace_picked")).toContainText(this.workspace.name());
        });
    });

});