describe("chorus.models.Config", function() {
    var config;
    beforeEach(function() {
        config = backboneFixtures.config();
    });

    it("has a valid url", function() {
        expect(config.url()).toBe("/config/");
    });

    describe("#isExternalAuth", function() {
        it("returns externalAuthEnabled", function() {
            expect(config.isExternalAuth()).toBeTruthy();
        });
    });

    describe("#fileSizeMbWorkfiles", function() {
        it("returns the workfiles size limit", function() {
            expect(config.fileSizeMbWorkfiles()).toBe(10);
        });
    });

    describe("#fileSizeMbCsvImports", function() {
        it("returns the csv import size limit", function() {
            expect(config.fileSizeMbCsvImports()).toBe(1);
        });
    });

    describe("#license", function () {
        it("returns a License", function () {
            expect(config.license() instanceof(chorus.models.License)).toBeTruthy();
        });

        it("sets the license attributes", function () {
            var license = config.license();
            expect(license.get("developers")).toBe(config.get("license")["developers"]);
        });

        it("memoizes the license", function() {
            expect(config.license()).toBe(config.license());
        });
    });

    describe("#clear", function () {
        it("unsets attrs and memoized license", function () {
            var beforeLicense = config.license();
            expect(config.get("hdfsVersions")).not.toBeUndefined();
            config.clear();
            expect(config.get("hdfsVersions")).toBeUndefined();
            expect(config.license()).not.toBe(beforeLicense);
        });
    });
});
