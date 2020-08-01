/* Theme */

function sidebarFluid() {
    if ($("#left").hasClass("sidebar-fixed")) {
        $("#left").removeClass("sidebar-fixed").css({
            "height": "auto",
            "top": "0",
            "left": "auto"
        });
    }
    if ($("#navigation").hasClass("navbar-fixed-top")) {
        $("#left").css("top", 40);
    }
    $("#left").getNiceScroll().resize().hide();
    $("#left").removeClass("hasScroll");
}

function sidebarFixed() {
    $("#left").addClass("sidebar-fixed");
    $("#left .ui-resizable-handle").css("top", 0);
    if ($(window).scrollTop() == 0) $("#left").css("top", 40);
    if ($("#content").hasClass("container")) {
        $("#left").css("left", $("#content").offset().left);
    }
    $("#left").getNiceScroll().resize().show();
    initSidebarScroll();
}

function topbarFixed() {
    $("#content").addClass("nav-fixed");
    $("#navigation").addClass("navbar-fixed-top");
    if ($("#left").css("top") == "0px") {
        $("#left").css("top", 40);
    }
}

function topbarFluid() {
    $("#content").removeClass("nav-fixed");
    $("#navigation").removeClass("navbar-fixed-top");
    if ($("#left").css("top") == "40px" && !$('#left').hasClass("sidebar-fixed")) {
        $("#left").css("top", 0);
    }
}

function versionFixed() {
    if ($(window).width() >= 1200) {
        $("#content").addClass("container").removeClass("container-fluid");
        $("#navigation .container-fluid").addClass("container").removeClass("container-fluid");
        if ($("#left").hasClass("sidebar-fixed")) {
            $("#left").css("left", $("#content").offset().left);
        }
    }
}

function versionFluid() {
    $("#content").addClass("container-fluid").removeClass("container");
    $("#navigation .container").addClass("container-fluid").removeClass("container");
    $("#left").css("left", 0);
}

function slimScrollUpdate(elem, toBottom) {
    if(elem.length > 0){
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
        if (toBottom !== undefined) opt.scrollTo = toBottom+"px";
        elem.slimScroll(opt);
    }
}

function destroySlimscroll(elem) {
    elem.parent().replaceWith(elem);
}

function initSidebarScroll() {
    getSidebarScrollHeight();
    if (!$("#left").hasClass("hasScroll")) {
        $("#left").niceScroll({
            cursorborder: 0,
            cursorcolor: '#999',
            railoffset: {
                top: 0,
                left: -2
            },
            autohidemode: false,
            horizrailenabled: false
        });
        $("#left").addClass("hasScroll");
        // if mobile prevent scroll
        $("#left").on('touchmove', function (e) {
            e.preventDefault();
        });
    } else {
        $("#left").getNiceScroll().resize().show();
    }
}

function getSidebarScrollHeight() {
    var $el = $("#left"),
        $w = $(window),
        $nav = $("#navigation");
    var height = $w.height();

    if (($nav.hasClass("navbar-fixed-top") && $w.scrollTop() == 0) || $w.scrollTop() == 0) height -= 40;

    if ($el.hasClass("sidebar-fixed") || $el.hasClass("mobile-show")) {
        $el.height(height);
    }
}

function checkLeftNav() {
    var $w = $(window),
        $content = $("#content"),
        $left = $("#left");
    if ($w.width() <= 767) {
        if (!$left.hasClass("mobile-show")) {
            $left.hide();
            $("#main").css("margin-left", 0);
        }
        if ($(".toggle-mobile").length == 0) {
            $("#navigation .user").before('<a href="#" class="toggle-mobile"><i class="icon-reorder"></i></a>');
        }

        if ($(".mobile-nav").length == 0) {
            createSubNav();
        }
    } else {
        if (!$left.is(":visible") && !$left.hasClass("forced-hide") && !$("#content").hasClass("nav-hidden")) {
            $left.show();
            $("#main").css("margin-left", $left.width());
        }

        $(".toggle-mobile").remove();
        $(".mobile-nav").removeClass("open");

        if ($content.hasClass("forced-fixed")) {
            $content.removeClass("nav-fixed");
            $("#navigation").removeClass("navbar-fixed-top");
        }

        if ($w.width() < 1200) {
            if ($("#navigation .container").length > 0) {
                // it is fixed layout -> reset to fluid
                versionFluid();
            }
        }
    }
}

