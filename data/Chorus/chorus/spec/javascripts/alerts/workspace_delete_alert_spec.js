describe("chorus.alerts.WorkspaceDelete", function() {
    beforeEach(function() {
        this.model = new chorus.models.Workspace({ name: "Friends' Writings", id: '34' });
        this.alert = new chorus.alerts.WorkspaceDelete({ pageModel : this.model });
        stubModals();
        this.alert.launchModal();
    });

    it("does not re-render when the model changes", function() {
        expect(this.alert.persistent).toBeTruthy();
    });

    it("has the correct title", function() {
        expect(this.alert.title).toBe(t("workspace.delete.title", "Friends' Writings"));
    });

    it("has the correct text", function() {
        expect(this.alert.text).toBe(t("workspace.delete.text"));
    });

    describe("when the alert closes", function() {
        beforeEach(function() {
            this.alert.render();
            this.alert.$("button.cancel").click();
            spyOn(chorus.router, "navigate");
            spyOn(chorus, 'toast');
        });

        it("unbinds event handlers on the model", function() {
            this.model.trigger("destroy");

            expect(chorus.toast).not.toHaveBeenCalled();
            expect(chorus.router.navigate).not.toHaveBeenCalled();
        });
    });

    describe("when the workspace deletion is successful", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOn(chorus, 'toast');
            this.name = this.model.get("name");
            this.alert.model.destroy();
            this.alert.model.clear();
            this.server.lastDestroy().succeed();
        });

        it("displays a toast message", function() {
            expect(chorus.toast).toHaveBeenCalledWith("workspace.delete.toast", {workspaceName: this.name, toastOpts: {type: 'deletion'}});
        });

        it("navigates to the dashboard", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("/");
        });
    });
});
