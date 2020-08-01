describe("chorus.pages.ColorPaletteView", function() {
    beforeEach(function () {
        this.view = new chorus.views.ColorPaletteView();
        this.view.render();
    });

    it("renders", function () {
        expect(this.view).toBeA(chorus.views.ColorPaletteView);
    });
});