function resizeHandlerHeight() {
    var wHeight = $(window).height(),
        minus = ($(window).scrollTop() == 0) ? 40 : 0;
    $("#left .ui-resizable-handle").height(wHeight - minus);
}

function toggleMobileNav() {
    var mobileNav = $(".mobile-nav");
    mobileNav.toggleClass("open");
    mobileNav.find(".open").removeClass("open");
}

function getNavElement(current) {
    var currentText = $.trim(current.find(">a").text()),
        element = "";
    element += "<li><a href='" + current.find(">a").attr("href") + "'>" + currentText + "</a>";
    if (current.find(">.dropdown-menu").length > 0) {
        element += getNav(current.find(">.dropdown-menu"));
    }
    element += "</li>";
    return element;
}

var nav = "";
function getNav(current) {
    var currentNav = "";
    currentNav += "<ul>";
    current.find(">li").each(function () {
        currentNav += getNavElement($(this));
    });
    currentNav += "</ul>";
    nav = currentNav;
    return currentNav;
}

function createSubNav() {
    if ($(".mobile-nav").length == 0) {
        var original = $("#navigation .main-nav");
        // loop
        var current = original;
        getNav(current);
        $("#navigation").append(nav);
        $("#navigation > ul").last().addClass("mobile-nav");

        $(".mobile-nav > li > a").click(function (e) {
            var el = $(this);
            $("#navigation").getNiceScroll().resize().show();
            if (el.next().length !== 0) {
                e.preventDefault();

                var sub = el.next();
                el.parents(".mobile-nav").find(".open").not(sub).each(function () {
                    var t = $(this);
                    t.removeClass("open");
                    t.prev().find("i").removeClass("icon-angle-down").addClass("icon-angle-left");
                });
                sub.toggleClass("open");
                el.find("i").toggleClass('icon-angle-left').toggleClass("icon-angle-down");
            }
        });
    }
}

function hideNav() {
    $("#left").toggle().toggleClass("forced-hide");
    if ($("#left").is(":visible")) {
        $("#main").css("margin-left", $("#left").width());
    } else {
        $("#main").css("margin-left", 0);
    }
}

function scrolledClone($el, $cloned) {
    $cloned.remove();
    $el.parent().removeClass("open");
}

function resizeContent() {
    if ($("#main").height() < $(window).height()) {
        var height = 40;
        if ($("#footer").length > 0) {
            height += $("#footer").outerHeight();
        }
        $("#content").css({
            "min-height": "auto",
            "height": $(window).height() - height
        });
    }
}

(function ($) {
    $.fn.retina = function (retina_part) {
        // Set default retina file part to '-2x'
        // Eg. some_image.jpg will become some_image-2x.jpg
        var settings = {'retina_part': '-2x'};
        if (retina_part) jQuery.extend(settings, { 'retina_part': retina_part });
        if (window.devicePixelRatio >= 2) {
            this.each(function (index, element) {
                if (!$(element).attr('src')) return;

                var checkForRetina = new RegExp("(.+)(" + settings['retina_part'] + "\\.\\w{3,4})");
                if (checkForRetina.test($(element).attr('src'))) return;

                var new_image_src = $(element).attr('src').replace(/(.+)(\.\w{3,4})$/, "$1" + settings['retina_part'] + "$2");
                $.ajax({url: new_image_src, type: "HEAD", success: function () {
                    $(element).attr('src', new_image_src);
                }});
            });
        }
        return this;
    }
})(jQuery);

