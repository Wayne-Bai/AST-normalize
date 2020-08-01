/*
!!!!!!!!!!!DO NOT DELETE!!!!!!!!!!!

ArtDesignUI (v.1.0.0)
www.artdesign-ui.com

ArtDesignSelect (v.1.0.0) - part of ArtDesignUI
1293 Lines
www.artdesign-ui.com/ArtDesignSelect

License: ArtDesignCreative

Author:
ArtDesign Creative Studio
www.artdesign-creative.com
office@artdesign-creative.com

More jQuery PlugIns:
www.artdesign-jquery.com

!!!!!!!!!!!DO NOT DELETE!!!!!!!!!!!
*/
;(function($, window) {
    if (!$.ns) {
        $.ns                                                                    = {};
    }
    $.ns.ArtDesignSelect                                                        = function(Element, Options) {
        var PlugIn                                                              = this;
        var a,
            Value, Text,
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
            ElementCounter                                                      = 0,
            ElementsCounter                                                     = 0,
            NativeOptions                                                       = [],
            NativeOptionsSplit                                                  = [],
            ElementsOptions                                                     = [],
            NativeSelect                                                        = [],
            NativeOption                                                        = [],
            SelectMainContainer                                                 = [],
            SelectContainer                                                     = [],
            OptionContainer                                                     = [],
            OptionText                                                          = [],
            OptionValue                                                         = [],
            ExternalChangeValue                                                 = [],
            ScrollHeight                                                        = [],
            JScrollPaneInit                                                     = [],
            APIJScrollPane                                                      = [],
            TempIndex,
            Prevent                                                             = false,
            ResizeTimer;
        PlugIn.$Element                                                         = $(Element);
        PlugIn.Options                                                          = $.extend({}, $.ns.ArtDesignSelect.DefaultOptions, Options);
        PlugIn.Methods                                                          = {
            Initialize                                                          : function() {
                PlugIn.$Element.find("[data-plugin-ad-select='ad-select']").each(function() {
                    if(!$(this).attr("data-ad-select-initialize")) {
                        JScrollPaneInit[ElementCounter]                         = false;
                        NativeSelect[ElementCounter]                            = $(this);
                        NativeSelect[ElementCounter].attr("data-ad-select-initialize", "initialize");
                        ElementsOptions[ElementCounter]                         = PlugIn.Options;
                        if(NativeSelect[ElementCounter].attr("data-ad-select-options")) {
                            NativeOptions[ElementCounter]                       = NativeSelect[ElementCounter].attr("data-ad-select-options").replace(/ /g, "");
                            NativeOptionsSplit[ElementCounter]                  = NativeOptions[ElementCounter].split(',');
                            for (a = 0; a < NativeOptionsSplit[ElementCounter].length; a++) {
                                if($.Selects !== undefined && $.Selects[NativeOptionsSplit[ElementCounter][a]]) {
                                    ElementsOptions[ElementCounter]             = $.extend({}, ElementsOptions[ElementCounter], $.Selects[NativeOptionsSplit[ElementCounter][a]]);
                                }
                            }
                        }
                        if(NativeSelect[ElementCounter].attr("data-ad-select-functions")) {
                            ElementsOptions[ElementCounter] = $.extend({}, ElementsOptions[ElementCounter], PlugIn.Methods.DataToOptions(NativeSelect[ElementCounter].attr("data-ad-select-functions")));
                        }
                        PlugIn.Methods.PrependElements(ElementCounter);
                        $("body").ArtDesignIcons();
                        PlugIn.Methods.CSS(ElementCounter);
                        PlugIn.Methods.ListenHover(ElementCounter);
                        PlugIn.Methods.ListenClicks(ElementCounter);
                        PlugIn.Methods.NativeChange(ElementCounter);
                        PlugIn.Methods.ListenSelectAttrChange(ElementCounter);
                        PlugIn.Methods.WindowResize(ElementCounter);
                        ElementCounter++;
                    }
                });
            },
            PrependElements                                                     : function(ElementCounter) {
                if (NativeSelect[ElementCounter].find("option:selected").index() === 0) {
                    NativeSelect[ElementCounter].find("option:first").attr("selected", "selected");
                }
                NativeSelect[ElementCounter].wrap("<div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectMainContainer'></div>");
                SelectMainContainer[ElementCounter]                             = NativeSelect[ElementCounter].parent();
                NativeSelect[ElementCounter].hide();
                SelectContainer[ElementCounter]                                 = $("<div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectContainer'></div>").appendTo(SelectMainContainer[ElementCounter]);
                OptionContainer[ElementCounter]                                 = $("<div class='" + ElementsOptions[ElementCounter].ClassPrefix + "OptionContainer'></div>").appendTo(SelectMainContainer[ElementCounter]);
                for (a = 0; a < NativeSelect[ElementCounter].find("option").size(); a++) {
                    Value                                                       = NativeSelect[ElementCounter].find("option:eq(" + a + ")").val();
                    Text                                                        = NativeSelect[ElementCounter].find("option:eq(" + a + ")").text();
                    if (NativeSelect[ElementCounter].find("option:eq(" + a + ")").is(':selected')) {
                        if(NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') && ElementsOptions[ElementCounter].IconPosition === "Left") {
                            $("<div value='" + Value + "' class='" + ElementsOptions[ElementCounter].ClassPrefix + "Option " + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent'><span class='" + ElementsOptions[ElementCounter].ClassPrefix + "Icon " + NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') + "'></span>" + Text + "</div></div>")
                            .appendTo(OptionContainer[ElementCounter]);
                        }
                        else if(NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') && ElementsOptions[ElementCounter].IconPosition === "Right") {
                            $("<div value='" + Value + "' class='" + ElementsOptions[ElementCounter].ClassPrefix + "Option " + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent'>" + Text + "<span class='" + ElementsOptions[ElementCounter].ClassPrefix + "Icon " + NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') + "'></span></div></div>")
                            .appendTo(OptionContainer[ElementCounter]);
                        }
                        else {
                            $("<div value='" + Value + "' class='" + ElementsOptions[ElementCounter].ClassPrefix + "Option " + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent'>" + Text + "</div></div>")
                            .appendTo(OptionContainer[ElementCounter]);
                        }
                        if(NativeSelect[ElementCounter].attr('data-ad-select-icon')) {
                            $("<div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickContent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickShadow'></div></div></div><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverContent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow'></div></div></div><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalContent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalShadow'></div></div></div><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectText'><span class='" + ElementsOptions[ElementCounter].ClassPrefix + "Text'></span><span class='" + ElementsOptions[ElementCounter].ClassPrefix + "Icon " + ElementsOptions[ElementCounter].ClassPrefix + "IconUpDown " + NativeSelect[ElementCounter].attr('data-ad-select-icon') + "'></span></div>")
                            .appendTo(SelectContainer[ElementCounter]);
                        }
                        else {
                            $("<div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickContent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickShadow'></div></div></div><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverContent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow'></div></div></div><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalContent'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient'><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalShadow'></div></div></div><div class='" + ElementsOptions[ElementCounter].ClassPrefix + "SelectText'><span class='" + ElementsOptions[ElementCounter].ClassPrefix + "Text'></span></div>")
                            .appendTo(SelectContainer[ElementCounter]);
                        }
                    } else {
                        if(NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') && ElementsOptions[ElementCounter].IconPosition === "Left") {
                            $("\
                            <div value='" + Value + "' class='" + ElementsOptions[ElementCounter].ClassPrefix + "Option'>\n\
                                <div class='" + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent'>\n\
                                    <span class='" + ElementsOptions[ElementCounter].ClassPrefix + "Icon " + NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') + "'></span>" + Text + "\
                                </div>\n\
                            </div>")
                            .appendTo(OptionContainer[ElementCounter]);
                        }
                        else if(NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') && ElementsOptions[ElementCounter].IconPosition === "Right") {
                            $("\
                            <div value='" + Value + "' class='" + ElementsOptions[ElementCounter].ClassPrefix + "Option'>\n\
                                <div class='" + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent'>\n\
                                    " + Text + "\
                                    <span class='" + ElementsOptions[ElementCounter].ClassPrefix + "Icon " + NativeSelect[ElementCounter].find("option:eq(" + a + ")").attr('data-ad-select-icon') + "'></span>\n\
                                </div>\n\
                            </div>")
                            .appendTo(OptionContainer[ElementCounter]);
                        }
                        else {
                            $("<div value='" + Value + "' class='" + ElementsOptions[ElementCounter].ClassPrefix + "Option'>\n\
                                <div class='" + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent'>" + Text + "</div>\n\
                            </div>")
                            .appendTo(OptionContainer[ElementCounter]);
                        }
                    }
                }
                ElementsCounter                                                 = 0;
                NativeOption[ElementCounter]                                    = [];
                NativeSelect[ElementCounter].find("option").each(function() {
                    NativeOption[ElementCounter][ElementsCounter]               = $(this);
                    PlugIn.Methods.ListenOptionAttrChange(ElementCounter, ElementsCounter);
                    if($(this).attr("disabled")) {
                        ExternalChangeValue[ElementCounter]                     = $(this).val();
                        OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option[value='" + ExternalChangeValue[ElementCounter] + "']").addClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled").css({
                            "opacity"                                           : ElementsOptions[ElementCounter].OpacityDisabled,
                            "cursor"                                            : ElementsOptions[ElementCounter].CursorDisabled
                        });
                    }
                    ElementsCounter++;
                });
            },
            CSS                                                                 : function(ElementCounter) {
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText ." + ElementsOptions[ElementCounter].ClassPrefix + "Text").html(OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").children().html());
                SelectMainContainer[ElementCounter].css({
                    "display"                                                   : "block",
                    "maxWidth"                                                  : NativeSelect[ElementCounter].attr("data-ad-select-width") === undefined ? ElementsOptions[ElementCounter].SelectMaxWidth : NativeSelect[ElementCounter].attr("data-ad-select-width") + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "zIndex"                                                    : ElementsOptions[ElementCounter].StartZIndex
                });
                OptionContainer[ElementCounter].css({
                    "display"                                                   : "table",
                    "cursor"                                                    : ElementsOptions[ElementCounter].Cursor,
                    "overflow"                                                  : "hidden",
                    "zIndex"                                                    : ElementsOptions[ElementCounter].StartZIndex
                });
                ResultOuterNormal[ElementCounter]                               = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].SelectShadowOuterColorNormal);
                ROuterNormal[ElementCounter]                                    = ResultOuterNormal[ElementCounter][0];
                GOuterNormal[ElementCounter]                                    = ResultOuterNormal[ElementCounter][1];
                BOuterNormal[ElementCounter]                                    = ResultOuterNormal[ElementCounter][2];
                ResultOuterHover[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].SelectShadowOuterColorHover);
                ROuterHover[ElementCounter]                                     = ResultOuterHover[ElementCounter][0];
                GOuterHover[ElementCounter]                                     = ResultOuterHover[ElementCounter][1];
                BOuterHover[ElementCounter]                                     = ResultOuterHover[ElementCounter][2];
                ResultOuterClick[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].SelectShadowOuterColorClick);
                ROuterClick[ElementCounter]                                     = ResultOuterClick[ElementCounter][0];
                GOuterClick[ElementCounter]                                     = ResultOuterClick[ElementCounter][1];
                BOuterClick[ElementCounter]                                     = ResultOuterClick[ElementCounter][2];
                SelectMainContainer[ElementCounter].parent().css({
                    "minHeight"                                                 : ElementsOptions[ElementCounter].SelectHeight + ElementsOptions[ElementCounter].SelectBorderSizeTop + ElementsOptions[ElementCounter].SelectBorderSizeBottom + "px"
                });
                SelectMainContainer[ElementCounter].css({
                    "float"                                                     : ElementsOptions[ElementCounter].Float,
                    "maxWidth"                                                  : NativeSelect[ElementCounter].attr("data-ad-select-width") === undefined ? ElementsOptions[ElementCounter].SelectMaxWidth : NativeSelect[ElementCounter].attr("data-ad-select-width") + "px",
                    "width"                                                     : "100%",
                    "borderStyle"                                               : ElementsOptions[ElementCounter].SelectBorderStyle,
                    "borderTopWidth"                                            : ElementsOptions[ElementCounter].SelectBorderSizeTop + "px",
                    "borderBottomWidth"                                         : ElementsOptions[ElementCounter].SelectBorderSizeBottom + "px",
                    "borderLeftWidth"                                           : ElementsOptions[ElementCounter].SelectBorderSizeLeft + "px",
                    "borderRightWidth"                                          : ElementsOptions[ElementCounter].SelectBorderSizeRight + "px",
                    "borderTopColor"                                            : ElementsOptions[ElementCounter].SelectBorderTopColorNormal,
                    "borderBottomColor"                                         : ElementsOptions[ElementCounter].SelectBorderBottomColorNormal,
                    "borderLeftColor"                                           : ElementsOptions[ElementCounter].SelectBorderLeftColorNormal,
                    "borderRightColor"                                          : ElementsOptions[ElementCounter].SelectBorderRightColorNormal,
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusOuter + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusOuter + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusOuter + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusOuter + "px",
                    "boxShadow"                                                 : ElementsOptions[ElementCounter].SelectShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowOuterAlphaNormal + ")"
                });
                SelectContainer[ElementCounter].css({
                    "position"                                                  : "relative",
                    "overflow"                                                  : "hidden",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px"
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickContent").css({
                    "width"                                                     : SelectMainContainer[ElementCounter].width()  + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "position"                                                  : "absolute",
                    "overflow"                                                  : "hidden",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px"
                });
                ResultInnerClick[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].SelectShadowInnerColorClick);
                RInnerClick[ElementCounter]                                     = ResultInnerClick[ElementCounter][0];
                GInnerClick[ElementCounter]                                     = ResultInnerClick[ElementCounter][1];
                BInnerClick[ElementCounter]                                     = ResultInnerClick[ElementCounter][2];
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                    "position"                                                  : "relative",
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px",
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].SelectBackgroundColorClick
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickShadow").css({
                    "position"                                                  : "absolute",
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px",
                    "boxShadow"                                                 : "inset " + ElementsOptions[ElementCounter].SelectShadowInnerXClick + "px " + ElementsOptions[ElementCounter].SelectShadowInnerYClick + "px " + ElementsOptions[ElementCounter].SelectShadowInnerBlurClick + "px " + ElementsOptions[ElementCounter].SelectShadowInnerSpreadClick + "px rgba(" + RInnerClick[ElementCounter] + ", " + GInnerClick[ElementCounter] + ", " + BInnerClick[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowInnerAlphaClick + ")"
                });
                switch (window.Browser) {
                    case "Chrome":
                    case "Safari":
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorClick + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorClick + "))"
                        });
                        break;
                    case "Firefox":
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                            "background"                                        : "-moz-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorClick + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorClick + " 100%)"
                        });
                        break;
                    case "Opera":
                        if (window.BrowserVersion >= 15) {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                                "background"                                    : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorClick + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorClick + "))"
                            });
                        }
                        else {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                                "background"                                    : "-o-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorClick + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorClick + " 100%)"
                            });
                        }
                        break;
                    case "Explorer":
                        if (window.BrowserVersion >= 10) {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                                "background"                                    : "-ms-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorClick + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorClick + " 100%)"
                            });
                        }
                        else if (window.BrowserVersion < 10 && ElementsOptions[ElementCounter].SelectGradientStartColorClick !== "transparent" && ElementsOptions[ElementCounter].SelectGradientEndColorClick !== "transparent") {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                                "filter"                                        : "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + ElementsOptions[ElementCounter].SelectGradientStartColorClick + "', endColorstr='" + ElementsOptions[ElementCounter].SelectGradientEndColorClick + "', GradientType=0)"
                            });
                        }
                        break;
                    default:
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorClick + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorClick + "))"
                        });
                }
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverContent").css({
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "position"                                                  : "absolute",
                    "overflow"                                                  : "hidden",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px"
                });
                ResultInnerHover[ElementCounter]                                = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].SelectShadowInnerColorHover);
                RInnerHover[ElementCounter]                                     = ResultInnerHover[ElementCounter][0];
                GInnerHover[ElementCounter]                                     = ResultInnerHover[ElementCounter][1];
                BInnerHover[ElementCounter]                                     = ResultInnerHover[ElementCounter][2];
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                    "position"                                                  : "relative",
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px",
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].SelectBackgroundColorHover
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow").css({
                    "position"                                                  : "absolute",
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px",
                    "boxShadow"                                                 : "inset " + ElementsOptions[ElementCounter].SelectShadowInnerXHover + "px " + ElementsOptions[ElementCounter].SelectShadowInnerYHover + "px " + ElementsOptions[ElementCounter].SelectShadowInnerBlurHover + "px " + ElementsOptions[ElementCounter].SelectShadowInnerSpreadHover + "px rgba(" + RInnerHover[ElementCounter] + ", " + GInnerHover[ElementCounter] + ", " + BInnerHover[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowInnerAlphaHover + ")"
                });
                switch (window.Browser) {
                    case "Chrome":
                    case "Safari":
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorHover + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorHover + "))"
                        });
                        break;
                    case "Firefox":
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                            "background"                                        : "-moz-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorHover + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorHover + " 100%)"
                        });
                        break;
                    case "Opera":
                        if (window.BrowserVersion >= 15) {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                                "background"                                    : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorHover + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorHover + "))"
                            });
                        }
                        else {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                                "background"                                    : "-o-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorHover + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorHover + " 100%)"
                            });
                        }
                        break;
                    case "Explorer":
                        if (window.BrowserVersion >= 10) {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                                "background"                                    : "-ms-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorHover + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorHover + " 100%)"
                            });
                        }
                        else if (window.BrowserVersion < 10 && ElementsOptions[ElementCounter].SelectGradientStartColorHover !== "transparent" && ElementsOptions[ElementCounter].SelectGradientEndColorHover !== "transparent") {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                                "filter"                                        : "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + ElementsOptions[ElementCounter].SelectGradientStartColorHover + "', endColorstr='" + ElementsOptions[ElementCounter].SelectGradientEndColorHover + "', GradientType=0)"
                            });
                        }
                        break;
                    default:
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorHover + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorHover + "))"
                        });
                }
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalContent").css({
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "position"                                                  : "absolute",
                    "overflow"                                                  : "hidden",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px"
                });
                ResultInnerNormal[ElementCounter]                               = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].SelectShadowInnerColorNormal);
                RInnerNormal[ElementCounter]                                    = ResultInnerNormal[ElementCounter][0];
                GInnerNormal[ElementCounter]                                    = ResultInnerNormal[ElementCounter][1];
                BInnerNormal[ElementCounter]                                    = ResultInnerNormal[ElementCounter][2];
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                    "position"                                                  : "relative",
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px",
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].SelectBackgroundColorNormal
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalShadow").css({
                    "width"                                                     : SelectMainContainer[ElementCounter].width() + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight + "px",
                    "position"                                                  : "absolute",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].SelectBorderTopLeftRadiusInner + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].SelectBorderTopRightRadiusInner + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].SelectBorderBottomLeftRadiusInner + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].SelectBorderBottomRightRadiusInner + "px",
                    "boxShadow"                                                 : "inset " + ElementsOptions[ElementCounter].SelectShadowInnerXNormal + "px " + ElementsOptions[ElementCounter].SelectShadowInnerYNormal + "px " + ElementsOptions[ElementCounter].SelectShadowInnerBlurNormal + "px " + ElementsOptions[ElementCounter].SelectShadowInnerSpreadNormal + "px rgba(" + RInnerNormal[ElementCounter] + ", " + GInnerNormal[ElementCounter] + ", " + BInnerNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowInnerAlphaNormal + ")"
                });
                switch (window.Browser) {
                    case "Chrome":
                    case "Safari":
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorNormal + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorNormal + "))"
                        });
                        break;
                    case "Firefox":
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                            "background"                                        : "-moz-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorNormal + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorNormal + " 100%)"
                        });
                        break;
                    case "Opera":
                        if (window.BrowserVersion >= 15) {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                                "background"                                    : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorNormal + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorNormal + "))"
                            });
                        }
                        else {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                                "background"                                    : "-o-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorNormal + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorNormal + " 100%)"
                            });
                        }
                        break;
                    case "Explorer":
                        if (window.BrowserVersion >= 10) {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                                "background"                                    : "-ms-linear-gradient(top, " + ElementsOptions[ElementCounter].SelectGradientStartColorNormal + " 0%, " + ElementsOptions[ElementCounter].SelectGradientEndColorNormal + " 100%)"
                            });
                        }
                        else if (window.BrowserVersion < 10 && ElementsOptions[ElementCounter].SelectGradientStartColorNormal !== "transparent" && ElementsOptions[ElementCounter].SelectGradientEndColorNormal !== "transparent") {
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                                "filter"                                        : "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + ElementsOptions[ElementCounter].SelectGradientStartColorNormal + "', endColorstr='" + ElementsOptions[ElementCounter].SelectGradientEndColorNormal + "', GradientType=0)"
                            });
                        }
                        break;
                    default:
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").css({
                            "background"                                        : "-webkit-gradient(linear, left top, left bottom, color-stop(0%, " + ElementsOptions[ElementCounter].SelectGradientStartColorNormal + "), color-stop(100%, " + ElementsOptions[ElementCounter].SelectGradientEndColorNormal + "))"
                        });
                }
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").css({
                    "width"                                                     : SelectMainContainer[ElementCounter].width() - 5 + "px",
                    "height"                                                    : ElementsOptions[ElementCounter].SelectHeight - ElementsOptions[ElementCounter].SelectBorderSizeTop - ElementsOptions[ElementCounter].SelectBorderSizeBottom + "px",
                    "textOverflow "                                             : "ellipsis",
                    "overflow"                                                  : "hidden",
                    "whiteSpace"                                                : "nowrap",
                    "position"                                                  : "absolute",
                    "cursor"                                                    : ElementsOptions[ElementCounter].Cursor,
                    "color"                                                     : ElementsOptions[ElementCounter].SelectColorNormal,
                    "fontFamily"                                                : ElementsOptions[ElementCounter].SelectFontFamily,
                    "fontSize"                                                  : ElementsOptions[ElementCounter].SelectFontSize + "px",
                    "fontWeight"                                                : ElementsOptions[ElementCounter].SelectFontWeight,
                    "fontStyle"                                                 : ElementsOptions[ElementCounter].SelectFontStyle,
                    "lineHeight"                                                : ElementsOptions[ElementCounter].SelectLineHeight
                });
                if(ElementsOptions[ElementCounter].Align === "Left") {
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Text").css ({
                        "position"                                              : "absolute",
                        "left"                                                  : ElementsOptions[ElementCounter].PaddingLeft + "px"
                    });
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "IconUpDown").css ({
                        "fontSize"                                              : ElementsOptions[ElementCounter].ArrowSize + "px",
                        "position"                                              : "absolute",
                        "right"                                                 : ElementsOptions[ElementCounter].PaddingRight + "px"
                    });
                }
                else if(ElementsOptions[ElementCounter].Align === "Right") {
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "IconUpDown").css ({
                        "fontSize"                                              : ElementsOptions[ElementCounter].ArrowSize + "px",
                        "position"                                              : "absolute",
                        "left"                                                  : ElementsOptions[ElementCounter].PaddingLeft + "px"
                    });
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Text").css ({
                        "position"                                              : "absolute",
                        "right"                                                 : ElementsOptions[ElementCounter].PaddingRight + "px"
                    });
                }
                else if(ElementsOptions[ElementCounter].Align === "Center") {
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Text").css ({
                        "width"                                                 : SelectMainContainer[ElementCounter].width() + "px",
                        "position"                                              : "absolute",
                        "textAlign"                                             : "center"
                    });
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "IconUpDown").css ({
                        "fontSize"                                              : ElementsOptions[ElementCounter].ArrowSize + "px",
                        "position"                                              : "absolute",
                        "right"                                                 : ElementsOptions[ElementCounter].PaddingRight + "px"
                    });
                }
                if(ElementsOptions[ElementCounter].IconPosition === "Left") {
                    SelectMainContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").not("." + ElementsOptions[ElementCounter].ClassPrefix + "IconUpDown").css ({
                        "fontSize"                                              : ElementsOptions[ElementCounter].IconSize + "px",
                        "lineHeight"                                            : ElementsOptions[ElementCounter].IconLineHeight,
                        "marginRight"                                           : ElementsOptions[ElementCounter].IconMarginRight + "px"
                    });
                }
                else if(ElementsOptions[ElementCounter].IconPosition === "Right") {
                    SelectMainContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Icon").not("." + ElementsOptions[ElementCounter].ClassPrefix + "IconUpDown").css ({
                        "fontSize"                                              : ElementsOptions[ElementCounter].IconSize + "px",
                        "lineHeight"                                            : ElementsOptions[ElementCounter].IconLineHeight,
                        "marginLeft"                                            : ElementsOptions[ElementCounter].IconMarginLeft + "px"
                    });
                }
                if(NativeSelect[ElementCounter].attr('data-ad-select-icon')) {
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "IconUpDown").css({
                        "top"                                                   : 0,
                        "position"                                              : "absolute",
                        "lineHeight"                                            : ElementsOptions[ElementCounter].ArrowLineHeight
                    });
                }
                OptionContainer[ElementCounter].css({
                    "width"                                                     : SelectContainer[ElementCounter].width() + "px",
                    "maxHeight"                                                 : ElementsOptions[ElementCounter].OptionAllHeight + "px",
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].OptionBackgroundColorNormal,
                    "borderWidth"                                               : ElementsOptions[ElementCounter].OptionBorderSize + "px",
                    "borderStyle"                                               : ElementsOptions[ElementCounter].OptionBorderStyle,
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].OptionBorderTopLeftRadius + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].OptionBorderTopRightRadius + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].OptionBorderBottomLeftRadius + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].OptionBorderBottomRightRadius + "px",
                    "borderTopColor"                                            : ElementsOptions[ElementCounter].OptionBorderTopColor,
                    "borderBottomColor"                                         : ElementsOptions[ElementCounter].OptionBorderBottomColor,
                    "borderLeftColor"                                           : ElementsOptions[ElementCounter].OptionBorderLeftColor,
                    "borderRightColor"                                          : ElementsOptions[ElementCounter].OptionBorderRightColor,
                    "position"                                                  : "relative",
                    "display"                                                   : "none",
                    "marginLeft"                                                : "-1px"
                });
                OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").css({
                    "width"                                                     : SelectContainer[ElementCounter].width() + "px",
                    "minHeight"                                                 : ElementsOptions[ElementCounter].OptionMinHeight + "px",
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].OptionBackgroundColorNormal,
                    "color"                                                     : ElementsOptions[ElementCounter].OptionColorNormal,
                    "fontFamily"                                                : ElementsOptions[ElementCounter].OptionFontFamily,
                    "fontSize"                                                  : ElementsOptions[ElementCounter].OptionFontSize,
                    "fontWeight"                                                : ElementsOptions[ElementCounter].OptionFontWeight,
                    "fontStyle"                                                 : ElementsOptions[ElementCounter].OptionFontStyle,
                    "lineHeight"                                                : ElementsOptions[ElementCounter].OptionLineHeight,
                    "borderBottomWidth"                                         : ElementsOptions[ElementCounter].OptionSeparatorSize + "px",
                    "borderBottomStyle"                                         : ElementsOptions[ElementCounter].OptionSeparatorStyle,
                    "borderBottomColor"                                         : ElementsOptions[ElementCounter].OptionSeparatorColor
                });
                OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").css({
                    "backgroundColor"                                           : ElementsOptions[ElementCounter].OptionBackgroundColorActive,
                    "color"                                                     : ElementsOptions[ElementCounter].OptionColorActive,
                    "borderBottomColor"                                         : ElementsOptions[ElementCounter].OptionSeparatorColorHover
                });
                OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").last().css({
                    "borderBottomWidth"                                         : 0
                });
                if(ElementsOptions[ElementCounter].Align === "Left") {
                    OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent").css({
                        "paddingLeft"                                           : ElementsOptions[ElementCounter].PaddingLeft + "px",
                        "textAlign"                                             : "left"
                    });
                }
                else if(ElementsOptions[ElementCounter].Align === "Right") {
                    OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent").css({
                        "paddingRight"                                          : ElementsOptions[ElementCounter].PaddingRight + "px",
                        "textAlign"                                             : "right"
                    });
                }
                else if(ElementsOptions[ElementCounter].Align === "Center") {
                    OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionContent").css({
                        "textAlign"                                             : "center"
                    });
                }
                if (NativeSelect[ElementCounter].attr("disabled")) {
                    PlugIn.Methods.Disable(ElementCounter);
                }
            },
            ListenHover                                                         : function(ElementCounter) {
                SelectContainer[ElementCounter].stop().hover(function() {
                    if (!NativeSelect[ElementCounter].attr("disabled")) {
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalShadow").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].SelectColorHover
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectMainContainer[ElementCounter].stop(true).animate({
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].SelectBorderTopColorHover,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].SelectBorderBottomColorHover,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].SelectBorderLeftColorHover,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].SelectBorderRightColorHover,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].SelectShadowOuterXHover + "px " + ElementsOptions[ElementCounter].SelectShadowOuterYHover + "px " + ElementsOptions[ElementCounter].SelectShadowOuterBlurHover + "px " + ElementsOptions[ElementCounter].SelectShadowOuterSpreadHover + "px rgba(" + ROuterHover[ElementCounter] + ", " + GOuterHover[ElementCounter] + ", " + BOuterHover[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowOuterAlphaHover + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                    }
                }, function() {
                    if (!NativeSelect[ElementCounter].attr("disabled")) {
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient").stop(true).animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalShadow").stop(true).animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].SelectColorNormal
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectMainContainer[ElementCounter].animate({
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].SelectBorderTopColorNormal,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].SelectBorderBottomColorNormal,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].SelectBorderLeftColorNormal,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].SelectBorderRightColorNormal,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].SelectShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowOuterAlphaNormal + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                    }
                });
                OptionContainer[ElementCounter].stop().hover(function() {
                    if (window.addEventListener) {
                        window.addEventListener('DOMMouseScroll', PlugIn.Methods.Wheel, false);
                    }
                    window.onmousewheel                                         = document.onmousewheel = PlugIn.Methods.Wheel;
                }, function() {
                    if (window.removeEventListener) {
                        window.removeEventListener('DOMMouseScroll', PlugIn.Methods.Wheel, false);
                    }
                    window.onmousewheel                                         = document.onmousewheel = null;
                });
                OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").stop().hover(function() {
                    if (!$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent") && !$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled")) {
                        $(this).stop(true).animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].OptionBackgroundColorHover,
                            "color"                                             : ElementsOptions[ElementCounter].OptionColorHover
                        }, ElementsOptions[ElementCounter].AnimationSpeedFade);
                    }
                }, function() {
                    if (!$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent") && !$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled")) {
                        $(this).animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].OptionBackgroundColorNormal,
                            "color"                                             : ElementsOptions[ElementCounter].OptionColorNormal
                        }, ElementsOptions[ElementCounter].AnimationSpeedFade);
                    }
                });
            },
            ListenClicks                                                        : function(ElementCounter) {
                SelectContainer[ElementCounter].mousedown(function() {
                    if (!NativeSelect[ElementCounter].attr("disabled")) {
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow").stop(true).animate({
                            "opacity"                                           : 0
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].SelectColorClick
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectMainContainer[ElementCounter].stop(true).animate({
                            "boxShadow"                                         : ElementsOptions[ElementCounter].SelectShadowOuterXClick + "px " + ElementsOptions[ElementCounter].SelectShadowOuterYClick + "px " + ElementsOptions[ElementCounter].SelectShadowOuterBlurClick + "px " + ElementsOptions[ElementCounter].SelectShadowOuterSpreadClick + "px rgba(" + ROuterClick[ElementCounter] + ", " + GOuterClick[ElementCounter] + ", " + BOuterClick[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowOuterAlphaClick + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                    }
                });
                SelectContainer[ElementCounter].mouseup(function() {
                    if (!NativeSelect[ElementCounter].attr("disabled")) {
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient").stop(true).animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow").stop(true).animate({
                            "opacity"                                           : 1
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].SelectColorHover
                        }, ElementsOptions[ElementCounter].AnimationSpeed);
                        SelectMainContainer[ElementCounter].stop(true).animate({
                            "boxShadow"                                           : ElementsOptions[ElementCounter].SelectShadowOuterXHover + "px " + ElementsOptions[ElementCounter].SelectShadowOuterYHover + "px " + ElementsOptions[ElementCounter].SelectShadowOuterBlurHover + "px " + ElementsOptions[ElementCounter].SelectShadowOuterSpreadHover + "px rgba(" + ROuterHover[ElementCounter] + ", " + GOuterHover[ElementCounter] + ", " + BOuterHover[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowOuterAlphaHover + ")"
                        }, ElementsOptions[ElementCounter].AnimationSpeed / 2);
                    }
                });
                SelectContainer[ElementCounter].click(function() {
                    if(Prevent === false && !NativeSelect[ElementCounter].attr("disabled")) {
                        Prevent                                                 = true;
                        if(!OptionContainer[ElementCounter].is(":visible")) {
                            $("." + PlugIn.Options.ClassPrefix + "SelectMainContainer").css({
                                "zIndex"                                        : ElementsOptions[ElementCounter].StartZIndex
                            });
                            SelectMainContainer[ElementCounter].css({
                                "zIndex"                                        : ElementsOptions[ElementCounter].StartZIndex + 1
                            });
                            switch (ElementsOptions[ElementCounter].AnimationOptionType) {
                                case 'Slide':
                                    ElementsOptions[ElementCounter].BeforeOpen();
                                    OptionContainer[ElementCounter].slideDown(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function() {
                                        ElementsOptions[ElementCounter].AfterOpen();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                    break;
                                case 'Fade':
                                    ElementsOptions[ElementCounter].BeforeOpen();
                                    OptionContainer[ElementCounter].fadeToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function() {
                                        ElementsOptions[ElementCounter].AfterOpen();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle) + 10;
                                    break;
                            }
                            setTimeout(function() {
                                OptionContainer[ElementCounter].css({
                                    "width"                                     : SelectContainer[ElementCounter].width() + "px"
                                });
                                ScrollHeight[ElementCounter] = 0;
                                for (a = 0; a < OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").index(); a++) {
                                    ScrollHeight[ElementCounter] += OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option:eq(" + a + ")").height() + ElementsOptions[ElementCounter].OptionSeparatorSize;
                                }
                            }, 1);
                            setTimeout(function() {
                                OptionContainer[ElementCounter].jScrollPane({
                                    animateScroll                               : true,
                                    hideFocus                                   : true,
                                    contentWidth                                : '0px'
                                });
                                OptionContainer[ElementCounter].find(".jspScrollable, .jspContainer, .jspPane").css({
                                    "width"                                     : SelectContainer[ElementCounter].width() + "px"
                                });
                                OptionContainer[ElementCounter].find(".jspVerticalBar").css({
                                    "width"                                     : "6px"
                                });
                                OptionContainer[ElementCounter].find(".jspTrack").css({
                                    "background"                                : "transparent"
                                });
                                OptionContainer[ElementCounter].find(".jspDrag").css({
                                    "borderRadius"                              : "10px",
                                    "background"                                : ElementsOptions[ElementCounter].OptionScrollColor,
                                    "border"                                    : ElementsOptions[ElementCounter].OptionScrollBorderSize,
                                    "borderStyle"                               : ElementsOptions[ElementCounter].OptionScrollBorderStyle,
                                    "borderColor"                               : ElementsOptions[ElementCounter].OptionScrollBorderColor
                                });
                                APIJScrollPane[ElementCounter]                  = OptionContainer[ElementCounter].data('jsp');
                                APIJScrollPane[ElementCounter].scrollTo(0, ScrollHeight[ElementCounter]);
                                OptionContainer[ElementCounter].css({
                                    "width"                                     : SelectContainer[ElementCounter].width() + "px"
                                });
                                Prevent                                         = false;
                            }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 100);
                        }
                        else {
                            switch (ElementsOptions[ElementCounter].AnimationOptionType) {
                                case 'Slide':
                                    ElementsOptions[ElementCounter].BeforeClose();
                                    OptionContainer[ElementCounter].slideUp(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function() {
                                        ElementsOptions[ElementCounter].AfterClose();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                    break;
                                case 'Fade':
                                    ElementsOptions[ElementCounter].BeforeClose();
                                    OptionContainer[ElementCounter].fadeToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function() {
                                        ElementsOptions[ElementCounter].AfterClose();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                    break;
                            }
                            setTimeout(function () { 
                                SelectMainContainer[ElementCounter].css({
                                    "zIndex"                                    : ElementsOptions[ElementCounter].StartZIndex
                                });
                            }, ElementsOptions[ElementCounter].AnimationSpeedToggle);
                            Prevent                                             = false;
                        }
                    }
                });
                OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").mousedown(function() {
                    if (!$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent") && !$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled")) {
                        $(this).animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].OptionBackgroundColorClick,
                            "color"                                             : ElementsOptions[ElementCounter].OptionColorClick
                        }, ElementsOptions[ElementCounter].AnimationSpeedFade);
                    }
                });
                OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").mouseup(function() {
                    if (!$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent") && !$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled")) {
                        $(this).animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].OptionBackgroundColorActive,
                            "color"                                             : ElementsOptions[ElementCounter].OptionColorActive
                        }, ElementsOptions[ElementCounter].AnimationSpeedFade);
                    }
                });
                OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").click(function() {
                    if(ElementsOptions[ElementCounter].ChangeSelect === true) {
                        setTimeout(function () {
                            SelectMainContainer[ElementCounter].css({
                                "zIndex"                                        : ElementsOptions[ElementCounter].StartZIndex
                            });
                        }, ElementsOptions[ElementCounter].AnimationSpeedToggle);
                        if (!$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent") && !$(this).is("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled")) {
                            OptionText[ElementCounter] = $(this).children().html();
                            OptionValue[ElementCounter] = $(this).attr("value");
                            $(this).parent().parent().parent().parent().find("option").map(function () {
                                if (this.value === OptionValue[ElementCounter]) {
                                    $(this).attr("selected", "selected");
                                } else {
                                    $(this).removeAttr("selected");
                                }
                            });
                            OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").animate({
                                "backgroundColor"                               : ElementsOptions[ElementCounter].OptionBackgroundColorNormal,
                                "color"                                         : ElementsOptions[ElementCounter].OptionColorNormal
                            }, ElementsOptions[ElementCounter].AnimationSpeedFade).removeClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent");
                            $(this).addClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent");
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText ." + ElementsOptions[ElementCounter].ClassPrefix + "Text").html(OptionText[ElementCounter]);
                            ElementsOptions[ElementCounter].OnChange($(this).attr("value"));
                            switch (ElementsOptions[ElementCounter].AnimationOptionType) {
                                case 'Slide':
                                    ElementsOptions[ElementCounter].BeforeClose();
                                    OptionContainer[ElementCounter].slideToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function () {
                                        ElementsOptions[ElementCounter].AfterClose();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                    break;
                                case 'Fade':
                                    ElementsOptions[ElementCounter].BeforeClose();
                                    OptionContainer[ElementCounter].fadeToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function () {
                                        ElementsOptions[ElementCounter].AfterClose();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                    break;
                            }
                        }
                        else {
                            switch (ElementsOptions[ElementCounter].AnimationOptionType) {
                                case 'Slide':
                                    ElementsOptions[ElementCounter].BeforeClose();
                                    OptionContainer[ElementCounter].slideToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function () {
                                        ElementsOptions[ElementCounter].AfterClose();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                    break;
                                case 'Fade':
                                    ElementsOptions[ElementCounter].BeforeClose();
                                    OptionContainer[ElementCounter].fadeToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                    setTimeout(function () {
                                        ElementsOptions[ElementCounter].AfterClose();
                                    }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                    break;
                            }
                        }
                    }
                    else {
                        ElementsOptions[ElementCounter].OnClick($(this).attr("value"));
                        switch (ElementsOptions[ElementCounter].AnimationOptionType) {
                            case 'Slide':
                                ElementsOptions[ElementCounter].BeforeClose();
                                OptionContainer[ElementCounter].slideToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                setTimeout(function () {
                                    ElementsOptions[ElementCounter].AfterClose();
                                }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                break;
                            case 'Fade':
                                ElementsOptions[ElementCounter].BeforeClose();
                                OptionContainer[ElementCounter].fadeToggle(ElementsOptions[ElementCounter].AnimationSpeedToggle);
                                setTimeout(function () {
                                    ElementsOptions[ElementCounter].AfterClose();
                                }, ElementsOptions[ElementCounter].AnimationSpeedToggle + 10);
                                break;
                        }
                    }
                });
                $(document).click(function(event) {
                    if (!$(event.target).is("." + PlugIn.Options.ClassPrefix + "SelectMainContainer *")) {
                        switch (PlugIn.Options.AnimationOptionType) {
                            case 'Slide':
                                ElementsOptions[ElementCounter].BeforeClose();
                                $("." + PlugIn.Options.ClassPrefix + "OptionContainer").slideUp(PlugIn.Options.AnimationSpeedToggle);
                                setTimeout(function() {
                                    ElementsOptions[ElementCounter].AfterClose();
                                }, PlugIn.Options.AnimationSpeedToggle + 10);
                                break;
                            case 'Fade':
                                ElementsOptions[ElementCounter].BeforeClose();
                                $("." + PlugIn.Options.ClassPrefix + "OptionContainer").fadeOut(PlugIn.Options.AnimationSpeedToggle);
                                setTimeout(function() {
                                    ElementsOptions[ElementCounter].AfterClose();
                                }, PlugIn.Options.AnimationSpeedToggle + 10);
                                break;
                        }
                        setTimeout(function () { 
                            $("." + PlugIn.Options.ClassPrefix + "SelectMainContainer").css({
                                "zIndex"                                        : ElementsOptions[ElementCounter].StartZIndex
                            });
                        }, ElementsOptions[ElementCounter].AnimationSpeedToggle);
                    }
                });
            },
            NativeChange                                                        : function(ElementCounter) {
                SelectMainContainer[ElementCounter].find("select").change(function() {
                    ExternalChangeValue[ElementCounter]                         = $(this).val();
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText ." + ElementsOptions[ElementCounter].ClassPrefix + "Text").html(OptionContainer[ElementCounter].find("[value='"+ExternalChangeValue[ElementCounter]+"']").children().html());
                    OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").removeClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").css({
                        "backgroundColor"                                       : ElementsOptions[ElementCounter].OptionBackgroundColorNormal,
                        "color"                                                 : ElementsOptions[ElementCounter].OptionColorNormal
                    });
                    OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option[value='" + ExternalChangeValue[ElementCounter] + "']").addClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").css({
                        "backgroundColor"                                       : ElementsOptions[ElementCounter].OptionBackgroundColorActive,
                        "color"                                                 : ElementsOptions[ElementCounter].OptionColorActive
                    });
                    ElementsOptions[ElementCounter].OnChange($(this).val());
                });
            },
            ListenSelectAttrChange                                              : function (ElementCounter) {
                NativeSelect[ElementCounter].attrchange({
                    trackValues                                                 : true,
                    callback                                                    : function (event) {
                        if (event.attributeName === "disabled" && event.newValue === undefined) {
                            PlugIn.Methods.Enable(ElementCounter);
                        }
                        else if (event.attributeName === "disabled" && event.newValue === "disabled") {
                            PlugIn.Methods.Disable(ElementCounter);
                        }
                    }
                });
            },
            ListenOptionAttrChange                                              : function (ElementCounter, ElementsCounter) {
                NativeOption[ElementCounter][ElementsCounter].attrchange({
                    trackValues                                                 : true,
                    callback                                                    : function (event) {
                        if (event.attributeName === "disabled" && event.newValue === undefined) {
                            ExternalChangeValue[ElementCounter]                 = $(this).val();
                            OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option[value='" + ExternalChangeValue[ElementCounter] + "']").removeClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled").css({
                                "opacity"                                       : 1,
                                "cursor"                                        : ElementsOptions[ElementCounter].Cursor
                            });
                        }
                        else if (event.attributeName === "disabled" && event.newValue === "disabled") {
                            ExternalChangeValue[ElementCounter]                 = $(this).val();
                            OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option[value='" + ExternalChangeValue[ElementCounter] + "']").addClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionDisabled").css({
                                "opacity"                                       : ElementsOptions[ElementCounter].OpacityDisabled,
                                "cursor"                                        : ElementsOptions[ElementCounter].CursorDisabled
                            });
                        }
                        if (event.attributeName === "selected" && event.newValue === "selected") {
                            ExternalChangeValue[ElementCounter]                 = $(this).val();
                            TempIndex                                           =  $(this).index();
                            NativeSelect[ElementCounter].find("option").each(function() {
                                if($(this).index() !== TempIndex) {
                                    $(this).removeAttr("selected");
                                }
                            });
                            SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText ." + ElementsOptions[ElementCounter].ClassPrefix + "Text").html(OptionContainer[ElementCounter].find("[value='"+ExternalChangeValue[ElementCounter]+"']").children().html());
                            OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").removeClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").css({
                                "backgroundColor"                               : ElementsOptions[ElementCounter].OptionBackgroundColorNormal,
                                "color"                                         : ElementsOptions[ElementCounter].OptionColorNormal
                            });
                            OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option[value='" + ExternalChangeValue[ElementCounter] + "']").addClass(ElementsOptions[ElementCounter].ClassPrefix + "OptionCurrent").css({
                                "backgroundColor"                               : ElementsOptions[ElementCounter].OptionBackgroundColorActive,
                                "color"                                         : ElementsOptions[ElementCounter].OptionColorActive
                            });
                        }
                    }
                });
            },
            Enable                                                              : function(ElementCounter) {
                SelectMainContainer[ElementCounter].animate({
                    "boxShadow"                                                 : ElementsOptions[ElementCounter].SelectShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].SelectShadowOuterAlphaNormal + ")"
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow").animate({
                    "opacity"                                                   : 1
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").animate({
                    "opacity"                                                   : 1
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveShadow").css({
                    "cursor"                                                    : ElementsOptions[ElementCounter].Cursor
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").animate({
                    opacity                                                     : 1
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").css({
                    "cursor"                                                    : ElementsOptions[ElementCounter].Cursor
                });
            },
            Disable                                                             : function(ElementCounter) {
                SelectMainContainer[ElementCounter].animate({
                    "boxShadow"                                                 : ElementsOptions[ElementCounter].SelectShadowOuterXNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterYNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterBlurNormal + "px " + ElementsOptions[ElementCounter].SelectShadowOuterSpreadNormal + "px rgba(" + ROuterNormal[ElementCounter] + ", " + GOuterNormal[ElementCounter] + ", " + BOuterNormal[ElementCounter] + ", " + 0 + ")"
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow").animate({
                    "opacity"                                                   : 0
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient").animate({
                    "opacity"                                                   : ElementsOptions[ElementCounter].OpacityDisabled
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectActiveShadow").css({
                    "cursor"                                                    : ElementsOptions[ElementCounter].CursorDisabled
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").animate({
                    "opacity"                                                   : ElementsOptions[ElementCounter].OpacityDisabled
                }, {
                    duration                                                    : ElementsOptions[ElementCounter].AnimationSpeedFade,
                    queue                                                       : true
                });
                SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").css({
                    "cursor"                                                    : ElementsOptions[ElementCounter].CursorDisabled
                });
            },
            WindowResize                                                        : function(ElementCounter) {
                $(window).on("resize", function() {
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickContent").css({
                        "width"                                                 : SelectMainContainer[ElementCounter].width() + "px"
                    });
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickShadow").css({
                        "width"                                                 : SelectMainContainer[ElementCounter].width() + "px"
                    });
                    SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").css({
                        "width"                                                 : SelectMainContainer[ElementCounter].width() + "px"
                    });
                    OptionContainer[ElementCounter].slideUp(0);
                    OptionContainer[ElementCounter].css({
                        "width"                                                 : SelectContainer[ElementCounter].width() + "px"
                    });
                    OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").css({
                        "width"                                                 : SelectContainer[ElementCounter].width() + "px"
                    });
                    OptionContainer[ElementCounter].find(".jspScrollable, .jspContainer, .jspPane").css({
                        "width"                                                 : SelectContainer[ElementCounter].width() + "px"
                    });
                    function AfterResizing(){
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverContent, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickContent").css({
                            "width"                                             : SelectMainContainer[ElementCounter].width() + "px"
                        });
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectNormalShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectHoverShadow, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickGradient, ." + ElementsOptions[ElementCounter].ClassPrefix + "SelectClickShadow").css({
                            "width"                                             : SelectMainContainer[ElementCounter].width() + "px"
                        });
                        SelectContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "SelectText").css({
                            "width"                                             : SelectMainContainer[ElementCounter].width() + "px"
                        });
                        OptionContainer[ElementCounter].slideUp(0);
                        OptionContainer[ElementCounter].css({
                            "width"                                             : SelectContainer[ElementCounter].width() + "px"
                        });
                        OptionContainer[ElementCounter].find("." + ElementsOptions[ElementCounter].ClassPrefix + "Option").css({
                            "width"                                             : SelectContainer[ElementCounter].width() + "px"
                        });
                        OptionContainer[ElementCounter].find(".jspScrollable, .jspContainer, .jspPane").css({
                            "width"                                             : SelectContainer[ElementCounter].width() + "px"
                        });
                    }
                    clearTimeout(ResizeTimer);
                    ResizeTimer                                                 = setTimeout(AfterResizing(), 100);
                });
            },
            DataToOptions                                                       : function(String) {
                return eval("( {" + String + "} )");
            },
            ConvertHex                                                          : function(String) {
                HEX                                                             = String.replace('#', '');
                HEXR                                                            = parseInt(HEX.substring(0, 2), 16);
                HEXG                                                            = parseInt(HEX.substring(2, 4), 16);
                HEXB                                                            = parseInt(HEX.substring(4, 6), 16);
                HEXConvertResult                                                = [HEXR, HEXG, HEXB];
                return HEXConvertResult;
            },
            PreventDefault                                                      : function(e) {
                e                                                               = e || window.event;
                if (e.preventDefault)
                    e.preventDefault();
                e.returnValue                                                   = false;  
            },
            Wheel                                                               : function(e) {
                PlugIn.Methods.PreventDefault(e);
            }
        };
        PlugIn.Methods.Initialize();
    };
    $.ns.ArtDesignSelect.DefaultOptions                                         = {
        /*Base*/
        ClassPrefix                                                             : "Sel_",
        StartZIndex                                                             : 9999,
        Cursor                                                                  : "pointer",
        Float                                                                   : "left",
        AnimationSpeed                                                          : 250,
        AnimationSpeedFade                                                      : 250,
        AnimationSpeedToggle                                                    : 250,
        AnimationOptionType                                                     : "Slide", //Fade
        ChangeSelect                                                            : true,
        /*Base*/
        /*Disabled*/
        CursorDisabled                                                          : "not-allowed",
        OpacityDisabled                                                         : 0.6,
        /*Disabled*/
        /*Arrow*/
        ArrowSize                                                               : 15,
        ArrowLineHeight                                                         : 1.8,
        /*Arrow*/
        /*Icon*/
        IconPosition                                                            : "Left",
        IconSize                                                                : 13,
        IconLineHeight                                                          : 2.2,
        IconMarginLeft                                                          : 5,
        IconMarginRight                                                         : 5,
        /*Icon*/
        /*Size*/
        SelectMaxWidth                                                          : 1200,
        SelectHeight                                                            : 30,
        /*Size*/
        /*Border*/
        SelectBorderSizeTop                                                     : 1,
        SelectBorderSizeBottom                                                  : 1,
        SelectBorderSizeLeft                                                    : 1,
        SelectBorderSizeRight                                                   : 1,
        SelectBorderStyle                                                       : "solid",
        SelectBorderTopLeftRadiusOuter                                          : 5,
        SelectBorderTopRightRadiusOuter                                         : 5,
        SelectBorderBottomLeftRadiusOuter                                       : 5,
        SelectBorderBottomRightRadiusOuter                                      : 5,
        SelectBorderTopLeftRadiusInner                                          : 4,
        SelectBorderTopRightRadiusInner                                         : 4,
        SelectBorderBottomLeftRadiusInner                                       : 4,
        SelectBorderBottomRightRadiusInner                                      : 4,    
        /*Border*/
        /*Padding*/
        PaddingLeft                                                             : 10,
        PaddingRight                                                            : 10,
        /*Padding*/
        /*Align*/
        Align                                                                   : "Left",
        /*Align*/
        /*Font*/
        SelectFontFamily                                                        : "sans-serif",
        SelectFontSize                                                          : 11,
        SelectFontWeight                                                        : "bold",
        SelectFontStyle                                                         : "normal",
        SelectLineHeight                                                        : 2.6,
        /*Font*/
        /*Shadow*/
        SelectShadowOuterXNormal                                                : 0,
        SelectShadowOuterYNormal                                                : 0,
        SelectShadowOuterBlurNormal                                             : 3,
        SelectShadowOuterSpreadNormal                                           : 0,
        SelectShadowOuterColorNormal                                            : "#000000",
        SelectShadowOuterAlphaNormal                                            : 0.4,
        SelectShadowOuterXHover                                                 : 0,
        SelectShadowOuterYHover                                                 : 0,
        SelectShadowOuterBlurHover                                              : 0,
        SelectShadowOuterSpreadHover                                            : 0,
        SelectShadowOuterColorHover                                             : "#000000",
        SelectShadowOuterAlphaHover                                             : 0,
        SelectShadowOuterXClick                                                 : 0,
        SelectShadowOuterYClick                                                 : 0,
        SelectShadowOuterBlurClick                                              : 0,
        SelectShadowOuterSpreadClick                                            : 0,
        SelectShadowOuterColorClick                                             : "#000000",
        SelectShadowOuterAlphaClick                                             : 0,
        /*Shadow*/
        /*Normal*/
        SelectBackgroundColorNormal                                             : "FDFDFD",
        SelectColorNormal                                                       : "#8E8E8E",
        SelectBorderTopColorNormal                                              : "#A6A6A6",
        SelectBorderBottomColorNormal                                           : "#A6A6A6",
        SelectBorderLeftColorNormal                                             : "#A6A6A6",
        SelectBorderRightColorNormal                                            : "#A6A6A6",
        SelectGradientStartColorNormal                                          : "#FDFDFD",
        SelectGradientEndColorNormal                                            : "#E3E3E3",
        SelectShadowInnerXNormal                                                : 0,
        SelectShadowInnerYNormal                                                : 1,
        SelectShadowInnerBlurNormal                                             : 0,
        SelectShadowInnerSpreadNormal                                           : 0,
        SelectShadowInnerColorNormal                                            : "#FFFFFF",
        SelectShadowInnerAlphaNormal                                            : 1,
        /*Normal*/
        /*Hover*/
        SelectBackgroundColorHover                                              : "#E3E3E3",
        SelectColorHover                                                        : "#8E8E8E",
        SelectBorderTopColorHover                                               : "#A6A6A6",
        SelectBorderBottomColorHover                                            : "#A6A6A6",
        SelectBorderLeftColorHover                                              : "#A6A6A6",
        SelectBorderRightColorHover                                             : "#A6A6A6",
        SelectGradientStartColorHover                                           : "#E3E3E3",
        SelectGradientEndColorHover                                             : "#E3E3E3",
        SelectShadowInnerXHover                                                 : 0,
        SelectShadowInnerYHover                                                 : 1,
        SelectShadowInnerBlurHover                                              : 0,
        SelectShadowInnerSpreadHover                                            : 0,
        SelectShadowInnerColorHover                                             : "#FFFFFF",
        SelectShadowInnerAlphaHover                                             : 0.6,
        /*Hover*/
        /*Click*/
        SelectBackgroundColorClick                                              : "#E6E6E6",
        SelectColorClick                                                        : "#8E8E8E",
        SelectBorderTopColorClick                                               : "#A6A6A6",
        SelectBorderBottomColorClick                                            : "#A6A6A6",
        SelectBorderLeftColorClick                                              : "#A6A6A6",
        SelectBorderRightColorClick                                             : "#A6A6A6",
        SelectGradientStartColorClick                                           : "#CDCDCD",
        SelectGradientEndColorClick                                             : "#E3E3E3",
        SelectShadowInnerXClick                                                 : 0,
        SelectShadowInnerYClick                                                 : 1,
        SelectShadowInnerBlurClick                                              : 3,
        SelectShadowInnerSpreadClick                                            : 0,
        SelectShadowInnerColorClick                                             : "#000000",
        SelectShadowInnerAlphaClick                                             : 0.1,
        /*Click*/
        /*Size*/
        OptionMinHeight                                                         : 30,
        OptionAllHeight                                                         : 308,
        /*Size*/
        /*Border*/
        OptionBorderSize                                                        : 1,
        OptionBorderStyle                                                       : "solid",
        OptionBorderTopLeftRadius                                               : 5,
        OptionBorderTopRightRadius                                              : 5,
        OptionBorderBottomLeftRadius                                            : 5,
        OptionBorderBottomRightRadius                                           : 5,
        OptionBorderTopColor                                                    : "#A6A6A6",
        OptionBorderBottomColor                                                 : "#A6A6A6",
        OptionBorderLeftColor                                                   : "#A6A6A6",
        OptionBorderRightColor                                                  : "#A6A6A6",
        /*Border*/
        /*Font*/
        OptionFontFamily                                                        : "sans-serif",
        OptionFontSize                                                          : 11,
        OptionFontWeight                                                        : "bold",
        OptionFontStyle                                                         : "normal",
        OptionLineHeight                                                        : 2.6,
        /*Font*/
        /*Color*/
        OptionColorNormal                                                       : "#8E8E8E",
        OptionColorHover                                                        : "#8E8E8E",
        OptionColorClick                                                        : "#8E8E8E",
        OptionColorActive                                                       : "#8E8E8E",
        /*Color*/
        /*Background Color*/
        OptionBackgroundColorNormal                                             : "#FDFDFD",
        OptionBackgroundColorHover                                              : "#CCCCCC",
        OptionBackgroundColorClick                                              : "#CCCCCC",
        OptionBackgroundColorActive                                             : "#CCCCCC",
        /*Background Color*/
        /*Separator*/
        OptionSeparatorSize                                                     : 1,
        OptionSeparatorStyle                                                    : "solid",
        OptionSeparatorColor                                                    : "#A6A6A6",
        OptionSeparatorColorHover                                               : "#A6A6A6",
        /*Separator*/
        /*Scroll*/
        OptionScrollBorderSize                                                  : 1,
        OptionScrollBorderStyle                                                 : "solid",
        OptionScrollColor                                                       : "#8E8E8E",
        OptionScrollBorderColor                                                 : "#FFFFFF",
        /*Scroll*/
        BeforeOpen                                                              : function() {},
        AfterOpen                                                               : function() {},
        BeforeClose                                                             : function() {},
        AfterClose                                                              : function() {},
        OnChange                                                                : function(CurrentValue) {},
        OnClick                                                                 : function(CurrentValue) {}
    };
    $.fn.ArtDesignSelect                                                        = function(Options) {
        var ArtDesignSelect                                                     = (new $.ns.ArtDesignSelect(this, Options));
        return ArtDesignSelect.PublicMethods;
    };
})(jQuery, window);