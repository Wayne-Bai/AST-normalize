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
document.addEventListener('deviceready',function(){
	cordova.define("org.bluetooth.service.serial_port", function(require, exports, module) {		
		
		var BC = require("org.bcsphere.bcjs");
		
		var SerialPortService = BC.SerialPortService = BC.Service.extend({
			
			readCharacterUUID : "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
			writeCharacterUUID : "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
			
			read : function(successFunc,errorFunc){
				this.discoverCharacteristics(function(){
					this.getCharacteristicByUUID(this.readCharacterUUID)[0].read(function(data){
						 callback(data.value);
					});
				});
			},
			
			write : function(writeType,writeValue,successFunc,errorFunc){
				this.discoverCharacteristics(function(){
					this.getCharacteristicByUUID(this.writeCharacterUUID)[0].write(writeType,writeValue,successFunc,errorFunc);
				});
			},
			
			subscribe : function(callback){
				this.discoverCharacteristics(function(){
					this.getCharacteristicByUUID(this.readCharacterUUID)[0].subscribe(callback);
				});
			},
			
			unsubscribe : function(){
				this.discoverCharacteristics(function(){
					this.getCharacteristicByUUID(this.readCharacterUUID)[0].unsubscribe();
				});
			}, 
		});
		
		document.addEventListener('bccoreready',function(){
			BC.bluetooth.UUIDMap["6E400001-B5A3-F393-E0A9-E50E24DCCA9E"] = BC.SerialPortService;
		});
		module.exports = BC;
	});
},false);