function icheck() {
    if ($(".icheck-me").length > 0) {
        $(".icheck-me").each(function () {
            var $el = $(this);
            var skin = ($el.attr('data-skin') !== undefined) ? "_" + $el.attr('data-skin') : "",
                color = ($el.attr('data-color') !== undefined) ? "-" + $el.attr('data-color') : "";

            var opt = {
                checkboxClass: 'icheckbox' + skin + color,
                radioClass: 'iradio' + skin + color,
                increaseArea: "10%"
            }

            $el.iCheck(opt);
        });
    }
}

function resize_chosen() {
    $('.chzn-container').each(function () {
        var $el = $(this);
        $el.css('width', $el.parent().width() + 'px');
        $el.find(".chzn-drop").css('width', ($el.parent().width() - 2) + 'px');
        $el.find(".chzn-search input").css('width', ($el.parent().width() - 37) + 'px');
    });
}


// Demo
function getUser() {
    var e = 300, t = 600, n = Math.floor(Math.random() * (t - e + 1)) + e;
    onlineUserArray.shift();
    onlineUserArray.push(n);
    return onlineUserArray
}
function createOnlineUserStatistic() {
    var e = $("#online-users"), t = getUser();
    e.sparkline(t, {width: $("#left").width() > 200 ? 100 : $("#left").width() - 100, height: "25px", enableTagOptions: !0});
    e.prev().html(t[t.length - 1]);
    setTimeout(function () {
        createOnlineUserStatistic()
    }, 2e3)
}
function getBalance() {
    var e = 500, t = 750, n = Math.floor(Math.random() * (t - e + 1)) + e;
    balanceArray.shift();
    balanceArray.push(n);
    return balanceArray
}
function createBalanceStatistic() {
    var e = $("#balance"), t = getBalance();
    e.sparkline(t, {height: "25px", barWidth: $("#left").width() > 200 ? 4 : Math.floor(($("#left").width() - 100) / 17) - 1, enableTagOptions: !0});
    e.prev().html("$" + t[t.length - 1]);
    setTimeout(function () {
        createBalanceStatistic()
    }, 3e3)
}
function currentTime() {
    var e = $(".stats .icon-calendar").parent(), t = new Date, n = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], r = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    e.find(".details .big").html(n[t.getMonth()] + " " + t.getDate() + ", " + t.getFullYear());
    e.find(".details span").last().html(r[t.getDay()] + ", " + t.getHours() + ":" + ("0" + t.getMinutes()).slice(-2));
    setTimeout(function () {
        currentTime()
    }, 1e4)
}
function showTooltip(e, t, n) {
    $('<div id="tooltip" class="flot-tooltip tooltip"><div class="tooltip-arrow"></div>' + n + "</div>").css({top: t - 43, left: e - 15}).appendTo("body").fadeIn(200)
}

var onlineUserArray = [255, 455, 385, 759, 500, 284, 581, 684, 255, 455, 385, 759, 500, 293, 585, 342, 684];
var balanceArray = [255, 455, 385, 759, 500, 284, 581, 684, 255, 455, 385, 759, 500, 293, 585, 342, 684];


Session.setDefault('pageTitle', 'Dashboard');
Session.setDefault('seenGuide', false);
Session.setDefault('error', false);

Template.body.error = function () {
    return Session.get('error');
}

Template.pageTitle.title = function () {
    return Session.get('pageTitle');
}

