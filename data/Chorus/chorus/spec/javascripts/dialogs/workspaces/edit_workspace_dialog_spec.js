describe("chorus.dialogs.EditWorkspace", function() {
    beforeEach(function() {
        this.workspace = backboneFixtures.workspace({
            name: "my name",
            summary: "my summary",
            id: "457",
            owner: {
                id: 12,
                firstName: "Deborah",
                lastName: "D"
            },
            archivedAt: null,
            archiver: null,
            isProject: false,
            sandboxInfo: {
                name: "analytics",
                database: { name: "Analytics", dataSource: { name: "Gillette" } }
            }
        });

        this.workspace.members().add([
            new chorus.models.User({ id: 11, firstName: "Mikey", lastName: "B" }),
            new chorus.models.User({ id: 12, firstName: "Deborah", lastName: "D" }),
            new chorus.models.User({ id: 13, firstName: "Richard", lastName: "G" })
        ]);

        this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: this.workspace });
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy();
    });

    describe("#setup", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: this.workspace });
        });

        it("fetches the workspace's members", function() {
            this.server.completeFetchAllFor(this.workspace.members());
        });

        it("has a sorted list of workspace members (last name ASC)", function() {
            expect(this.server.lastRequest().url).toContainQueryParams({order: 'last_name'});
        });
    });

    describe("#render", function() {
        var dialog, disableSpy;

        function itHasEditableNameAndSummmary() {
            it("does not disable the workspace name input", function() {
                expect(this.dialog.$("input[name=name]")).not.toBeDisabled();
            });

            it("does not disable the summary", function() {
                expect(this.dialog.$("textarea[name=summary]")).not.toBeDisabled();
                expect(disableSpy).not.toHaveBeenCalled();
            });
        }

        function itDoesNotAllowEditingImage() {
            it("disables the workspace image uploader", function() {
                expect(this.dialog.$("a.action")).not.toExist();
            });
        }

        function itDisablesArchivingAndUnarchiving() {
            it("disables the radio buttons for archiving and un-archiving the workspace", function() {
                var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                expect(activeRadio).toBeDisabled();
                expect(archivedRadio).toBeDisabled();
            });
        }

        function itDoesNotAllowEditingMembers() {
            it("renders the owner as link to the user profile", function() {
                expect(this.dialog.$("select.owner")).not.toExist();
                expect(this.dialog.$("div.owner a")).toHaveText("Deborah D");
                expect(this.dialog.$("div.owner a").attr("href")).toBe(this.workspace.owner().showUrl());
            });
        }

        beforeEach(function() {
            dialog = this.dialog;
            disableSpy = jasmine.createSpy("disable");
            spyOn(this.dialog, "makeEditor").andCallThrough();
            $.fn.cleditor.andReturn([
                {
                    disable: disableSpy
                }
            ]);
            setLoggedInUser({ id: 11 });
            this.dialog.render();
        });

        it("has the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("workspace.settings.title");
        });

        it("has an input for workspace name", function() {
            expect(this.dialog.$("input[name=name]").val()).toBe(this.dialog.pageModel.get("name"));
        });

        it("has a text area for summary", function() {
            expect(this.dialog.$("textarea[name=summary]").val()).toBe(this.dialog.pageModel.get("summary"));
        });

        it("renders the archiving instructions", function() {
            expect(this.dialog.$(".archived_text").text().trim()).toMatchTranslation("workspace.settings.archived_description");
        });

        it("makes a cl editor with toolbar", function() {
            expect(this.dialog.makeEditor).toHaveBeenCalledWith($(this.dialog.el), ".toolbar", "summary", { width : 'auto', height : 210, controls : 'bold italic | bullets numbering | link unlink' });
        });

        describe("sandbox location", function() {
            context("with a sandbox", function() {
                it("shows sandbox info", function() {
                    expect(this.dialog.$(".sandboxLocation").text()).toBe("Gillette.Analytics.analytics");
                });

                it("shows the checkbox and label for showing sandbox datasets", function() {
                    expect(this.dialog.$(".show_sandbox_datasets")).toBeChecked();
                    expect(this.dialog.$el).toContainTranslation("actions.sandbox.show_sandbox_datasets_by_default");

                });

                context("when show_sandbox_datasets is set to false", function() {
                    beforeEach(function() {
                        var workspace = backboneFixtures.workspace({showSandboxDatasets: false});
                        this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: workspace });
                        this.dialog.render();
                    });

                    it("shows an unchecked checkbox", function() {
                        expect(this.dialog.$(".show_sandbox_datasets")).not.toBeChecked();
                    });
                });
            });

            context("without a sandbox", function() {
                beforeEach(function() {
                    this.workspace = backboneFixtures.workspace();
                    this.workspace.unset("sandboxInfo");
                    this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: this.workspace });
                    this.dialog.render();
                });

                it("shows sandbox info", function() {
                    expect(this.dialog.$(".sandboxLocation").text()).toMatchTranslation("workspace.settings.sandbox.none");
                });

                it("does not show the checkbox and label for showing sandbox datasets", function() {
                    expect(this.dialog.$(".show_sandbox_datasets")).not.toExist();
                });

                it("does not provide displaySandboxDatasets in the API call", function() {
                    this.dialog.$('form').submit();
                    expect(this.server.lastUpdateFor(this.workspace).json().workspace.show_sandbox_datasets).toBeTruthy();
                });
            });
        });

        context("when the workspace is public", function() {
            beforeEach(function() {
                this.workspace.set({ "public": true });
                this.dialog.render();
            });

            it("checks the 'Publicly available' checkbox", function() {
                expect(this.dialog.$("input[name=public]")).toBeChecked();
            });
        });

        context("when the workspace is not public", function() {
            beforeEach(function() {
                this.workspace.set({ "public": false });
                this.dialog.render();
            });

            it("does not check the 'Publicly available' checkbox", function() {
                expect(this.dialog.$("input[name=public]")).not.toBeChecked();
            });
        });

        context("when the user is the owner of the workspace", function() {
            beforeEach(function() {
                setLoggedInUser({ id: 12 });
                this.workspace.set({ permission: ["admin", "read", "commenting", "update"] });
                this.workspace.set({ owner: {
                    id: 12,
                    name: "richard"
                }});
                disableSpy.reset();
                this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: this.workspace });
                this.dialog.render();
            });

            it("does not disable the 'Publicly available' checkbox", function() {
                expect(this.dialog.$("input[name=public]")).not.toBeDisabled();
            });

            itHasEditableNameAndSummmary();

            describe("the owner select", function() {
                it("shows up", function() {
                    expect(this.dialog.$("select.owner")).toExist();
                });

                it("has an option for each member", function() {
                    var options = this.dialog.$("select.owner option");
                    expect(options.length).toBe(3);

                    expect(options.eq(0).text()).toBe("Mikey B");
                    expect(options.eq(1).text()).toBe("Deborah D");
                    expect(options.eq(2).text()).toBe("Richard G");

                    expect(options.eq(0).val()).toBe("11");
                    expect(options.eq(1).val()).toBe("12");
                    expect(options.eq(2).val()).toBe("13");
                });

                it("defaults to the current owner", function() {
                    expect(this.dialog.$("select.owner").val()).toBe("12");
                });
            });

            context("and the workspace is not archived", function() {
                beforeEach(function() {
                    this.workspace.set({ archivedAt: null });
                    this.dialog.render();
                });

                it("displays enabled radio buttons with 'active' selected", function() {
                    var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                    var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                    expect(activeRadio).not.toBeDisabled();
                    expect(activeRadio).toBeChecked();
                    expect(archivedRadio).not.toBeDisabled();
                    expect(archivedRadio).not.toBeChecked();
                });

                it("shows the save button and cancel buttons", function() {
                    expect(this.dialog.$("button.submit")).toExist();
                    expect(this.dialog.$("button.cancel")).toContainTranslation("actions.cancel");
                });
            });

            context("and the workspace is archived", function() {
                beforeEach(function() {
                    this.workspace.set({ archivedAt: "2012-01-01 12:34:56" });
                    this.dialog.render();
                });

                it("displays enabled radio buttons with 'archived' selected", function() {
                    var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                    var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                    expect(activeRadio).not.toBeDisabled();
                    expect(activeRadio).not.toBeChecked();
                    expect(archivedRadio).not.toBeDisabled();
                    expect(archivedRadio).toBeChecked();
                });
            });

            it("does allow the user to change the setting for showing sandbox datasets", function() {
                expect(this.dialog.$(".show_sandbox_datasets")).toBeEnabled();
            });
        });

        context("when the user is not the owner, but is a member of the workspace", function() {
            beforeEach(function() {
                this.workspace.set({ permission: ["read", "commenting", "update"] });
                setLoggedInUser({ id: 11 });
                disableSpy.reset();
                this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: this.workspace });
                this.dialog.render();
            });

            itDoesNotAllowEditingImage();
            itDoesNotAllowEditingMembers();
            itHasEditableNameAndSummmary();
            itDisablesArchivingAndUnarchiving();

            it("does not allow the user to change the setting for showing sandbox datasets", function() {
                    expect(this.dialog.$(".show_sandbox_datasets")).toBeDisabled();
                });
        });

        context("when the user is not a member of the workspace", function() {
            beforeEach(function() {
                this.workspace.set({ permission: ["read", "commenting"] });
                setLoggedInUser({ id: 18 });
            });

            context("and the user is not an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ id: '99', admin: false });
                    disableSpy.reset();
                    this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: this.workspace });
                    this.dialog.render();
                });

                it("disables the workspace name input", function() {
                    expect(this.dialog.$("input[name=name]")).toBeDisabled();
                });

                it("disables the 'Publicly available' checkbox", function() {
                    expect(this.dialog.$("input[name=public]")).toBeDisabled();
                });

                it("disables the workspace summary", function() {
                    expect(this.dialog.$("textarea[name=summary]")).toBeDisabled();
                    expect(disableSpy).toHaveBeenCalledWith(true);
                });

                itDoesNotAllowEditingImage();
                itDoesNotAllowEditingMembers();
                itDisablesArchivingAndUnarchiving();

                it("removes the save button and changes the cancel text to close window", function() {
                    expect(this.dialog.$("button.submit")).not.toExist();
                    expect(this.dialog.$("button.cancel")).toContainTranslation("actions.close_window");
                });

                context("and the workspace is not archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ archivedAt: null });
                        this.dialog.render();
                    });

                    it("displays radio buttons with 'active' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).toBeChecked();
                        expect(archivedRadio).not.toBeChecked();
                    });
                });

                context("and the workspace is archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ archivedAt: "2012-02-02 22:22:22" });
                        this.dialog.render();
                    });

                    it("displays radio buttons with 'archived' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).not.toBeChecked();
                        expect(archivedRadio).toBeChecked();
                    });
                });
            });

            context("and the user is an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ admin: true });
                    this.workspace.set({ permission: ["admin"] });
                    disableSpy.reset();
                    this.dialog = new chorus.dialogs.EditWorkspace({ pageModel: this.workspace });
                    this.dialog.render();
                });

                it("does not disable the 'Publicly available' checkbox", function() {
                    expect(this.dialog.$("input[name=public]")).not.toBeDisabled();
                });

                it("does not disable the cleditor", function() {
                    expect(disableSpy).not.toHaveBeenCalled();
                });

                describe("the owner select", function() {
                    it("shows up", function() {
                        expect(this.dialog.$("select.owner")).toExist();
                    });

                    it("has an option for each member", function() {
                        var options = this.dialog.$("select.owner option");
                        expect(options.length).toBe(3);

                        expect(options.eq(0).text()).toBe("Mikey B");
                        expect(options.eq(1).text()).toBe("Deborah D");
                        expect(options.eq(2).text()).toBe("Richard G");

                        expect(options.eq(0).val()).toBe("11");
                        expect(options.eq(1).val()).toBe("12");
                        expect(options.eq(2).val()).toBe("13");
                    });

                    it("defaults to the current owner", function() {
                        expect(this.dialog.$("select.owner").val()).toBe("12");
                    });
                });

                it("enables the radio buttons for archiving/unarchiving", function() {
                    var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                    var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                    expect(archivedRadio).not.toBeDisabled();
                    expect(activeRadio).not.toBeDisabled();
                });

                context("and the workspace is not archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ archivedAt: null });
                        this.dialog.render();
                    });

                    it("displays radio buttons with 'active' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).toBeChecked();
                        expect(archivedRadio).not.toBeChecked();
                    });

                    it("shows the save button and cancel buttons", function() {
                        expect(this.dialog.$("button.submit")).toExist();
                        expect(this.dialog.$("button.cancel")).toContainTranslation("actions.cancel");
                    });
                });

                context("and the workspace is archived", function() {
                    beforeEach(function() {
                        this.workspace.set({ archivedAt: "2013-03-03 11:11:11" });
                        this.dialog.render();
                    });

                    it("displays radio buttons with 'archived' selected", function() {
                        var activeRadio = this.dialog.$("input[type=radio][id=workspace_active]");
                        var archivedRadio = this.dialog.$("input[type=radio][id=workspace_archived]");
                        expect(activeRadio).not.toBeChecked();
                        expect(archivedRadio).toBeChecked();
                    });
                });

                context("and the workspace has an image", function() {
                    beforeEach(function() {
                        spyOn(this.workspace, 'hasImage').andReturn(true);
                        this.dialog.render();
                    });

                    it("displays the workspace image", function() {
                        var image = this.dialog.$("img");
                        expect(image.attr("src")).toContain(this.workspace.fetchImageUrl());
                    });

                    it("displays the 'change image' link", function() {
                        expect(this.dialog.$(".edit_photo a.action")).toExist();
                        expect(this.dialog.$(".edit_photo a.action").text().trim()).toMatchTranslation('workspace.settings.image.change');
                    });
                });

                context("and the workspace does not have an image", function() {
                    beforeEach(function() {
                        spyOn(this.workspace, 'hasImage').andReturn(false);
                        this.dialog.render();
                    });

                    it("does not display an image", function() {
                        expect(this.dialog.$("img")).toHaveClass("hidden");
                    });

                    it("displays the 'add image' link", function() {
                        expect(this.dialog.$(".edit_photo a.action")).toExist();
                        expect(this.dialog.$(".edit_photo a.action").text().trim()).toMatchTranslation('workspace.settings.image.add');
                    });
                });

                context("submitting the form with valid data", function() {
                    beforeEach(function() {
                        spyOnEvent($(document), "close.facebox");
                        spyOn(this.dialog.pageModel, "save").andCallThrough();
                        this.dialog.$("input[name=name]").val("my modified name");
                        this.dialog.$("textarea[name=summary]").val("my modified summary");
                        this.dialog.$("select.owner").val('13');
                        this.dialog.$(".show_sandbox_datasets").prop('checked', false);
                        this.dialog.$("input[name=make_project]").prop('checked', true);
                        this.dialog.$('form').submit();
                    });

                    it("saves the workspace", function() {
                        expect(this.dialog.pageModel.save).toHaveBeenCalled();
                    });

                    it("sets values on the workspace", function() {
                        expect(this.server.lastUpdateFor(this.dialog.pageModel).json()['workspace']).toEqual(jasmine.objectContaining({
                            name: "my modified name",
                            summary: "my modified summary",
                            owner_id: '13',
                            show_sandbox_datasets: false,
                            has_changed_settings: true
                        }));
                    });

                    it("does not close the dialog before the server responds", function() {
                        expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
                    });

                    it("should display a loading spinner in the submit button", function() {
                        expect(this.dialog.$("button.submit")).toHaveSpinner();
                    });

                    context("when the public checkbox is checked", function() {
                        beforeEach(function() {
                            this.dialog.$("input[name=public]").prop("checked", true);
                            this.dialog.$('form').submit();
                        });

                        it("sets the public model attribute to true", function() {
                            expect(this.server.lastUpdateFor(this.dialog.pageModel).json()['workspace']['public']).toEqual(true);
                        });
                    });

                    context("when the public checkbox is not checked", function() {
                        beforeEach(function() {
                            this.dialog.$("input[name=public]").prop("checked", false);
                            this.dialog.$('form').submit();
                        });

                        it("sets the public model attribute to false", function() {
                            expect(this.server.lastUpdateFor(this.dialog.pageModel).json()['workspace']['public']).toEqual(false);
                        });
                    });

                    context("when the active radio is checked", function() {
                        beforeEach(function() {
                            this.dialog.$("input#workspace_active").prop("checked", true);
                            this.dialog.$('form').submit();
                        });

                        it("sets the active model attribute to true", function() {
                            expect(this.server.lastUpdateFor(this.dialog.pageModel).json()['workspace']['active']).toEqual(true);
                        });

                        it("sets the archived model attribute to false", function() {
                            expect(this.server.lastUpdateFor(this.dialog.pageModel).json()['workspace']['archived']).toEqual(false);
                        });
                    });

                    context("when the archived radio is checked", function() {
                        beforeEach(function() {
                            this.dialog.$("input#workspace_archived").prop("checked", true);
                            this.dialog.$("input#workspace_active").prop("checked", false);
                            this.dialog.$('form').submit();
                        });

                        it("sets the active model attribute to false", function() {
                            expect(this.server.lastUpdateFor(this.dialog.pageModel).json()['workspace']['active']).toEqual(false);
                        });

                        it("sets the archived model attribute to true", function() {
                            expect(this.server.lastUpdateFor(this.dialog.pageModel).json()['workspace']['archived']).toEqual(true);
                        });
                    });

                    context("the server responds with success", function() {
                        beforeEach(function() {
                            spyOnEvent(this.dialog.pageModel, "invalidated");
                            spyOn(chorus, "toast");
                            this.server.completeUpdateFor(this.dialog.pageModel);
                        });

                        it(": displays the success message (toast)", function() {
                            expect(chorus.toast).toHaveBeenCalled();
                        });
                        
                        it("closes the dialog", function() {
                            expect("close.facebox").toHaveBeenTriggeredOn($(document));
                        });

                        it("triggers the 'invalidated' event on the model", function() {
                            expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
                        });
                    });

                    context("the server responds with failure", function() {
                        beforeEach(function() {
                            spyOnEvent(this.dialog.model, "unprocessableEntity");
                            this.server.lastUpdateFor(this.dialog.pageModel).failUnprocessableEntity({ fields: { a: { BLANK: {} } } });
                        });

                        it("stops the spinner", function() {
                            expect(this.dialog.$("button.submit")).not.toHaveSpinner();
                        });

                        it("does not close the dialog", function() {
                            expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
                        });

                        it("displays the errors", function() {
                            expect(this.dialog.$(".errors").text()).toContain("A can't be blank");
                        });

                        it("does not clear the form", function() {
                            expect(this.dialog.$("input[name=name]").val()).toBe("my modified name");
                        });

                        it("does not show the 422 page", function() {
                            expect("unprocessableEntity").not.toHaveBeenTriggeredOn(this.dialog.model);
                        });
                    });

                    context("when the owner select box is not present", function() {
                        beforeEach(function() {
                            setLoggedInUser({ id: 11, admin: false});
                            this.dialog.render();
                            this.dialog.$("input[name=name]").val("my modified name");
                            this.dialog.$("textarea[name=summary]").val("my modified summary");
                            this.dialog.$('form').submit();
                        });

                        it("saves the workspace", function() {
                            expect(this.dialog.pageModel.save).toHaveBeenCalled();
                        });

                        it("does not provide ownerId in the API call", function() {
                            expect(this.dialog.pageModel.save.nthCall(1).args.hasOwnProperty("ownerId")).toBeFalsy();
                        });
                    });
                });

                context("submitting the form with invalid data", function() {
                    beforeEach(function() {
                        spyOnEvent(this.dialog.pageModel, "validationFailed");
                        this.dialog.$("input[name=name]").val("");
                        this.dialog.$("textarea[name=summary]").val("my modified summary");
                        this.dialog.$('form').submit();
                    });

                    it("triggers validation Failed", function() {
                        expect("validationFailed").toHaveBeenTriggeredOn(this.dialog.pageModel);
                    });

                    it("stops the spinner", function() {
                        expect(this.dialog.$("button.submit")).not.toHaveSpinner();
                    });

                    it("does not set the name on the workspace", function() {
                        expect(this.dialog.pageModel.get("name")).toBe("my name");
                    });

                    it("does not set the name on the workspace", function() {
                        expect(this.dialog.pageModel.get("summary")).toBe("my summary");
                    });
                });

                it("does allow the user to change the setting for showing sandbox datasets", function() {
                    expect(this.dialog.$(".show_sandbox_datasets")).toBeEnabled();
                });
            });
        });
    });

    describe("select styling", function() {
        it("uses custom styled select box", function() {
            spyOn(chorus, 'styleSelect');
            $(document).trigger("reveal.facebox");
            expect(chorus.styleSelect).toHaveBeenCalled();
        });
    });
});
