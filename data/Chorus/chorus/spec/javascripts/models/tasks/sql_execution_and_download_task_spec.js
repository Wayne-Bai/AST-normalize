describe("chorus.models.SqlExecutionAndDownloadTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.SqlExecutionAndDownloadTask({
            workfile: backboneFixtures.workfile.sql({id: '1', fileName: 'a_workfile'}),
            sql: 'select 2',
            schemaId: '5',
            numOfRows: '6'
        });
    });

    describe("save", function() {
        it("starts a file download", function() {
            spyOn($, 'fileDownload');
            this.model.save();
            expect($.fileDownload).toHaveBeenCalled();
            expect($.fileDownload.lastCall().args[0]).toBe('/workfiles/1/executions');
            expect($.fileDownload.lastCall().args[1].data['schema_id']).toBe('5');
            expect($.fileDownload.lastCall().args[1].data['sql']).toBe('select 2');
            expect($.fileDownload.lastCall().args[1].data['num_of_rows']).toBe('6');
            expect($.fileDownload.lastCall().args[1].data['file_name']).toBe('a_workfile');
        });
    });

    describe("saveFailed", function() {
        var saveFailed;
        beforeEach(function() {
            saveFailed = jasmine.createSpy('saveFailed');
            this.model.on('saveFailed', saveFailed);
            this.model.saveFailed('<pre>{"errors":"foo"}</pre>');
        });

        it("should save error data", function() {
            expect(this.model.serverErrors).toEqual('foo');
        });

        it("should trigger saveFailed", function() {
            expect(saveFailed).toHaveBeenCalledWith(this.model);
        });
    });
});