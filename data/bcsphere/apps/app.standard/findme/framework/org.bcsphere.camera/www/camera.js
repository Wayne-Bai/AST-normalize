document.addEventListener("deviceready",function(){
	cordova.define("org.bcsphere.camera.camera", function(require, exports, module) {
	/*
	 *
	 * Licensed to the Apache Software Foundation (ASF) under one
	 * or more contributor license agreements.  See the NOTICE file
	 * distributed with this work for additional information
	 * regarding copyright ownership.  The ASF licenses this file
	 * to you under the Apache License, Version 2.0 (the
	 * "License"); you may not use this file except in compliance
	 * with the License.  You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	 * KIND, either express or implied.  See the License for the
	 * specific language governing permissions and limitations
	 * under the License.
	 *
	*/

	var exec = require('cordova/exec');
	var platform = require('cordova/platform');
	var interval_index = null;

	/**
	 * Provides access to bluetooth on the device.
	 */
	var camera = {
		
		takePicture : function(success,error,model){
			exec(success,error,"BCCamera", "takePicture",[{'model':model}]);
		},

		onCameraClose: function(success,error){
			exec(success,error,"BCCamera", "onCameraClose",[]);
		},
	};
	module.exports = camera;
	});
});
