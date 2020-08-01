var createColorBox = (function (){
	var ColorPicker = (function () {
		"use strict";
		var useHex = true;
		/////////////////////////////////////////////////////////////////////
		//                                                                 //
		// this chank of code is for ie9                                   //
		// you can not include this chank if you are not tageting ie9      //
		// it is also works in all browsers that support svg img url       //
		//                                                                 //
		/////////////////////////////////////////////////////////////////////
		
		'use strict';
		var ieG = (function (dir, stops) {
			//{offset:'0%',color:'black', opacity:'1'}
			var grd = {
				open:'<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.0" width="100%" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>',
				close:'</linearGradient></defs><rect width="100%" height="100%" style="fill:url(#g);" /></svg>',
				dirs : {
					left: 'x1="0%" y1="0%" x2="100%" y2="0%"',
					right: 'x1="100%" y1="0%" x2="0%" y2="0%"',
					top: 'x1="0%" y1="0%" x2="0%" y2="100%"',
					bottom: 'x1="0%" y1="100%" x2="0%" y2="0%"'
				}
			};
			return function(dir, stops){
				var r = '<linearGradient id="g" '+ grd.dirs[dir] +' spreadMethod="pad">';
				stops.forEach(function(stop) {
					r += '<stop offset="'+stop.offset+'" stop-color="'+stop.color+'" stop-opacity="'+stop.opacity+'"/>';
				});
				r = 'data:image/svg+xml;base64,' + btoa(grd.open + r + grd.close);
				return r;
			};
		})();
		
		//atob btoa polyfill
		;(function () {
			var
			object = typeof window != 'undefined' ? window : exports,
			chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
			INVALID_CHARACTER_ERR = (function () {
				// fabricate a suitable error object
				try {
					document.createElement('$');
				} catch (error) {
					return error;
				}
			}());

			object.btoa || (
				object.btoa = function (input) {
				for (
					// initialize result and counter
					var block, charCode, idx = 0, map = chars, output = '';
					// if the next input index does not exist:
					//   change the mapping table to "="
					//   check if d has no fractional digits
					input.charAt(idx | 0) || (map = '=', idx % 1);
					// "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
					output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
					charCode = input.charCodeAt(idx += 3 / 4);
					if (charCode > 0xFF)
						throw INVALID_CHARACTER_ERR;
					block = block << 8 | charCode;
				}
				return output;
			});

			object.atob || (
				object.atob = function (input) {
				input = input.replace(/=+$/, '')
					if (input.length % 4 == 1)
						throw INVALID_CHARACTER_ERR;
					for (
						// initialize result and counters
						var bc = 0, bs, buffer, idx = 0, output = '';
						// get next character
						buffer = input.charAt(idx++);
						// character found in table? initialize bit storage and add its ascii value;
						~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
							// and if not first of each 4 characters,
							// convert the first 8 bits to one ascii character
							bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
						// try to find character in table (0-63, not found => -1)
						buffer = chars.indexOf(buffer);
					}
					return output;
			});
		}());
	
		var photoshopG1 = ieG('bottom',[
			{offset:'0%',color:'black', opacity:'1'},
			{offset:'100%',color:'black', opacity:'0'}
		]);
		var normalG2 = ieG('top',[
			{offset:'0%',color:'black', opacity:'1'},
			{offset:'100%',color:'white', opacity:'1'}
		]);
		var hslGrad = ieG('top',[
			{offset:'0%',color:'#FF0000', opacity:'1'},
			{offset:'16.666666666666668%',color:'#FFFF00', opacity:'1'},
			{offset:'33.333333333333336%',color:'#00FF00', opacity:'1'},
			{offset:'50%',color:'#00FFFF', opacity:'1'},
			{offset:'66.66666666666667%',color:'#0000FF', opacity:'1'},
			{offset:'83.33333333333334%',color:'#FF00FF', opacity:'1'},
			{offset:'100%',color:'#FF0000', opacity:'1'}
		]);
			//ieG=0
		//////////////////////////////////////////////////////////////////////
		/////////////////////// color convertion tolls ////////////////////////
		//////////////////////////////////////////////////////////////////////

		function rgbToHex(r, g, b) {
			return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		}

		function hexToRgba(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
			var opacity = parseInt(result[4], 16);
			opacity = isNaN(opacity) ? 1 : (opacity / 255);
			return result ? [
				parseInt(result[1], 16),
				parseInt(result[2], 16),
				parseInt(result[3], 16),
				opacity
			] : null;
		}

		function rgbToHsl(r, g, b, a){
			r /= 255, g /= 255, b /= 255;
			var max = Math.max(r, g, b), min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;

			if(max === min){
				h = s = 0; // achromatic
			}else{
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch(max){
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}
			a = isNaN(+a) ? 1 : (+a);
			return [h, s, l, a];
		}

		function hue2rgb(p, q, t){
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		function hslToRgb(h, s, l, a){
			var r, g, b;

			if(s === 0){
				r = g = b = l; // achromatic
			}else{
				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = hue2rgb(p, q, h + 1/3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1/3);
			}
			a = a === undefined ? 1 : a
			return [r * 255, g * 255, b * 255,  a];
		}

		function rgbaParts(rgba){
			var parts = rgba.match(/\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?([^)]+)?\s*/);
			if(parts){
				return parts.slice(1,5);
			}
		}

		function hslaParts(hsla){
			var parts = hsla.match(/hsla?\(([^,]+)\s*,\s*([^%]+)%\s*,\s*([^%]+)%\s*,?\s*([^)]+)?\s*/);
			if(parts){
				parts = parts.slice(1,5);
				parts[0] = parts[0]/360;
				parts[1] = parts[1]/100;
				parts[2] = parts[2]/100;
				parts[3] = isNaN(+parts[3]) ? 1 : +parts[3];
				return parts;
			}else{
				return [0,0,0,0];
			}
		}
		
		function colorToHex(color){
			var hsla = cssColorToHsl(color);
			var rgba = hslToRgb.apply(null, hsla);
			rgba[0] = rgba[0] << 0;
			rgba[1] = rgba[1] << 0;
			rgba[2] = rgba[2] << 0;
			var hex = rgbToHex.apply(null, rgba);
			return hex;			
		}
		
		function cssColorToHsl(color){
			var hsl;
			if(color.charAt(2)==='l'){
				return  hslaParts(color)
			}
			var process = rgbaParts(color);

			if(process){
				hsl = rgbToHsl.apply(null, process);
			}else{
				if(color.length === 3 || color.length === 6 && color.charAt(0) !== '#'){
					color = '#' + color;
				}
				if(color.length === 4){
					var colorPart = color.split('#').pop();
					color += colorPart;
				}
				hsl = rgbToHsl.apply(null, hexToRgba(color));
			}
			return hsl;
		}

		//////////////////////////////////////////////////////////////////////
		///////////////////////////// helpers  ///////////////////////////////
		//////////////////////////////////////////////////////////////////////

		function createColorPickerMarkup(element){
			var html = 
				'<div class="colorpicker-wrapper">' + 
					'<div class="colorpicker-pickers">'+
					  '<div class="colorpicker-lightsat-palete"></div>'+
					  '<div class="colorpicker-color-palete"></div>'+
					  '<div class="colorpicker-opacity-palete colorpicker-opacity-back" style="display:none"></div>'+
					'</div>'+
					'<div class="colorpicker-picker-inputs">'+
						'<label>H</label>'+ '<label class="deg-label">&deg;</label>'+
						'<input type="text" class="colorpicker-hue"/>'+
						'<label>S</label>'+ '<label>%</label>' +
						'<input type="text" class="colorpicker-saturation"/>'+
						'<label>L</label>'+ '<label>%</label>' +
						'<input type="text" class="colorpicker-lightness"/>'+
						'<label style="display:none">Opacity</label>'+
						'<input style="display:none" type="text" class="colorpicker-opacity"/>'+
					'</div>'+
					'<div class="colorpicker-picker-inputs-extra">' + 
						'<label>#</label>'+
						'<input type="text" class="colorpicker-color"/>'+
						'<div class="change-picker-label">Site colors</div>'+
					'</div>' + 
				'</div>'+
				'<div class="colorpicker-picker-selected">'+
				  '<div class="colorpicker-priveuse colorpicker-opacity-back"></div>'+
				  '<div class="colorpicker-current colorpicker-opacity-back"></div>' + 
				'</div>';
			if(element.className.indexOf('uilib-colorpicker') === -1){
				if(element.className.length===0){
					element.className = 'uilib-colorpicker';
				} else{
					element.className += ' uilib-colorpicker';
				}
			}
			
			element.innerHTML = html;
		}
		
		function SimpleEvents(ctx, events){
			events = events || {};
			events.call = function(eventName){
				var args = Array.prototype.slice.call(arguments,1);
				events[eventName].forEach(function(handler){
					handler.apply(ctx, args);
				});
			};
			events.on = function(eventName, handler) {
				events[eventName].push(handler);
				return function remove() {
					var i = events[eventName].indexOf(handler);
					if (~i) {
						events[eventName].splice(i, 1);
					}
				}
			};	
			return events;
		}
		
		function getOffset( el ) {
			var _x = 0;
			var _y = 0;
			while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
				_x += el.offsetLeft - el.scrollLeft;
				_y += el.offsetTop - el.scrollTop;
				el = el.offsetParent;
			}
			return { top: _y, left: _x };
		}

		function offsetPosFromEvent(e, target) {
			var offset = getOffset(target);
			var posX = (e.clientX - offset.left) / (target.clientWidth - 1);
			var posY = (e.clientY - offset.top) / (target.clientHeight - 1);
			return {
				x : Math.min(Math.max(posX,0), 1),
				y : Math.min(Math.max(posY,0), 1)
			};
		}

		function createElement(width, height, appendTo) {
			var el = document.createElement('div');
			el.style.cssText = 'width:' + width + ';height:' + height + ';';
			appendTo && appendTo.appendChild(el);
			return el;
		}	
		
		//////////////////////////////////////////////////////////////////////
		/////////////// this chank of code is the real thing /////////////////
		//////////////////////////////////////////////////////////////////////

		var paletes = {
			photoshop : {
				pickerBoxHeight: 148, //TODO get this from the style since the new popup is not in dom when calc
				setElement : function (elm, palete, initColor) {
					this.elm = elm;
					this.elm.className += ' ColorPickerPicker ColorPickerPhotoshop';
					this.posIndecator = document.createElement('div');
					this.posIndecator.style.cssText = 'position:absolute;border-radius:50%;width:9px;height:9px;background:transparent;border:2px solid #eee;pointer-events:none;position:relative;'
					this.elm.appendChild(this.posIndecator);
					this.photoshoptIEGradSetup = [{
						offset : '0%',
						color : initColor,
						opacity : '1'
					}, {
						offset : '100%',
						color : 'white',
						opacity : '1'
					}];
					this.render(initColor);
				},
				render : function (color, skipSet) {
					if (!skipSet){
						var pos = this.posFromColor(color);
						this.setPos(pos);
						var hsl = [pos.hue];
						hsl[0] *= 360;
						hsl[1] = 100+'%';
						hsl[2] = 50+'%';
						color = 'hsl(' + hsl.join() + ')';
					}

					if (ieG) {
						this.photoshoptIEGradSetup[0].color = color;
						var photoshopG2 = ieG('left', this.photoshoptIEGradSetup);
						this.elm.style.backgroundImage = 'url("' + photoshopG1 + '"),url("' + photoshopG2 + '")';
					} else {
						this.elm.style.backgroundImage = '-webkit-linear-gradient(bottom, black, rgba(0,0,0,0)),-webkit-linear-gradient(left, ' + color + ', white)';
						this.elm.style.backgroundImage = '-moz-linear-gradient(bottom, black, rgba(0,0,0,0)),-moz-linear-gradient(left, ' + color + ', white)';
					}
				},
				setPos:function(pos){
					this.pos = pos;
					setTimeout(function() {
						var h = parseFloat( getComputedStyle(this.elm).height || this.pickerBoxHeight);
						var w = parseFloat( getComputedStyle(this.elm).width ||  this.pickerBoxHeight);
						this.posIndecator.style.left = (-6) + pos.x * w  + 'px';
						this.posIndecator.style.top = (-6) + pos.y * h  + 'px';
					}.bind(this),0);
				},
				posFromColor:function(color){
					var hsla = cssColorToHsl(color);
					var x, y, t;
					x = 1 - hsla[1];
					t = ((hsla[2] * 100) + (50 * x) + 50)/50;
					y = t / (x + 1);
					y = 1 - (y-1);				
					if(y < 0){
						x -= y;
						y=0;
					}
					return {x:x,y:y,hue:hsla[0]};
				},
				colorFromPos : function (pos, paletePosY, opacity) {
					this.setPos(pos);
					var h = paletePosY * 360;
					var s = 100 - pos.x * 100;
					var l = (pos.y * -50) + (50 * pos.x) + 50 - (pos.y * pos.x * 50);
					return 'hsla(' + h + ', ' + s + '% , ' + l + '%, '+ opacity +')';
				}
			},
			////////////////////////////////////////////
			single : {
				setElement : function (elm, initColor) {
					this.elm = elm;
					this.elm.className += ' ColorPickerPicker ColorPickerSingle';
					this.render(initColor);
				},
				render : function (color) {
					this.elm.style.backgroundColor = color;
				},
				colorFromPos : function () {
					return this.elm.style.backgroundColor.replace(/\s/g,'');
				}
			},
			////////////////////////////////////////////
			palete : {
				setElement : function (elm, initColor) {
					this.elm = elm;
					this.elm.className += ' ColorPickerPicker ColorPickerPalete';
					this.elm.style.position = 'relative';
					this.posIndecator = document.createElement('div');
					this.posIndecator.style.cssText = 'position:absolute;width:19px;height:12px;top:0;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAMCAYAAAH317YUAAABXUlEQVQokY2SPUiCURSGn2sukqRBSwb9EEU/hF9OESQ1RSH9LK06NgS5WYgYktXW0g+0fC7tBtISmAZBkwoNEg1ORU0mTU23wU/5flR84XDgnPe89773HqijCkgBEClIiQ7SBlQjBYkAEItBeXqZaraFnqrltABcZ0X50+gczAvsQK1q0DaOw8SSLOczmDHtcSGAOBD2Z6TbwtDwFBAmRahGS9aBpGKmwbnmQB8VPU09ybyGtn3DhqmL7FvzyOLOg1R8A9Z7ZT/BDsQnw6ry9Qf3H60NNJS860dqaW4j1JLUo+Xv99xdun9odNczpWATGMLqT2eEwZnQfuwYt9PRgQa5lwL5mwR2U90FpFE2l/eS16yM9XYUaaDsmIWraP0htNqW0x9UVmMpRpz1wnOtKy1+nX2A0aYXyC0cqu7xtVB3Kjrc+q2r0xQNJFS3t81vtEKr9TKLVrCuW7t4/Ac4FWWuJ2UyAAAAAABJRU5ErkJggg==");border:0;left:1px;pointer-events:none;';
					this.elm.appendChild(this.posIndecator);

					var hsla = cssColorToHsl(initColor);
					this.setPos(hsla[0]);
					this.render(initColor);
				},
				setPos:function(pos){
					this.paletePosY = pos;
					setTimeout(function() {
						var h = parseFloat( getComputedStyle(this.elm).height );
						this.posIndecator.style.top = pos * (h - 1) - 6  + 'px';
					}.bind(this),0);
				},
				render : function (color) {
					if (ieG) {
						this.elm.style.backgroundImage = 'url("' + hslGrad + '")';
					} else {
						this.elm.style.backgroundImage = '-webkit-linear-gradient(top, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)';
						this.elm.style.backgroundImage = '-moz-linear-gradient(top, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)';
					}
				},
				posFromColor : function (color) {
					var hsl = cssColorToHsl(color);
					return hsl[0];
				},
				colorFromPos : function (pos) {
					this.setPos(pos.y);
					return 'hsla(' + pos.y * 360 + ',100%,50%, 1)';
				},
				hueFormPos : function (pos) {
					this.setPos(pos.y);
					return pos.y * 360;
				}
			},
			////////////////////////////////////////////
			opacity : {
				setElement : function (elm, initColor) {
					this.elm = elm;
					this.elm.className += ' ColorPickerPicker ColorPickerOpacityPalete';
					this.elm.style.position = 'relative';
					this.posIndecator = document.createElement('div');
					this.posIndecator.style.cssText = 'position:absolute;width:100%;height:4px;top:0;left:-1px;background:black;border:1px solid #eee;pointer-events:none;';
					this.elm.appendChild(this.posIndecator);
					this.ieGOpacityGradSetup = [
						{offset:'0%',color: initColor, opacity:'1'},
						{offset:'100%',color:initColor, opacity:'0'}
					];
					this.setColor(initColor);
				},
				setPos:function(pos){
					this.paletePosY = pos;
					setTimeout(function() {
						var h = parseFloat( getComputedStyle(this.elm).height );
						this.posIndecator.style.top = pos * (h - 1) - 3  + 'px';
					}.bind(this),0);

				},
				getOpacity:function(){
					return (1-this.paletePosY);
				},
				setColor:function(color){
					var hsla = cssColorToHsl(color);
					this.setPos(1-hsla[3]);
					this.render(hsla);
				},
				render : function (hsla) {
					var color =  'hsla(' + hsla[0]*360 + ',' + hsla[1]*100 + '%,' + hsla[2]*100 + '%,' + 1 + ')';
					var colorNoOpacity =  'hsla(' + hsla[0]*360 + ',' + hsla[1]*100 + '%,' + hsla[2]*100 + '%,' + 0 + ')';
					if (ieG) {
						this.ieGOpacityGradSetup[0].color = color;
						this.ieGOpacityGradSetup[1].color = color;
						this.elm.style.backgroundImage = 'url("' + ieG('top', this.ieGOpacityGradSetup) + '")';
					} else {
						this.elm.style.backgroundImage = '-webkit-linear-gradient(top, '+color+', '+colorNoOpacity+')';
						this.elm.style.backgroundImage = '-moz-linear-gradient(top, '+color+', '+colorNoOpacity+')';
					}
				},
				posFromColor : function (color) {
					var hsl = cssColorToHsl(color);
					return (1-hsl[3]);
				}
			}
		};
		
		return function (element, initColor, onChangePicker) {
			var drag = false;
			var onselectstart = null;
			var colorPicker = element;
			
			var events = SimpleEvents(colorPicker, {
				oncolorpickerchange: [],
				onpickerclick: [],
				onpaleteclick: [],
				onopacityclick: [],
				onpickermove: [],
				onpaletemove: [],
				onopacitymove: []
			});

			var palete = Object.create(paletes.palete);
			var picker = Object.create(paletes.photoshop);
			var preview = Object.create(paletes.single);
			var result = Object.create(paletes.single);		
			var opacity = Object.create(paletes.opacity);
			
			
			createColorPickerMarkup(colorPicker);		

			palete.setElement(colorPicker.querySelector('.colorpicker-color-palete'),  initColor);
			picker.setElement(colorPicker.querySelector('.colorpicker-lightsat-palete'), palete, initColor);
			opacity.setElement(createElement('100%', '100%', colorPicker.querySelector('.colorpicker-opacity-palete')), initColor);
			preview.setElement(createElement('100%', '100%', colorPicker.querySelector('.colorpicker-current')), initColor);
			result.setElement(createElement('100%', '100%', colorPicker.querySelector('.colorpicker-priveuse')), initColor);
		
			var updateAllInputs = bindToinputs(colorPicker.querySelector('.colorpicker-picker-inputs'), colorPicker.querySelector('.colorpicker-picker-inputs-extra'), initColor);

			colorPicker.addEventListener('mousedown', startDrag, false);
			window.addEventListener('mouseup', stopDrag, false);
			window.addEventListener('mousemove', dragMove, false);

			function updatePicker(target, offset, fireEventName){
				var color;
				if (target === palete.elm) {
					palete.hueFormPos(offset);
					color = picker.colorFromPos(picker.pos, palete.paletePosY, opacity.getOpacity());
					opacity.setColor(color);
					picker.render(palete.colorFromPos(offset), true);
					events.call('onpalete' + fireEventName, color);
				}
				if (target === opacity.elm) {
					//palete.hueFormPos(offset);
					opacity.setPos(offset.y);
					color = picker.colorFromPos(picker.pos, palete.paletePosY, opacity.getOpacity());                
					events.call('onopacity' + fireEventName, color);
				}
				if (target === picker.elm) {
					color = picker.colorFromPos(offset, palete.paletePosY, opacity.getOpacity());
					opacity.setColor(color);
					events.call('onpicker' + fireEventName, color);
				}
				color && events.call('oncolorpickerchange', useHex ? colorToHex(color) : color);
				return color;
			}

			function renderColorPicker(color){
				//picker
				picker.render(color);
				palete.setPos(picker.pos.hue);
				result.render(color);
				preview.render(color);
				opacity.setColor(color);
			}
			
			function bindToinputs(inputs, extra, initColor){
							
				var hueEl = inputs.querySelector('.colorpicker-hue');
				var saturationEl = inputs.querySelector('.colorpicker-saturation');
				var lightnessEl = inputs.querySelector('.colorpicker-lightness');
				var opacityEl = inputs.querySelector('.colorpicker-opacity');
				var colorEl = colorPicker.querySelector('.colorpicker-color');
							
				colorPicker.querySelector('.change-picker-label').onclick = function(){
					onChangePicker && onChangePicker(null);
				};

				updateInputs(initColor);
				
				events.on('oncolorpickerchange', updateInputs);
								
				inputs.addEventListener('change', validateInputs, false);			
				inputs.addEventListener('change', setColorFromInputs, false);
				
				extra.addEventListener('change', validateInputs, false);			
				extra.addEventListener('change', setColorFromInputs, false);
				
				function updateColorElm(rgba){
					if(useHex){
						colorEl.value = rgbToHex(rgba[0], rgba[1], rgba[2]).substr(1);
					} else {
						colorEl.value = 'rgba(' + rgba[0] +',' + rgba[1] +','+ rgba[2] +','+ rgba[3] +')';
					}
				}
				function getColorElValue(){
					return useHex ? '#'+colorEl.value : colorEl.value;
				}
				
				function setColorFromInputs(evt){
					if(evt.target === colorEl){
						try{
							renderColorPicker(colorEl.value);
							result.render(getColorElValue());
							preview.render(getColorElValue());
							return events.call('oncolorpickerchange', getColorElValue());//updateInputs(colorEl.value);
						}catch(err){}
					}
				
					var color =  'hsla(' + hueEl.value + ',' + saturationEl.value + '%,' +  lightnessEl.value + '%,' +  opacityEl.value + ')';
					var rgba = hslToRgb.apply(null, [hueEl.value/360, saturationEl.value/100, lightnessEl.value/100, opacityEl.value]);
					rgba[0] = rgba[0] << 0;
					rgba[1] = rgba[1] << 0;
					rgba[2] = rgba[2] << 0;
					
					updateColorElm(rgba);
					renderColorPicker(colorEl.value);
					result.render(getColorElValue());
					preview.render(getColorElValue());
					events.call('oncolorpickerchange', getColorElValue());
				}
				
				function validateInputs (evt){
					if(evt.target === hueEl){
						evt.target.value = Math.max(Math.min(evt.target.value, 360), 0) || 0;
					}
					if(evt.target === saturationEl || evt.target === lightnessEl){
						evt.target.value = Math.max(Math.min(evt.target.value, 100), 0) || 0
					}
					if(evt.target === opacityEl){
						evt.target.value = Math.max(Math.min(evt.target.value, 1), 0) || 1
					}
				}
				
				function updateInputs(color){
					var hsla = cssColorToHsl(color);
					hueEl.value = (hsla[0] * 360)<<0;
					saturationEl.value = (hsla[1] * 100)<<0 ;
					lightnessEl.value = (hsla[2] * 100)<<0;
					opacityEl.value = Number.prototype.toFixed.call(+hsla[3], 4);
					
					var rgba = hslToRgb.apply(null, hsla);
					rgba[0] = rgba[0] << 0;
					rgba[1] = rgba[1] << 0;
					rgba[2] = rgba[2] << 0;
					//rgbToHex.apply(null, rgba);
					updateColorElm(rgba);
					//colorEl.value = 'rgba(' + rgba[0] +',' + rgba[1] +','+ rgba[2] +','+ rgba[3] +')';
				}	
				
				return updateInputs;
				
			}

			function dragMove(e){
				if(!drag){return;}
				preview.render(updatePicker(drag, offsetPosFromEvent(e, drag), 'move'))
			}
					
			function stopDrag (e) {
				if (drag) {
					document.body.onselectstart = onselectstart;
					var el = drag;
					drag = false;
					var color = updatePicker(el, offsetPosFromEvent(e, el), 'click')
					result.render(color);
					preview.render(color);
				}
			}
			
			function startDrag (e) {
				onselectstart = document.body.onselectstart || null;
				document.body.onselectstart = function(){ return false; }//setAttribute('onselectstart' ,'return false');
				drag = e.target;
				
				var color = updatePicker(drag, offsetPosFromEvent(e, drag), 'click');
				preview.render(color);
			}

			return {
				on: events.on,
				elm : colorPicker,
				setColor : function(color){
					renderColorPicker(color);
					updateAllInputs(color);
					return this;
				},			
				getColor : function () {
					return result.colorFromPos();
				},            
				isVisible: function(){
					return colorPicker.style.display !== 'none';
				},
				hide : function () {
					colorPicker.style.display = 'none';
					return this;
				},
				show : function (parent) {
					colorPicker.style.display = 'block';
					parent && parent.appendChild(colorPicker);
					return this;
				}
			};
		};
	})();

	//////////////////////////////////////////////////////////////////////
	////////////////////// this is how to use it /////////////////////////
	//////////////////////////////////////////////////////////////////////
	//var colorPicker2 = ColorPicker(colorBoxPicker/*document.querySelector('.colorpicker')*/, '#888888');	

	function createColorPalete(options){
		
		var selectedColorNode = {};
		
		var colorPaleteInstance = {
			elm: colorPalete,
			hide: function(){
				colorPalete.style.display = 'none';
			},
			show: function(){
				colorPalete.style.display = 'block';
			},
			getColor: getValue,
			setColor: function(color){
				var colorNode = filterColorNode(function(colorNode){
					var tname = colorNode.$dataColor.reference;
					return tname && (tname === color.reference || tname === color || color === colorNode.$dataColor.value);
				}, true);	
				colorPaleteInstance.removeSelection();
				if(colorNode){
					setColor(colorNode);
				}
			},
			removeSelection: function(){
				selectedColorNode.className = 'simple-color-node';
				selectedColorNode = {};
			}
		};
		
		var colorPaleteInnerWrapper = document.createElement('div');
		colorPaleteInnerWrapper.className = 'colorpicker-wrapper';

			
		var changePickerLabel = document.createElement('div');
		changePickerLabel.className = 'change-picker-label';
		changePickerLabel.innerHTML = 'All colors';
		
		var colorPalete = document.createElement('div');
		colorPalete.className = 'colorpicker simple-color-palete';
		colorPalete.style.width = options.width || 'auto';
		colorPalete.style.height = options.height || 'auto';
		
		var y=-1, x=0;
		for(var i = 0; i < options.paleteColors.length;i++){
			x = i % 5;
			x = x * 5;
			y += x === 0 ? 1 : 0;
			colorPaleteInnerWrapper.appendChild(createColorNode(options.paleteColors[x+y], 'simple-color-node'));		
		}
		
		options.primColors.forEach(function(color){
			colorPaleteInnerWrapper.appendChild(createColorNode(color, 'simple-color-node prim-color'));		
		});
		
		colorPaleteInnerWrapper.appendChild(changePickerLabel);
		colorPalete.appendChild(colorPaleteInnerWrapper);
		options.parent.appendChild(colorPalete);
		
		colorPalete.onclick = function(evt){
			if(evt.target === colorPalete){ return }
			if(evt.target.className.indexOf('simple-color-node') !== -1 && evt.target.className.indexOf('color-node-selected') === -1){
				setColor(evt.target);
				options.onchange && options.onchange.call(null,getValue());
			}
		};
		
		if(options.selected){
			colorPaleteInstance.setColor(options.selected);
		}
		
		function setColor(colorNode){
			selectedColorNode.className = 'simple-color-node';
			selectedColorNode = colorNode;//evt.target;
			selectedColorNode.className += ' color-node-selected';
		}
		
		changePickerLabel.onclick = function(){
			options.onchangepicker && options.onchangepicker.call();
		}
		
		function createColorNode(color, className){
			var colorNode = document.createElement('div');
			colorNode.className = className;
			colorNode.style.background = color.value;
			colorNode.$dataColor = color;
			return colorNode;
		}
		
		
		function getValue(){
			return selectedColorNode.$dataColor;
		}
		
		function filterColorNode(fn, isOneRes){
			var child;
			var f = [];
			for(var i = 0; i < colorPaleteInnerWrapper.children.length; i++){
				child = colorPaleteInnerWrapper.children[i];
				if(child.className.indexOf('simple-color-node') !== -1){
					if(fn(child)){
						if(isOneRes){
							return child;
						}
						f.push(child);
					}
				}
			}
			return isOneRes ? null : f;
		}
		
		
		
		return colorPaleteInstance;
	}

	function createColorBox(options){
		var cb = {};
		var pickerInstance = {
			showSimplePicker:showSimplePicker,
			showAdvancePicker:showAdvancePicker,
			hidePickers:hidePickers,
			showPickers:showPickers,
			setColor: function(color){
				var colorFromTheme = findReferanceName(color);
				if(colorFromTheme){
					cb.colorPalete.setColor(colorFromTheme.reference);	
					cb.colorPicker.setColor(colorFromTheme.value);
					setBoxInnerColor(colorFromTheme.value, colorFromTheme);
				} else {
					cb.colorPalete.setColor(color);	
					cb.colorPicker.setColor(color);
					setBoxInnerColor(color, false);					
				}
			},
			getColor: function(){
				return cb.colorPicker.getColor();
			},
			getColorObject: function(){
				return cb.colorObject;
			}
		}
		
		function initialize(){

			markup();
			var ref = findReferanceName(options.color);

			cb.colorPicker = ColorPicker(cb.colorBoxPicker, ref ? ref.value : options.color, showSimplePicker);
			
			cb.colorPicker.on('oncolorpickerchange', function(color){
				cb.colorPalete.removeSelection();
				setBoxInnerColor(color, false);
				options.onchange && options.onchange(color);
			});
				
			cb.colorPalete = createColorPalete({
				width: '182px',
				parent: cb.popup.content,
				selected: ref,
				onchangepicker: function(){
					showAdvancePicker();
				},
				onchange: function(color){
					cb.colorPicker.setColor(color.value);
					setBoxInnerColor(color.value, color);
					options.onchange && options.onchange(color);
				},
				paleteColors: options.paleteColors || [],
				primColors: options.primColors || []
			});
			
			showSimplePicker();
			
			ref ? setBoxInnerColor(ref.value, ref) : setBoxInnerColor(options.color, false);
			
			hidePickers();	
			bindEvents();

			return pickerInstance;
		}

		function markup(){
			
			cb.colorBox = options.element || document.createElement('div');
			
			cb.popup = $('<div>').Popup({
				appendTo: cb.colorBox,
				title : 'ColorPicker',
				buttonSet: 'okCancel',
				height : 'auto',
				width : 'auto',
                fixed: true,
                maxPopupWidth: 265,
				onclose : function () {
					pickerInstance.hidePickers();
				},
				oncancel: function() {
					if(pickerInstance.getColorObject() || pickerInstance.getColor() !== cb.openedColor){
						pickerInstance.setColor(cb.openedColor);
						options.onchange && options.onchange(cb.openedColor);	
					}
					pickerInstance.hidePickers();				
				},
				onopen: function(){
					cb.colorBox.appendChild(this.arrow);
				},
				onposition: function(){}	
			}).getCtrl();
			
			cb.popup.setRelativeElement(cb.colorBox)
			
			
			cb.colorBoxPicker = document.createElement('div');
			cb.colorBoxInner = document.createElement('div');
			cb.colorBoxInnerArrow = document.createElement('div');

			cb.colorBoxPicker.className = 'colorpicker';
			cb.colorBox.className = 'uilib-color-box';
			cb.colorBoxInner.className = 'color-box-inner';
			cb.colorBoxInnerArrow.className = 'color-box-inner-arrow';
			
			cb.popup.content.appendChild(cb.colorBoxPicker);
			
			cb.colorBox.appendChild(cb.colorBoxInner);
			cb.colorBox.appendChild(cb.colorBoxInnerArrow);
			
			options.parent && options.parent.appendChild(cb.colorBox);
		}
		
		function findReferanceName(ref){
			if(!ref){
				return false
			}
			if(ref.reference){return ref;}
			for(var i =0; i < options.primColors.length;i++){
				if(options.primColors[i].reference === ref){
					return options.primColors[i];
				}
			}
			for(var i =0; i < options.paleteColors.length;i++){
				if(options.paleteColors[i].reference === ref){
					return options.paleteColors[i];
				}
			}
			return false;
		}
		
		function bindEvents(){
			cb.colorBox.onclick = function(evt){
				evt.stopPropagation && evt.stopPropagation();
				evt.prevetDefault && evt.prevetDefault();		
		
				if(evt.target === cb.colorBox || evt.target === cb.colorBoxInner || evt.target === cb.colorBoxInnerArrow){
                    if(!cb.popup.isOpen()){
                        showPickers();
                    }
				}
				return false;
			}
		
		}

		function saveOpendColor(){			
			cb.openedColor = options.isParamConected ? (pickerInstance.getColorObject() || pickerInstance.getColor()) : pickerInstance.getColor();
		}
		
		function showSimplePicker(){
			cb.popup.setTitle('Site Colors');
			cb.colorPicker.hide();
			cb.colorPalete.show();
		}
		
		function showAdvancePicker(){
			cb.popup.setTitle('All Colors');
			cb.colorPalete.hide();
			cb.colorPicker.show();
		}
		
		function hidePickers(){
			enableTextSelection();
			cb.popup.close();
		}
		
		function showPickers(){
			saveOpendColor();
			disableTextSelection();
			cb.popup.open();
		}

		function setBoxInnerColor(color, colorObject){
			if(color.indexOf('rgba') !== -1){
				color = color.replace(/,\s*\d+\.?\d*\s*\)/,')').replace('rgba','rgb');
			}
			cb.colorBoxInner.style.background = color;
			if(options.isParamConected){
				colorObject ? showSimplePicker() : showAdvancePicker();
			}
			cb.colorObject = colorObject;
		}

		function disableTextSelection(){
			disableTextSelection.onselectstart = document.onselectstart || null;
			disableTextSelection.onmousedown = document.onmousedown || null;
			document.onmousedown = document.onselectstart = function(evt) { 
				if((evt.target.tagName && (evt.target.tagName.toLowerCase() === 'textarea' || evt.target.tagName.toLowerCase() === 'input')) || evt.ctrlKey){
					return true;
				}
				return false; 
			}
		}
		
		function enableTextSelection(){
			document.onselectstart = disableTextSelection.onselectstart || null;
			document.onmousedown = disableTextSelection.onmousedown || null;
			disableTextSelection.onselectstart = null;
			disableTextSelection.onmousedown = null;
		}
		
		return initialize();
		
	}

	return createColorBox;

}());