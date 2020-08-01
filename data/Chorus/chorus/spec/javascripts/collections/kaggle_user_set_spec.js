describe("chorus.collections.KaggleUserSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.KaggleUserSet([new chorus.models.KaggleUser()]);
    });

    it("has the right url", function() {
        expect(this.collection.url()).toHaveUrlPath('/kaggle/users');
    });

    describe("#count", function () {
        it("returns the models length", function () {
            expect(this.collection.length).toBe(1);
        });
    });
});
