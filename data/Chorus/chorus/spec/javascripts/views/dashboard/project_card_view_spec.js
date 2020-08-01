describe("chorus.views.ProjectCard", function () {
    // TODO: This isn't done at all.

    beforeEach(function () {
        this.workspace = backboneFixtures.workspace();
        this.view = new chorus.views.ProjectCard({model: this.workspace});
    });

    describe("project status subview", function () {
        it("is a ProjectStatus", function () {
            expect(this.view.statusView).toBeA(chorus.views.ProjectStatus);
        });

        it("uses the model as the subviews model", function () {
            expect(this.view.statusView.model).toBe(this.workspace);
        });
    });

    /*
    describe("render", function () {
        beforeEach(function () {
            spyOn($.fn, 'qtip');
            this.view.render();
        });

        it("qtipifies info_icons", function () {
            var qtipCall = $.fn.qtip.lastCall();
            expect(qtipCall.object.selector).toBe(".info_icon .icon");
        });
    });
    */
});