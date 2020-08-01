describe("chorus.dialogs.VisualizationWorkspacePicker", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved");

        stubModals();
        this.dialog = new chorus.dialogs.VisualizationWorkspacePicker();
        this.dialog.launchModal();

        this.workspace1 = backboneFixtures.workspace({name: "Foo"});
        this.workspace2 = backboneFixtures.workspace({name: "Bar"});
        this.workspaces = new chorus.collections.WorkspaceSet([this.workspace1, this.workspace2]);
    });

    it("has the correct title and button", function() {
        expect(this.dialog.title).toMatchTranslation("visualization.workspace_picker.title");
        expect(this.dialog.submitButtonTranslationKey).toBe("visualization.workspace_picker.button");
    });

    describe("it only fetches active workspaces", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.VisualizationWorkspacePicker();
        });

        it("only fetches the active workspaces", function() {
            expect(this.server.lastFetch().url).toMatch(/\?active=true&/);
        });
    });

    context("when the fetch completes", function() {
        beforeEach(function() {
            this.server.lastFetch().succeed(this.workspaces.models);
        });

        it("renders all the workspaces", function() {
            expect(this.dialog.$("li").length).toBe(2);
        });

        context("when a workspace is selected", function() {
            beforeEach(function() {
                spyOn(this.dialog, "closeModal");
                spyOnEvent(this.dialog, "workspace:selected");
                this.dialog.$("li:eq(1)").click();
                this.dialog.$("button.submit").click();
            });

            it("triggers an event with the workspace model", function() {
                expect("workspace:selected").toHaveBeenTriggeredOn(this.dialog, [this.dialog.collection.at(1)]);
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });
    });
});
