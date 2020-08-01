describe("chorus.views.KaggleUserListContentDetails", function () {
    beforeEach(function () {
        this.collection = backboneFixtures.kaggleUserSet();
        this.view = new chorus.views.KaggleUserListContentDetails({collection:this.collection});
    });

    it("sets up the KaggleFilterWizard", function () {
        expect(this.view.filterWizardView).toBeA(chorus.views.KaggleFilterWizard);
    });

    describe("render", function () {
        beforeEach(function () {
            this.view.render();
        });

        it("puts the filter wizard subview in the filters div", function () {
            expect($(this.view.el).find(this.view.filterWizardView.el).length).toBeGreaterThan(0);
        });

        it("displays the kaggle users count", function () {
            expect(this.view.$(".count").text()).toContainTranslation("entity.name.User", {count:this.collection.models.length});
        });
    });
});