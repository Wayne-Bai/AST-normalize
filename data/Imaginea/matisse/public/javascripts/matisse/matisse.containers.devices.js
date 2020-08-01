/**
 * User: Bhavani Shankar
 * Date: 12/28/11
 * Time: 11:16 AM
 * About this : Registers device containers like iPad, Ipad, Desktop etc.
 */

require(["matisse", "matisse.main", "matisse.containers", "matisse.palettes.properties", "matisse.util"], function (matisse, main, containers, objproperties, util) {
	"use strict";
	containers.registercontainer('desktop-1024x768' , {
			 	displayName: "desktop-1024x768",
				src: "",
				width: 1024, 
				height: 768,
				innerWidth:1024,
				innerHeight:768,
				xOffset: 0,
				yOffset: 0,
				canvasWidth: 1024,
				canvasHeight: 768
			});
	containers.registercontainer('desktop-1280x1024' , {
			 	displayName: "desktop-1280x1024",
				src: "",
				width: 1280,
				height: 1024,
				innerWidth:1280,
				innerHeight:1024,
				xOffset: 0,
				yOffset: 0,
				canvasWidth: 1280,
				canvasHeight: 1024
			});		
	containers.registercontainer( 'iphone' , {
			 	displayName: "iPhone",
				src: "iphone_overlay.png",
				width: 420, // Width of the device
				height: 740, // Height of the device
				innerWidth:330, // Available width for the this device(white space)
				innerHeight:500, // Available height for the this device(white space)
				xOffset: 53, // left offset to start canvas from
				yOffset: 134, // right offset to start canvas from
				canvasWidth: 330, // canvas width -can be more than available device witdth
				canvasHeight: 800, // canvas height -can be more than available device height
				viewportX: 52,
				viewportY:135
			});
	containers.registercontainer( 'ipad' , {		
				displayName: "iPad",
				src: "ipad_overlay.png",
				width: 564,
				height: 723,
				innerWidth:467,
				innerHeight:606,
				xOffset: 60,
				yOffset: 70,
				canvasWidth: 467,
				canvasHeight: 606,
				viewportX: 60,
				viewportY:70
			});
	containers.registercontainer( 'blackberry' , {		
				displayName: "BlackBerry",
				src: "BlackBerry.png",
				width: 396,
				height: 700,
				innerWidth:327,
				innerHeight:247,
				xOffset: 32,
				yOffset: 125,
				canvasWidth: 327,
				canvasHeight: 247,
				viewportX: 32,
				viewportY:125
			});	
	containers.registercontainer( 'browser' , {		
				displayName: "Browser",
				src: "browser_container.png",
				width: 1050,
				height: 752,
				innerWidth:1040,
				innerHeight:670,
				xOffset: 5,
				yOffset: 80,
				canvasWidth: 1040,
				canvasHeight: 670,
				viewportX: 8,
				viewportY:81
			});				
});