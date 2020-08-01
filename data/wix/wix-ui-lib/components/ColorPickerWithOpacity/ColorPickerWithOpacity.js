jQuery.fn.definePlugin('ColorPickerWithOpacity', function ($) {
	'use strict';

	return {
		init: function(){
			this.options.value = this.options.value !== undefined ? this.options.value : this.options.startWithColor;
			this.options.isParamConected = (this.$el.attr('wix-param') || this.$el.attr('data-wix-param'));
			this.markup();
			this.setValue(this.options.value);
			this.setOpacity(this.options.startWithOpacity);
			this.bindEvents();
		},
		markup: function(){
			this.$el.addClass('picker-with-opacity');
			this.$ColorPicker = $('<div>').ColorPicker(this.options);
			this.$Slider = $('<div>').Slider({
				preLabel: '0',
				postLabel: '100',
				value: this.options.startWithOpacity,
				toolTip: false
			});
			if(this.options.divider){
				this.$el.append(this.$ColorPicker, $('<span class="uilib-text" style="margin: 0 0 0 10px">').text(this.options.divider),this.$Slider);
			} else{
				this.$el.append(this.$ColorPicker, this.$Slider);
			}
		},
		bindEvents: function () {
			this.$ColorPicker.on('ColorPicker.change', this.colorChangedInInnerPlugins.bind(this, 'color'));
			this.$Slider.on('Slider.change', this.colorChangedInInnerPlugins.bind(this, 'opacity'));
		},
		getValue: function () {
			var plugs = this.getPlugins();
			
			var rgbString = plugs.colorPicker.getValue();
			var sliderValue = plugs.slider.getValue() / 100;
			
			if(rgbString.indexOf('rgba') === 0 || rgbString.indexOf('hsla') === 0){
				return rgbString.replace(/,\s*([\d\.]+)\s*\)/, ','+ sliderValue + ')');
			} else {
				return rgbString.replace(/rgb/, 'rgba').replace(')', ',' + sliderValue + ')');
			}
		},
		setValue: function (value) {
			var opacity = 100;
			var color = '#000';
			var plugs = this.getPlugins();
			if(value && typeof value === 'object'){
				//if(plugs.colorPicker.isParamConected){
					color = (value.color && value.color.reference) ? value.color.reference : (value.rgba || value.cssColor);
					opacity = (value.opacity || extractOpacityFromColor(color)) * 100;
				//}else {
				//	color = (value.cssColor || value.rgba);
				//	opacity = (value.opacity || extractOpacityFromColor(color)) * 100;
				//}
			} else if(typeof value === 'string'){
				color = extractColorFromValue(value);
				opacity = extractOpacityFromColor(value) * 100;
			}
			
			plugs.slider.setValue(opacity);
			plugs.colorPicker.setValue(color);
			
		},
		setOpacity: function (opacity) {
			if(!opacity && opacity!==0){return;}
			this.getPlugins().slider.setValue(opacity);
		},
		getPlugins: function () {
			return {
				colorPicker: this.$ColorPicker.data('plugin_ColorPicker'),
				slider: this.$Slider.data('plugin_Slider')
			};
		},
		colorChangedInInnerPlugins: function (whatChanged, event, value) {
			event.stopPropagation();
			this.triggerChangeEvent({
				color: this.getPlugins().colorPicker.getColorObject(),
				opacity: this.getPlugins().slider.getValue() / 100,
				rgba: this.getValue()
			});
		},
		getDefaults: function(){
			return {
				startWithColor: 'rgba(255,0,0,1)'
			    //value:'rgba(255,0,0,1)'
			}
		}
	};
	
	
	function extractOpacityFromColor(value){
		var opacity =1;
		value = $.trim(value);
		if(value.charAt(0) === '#'){
			opacity = 1;
		} else if(value.indexOf('rgba') === 0 || value.indexOf('hsla')===0){
			opacity = value.match(/,([^),]+)\)/);
			opacity = (opacity ? (+opacity[1]) : 1);
		} else if(value.indexOf('rgb') === 0){
			opacity = 1;
		}
		return opacity;
	}
	
	function extractColorFromValue(value){
		var color;
		value = $.trim(value);
		if(value.charAt(0) === '#'){
			color = value;
		} else if(value.indexOf('rgba') === 0){
			color = value.replace('rgba','rgb').replace(/,([^),]+)\)/,')');
		} else if(value.indexOf('rgb') === 0){
			color = value;
		}else{
			color = value;
		}
		return color;
	}
	
	
});
