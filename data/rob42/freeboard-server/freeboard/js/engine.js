/*
 * Copyright 2012,2013 Robert Huitema robert@42.co.nz
 * 
 * This file is part of FreeBoard. (http://www.42.co.nz/freeboard)
 *
 *  FreeBoard is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  FreeBoard is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with FreeBoard.  If not, see <http://www.gnu.org/licenses/>.
 */
//var  radialWindTrue, radialWindDirTrue


/*
 * // Fuel gauge constants
	public static final String FUEL_REMAINING = "FFV";
	public static final String FUEL_USED = "FFU";
	public static final String FUEL_USE_RATE = "FFR";

	public static final String ENGINE_RPM = "RPM";
	public static final String ENGINE_HOURS = "EHH";
	public static final String ENGINE_MINUTES = "EMM";
	public static final String ENGINE_TEMP = "ETT";
	public static final String ENGINE_VOLTS = "EVV";
	public static final String ENGINE_OIL_PRESSURE = "EPP";
	public static final String DEPTH_BELOW_TRANSDUCER = "DBT";
 */

function Engine () {
	this.onmessage = function (navObj) {
		
			//avoid commands
			if (!navObj)
				return true;
			//FUEL_REMAINING
			if (navObj.FFV) {
					radialFuel.setValue(navObj.FFV);
			}
			//depth
			if (navObj.DPT) {
					linearDepth.setValue(navObj.DPT);
			}
			//speed
			if (navObj.SOG) {
					radialBoatSpeed.setValue(navObj.SOG);
			}
			//rpm
			if (navObj.RPM) {
					radialEngineRpm.setValue(navObj.RPM);
			}
			//temp
			if (navObj.ETT) {
					radialTemp.setValue(navObj.ETT);
			}
			//volts
			if (navObj.EVV) {
					radialVolts.setValue(navObj.EVV);
			}
			//pressure
			if (navObj.EPP) {
					radialOil.setValue(navObj.EPP);
			}
			
			//trim
			if (navObj.EDT) {
					radialTrim.setValue(navObj.EDT);
			}
			
		
	};
	
}

//setup gauge scales here
var maxRpm = 6000;
var redLineRpm = 5000;
var maxBoatSpeed = 60;

var maxOilPsi = 120;
var oilPsiFullScale = 160;
var minOilPsi = 40;

var minTemp = 90;
var maxTemp = 250;
var tempFullScale = 300;

var maxVolts = 14.4;
var minVolts = 11.0;
var voltsFullScale = 16.0;
var voltsMinScale = 10.0;

var maxFuel = 400;
var minFuel = 50;
//colours
var gaugeLcdColor = steelseries.LcdColor.BEIGE;
//TILTED_BLACK
var gaugePointerType = steelseries.PointerType.TYPE4;
var gaugeBackgroundColor = steelseries.BackgroundColor.CARBON;
var gaugeFrameDesign = steelseries.FrameDesign.BLACK_METAL;