Template.body.rendered = function () {
    var mobile = false,
        tooltipOnlyForDesktop = true,
        notifyActivatedSelector = 'button-active';

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        mobile = true;
    }

    icheck();

    // Round charts (easypie)
    if ($(".chart").length > 0) {
        $(".chart").each(function () {
            var color = "#881302",
                $el = $(this);
            var trackColor = $el.attr("data-trackcolor");
            if ($el.attr('data-color')) {
                color = $el.attr('data-color');
            }
            else {
                if (parseInt($el.attr("data-percent")) <= 25) {
                    color = "#046114";
                }
                else if (parseInt($el.attr("data-percent")) > 25 && parseInt($el.attr("data-percent")) < 75) {
                    color = "#dfc864";
                }
            }
            $el.easyPieChart({
                animate: 1000,
                barColor: color,
                lineWidth: 5,
                size: 80,
                lineCap: 'square',
                trackColor: trackColor
            });
        });
    }

    // Tooltips (only for desktop) (bootstrap tooltips)
    if (tooltipOnlyForDesktop) {
        if (!mobile) {
            $('[rel=tooltip]').tooltip();
        }
    }


    // uniform
    if ($('.uniform-me').length > 0) {
        $('.uniform-me').uniform({
            radioClass: 'uni-radio',
            buttonClass: 'uni-button'
        });
    }
    // Chosen (chosen)
    if ($('.chosen-select').length > 0) {
        $('.chosen-select').each(function () {
            var $el = $(this);
            var search = ($el.attr("data-nosearch") === "true") ? true : false,
                opt = {};
            if (search) opt.disable_search_threshold = 9999999;
            $el.chosen(opt);
        });
    }

    // dynatree
    if ($(".filetree").length > 0) {
        $(".filetree").each(function () {
            var $el = $(this),
                opt = {};
            opt.debugLevel = 0;
            if ($el.hasClass("filetree-callbacks")) {
                opt.onActivate = function (node) {
                    console.log(node.data);
                    $(".activeFolder").text(node.data.title);
                    $(".additionalInformation").html("<ul style='margin-bottom:0;'><li>Key: " + node.data.key + "</li><li>is folder: " + node.data.isFolder + "</li></ul>");
                };
            }
            if ($el.hasClass("filetree-checkboxes")) {
                opt.checkbox = true;

                opt.onSelect = function (select, node) {
                    var selNodes = node.tree.getSelectedNodes();
                    var selKeys = $.map(selNodes, function (node) {
                        return "[" + node.data.key + "]: '" + node.data.title + "'";
                    });
                    $(".checkboxSelect").text(selKeys.join(", "));
                };
            }

            $el.dynatree(opt);
        });
    }

    if ($(".colorbox-image").length > 0) {
        $(".colorbox-image").colorbox({
            maxWidth: "90%",
            maxHeight: "90%",
            rel: $(this).attr("rel")
        });
    }

    // Wizard
    if ($(".form-wizard").length > 0) {
        $(".form-wizard").formwizard({
            formPluginEnabled: true,
            validationEnabled: true,
            focusFirstInput: false,
            disableUIStyles: true,
            validationOptions: {
                errorElement: 'span',
                errorClass: 'help-block error',
                errorPlacement: function (error, element) {
                    element.parents('.controls').append(error);
                },
                highlight: function (label) {
                    $(label).closest('.control-group').removeClass('error success').addClass('error');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error success').addClass('success');
                }
            },
            formOptions: {
                success: function (data) {
                    alert("Response: \n\n" + data.say);
                },
                dataType: 'json',
                resetForm: true
            }
        });
    }

    // Validation
    if ($('.form-validate').length > 0) {
        $('.form-validate').each(function () {
            var id = $(this).attr('id');
            $("#" + id).validate({
                errorElement: 'span',
                errorClass: 'help-block error',
                errorPlacement: function (error, element) {
                    element.parents('.controls').append(error);
                },
                highlight: function (label) {
                    $(label).closest('.control-group').removeClass('error success').addClass('error');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error success').addClass('success');
                }
            });
        });
    }

    // force correct width for chosen
    resize_chosen();

    // file_management
    if ($('.file-manager').length > 0) {
        $('.file-manager').elfinder({
            url: 'js/plugins/elfinder/php/connector.php'
        });
    }

    $(".retina-ready").retina("@2x");

    $(window).resize(function () {
        // chosen resize bug
        resize_chosen();
    });

    resizeContent();

    $(".gototop").click(function (e) {
        e.preventDefault();
        $("html, body").animate({
            scrollTop: 0
        }, 600);
    });

    if ($("body").attr("data-mobile-sidebar") == "slide") {
        $("body").touchwipe({
            wipeRight: function () {
                $("#left").show().addClass("mobile-show");
                initSidebarScroll();
            },
            wipeLeft: function () {
                $("#left").hide().removeClass("mobile-show");
            },
            preventDefaultEvents: false
        });
    }

    if ($("body").attr("data-mobile-sidebar") == "button") {
        $(".mobile-sidebar-toggle").click(function (e) {
            e.preventDefault();
            $("#left").toggle().toggleClass("mobile-show");
            initSidebarScroll();
        });
    }

    $('.main-nav > li, .subnav-menu > li').hover(function () {
        if ($(this).attr("data-trigger") == "hover") {
            if ($(this).parents(".subnav-menu").length > 0 && $("#left").hasClass("sidebar-fixed")) {
                $(this).find(">a").trigger("click");
            } else {
                $(this).closest('.dropdown-menu').stop(true, true).show();
                $(this).addClass('open');
            }
        }
    }, function () {
        if ($(this).attr("data-trigger") == "hover") {
            $(this).closest('.dropdown-menu').stop(true, true).hide();
            $(this).removeClass('open');
        }
    });

    $(".subnav-menu > li > a[data-toggle=dropdown]").click(function () {
        // Clone dropdown menu to body
        var $el = $(this);
        if ($("#left").hasClass("sidebar-fixed") || $("#left").hasClass("mobile-show")) {
            // Remove open clones
            $('.cloned').remove();
            var $ulToClone = $el.next();
            var offset = $el.offset();
            var $cloned = $ulToClone.clone().css({
                top: offset.top,
                left: offset.left + $("#left").width()
            }).show().addClass("cloned");
            $("body").append($cloned);
            $ulToClone.hide();
            $("#left").scroll(function () {
                scrolledClone($el, $cloned);
            });
            $(window).scroll(function () {
                scrolledClone($el, $cloned);
            });

            // if($("#left").hasClass("mobile-show")){
            // close when clicked
            $("body").click(function (e) {
                var target = $(e.target);
                if (target.parents(".cloned").length == 0 && target.attr("data-toggle") != "dropdown") {
                    // close all
                    $el.parent().removeClass("open");
                    $cloned.remove();
                    console.log("ASD");
                }
            });
            // }

            // $("body").on("mouseleave", '.cloned', function(){
            //     $el.parent().removeClass("open");
            //     $cloned.remove();
            // });
        }
    });

    $('body').on('click', ".change-input", function (e) {
        e.preventDefault();
        var $el = $(this);
        var $inputToClone = $el.parent().prev(),
            $parentCloned = $el.parent().clone();
        $parentCloned.html($inputToClone.clone().val(""));
        $inputToClone.after($parentCloned);
        $el.addClass("btn-satgreen update-input").removeClass("btn-grey-4 change-input").text("Update");
    });

    $('body').on("click", '.update-input', function (e) {
        e.preventDefault();
        var $el = $(this);
        var $parent = $el.parent();
        $el.after('<span><i class="icon-spinner icon-spin"></i>Updating...</span>');
        setTimeout(function () {
            $parent.find("span").remove();
            $parent.prev().slideUp(200, function () {
                $parent.prev().remove();
                $el.removeClass("update-input btn-satgreen").addClass("btn-grey-4 change-input").text("Change");
            });
        }, 1000);
    });

    $(".subnav-hidden").each(function () {
        if ($(this).find(".subnav-menu").is(":visible")) $(this).find(".subnav-menu").hide();
    });

    setTimeout(function () {
        slimScrollUpdate($(".messages").parent(), 9999);
    }, 1000);

    createSubNav();

    // hide breadcrumbs
    $(".breadcrumbs .close-bread > a").click(function (e) {
        e.preventDefault();
        $(".breadcrumbs").fadeOut();
    });

    $("#navigation").on('click', '.toggle-mobile', function (e) {
        e.preventDefault();
        toggleMobileNav();
    });

    $(".content-slideUp").click(function (e) {
        e.preventDefault();
        var $el = $(this),
            content = $el.parents('.box').find(".box-content");
        content.slideToggle('fast', function () {
            $el.find("i").toggleClass('icon-angle-up').toggleClass("icon-angle-down");
            if (!$el.find("i").hasClass("icon-angle-up")) {
                if (content.hasClass('scrollable')) slimScrollUpdate(content);
            } else {
                if (content.hasClass('scrollable')) destroySlimscroll(content);
            }
        });
    });

    $(".content-remove").click(function (e) {
        e.preventDefault();
        var $el = $(this);
        var spanElement = $el.parents("[class*=span]");
        var spanWidth = parseInt(spanElement.attr('class').replace("span", "")),
            previousElement = (spanElement.prev().length > 0) ? spanElement.prev() : spanElement.next();
        if (previousElement.length > 0) {
            var prevSpanWidth = parseInt(previousElement.attr("class").replace("span", ""));
        }
        bootbox.animate(false);
        bootbox.confirm("Do you really want to remove the widget <strong>" + $el.parents(".box-title").find("h3").text() + "</strong>?", "Cancel", "Yes, remove", function (r) {
            if (r) {
                $el.parents('[class*=span]').remove();
                if (previousElement.length > 0) {
                    previousElement.removeClass("span" + prevSpanWidth).addClass("span" + (prevSpanWidth + spanWidth));
                }
            }
        });
    });

    $(".content-refresh").click(function (e) {
        e.preventDefault();
        var $el = $(this);
        $el.find("i").addClass("icon-spin");
        setTimeout(function () {
            $el.find("i").removeClass("icon-spin");
        }, 2000);
    });

    $(".sortable-box").sortable({
        connectWith: ".box",
        items: ".box",
        opacity: 0.7,
        placeholder: 'widget-placeholder',
        forcePlaceholderSize: true,
        tolerance: "pointer"
    });

    $(".toggle-subnav").click(function (e) {
        e.preventDefault();
        var $el = $(this);
        $el.parents(".subnav").toggleClass("subnav-hidden").find('.subnav-menu,.subnav-content').slideToggle("fast");
        $el.find("i").toggleClass("icon-angle-down").toggleClass("icon-angle-right");

        if ($("#left").hasClass("mobile-show") || $("#left").hasClass("sidebar-fixed")) {
            getSidebarScrollHeight();
            $("#left").getNiceScroll().resize().show();
        }
    });

    $("#left").sortable({
        items: ".subnav",
        placeholder: "widget-placeholder",
        forcePlaceholderSize: true,
        axis: "y",
        handle: ".subnav-title",
        tolerance: "pointer"
    });

    if ($(".scrollable").length > 0) {
        $('.scrollable').each(function () {
            var $el = $(this);
            var height = parseInt($el.attr('data-height')),
                vis = ($el.attr("data-visible") == "true") ? true : false,
                start = ($el.attr("data-start") == "bottom") ? "bottom" : "top";
            var opt = {
                height: height,
                color: "#666",
                start: start,
                allowPageScroll: true
            };
            if (vis) {
                opt.alwaysVisible = true;
                opt.disabledFadeOut = true;
            }
            $el.slimScroll(opt);
        });
    }

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


    if (!$("#left").hasClass("no-resize")) {
        $("#left").resizable({
            minWidth: 60,
            handles: "e",
            resize: function (event, ui) {
                var searchInput = $('.search-form .search-pane input[type=text]'),
                    content = $("#main");
                searchInput.css({
                    width: ui.size.width - 55
                });
                if (Math.abs(200 - ui.size.width) <= 20) {
                    $("#left").css("width", 200);
                    searchInput.css("width", 145);
                    content.css("margin-left", 200);
                } else {
                    content.css("margin-left", $("#left").width());
                }

            },
            stop: function () {
                $("#left .ui-resizable-handle").css("background", "none");
            },
            start: function () {
                $("#left .ui-resizable-handle").css("background", "#aaa");
            }
        });
    }

    $("[rel=popover]").popover();

    $('.toggle-nav').click(function (e) {
        e.preventDefault();
        hideNav();
    });

    if ($("#content").hasClass("nav-hidden")) {
        hideNav();
    }

    $('.table-mail .sel-star').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $el = $(this);
        $el.toggleClass('active');
    });

    $('.table .sel-all').change(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $el = $(this);
        $el.parents('.table').find("tbody .selectable").prop('checked', (el.prop('checked')));
    });

    $('.table-mail > tbody > tr').click(function (e) {
        var $el = $(this);
        var checkbox = el.find('.table-checkbox > input');
        $el.toggleClass('warning');

        if (e.target.nodeName != 'INPUT') {
            checkbox.prop('checked', !(checkbox.prop('checked')));
        }
    });

    // set resize handler to corret height
    resizeHandlerHeight();



    $(".theme-colors > li > span").hover(function (e) {
        var $el = $(this),
            body = $('body');
        body.attr("class", "").addClass("theme-" + $el.attr("class"));
    },function () {
        var $el = $(this),
            body = $('body');
        if (body.attr("data-theme") !== undefined) {
            body.attr("class", "").addClass(body.attr("data-theme"));
        } else {
            body.attr("class", "");
        }
    }).click(function () {
            var $el = $(this);
            $("body").addClass("theme-" + $el.attr("class")).attr("data-theme", "theme-" + $el.attr("class"));
        });

    $(".sidebar-toggle > a").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $el = $(this);
        var $parent = $el.parent();
        if (!$el.hasClass("active")) {
            $parent.find(".active").removeClass("active");
            $el.addClass("active");
        }

        $(".search-form .search-pane input").attr("style", "");
        $("#main").attr("style", "");

        if ($el.hasClass("set-sidebar-fixed")) {
            sidebarFixed();
        } else {
            sidebarFluid();
        }
    });

    checkLeftNav();
    topbarFixed();

    $.fn.scrollBottom = function () {
        return $(document).height() - this.scrollTop() - this.height();
    };

    $(window).scroll(function (e) {
        var height = 0,
            $w = $(window),
            $d = $(document);

        if ($w.scrollTop() == 0 || $("#left").hasClass("sidebar-fixed")) {
            $("#left .ui-resizable-handle").css("top", height);
        } else {
            if ($w.scrollTop() + $("#left .ui-resizable-handle").height() <= $d.height()) {
                height = $w.scrollTop() - 40;
            } else {
                height = $d.height() - $("#left .ui-resizable-handle").height() - 40;
            }
            $("#left .ui-resizable-handle").css("top", height);
        }

        if (!$("#content").hasClass("nav-fixed") && $("#left").hasClass("sidebar-fixed")) {
            if ($w.scrollTop() < 40) {
                $("#left").css("top", 40 - $w.scrollTop());
            } else {
                $("#left").css("top", 0);
            }
        }


        getSidebarScrollHeight();
        resizeHandlerHeight();
    });

    $(window).resize(function (e) {
        checkLeftNav();
        getSidebarScrollHeight();
        resizeContent();
    });

    // Demo

    var e = $("#left");
    $(".table-user .icon .btn").click(function (e) {
        e.preventDefault();
        var t = $(this), n = t.parents("tr"), r = n.find("td").eq(1).text(), i = n.find("td").eq(0).find("img").attr("src"), s = r + "@randomemailgenerated.com";
        $("#user-infos").text(r);
        $("#modal-user .dl-horizontal dd").eq(0).text(r);
        $("#modal-user .dl-horizontal dd").eq(1).text(s);
        $("#modal-user .span2 img").attr("src", i);
        $("#modal-user").modal("show")
    });
    $.isFunction($.mockjax) && $.mockjax({url: "post.php", responseText: {say: "Form was submitted!"}})
    currentTime();
};