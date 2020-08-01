/**
 * User: austinrivas
 * Date: 5/2/13
 * Template: feedsWidget
 */

function slimScrollUpdate(elem, toBottom) {
    if (elem.length > 0) {
        var height = parseInt(elem.attr('data-height')),
            vis = (elem.attr("data-visible") == "true") ? true : false,
            start = (elem.attr("data-start") == "bottom") ? "bottom" : "top";
        var opt = {
            height: height,
            color: "#666",
            start: start
        };
        if (vis) {
            opt.alwaysVisible = true;
            opt.disabledFadeOut = true;
        }
        if (toBottom !== undefined) opt.scrollTo = toBottom + "px";
        elem.slimScroll(opt);
    }
}

function randomFeed() {
    var e = $("#randomFeed"), t = new Array('<span class="label"><i class="icon-plus"></i></span> <a href="#">John Doe</a> added a new photo', '<span class="label label-success"><i class="icon-user"></i></span> New user registered', '<span class="label label-info"><i class="icon-shopping-cart"></i></span> New order received', '<span class="label label-warning"><i class="icon-comment"></i></span> <a href="#">John Doe</a> commented on <a href="#">News #123</a>'), n = e.parents(".box").find(".box-title .actions .custom-checkbox").hasClass("checkbox-active"), r = Math.floor(Math.random() * 4), i = t[r];
    if (n) {
        e.prepend("<tr><td>" + i + "</td></tr>").find("tr").first().hide();
        e.find("tr").first().fadeIn();
        e.find("tbody tr").length > 20 && e.find("tbody tr").last().fadeOut(400, function () {
            $(this).remove()
        })
    }
    slimScrollUpdate(e.parents(".scrollable"));
    setTimeout(function () {
        randomFeed()
    }, 3e3)
}

Template.feedsWidget.rendered = function () {};