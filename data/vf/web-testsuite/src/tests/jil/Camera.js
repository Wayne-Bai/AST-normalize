/*
	Copyright 2010-2011 Vodafone Group Services GmbH
	
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
(function(){
	var w = util.isObject("Widget") ? Widget : {};
	var wmc = util.isObject("Widget.Multimedia.Camera") ? Widget.Multimedia.Camera : {};
	var wd = util.isObject("Widget.Device") ? Widget.Device : {};
	
	// Create a unique filename, so we dont have to rely on deleteFile() to work
	// and filenames dont clash with old tests. When using be sure to add some suffix,
	// like imgFile+"-wtf.jpg"
	var imgFile = "/virtual/photos/test-camera-" + new Date().getTime();
	
	function _setUpDiv(){
		dohx.showInfo('<div id="_cameraWindow_" type="video-camera/3gp" width="320" height="240"></div>');
		wmc.setWindow(util.byId("_cameraWindow_"));
	};
	function _setUpObject(){
		dohx.showInfo('<object id="_cameraWindow_" type="video-camera/3gp" width="320" height="240" />');
		wmc.setWindow(util.byId("_cameraWindow_"));
	};
	function _setUpFullscreen(){
		dohx.showInfo('<object id="_cameraWindow_" type="video-camera/3gp" width="320" height="240" />');
		wmc.setWindow(util.byId("_cameraWindow_"));
	};
	function _tearDown(){
		wmc.setWindow(null);
		wmc.onCameraCaptured = null;
	};
	function _deleteCallback(){
		wmc.onCameraCaptured = null;
	};
	
	dohx.add({name:"Camera",
		mqcExecutionOrderBaseOffset:130000, // This number is the base offset for the execution order, the test ID gets added. Never change this number unless you know what you are doing.
		requiredObjects:["Widget.Multimedia.Camera"],
		tests:[
			//
			// captureImage() - basics
			//
			{
				id:100,
				name:"onCameraCaptured - Callback 'onCameraCaptured' triggered?",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				timeout:20*1000, // User may has to confirm security dialog.
				test:function(t){
					wmc.onCameraCaptured = function(fileName){
						t.success("OK, file saved at "+fileName+".");
					}
					wmc.captureImage(imgFile+"-callback.jpg", true);
				},
				tearDown:_deleteCallback
			},
			{
				id:200,
				name:"captureImage - Creates a file?",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				timeout:30*1000, // User may has to confirm security dialog.
				test:function(t){
					// We ONLY use destFile in this test and not the fileName given to the callback,
					// to not fail if the runtime passes in the wrong parameter (which opera currently does).
					var destFile = imgFile+"-creates-file.jpg";
					wmc.onCameraCaptured = function(fileName){
						try {
							var f = Widget.Device.getFile(destFile);
						}catch(e){
							t.failure("Excpetion getFile('"+destFile+"')." + e);
						}
						t.assertTrue(typeof f.fileSize!="undefined" && f.fileSize>0, "Filesize expected to be >0, but is: " + f.fileSize);
						t.result = embed.toJson(f);
					}
					wmc.captureImage(destFile, true);
				},
				tearDown:_deleteCallback
			},
			{
				id:300,
addIf:false,
				name:"Error during capture should pass 'undefined' to onCameraCaptured.",
				test:function(t){
// TODO verify this form the spec "If�there�is�an�error�during�capture,� onCameraCaptured�will�be�called�with�an�undefined�parameter.�"
					t.failure("Test not yet implemented.");
				}
			},
			{
				id:400,
				name:"captureImage - Does callback pass the same filename as passed to captureImage()?",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				timeout:30*1000, // User may has to confirm security dialog.
				test:function(t){
					var expectedFilename = imgFile+"-proper-filename.jpg";
					wmc.onCameraCaptured = function(fileName){
						t.assertEqual(expectedFilename, fileName);
						t.result = fileName;
					}
					wmc.captureImage(expectedFilename, true);
				},
				tearDown:_deleteCallback
			},
			{
				id:410,
				name:"captureImage - Is filename returned by captureImage() same as parameter passed in?",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				test:function(t){
					var myFileName = imgFile+"-retval1.jpg";
					var retVal = "";
					wmc.onCameraCaptured = function(fileName){
						// Let's just make sure we wait for the callback to be fired, to cleanly finish this test!
						t.assertEqual(myFileName, retVal);
					};
					retVal = wmc.captureImage(myFileName, true);
				},
				tearDown:_deleteCallback
			},
			{
				id:500,
				name:"Invalid destination path - throw INVALID_PARAMETER.",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				test:function(t){
					try{
						wmc.captureImage("/root/INVALIDDIR/1.jpg", true);
					}catch(e){
						t.assertJilException(e, w.ExceptionTypes.INVALID_PARAMETER);
						return e;
					}
				},
				tearDown:_deleteCallback
			},
			//
			//	captureImage() lowRes
			//
// 1) verify resulting file name is the same as passed in
// 2) verify that loRes and hiRes files are different size
// 3) show filename and let user open the pic in the picture viewer to verify its the pic he has expected
			{
				id:600,
				name:"captureImage, lowRes - takes a picture at all?",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				instructions:[
					"Click 'GO'.",
					"The picture will be taken.",
					"This picture will be opened in the gallery app."
				],
				expectedResult:"Can you verify the taken picture is the one you expected?",
				timeout:10*1000, // User may has to confirm security dialog.
				test:function(t){
					wmc.onCameraCaptured = function(fileName){
						dohx.showInfo('<img src="file://'+imgFile+'-lowRes.jpg" />'+
										'<br />' + imgFile+"-lowRes.jpg"
									  //'<br />'+fileName+
									  //'<img src="'+fileName+'" />'
									  );
						// Let's just start the pics app, maybe it works ... 
						wd.launchApplication(wd.ApplicationTypes.PICTURES, fileName);
					}
					wmc.captureImage(imgFile+"-lowRes.jpg", true);
				},
				tearDown:_deleteCallback
			},
			{
				id:700,
				name:"captureImage, lowRes - verify the stored file",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000, // User may has to confirm security dialog.
				test:function(t){
					var fileName = imgFile+"-lowRes-verify.jpg";
					wmc.onCameraCaptured = function(){
						try {
							var f = Widget.Device.getFile(fileName);
						}catch(e){
							t.failure("Excpetion getFile('"+fileName+"')." + e);
						}
						t.assertTrue(fileName.indexOf(f.fileName)!=-1, "Expected to find '"+fileName+"' but got path:'"+f.filePath+"' file:'"+f.fileName+"'");
						t.result = fileName;
					}
					wmc.captureImage(fileName, true);
				},
				tearDown:_deleteCallback
			},
			//
			//	captureImage() hiRes
			//
			{
				id:800,
				name:"captureImage, hiRes - verify the stored file",
				requiredObjects:["Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000, // User may has to confirm security dialog.
				test:function(t){
					var fileName = imgFile+"-hiRes-verify.jpg";
					wmc.onCameraCaptured = function(){
						try {
							var f = Widget.Device.getFile(fileName);
						}catch(e){
							t.failure("Excpetion getFile('"+fileName+"')." + e);
						}
						t.assertTrue(fileName.indexOf(f.fileName)!=-1, "Expected to find '"+fileName+"' but got path:'"+f.filePath+"' file:'"+f.fileName+"'");
						t.result = fileName;
					}
					wmc.captureImage(fileName, false);
				},
				tearDown:_deleteCallback
			},
			
			//
			//	Test setWindow() with different preview sizes
			//
			{
				id:900,
				name:"setWindow - Using &lt;object&gt; with 160x120",
				requiredObjects:["Widget.Multimedia.Camera.setWindow", "Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000,
				setUp:function(){
					dohx.showInfo('<object id="_cameraWindow_" type="video-camera/3gp" width="160" height="120" />');
					wmc.setWindow(util.byId("_cameraWindow_"));
				},
				expectedResult:"Do you see a downscaled preview of the camera image?",
				test:function(t){
					wmc.onCameraCaptured = function(){
						t.success("Callback 'onCameraCaptured' fired.");
					}
					wmc.captureImage(imgFile + "-setWindow-" + new Date().getTime() + ".jpg", true);
				},
				tearDown:_tearDown
			},
			{
				id:1000,
				name:"setWindow - Using &lt;object&gt; with 200x200",
				requiredObjects:["Widget.Multimedia.Camera.setWindow", "Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000,
				setUp:function(){
					dohx.showInfo('<object id="_cameraWindow_" type="video-camera/3gp" width="200" height="200" />');
					wmc.setWindow(util.byId("_cameraWindow_"));
				},
				expectedResult:"Do you see a downscaled preview of the camera image?",
				test:function(t){
					wmc.onCameraCaptured = function(){
						t.success("Callback 'onCameraCaptured' fired.");
					}
					wmc.captureImage(imgFile + "-setWindow-" + new Date().getTime() + ".jpg", true);
				},
				tearDown:_tearDown
			},
			{
				id:1100,
				name:"setWindow - Using &lt;div&gt; with 200x200",
				requiredObjects:["Widget.Multimedia.Camera.setWindow", "Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000,
				setUp:function(){
					dohx.showInfo('<div id="_cameraWindow_" type="video-camera/3gp" style="width:200px; height:200px;"></div>');
					wmc.setWindow(util.byId("_cameraWindow_"));
				},
				expectedResult:"Do you see a downscaled preview of the camera image?",
				test:function(t){
					wmc.onCameraCaptured = function(){
						t.success("Callback 'onCameraCaptured' fired.");
					}
					wmc.captureImage(imgFile + "-setWindow-" + new Date().getTime() + ".jpg", true);
				},
				tearDown:_tearDown
			},
			{
				id:1200,
				name:"setWindow - Using &lt;object&gt; fullscreen",
				requiredObjects:["Widget.Multimedia.Camera.setWindow", "Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000,
				setUp:function(){
					var node = document.createElement("object");
					var values = {id:"_cameraWindow_", type:"video-camera/3gp", height:"95%", width:"95%"}
					for (var key in values) node[key] = values[key];
					var styleValues = {position:"absolute", top:"2px", left:"2px", border:"2px solid red", zIndex:"100"};
					for (var key in styleValues) node.style[key] = styleValues[key];
					document.body.appendChild(node);
					wmc.setWindow(node);
				},
				expectedResult:"Did you see a fullscreen preview of the camera image?",
				test:function(t){
					wmc.onCameraCaptured = function(){
						// Hide the preview node, which filled the entire screen, to let user confirm result.
						setTimeout(function(){
							wmc.setWindow(null);
							var node = util.byId("_cameraWindow_");
							node.parentNode.removeChild(node);
						}, 5000);
					}
					wmc.captureImage(imgFile + "-fullscreen-" + new Date().getTime() + ".jpg", true);
				},
				tearDown:_tearDown
			},
			{
				id:1300,
addIf:false, // I dont know right now how to add a div with: type:"video-camera/3gp" ... maybe only object makes sense???
				name:"setWindow - Using &lt;div&gt; fullscreen",
				requiredObjects:["Widget.Multimedia.Camera.setWindow", "Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000,
				expectedResult:"Do you see a fullscreen preview of the camera image?",
				setUp:function(){
					var node = document.createElement("div");
					var values = {id:"_cameraWindow_", height:"95%", width:"95%"}
					for (var key in values) node[key] = values[key];
					var styleValues = {position:"absolute", top:"2px", left:"2px", border:"2px solid red", zIndex:"100"};
					for (var key in styleValues) node.style[key] = styleValues[key];
					document.body.appendChild(node);
					wmc.setWindow(node);
				},
				test:function(t){
					wmc.onCameraCaptured = function(){
						// Hide the preview node, which filled the entire screen, to let user confirm result.
						setTimeout(function(){
							util.style("_cameraWindow_", "display", "none");
						}, 5000);
					}
					wmc.captureImage(imgFile + "-fullscreen1-" + new Date().getTime() + ".jpg", true);
				},
				tearDown:_tearDown
			},
			{
				// Spec page 118. Camera.setWindow
				// Passing a null value will disassociate the  
				// preview window from the HTML; widget developers should do this in order to free  
				// resources and restore the display when previewing is no longer required.
				id:1400,
				name:"setWindow - Disassociate preview window: setWindow(null).",
				requiredObjects:["Widget.Multimedia.Camera.setWindow", "Widget.Multimedia.Camera.captureImage"],
				timeout:10*1000,
				setUp:_setUpDiv,
				expectedResult:"Did the preview window disappear after about 5 seconds?",
				test:function(t){
					setTimeout(function(){
						wmc.setWindow(null);
					}, 5000);
				},
				tearDown:_tearDown
			}
//*/
		]
	});
})()

