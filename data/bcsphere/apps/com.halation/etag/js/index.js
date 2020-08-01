/*
	Copyright 2013-2014, JUMA Technology

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var app = {

	device:{},
	num:0,
	timer:null,
    // Application Constructor
    initialize: function() {
        app.bindCordovaEvents();
    },
    
    bindCordovaEvents: function() {
		document.addEventListener('deviceready',app.onDeviceReady,false);
        document.addEventListener('bcready', app.onBCReady, false);
    },
    
	onDeviceReady : function(){
		var BC = window.BC = cordova.require("org.bcsphere.bcjs");
		//navigator.camera = cordova.require("org.apache.cordova.camera.camera");
		
	},
	
	onBCReady : function(){
		//document.addEventListener("newDevice",app.newDevice,false)
		app.device = new BC.Device({deviceAddress:DEVICEADDRESS,type:DEVICETYPE});
	},

	clear : function(){
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("fff0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("fff6")[0];
					var text="0512000003eb";
					alert(text);
					character.write("Hex",text,function(data){
						
					},function(){
						alert("read error!");
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},

	demoOne : function(){
		//var device = new BC.Device({deviceAddress:"78:C5:E5:99:26:37",type:"BLE"});
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("fff0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("fff6")[0];
					var text="132309f803";
					for(var i=0;i<7;i++){
						text=text+"ff01";
					}
					text=text+"00";
					character.write("Hex",text,function(data){
					},function(){
						alert("write error!");
					});
					app.timer=setInterval(function(){
						var text1="13";
						for(var j=0;j<9;j++){
							text1=text1+"ff01";
						}
						text1=text1+"00";
						
						character.write("Hex",text1,function(data){
						},function(){
							alert("write error!");
						});
						app.num=app.num+1;
						if(app.num==133){
							var text2="0d";
							for(var i=0;i<5;i++){
								text2=text2+"ff01";
							}
							text2=text2+"000000";
							alert(text2);
							character.write("Hex",text2,function(data){
							},function(){
								alert("write error!");
							});	
							clearInterval(app.timer);
							app.num=0;
						}
					},200);										
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},

	demoTwo : function(){
		//var device = new BC.Device({deviceAddress:"78:C5:E5:99:26:37",type:"BLE"});
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("fff0")[0];
				service.discoverCharacteristics(function(){
					var imgData="0000000000000000000000000000000000000000000000000000000000"+
								"0000004000004000040080080004000100000101000040800000000000"+
								"0007FFE000003004021FC00800040001000FFF81004040880000000000"+
								"00040000000013FE1F90810880041001040002011FE07CFC0000000000"+
								"02040000000001041090808880FFF83FFE000C010000A1200000000000"+
								"020481000000810410908049008410210400300FC00114100000000000"+
								"05044100000041081F9F80490084102104002001002216100000000000"+
								"05042200000049081090800A20841021040020833FF009000000000000"+
								"050414000000088810908FFFF0FFF03FFC3FFFC3820010800000000000"+
								"08840800C00010901F90804400841021040020054A8020600000000000"+
								"08841400C0001050109F804400841021040020054A40DF9C0000000000"+
								"0F842300000020201210804400FFF03FFC002009122300080000000000"+
								"088441000000E060111080441084102104002001122024400000000000"+
								"10458000C0002090129080441004000100002001221012400000000000"+
								"10440020C00021081CA080841004080102002001421012800000000000"+
								"38E7FFF00000220710428104100408010201A0010A0000880000000000"+
								"0004000000002C0200810E03F003F800FE0040010401FFFC0000000000"+
								"0000000000000000000000000000000000000000000000000000000000"+
								"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"+
								"0000000000000000000000000000000000000000000000000000000000"+
								"00FFC000110204000000000000000007C0007C0000F80007C000000000"+
								"00800000FFE22400000000000000000FF000FF0001FE000FF000001F00"+
								"3C8100C011022400000000000000001FF001FF8003FF001FF000007FC0"+
								"129100C004022400000000000000003FF803FFC007FF003FF80000FFC0"+
								"128A00007F86B400000000000000003FFC03FFC007FF803FFC0001FFE0"+
								"1C840000048A6C00000000000000007FFC07FFE00FFF807FFC0001FFF0"+
								"1286000024C22400000000000000007FFC07FFE00FFFC07FFC0003FFF0"+
								"128900C048A2240000000000000000FFFE07FFE01FFFC0FFFE0003FFF0"+
								"12B080C008A2240000000000000000FFFE07FFE01FFFC0FFFE0007F3F8"+
								"3C8000001104240000000000000000FFFE0FFFF01FFFC0FFFE0007E1F8"+
								"00FFE0006708040000000000000000FE7F0FE7F03F8FE0FE7F0007E1F8"+
								"000000000000000000000000000000FC3F0FE7F03F8FE0FC3F0007E180"+
								"000000000000000000000000000001FC3F0FC3F03F07E1FC3F0007C000"+
								"00FFC0000000004000000000000001F83F0FC3F03F07E1F83F000FC000"+
								"008000000000004000000000000001F83F0FC3F03F0601F83F000FC000"+
								"1E8100C07007004000000000000001F81F0FC3F03F0001F81F000FC700"+
								"229100C08808BFF800000000000001F81F8FC3F03F0001F81F800FCFC0"+
								"208A00008808804000000000000001F81F8FC3F07E0001F81F800FDFC0"+
								"208400001007084000000000000001F81F8FE3F07E0001F81F800FFFE0"+
								"208600002008844000000000000001F81F8FE7E07E3C01F81F800FFFF0"+
								"208900C04008844000000000000001F81F87FFE07E7E01F81F800FFFF0"+
								"22B080C08008804000000000000001F81F87FFE07E7F01F81F800FFFF0"+
								"1C800000F907004000000000000001F81F87FFE07EFF01F81F800FF3F0"+
								"00FFE000000001C000000000000001F83F83FFC07EFF81F83F800FE3F9"+
								"000000000000000000000000000001FC3F83FFC07FFF81FC3F800FE1F9"+
								"000000000000000000000000000001FC3F83FFC07FFF81FC3F800FC1F9"+
								"00FFC0000000000000000000000000FE7F87FFE07FFFC0FE7F800FC1F9"+
								"008000000002FE0000000000000000FFFF87FFE07FFFC0FFFF800FC1F9"+
								"3C8100000004240000000000000000FFFF8FFFE07FFFC0FFFF800FC1F9"+
								"129100C00009280000000000000000FFFF8FFFF07F9FC0FFFF8007C1F9"+
								"128A00C0004E2C00000000000000007FFF8FE7F07F0FE07FFF8007C1F9"+
								"12840000FFE42400000000000000007FFF8FC3F07F0FE07FFF8007E1F9"+
								"1286000000092400000000000000007FFF9FC3F87F07E07FFF8007E3F9"+
								"12890000000E5400000000000000003FDF9F81F87E07E03FDF8007F3F0"+
								"12B080C000014800000000000000003FDF9F81F87E07E03FDF8003FFF0"+
								"3C8000C0000E9400000000000000001F9F9F81F87E07E01F9F8003FFF0"+
								"00FFE00000016200000000000000000F1F9F81F87E07E00F1F8003FFE0"+
								"000000000000000000000000000000001F9F81F87E07E0001F9F01FFE0"+
								"000000000000000000000000000000001F9F81F87E07E0001F9F00FFC0"+
								"00FFC0000400000000000000000000003F1F81F87E07E0003F1F007F80"+
								"008000000A00000000000000000000003F1F81F83E07E0003F1F003F00"+
								"3E8100C01100000000000000000000183F1F81F83F07E0183F00000000"+
								"129100C02480000000000000000000F83F1F83F83F07E0F83F00000000"+
								"148A0000C460000000000000000001F83F1FC3F83F0FE1F83F00000000"+
								"1C8400000400000000000000000001FC7F1FC3F83F0FC1FC7F00000000"+
								"148600000400000000000000000001FC7F0FE7F03F9FC1FC7F00000000"+
								"108900C00400000000000000000000FFFE0FFFF01FFFC0FFFE00000000"+
								"12B080C00400000000000000000000FFFE0FFFF01FFFC0FFFE00000000"+
								"3E8000000400000000000000000000FFFE0FFFF01FFFC0FFFE00000000"+
								"00FFE0000400000000000000000000FFFC0FFFE00FFF80FFFC00000000"+
								"0000000000000000000000000000007FFC07FFE00FFF807FFC00000000"+
								"0000000000000000000000000000007FF807FFE00FFF807FF800000000"+
								"00FFC00000000000000000000000003FF803FFC007FF003FF800000000"+
								"0080000000000000000000000000003FF003FF8003FE003FF000000000"+
								"3E8100C000000000000000000000001FE001FF0003FC001FE000000000"+
								"129100C0000000000000000000000007C0007E0000F80007C000000000"+
								"148A000000000000000000000000000000000000000000000000000000"+
								"1C84000000000000000000000000000000000000000000000000000000"+
								"1486000000000000000000000000000000000000000000000000000000"+
								"108900C000000000000000000000000000000000000000000000000000"+
								"10B080C00000000000000000000000006EE00038E38438E38E7C239F38"+
								"3880000000000000000000000000000025100049144C49245140645044"+
								"00FFE00000000000000000000000000035110041144441005140A45044"+
								"0000000000000000000000000000000035100079144479E19178A45E44"+
								"000000000000000000000000000000002D100044F44445105105244144"+
								"000000000000000000000000000000002D100044144445105104F44144"+
								"0000000000000000000000000000000025100044944445145144245144"+
								"0000000000000000000000000000000074E10038E38E38E38E38338E38";
					var character = service.getCharacteristicByUUID("fff6")[0];
					var text="132309f803";					
					text=text+imgData.substring(0,30);
					character.write("Hex",text,function(data){
					},function(){
						alert("write error!");
					});
					var j=30;
					app.timer=setInterval(function(){										
						var text1="13";
						text1=text1+imgData.substring(j,j+38);
						character.write("Hex",text1,function(data){
						},function(){
							alert("write error!");
						});
						j=j+38;
						app.num=app.num+1;	
						if(app.num==133){
							var text2="0d";
							text2=text2+imgData.substring(5084,5104);
							text2=text2+"000000";
							alert(text2);
							character.write("Hex",text2,function(data){
							},function(){
								alert("write error!");
							});	
							clearInterval(app.timer);
							app.num=0;
						}
					},150);										
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},


	demoThree : function(){
		//var device = new BC.Device({deviceAddress:"78:C5:E5:99:26:37",type:"BLE"});
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("fff0")[0];
				service.discoverCharacteristics(function(){
				var imgData="00000000000000000000000000000000000000000000000000000000"+
							"007fffffffffffffffffffffffffffc0000000000000000000000000"+
							"00007fffffffffffffffffffffffffffc00000000000000000000000"+
							"0000007fffffffffffffffffffffffffffc000000000000000000000"+
							"000000007ffff1fffce7fffffffffc001fffc0000000000000000000"+
							"00000000007ffff1fff8e7fffffffff8000fffc00007fe00003ff800"+
							"00007ff800007ffff1fff8e7ffffc07ff9ffcfffc00007fe0000fffe"+
							"000001fffe00007ff80000f00001ff001ff9ffcfffc0000ffe0003ff"+
							"ff800007ffff80007ff00000f00001fe000ff9ffcfffc0000ffe0007"+
							"ffffc0000fffffc0007ff3ffffe3e7fffc2387f9ffcfffc0001ffe00"+
							"0fffffe0001fffffe0007ff3f9ffe7e7fff863c3f9ffcfffc0001ffe"+
							"001ffffff0003fffffe0007ff3f1ffffe7fff0e3e3f8000fffc0003f"+
							"fe003ffffff0007ffffff0007ff3f1ffffe7fff1e3f1fc001fffc000"+
							"7ffc007ffffff800fffffff0007ff3f1ffc00000e1e3f1ffffffffc0"+
							"00fffc007ffffff801fffffff8007ff3f19fc00000e3e3f1ffffffff"+
							"c001fffc00fffffff801fffffff8007ff3e38fffffffe3e3f1ffffff"+
							"ffc003fffc00fffffffc03fffffff8007ff3e38fffffffe3c3f1f03e"+
							"03ffc00ffffc01fffffffc03fffffffc007ff3e3c7f8000fe3c7f1e0"+
							"1c01ffc03ffffc01fffffffc03fffffffc007ff3e7c7f00007e3c7e3"+
							"e79cf9ffc1fffffc03fffffffc07fff9fffc007fe3c7e3f3ffe7f187"+
							"c3e79cf9ffc3fffff803fff07ffc07ffe07ffc007fe3c7c3f3ffe7f0"+
							"0f83e79cf9ffc3fffff803ffe03ffc07ff807ffc007fe7c003f3ffe7"+
							"f81e07e79cf9ffc3fffff807ffc03ffe07ff803ffc007fc70001f3ff"+
							"e7fc380fe79cf9ffc3fffff807ff801ffe07ff003ffc007fc60001f0"+
							"0007fff81fe01c01ffc3fffff807ff801ffe0fff003ffc007fce03f1"+
							"f8000ffff87ff03e03ffc3fffff807ff801ffe0fff003ffc007fffff"+
							"f9ffffffffffffffffffffc3fffff00fff001ffc0ffe003ffc007fff"+
							"ffffffffffffffffffffffffc7fffff00fff003ffc0fff003ff8007f"+
							"ffffffffffffffffffffffffffc7fffff00fff003ffc0fff003ff800"+
							"000000000000000000000000000007fffff00fff003ffc0fff007ff8"+
							"00000000000000000000000000000007fffff00ffe003ffc0fff007f"+
							"f000000000000000000000000000000007fffff00ffe007ffc07ff80"+
							"fff000000000000000000000000000000007fffff0000000fff807ff"+
							"e3ffe00004042000108090006020000100000001ffe0000000fff807"+
							"ffffffe000040420000bf0901fc120000100000001ffe0000001fff0"+
							"03ffffffc000040ef80001417c004120000100000001ffe0000003ff"+
							"f003ffffff800024842000127310004120000100520001ffe0000007"+
							"ffe001ffffff0000244e70000ed1380081247f0100520001ffe00000"+
							"0fffe001fffffc0000444ca80003a154008124000108020001ffe000"+
							"000fffc003fffffe0000040420000a4192010128000110040001ffc0"+
							"00001fffc007ffffff0000040420000aa138020228000160080003ff"+
							"c000003fff800fffffff00000c0420001311100c0230000180300003"+
							"ffc00000ffff001fffffff8000000000000000000000000000000000"+
							"03ffc00001fffe003fffffff80000000000000000000000000000000"+
							"0003ffc00007fffc003ffe0fffc0000807f004020104388110018000"+
							"060003ffc0000ffff8007ff807ffc0000805500802310403e7fc2180"+
							"00780003ffc0003ffff0007ff003ffc000080ff8100f813e38811020"+
							"0000080007ff80007fffe000fff001ffc0000e00802002010403e7fc"+
							"238000080007ff8000ffffc000ffe001ffc000098bf02004f1043802"+
							"a83c07f0ff0007ff8001ffff8001ffe001ffe000080a101004010403"+
							"e444200000080007ff8003fffe0001ffe001ffe000080bf008040104"+
							"3a21f0200000080007ff8007fffc0001ffc001ffe000080a10040881"+
							"082a2110200000100007ff8007fff80001ffc001ffe000080ff80208"+
							"f0303be1f01f8000600007ff800fffe00001ffc003ffc00000000000"+
							"00000000000000000000000fff001fffc00001ffe003ffc000000000"+
							"0000000000000000000000000fff001fff800001ffe003ffc0000000"+
							"000000000000000000000000000fff003fff000001ffe007ffc00000"+
							"145a732f50a756c893a242e540000fff003fff000001fff00fffc000"+
							"00145a732f50a756c893a242e540000fff007ffe000001fff81fff80"+
							"0000145a732f50a756c893a242e540000fff007fffffffc1ffffffff"+
							"800000145a732f50a756c893a242e540001ffe007fffffffc1ffffff"+
							"ff800000145a732f50a756c893a242e540001ffe00ffffffffc1ffff"+
							"ffff000000145a732f50a756c893a242e540001ffe00ffffffffc1ff"+
							"ffffff000000145a732f50a756c893a242e540001ffe00ffffffffc1"+
							"fffffffe000000145a732f50a756c893a242e540001ffe00ffffffff"+
							"c0fffffffe0ff800145a732f50a756c893a242e540001ffe01ffffff"+
							"ffc0fffffffc088800145a732f50a756c893a242e540001ffe01ffff"+
							"ffff807ffffff8088800145a732f50a756c893a242e540003ffc01ff"+
							"ffffff807ffffff0088800145a732f50a756c893a242e540003ffc01"+
							"ffffffff803fffffe00ff800145a732f50a756c893a242e540003ffc"+
							"03ffffffff801fffffc0080800145a732f50a756c893a242e540003f"+
							"fc03ffffffff800fffff80080800145a732f50a756c893a242e54000"+
							"3ffc03ffffffff8003fffe00080800145a732f50a756c893a242e540"+
							"003ffc03ffffffff8000fff000081800145a732f50a756c893a242e5"+
							"40000000000000000000000000000000000000000000000000000000"+
							"00000000000000000000000000000000000000000000000000000000"+
							"00000000000000000000000000000000000000000000000000000003"+
							"ffffffffffffffffffffffffffffffffffffff000000000000000000"+
							"03ffffffffffffffffffffffffffffffffffffff0000000000000000"+
							"0003ffffffffffffffffffffffffffffffffffffff000000001fffff"+
							"e00003fffffffffffffffffffffff01ffff3c3ff3fff038000001000"+
							"00200003fffffffffffffffffffffff2dff7eddffed0070080000010"+
							"0000200003ffffffffffffffffffffdfe81f776ddffed77700808c00"+
							"1799e6200003ffffffffffffffffffff9fcadfb6edc7ffd777008192"+
							"00142429200003ffffffffffffffffffffdfe85ff7f3dbff37770080"+
							"8200172049200003ffffffffffffffffffffdfeb5f006dfbffd00701"+
							"40840010b846200003ffffffffffffffffffffdfe85fff6ddbfed7f7"+
							"0220880010a489200003ffffffffffffffffffffdfebdf006ddb9ed7"+
							"f70410900014a489200003ffffffffffffffffffffdfe81fff73e79f"+
							"37f708089e00131886200003ffffffffffffffffffffffffff007fff"+
							"fff7e700000000100000200003ffffffffffffffffffffffffffffff"+
							"ffffffff";			
					var character = service.getCharacteristicByUUID("fff6")[0];
					var text="132309f803";					
					text=text+imgData.substring(0,30);
					character.write("Hex",text,function(data){
					},function(){
						alert("write error!");
					});
					var j=30;
					app.timer=setInterval(function(){										
						var text1="13";
						text1=text1+imgData.substring(j,j+38);
						character.write("Hex",text1,function(data){
						},function(){
							alert("write error!");
						});
						j=j+38;
						app.num=app.num+1;	
						if(app.num==133){
							var text2="0d";
							text2=text2+imgData.substring(5084,5104);
							text2=text2+"000000";
							alert(text2);
							character.write("Hex",text2,function(data){
							},function(){
								alert("write error!");
							});	
							clearInterval(app.timer);
							app.num=0;
						}
					},150);										
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},

	read : function(){
		app.device.connect(function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("fff0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("fff6")[0];
					character.read(function(data){
						alert(JSON.stringify(data));
						document.getElementById("characteristicArea").innerHTML=JSON.stringify(data.value.getHexString());
					},function(){
						alert("read error!");
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connnect error!");
		});
	},
	stop : function(){
		if(app.timer!=null){
			clearInterval(app.timer);
			app.timer=null;
			app.num=0;
			return;
		}
	},

};