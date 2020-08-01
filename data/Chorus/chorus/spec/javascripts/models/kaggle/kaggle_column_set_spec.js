describe("KaggleColumnSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.KaggleColumnSet();
    });

    describe("#initialize", function() {
        it("should populate the collection with the correct columns", function() {
            var models = this.collection.models;
            expect(models[0].get("name")).toBe("Rank");
            expect(models[1].get('name')).toBe("Number of Entered Competitions");
            expect(models[2].get('name')).toBe("Past Competition Types");
            expect(models[3].get('name')).toBe("Favorite Technique");
            expect(models[4].get('name')).toBe("Favorite Software");
            expect(models[5].get('name')).toBe("Location");
        });
    });
});