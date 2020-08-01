/*
!!!!!!!!!!!DO NOT DELETE!!!!!!!!!!!

ArtDesignUI (v.1.0.0)
www.artdesign-ui.com

ArtDesignButton (v.1.0.0) - part of ArtDesignUI
818 Lines
www.artdesign-ui.com/ArtDesignButton

License: ArtDesignCreative

Author:
ArtDesign Creative Studio
www.artdesign-creative.com
office@artdesign-creative.com

More jQuery PlugIns:
www.artdesign-jquery.com

!!!!!!!!!!!DO NOT DELETE!!!!!!!!!!!
*/
;(function ($, window) {
    if (!$.ns) {
        $.ns                                                                    = {};
    }
    $.ns.ArtDesignButton                                                        = function (Element, Options) {
        var PlugIn                                                              = this;
        PlugIn.$Element                                                         = $(Element);
        var ElementCounter                                                      = 0,
            NativeButton                                                        = [],
            Button                                                              = [],
            HEX, HEXConvertResult, HEXR, HEXG, HEXB,
            ResultOuterNormal                                                   = [],
            ROuterNormal                                                        = [],
            GOuterNormal                                                        = [],
            BOuterNormal                                                        = [],
            ResultOuterHover                                                    = [],
            ROuterHover                                                         = [],
            GOuterHover                                                         = [],
            BOuterHover                                                         = [],
            ResultOuterClick                                                    = [],
            ROuterClick                                                         = [],
            GOuterClick                                                         = [],
            BOuterClick                                                         = [],
            ResultInnerNormal                                                   = [],
            RInnerNormal                                                        = [],
            GInnerNormal                                                        = [],
            BInnerNormal                                                        = [],
            ResultInnerHover                                                    = [],
            RInnerHover                                                         = [],
            GInnerHover                                                         = [],
            BInnerHover                                                         = [],
            ResultInnerClick                                                    = [],
            RInnerClick                                                         = [],
            GInnerClick                                                         = [],
            BInnerClick                                                         = [],
            NativeOptions                                                       = [],
            NativeOptionsSplit                                                  = [],
            ElementsOptions                                                     = [],
            Icon                                                                = [],
            ResizeTimer;
        PlugIn.Methods                                                          = {
            Initialize                                                          : function () {
                $.PreventButton                                                 = false;
                PlugIn.$Element.find("[data-plugin-ad-button='ad-button']").each(function () {
                    if (!$(this).attr("data-ad-button-initialize")) {
                        NativeButton[ElementCounter]                            = $(this);
                        NativeButton[ElementCounter].attr("data-ad-button-initialize", "initialize");
                        ElementsOptions[ElementCounter]                         = $.extend({}, $.ns.ArtDesignButton.DefaultOptions, Options);
                        if (NativeButton[ElementCounter].attr("data-ad-button-options")) {
                            NativeOptions[ElementCounter]                       = NativeButton[ElementCounter].attr("data-ad-button-options").replace(/ /g, "");
                            NativeOptionsSplit[ElementCounter]                  = NativeOptions[ElementCounter].split(',');
                            
                            for (var a = 0; a < NativeOptionsSplit[ElementCounter].length; a++) {
                                if ($.Buttons !== undefined && $.Buttons[NativeOptionsSplit[ElementCounter][a]]) {
                                    ElementsOptions[ElementCounter]             = $.extend({}, ElementsOptions[ElementCounter], $.Buttons[NativeOptionsSplit[ElementCounter][a]]);
                                }
                            }
                        }
                        PlugIn.Methods.PrepareElement(ElementCounter);
                        $("body").ArtDesignIcons();
                        PlugIn.Methods.CSS(ElementCounter);
                        PlugIn.Methods.ListenHover(ElementCounter);
                        PlugIn.Methods.ListenClick(ElementCounter);
                        PlugIn.Methods.ListenAttrChange(ElementCounter);
                        PlugIn.Methods.WindowResize(ElementCounter);
                        ElementCounter++;
                    }
                });
            },
            PrepareElement                                                      : function (ElementCounter) {
                NativeButton[ElementCounter].wrap('<div></div>');
                Button[ElementCounter]                                          = NativeButton[ElementCounter].parent();
                if (NativeButton[ElementCounter].attr('data-ad-button-icon')) {
                    Icon[ElementCounter]                                        = PlugIn.Methods.DataToOptions(NativeButton[ElementCounter].attr('data-ad-button-icon'));
                    if (ElementsOptions[ElementCounter].IconPosition === "Left") {
                        $('<div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonText"><span class="' + ElementsOptions[ElementCounter].ClassPrefix + 'Icon ' + Icon[ElementCounter]['Icon'] + '"></span>' + NativeButton[ElementCounter].text() + '</div>')
                        .appendTo($(Button[ElementCounter]));
                    }
                    else if (ElementsOptions[ElementCounter].IconPosition === "Right") {
                        $('<div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonText">' + NativeButton[ElementCounter].text() + '<span class="' + ElementsOptions[ElementCounter].ClassPrefix + 'Icon ' + Icon[ElementCounter]['Icon'] + '"></span></div>')
                        .appendTo($(Button[ElementCounter]));
                    }
                }
                else {
                    $('<div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonClickShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonHoverShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalContent"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalGradient"><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonNormalShadow"></div></div></div><div class="' + ElementsOptions[ElementCounter].ClassPrefix + 'ButtonText">' + NativeButton[ElementCounter].text() + '</div>')
                    .appendTo($(Button[ElementCounter]));
                }
            },
            CSS                                                                 : function (ElementCounter) {
                NativeButton[ElementCounter].hide();
                ResultOuterNormal[ElementCounter]                               = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowOuterColorNormal);
                ROuterNormal[ElementCounter]                                    = ResultOuterNormal[ElementCounter][0];
                GOuterNormal[ElementCounter]                                    = ResultOuterNormal[ElementCounter][1];
                BOuterNormal[ElementCounter]                                    = ResultOuterNormal[ElementCounter][2];
                ResultOuterHover[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowOuterColorHover);
                ROuterHover[ElementCounter]                                     = ResultOuterHover[ElementCounter][0];
                GOuterHover[ElementCounter]                                     = ResultOuterHover[ElementCounter][1];
                BOuterHover[ElementCounter]                                     = ResultOuterHover[ElementCounter][2];
                ResultOuterClick[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowOuterColorClick);
                ROuterClick[ElementCounter]                                     = ResultOuterClick[ElementCounter][0];
                GOuterClick[ElementCounter]                                     = ResultOuterClick[ElementCounter][1];
                BOuterClick[ElementCounter]                                     = ResultOuterClick[ElementCounter][2];
                Button[ElementCounter].css({
                    "position"                                                  : "relative",
                    "overflow"                                                  : "hidden",
                    "borderStyle"                                               : ElementsOptions[ElementCounter].BorderStyle,
                    "borderTopWidth"                                            : ElementsOptions[ElementCounter].BorderSizeTop + "px",
                    "borderBottomWidth"                                         : ElementsOptions[ElementCounter].BorderSizeBottom + "px",
                    "borderLeftWidth"                                           : ElementsOptions[ElementCounter].BorderSizeLeft + "px",
                    "borderRightWidth"                                          : ElementsOptions[ElementCounter].BorderSizeRight + "px",
                    "borderTopColor"                                            : ElementsOptions[ElementCounter].BorderTopColorNormal,
                    "borderBottomColor"                                         : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                    "borderLeftColor"                                           : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                    "borderRightColor"                                          : ElementsOptions[ElementCounter].BorderRightColorNormal,
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusOuter + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusOuter + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusOuter + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusOuter + "px",
                    "boxShadow"                                                 : ElementsOptions[ElementCounter].ShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowOuterAlphaNormal + ")"
                });
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickContent").css({
                    "position"                                                  : "absolute",
                    "overflow"                                                  : "hidden",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px"
                });
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].BackgroundColorClick,
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px",
                    "overflow"                                                  : "hidden"
                });
                switch (window.Browser) {
                    case "Chrome":
                    case "Safari":
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorClick + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorClick + "))"
                        });
                        break;
                    case "Firefox":
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                            "background"                                        : "-moz-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorClick + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorClick + " 100%)"
                        });
                        break;
                    case "Opera":
                        if (window.BrowserVersion >= 15) {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                                "background"                                    : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorClick + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorClick + "))"
                            });
                        }
                        else {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                                "background"                                    : "-o-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorClick + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorClick + " 100%)"
                            });
                        }
                        break;
                    case "Explorer":
                        if (window.BrowserVersion >= 10) {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                                "background"                                    : "-ms-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorClick + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorClick + " 100%)"
                            });
                        }
                        else if (window.BrowserVersion < 10 && ElementsOptions[ElementCounter].GradientStartColorClick !== "transparent" && ElementsOptions[ElementCounter].GradientEndColorClick !== "transparent") {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                                "filter"                                        : "progid:DXImageTransform.Microsoft.gradient( startColorstr='" + ElementsOptions[ElementCounter].GradientStartColorClick + "', endColorstr='" + ElementsOptions[ElementCounter].GradientEndColorClick + "',GradientType=0 )"
                            });
                        }
                        break;
                    default:
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorClick + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorClick + "))"
                        });
                }
                ResultInnerClick[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowInnerColorClick);
                RInnerClick[ElementCounter]                                     = ResultInnerClick[ElementCounter][0];
                GInnerClick[ElementCounter]                                     = ResultInnerClick[ElementCounter][1];
                BInnerClick[ElementCounter]                                     = ResultInnerClick[ElementCounter][2];
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickShadow").css({
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px",
                    "boxShadow"                                                 : "inset " + ElementsOptions[ElementCounter].ShadowInnerXClick + "px " + ElementsOptions[ElementCounter].ShadowInnerYClick + "px " + ElementsOptions[ElementCounter].ShadowInnerBlurClick + "px " + ElementsOptions[ElementCounter].ShadowInnerSpreadClick + "px rgba(" + RInnerClick[ElementCounter] + ", " + GInnerClick[ElementCounter] + ", " + BInnerClick[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowInnerAlphaClick + ")"
                });
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverContent").css({
                    "position"                                                  : "absolute",
                    "overflow"                                                  : "hidden",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px"
                });
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].BackgroundColorHover,
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px",
                    "overflow"                                                    : "hidden"
                });
                switch (window.Browser) {
                    case "Chrome":
                    case "Safari":
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorHover + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorHover + "))"
                        });
                        break;
                    case "Firefox":
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                            "background"                                        : "-moz-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorHover + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorHover + " 100%)"
                        });
                        break;
                    case "Opera":
                        if (window.BrowserVersion >= 15) {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                                "background"                                    : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorHover + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorHover + "))"
                            });
                        }
                        else {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                                "background"                                    : "-o-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorHover + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorHover + " 100%)"
                            });
                        }
                        break;
                    case "Explorer":
                        if (window.BrowserVersion >= 10) { 
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                                "background"                                    : "-ms-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorHover + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorHover + " 100%)"
                            });
                        }
                        else if (window.BrowserVersion < 10 && ElementsOptions[ElementCounter].GradientStartColorHover !== "transparent" && ElementsOptions[ElementCounter].GradientEndColorHover !== "transparent") {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                                "filter"                                        : "progid:DXImageTransform.Microsoft.gradient( startColorstr='" + ElementsOptions[ElementCounter].GradientStartColorHover + "', endColorstr='" + ElementsOptions[ElementCounter].GradientEndColorHover + "',GradientType=0 )"
                            });
                        }
                        break;
                    default:
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorHover + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorHover + "))"
                        });
                }
                ResultInnerHover[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowInnerColorHover);
                RInnerHover[ElementCounter]                                     = ResultInnerHover[ElementCounter][0];
                GInnerHover[ElementCounter]                                     = ResultInnerHover[ElementCounter][1];
                BInnerHover[ElementCounter]                                     = ResultInnerHover[ElementCounter][2];
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverShadow").css({
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px",
                    "boxShadow"                                                 : "inset " + ElementsOptions[ElementCounter].ShadowInnerXHover + "px " + ElementsOptions[ElementCounter].ShadowInnerYHover + "px " + ElementsOptions[ElementCounter].ShadowInnerBlurHover + "px " + ElementsOptions[ElementCounter].ShadowInnerSpreadHover + "px rgba(" + RInnerHover[ElementCounter] + ", " + GInnerHover[ElementCounter] + ", " + BInnerHover[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowInnerAlphaHover + ")"
                });
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent").css({
                    "position"                                                  : "absolute",
                    "overflow"                                                  : "hidden",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px"
                });
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].BackgroundColorNormal,
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px",
                    "overflow"                                                  : "hidden"
                });
                switch (window.Browser) {
                    case "Chrome":
                    case "Safari":
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorNormal + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorNormal + "))"
                        });
                        break;
                    case "Firefox":
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                            "background"                                        : "-moz-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorNormal + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorNormal + " 100%)"
                        });
                        break;
                    case "Opera":
                        if (window.BrowserVersion >= 15) {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                                "background"                                    : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorNormal + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorNormal + "))"
                            });
                        }
                        else {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                                "background"                                    : "-o-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorNormal + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorNormal + " 100%)"
                            });
                        }
                        break;
                    case "Explorer":
                        if (window.BrowserVersion >= 10) {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                                "background"                                    : "-ms-linear-gradient(top, " + ElementsOptions[ElementCounter].GradientStartColorNormal + " 0%, " + ElementsOptions[ElementCounter].GradientEndColorNormal + " 100%)"
                            });
                        }
                        else if (window.BrowserVersion < 10 && ElementsOptions[ElementCounter].GradientStartColorNormal !== "transparent" && ElementsOptions[ElementCounter].GradientEndColorNormal !== "transparent") {
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                                "filter"                                        : "progid:DXImageTransform.Microsoft.gradient( startColorstr='" + ElementsOptions[ElementCounter].GradientStartColorNormal + "', endColorstr='" + ElementsOptions[ElementCounter].GradientEndColorNormal + "',GradientType=0 )"
                            });
                        }
                        break;
                    default:
                        Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].GradientStartColorNormal + "), color-stop(100%, " + ElementsOptions[ElementCounter].GradientEndColorNormal + "))"
                        });
                }
                ResultInnerNormal[ElementCounter]                               = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowInnerColorNormal);
                RInnerNormal[ElementCounter]                                    = ResultInnerNormal[ElementCounter][0];
                GInnerNormal[ElementCounter]                                    = ResultInnerNormal[ElementCounter][1];
                BInnerNormal[ElementCounter]                                    = ResultInnerNormal[ElementCounter][2];
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalShadow").css({
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadiusInner + "px",
                    "boxShadow"                                                 : "inset " + ElementsOptions[ElementCounter].ShadowInnerXNormal + "px " + ElementsOptions[ElementCounter].ShadowInnerYNormal + "px " + ElementsOptions[ElementCounter].ShadowInnerBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowInnerSpreadNormal + "px rgba(" + RInnerNormal[ElementCounter] + ", " + GInnerNormal[ElementCounter] + ", " + BInnerNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowInnerAlphaNormal + ")"
                });
                Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").css({
                    "position"                                                  : "absolute",
                    "cursor"                                                    : ElementsOptions[ElementCounter].Cursor,
                    "color"                                                     : ElementsOptions[ElementCounter].ColorNormal,
                    "fontFamily"                                                : ElementsOptions[ElementCounter].FontFamily,
                    "fontSize"                                                  : ElementsOptions[ElementCounter].FontSize + "px",
                    "fontWeight"                                                : ElementsOptions[ElementCounter].FontWeight,
                    "fontStyle"                                                 : ElementsOptions[ElementCounter].FontStyle,
                    "lineHeight"                                                : ElementsOptions[ElementCounter].FontLineHeight + "em"
                });
                if (ElementsOptions[ElementCounter].IconPosition === "Left") {
                    Button [ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").css({
                        "paddingRight"                                          : ElementsOptions[ElementCounter].IconPaddingRight + "px"
                    });    
                }
                else if (ElementsOptions[ElementCounter].IconPosition === "Right") {
                    Button [ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").css({
                        "paddingLeft"                                           : ElementsOptions[ElementCounter].IconPaddingLeft + "px"
                    }); 
                }
                Button [ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").css({
                    "fontSize"                                                  : ElementsOptions[ElementCounter].IconSize + "px"
                }); 
                if (Icon[ElementCounter]) {
                    if (Icon[ElementCounter]['Colors'] !== undefined) {

                        Button [ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").css({
                            "color"                                             : Icon[ElementCounter]['Colors']['Normal'] === undefined ? ElementsOptions[ElementCounter].ColorNormal : Icon[ElementCounter]['Colors']['Normal']
                        });    
                    }
                    else {
                        Button [ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").css({
                            "color"                                             : ElementsOptions[ElementCounter].ColorNormal
                        });  
                    }
                }
                if (NativeButton[ElementCounter].attr('data-ad-button-width')) {
                    Button[ElementCounter].css({
                        "width"                                                 : Button[ElementCounter].parent().width() - (ElementsOptions[ElementCounter].BorderSizeLeft + ElementsOptions[ElementCounter].BorderSizeRight) + "px",
                        "maxWidth"                                              : NativeButton[ElementCounter].attr('data-ad-button-width') + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height + "px"
                    });
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalShadow").css({
                        "width"                                                 : "100%",
                        "maxWidth"                                              : NativeButton[ElementCounter].attr('data-ad-button-width') + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height+ "px",
                        "position"                                              : "absolute"
                    });
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                        "width"                                                 : "100%",
                        "maxWidth"                                              : NativeButton[ElementCounter].attr('data-ad-button-width') + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height + "px",
                        "position"                                              : "relative"
                    });
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").css({
                        "width"                                                 : "100%",
                        "maxWidth"                                              : NativeButton[ElementCounter].attr('data-ad-button-width') + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height + "px",
                        "textAlign"                                             : "center"
                    });
                }
                else {
                    Button[ElementCounter].css({
                        "width"                                                 : Button[ElementCounter].parent().width() - (ElementsOptions[ElementCounter].BorderSizeLeft + ElementsOptions[ElementCounter].BorderSizeRight) + "px",
                        "maxWidth"                                              : Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").width() + ElementsOptions[ElementCounter].PaddingLeft + ElementsOptions[ElementCounter].PaddingRight + 2 + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height + "px"
                    });
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalShadow").css({
                        "width"                                                 : "100%",
                        "maxWidth"                                              : Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").width() + ElementsOptions[ElementCounter].PaddingLeft + ElementsOptions[ElementCounter].PaddingRight + 2 + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height+ "px",
                        "position"                                              : "absolute"
                    });
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").css({
                        "width"                                                 : "100%",
                        "maxWidth"                                              : Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").width() + ElementsOptions[ElementCounter].PaddingLeft + ElementsOptions[ElementCounter].PaddingRight  + 2 + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height + "px",
                        "position"                                              : "relative"
                    });
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").css({
                        "width"                                                 : "100%",
                        "maxWidth"                                              : Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").width() + ElementsOptions[ElementCounter].PaddingLeft + ElementsOptions[ElementCounter].PaddingRight + 2 + "px",
                        "height"                                                : ElementsOptions[ElementCounter].Height + "px",
                        "textAlign"                                             : "center"
                    });
                }
                if (NativeButton[ElementCounter].attr("disabled")) {
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").css({
                        "opacity"                                               : 0
                    });
                    Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").css({
                        "opacity"                                               : ElementsOptions[ElementCounter].OpacityDisabled,
                        "cursor"                                                : ElementsOptions[ElementCounter].CursorDisabled
                    });
                    Button[ElementCounter].css({
                        "boxShadow"                                             : ElementsOptions[ElementCounter].ShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + 0 + ")"
                    });
                }
                Button[ElementCounter].css({
                    "display"                                                   : ElementsOptions[ElementCounter].Display,
                    "marginTop"                                                 : ElementsOptions[ElementCounter].MarginTop + "px",
                    "marginBottom"                                              : ElementsOptions[ElementCounter].MarginBottom + "px",
                    "float"                                                     : ElementsOptions[ElementCounter].Float
                });
                if (ElementsOptions[ElementCounter].MarginLeft === "auto") {
                    Button[ElementCounter].css({
                        "marginLeft"                                            : ElementsOptions[ElementCounter].MarginLeft
                    });
                }
                else {
                    Button[ElementCounter].css({
                        "marginLeft"                                            : ElementsOptions[ElementCounter].MarginLeft + "px"
                    });
                }
                if (ElementsOptions[ElementCounter].MarginRight === "auto") {
                    Button[ElementCounter].css({
                        "marginRight"                                           : ElementsOptions[ElementCounter].MarginRight
                    });
                }
                else {
                    Button[ElementCounter].css({
                        "marginRight"                                           : ElementsOptions[ElementCounter].MarginRight + "px"
                    });
                }
                if(ElementsOptions[ElementCounter].ForceNewLineAfterButton === true) {
                    Button[ElementCounter].css({
                        "clear"                                                 : "both"
                    });
                }
            },
            ListenHover                                                         : function (ElementCounter) {
                Button[ElementCounter].stop().hover(function () {
                    if (!NativeButton[ElementCounter].attr("disabled") && $.PreventButton !== true) {
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalShadow").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorHover
                        }, ElementsOptions[ElementCounter].AnimationSpeed);

                        if (Icon[ElementCounter]) {
                            if (Icon[ElementCounter]['Colors'] !== undefined) {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").stop(true).animate({
                                    "color"                                     : Icon[ElementCounter]['Colors']['Hover'] === undefined ? ElementsOptions[ElementCounter].ColorHover : Icon[ElementCounter]['Colors']['Hover']
                                }, ElementsOptions[ElementCounter].AnimationSpeed);
                            }
                            else {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").stop(true).animate({
                                    "color"                                     : ElementsOptions[ElementCounter].ColorHover
                                }, ElementsOptions[ElementCounter].AnimationSpeed);
                            }
                        }
                        Button[ElementCounter].stop(true).animate({
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorHover,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorHover,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorHover,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorHover,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowOuterXHover + "px " + ElementsOptions[ElementCounter].ShadowOuterYHover + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurHover + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadHover + "px rgba(" + ROuterHover[ElementCounter] + ", " + GOuterHover[ElementCounter] + ", " + BOuterHover[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowOuterAlphaHover + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                    }
                }, function () {
                    if (!NativeButton[ElementCounter].attr("disabled") && $.PreventButton !== true) {
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient").animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalShadow").animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorNormal
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        if (Icon[ElementCounter]) {
                            if (Icon[ElementCounter]['Colors'] !== undefined) {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").animate({
                                    "color"                                     : Icon[ElementCounter]['Colors']['Normal'] === undefined ? ElementsOptions[ElementCounter].ColorNormal : Icon[ElementCounter]['Colors']['Normal']
                                }, ElementsOptions[ElementCounter].AnimationSpeed);
                            }
                            else {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").animate({
                                    "color"                                     : ElementsOptions[ElementCounter].ColorNormal
                                }, ElementsOptions[ElementCounter].AnimationSpeed);
                            }
                        }
                        Button[ElementCounter].animate({
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorNormal,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorNormal,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowOuterAlphaNormal + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                    }
                });
            },
            ListenClick                                                         : function (ElementCounter) {
                Button[ElementCounter].mousedown(function () {
                    if (!NativeButton[ElementCounter].attr("disabled") && $.PreventButton !== true) {
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverShadow").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorClick
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        if (Icon[ElementCounter]) {
                            if (Icon[ElementCounter]['Colors'] !== undefined) {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").animate({
                                    "color"                                     : Icon[ElementCounter]['Colors']['Click'] === undefined ? ElementsOptions[ElementCounter].ColorClick : Icon[ElementCounter]['Colors']['Click']
                                }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                            }
                            else {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").animate({
                                    "color"                                     : ElementsOptions[ElementCounter].ColorClick
                                }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                            }
                        }
                        Button[ElementCounter].animate({
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorClick,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorClick,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorClick,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorClick,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowOuterXClick + "px " + ElementsOptions[ElementCounter].ShadowOuterYClick + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurClick + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadClick + "px rgba(" + ROuterClick[ElementCounter] + ", " + GOuterClick[ElementCounter] + ", " + BOuterClick[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowOuterAlphaClick + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        
                    }
                });
                Button[ElementCounter].mouseup(function () {
                    if (!NativeButton[ElementCounter].attr("disabled") && $.PreventButton !== true) {
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient").animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverShadow").animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorHover
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        if (Icon[ElementCounter]) {
                            if (Icon[ElementCounter]['Colors'] !== undefined) {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").animate({
                                    "color"                                     : Icon[ElementCounter]['Colors']['Hover'] === undefined ? ElementsOptions[ElementCounter].ColorHover : Icon[ElementCounter]['Colors']['Hover']
                                }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                            }
                            else {
                                $(this).find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").animate({
                                    "color"                                     : ElementsOptions[ElementCounter].ColorHover
                                }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                            }
                        }
                        Button[ElementCounter].animate({
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorHover,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorHover,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorHover,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorHover,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowOuterXHover + "px " + ElementsOptions[ElementCounter].ShadowOuterYHover + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurHover + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadHover + "px rgba(" + ROuterHover[ElementCounter] + ", " + GOuterHover[ElementCounter] + ", " + BOuterHover[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowOuterAlphaHover + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                        NativeButton[ElementCounter][0].click();
                    }
                });
            },
            ListenAttrChange                                                    : function (ElementCounter) {
                NativeButton[ElementCounter].attrchange({
                    trackValues                                                 : true,
                    callback                                                    : function (event) {
                        if (event.attributeName === "disabled" && event.newValue === undefined) {
                            $.PreventButton                                     = true;
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").animate({
                                "color"                                         : ElementsOptions[ElementCounter].ColorNormal
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").animate({
                                "opacity"                                       : 1
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").animate({
                                "opacity"                                       : 1
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").css({
                                "cursor"                                        : ElementsOptions[ElementCounter].Cursor
                            });
                            Button[ElementCounter].animate({
                                "borderTopColor"                                : ElementsOptions[ElementCounter].BorderTopColorNormal,
                                "borderBottomColor"                             : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                                "borderLeftColor"                               : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                                "borderRightColor"                              : ElementsOptions[ElementCounter].BorderRightColorNormal,
                                "boxShadow"                                     : ElementsOptions[ElementCounter].ShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowOuterAlphaNormal + ")"
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            setTimeout(function() {
                                $.PreventButton                                 = false;
                            }, ElementsOptions[ElementCounter].AnimationSpeed + 100);
                        }
                        else if (event.attributeName === "disabled" && event.newValue === "disabled") {
                            $.PreventButton                                     = true;
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").animate({
                                "color"                                         : ElementsOptions[ElementCounter].ColorNormal
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonClickGradient").animate({
                                "opacity"                                       : 0
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").animate({
                                "opacity"                                       : ElementsOptions[ElementCounter].OpacityDisabled
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            Button[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonNormalGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "ButtonText").css({
                                "cursor"                                        : ElementsOptions[ElementCounter].CursorDisabled
                            });
                            Button[ElementCounter].animate({
                                "borderTopColor"                                : ElementsOptions[ElementCounter].BorderTopColorNormal,
                                "borderBottomColor"                             : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                                "borderLeftColor"                               : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                                "borderRightColor"                              : ElementsOptions[ElementCounter].BorderRightColorNormal,
                                "boxShadow"                                     : ElementsOptions[ElementCounter].ShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + 0 + ")"
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            setTimeout(function() {
                                $.PreventButton                                 = false;
                            }, ElementsOptions[ElementCounter].AnimationSpeed + 100);
                        }
                    }
                });
            },
            WindowResize: function(ElementCounter) {
                $(window).on("resize", function() {
                    Button[ElementCounter].css({
                        "width"                                                 : Button[ElementCounter].parent().width() - (ElementsOptions[ElementCounter].BorderSizeLeft + ElementsOptions[ElementCounter].BorderSizeRight) + "px"
                    });
                    function AfterResizing(){
                        Button[ElementCounter].css({
                            "width"                                             : Button[ElementCounter].parent().width() - (ElementsOptions[ElementCounter].BorderSizeLeft + ElementsOptions[ElementCounter].BorderSizeRight) + "px"
                        });
                    }
                    clearTimeout(ResizeTimer);
                    ResizeTimer                                                 = setTimeout(AfterResizing(), 100);
                });
            },
            DataToOptions                                                       : function (String) {
                return eval("( {" + String + "} )");
            },
            ConvertHex                                                          : function (String) {
                HEX                                                             = String.replace('#', '');
                HEXR                                                            = parseInt(HEX.substring(0, 2), 16);
                HEXG                                                            = parseInt(HEX.substring(2, 4), 16);
                HEXB                                                            = parseInt(HEX.substring(4, 6), 16);
                HEXConvertResult                                                = [HEXR, HEXG, HEXB];
                return HEXConvertResult;
            }
        };
        PlugIn.PublicMethods                                                    = {};
        PlugIn.Methods.Initialize();
    };
    $.ns.ArtDesignButton.DefaultOptions                                         = {
        /*Base Settings*/
        ClassPrefix                                                             : "But_",
        Height                                                                  : 30,
        Cursor                                                                  : "pointer",
        AnimationSpeed                                                          : 250,
        Display                                                                 : "block",
        MarginTop                                                               : 10,
        MarginBottom                                                            : 10,
        MarginLeft                                                              : 0,
        MarginRight                                                             : 0,
        PaddingLeft                                                             : 30,
        PaddingRight                                                            : 30,
        Float                                                                   : "",
        ForceNewLineAfterButton                                                 : true,
        /*Base Settings*/
        /*Disabled*/
        CursorDisabled                                                          : "not-allowed",
        OpacityDisabled                                                         : 0.6,
        /*Disabled*/
        /*Icon*/
        IconPosition                                                            : "Left",
        IconSize                                                                : 13,
        IconPaddingLeft                                                         : 5,
        IconPaddingRight                                                        : 5,
        /*Icon*/
        /*Font*/
        FontFamily                                                              : "sans-serif",
        FontSize                                                                : 11,
        FontWeight                                                              : "bold",
        FontStyle                                                               : "normal",
        FontLineHeight                                                          : 2.6,
        /*Font*/
        /*Borders*/
        BorderSizeTop                                                           : 1,
        BorderSizeBottom                                                        : 1,
        BorderSizeLeft                                                          : 1,
        BorderSizeRight                                                         : 1,
        BorderStyle                                                             : "solid",
        BorderTopLeftRadiusOuter                                                : 5,
        BorderTopRightRadiusOuter                                               : 5,
        BorderBottomLeftRadiusOuter                                             : 5,
        BorderBottomRightRadiusOuter                                            : 5,
        BorderTopLeftRadiusInner                                                : 4,
        BorderTopRightRadiusInner                                               : 4,
        BorderBottomLeftRadiusInner                                             : 4,
        BorderBottomRightRadiusInner                                            : 4,
        /*Borders*/
        /*Shadow*/
        ShadowOuterXNormal                                                      : 0,
        ShadowOuterYNormal                                                      : 0,
        ShadowOuterBlurNormal                                                   : 3,
        ShadowOuterSpreadNormal                                                 : 0,
        ShadowOuterColorNormal                                                  : "#000000",
        ShadowOuterAlphaNormal                                                  : 0.4,
        ShadowOuterXHover                                                       : 0,
        ShadowOuterYHover                                                       : 0,
        ShadowOuterBlurHover                                                    : 0,
        ShadowOuterSpreadHover                                                  : 0,
        ShadowOuterColorHover                                                   : "#000000",
        ShadowOuterAlphaHover                                                   : 0,
        ShadowOuterXClick                                                       : 0,
        ShadowOuterYClick                                                       : 0,
        ShadowOuterBlurClick                                                    : 0,
        ShadowOuterSpreadClick                                                  : 0,
        ShadowOuterColorClick                                                   : "#000000",
        ShadowOuterAlphaClick                                                   : 0,
        /*Shadow*/
        /*Normal*/
        BackgroundColorNormal                                                   : "#FDFDFD",
        ColorNormal                                                             : "#8E8E8E",
        BorderTopColorNormal                                                    : "#A6A6A6",
        BorderBottomColorNormal                                                 : "#A6A6A6",
        BorderLeftColorNormal                                                   : "#A6A6A6",
        BorderRightColorNormal                                                  : "#A6A6A6",
        GradientStartColorNormal                                                : "#FDFDFD",
        GradientEndColorNormal                                                  : "#E3E3E3",
        ShadowInnerXNormal                                                      : 0,
        ShadowInnerYNormal                                                      : 1,
        ShadowInnerBlurNormal                                                   : 0,
        ShadowInnerSpreadNormal                                                 : 0,
        ShadowInnerColorNormal                                                  : "#FFFFFF",
        ShadowInnerAlphaNormal                                                  : 1,
        /*Normal*/
        /*Hover*/
        BackgroundColorHover                                                    : "#E3E3E3",
        ColorHover                                                              : "#8E8E8E",
        BorderTopColorHover                                                     : "#A6A6A6",
        BorderBottomColorHover                                                  : "#A6A6A6",
        BorderLeftColorHover                                                    : "#A6A6A6",
        BorderRightColorHover                                                   : "#A6A6A6",
        GradientStartColorHover                                                 : "#E3E3E3",
        GradientEndColorHover                                                   : "#E3E3E3",
        ShadowInnerXHover                                                       : 0,
        ShadowInnerYHover                                                       : 1,
        ShadowInnerBlurHover                                                    : 0,
        ShadowInnerSpreadHover                                                  : 0,
        ShadowInnerColorHover                                                   : "#FFFFFF",
        ShadowInnerAlphaHover                                                   : 0.6,
        /*Hover*/
        /*Click*/
        BackgroundColorClick                                                    : "#E6E6E6",
        ColorClick                                                              : "#8E8E8E",
        BorderTopColorClick                                                     : "#A6A6A6",
        BorderBottomColorClick                                                  : "#A6A6A6",
        BorderLeftColorClick                                                    : "#A6A6A6",
        BorderRightColorClick                                                   : "#A6A6A6",
        GradientStartColorClick                                                 : "#CDCDCD",
        GradientEndColorClick                                                   : "#E3E3E3",
        ShadowInnerXClick                                                       : 0,
        ShadowInnerYClick                                                       : 1,
        ShadowInnerBlurClick                                                    : 3,
        ShadowInnerSpreadClick                                                  : 0,
        ShadowInnerColorClick                                                   : "#000000",
        ShadowInnerAlphaClick                                                   : 0.1
        /*Click*/
    };
    $.fn.ArtDesignButton                                                        = function (Options) {
        var ArtDesignButton                                                     = (new $.ns.ArtDesignButton(this, Options));
        return ArtDesignButton.PublicMethods;
    };
})(jQuery, window);