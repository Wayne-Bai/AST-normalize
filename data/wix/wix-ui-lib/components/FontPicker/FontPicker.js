jQuery.fn.definePlugin('FontPicker', function () {
	'use strict';
	var imageMock = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	
	return {
		init : function () {
			this.isParamMode = this.getParamKey();//this.$el.attr('wix-param') || this.$el.attr('data-wix-param');
			this.markup();
			this.bindEvents();
			this.setValue(this.options.value);
		},
		markup : function () {
			var $dropEl = $('<div>');
			appendSpriteMap(this.options.spriteUrl, $dropEl);
			this.$el.append($dropEl);
			
			this.dropdown = $dropEl.Dropdown({
					hideText : this.options.spriteUrl !== imageMock,
					width : 265,
					height : 200,
					value: this.options.value
				}).data('plugin_Dropdown');
		},
		bindEvents : function () {
			var fontPicker = this;
			this.$el.on('Dropdown.change', function (evt, data) {
				evt.stopPropagation();
				fontPicker.triggerChangeEvent(fontPicker.extendedValue(data));
			});
		},
		extendedValue: function(data){
			if(this.isParamMode){
				data.fontParam = true;
			}
			return $.extend(data, {cssFontFamily: this.dropdown.getExtendedValue(), family: data.value});
		},
		getDefaults : function () {
			return {
				value: 'arial',
				spriteUrl : getFontsSpriteUrl()
			};
		},
		getValue : function () {
			return this.extendedValue(this.dropdown.getFullValue());
		},
		setValue : function (value) {
			if(value && value.fontParam){
				value = value.family || value.value;
			}
			return this.dropdown.setValue(value);
		}
	};

	function getFontsSpriteUrl(){
		return window.Wix && Wix.Styles && Wix.Styles.getFontsSpriteUrl() || imageMock;
	}
	
	function getEditorFonts(){
		return window.Wix && Wix.Styles && Wix.Styles.getEditorFonts() || [{lang:'', fonts:[{"displayName":"Arial","fontFamily":"arial","cdnName":"","genericFamily":"sans-serif","provider":"system","characterSets":["latin","latin-ext","cyrillic"],"permissions":"all","fallbacks":"helvetica","spriteIndex":5,"cssFontFamily":"'arial','helvetica','sans-serif'"},{"displayName":"Arial Black","fontFamily":"arial black","cdnName":"","genericFamily":"sans-serif","provider":"system","characterSets":["latin","cyrillic"],"permissions":"all","fallbacks":"gadget","spriteIndex":8,"cssFontFamily":"'arial black','gadget','sans-serif'"},{"displayName":"Comic Sans MS","fontFamily":"comic sans ms","cdnName":"","genericFamily":"cursive","provider":"system","characterSets":["latin","latin-ext","cyrillic"],"permissions":"all","fallbacks":"comic-sans-w01-regular,comic-sans-w02-regular,comic-sans-w10-regular","spriteIndex":22,"cssFontFamily":"'comic sans ms','comic-sans-w01-regular','comic-sans-w02-regular','comic-sans-w10-regular','cursive'"},{"displayName":"Courier New","fontFamily":"courier new","cdnName":"","genericFamily":"monospace","provider":"system","characterSets":["latin","latin-ext","cyrillic"],"permissions":"all","fallbacks":"courier-ps-w01,courier-ps-w02,courier-ps-w10","spriteIndex":30,"cssFontFamily":"'courier new','courier-ps-w01','courier-ps-w02','courier-ps-w10','monospace'"},{"displayName":"Georgia","fontFamily":"georgia","cdnName":"","genericFamily":"serif","provider":"system","characterSets":["latin","latin-ext","cyrillic"],"permissions":"all","fallbacks":"palatino,book antiqua,palatino linotype","spriteIndex":48,"cssFontFamily":"'georgia','palatino','book antiqua','palatino linotype','serif'"},{"displayName":"Impact","fontFamily":"impact","cdnName":"","genericFamily":"sans-serif","provider":"system","characterSets":["latin","latin-ext","cyrillic"],"permissions":"all","fallbacks":"impact-w01-2010,impact-w02-2010,impact-w10-2010","spriteIndex":79,"cssFontFamily":"'impact','impact-w01-2010','impact-w02-2010','impact-w10-2010','sans-serif'"},{"displayName":"Lucida Console","fontFamily":"lucida console","cdnName":"","genericFamily":"monospace","provider":"system","characterSets":["latin","latin-ext"],"permissions":"all","fallbacks":"lucida-console-w01","spriteIndex":94,"cssFontFamily":"'lucida console','lucida-console-w01','monospace'"},{"displayName":"Lucida Sans Unicode","fontFamily":"lucida sans unicode","cdnName":"","genericFamily":"sans-serif","provider":"system","characterSets":["latin"],"permissions":"all","fallbacks":"lucida grande","spriteIndex":96,"cssFontFamily":"'lucida sans unicode','lucida grande','sans-serif'"},{"displayName":"Palatino Linotype","fontFamily":"palatino linotype","cdnName":"","genericFamily":"serif","provider":"system","characterSets":["latin","latin-ext"],"permissions":"all","fallbacks":"","spriteIndex":119,"cssFontFamily":"'palatino linotype','serif'"},{"displayName":"Tahoma","fontFamily":"tahoma","cdnName":"","genericFamily":"sans-serif","provider":"system","characterSets":["latin","latin-ext"],"permissions":"all","fallbacks":"tahoma-w01-regular,tahoma-w02-regular,tahoma-w10-regular,tahoma-w15--regular,tahoma-w99-regular","spriteIndex":141,"cssFontFamily":"'tahoma','tahoma-w01-regular','tahoma-w02-regular','tahoma-w10-regular','tahoma-w15--regular','tahoma-w99-regular','sans-serif'"},{"displayName":"Times New Roman","fontFamily":"times new roman","cdnName":"","genericFamily":"serif","provider":"system","characterSets":["latin","latin-ext","cyrillic"],"permissions":"all","fallbacks":"times","spriteIndex":143,"cssFontFamily":"'times new roman','times','serif'"},{"displayName":"Verdana","fontFamily":"verdana","cdnName":"","genericFamily":"sans-serif","provider":"system","characterSets":["latin","latin-ext","cyrillic"],"permissions":"all","fallbacks":"geneva","spriteIndex":146,"cssFontFamily":"'verdana','geneva','sans-serif'"}]}]
	}

    function addCommasIfNeededToFontFamilies(cssFontFamily){
        var fontFamilyArr = cssFontFamily.split(',');

        for (var fontFamily in fontFamilyArr) {
            if (fontFamilyArr[fontFamily].indexOf('"') < 0) {
                fontFamilyArr[fontFamily]  = '"' + fontFamilyArr[fontFamily]  + '"';
            }
        }

        return fontFamilyArr.toString();
    }

	function appendSpriteMap(spriteUrl, $el) {
		if (!spriteUrl) {
			throw new Error('Could not found sprite map url');
		}
		var allFontsMeta = getEditorFonts();
		var frag = document.createDocumentFragment();
		allFontsMeta.forEach(function (fontsMetaLang) {
			var fontsMeta = fontsMetaLang.fonts;
			for (var f in fontsMeta) {
				var font = fontsMeta[f];
				var offsetIndex = font.characterSets.indexOf(fontsMetaLang.lang);
				var spriteIndex = font.spriteIndex + offsetIndex;

                // Add commas for each font family if needed
                font.cssFontFamily = addCommasIfNeededToFontFamilies(font.cssFontFamily);

                // Convert " to '
                font.cssFontFamily = font.cssFontFamily.replace(/\"/g, '\'');

				var el = $('<div data-value-extended="'+font.cssFontFamily+'" value="' + font.fontFamily + '">' + font.displayName + '</div>').css({
					backgroundImage: 'url("'+spriteUrl+'")',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: '4px ' + (spriteIndex * -24 + 3) + 'px'
				})[0];
				frag.appendChild(el);
			}
		});
		$el.html('');
		$el.append(frag);
	}

	function createSpriteMap(spriteUrl, selector, length, offsetY, offsetX, hoverSelector) {

		var tpl = "background-image:url('$image');" +
			"background-repeat:no-repeat;" +
			"background-position: $leftpx $toppx;";

		tpl = tpl.replace('$image', spriteUrl);

		offsetY = offsetY || 0;
		offsetX = offsetX || 0;
		hoverSelector = hoverSelector || ''
		var index = length + 1;
		var style = new Array(length * 2);
		var pos;
		var out;
		while (index--) {
			pos = (index * -24 + offsetY);
			out = tpl.replace('$top', pos).replace('$left', offsetX);
			style[index] = (selector + index) + '{' + out + '}';
			style[index + length + 1] = (selector + index + hoverSelector) + '{' + out + ' }';
		}
		return style.join('\n');
	}

	function appendStyle(cssText, id, attr) {
		var style = document.createElement('style');
		style.id = id;
		attr && style.setAttribute(attr.key, attr.val);
		style.appendChild(document.createTextNode(cssText));
		var head = document.getElementsByTagName('head')[0];
		head.appendChild(style);
	}

});

