goog.provide("module$DefaultDOMPropertyConfig");
var module$DefaultDOMPropertyConfig = {};
goog.require("module$DOMProperty");
var DOMProperty$$module$DefaultDOMPropertyConfig = module$DOMProperty;
var MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig = DOMProperty$$module$DefaultDOMPropertyConfig.injection.MUST_USE_ATTRIBUTE;
var MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig = DOMProperty$$module$DefaultDOMPropertyConfig.injection.MUST_USE_PROPERTY;
var HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig = DOMProperty$$module$DefaultDOMPropertyConfig.injection.HAS_BOOLEAN_VALUE;
var HAS_SIDE_EFFECTS$$module$DefaultDOMPropertyConfig = DOMProperty$$module$DefaultDOMPropertyConfig.injection.HAS_SIDE_EFFECTS;
var DefaultDOMPropertyConfig$$module$DefaultDOMPropertyConfig = {isCustomAttribute:RegExp.prototype.test.bind(/^(data|aria)-[a-z_][a-z\d_.\-]*$/), Properties:{accept:null, accessKey:null, action:null, allowFullScreen:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig | HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, allowTransparency:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, alt:null, async:HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, autoComplete:null, autoFocus:HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, 
autoPlay:HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, cellPadding:null, cellSpacing:null, charSet:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, checked:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig | HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, className:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig, colSpan:null, content:null, contentEditable:null, contextMenu:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, controls:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig | 
HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, data:null, dateTime:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, defer:HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, dir:null, disabled:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig | HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, draggable:null, encType:null, form:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, frameBorder:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, height:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, 
hidden:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig | HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, href:null, htmlFor:null, httpEquiv:null, icon:null, id:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig, label:null, lang:null, list:null, max:null, maxLength:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, method:null, min:null, multiple:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig | HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, name:null, pattern:null, placeholder:null, 
poster:null, preload:null, radioGroup:null, readOnly:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig | HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, rel:null, required:HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, role:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, rowSpan:null, scrollLeft:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig, scrollTop:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig, selected:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig | HAS_BOOLEAN_VALUE$$module$DefaultDOMPropertyConfig, 
size:null, spellCheck:null, src:null, step:null, style:null, tabIndex:null, target:null, title:null, type:null, value:MUST_USE_PROPERTY$$module$DefaultDOMPropertyConfig | HAS_SIDE_EFFECTS$$module$DefaultDOMPropertyConfig, width:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, wmode:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, autoCapitalize:null, autoCorrect:null, cx:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, cy:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, d:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, 
fill:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, fx:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, fy:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, gradientTransform:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, gradientUnits:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, offset:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, points:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, r:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, rx:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, 
ry:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, spreadMethod:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, stopColor:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, stopOpacity:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, stroke:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, strokeLinecap:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, strokeWidth:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, transform:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, 
version:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, viewBox:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, x1:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, x2:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, x:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, y1:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, y2:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig, y:MUST_USE_ATTRIBUTE$$module$DefaultDOMPropertyConfig}, DOMAttributeNames:{className:"class", gradientTransform:"gradientTransform", 
gradientUnits:"gradientUnits", htmlFor:"for", spreadMethod:"spreadMethod", stopColor:"stop-color", stopOpacity:"stop-opacity", strokeLinecap:"stroke-linecap", strokeWidth:"stroke-width", viewBox:"viewBox"}, DOMPropertyNames:{autoCapitalize:"autocapitalize", autoComplete:"autocomplete", autoCorrect:"autocorrect", autoFocus:"autofocus", autoPlay:"autoplay", encType:"enctype", radioGroup:"radiogroup", spellCheck:"spellcheck"}, DOMMutationMethods:{className:function(node, value) {
  node.className = value || ""
}}};
module$DefaultDOMPropertyConfig.module$exports = DefaultDOMPropertyConfig$$module$DefaultDOMPropertyConfig;
if(module$DefaultDOMPropertyConfig.module$exports) {
  module$DefaultDOMPropertyConfig = module$DefaultDOMPropertyConfig.module$exports
}
;