describe("chorus.views.KaggleUserSidebar", function () {
    beforeEach(function () {
        this.modalSpy = stubModals();
        this.collection = new chorus.collections.KaggleUserSet([backboneFixtures.kaggleUserSet().at(0)]);

        this.model = this.collection.at(0);
        this.workspace = backboneFixtures.workspace();
        this.view = new chorus.views.KaggleUserSidebar({workspace:this.workspace});
        this.view.setKaggleUser(this.model);
        this.view.render();
    });

    context("with no user", function() {
        beforeEach(function() {
            chorus.PageEvents.trigger('kaggle_user:deselected', null);
        });

        it("does not show the user information sidebar", function() {
            expect(this.view.$('.tab_control')).toBeEmpty();
        });

        it("does not show the 'Compose message' link", function() {
            expect(this.view.$('.actions .sendMessage')).not.toExist();
        });
    });

    context("with a user", function () {
        beforeEach(function () {
            chorus.PageEvents.trigger('kaggle_user:selected', this.model);
        });

        it("renders information inside the tabbed area", function () {
            expect(this.view.tabs.information).toBeA(chorus.views.KaggleUserInformation);
            expect(this.view.tabs.information.el).toBe(this.view.$(".tabbed_content_area .kaggle_user_information")[0]);
        });
    });
});