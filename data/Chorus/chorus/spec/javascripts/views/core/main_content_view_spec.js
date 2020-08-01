describe("MainContentView", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.MainContentView();

            this.view.contentHeader = stubView("header text");
            this.view.content = stubView("content text");

            this.view.render();
        });

        context("with a supplied contentHeader", function() {
            it("should render the header", function() {
                expect(this.view.$(".content_header").text()).toBe("header text");
            });
        });

        context("with a supplied content", function() {
            it("should render the content", function() {
                expect(this.view.$(".content").text()).toBe("content text");
            });
        });

        context("without a supplied content", function() {
            beforeEach(function() {
                this.view.content = undefined;
                this.view.render();
            });

            it("should have the hidden class on the content div", function() {
                expect((this.view.$(".content"))).toHaveClass("hidden");
            });
        });

        context("without a supplied contentDetails", function() {
            it("should have the hidden class on the content_details div", function() {
                expect((this.view.$(".content_details"))).toHaveClass("hidden");
            });
        });

        context("with a supplied contentDetails", function() {
            beforeEach(function() {
                this.view.contentDetails = stubView("content details text");
                this.view.render();
            });

            it("should render the contentDetails", function() {
                expect((this.view.$(".content_details").text())).toBe("content details text");
            });
        });

        context("without a supplied contentFooter", function() {
            it("should have the hidden class on the content_footer div", function() {
                expect((this.view.$(".content_footer"))).toHaveClass("hidden");
            });
        });

        context("with a supplied contentFooter", function() {
            beforeEach(function() {
                this.view.contentFooter = stubView("content footer text");
                this.view.render();
            });

            it("should render the contentFooter", function() {
                expect((this.view.$(".content_footer").text())).toBe("content footer text");
            });
        });
    });
});
