/*
 * Copyright (c) 1997-2013, SalesLogix, NA., LLC. All rights reserved.
 */
define('crm/Fields/MultiCurrencyField', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'argos/Fields/DecimalField',
    'argos/FieldManager'
], function(
    declare,
    lang,
    DecimalField,
    FieldManager
) {
    var control = declare('crm.Fields.MultiCurrencyField', [DecimalField], {
        attributeMap: {
            inputValue: {
                node: 'inputNode',
                type: 'attribute',
                attribute: 'value'
            },
            currencyCode: {
                node: 'currencyCodeNode',
                type: 'innerHTML'
            }
        },
        widgetTemplate: new Simplate([
            '<label for="{%= $.name %}">{%: $.label %}</label>',
            '{% if ($.enableClearButton && !$.readonly) { %}',
                '<button class="clear-button" data-dojo-attach-point="clearNode" data-dojo-attach-event="onclick:_onClearClick"></button>',
            '{% } %}',
            '<span data-dojo-attach-point="currencyCodeNode" class="currency-code-editlabel">{%: $.currencyCode %}</span>',
            '<input data-dojo-attach-point="inputNode" data-dojo-attach-event="onkeyup: _onKeyUp, onblur: _onBlur, onfocus: _onFocus" class="text-input" type="{%: $.inputType %}" name="{%= $.name %}" {% if ($.readonly) { %} readonly {% } %}>'
        ]),
        currencyCode: '',
        setCurrencyCode: function(code) {
            this.set('currencyCode', code);
        }
    });

    lang.setObject('Mobile.SalesLogix.Fields.MultiCurrencyField', control);
    return FieldManager.register('multiCurrency', control);
});
