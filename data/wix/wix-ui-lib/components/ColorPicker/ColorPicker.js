jQuery.fn.definePlugin('ColorPicker', function ($) {
	'use strict';
	
	var defaultColors = [
			'#50FAFE', '#FFFFFF', '#0088CB', '#ED1C24', '#FFCB05',
            '#CECECE', '#9C9C9C', '#6C6C6C', '#484848', '#242424', '#C4EEF6', '#A5E1ED',
            '#59CEE5', '#3B8999', '#1D444C', '#FFFDFD', '#999999', '#666666', '#444444', '#000000', '#E4A3B8',
            '#CA748F', '#AF1A49', '#751131', '#3A0818', '#D5E7A6', '#B8CF78', '#8EB71D', '#5E7A13', '#2F3D09'
		].map(function(o,i){
			return {value:o, reference:'color-'+i};
		});
	
	return {
		init: function(){
			this.options.value = this.options.value !== undefined ? this.options.value : this.options.startWithColor;
			this.isParamConected = this.options.isParamConected || (this.$el.attr('wix-param') || this.$el.attr('data-wix-param'));
			//TODO test this.
			this.siteColors = /*this.isParamConected ? */ true ? ((Wix.Styles || Wix.Settings).getSiteColors() || defaultColors) : defaultColors;
			this.markup();		
		},
		getDefaults: function(){
			return {
				startWithColor : "color-1",
				value:undefined
			};
		},
		markup: function(){
			var that = this;
			this.picker = createColorBox({
				element: this.$el[0],
				color: this.options.value,
				isParamConected: this.isParamConected,
				primColors: this.siteColors.slice(0,5),
				paleteColors: this.siteColors.slice(5),
				onchange: this.changeEventHandler.bind(this)
			});
		
		},
		getValue: function () {
			return this.picker.getColor();
		},
		setValue: function(color){
			var colorFromTheme;
			try{
				if(this.isParamConected && typeof color==='string'){
					colorFromTheme = (Wix.Styles || Wix.Settings).getColorByRefrence(color);
				} else if(this.isParamConected && color.color.reference){
					colorFromTheme = color.color;
				}
				colorFromTheme = colorFromTheme.reference;
			}catch(err){}
			this.picker.setColor(colorFromTheme || color.cssColor || color.rgba || color);
		},
		changeEventHandler: function(color){
			var that = this;
			clearTimeout(this.$timeoutTicket);
			this.$timeoutTicket = setTimeout(function(){					
				var data = {
					cssColor: color
				};
				if(typeof color === 'string'){
					
				} else if (color && typeof color === 'object'){
					data.color = color;
					data.cssColor = color.value;
					if(!that.isParamConected){
						delete data.color;
					}
				}
				that.triggerChangeEvent(data)
			},10);
		},
		getColorObject: function(){
			return this.picker.getColorObject();
		},
		bindEvents: function () {}
	};
	
});
