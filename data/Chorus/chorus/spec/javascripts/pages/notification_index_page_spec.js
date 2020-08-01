describe("chorus.pages.NotificationIndexPage", function() {
    beforeEach(function() {
        spyOn(chorus.pages.NotificationIndexPage.prototype, "refreshNotifications");
        this.page = new chorus.pages.NotificationIndexPage();
    });

    describe("before the fetch completes", function() {
        it("displays at least the title", function() {
            this.page.render();
            expect($(this.page.el)).toContainTranslation("header.your_notifications");
        });
    });

    describe("when the notification fetches completes", function() {
        beforeEach(function() {
            spyOn(chorus.collections.NotificationSet.prototype, "markAllRead").andCallThrough();

            this.collection = backboneFixtures.notificationSet();
            this.server.completeFetchFor(this.collection);
        });

        it("refreshes notifications on the notification:deleted event", function() {
            chorus.PageEvents.trigger("notification:deleted");
            expect(this.page.refreshNotifications).toHaveBeenCalled();
        });

        it("displays the page header", function() {
            expect(this.page.mainContent.contentHeader.$("h1").text()).toContainTranslation("header.your_notifications");
        });

        it("has NotificationList as the main content view", function() {
            expect(this.page.mainContent.content).toBeA(chorus.views.NotificationList);
        });

        it("should mark all notifications read", function() {
            expect(chorus.collections.NotificationSet.prototype.markAllRead).toHaveBeenCalled();
        });
    });
});