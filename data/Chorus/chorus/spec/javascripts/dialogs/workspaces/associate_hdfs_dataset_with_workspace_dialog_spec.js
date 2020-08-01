describe("chorus.dialogs.HdfsDatasetWorkspacePicker", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved");

        stubModals();

        this.dialog = new chorus.dialogs.HdfsDatasetWorkspacePicker({
            model: backboneFixtures.hdfsFile(),
            activeOnly: true
        });
        this.dialog.launchModal();

        this.workspace1 = backboneFixtures.workspace({name: "Foo"});
        this.workspace2 = backboneFixtures.workspace({name: "Bar"});
        this.workspace3 = backboneFixtures.workspace({name: "no_sandbox"});
        this.workspace3.unset("sandboxInfo");
        this.workspaces = new chorus.collections.WorkspaceSet([this.workspace1, this.workspace2, this.workspace3]);
    });

    it("has the correct title and button", function() {
        expect(this.dialog.title).toMatchTranslation("hdfs_dataset.workspace_picker.title");
        expect(this.dialog.$("button.submit")).toContainTranslation("hdfs_dataset.workspace_picker.submit");
    });

    it("has the correct selectedEvent", function() {
        expect(this.dialog.selectedEvent).toBe("workspace:selected");
    });

    it("should only show active workspaces", function () {
        expect(this.dialog.options.activeOnly).toBeTruthy();
    });

    it('shows only non-archived workspaces', function() {
        expect(this.server.lastFetchAllFor(this.dialog.collection).url).
            toContainQueryParams({active: "true"});
    });
});