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
//TI SensorTag UUID:
	// app.serviceID = [{0:"1800",1:["2a00","2a01","2a02","2a03","2a04"]},
		// 			 {0:"1801",1:["2a05"]},
		// 			 {0:"180a",1:["2a23","2a24","2a25","2a26","2a27","2a28","2a29","2a2a","2a50"]},//device information: 2a23-ID
		// 			 {0:"aa00",1:["aa01","aa02"]},//Temperature: aa01-data;aa02-config
		// 			 {0:"aa10",1:["aa11","aa12","aa13"]},//Accelerometer: aa11-data;aa12-config;aa13-period
		// 			 {0:"aa20",1:["aa21","aa22"]},//Humidity: aa21-data;aa22-config
		// 			 {0:"aa30",1:["aa31","aa32","aa33"]},//Magnetometer: aa31-data;aa32-config;aa33-period
		// 			 {0:"aa40",1:["aa41","aa42","aa43"]},//Barometer: aa41-data;aa42-config;aa43-cail
		// 			 {0:"aa50",1:["aa51","aa52"]},//Gyroscope: aa51-data;aa52-config
		// 			 {0:"ffe0",1:["ffe1"]},//key press state: 0x00,0x01,0x02,0x03
		// 			 {0:"aa60",1:["aa61","aa62"]},//test data
		// 			 {0:"ccc0",1:["ccc1","ccc2","ccc3"]},
		// 			 {0:"ffc0",1:["ffc1","ffc2"]}];

