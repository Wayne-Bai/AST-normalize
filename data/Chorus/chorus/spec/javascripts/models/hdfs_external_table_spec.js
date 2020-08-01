describe("chorus.models.HdfsExternalTable", function() {
    beforeEach(function() {
        this.file = new chorus.models.HdfsExternalTable({
            path: 'awesome/path'
        });
    });

    describe("toJSON", function() {
        it("returns the path as the pathname attribute to avoid problems with api doc generation", function() {
            expect(this.file.toJSON().hdfs_external_table.pathname).toEqual("awesome/path");
            expect(this.file.toJSON().hdfs_external_table.path).toBeUndefined();
        });
    });
});
