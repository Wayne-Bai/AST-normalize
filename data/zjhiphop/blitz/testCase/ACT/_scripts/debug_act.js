(function(w, u) {
    $("#act_debug").remove();
    window["isDebugMode"] = 1;
    var loadCss=window.loadCss||function loadCss(path) {
        if (!path) return;
        if (path.indexOf("~") === 0) {
            path = [
                        window["cacheSvr"], "/school/style.ashx?file=", path,
                        "&cacheSvr=", window["cacheSvr"],
                        "&siteVersion=", window["siteVersion"]
                   ].join("");
        }
        else if (path.indexOf("http://") !== 0) {
            path = [
                        window["cacheSvr"], path,
                        "?siteVersion=", window["siteVersion"]
                   ].join("");
        }
        var cssTag = document.getElementById('loadCss');
        var head = document.getElementsByTagName('head').item(0);
        if (cssTag) head.removeChild(cssTag);
        css = document.createElement('link');
        css.href = path;
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.id = 'loadCss' + (+new Date) + (0 | Math.random(100) * 100);
        head.appendChild(css);
    },
    deepLinking=window.deepLinking || function(type,id){
        var act_id=/school\/(?:(\d+)(?:\/(\d+)(?:\/(\d+)(?:\/(\d+)(?:\/(\d+)(?:\/(\d+)(?:\/(\d+))?)?)?)?)?)?)?/ig.exec(location.hash),
            len=act_id.length;
        
            act_id.splice(-1);
            act_id.push(id);

        console.log("#school/"+act_id.slice(1).join("/"))
        location.hash="#school/"+act_id.slice(1).join("/");
    }
    
    if(!window.console) {
        $.getScript("http://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js", function() {
            try {
                firebug.init();
                void (firebug);
            }
            catch(e) {
                if(!window.console) {
                    var names = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
                    window.console = {};
                    for(var i = 0; i < names.length; ++i) {
                        window.console[names[i]] = function() {
                        };
                    }
                }
            }
        });
    }

     //@off
    var list_act="<li class='{$T.type$key} {$T.modes$key}'><span>{$T.act}</span></li>",
        commbox="<div><p></p></div><ul>{#foreach $T as type}{#foreach $T.type as modes}{#foreach $T.modes as act}"+list_act+"{#/for}{#/for}{#/for}</ul>",
        list="<div><p></p></div><ul>{#foreach $T as record}<li><span>{$T.record}</span></li>{#/for}</ul>",
        act_type=$("<div id='act_type'></div>"),
        act=$("<div id='act_id'></div>"),
        act_mode=$("<div id='act_mode'></div>"),
        act_cont=$("<div class='act_cont'></div>"),
        sub_t ="<li class='{$T.record.name}'>"+
                "<a href='{$T.record.href}' style='{$T.record.style}' target='{$T.record.target}'>{$T.record.name} {$T.record.content}</a>"+
                "</li>";
   
   	window.ET = window.ET || {};
    //@on
    var log = function(msg) {
    	if(msg.indexOf("<li")===-1){
    	  msg="<li>"+msg+"</li>";
    	}
        $(".act_console_msg").append(msg);
    }, data = [
         {
         	name:'reset',
         	href:'',
         	handler:function(){
         		log("reseted!");
         		ET.School.UI.Common.Behavior.sort = function () {
				    if (ET.School.UI.Common.Const.config.itemRandom) {
				        return Math.random() > 0.5 ? -1 : 1;
				    }
				    else {
				        return 0;
				    }
				};
			}
         },
         {
            name : 'enable_random',
            href : '',
            handler : function() {
               var _text = $(this).text();
               if(_text==='enable_random'){
               	$(this).text('disable_random');
               	ET.School.UI.Common.Behavior.sort=function(){
               		return Math.random() > 0.5 ? -1 : 1;
               	}
               	log("enable random logic!");
               }else{
               	$(this).text('enable_random');
               	ET.School.UI.Common.Behavior.sort=function(){
               		return 0;
               	}
               	log("disable random logic!");
               }
            }
        }
    ], _activity = {
        'AudioSequence':{
            grade:[7669,7654,7418,7388,7288,6578,6545,5330,4863,2667,524,4347,4070,3994,2126],
            nongrade:[],
            ipaddemo:[59243,60883,60884]
        },
    	'VideoTimeline':{
    		grade:[4327,9760,6719,6721,6722,6723,6724,6725,6937,6938,6939,6940,6941,6942,6943,6944,6726,6728,6729,6730,7078,9765,7146],
    		nongrade:[],
            ipaddemo:[29665,29673,29682,29720,29746,29771,58202]
    	},
    	'Grouping':{
    		grade:[2035,2055,2097,2447,2783,2480,3736,3820,3892,4004,4013,3777,3819,3893,3950,],
    		nongrade:[4015,7139,4396,4427,4474,4429,4472,4184,4225,4155,5856,6421,6498,6709,3809,3704,5275,4094,4275,4110,7693,7891],
            ipaddemo:[29718,58204,58213,59154,59172,59184,59192,59236,59261,59776,59777,59778,59779,59780,59781]
    	},
    	'MatchingText':{
    		grade:[4129,2107,2974,2093,4896,4017,3827,3968,5278,7623,4406,3360,3379],
    		nongrade:[7235,2990,2698,6879,7529],
            ipaddemo:[29685,29688,29698,29730,29759,59158,59163,59174,59217,59235,59270,59282]
    	},
    	'TextSequencing':{
    		grade:[2598,2581,4358,4311,4193,101,4037,3956,3826,3618,3604,3538,3456,3430,2192],
    		nongrade:[1036,1403,1412],
            ipaddemo:[]
    	},
    	"TextSelectSingle":{
    		grade:[3671,3672,4075,4180,4182,4183,4484,3686,2563,8191,10200,9942,484,3292,441],
    		nongrade:[2624],
            ipaddemo:[59274,58228,58234]
    	},
    	"TextSelectMutiple":{
    		grade:[3637,3638,3697,3700,3677,3482,4341,4369,4519,4528,4535,4598,4605,4608,4058],
    		nongrade:[3666,3773,8122,8456,2977,3169,3186,4330,4907,4935,4028,4178,7815,5460,4795],
            ipaddemo:[29741,29742,29749,29750,29784,29792,59167,59204,59222,59229,59248,58231,58233]
    	},
    	'TypingTable':{
    		grade:[4462,4527,3675,4060,4823,4824,4825,2063,3976,4033,5185,3931,5457,3357,4304],
    		nongrade:[3625,4377,4514,3699,4080,4199,7093,4475,6598,4280,4126,8445,8574,2326,2511],
            ipaddemo:[29670,29695,29712,29757,29764,29766,29787,29793,29794,29796,58207,59157,59164,59166,59175,59193,59201,59202,59211,59225,59230,59238,59245,59255,59268,59271,58232,58227]
    	},
    	'TypingGapfill':{
    		grade:[2256,28842,9867,9652,9648,9642,9388,9375,9356,9005,8999,2042,2033,3362,8],
    		nongrade:[4126,111,4080,4041,3981,3877,3872,3770,3699,3625,3561,3546,83,2047,2036],
            ipaddemo:[]
    	},
    	'TypingParagraph':{
    		grade:[146,647,1375,1416,7356,9507,8025,8156],
    		nongrade:[4579,2328,3971,4395,3412,5209,5593,5079,2797,2808,5106,53,412,713,562],
            ipaddemo:[29666,29669,29726,29743,29747,29755,58210,58224,59199,59216,59244,59256,59273]
    	},
    	'MultipleChoiceText':{
    		grade:[3690,3867,8431,2045,2057,2064,2072,,2116,2188,2198,2139,2141],
    		nongrade:[7154,8352,8385,8107,8109,9724,8140,8938,9660,2344] ,
            ipaddemo:[29680,29705,29798,29799,29800,29801,29802,29803,29804,29805,29806,29807,29808,29809,29810,29811,29812,29813,29814,29815,59153,59156,59162,59173,59176,59182,59190,59194,59198,59208,59220,59226,59234,59237,59242,59253,59258,59260,59269,29709,29715,29717,29719,29736,29751,29754,29760,29786,58208,59782,59783,59784,59785,59786]
    	},
    	'MultipleChoiceMedia':{
    		grade:[2515,3391],
    		nongrade:[3497,4103,4106,9539,0265,6032,1459],
            ipaddemo:[29675,29684,29697,29708,29711,29745]
    	},
    	'MultipleSelectText':{
    		grade:[2283,9813,9640,9362,9353,9282,3415,2184,2183,2160,2144,28,24,11,3369],
    		nongrade:[2814,5906,1298,5644,1249,5378,5250,5029,4950,462,4541,2539,2301,2299,2290],
            ipaddemo:[]
    	},
    	'MultipleSelectMedia':{
    		grade:[296,4237,4175,4174,3997,3680,3676,3663,3662,3661,3647,3641,3419,3367,3356],
    		nongrade:[10101,9797,3334,3182,2936,2930,6527,5907,5845,5772,2578],
            ipaddemo:[]
    	},
    	'MatchingLongText':{
    		grade:[2156,2231,2221,2215,3692,3617,3609,3597,3540,2216,2124,2077,13,12,3358],
    		nongrade:[10143,9032,9026,8960,8914,2876,2851,5924,739,5719,5117],
            ipaddemo:[58226,59183,59189,59200,59209,59218,59228,59251,59278]
    	},
    	'WordsVertical':{
    		grade:[3479,3489,3512,3470,4851,4861,3689,4118,6622,7067,9643,2401],
    		nongrade:[5370,4179,4868,4099,,6426,6761,6782,7110,9538,8333,7889],
            ipaddemo:[]
    	},
        'WordJumble':{
            nongrade:[10257,8736,8723,7430,4204],
            grade:[9153,3657,3613,3592,3591,2227,3469,3433,55,3421,2189,33,31,3384,2043],
            ipaddemo:[29679,29739,29761,29762,29776,29788,58225,59191,59227,59239,59247,59264]
        },
    	'MatchingPicture':{
    		grade:[3562,3533,3472,2201,3418,2102,2100,2092,2091,2085,2054,2044,2040,2030,2026],
    		nongrade:[4805,2031,2897],
            ipaddemo:[29738,29773,29774,29704,59203,59207,59263]
    	},
    	'MatchingAudio':{
    		grade:[3548,3487,3485,3473,3468,3451,93,2187,3398,2148,2125,2095,2094,2066,2037],
    		nongrade:[1054,7056,10327,17163],
            ipaddemo:[29667,29687,29703,29722,29723,29724,29728,29729,29732,29733,29734,59165,59219,59280]
    	},
    	'Classification':{
    		grade:[4957,4051,7743,4587,5047,4284,9038,2752,3274,9545,],
    		nongrade:[8379,8133,8245,8248,8444,8450,2327,2905,2500,3910,8239],
            ipaddemo:[60879,60880]
    	},
    	'Dictagloss':{
    		grade:[3400,4382,3629,3636,3715,3656,3659,3664,3667,3673,3475],
       		nongrade:[3535,9820,8967,8572,4322,4478,4216,6720,3918,6559,9716,6807,7781,8405,8141,8459,9818],
            ipaddemo:[29700,29731,29737,29763,29775,29777,29782,29785,29789,29797,59159,59168,59177,59178,59186,59187,59195,59213,59223,59224,59233,59241,59265,59284]
    	},
        'RolePlaySingle' : {
            grade : [3499, 3505, 3514, 3756, 4610, 5346, 4194, 6765, 6773, 7887, 2391, 2123],
            nongrade : [3399, 9682, 3712, 3721, 9725, 3558, 9665, 4661, 9689],
            ipaddemo:[29758,29765,29767,59246]
        },
        'RolePlayMutiple' : {
            grade : [3528, 3537, 3539, 3523, 3674, 3557, 3559, 3585, 3586, 3587, 4600, 7138, 4258, 4242],
            nongrade : [6618, 4854, 2513, 2558, 4005, 4036, 3972, 5489, 4481, 6324, 6833, 6119],
            ipaddemo:[29671,29672,29681,29690,29790,58222,59161,59169,59197,59215,59232,59250,59259,59267,59275,59283]
        },
        'SpeakingChallenge' : {
            grade : [],
            nongrade : [3403, 3507, 3520, 3703, 3705, 3728, 3730, 4348, 4464, 4547, 4612, 3665, 3707],
            ipaddemo:[29752,29753,29768,29769,29770,59160,59170,59179,59188,59196,59205,59214,59231,59266,59276,59285]
        },
        'FlashCard_Presentation' : {
            grade : [3350, 3522, 3599, 3476, 4350, 4583, 7148, 6402, 6483, 6549],
            nongrade : [4335, 3491, 3498, 9683, 3732, 4378, 4549, 9696, 7176, 4181, 4212, 8969, 8852],
            ipaddemo:[29676,29686,29693,29699,29702,29706,29707,29721,29727,29748,29772,59180,59262,58238,58239,58240,58230,58235,58236]
        },
        'FlashCard_excise' : {
            grade : [3578, 9726, 3600, 3502, 4069, 4392, 4521, 4530, 4595, 4615],
            nongrade : [],
            ipaddemo:[]
        },
        'FlashCard_Mix' : {
            grade : [3351, 3352, 3576, 3579, 2521, 2029, 3137, 2088, 3056, 3109],
            nongrade : [],
            ipaddemo:[]
        },
        'FlashCard_ModelSentence' : {
            grade : [9698, 3549, 4523, 7170, 7173, 6510, 7703, 7804, 8403, 7899, 8108],
            nongrade : [4539, 4443, 3794, 3816, 55479, 4659, 6634, 6752, 6323, 8698],
            ipaddemo:[60881,60882]
        },
        'LanguageComparation' : {
            grade : [3354, 3503, 3504, 3508, 5236, 3582, 3710, 9797, 9707, 3484, 7156, 7158],
            nongrade : [3361, 3406, 6881, 19],
            ipaddemo:[29668,29678,29689,29694,29710,29756,58221,59155,59185,59212,59221,59257,58237,58229]
        },
        'VedioRoleplay' : {
            grade : [59456,59457,59458,59459,59460,59461,59462,59463,59400,59401,59402,59403,59404,59405,59406],
            nongrade : [],
            ipaddemo:[58218,31126,31127,30096,30097]
        }
    }, _ua = navigator.userAgent;
   

    
    $.getScript("http://cns-000:8111/blitz/Lib/jquery-jtemplates_uncompressed.js",function(){
        loadCss("http://cns-000:8111/blitz/testCase/ACT/_css/act_test.css");
        $('body').append("<div id='act_debug'></div>");
        $('#act_debug').setTemplate( "<ul>{#foreach $T as record}"+sub_t+"{#/for}</ul>"+
        "<fieldset><legend>Activity</legend><div id='act_check'><input id='change_activity' type='button' value='GO!'/></div></fieldset>"+
        "<fieldset><legend>Console</legend><ul class='act_console_msg'></ul></fieldset>");

        act_type.setTemplate(list);
        act_mode.setTemplate(list);
        act.setTemplate(commbox);

        $('#act_debug').processTemplate(data, {
            filter_data : false
        }).hover(function() {
            $(this).width("650px");
        }, function() {
            $(this).width("20px");
        });
        $.each(data, function(index, item) {
            $("." + item.name + ' a').click(function(e) {
                if(!item.useDefault){
                    e.preventDefault();
                }
                try {
                    item.handler.apply(this);
                }
                catch(e) {
                    log(e.toString());
                }
                if(!item.useDefault) {
                    return false;
                }
            });
        });
        var _act_type = [];
        $.each(_activity, function(index, item) {
            _act_type.push(index);
        }); 

        act_type.processTemplate(_act_type).appendTo(act_cont);
        act_mode.processTemplate(["grade", "nongrade","ipaddemo"]).appendTo(act_cont);
        act.processTemplate(_activity).appendTo(act_cont);
        act_cont.appendTo($("#act_check"));
    });

    
    function render() {
        var _mode = $("#act_mode p").text() || 'grade', 
            _type = $("#act_type p").text() || 'AudioSequence', 
            act_id = $("#act_id"), 
            SEL_ACT = "." + _mode + "." + _type,
            act_id_li = act_id.find("li");

        act_id_li.addClass("act-hide");
        $(SEL_ACT).removeClass("act-hide");
        act_id.find("p").text(act_id_li.not(".act-hide").eq(0).text());
    };

    function go() {
        var _text = $("#act_id p").text();
        if(_text !== "") {
            deepLinking("activity", _text);
            log("LOG: load activity "+$("#act_type p").text()+"--"+_text);
            setTimeout(function() {
                if($(".load_container").is(":visible")) {
                    log("<li style='color:red;'>Request Time out...,please try another activity!</li>");
                }
            }, 3000);
        }
    };


    $.getScript("http://cns-000:8111/blitz/Lib/jDropDown.jquery.0.1.js", function() {
        setTimeout(function(){
            $("#act_type,#act_mode").jDropDown({
                selected : 0,
                callback : function() {
                    render();
                }
            });
            $("#act_id").jDropDown({
                selected : 0,
                callback : function() {
                    try {
                        go();
                    }
                    catch(e) {
                        log(e.toString());
                    }
                }
            });
            $("#change_activity").click(go);
        },300);
        //render();
    });
    loadCss("http://cns-000:8111/blitz/testCase/act/_css/plugin/jdropdown.css");
    
})(window, undefined);
void (0);
