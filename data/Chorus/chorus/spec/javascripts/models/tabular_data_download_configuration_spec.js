describe("chorus.models.DatasetDownloadConfiguration", function() {
    var model;
    beforeEach(function() {
        model = new chorus.models.DatasetDownloadConfiguration();
    });

    context("entering a valid positive number", function() {
        beforeEach(function() {
            model.set({ rowLimit: "20" });
        });

        it("does not fail validation", function() {
            expect(model.performValidation()).toBeTruthy();
        });
    });

    describe("validations", function() {
        context("entering a negative number", function() {
            beforeEach(function() {
                model.set({ rowLimit: "-100" });
            });

            it("does fail validation", function() {
                expect(model.performValidation()).toBeFalsy();
                expect(model.errors.rowLimit).toMatchTranslation('import.validation.sampleCount.positive');
            });
        });

        context("entering a string", function() {
            beforeEach(function() {
                model.set({ rowLimit: "testing12309i234" });
            });

            it("does fail validation", function() {
                expect(model.performValidation()).toBeFalsy();
                expect(model.errors.rowLimit).toMatchTranslation('import.validation.sampleCount.positive');
            });
        });
    });
});
