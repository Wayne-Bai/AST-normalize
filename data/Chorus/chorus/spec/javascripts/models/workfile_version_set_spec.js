describe("chorus.models.WorkfileVersion", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.WorkfileVersionSet([],{workspaceId: 1, workfileId: 2});
        this.collection.add({id: 1, versionInfo: {id: 10, versionNum: 1}});
        this.collection.add({id: 1, versionInfo: {id: 11, versionNum: 2}});
        this.collection.add({id: 1, versionInfo: {id: 12, versionNum: 3}});
    });
    it("should sort the collection by version number", function() {
        expect(this.collection.models[0].get("versionInfo").versionNum).toBe(3);
        expect(this.collection.models[1].get("versionInfo").versionNum).toBe(2);
        expect(this.collection.models[2].get("versionInfo").versionNum).toBe(1);
    });
});
