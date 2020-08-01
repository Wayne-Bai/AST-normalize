// Disabled in 2.1 due to blowing up Phantom
xdescribe("jQuery.fileDownload", function() {
    var data, $form, $iframe, uri;
    beforeEach(function() {
        data = {
            name: "Derp",
            job: "Master Developer"
        };
        spyOn($.prototype, "submit");
        spyOn(window, 'setTimeout');
    });

    afterEach(function() {
        $('iframe').remove();
    });

    it("does not start the cookie monitoring loop when no cookieName is provided", function() {
        $.fileDownload("foo/bar");

        expect(window.setTimeout).not.toHaveBeenCalled();
    });

    context("when cookieName is provided", function() {
        it("starts the cookie monitoring loop", function() {
            $.fileDownload("foo/bar", { cookieName: "peanutButterWithChocolateChips" });
            expect(window.setTimeout).toHaveBeenCalled();
        });
    });

    context("using GET", function() {
        beforeEach(function() {
            $.fileDownload("foo/bar", {data: data});
            $iframe = $('iframe');
            uri = new URI($iframe.attr('src'));
        });

        it("has the correct URL", function() {
            expect(uri.path()).toBe('foo/bar');
        });

        it("has the correct data fields", function() {
            expect(uri.search(true).name).toBe("Derp");
            expect(uri.search(true).job).toBe("Master Developer");
        });
    });

    context("using POST", function() {
        beforeEach(function() {
            $.fileDownload("foo/bar", {data: data, httpMethod: 'POST'});
            $iframe = $('iframe');
            $form = $($iframe[0].contentDocument.body).find("form");
            uri = new URI($iframe.attr('src'));
        });

        it("has the correct URL", function() {
            expect($form.attr("action")).toBe("foo/bar");
        });

        it("has the correct method", function() {
            expect($form.attr("method")).toBe("POST");
        });

        it("has the correct data fields", function() {
            expect($form.find("input[name=name][value=Derp]")).toExist();
            expect($form.find("input[name=job][value='Master Developer']")).toExist();
        });
    });
});
