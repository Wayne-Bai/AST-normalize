describe("chorus.models.DatasetImportability", function() {
    beforeEach(function() {
        this.dataset = backboneFixtures.dataset({id: 12});

        this.model = new chorus.models.DatasetImportability({
            datasetId: this.dataset.id
        });
    });

    it("has the right url template", function() {
        expect(this.model.url()).toContain("/datasets/12/importability");
    });
});