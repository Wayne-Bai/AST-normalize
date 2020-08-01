/*
!!!!!!!!!!!DO NOT DELETE!!!!!!!!!!!

ArtDesignUI (v.1.0.0)
www.artdesign-ui.com

ArtDesignTextArea (v.1.0.0) - part of ArtDesignUI
487 Lines
www.artdesign-ui.com/ArtDesignTextArea

License: ArtDesignCreative

Author:
ArtDesign Creative Studio
www.artdesign-creative.com
office@artdesign-creative.com

More jQuery PlugIns:
www.artdesign-jquery.com

!!!!!!!!!!!DO NOT DELETE!!!!!!!!!!!
*/
;(function($) {
    if (!$.ns) {
        $.ns                                                                    = {};
    }
    $.ns.ArtDesignTextArea                                                      = function(Element, Options) {
        var PlugIn                                                              = this;
        PlugIn.$Element                                                         = $(Element);
        var ElementCounter                                                      = 0,
        NativeTextArea                                                          = [],
        TextArea                                                                = [],
        HEX, HEXConvertResult, HEXR, HEXG, HEXB,
        ResultNormal                                                            = [],
        RNormal                                                                 = [],
        GNormal                                                                 = [],
        BNormal                                                                 = [],
        ResultHover                                                             = [],
        RHover                                                                  = [],
        GHover                                                                  = [],
        BHover                                                                  = [],
        ResultClick                                                             = [],
        RClick                                                                  = [],
        GClick                                                                  = [],
        BClick                                                                  = [],
        NativeOptions                                                           = [],
        NativeOptionsSplit                                                      = [],
        ElementsOptions                                                         = [],
        ResizeTimer;
        PlugIn.Methods                                                          = {
            Initialize                                                          : function() {
                PlugIn.$Element.find("[data-plugin-ad-text-area='ad-text-area']").each(function() {
                    if(!$(this).attr("data-ad-text-area-initialize")) {
                        NativeTextArea[ElementCounter]                          = $(this);
                        NativeTextArea[ElementCounter].attr("data-ad-text-area-initialize", "initialize");
                        TextArea[ElementCounter]                                = NativeTextArea[ElementCounter].parent();
                        ElementsOptions[ElementCounter]                         = $.extend({}, $.ns.ArtDesignTextArea.DefaultOptions, Options);
                        if(NativeTextArea[ElementCounter].attr("data-ad-text-area-options")) {
                            NativeOptions[ElementCounter]                       = NativeTextArea[ElementCounter].attr("data-ad-text-area-options").replace(/ /g, "");
                            NativeOptionsSplit[ElementCounter]                  = NativeOptions[ElementCounter].split(',');
                            for (var a = 0; a < NativeOptionsSplit[ElementCounter].length; a++) {
                                if($.TextAreas !== undefined && $.TextAreas[NativeOptionsSplit[ElementCounter][a]]) {
                                    ElementsOptions[ElementCounter] = $.extend({}, ElementsOptions[ElementCounter], $.TextAreas[NativeOptionsSplit[ElementCounter][a]]);
                                }
                            }
                        }
                        PlugIn.Methods.PrepareElement(ElementCounter);
                        PlugIn.Methods.CSS(ElementCounter);
                        PlugIn.Methods.ListenHover(ElementCounter);
                        PlugIn.Methods.ListenClick(ElementCounter);
                        PlugIn.Methods.WindowResize(ElementCounter);
                        PlugIn.Methods.ListenAttrChange(ElementCounter);
                        ElementCounter++;
                    }
                });
                $(window).trigger("resize");
            },
            PrepareElement                                                      : function(ElementCounter) {
                NativeTextArea[ElementCounter].wrap('<div></div>');
                TextArea[ElementCounter]                                        = NativeTextArea[ElementCounter].parent();
            },
            CSS                                                                 : function(ElementCounter) {
                NativeTextArea[ElementCounter].css({
                    "display"                                                   : "inline-block",
                    "verticalAlign"                                             : "top",
                    "maxWidth"                                                  : (NativeTextArea[ElementCounter].attr("data-ad-text-area-width") === undefined ? ElementsOptions[ElementCounter].Width : parseInt(NativeTextArea[ElementCounter].attr("data-ad-text-area-width"))) - (ElementsOptions[ElementCounter].PaddingLeft + ElementsOptions[ElementCounter].PaddingRight) + "px",
                    "width"                                                     : "100%",
                    "height"                                                    : ElementsOptions[ElementCounter].Height - (ElementsOptions[ElementCounter].MarginTop + ElementsOptions[ElementCounter].MarginBottom) + "px",
                    "background"                                                : "transparent",
                    "resize"                                                    : "none",
                    "marginTop"                                                 : ElementsOptions[ElementCounter].MarginTop + "px",
                    "marginBottom"                                              : ElementsOptions[ElementCounter].MarginBottom + "px",
                    "paddingLeft"                                               : ElementsOptions[ElementCounter].PaddingLeft + "px",
                    "paddingRight"                                              : ElementsOptions[ElementCounter].PaddingRight + "px",
                    "paddingTop"                                                : 0,
                    "paddingBottom"                                             : 0,
                    "border"                                                    : "none",
                    "outline"                                                   : "none",
                    "overflow"                                                  : "hidden",
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadius + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadius + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadius + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadius + "px",
                    "color"                                                     : ElementsOptions[ElementCounter].ColorNormal,
                    "fontFamily"                                                : ElementsOptions[ElementCounter].FontFamily,
                    "fontSize"                                                  : ElementsOptions[ElementCounter].FontSize,
                    "fontWeight"                                                : ElementsOptions[ElementCounter].FontWeight,
                    "fontStyle"                                                 : ElementsOptions[ElementCounter].FontStyle
                });
                ResultNormal[ElementCounter]                                    = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowColorNormal);
                RNormal[ElementCounter]                                         = ResultNormal[ElementCounter][0];
                GNormal[ElementCounter]                                         = ResultNormal[ElementCounter][1];
                BNormal[ElementCounter]                                         = ResultNormal[ElementCounter][2];
                ResultHover[ElementCounter]                                     = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowColorHover);
                RHover[ElementCounter]                                          = ResultHover[ElementCounter][0];
                GHover[ElementCounter]                                          = ResultHover[ElementCounter][1];
                BHover[ElementCounter]                                          = ResultHover[ElementCounter][2];
                ResultClick[ElementCounter]                                     = PlugIn.Methods.ConvertHex(ElementsOptions[ElementCounter].ShadowColorClick);
                RClick[ElementCounter]                                          = ResultClick[ElementCounter][0];
                GClick[ElementCounter]                                          = ResultClick[ElementCounter][1];
                BClick[ElementCounter]                                          = ResultClick[ElementCounter][2];
                TextArea[ElementCounter].css({
                    "maxWidth"                                                  : NativeTextArea[ElementCounter].attr("data-ad-text-area-width") === undefined ? ElementsOptions[ElementCounter].Width : NativeTextArea[ElementCounter].attr("data-ad-text-area-width") + "px",
                    "minHeight"                                                 : ElementsOptions[ElementCounter].Height + "px",
                    "background"                                                : ElementsOptions[ElementCounter].BackgroundColorNormal,
                    "borderTopStyle"                                            : ElementsOptions[ElementCounter].BorderTopStyleNormal,
                    "borderTopWidth"                                            : ElementsOptions[ElementCounter].BorderSizeTop + "px",
                    "borderTopColor"                                            : ElementsOptions[ElementCounter].BorderTopColorNormal,
                    "borderBottomStyle"                                         : ElementsOptions[ElementCounter].BorderBottomStyleNormal,
                    "borderBottomWidth"                                         : ElementsOptions[ElementCounter].BorderSizeBottom + "px",
                    "borderBottomColor"                                         : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                    "borderLeftStyle"                                           : ElementsOptions[ElementCounter].BorderLeftStyleNormal,
                    "borderLeftWidth"                                           : ElementsOptions[ElementCounter].BorderSizeLeft + "px",
                    "borderLeftColor"                                           : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                    "borderRightStyle"                                          : ElementsOptions[ElementCounter].BorderRightStyleNormal,
                    "borderRightWidth"                                          : ElementsOptions[ElementCounter].BorderSizeRight + "px",
                    "borderRightColor"                                          : ElementsOptions[ElementCounter].BorderRightColorNormal,
                    "borderTopLeftRadius"                                       : ElementsOptions[ElementCounter].BorderTopLeftRadius + "px",
                    "borderTopRightRadius"                                      : ElementsOptions[ElementCounter].BorderTopRightRadius + "px",
                    "borderBottomLeftRadius"                                    : ElementsOptions[ElementCounter].BorderBottomLeftRadius + "px",
                    "borderBottomRightRadius"                                   : ElementsOptions[ElementCounter].BorderBottomRightRadius + "px",
                    "boxShadow"                                                 : ElementsOptions[ElementCounter].ShadowInset + " " + ElementsOptions[ElementCounter].ShadowXNormal + "px " + ElementsOptions[ElementCounter].ShadowYNormal + "px " + ElementsOptions[ElementCounter].ShadowBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowSpreadNormal + "px rgba(" + RNormal[ElementCounter] + ", " + GNormal[ElementCounter] + ", " + BNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowAlphaNormal + ")"
                });
                if(NativeTextArea[ElementCounter].attr("data-ad-text-area-watermark")) {
                    NativeTextArea[ElementCounter].watermark(NativeTextArea[ElementCounter].attr("data-ad-text-area-watermark"));
                    TextArea[ElementCounter].find(".watermark").css({
                        "color"                                                 : ElementsOptions[ElementCounter].ColorNormal,
                        "fontFamily"                                            : ElementsOptions[ElementCounter].FontFamily,
                        "fontWeight"                                            : ElementsOptions[ElementCounter].FontWeight,
                        "fontStyle"                                             : ElementsOptions[ElementCounter].FontStyle
                    });
                }
                else if(NativeTextArea[ElementCounter].attr("data-ad-text-area-mask")) {
                    NativeTextArea[ElementCounter].mask(NativeTextArea[ElementCounter].attr("data-ad-text-area-mask"));
                }
                NativeTextArea[ElementCounter].autosize();
                if (NativeTextArea[ElementCounter].attr("disabled")) {
                    TextArea[ElementCounter].find(".watermark").stop(true).css({
                        "opacity"                                               : ElementsOptions[ElementCounter].OpacityDisabled
                    });
                    NativeTextArea[ElementCounter].stop(true).css({
                        "opacity"                                               : ElementsOptions[ElementCounter].OpacityDisabled,
                        "cursor"                                                : ElementsOptions[ElementCounter].CursorDisabled
                    });
                    TextArea[ElementCounter].stop(true).css({
                        "opacity"                                               : ElementsOptions[ElementCounter].OpacityDisabled
                    });
                }
            },
            ListenHover                                                         : function(ElementCounter) {
                TextArea[ElementCounter].stop().hover(function() {
                    if (!NativeTextArea[ElementCounter].is(":focus") && !NativeTextArea[ElementCounter].attr("disabled") && $.PreventTextArea !== true) {
                        TextArea[ElementCounter].find(".watermark").stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorHover
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                        NativeTextArea[ElementCounter].stop(true).animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorHover
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                        TextArea[ElementCounter].stop(true).animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].BackgroundColorHover,
                            "borderTopStyle"                                    : ElementsOptions[ElementCounter].BorderTopStyleHover,
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorHover,
                            "borderBottomStyle"                                 : ElementsOptions[ElementCounter].BorderBottomStyleHover,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorHover,
                            "borderLeftStyle"                                   : ElementsOptions[ElementCounter].BorderLeftStyleHover,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorHover,
                            "borderRightStyle"                                  : ElementsOptions[ElementCounter].BorderRightStyleHover,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorHover,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowXHover + "px " + ElementsOptions[ElementCounter].ShadowYHover + "px " + ElementsOptions[ElementCounter].ShadowBlurHover + "px " + ElementsOptions[ElementCounter].ShadowSpreadHover + "px rgba(" + RHover[ElementCounter] + ", " + GHover[ElementCounter] + ", " + BHover[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowAlphaHover + ")"
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                    }
                }, function() {
                    if (!NativeTextArea[ElementCounter].is(":focus") && !NativeTextArea[ElementCounter].attr("disabled") && $.PreventTextArea !== true) {
                        TextArea[ElementCounter].find(".watermark").animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorNormal
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });

                        NativeTextArea[ElementCounter].animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorNormal
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                        TextArea[ElementCounter].animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].BackgroundColorNormal,
                            "borderTopStyle"                                    : ElementsOptions[ElementCounter].BorderTopStyleNormal,
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorNormal,
                            "borderBottomStyle"                                 : ElementsOptions[ElementCounter].BorderBottomStyleNormal,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                            "borderLeftStyle"                                   : ElementsOptions[ElementCounter].BorderLeftStyleNormal,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                            "borderRightStyle"                                  : ElementsOptions[ElementCounter].BorderRightStyleNormal,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorNormal,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowXNormal + "px " + ElementsOptions[ElementCounter].ShadowYNormal + "px " + ElementsOptions[ElementCounter].ShadowBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowSpreadNormal + "px rgba(" + RNormal[ElementCounter] + ", " + GNormal[ElementCounter] + ", " + BNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowAlphaNormal + ")"
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                    }
                });
            },
            ListenClick                                                         : function(ElementCounter) {
                NativeTextArea[ElementCounter].focus(function() {
                    if (!NativeTextArea[ElementCounter].attr("disabled") && $.PreventTextArea !== true) {
                        TextArea[ElementCounter].find(".watermark").animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorClick
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                        NativeTextArea[ElementCounter].animate({
                            color                                               : ElementsOptions[ElementCounter].ColorClick
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                        TextArea[ElementCounter].animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].BackgroundColorClick,
                            "borderTopStyle"                                    : ElementsOptions[ElementCounter].BorderTopStyleClick,
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorClick,
                            "borderBottomStyle"                                 : ElementsOptions[ElementCounter].BorderBottomStyleClick,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorClick,
                            "borderLeftStyle"                                   : ElementsOptions[ElementCounter].BorderLeftStyleClick,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorClick,
                            "borderRightStyle"                                  : ElementsOptions[ElementCounter].BorderRightStyleClick,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorClick,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowXClick + "px " + ElementsOptions[ElementCounter].ShadowYClick + "px " + ElementsOptions[ElementCounter].ShadowBlurClick + "px " + ElementsOptions[ElementCounter].ShadowSpreadClick + "px rgba(" + RClick[ElementCounter] + ", " + GClick[ElementCounter] + ", " + BClick[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowAlphaClick + ")"
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                    }
                }).focusout(function() {
                    if (!NativeTextArea[ElementCounter].attr("disabled") && $.PreventTextArea !== true) {
                        TextArea[ElementCounter].find(".watermark").animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorNormal
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                        NativeTextArea[ElementCounter].animate({
                            "color"                                             : ElementsOptions[ElementCounter].ColorNormal
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                        TextArea[ElementCounter].animate({
                            "backgroundColor"                                   : ElementsOptions[ElementCounter].BackgroundColorNormal,
                            "borderTopStyle"                                    : ElementsOptions[ElementCounter].BorderTopStyleNormal,
                            "borderTopColor"                                    : ElementsOptions[ElementCounter].BorderTopColorNormal,
                            "borderBottomStyle"                                 : ElementsOptions[ElementCounter].BorderBottomStyleNormal,
                            "borderBottomColor"                                 : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                            "borderLeftStyle"                                   : ElementsOptions[ElementCounter].BorderLeftStyleNormal,
                            "borderLeftColor"                                   : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                            "borderRightStyle"                                  : ElementsOptions[ElementCounter].BorderRightStyleNormal,
                            "borderRightColor"                                  : ElementsOptions[ElementCounter].BorderRightColorNormal,
                            "boxShadow"                                         : ElementsOptions[ElementCounter].ShadowXNormal + "px " + ElementsOptions[ElementCounter].ShadowYNormal + "px " + ElementsOptions[ElementCounter].ShadowBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowSpreadNormal + "px rgba(" + RNormal[ElementCounter] + ", " + GNormal[ElementCounter] + ", " + BNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowAlphaNormal + ")"
                        }, {
                            duration                                            : ElementsOptions[ElementCounter].AnimationSpeed,
                            queue                                               : false
                        });
                    }
                });
            },
            WindowResize: function(ElementCounter) {
                $(window).on("resize", function() {
                    NativeTextArea[ElementCounter].css({
                        "maxWidth"                                              : TextArea[ElementCounter].width() - (ElementsOptions[ElementCounter].PaddingLeft + ElementsOptions[ElementCounter].PaddingRight) + "px"
                    });
                    function AfterResizing(){
                        NativeTextArea[ElementCounter].css({
                            "maxWidth"                                          : TextArea[ElementCounter].width() - (ElementsOptions[ElementCounter].PaddingLeft + ElementsOptions[ElementCounter].PaddingRight) + "px"
                        });
                    }
                    clearTimeout(ResizeTimer);
                    ResizeTimer                                                 = setTimeout(AfterResizing(), 100);
                });
            },
            ListenAttrChange                                                    : function (ElementCounter) {
                NativeTextArea[ElementCounter].attrchange({
                    trackValues                                                 : true,
                    callback                                                    : function (event) {
                        if (event.attributeName === "disabled" && event.newValue === undefined) {
                            $.PreventTextArea                                   = true;
                            TextArea[ElementCounter].find(".watermark").stop(true).animate({
                                "opacity"                                       : 1,
                                "color"                                         : ElementsOptions[ElementCounter].ColorNormal
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            NativeTextArea[ElementCounter].stop(true).animate({
                                "opacity"                                       : 1,
                                "color"                                         : ElementsOptions[ElementCounter].ColorNormal
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            TextArea[ElementCounter].stop(true).animate({
                                "opacity"                                       : 1,
                                "backgroundColor"                               : ElementsOptions[ElementCounter].BackgroundColorNormal,
                                "borderTopStyle"                                : ElementsOptions[ElementCounter].BorderTopStyleNormal,
                                "borderTopColor"                                : ElementsOptions[ElementCounter].BorderTopColorNormal,
                                "borderBottomStyle"                             : ElementsOptions[ElementCounter].BorderBottomStyleNormal,
                                "borderBottomColor"                             : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                                "borderLeftStyle"                               : ElementsOptions[ElementCounter].BorderLeftStyleNormal,
                                "borderLeftColor"                               : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                                "borderRightStyle"                              : ElementsOptions[ElementCounter].BorderRightStyleNormal,
                                "borderRightColor"                              : ElementsOptions[ElementCounter].BorderRightColorNormal,
                                "boxShadow"                                     : ElementsOptions[ElementCounter].ShadowXNormal + "px " + ElementsOptions[ElementCounter].ShadowYNormal + "px " + ElementsOptions[ElementCounter].ShadowBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowSpreadNormal + "px rgba(" + RNormal[ElementCounter] + ", " + GNormal[ElementCounter] + ", " + BNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowAlphaNormal + ")"
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            NativeTextArea[ElementCounter].stop(true).css({
                                "cursor"                                        : ""
                            });
                            setTimeout(function() {
                                $.PreventTextArea                               = false;
                            }, ElementsOptions[ElementCounter].AnimationSpeed + 100);
                        }
                        else if (event.attributeName === "disabled" && event.newValue === "disabled") {
                            $.PreventTextArea                                   = true;
                            TextArea[ElementCounter].find(".watermark").stop(true).animate({
                                "opacity"                                       : ElementsOptions[ElementCounter].OpacityDisabled,
                                "color"                                         : ElementsOptions[ElementCounter].ColorNormal
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            NativeTextArea[ElementCounter].stop(true).animate({
                                "opacity"                                       : ElementsOptions[ElementCounter].OpacityDisabled,
                                "color"                                         : ElementsOptions[ElementCounter].ColorNormal
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            TextArea[ElementCounter].stop(true).animate({
                                "opacity"                                       : ElementsOptions[ElementCounter].OpacityDisabled,
                                "backgroundColor"                               : ElementsOptions[ElementCounter].BackgroundColorNormal,
                                "borderTopStyle"                                : ElementsOptions[ElementCounter].BorderTopStyleNormal,
                                "borderTopColor"                                : ElementsOptions[ElementCounter].BorderTopColorNormal,
                                "borderBottomStyle"                             : ElementsOptions[ElementCounter].BorderBottomStyleNormal,
                                "borderBottomColor"                             : ElementsOptions[ElementCounter].BorderBottomColorNormal,
                                "borderLeftStyle"                               : ElementsOptions[ElementCounter].BorderLeftStyleNormal,
                                "borderLeftColor"                               : ElementsOptions[ElementCounter].BorderLeftColorNormal,
                                "borderRightStyle"                              : ElementsOptions[ElementCounter].BorderRightStyleNormal,
                                "borderRightColor"                              : ElementsOptions[ElementCounter].BorderRightColorNormal,
                                "boxShadow"                                     : ElementsOptions[ElementCounter].ShadowXNormal + "px " + ElementsOptions[ElementCounter].ShadowYNormal + "px " + ElementsOptions[ElementCounter].ShadowBlurNormal + "px " + ElementsOptions[ElementCounter].ShadowSpreadNormal + "px rgba(" + RNormal[ElementCounter] + ", " + GNormal[ElementCounter] + ", " + BNormal[ElementCounter] + ", " + ElementsOptions[ElementCounter].ShadowAlphaNormal + ")"
                            }, ElementsOptions[ElementCounter].AnimationSpeed);
                            NativeTextArea[ElementCounter].stop(true).css({
                                "cursor"                                        : ElementsOptions[ElementCounter].CursorDisabled
                            });
                            setTimeout(function() {
                                $.PreventTextArea                               = false;
                            }, ElementsOptions[ElementCounter].AnimationSpeed + 100);
                        }
                    }
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
            }
        };
        PlugIn.Methods.Initialize();
    };
    $.ns.ArtDesignTextArea.DefaultOptions                                       = {
        /*Base*/
        ClassPrefix                                                             : "TA_",
        Width                                                                   : 1200,
        Height                                                                  : 150,
        MarginTop                                                               : 10,
        MarginBottom                                                            : 0,
        PaddingLeft                                                             : 10,
        PaddingRight                                                            : 10,
        AnimationSpeed                                                          : 200,
        /*Base*/
        /*Disabled*/
        CursorDisabled                                                          : "not-allowed",
        OpacityDisabled                                                         : 0.6,
        /*Disabled*/
        /*Padding*/

        /*Padding*/
        /*Font*/
        FontFamily                                                              : "sans-serif",
        FontSize                                                                : 12,
        FontWeight                                                              : "bold",
        FontStyle                                                               : "normal",
        /*Font*/
        /*Shadow Inset*/
        ShadowInset                                                             : "inset",
        /*Shadow Inset*/
        /*Border*/
        BorderSizeTop                                                           : 1,
        BorderSizeBottom                                                        : 1,
        BorderSizeLeft                                                          : 1,
        BorderSizeRight                                                         : 1,
        /*Border*/
        /*Normal*/
        BackgroundColorNormal                                                   : "transparent",
        ColorNormal                                                             : "#8E8E8E",
        BorderTopStyleNormal                                                    : "solid",
        BorderTopColorNormal                                                    : "#A6A6A6",
        BorderBottomStyleNormal                                                 : "solid",
        BorderBottomColorNormal                                                 : "#A6A6A6",
        BorderLeftStyleNormal                                                   : "solid",
        BorderLeftColorNormal                                                   : "#A6A6A6",
        BorderRightStyleNormal                                                  : "solid",
        BorderRightColorNormal                                                  : "#A6A6A6",
        ShadowXNormal                                                           : 0,
        ShadowYNormal                                                           : 0,
        ShadowBlurNormal                                                        : 1,
        ShadowSpreadNormal                                                      : 1,
        ShadowColorNormal                                                       : "#8E8E8E",
        ShadowAlphaNormal                                                       : 0.4,
        /*Normal*/
        /*Hover*/
        BackgroundColorHover                                                    : "transparent",
        ColorHover                                                              : "#8E8E8E",
        BorderTopStyleHover                                                     : "solid",
        BorderTopColorHover                                                     : "#A6A6A6",
        BorderBottomStyleHover                                                  : "solid",
        BorderBottomColorHover                                                  : "#A6A6A6",
        BorderLeftStyleHover                                                    : "solid",
        BorderLeftColorHover                                                    : "#A6A6A6",
        BorderRightStyleHover                                                   : "solid",
        BorderRightColorHover                                                   : "#A6A6A6",
        ShadowXHover                                                            : 0,
        ShadowYHover                                                            : 0,
        ShadowBlurHover                                                         : 3,
        ShadowSpreadHover                                                       : 1,
        ShadowColorHover                                                        : "#8E8E8E",
        ShadowAlphaHover                                                        : 0.6,
        /*Hover*/
        /*Click*/
        BackgroundColorClick                                                    : "#FFFFFF",
        ColorClick                                                              : "#8E8E8E",
        BorderTopStyleClick                                                     : "solid",
        BorderTopColorClick                                                     : "#A6A6A6",
        BorderBottomStyleClick                                                  : "solid",
        BorderBottomColorClick                                                  : "#A6A6A6",
        BorderLeftStyleClick                                                    : "solid",
        BorderLeftColorClick                                                    : "#A6A6A6",
        BorderRightStyleClick                                                   : "solid",
        BorderRightColorClick                                                   : "#A6A6A6",
        BorderTopLeftRadius                                                     : 5,
        BorderTopRightRadius                                                    : 5,
        BorderBottomLeftRadius                                                  : 5,
        BorderBottomRightRadius                                                 : 5,
        ShadowXClick                                                            : 0,
        ShadowYClick                                                            : 0,
        ShadowBlurClick                                                         : 3,
        ShadowSpreadClick                                                       : 1,
        ShadowColorClick                                                        : "#8E8E8E",
        ShadowAlphaClick                                                        : 0.6
    };
    $.fn.ArtDesignTextArea                                                      = function(Options) {
        var ArtDesignTextArea                                                   = (new $.ns.ArtDesignTextArea(this, Options));
        return ArtDesignTextArea.PublicMethods;
    };
})(jQuery);