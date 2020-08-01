describe("chorus.alerts.Analyze", function() {
    beforeEach(function() {
        stubModals();
        this.model = backboneFixtures.dataset({objectName: "Foo"});
        this.alert = new chorus.alerts.Analyze({model: this.model});
        this.alert.launchModal();
    });

    it("should have the correct title", function() {
        expect(this.alert.title).toMatchTranslation("analyze.alert.title", {name: this.model.name()});
    });

    it("should have the correct body text", function() {
        expect(this.alert.text).toMatchTranslation("analyze.alert.text");
    });

    it("the submit button should say 'Run Analyze'", function() {
        expect(this.alert.$("button.submit")).toContainTranslation("analyze.alert.ok");
    });

    context("when the submit button is clicked", function() {
        beforeEach(function() {
            spyOn(chorus, "toast");
            this.alert.$("button.submit").click();
        });

        it("should display a loading spinner", function() {
            expect(this.alert.$("button.submit")).toContainTranslation("analyze.alert.loading");
            expect(this.alert.$("button.submit").isLoading()).toBeTruthy();
        });

        it("should analyze the table", function() {
            expect(this.server.lastCreateFor(this.model.analyze())).toBeDefined();
        });

        context("when the post completes", function() {
            beforeEach(function() {
                spyOn(this.alert, "closeModal");
                spyOn(chorus.PageEvents, "trigger");
                this.server.lastCreateFor(this.model.analyze()).succeed();
            });

            it("should display a toast", function() {
				expect(chorus.toast).toHaveBeenCalled();
            });

            it("should close the alert", function() {
                expect(this.alert.closeModal).toHaveBeenCalled();
            });

            it("triggers analyze:running", function() {
                expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("analyze:running");
            });
        });

        context("when the post fails", function() {
            beforeEach(function() {
                spyOn(this.alert, "closeModal");
                this.server.lastCreateFor(this.model.analyze()).failUnprocessableEntity({
                    fields: {
                        first: { PROBLEM: {}},
                        second: { PROBLEM: {}}
                    }
                });
            });

            it("should display the errors", function() {
                expect(this.alert.$(".errors li")).toExist();
            });

            it("re-enables the submit button", function() {
                expect(this.alert.$("button.submit").isLoading()).toBeFalsy();
            });
        });
    });
});
