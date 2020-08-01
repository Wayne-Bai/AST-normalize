describe("chorus.pages.ErrorPage", function() {
    beforeEach(function() {
        spyOn(chorus.router, "navigate");
        this.page = new chorus.pages.Error();
        this.page.pageOptions = {
            title: "this is the title",
            text: "this is the page body",
            message: 'ahh real monsters!!!'
        };
        this.page.render();
    });

    it("has the translations for the title", function() {
        expect(this.page.$('.heading')).toContainText(this.page.pageOptions.title);
    });

    it("has the translations for the textbox content", function() {
        expect(this.page.$('.content')).toContainText(this.page.pageOptions.text);
    });

    it("displays the message", function () {
        expect(this.page.$('.content')).toContainText(this.page.pageOptions.message);
    });

    it("has the translations for the link to home", function() {
        expect(this.page.$('.link_home')).toContainTranslation("application.error_message.choicenext.link.home");
    });

    it("navigates to the homepage by clicking the link to home", function() {
        this.page.$('.link_home').click();
        expect(chorus.router.navigate).toHaveBeenCalledWith("#");
    });
});