function initEngine() {
	// Define some sections for gauges

	var redLine = [ steelseries.Section(redLineRpm, maxRpm, 'rgba(220, 0, 0, 0.3)')];
	
	// Initialzing gauges
	//get the smallest distance
	var vpSize=Math.min(window.innerHeight,window.innerWidth);
	//engine rpm
	radialEngineRpm = new steelseries.Radial('canvasEngineRpm', {
		gaugeType : steelseries.GaugeType.TYPE4,
		//size : document.getElementById('canvasEngineRpm').width,
		size: vpSize*.6,
		minValue : 0,
		maxValue : maxRpm,
		threshold : redLineRpm,
		//section : sections,
		area: redLine,
		titleString : "RPM",
		unitString : "rpm",
		lcdVisible : true,
		lcdColor: gaugeLcdColor,
		pointerType : gaugePointerType,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});
	
	// Depth dir
	linearDepth = new steelseries.Linear('canvasDepth', {
		//size : document.getElementById('canvasDepth').width,
		width: vpSize*.3,
		height: vpSize*.6,
		titleString : "Depth",
		maxValue : 60,
		lcdVisible : true,
		lcdColor: gaugeLcdColor,
		//pointerTypeLatest : gaugePointerType,
		//pointerTypeAverage : steelseries.PointerType.TYPE1,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});
	// wind dir
	radialBoatSpeed = new steelseries.Radial('canvasBoatSpeed', {
		gaugeType : steelseries.GaugeType.TYPE4,
		size : vpSize*.6,
		titleString : "SPEED",
		maxValue : maxBoatSpeed,
		lcdVisible : true,
		lcdColor: gaugeLcdColor,
		pointerType: gaugePointerType,
		//pointerTypeAverage : steelseries.PointerType.TYPE1,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});
	
	// oil
	var oilSections = [ steelseries.Section(0, minOilPsi, 'rgba(0, 0, 220, 0.3)'),
		     			steelseries.Section(minOilPsi, maxOilPsi, 'rgba(0, 220, 0, 0.3)'),
		     			steelseries.Section(maxOilPsi, oilPsiFullScale, 'rgba(220,0, 0, 0.3)') ];
	radialOil = new steelseries.RadialVertical('canvasOil', {
		gaugeType : steelseries.GaugeType.TYPE4,
		size : vpSize/7,
		maxValue : oilPsiFullScale,
		//threshold : OilPsi,
		section : oilSections,
		titleString : "OIL",
		unitString : "psi",
		lcdVisible : true,
		lcdColor: gaugeLcdColor,
		pointerType : gaugePointerType,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});

	
	// temp
	var tempSections = [ steelseries.Section(0, minTemp, 'rgba(0, 0, 220, 0.3)'),
		     			steelseries.Section(minTemp, maxTemp, 'rgba(0, 220, 0, 0.3)'),
		     			steelseries.Section(maxTemp, tempFullScale, 'rgba(220,0, 0, 0.3)') ];
	radialTemp = new steelseries.RadialVertical('canvasTemp', {
		gaugeType : steelseries.GaugeType.TYPE4,
		size : vpSize/7,
		maxValue : tempFullScale,
		//threshold : 300,
		section : tempSections,
		titleString : "Temp",
		unitString : "deg C",
		lcdVisible : true,
		lcdColor: gaugeLcdColor,
		pointerType : gaugePointerType,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});
	
	
	// volts
	var voltsSections = [ steelseries.Section(voltsMinScale, minVolts, 'rgba(0, 0, 220, 0.3)'),
		steelseries.Section(minVolts, maxVolts, 'rgba(0, 220, 0, 0.3)'),
			steelseries.Section(maxVolts, voltsFullScale, 'rgba(220,0, 0, 0.3)') ];
	radialVolts = new steelseries.RadialVertical('canvasVolts', {
		gaugeType : steelseries.GaugeType.TYPE4,
		size : vpSize/7,
		minValue : voltsMinScale,
		maxValue : voltsFullScale,
		//threshold : 13.0,
		section : voltsSections,
		titleString : "Volts",
		unitString : "V",
		lcdVisible : true,
		lcdColor: gaugeLcdColor,
		pointerType : gaugePointerType,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});
	
	// wind true
	radialTrim = new steelseries.RadialVertical('canvasTrim', {
		gaugeType : steelseries.GaugeType.TYPE4,
		size : vpSize/7,
		minValue : 0,
		maxValue : 1000,
		//threshold : 300,
		//section : sections,
		titleString : "Trim",
		unitString : "",
		lcdVisible : false,
		orientation: steelseries.Orientation.WEST,
		lcdColor: gaugeLcdColor,
		pointerType : gaugePointerType,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});
	// Fuel true
	
	var fuelSections = [ steelseries.Section(0, minFuel, 'rgba(220, 0, 0, 0.3)'),
	     			steelseries.Section(minFuel, maxFuel, 'rgba(0, 220, 0, 0.3)') ];
	radialFuel = new steelseries.RadialVertical('canvasFuel', {
		gaugeType : steelseries.GaugeType.TYPE4,
		size : vpSize/7,
		minValue : 0,
		maxValue : maxFuel,
		//threshold : 300,
		section : fuelSections,
		titleString : "Fuel",
		unitString : "litres",
		lcdVisible : false,
		lcdColor: gaugeLcdColor,
		pointerType : gaugePointerType,
		backgroundColor: gaugeBackgroundColor,
		frameDesign: gaugeFrameDesign,
	});
	// make a web socket
	
	addSocketListener(new Engine());
}
