describe("chorus.dialogs.WorkspaceEditMembers", function() {
    beforeEach(function() {
        this.workspace = new chorus.models.Workspace({
            id : "17",
            "ownerId": "34",
            "ownerFullName": "President Henderson"
        });
        spyOn(chorus.collections.UserSet.prototype, 'fetchAllIfNotLoaded').andCallThrough();
        spyOn(this.workspace.members(), 'fetchAllIfNotLoaded').andCallThrough();
        this.dialog = new chorus.dialogs.WorkspaceEditMembers({ pageModel: this.workspace });
    });

    describe("initialization", function() {
        it("fetches all users", function() {
            expect(this.dialog.collection.fetchAllIfNotLoaded).toHaveBeenCalled();
        });

        it("fetches all members", function() {
            expect(this.workspace.members().fetchAllIfNotLoaded).toHaveBeenCalled();
        });
    });

    describe("render", function() {
        beforeEach(function() {
            spyOn(this.dialog, 'preRender').andCallThrough();
            this.dialog.render();
        });

        it("renders a shuttle", function() {
            expect(this.dialog.shuttle instanceof chorus.views.ShuttleWidget).toBeTruthy();
            expect(this.dialog.$(".shuttle.shuttle_widget")).toExist();
        });

        it("passes the workspace owner as an un-removable item in the shuttle widget", function() {
            expect(this.dialog.shuttle.nonRemovableModels[0].get("id")).toBe(this.workspace.owner().get("id"));
        });

        it("passes the right text for the non-removable owner to the shuttle widget", function() {
            expect(this.dialog.shuttle.options.nonRemovableText).toMatchTranslation("workspace.owner");
        });

        it("renders when user fetch completes", function() {
            this.dialog.preRender.reset();
            this.dialog.collection.trigger('reset');
            expect(this.dialog.preRender).toHaveBeenCalled();
        });

        describe("when the submit button is clicked", function() {
            beforeEach(function() {
                this.user1 = new chorus.models.User({ id: '1', username: "niels" });
                this.user2 = new chorus.models.User({ id: '2', username: "ludwig" });
                this.user3 = new chorus.models.User({ id: '3', username: "isaac" });

                this.dialog.collection.add([ this.user1, this.user2, this.user3 ]);

                spyOn(this.dialog.shuttle, "getSelectedIDs").andReturn(["2", "3"]);
            });

            it("adds the selected models from the shuttle to the 'members' collection", function() {
                this.dialog.$("button.submit").click();
                expect(this.dialog.members.models).toEqual([this.user2, this.user3]);
            });

            it("starts the loading spinner", function() {
                this.dialog.$("button.submit").click();
                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                expect(this.dialog.$("button.submit")).toContainTranslation("actions.saving");
            });

            it("saves the members collection", function() {
                spyOn(this.dialog.members, 'save');
                this.dialog.$("button.submit").click();
                expect(this.dialog.members.save).toHaveBeenCalled();
            });

            context("when the save succeeds", function() {
                beforeEach(function() {
                    spyOnEvent(this.dialog.pageModel, "invalidated");
                    spyOn(this.dialog, 'closeModal');
                    this.dialog.members.trigger("saved");
                });

                it("closes the dialog", function() {
                    expect(this.dialog.closeModal).toHaveBeenCalled();
                });

                it("triggers the 'invalidated' event on the model", function() {
                    expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
                });
            });

            context("when some of the selected users are already members", function() {
                beforeEach(function() {
                    this.otherUser2 = new chorus.models.User({ id: '2', username: "ludwig" });
                    this.dialog.members.add(this.otherUser2);
                });

                it("doesn't double-count those users", function() {
                    this.dialog.$("button.submit").click();
                    expect(this.dialog.members.models.length).toBe(2);
                    expect(this.dialog.members.models).toEqual([this.user2, this.user3]);
                });
            });
        });
    });
});