var app = {
	device : {},

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
	},
	
	onBCReady : function(){
		app.device = new BC.Device({deviceAddress:DEVICEADDRESS,type:DEVICETYPE});
		//app.device = new BC.Device({deviceAddress:"BC:6A:29:AB:64:AB",type:"BLE"});
	},

	connect : function(){
		app.device.connect(function(){
			//alert("device:" + app.device.deviceAddress + "is connected successfully!");	
			document.getElementById("Devices_state").innerHTML="connected";
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("FFE0")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("FFE1")[0];
					character.subscribe(function(data){
					//alert("subscribe success");
					document.getElementById("KeyState").innerHTML=JSON.stringify(data.value.getHexString());
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
		},function(){
			alert("connect error!");
		});
	},	

	disconnect : function(){
		app.device.disconnect(function(){
			document.getElementById("Devices_state").innerHTML="disconnected";
		},function(){
			console.log("disconnect error");
		});
	},

	read : function(){
			
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("180A")[0];
				//alert("The Service UUID is" + service.uuid);
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("2A23")[0];
					character.read(function(data){
						//alert(JSON.stringify(data.value.getASCIIString()));
						document.getElementById("Devices_info").innerHTML=JSON.stringify(data.value.getHexString());
					},function(){
						alert("read error!");
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
	},

	power : function(n){
		var x=1;
		for(var i=0;i<n;i++){
			 x=x*16;
		}
		return x;
	},

	str2val : function(str,x,y){
		var val;
		var buf;
		var j=0;
		var sum=0;
		var length=str.length;
		for(var i = x-1; i < y; i++){
			val = str.charCodeAt(i);
			if((val>=48)&&(val<=57)) buf=val-48;
			if((val>=97)&&(val<=102)) buf=val-87;
			switch(i)
			{
				case 0: j=1;break;
				case 1: j=0;break;
				case 2: j=3;break;
				case 3: j=2;break;
				case 4: j=1;break;
				case 5: j=0;break;
				case 6: j=3;break;
				case 7: j=2;break;
				case 8: j=1;break;
				case 9: j=0;break;
				case 10: j=3;break;
				case 11: j=2;break;
			}
			var xxx=app.power(j);
			sum=sum+buf*xxx;
		}
		return sum;
	},

	subscribeT : function(){ 
		app.device.discoverServices(function(){
			var service = app.device.getServiceByUUID("F000AA00-0451-4000-B000-000000000000")[0];
			service.discoverCharacteristics(function(){
				var character1 = service.getCharacteristicByUUID("F000AA01-0451-4000-B000-000000000000")[0];	
				var character2 = service.getCharacteristicByUUID("F000AA02-0451-4000-B000-000000000000")[0];
				character2.write("Hex","01",function(data){
						//alert(JSON.stringify(data));
					},function(){
						alert("write error!");
					});
				character1.subscribe(function(data){
					//alert("subscribe success");
					var temp=data.value.getHexString();
					var temperature=app.str2val(temp,5,8)/128;
					document.getElementById("Temperature").innerHTML=temperature.toFixed(2);
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
		});
	},

	unsubscribeT : function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA00-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("F000AA01-0451-4000-B000-000000000000")[0];					
					character.unsubscribe(function(data){
						//alert("unsubscribe success");					
					},function(){
						alert("unsubscribe error");
					});
			},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
	},

	subscribeA : function(){
		app.device.discoverServices(function(){
			var service = app.device.getServiceByUUID("F000AA10-0451-4000-B000-000000000000")[0];
			service.discoverCharacteristics(function(){
				var character1 = service.getCharacteristicByUUID("F000AA11-0451-4000-B000-000000000000")[0];	
				var character2 = service.getCharacteristicByUUID("F000AA12-0451-4000-B000-000000000000")[0];
				character2.write("Hex","01",function(data){
						//alert(JSON.stringify(data));
					},function(){
						alert("write error!");
					});
				character1.subscribe(function(data){
					//alert("subscribe success");
					var temp=data.value.getHexString();
					var aX=app.str2val(temp,1,2);
					var aY=app.str2val(temp,3,4)/256;
					var aZ=app.str2val(temp,5,6);
					aX= 1*aX/64;
					aY= 1*aY/64;
					aZ= 1*aZ/64;
					document.getElementById("AccelerometerX").innerHTML=aX.toFixed(2);
					document.getElementById("AccelerometerY").innerHTML=aY.toFixed(2);
					document.getElementById("AccelerometerZ").innerHTML=aZ.toFixed(2);
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
		});
	},

	unsubscribeA : function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA10-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("F000AA11-0451-4000-B000-000000000000")[0];					
					character.unsubscribe(function(data){
						//alert("unsubscribe success");					
					},function(){
						alert("unsubscribe error");
					});
			},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
	},

	subscribeH : function(){
		app.device.discoverServices(function(){
			var service = app.device.getServiceByUUID("F000AA20-0451-4000-B000-000000000000")[0];
			service.discoverCharacteristics(function(){
				var character1 = service.getCharacteristicByUUID("F000AA21-0451-4000-B000-000000000000")[0];	
				var character2 = service.getCharacteristicByUUID("F000AA22-0451-4000-B000-000000000000")[0];
				character2.write("Hex","01",function(data){
						//alert(JSON.stringify(data));
					},function(){
						alert("write error!");
					});
				character1.subscribe(function(data){
					//alert("subscribe success");
					var temp=data.value.getHexString();
					var humidity=app.str2val(temp,5,8);
					humidity=125*humidity/65536-6;
					document.getElementById("Humidity").innerHTML=humidity.toFixed(2);
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
		});
	},

	unsubscribeH : function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA20-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("F000AA21-0451-4000-B000-000000000000")[0];					
					character.unsubscribe(function(data){
						//alert("unsubscribe success");					
					},function(){
						alert("unsubscribe error");
					});
			},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
	},

	subscribeM : function(){
		app.device.discoverServices(function(){
			var service = app.device.getServiceByUUID("F000AA30-0451-4000-B000-000000000000")[0];
			service.discoverCharacteristics(function(){
				var character1 = service.getCharacteristicByUUID("F000AA31-0451-4000-B000-000000000000")[0];	
				var character2 = service.getCharacteristicByUUID("F000AA32-0451-4000-B000-000000000000")[0];
				character2.write("Hex","01",function(data){
						//alert(JSON.stringify(data));
					},function(){
						alert("write error!");
					});
				character1.subscribe(function(data){
					//alert("subscribe success");
					var temp=data.value.getHexString();
					var mX=app.str2val(temp,1,4);
					var mY=app.str2val(temp,5,8);
					var mZ=app.str2val(temp,9,12);
					mX= 1*mX*2000/65536;
					mY= 1*mY*2000/65536;
					mZ= 1*mZ*2000/65536;
					document.getElementById("MagnetometerX").innerHTML=mX.toFixed(2);
					document.getElementById("MagnetometerY").innerHTML=mY.toFixed(2);
					document.getElementById("MagnetometerZ").innerHTML=mZ.toFixed(2);
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
		});
	},

	unsubscribeM : function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA30-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("F000AA31-0451-4000-B000-000000000000")[0];					
					character.unsubscribe(function(data){
						//alert("unsubscribe success");					
					},function(){
						alert("unsubscribe error");
					});
			},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
	},

	subscribeB : function(){
		app.device.discoverServices(function(){
			var service = app.device.getServiceByUUID("F000AA40-0451-4000-B000-000000000000")[0];
			service.discoverCharacteristics(function(){
				var character1 = service.getCharacteristicByUUID("F000AA41-0451-4000-B000-000000000000")[0];	
				var character2 = service.getCharacteristicByUUID("F000AA42-0451-4000-B000-000000000000")[0];
				character2.write("Hex","01",function(data){
						//alert(JSON.stringify(data));
					},function(){
						alert("write error!");
					});
				character1.subscribe(function(data){
					//alert("subscribe success");
					document.getElementById("Barometer").innerHTML=JSON.stringify(data.value.getHexString());
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
		});
	},

	unsubscribeB : function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA40-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("F000AA41-0451-4000-B000-000000000000")[0];					
					character.unsubscribe(function(data){
						//alert("unsubscribe success");					
					},function(){
						alert("unsubscribe error");
					});
			},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
	},

	subscribeG : function(){
		app.device.discoverServices(function(){
			var service = app.device.getServiceByUUID("F000AA50-0451-4000-B000-000000000000")[0];
			service.discoverCharacteristics(function(){
				var character1 = service.getCharacteristicByUUID("F000AA51-0451-4000-B000-000000000000")[0];	
				var character2 = service.getCharacteristicByUUID("F000AA52-0451-4000-B000-000000000000")[0];
				character2.write("Hex","07",function(data){
						//alert(JSON.stringify(data));
					},function(){
						alert("write error!");
					});
				character1.subscribe(function(data){
					//alert("subscribe success");
					var temp=data.value.getHexString();
					var gX=app.str2val(temp,1,4).toFixed(2);
					var gY=app.str2val(temp,5,8).toFixed(2);
					var gZ=app.str2val(temp,9,12).toFixed(2);
					gX= 1*gX*500/65536;
					gY= 1*gY*500/65536;
					gZ= 1*gZ*500/65536;
					document.getElementById("GyroscopeX").innerHTML=gX.toFixed(2);
					document.getElementById("GyroscopeY").innerHTML=gY.toFixed(2);
					document.getElementById("GyroscopeZ").innerHTML=gZ.toFixed(2);
					});
				},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
		});
	},

	unsubscribeG : function(){
			app.device.discoverServices(function(){
				var service = app.device.getServiceByUUID("F000AA50-0451-4000-B000-000000000000")[0];
				service.discoverCharacteristics(function(){
					var character = service.getCharacteristicByUUID("F000AA51-0451-4000-B000-000000000000")[0];					
					character.unsubscribe(function(data){
						//alert("unsubscribe success");					
					},function(){
						alert("unsubscribe error");
					});
			},function(){
					alert("discoverCharacteristics error!");
				});
			},function(){
				alert("discoverServices error!");
			});
	},
};


