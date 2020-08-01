(function(w, a, u) {
    if($('#debug_asr').length > 0)
        return;
    if(!window.console) {
        if(!window.console) {
                    var names = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
                    window.console = {};
                    for(var i = 0; i < names.length; ++i) {
                        window.console[names[i]] = function() {
                        };
                    }
       }
    }
    //@off
	if(!a){
		console.log('asr is not exists in current page!');
	}else{
	    window.loadCss("http://cns-000:8111/blitz/testCase/asr/_css/asr_test.css");
	    if(window.asr_doc){
		    $.getScript("http://cns-000:8111/blitz/Lib/docjs.js");
		    $.getScript("http://cns-000:8111/blitz/Lib/prettify.js");
	    }
        var list_act="<li class='{$T.type$key} {$T.modes$key}'><span>{$T.act}</span></li>";
        	commbox="<div><p></p></div><ul>{#foreach $T as type}{#foreach $T.type as modes}{#foreach $T.modes as act}"+list_act+"{#/for}{#/for}{#/for}</ul>",
            list="<div><p></p></div><ul>{#foreach $T as record}<li><span>{$T.record}</span></li>{#/for}</ul>",
            asr_act_type=$("<div id='asr_act_type'></div>"),
            asr_act=$("<div id='asr_act_id'></div>"),
            asr_act_mode=$("<div id='asr_act_mode'></div>"),
            asr_act_cont=$("<div class='asr_act_cont'></div>"),
        	sub_t ="<li class='{$T.record.name}'>"+
        			"<a href='{$T.record.href}' style='{$T.record.style}' target='{$T.record.target}'>{$T.record.name} {$T.record.content}</a>"+
        			"</li>";
        asr_act_type.setTemplate(list);
        asr_act_mode.setTemplate(list);
        asr_act.setTemplate(commbox);
        $('body').append("<div id='asr_debug'></div>");
        $('#asr_debug').setTemplate( "<ul>{#foreach $T as record}{#if !$T.record.pop}"+sub_t+"{#/if}{#/for}</ul>"+
        "<fieldset id='asr_popup_con'><legend>ASR Popup</legend><ul class='asr_popup_list'>{#foreach $T as record}{#if $T.record.pop}" +sub_t+ "{#/if}{#/for}</ul></fieldset>"+
        "<fieldset><legend>ASR Activity</legend><div id='asr_check'><input id='change_activity' type='button' value='GO!'/></div></fieldset>"+
        "<fieldset><legend>ASR Console</legend><ul class='asr_console_msg'></ul></fieldset>");
		//@on

        var _v = (function() {
            var v;
            try {
                v = GetTalkpalAX().GetVersion();
            }
            catch (e) {
                v = "0.0";
            }
            return v;
        }
        )(), asrServer = window["asrServerAddress"], asr_activity = {
            'rps' : {
                gra : [3499, 3505, 3514, 3756, 4610, 5346, 4194, 6765, 6773, 7887, 2391, 2123],
                ngra : [3399, 9682, 3712, 3721, 9725, 3558, 9665, 4661, 9689]
            },
            'rpm' : {
                gra : [3528, 3537, 3539, 3523, 3674, 3557, 3559, 3585, 3586, 3587, 4600, 7138, 4258, 4242],
                ngra : [6618, 4854, 2513, 2558, 4005, 4036, 3972, 5489, 4481, 6324, 6833, 6119]
            },
            'spc' : {
                gra : [],
                ngra : [3403, 3507, 3520, 3703, 3705, 3728, 3730, 4348, 4464, 4547, 4612, 3665, 3707]
            },
            'fc_cp' : {
                gra : [3350, 3522, 3599, 3476, 4350, 4583, 7148, 6402, 6483, 6549],
                ngra : [4335, 3491, 3498, 9683, 3732, 4378, 4549, 9696, 7176, 4181, 4212, 8969, 8852]
            },
            'fc_exc' : {
                gra : [3578, 9726, 3600, 3502, 4069, 4392, 4521, 4530, 4595, 4615],
                ngra : []
            },
            'fc_mix' : {
                gra : [3351, 3352, 3576, 3579, 2521, 2029, 3137, 2088, 3056, 3109],
                ngra : []
            },
            'fx_ms' : {
                gra : [9698, 3549, 4523, 7170, 7173, 6510, 7703, 7804, 8403, 7899, 8108],
                ngra : [4539, 4443, 3794, 3816, 55479, 4659, 6634, 6752, 6323, 8698]
            },
            'lc' : {
                gra : [3354, 3503, 3504, 3508, 5236, 3582, 3710, 9797, 9707, 3484, 7156, 7158],
                ngra : [3361, 3406, 6881, 19]
            },
            'vrp' : {
                gra : [30095, 30096, 31059, 31092, 31125, 31126, 34305, 34306, 34308, 34309, 34304, 34307, 34310, 31092],
                ngra : []
            }
        }, _buildNewObj = function(data) {
            var _r = {};
            for(var i in data) {
                _r[i] = data[i];
            }
            return _r;
        }, _p = ET.NA.ASR.popup, _template_id = template_id, _util = _buildNewObj(a.utility), reload = function() {
            if($("#act-card_close").length > 0) {
                $("#act-card_close").click();
            }
            ET.School.UI.Common.Popup.close();
            tryStartActivity();
        }, true_fun = function() {
            return true;
        }, false_fun = function() {
            return false;
        }, data = [{
            name : 'asr_info',
            useDefault : true, //use default event
            href : '/school/_debug/ASR/Utility.aspx',
            handler : function() {
            },
            target : '_blank'
        }, {
            name : 'asr_doc',
            useDefault : true, //use default event
            href : 'http://cns-000:8111/blitz/testCase/asr/asr_doc.html#getErrorCode',
            handler : function() {
            },
            target : '_blank'
        }, {
            name : 'reset',
            href : '',
            handler : function() {
                a.isAsrEnabled = function() {
                    return a.utility.isAsrEnabled();
                }
                $(".asr_console_msg").html("");
                a.utility = _util;
                reload();
            }
        }, {
            name : 'revover_popup',
            href : '',
            pop : true,
            content : " (click to remove popup you tested)",
            style : 'font-weight:bold;color:red;',
            handler : function() {
                ET.School.UI.Common.Popup.close();
                $("#micsettings").removeClass("micsettings_show").addClass("micsettings_hide");
                $(".micsettings_mask").attr("style", "");
            }
        }, {
            name : 'enable_asr',
            href : '',
            handler : function() {
                var _text = $(this).text();
                console.log(_text);
                if(_text === 'disable_asr') {
                    $(this).text('enable_asr');
                    a.utility.isAsrEnabled = false_fun;
                }
                else {
                    $(this).text('disable_asr');
                    a.utility.isAsrEnabled = true_fun;
                }
                reload();
            }
        }, {
            name : "set_to_server",
            handler : function() {
                a.utility.isServerAsr = true_fun;
                a.utility.isNewAsr = false_fun;
                a.utility.isOldAsr = false_fun;
                reload();
            }
        }, {
            name : "set_to_old_local",
            handler : function() {
                if(_v > '4.4' && /Win/ig.test(navigator.platform)) {
                    if(confirm("Your asr version is grater than 4.3!Click OK to download!")) {
                        window.location.href = 'http://www.englishtown.com/_imgs/ASR/setups/EF_Advanced_Speech_Recognition_V4.exe';
                    }
                    return;
                }
                a.utility.isServerAsr = false_fun;
                a.utility.isNewAsr = false_fun;
                a.utility.isOldAsr = true_fun;
                reload();
            }
        }, {
            name : "set_to_new_local",
            handler : function() {
                if(_v < '4.6' && /Win/ig.test(navigator.platform)) {
                    if(confirm("Your asr version is less than 4.6!Click OK to download!")) {
                        window.location.href = 'http://www.englishtown.com/_imgs/ASR/setups/EF_Advanced_Speech_Recognition_V4.6.exe';
                    }
                    return;
                }
                a.utility.isServerAsr = false_fun;
                a.utility.isNewAsr = true_fun;
                a.utility.isOldAsr = false_fun;
                reload();
            }
        }, {
            name : "show_speakingChallenge_install_pop",
            pop : true,
            handler : function() {
                a.utility.isAsrInstalled = false_fun;
                template_id = 27;
                _p.install();
                a.utility = _util;
                template_id = _template_id;
            }
        }, {
            name : "show_normal_install_pop",
            pop : true,
            handler : function() {
                a.utility.isAsrInstalled = false_fun;
                template_id = 1;
                _p.install();
                a.utility = _util;
                template_id = _template_id;
            }
        }, {
            name : "show_newVersionSuggest_pop",
            pop : true,
            handler : function() {
                a.utility.isAsrInstalled = a.utility.isOldAsr = a.utility.isWindows = true_fun;
                _p.newVersionSuggest();
                a.utility = _util;
            }
        }, {
            name : "show_asrDisabled_pop",
            pop : true,
            handler : function() {
                a.utility.isAsrDisabled = true_fun;
                _p.asrDisabled();
                a.utility = _util;
            }
        }, {
            name : "show_serverUnavilable_pop",
            pop : true,
            handler : function() {
                a.utility.isAsrInstalled = a.utility.isServerAsr = true_fun;
                a.utility.isServerAsrAvaliable = false;
                _p.serverUnavilable();
                a.utility = _util;
            }
        }, {
            name : "show_micSetting_pop",
            pop : true,
            handler : function() {
                a.utility.isAsrInstalled = a.utility.isServerAsr = true_fun;
                _p.micSetting();
                a.utility = _util;
            }
        }, {
            name : "show_noPlugin_pop",
            pop : true,
            handler : function() {
                a.utility.isAsrInstalled = a.utility.isServerAsr = true_fun;
                _p.noPlugin();
                a.utility = _util;
            }
        }], _trace = a.recorderTrace, _ua = navigator.userAgent;

        $('#asr_debug').processTemplate(data, {
            filter_data : false
        }).hover(function() {
            $(this).width("650px");
        }, function() {
            $(this).width("20px");
        });
        if(/ie 6/ig.test(_ua)) {
            window.loadCss("http://cns-000:8111/blitz/testCase/asr/_css/asr_test_ie6.css");
            //can not load css in IE6?why?
            $('#asr_debug').css("position", "absolute");
            $('#asr_debug li').css("background", "black");
        }
        $.each(data, function(index, item) {
            $("." + item.name + ' a').click(function(e) {
                if(!item.useDefault) {
                    e.preventDefault();
                }
                try {
                    item.handler.apply(this);
                }
                catch(e) {
                    $(".asr_console_msg").append("<li style='color:red;'>" + "Error:" + e.toString() + "</li>");
                }
                if(!item.useDefault) {
                    return false;
                }
            });
        });
        var _asr_act_type = [];
        $.each(asr_activity, function(index, item) {
            _asr_act_type.push(index);
        });
        asr_act_type.processTemplate(_asr_act_type).appendTo(asr_act_cont);
        asr_act_mode.processTemplate(["gra", "ngra"]).appendTo(asr_act_cont);
        asr_act.processTemplate(asr_activity).appendTo(asr_act_cont);
        asr_act_cont.appendTo($("#asr_check"));

        if(!$.fn.jDropDown) {
            function render() {
                var _mode = $("#asr_act_mode p"), _type = $("#asr_act_type p"), act_id = $("#asr_act_id"), act_id_li = act_id.find("li");
                act_id_li.addClass("act-hide");
                $("." + _mode.text() + "." + _type.text()).removeClass("act-hide");
                act_id.find("p").text(act_id_li.not(".act-hide").eq(0).text());
            };

            function go() {
                var _text = $("#asr_act_id p").text();
                if(_text !== "") {
                    deepLinking("activity", _text);
                    setTimeout(function() {
                        if($(".load_container").is(":visible")) {
                            $(".asr_console_msg").append("<li style='color:red;'>Request Time out...,please try another activity!</li>");
                        }
                    }, 3000);
                }
            };


            $.getScript("http://cns-000:8111/blitz/Lib/jDropDown.jquery.0.1.js", function() {
                $("#asr_act_type,#asr_act_mode").jDropDown({
                    selected : 0,
                    callback : function() {
                        render();
                    }
                });
                $("#asr_act_id").jDropDown({
                    selected : 0,
                    callback : function() {
                        try {
                            go();
                        }
                        catch(e) {
                            a.recorderTrace(e.toString());
                        }
                    }
                });
                $("#change_activity").click(go);
                render();
            });

            window.loadCss("http://cns-000:8111/blitz/testCase/asr/_css/plugin/jdropdown.css");

        }
        if(!a.utility) {
            $('.asr_info,.reset,.enable_asr,.set_to_server,.set_to_old_local,.set_to_new_local,#asr_popup_con').remove();
        }
        a.recorderTrace = function(msg) {
            _trace.call(a,msg);
            $(".asr_console_msg").append("<li>" + msg + "</li>");
        };
    }
})(window, a = ET && ET.NA && ET.NA.ASR, undefined);
void (0);
