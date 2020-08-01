describe("chorus.alerts.MilestoneDelete", function () {
    beforeEach(function () {
        var milestone = backboneFixtures.milestoneSet().first();
        this.alert = new chorus.alerts.MilestoneDelete({model: milestone});
        this.alert.launchModal();
    });

    describe("submitting the dialog", function () {
        beforeEach(function () {
            spyOn(chorus.router, 'navigate');
        });

        it("redirects to the Milestones index page", function () {
            this.alert.model.destroy();
            this.server.lastDestroyFor(this.alert.model).succeed();

            expect(chorus.router.navigate).toHaveBeenCalledWith('#/workspaces/' +
                this.alert.model.workspace().get('id') + '/milestones');
        });
    });
});