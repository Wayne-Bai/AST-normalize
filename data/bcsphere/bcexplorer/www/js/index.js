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
var serviceUniqueID = "";
var interval_notify_index = "";
var app = {
	interval_rssi:null,
	num:1,
    
    initialize: function() {
        app.bindCordovaEvents();
        app.bindUIEvents();
    },
    
    bindCordovaEvents: function() {
        document.addEventListener('bcready', app.onBCReady, false);
    },

     bindUIEvents: function(){
    	$('#scanOnOff').change(app.startORstopScan); 
    },

    onBCReady: function() {
    	var BC = window.BC = cordova.require("org.bcsphere.bcjs");
		var _ = window._ = cordova.require("org.underscorejs.underscore");
		document.addEventListener('bluetoothstatechange', app.onBluetoothStateChange, false);
		BC.bluetooth.addEventListener("newdevice",app.addNewDevice);
		if(!BC.bluetooth.isopen){
			if(API !== "ios"){
				BC.Bluetooth.OpenBluetooth(function(){
					console.log("open success!!");
				});
			}else{					
				alert("Please open your bluetooth first.");
			}
		}
    },

    addNewDevice: function(s){
		var newDevice = s.target;
		newDevice.addEventListener("deviceconnected",app.onDeviceConnected);
		newDevice.addEventListener("devicedisconnected",app.onDeviceDisconnected);
		app.addDeviceToUI(newDevice);
	},

	onDeviceConnected : function(arg){
		var deviceAddress = arg.deviceAddress;
		console.log("device:"+deviceAddress+" is connected!");
	},
	
	onDeviceDisconnected: function(arg){
		if(app.interval_rssi!=null)
        window.clearInterval(app.interval_rssi);
		$.mobile.changePage("searched.html","slideup");
	},
    
    addDeviceToUI : function(newDevice){
		var viewObj	= $("#user_view");//do what
		var liTplObj=$("#li_tpl").clone();
		$(liTplObj).attr("onclick","app.device_page('"+newDevice.deviceAddress+"')");
		liTplObj.show();
		
		for(var key in newDevice){
			if(key == "isConnected"){
				if(newDevice.isConnected){
					$("[dbField='"+key+"']",liTplObj).html("YES");
				}
				$("[dbField='"+key+"']",liTplObj).html("NO");
			}else{
				$("[dbField='"+key+"']",liTplObj).html(newDevice[key]);
			}
		}
		viewObj.append(liTplObj);
	},
	
    device_page: function(deviceAddress){
    	app.device = BC.bluetooth.devices[deviceAddress];
		BC.Bluetooth.StopScan();
    	$.mobile.changePage("connect.html","slideup");
    },
    
    startScan : function(){
        //alert(111);
    	$('img#spinner').attr("src","img/searching.png").addClass('img-responsive spinner').next().show();
    	$('img#spinner').attr("onclick","app.stopScan()");
    	BC.Bluetooth.StartScan();
    },

    addStartDevice : function(){
        var deviceList = BC.bluetooth.devices;
        if(deviceList){
        	_.each(deviceList, function(device){
				app.addDeviceToUI(device);
			});
        }
        app.startScan();
    },

    stopScan : function(){
    	$('img#spinner').attr("src","img/arrow.png").removeClass('spinner').next().hide();
    	$('img#spinner').attr("onclick","app.startScan()");
    	BC.Bluetooth.StopScan();
    },
    
	onBluetoothStateChange : function(){
		if(BC.bluetooth.isopen){
			var scanOnOff = $("#scanOnOff");
			scanOnOff[0].selectedIndex = 0;
			scanOnOff.slider("refresh");
		}else{
			BC.Bluetooth.OpenBluetooth(function(){alert("opened!");});
		}
	},
	
	onScanStartSuccess: function(list){
		//alert(list)
	},	
	
	onScanStopSuccess: function(result){
		alert(result.mes);
	},	
	
	onGeneralSuccess: function(result){
		alert(result.mes);
	},
	
	deviceViewInit: function(){

		$("#connect").click(app.connectDevice);

		$("#deviceName").html(app.device.deviceName);
		$("#deviceAddress").html(app.device.deviceAddress);
		$("#deviceRSSI").html(app.device.RSSI);
         
        app.interval_rssi = window.setInterval(function() {
                                           app.device.getRSSI(app.getRSSISuccess);
                                           }, 5000);
        
		var isconnect = app.device.isConnected;

		if(isconnect){
			$("#connect_panel").hide();
			$("#disconnect_panel").show();
            
            app.showLoader("Discovering services...");
			app.device.discoverServices(function(){
                app.fillServices();},function(message){
                app.hideLoader();
                alert(message);
                });
		}
	},
	
	getRSSI : function(){
		app.device.getRSSI(app.getRSSISuccess);
	},
	
	getRSSISuccess : function(data){
        var strData = JSON.stringify(data);
        strData = strData.replace('"','');
        $("#deviceRSSI").html(strData.replace('"',''));	
	},

	connectDevice: function(){
		console.log("start connecting");
		app.showLoader("Connecting ...");
		app.device.connect(app.connectSuccess,app.connectError);
	},
    connectError: function(){
    	console.log("try again"+app.num++);
        app.hideLoader();
    },

	connectSuccess: function(message){
		sessionStorage.setItem("isConnected","YES");
		console.log("connect success");
		$("#connect_panel").fadeOut(200);
		$("#disconnect_panel").fadeIn(300);
        
        app.hideLoader();
        app.showLoader("Discovering services...");
		app.device.discoverServices(function(){
			app.fillServices();
		},function(message){
                        app.hideLoader();
                        alert(message);
        });
	},
	
	disconnectDevice: function(){
		app.device.disconnect(app.disconnectSuccess);
	},
	
	showLoader : function(message) {
		$.mobile.loading('show', {
			text: message, 
			textVisible: true, 
			theme: 'a',        
			textonly: true,   
			html: ""           
		});
	},

	hideLoader : function(){
		$.mobile.loading('hide');
	},
	
	disconnectSuccess: function(message){
		if(app.interval_rssi!=null)
        window.clearInterval(app.interval_rssi);
		$.mobile.changePage("searched.html","slideup");
		$("#connect").show();
		$("#disconnect").hide();
		$("#service_view").empty();
		sessionStorage.setItem("isConnected","NO");
        
	},
	
	fillServices: function(){
		$("#service_deviceName").html(app.device.deviceName);
		$("#service_deviceAddress").html(app.device.deviceAddress);
		var viewObj	= $("#service_view");
		viewObj.empty();
		for(var i=0; i<app.device.services.length; i++){
			var service = app.device.services[i];
			var liTplObj=$("#service_tpl").clone();
			var serviceIndex = service.index;
			$(liTplObj).attr("onclick","app.getChar('"+serviceIndex+"')");
			liTplObj.show();
			
			for(var key in service){
				if(key=="name"){
					if(service[key]=="unknown"){
						$("[dbField='"+key+"']",liTplObj).html("service"+(parseInt(serviceIndex,10)+1));
					}else{
						$("[dbField='"+key+"']",liTplObj).html(service[key]);
					}
				}else{
					$("[dbField='"+key+"']",liTplObj).html(service[key]);
				}
				
			}	

			viewObj.append(liTplObj);
		}
		app.hideLoader();
	},
	
	getChar: function(serviceIndex){
		sessionStorage.setItem("serviceIndex",serviceIndex);
		//if you only get service information, you should get discover characteristics next
		app.device.services[serviceIndex].discoverCharacteristics(function(){
			$.mobile.changePage("char_detail.html","slideup");
		},function(){
			alert("discover characteristics error!");
		});
		//$.mobile.changePage("char_detail.html","slideup");
	},
	
	charViewInit: function(){
		var serviceIndex = sessionStorage.getItem("serviceIndex");
		$("#char_deviceName").html(app.device.deviceName);
		$("#char_deviceAddress").html(app.device.deviceAddress);
		
		if(app.device.services[serviceIndex].name=="unknown"){
			$("#service_name").html("service"+(parseInt(serviceIndex,10)+1));
		}else{
			$("#service_name").html(app.device.services[serviceIndex].name);
		}
		$("#service_uuid").html(app.device.services[serviceIndex].uuid);
		
		var viewObj	= $("#char_view");
		for(var i=0; i<app.device.services[serviceIndex].characteristics.length; i++){
			var character = app.device.services[serviceIndex].characteristics[i];
			var characterIndex = character.index;
			var liTplObj=$("#char_tpl").clone();
			$(liTplObj).attr("onclick","app.optChar('"+characterIndex+"')");
			liTplObj.show();
			
			for(var key in character){
				if(key == 'property'){
					var propertyArray = character[key];
					var propertyStr = "";
					_.each(propertyArray, function(property){
						propertyStr += " "+property;
					}
				);
					$("[dbField='"+key+"']",liTplObj).html(propertyStr);
				}else if(key=="name"){
					if(character[key]=="unknown"){
						$("[dbField='"+key+"']",liTplObj).html("character"+(parseInt(characterIndex,10)+1));
					}else{
						$("[dbField='"+key+"']",liTplObj).html(character[key]);
					}
				}else{
					$("[dbField='"+key+"']",liTplObj).html(character[key]);
				}
			}	
			viewObj.append(liTplObj);
		}
	},
	
	optChar: function(index){
		sessionStorage.setItem("characterIndex",index);
		$.mobile.changePage("operate_char.html","slideup");
	},
	
	operateCharViewInit: function(){
		var serviceIndex = sessionStorage.getItem("serviceIndex");
		var characterIndex = sessionStorage.getItem("characterIndex");
		var service = app.device.services[serviceIndex];
		var character = service.characteristics[characterIndex];
		$("#deviceName").html(app.device.deviceName);
		$("#operate_char_deviceAddress").html(app.device.deviceAddress);

		if(service.name=="unknown"){
			$("#operate_service_name").html("service"+(parseInt(serviceIndex,10)+1));
		}else{
			$("#operate_service_name").html(service.name);
		}

		$("#operate_service_uuid").html(service.uuid);

		if(character.name=="unknown"){
			$("#operate_char_name").html("character"+(parseInt(characterIndex,10)+1));
		}else{
			$("#operate_char_name").html(character.name);
		}
		
		$("#operate_char_uuid").html(character.uuid);
		
		character.discoverDescriptors(function(){
			var viewObj	= $("#des_list_view");
			var descriptors = character.descriptors;
			viewObj.empty();
			var des_length = descriptors.length;
			var i = 0;
			
			!function outer(i){
				
				descriptors[i].read(function(data){
					var liTplObj=$("#des_tpl").clone();
					liTplObj.show();
					
					for(var key in descriptors[i]){
						if(key=="name"){
							if(descriptors[i][key]=="unknown"){
								$("[dbField='"+key+"']",liTplObj).html("descriptor"+(i+1));
							}else{
								$("[dbField='"+key+"']",liTplObj).html(descriptors[i][key]);
							}
						}else{
							$("[dbField='"+key+"']",liTplObj).html(descriptors[i][key]);
						}
						
					}	
					
					$("[dbField='value_hex']",liTplObj).html(data.value.getHexString());
					$("[dbField='value_ascii']",liTplObj).html(data.value.getASCIIString());
					$("[dbField='value_unicode']",liTplObj).html(data.value.getUnicodeString());
					viewObj.append(liTplObj);
						
					//if read descriptors complete
					if(i !== descriptors.length - 1){
						outer(++i);
					}
				});
			}(i)
		},function(){
			alert("get descriptors error!");
		});
        
        if(character.property.contains("read")){
            $("#readView").show();
            $("#readBtn").show().click(function(){
                character.read(function(chardata){
                    $("#readValue_hex").html(chardata.value.getHexString());
                    $("#readValue_ascii").html(chardata.value.getASCIIString());
                    $("#readValue_unicode").html(chardata.value.getUnicodeString());
                    $("#readDate").html(chardata.date);
                },app.onGeneralError);
             });
        }
        
        if(character.property.contains("write") || character.property.contains("writeWithoutResponse")){
            $("#writeView").show();
            $("#writeOK").click(function(){
				var type = $('#writeView .btnAfter').html();
				character.write(type,$('#writeValue').val(),app.writeCharSuccess,app.onGeneralError);
            });
            
            $("#writeClear").click(function(){
                $('#writeValue').val('');
            });
        }
        
        if(character.property.contains("notify")){
            $("#notifyView").show();
            $("#subscribe").click(function(){
                character.subscribe(function(data){
                    $("#notifyValue_hex").html(data.value.getHexString());
                    $("#notifyValue_unicode").html(data.value.getUnicodeString());
                    $("#notifyValue_ascii").html(data.value.getASCIIString());
                    $("#notifyDate").html(data.date);
                });
            });
            $("#unsubscribe").click(function(){character.unsubscribe(function(){alert("unsubscribe success!");})});
        }
	},

	 onGeneralError: function(message){
		alert(message.mes);
	},

	// readCharSuccess: function(data){
	// 	alert("Read Content(HEX):"+data.value.getHexString()+"\nRead Content(ACSII):"+data.value.getASCIIString()+"\nRead Content(Unicode):"+data.value.getUnicodeString()+"\nRead Time:"+data.date);
	// },
	
	writeCharSuccess: function(message){
		alert("write success! message is:"+JSON.stringify(message));
	},

	onSubscribeStateChange : function(arg){
		var service = BC.bluetooth.services[arg.uniqueID];
		var character = service.characteristics[arg.characteristicIndex];
		if(character.isSubscribed){
			var data = new Uint8Array(128);
			for (var i = 0; i < 128; i++) {
				data[i] = '2';
			}
			window.setTimeout(function(){
				interval_notify_index = window.setInterval(function() {
					character.notify('raw',data,function(){alert("notify success!")},function(){alert("notify error!")});
				}, 5000);
			},2000);
		}else{
			window.clearInterval(interval_notify_index);
			alert("stop notify success!");
		}
	},
	
	onCharacteristicRead : function(arg){
		alert(JSON.stringify(arg));
	},
	
	onCharacteristicWrite : function(arg){
		alert(JSON.stringify(arg));
	},
	
	onDescriptorRead : function(arg){
		alert(JSON.stringify(arg));
	},
	
	ondescriptorwrite : function(arg){
		alert(JSON.stringify(arg));
	},
	
	seeAdvData: function(){
		var device = BC.bluetooth.devices[app.device.deviceAddress];
		//alert(device.advertisementData.manufacturerData);
		alert(JSON.stringify(device.advertisementData));
		if(device.advertisementData.manufacturerData){
			alert("ManufacturerData(Hex):"+app.device.advertisementData.manufacturerData.getHexString()+"\n"+
			  "ManufacturerData(ASCII):"+app.device.advertisementData.manufacturerData.getASCIIString()+"\n"+
			  "ManufacturerData(Unicode):"+app.device.advertisementData.manufacturerData.getUnicodeString());
		}
	},
	
	createService : function(){
		var service = new BC.Service({"uuid":"ffe0"});
		var property = ["read","write","notify"];
		var permission = ["read","write"];
		var character1 = new BC.Characteristic({uuid:"ffe1",value:"01",type:"Hex",property:property,permission:permission});
		character1.addEventListener("onsubscribestatechange",function(s){alert("onsubscribestatechange : (" + s.uuid + ") state:" + s.isSubscribed);});
		character1.addEventListener("oncharacteristicread",function(s){alert("oncharacteristicread : (" + s.uuid + ")");});
		character1.addEventListener("oncharacteristicwrite",function(s){alert("oncharacteristicwrite : (" + s.uuid + ") writeValue:" + s.writeValue.getHexString());});
		var character2 = new BC.Characteristic({uuid:"ffe2",value:"00",type:"Hex",property:property,permission:permission});
		var descriptor1 = new BC.Descriptor({uuid:"2901",value:"00",type:"Hex",permission:permission});
		descriptor1.addEventListener("ondescriptorread",function(s){alert("ondescriptorread : " + s.uuid);});
		descriptor1.addEventListener("ondescriptorwrite",function(s){alert("ondescriptorwrite : " + s.uuid);});
		var descriptor2 = new BC.Descriptor({uuid:"2902",value:"08",type:"Hex",permission:permission});
		character1.addDescriptor(descriptor1);
		character1.addDescriptor(descriptor2);
		service.addCharacteristic(character1);
		service.addCharacteristic(character2);
		//the service will add into BC.bluetooth.services. Just like BC.bluetooth.devices
		BC.Bluetooth.AddService(service,app.addServiceSusscess,app.addServiceError);
		serviceUniqueID = service.uniqueID;
	},
	
	addServiceSusscess : function(){
		alert("add service success!");
	},

	addServiceError : function(){
		alert("add service error!");
	},
	
	removeServiceSuccess : function(){
		alert("remove service success!");
	},
	
	removeServiceError : function(){
		alert("remove service error!");
	},
	
	removeService : function(){
		BC.Bluetooth.RemoveService(BC.bluetooth.services[serviceUniqueID],app.removeServiceSuccess,app.removeServiceError);
	},
	
	getPairedDevice : function(){
		BC.Bluetooth.GetPairedDevices(function(mes){alert(JSON.stringify(mes));},function(mes){alert(JSON.stringify(mes));});
	},
	
	getConnectedDevice : function(){
		BC.Bluetooth.GetConnectedDevices(function(mes){alert(JSON.stringify(mes));},function(mes){alert(JSON.stringify(mes));});
	},
	
	createPair : function(){
		app.device.createPair(function(mes){},function(mes){});
	},
	
	removePair : function(){
		app.device.removePair(function(mes){},function(mes){});
	},
	
	getDeviceInfo : function(){
		app.device.getDeviceInfo(app.getdeviceAddressSuccess,app.getdeviceAddressError);
	},
	
	getdeviceAddressSuccess : function(){
		alert("System ID:"+app.device.systemID.getHexString()+"\n"+
			  "Model Number:"+app.device.modelNum.getASCIIString()+"\n"+
			  "Serial Number:"+app.device.serialNum.getASCIIString()+"\n"+
			  "Firmware Revision:"+app.device.firmwareRevision.getASCIIString()+"\n"+
			  "Hardware Revision:"+app.device.hardwareRevision.getASCIIString()+"\n"+
			  "Software Revision:"+app.device.softwareRevision.getASCIIString()+"\n"+
			  "Manufacturer Name:"+app.device.manufacturerName.getASCIIString());
	},
	
	getdeviceAddressError : function(){
		alert("get device ID (profile) error!");
	},
};
