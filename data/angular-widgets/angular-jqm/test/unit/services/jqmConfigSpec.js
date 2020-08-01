"use strict";
describe('jqmTheme', function() {
    it('allows to read and write the primary', function() {
        module(function(jqmConfigProvider) {
            var someTheme = "someTheme";
            expect(jqmConfigProvider.primaryTheme(someTheme)).toBe(someTheme);
            expect(jqmConfigProvider.primaryTheme()).toBe(someTheme);
        });
    });
    it('uses the theme "c" as primary', function() {
        module(function(jqmConfigProvider) {
            expect(jqmConfigProvider.primaryTheme()).toBe("c");
        });
    });
    it('returns the primaryTheme as service instance', function() {
        var someTheme = "someTheme";
        module(function(jqmConfigProvider) {
            jqmConfigProvider.primaryTheme(someTheme);
        });
        inject(function(jqmConfig) {
            expect(jqmConfig.primaryTheme).toBe(someTheme);
        });
    });

    it('allows to read and write the secondary', function() {
        module(function(jqmConfigProvider) {
            var someTheme = "someTheme";
            expect(jqmConfigProvider.secondaryTheme(someTheme)).toBe(someTheme);
            expect(jqmConfigProvider.secondaryTheme()).toBe(someTheme);
        });
    });
    it('uses the theme "a" as secondary', function() {
        module(function(jqmConfigProvider) {
            expect(jqmConfigProvider.secondaryTheme()).toBe("a");
        });
    });
    it('returns the secondaryTheme as service instance', function() {
        var someTheme = "someTheme";
        module(function(jqmConfigProvider) {
            jqmConfigProvider.secondaryTheme(someTheme);
        });
        inject(function(jqmConfig) {
            expect(jqmConfig.secondaryTheme).toBe(someTheme);
        });
    });
});
