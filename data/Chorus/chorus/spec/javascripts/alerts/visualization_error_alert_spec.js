describe("chorus.alerts.VisualizationError", function() {
    beforeEach(function() {
        this.task = backboneFixtures.frequencyTaskWithErrors();
        this.alert = new chorus.alerts.VisualizationError({ model: this.task });
    });
    
    describe("#makeModel", function() {
        it("should have the correct title", function() {
            expect(this.alert.title).toMatchTranslation("dataset.visualization.alert.title");
        });
    });
});
