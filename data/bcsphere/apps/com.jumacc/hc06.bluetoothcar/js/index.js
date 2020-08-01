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
		//navigator.serial_port = cordova.require("org.bluetooth.profile.serial_port");
		
	},
	
	onBCReady : function(){
		app.device = new BC.Device({deviceAddress:DEVICEADDRESS,type:DEVICETYPE});
	},
	
	ONF : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ONF",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ONB : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ONB",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ONA : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ONA",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ONC : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ONC",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
    OND : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","OND",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON1 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON1",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON2 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON2",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON3 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON3",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON4 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON4",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON5 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON6",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON6 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON6",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON7 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON7",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON8 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON8",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
	ON9 : function(){
			app.device.connect(function(){
				app.device.rfcommWrite("ASCII","ON9",function(){
				},function(){
					alert("write error!!");
				});
			},function(){
				alert("connect error!!");
			},"00001101-0000-1000-8000-00805F9B34FB",true);
	},
	
};