/*
* COMBO BOX
* Select field with the ability to define custom values.
*/

var oDefaults = {
	oClasses: {
	},
	oFiles: {
		sIconExpand: '_images_frontend/icons/arrows/triangle-gray-down.png',
		sIconRetract: '_images_frontend/icons/arrows/triangle-gray-up.png'
	}
};

var GComboBox = function() {
	
	var gThis = this;
	
	gThis.m_jField;
	gThis.m_sDefaultValue;
	
	gThis.Update = function() {
		$(gThis).parent().find('.faux span').text($(gThis).find('option:selected').text()).attr('class', $(gThis).find('option:selected').attr('class') + ' ');
		gThis.m_jField.val($(gThis).find('option:selected').text()).attr('class', $(gThis).find('option:selected').attr('class') + ' ');
		return true;
	};
	
	this._Constructor = function() {
		$(gThis).parent().addClass('GComboBox');
		gThis.m_sDefaultValue = $(gThis).find('option:eq(0)').text();
		gThis.m_jField = $('<input type="text" value="' + $(gThis).find('option:selected').text() + '"/>');
		$(gThis).parent().find('select').css('opacity', 0);
		$(gThis).parent().append('<span class="faux"><span style="visibility: hidden;">' + $(gThis).find('option:selected').text() + '</span></span>');
		$(gThis).parent().append(gThis.m_jField);
		$(gThis).change(gThis.Update).change(function() {
			$(gThis).trigger('GChange');
		});
		$(gThis).add(gThis.m_jField).focus(function() {
			$(gThis).closest('.field').addClass('focus');
			return true;
		});
		$(gThis).add(gThis.m_jField).blur(function() {
			$(gThis).closest('.field').removeClass('focus');
			if ($(gThis).val() != '_new_') {
				$(gThis).find('option[value="_new_"]').remove();
			}
			return true;
		});
		gThis.m_jField.focus(function() {
			if ($(this).val() == gThis.m_sDefaultValue) {
				$(this).val('');
			}
		}).blur(function() {
			if (!$(this).val().length) {
				$(this).val(gThis.m_sDefaultValue);
			}
			$(gThis).find('option[value="_new_"]').remove();
			if ($(this).val() != gThis.m_sDefaultValue) {
				var jOption = $(gThis).find('option');
				var bFound = false;
				if($('.field-attribute-editor').length == 0){
					for (var i = 0; i < jOption.length; i++) {
						if (jOption.eq(i).text() == $(this).val()) {
							$(gThis).val(jOption.eq(i).attr('value'));
							bFound = true;
							break;
						}
					}
				}
				if (!bFound) {
					$(gThis).append('<option value="_new_">' + $(this).val() + '</option>').val('_new_');
				}
			}
			$(gThis).trigger('GChange');
		}).keydown(gThis.PreventEnter);
		gThis.Update();
	};
	
	gThis.PreventEnter = function(eEvent) {
		if (eEvent.keyCode == 13) {
			eEvent.preventDefault();
			eEvent.stopImmediatePropagation();
			$(this).blur().change();
			$(gThis).change();
		}
	};
	
	gThis._Constructor();
	
};

new GPlugin('GComboBox', oDefaults, GComboBox);