describe("chorus.models.CommentFileUpload", function() {
    describe("cancelUpload", function() {
        beforeEach(function() {
            this.jqXHR = {
                abort: jasmine.createSpy()
            };
            this.data = {};
            this.model = new chorus.models.CommentFileUpload(this.data);
        });

        context("when the upload has not started", function() {
            it("does not blow up", function() {
                this.model.cancelUpload();
            });
        });

        context("when the upload started", function() {
            beforeEach(function() {
                this.data.jqXHR = this.jqXHR;
                this.model.cancelUpload();
            });
            it("calls the abort method", function() {
                expect(this.model.data.jqXHR.abort).toHaveBeenCalled();
            });
        });
    });
});