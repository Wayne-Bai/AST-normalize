! ✖ / env;
rhino;
var window =  {} ;
var JSHINT;
function()  {
   var require;
   require = function(e, t, n)  {
      function i(n, s)  {
         if (! t[n])  {
            if (! e[n])  {
               var o = typeof require == "function" && require;
               if (! s && o) return o(n, ! 0)               if (r) return r(n, ! 0)               throw new Error("Cannot find module '" + n + "'");
            }
            var u = t[n] =  {
               exports: {}             }
;
            e[n][0].call(u.exports, function(t)  {
                  var r = e[n][1][t];
                  return i(r ? r : t);
               }, 
               u, u.exports);
         }
         return t[n].exports;
      }
;
      var r = typeof require == "function" && require;
      for (var s = 0; s < n.length; s++) i(n[s])      return i;
   }
( {
         :[function(require, module, exports)  {
            var process = module.exports =  {} ;
            process.nextTick = function()  {
               var canSetImmediate = typeof window !== "undefined" && window.setImmediate;
               var canPost = typeof window !== "undefined" && window.postMessage && window.addEventListener;
               if (canSetImmediate)  {
                  return function(f)  {
                     return window.setImmediate(f);
                  }
;
               }
               if (canPost)  {
                  var queue = [];
                  window.addEventListener("message", function(ev)  {
                        if (ev.source === window && ev.data === "process-tick")  {
                           ev.stopPropagation();
                           if (queue.length > 0)  {
                              var fn = queue.shift();
                              fn();
                           }
                        }
                     }, 
                     true);
                  return function(fn)  {
                     queue.push(fn);
                     window.postMessage("process-tick", "*");
                  }
;
               }
               return function(fn)  {
                  setTimeout(fn, 0);
               }
;
            }
();
            process.title = "browser";
            process.browser = true;
            process.env =  {} ;
            process.argv = [];
            process.binding = function(name)  {
               throw new Error("process.binding is not supported");
            }
;
            process.cwd = function()  {
               return "/";
            }
;
            process.chdir = function(dir)  {
               throw new Error("process.chdir is not supported");
            }
;
         }
,  {} ], 
         :[function(require, module, exports)  {
            function(process)  {
               if (! process.EventEmitter) process.EventEmitter = function()  {
               }
               var EventEmitter = exports.EventEmitter = process.EventEmitter;
               var isArray = typeof Array.isArray === "function" ? Array.isArray : function(xs)  {
                  return Object.prototype.toString.call(xs) === "[object Array]";
               }
;
               function indexOf(xs, x)  {
                  if (xs.indexOf) return xs.indexOf(x)                  for (var i = 0; i < xs.length; i++)  {
                        if (x === xs[i]) return i                     }
                  return - 1;
               }
;
               var defaultMaxListeners = 10;
               EventEmitter.prototype.setMaxListeners = function(n)  {
                  if (! this._events) this._events =  {}                   this._events.maxListeners = n;
               }
;
               EventEmitter.prototype.emit = function(type)  {
                  if (type === "error")  {
                     if (! this._events || ! this._events.error || isArray(this._events.error) && ! this._events.error.length)  {
                        if (arguments[1] instanceof Error)  {
                           throw arguments[1];
                        }
                         else  {
                           throw new Error("Uncaught, unspecified 'error' event.");
                        }
                        return false;
                     }
                  }
                  if (! this._events) return false                  var handler = this._events[type];
                  if (! handler) return false                  if (typeof handler == "function")  {
                     switch(arguments.length) {
                        case 1:
 
                              handler.call(this);
                              break;
                           
                        case 2:
 
                              handler.call(this, arguments[1]);
                              break;
                           
                        case 3:
 
                              handler.call(this, arguments[1], arguments[2]);
                              break;
                           
                        default:
 
                              var args = Array.prototype.slice.call(arguments, 1);
                              handler.apply(this, args);
                           
}
;
                     return true;
                  }
                   else if (isArray(handler))  {
                     var args = Array.prototype.slice.call(arguments, 1);
                     var listeners = handler.slice();
                     for (var i = 0, l = listeners.length; i < l; i++)  {
                           listeners[i].apply(this, args);
                        }
                     return true;
                  }
                   else  {
                     return false;
                  }
               }
;
               EventEmitter.prototype.addListener = function(type, listener)  {
                  if ("function" !== typeof listener)  {
                     throw new Error("addListener only takes instances of Function");
                  }
                  if (! this._events) this._events =  {}                   this.emit("newListener", type, listener);
                  if (! this._events[type])  {
                     this._events[type] = listener;
                  }
                   else if (isArray(this._events[type]))  {
                     if (! this._events[type].warned)  {
                        var m;
                        if (this._events.maxListeners !== undefined)  {
                           m = this._events.maxListeners;
                        }
                         else  {
                           m = defaultMaxListeners;
                        }
                        if (m && m > 0 && this._events[type].length > m)  {
                           this._events[type].warned = true;
                           console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                           console.trace();
                        }
                     }
                     this._events[type].push(listener);
                  }
                   else  {
                     this._events[type] = [this._events[type], listener];
                  }
                  return this;
               }
;
               EventEmitter.prototype.on = EventEmitter.prototype.addListener;
               EventEmitter.prototype.once = function(type, listener)  {
                  var self = this;
                  self.on(type, function()  {
                        self.removeListener(type, g);
                        listener.apply(this, arguments);
                     }
                  );
                  return this;
               }
;
               EventEmitter.prototype.removeListener = function(type, listener)  {
                  if ("function" !== typeof listener)  {
                     throw new Error("removeListener only takes instances of Function");
                  }
                  if (! this._events || ! this._events[type]) return this                  var list = this._events[type];
                  if (isArray(list))  {
                     var i = indexOf(list, listener);
                     if (i < 0) return this                     list.splice(i, 1);
                     if (list.length == 0) delete this._events[type]                  }
                   else if (this._events[type] === listener)  {
                     delete this._events[type];
                  }
                  return this;
               }
;
               EventEmitter.prototype.removeAllListeners = function(type)  {
                  if (arguments.length === 0)  {
                     this._events =  {} ;
                     return this;
                  }
                  if (type && this._events && this._events[type]) this._events[type] = null                  return this;
               }
;
               EventEmitter.prototype.listeners = function(type)  {
                  if (! this._events) this._events =  {}                   if (! this._events[type]) this._events[type] = []                  if (! isArray(this._events[type]))  {
                     this._events[type] = [this._events[type]];
                  }
                  return this._events[type];
               }
;
            }
(require("__browserify_process"));
         }
,  {
            __browserify_process:1         }
], 
         :[function(require, module, exports)  {
            function()  {
               "use strict";
               exports.reservedVars =  {
                  arguments:false, 
                  NaN:false               }
;
               exports.ecmaIdentifiers =  {
                  Array:false, 
                  Boolean:false, 
                  Date:false, 
                  decodeURI:false, 
                  decodeURIComponent:false, 
                  encodeURI:false, 
                  encodeURIComponent:false, 
                  Error:false, 
                  eval:false, 
                  EvalError:false, 
                  Function:false, 
                  hasOwnProperty:false, 
                  isFinite:false, 
                  isNaN:false, 
                  JSON:false, 
                  Math:false, 
                  Map:false, 
                  Number:false, 
                  Object:false, 
                  parseInt:false, 
                  parseFloat:false, 
                  RangeError:false, 
                  ReferenceError:false, 
                  RegExp:false, 
                  Set:false, 
                  String:false, 
                  SyntaxError:false, 
                  TypeError:false, 
                  URIError:false, 
                  WeakMap:false               }
;
               exports.browser =  {
                  ArrayBuffer:false, 
                  ArrayBufferView:false, 
                  Audio:false, 
                  Blob:false, 
                  addEventListener:false, 
                  applicationCache:false, 
                  atob:false, 
                  blur:false, 
                  btoa:false, 
                  clearInterval:false, 
                  clearTimeout:false, 
                  close:false, 
                  closed:false, 
                  DataView:false, 
                  DOMParser:false, 
                  defaultStatus:false, 
                  document:false, 
                  Element:false, 
                  ElementTimeControl:false, 
                  event:false, 
                  FileReader:false, 
                  Float32Array:false, 
                  Float64Array:false, 
                  FormData:false, 
                  focus:false, 
                  frames:false, 
                  getComputedStyle:false, 
                  HTMLElement:false, 
                  HTMLAnchorElement:false, 
                  HTMLBaseElement:false, 
                  HTMLBlockquoteElement:false, 
                  HTMLBodyElement:false, 
                  HTMLBRElement:false, 
                  HTMLButtonElement:false, 
                  HTMLCanvasElement:false, 
                  HTMLDirectoryElement:false, 
                  HTMLDivElement:false, 
                  HTMLDListElement:false, 
                  HTMLFieldSetElement:false, 
                  HTMLFontElement:false, 
                  HTMLFormElement:false, 
                  HTMLFrameElement:false, 
                  HTMLFrameSetElement:false, 
                  HTMLHeadElement:false, 
                  HTMLHeadingElement:false, 
                  HTMLHRElement:false, 
                  HTMLHtmlElement:false, 
                  HTMLIFrameElement:false, 
                  HTMLImageElement:false, 
                  HTMLInputElement:false, 
                  HTMLIsIndexElement:false, 
                  HTMLLabelElement:false, 
                  HTMLLayerElement:false, 
                  HTMLLegendElement:false, 
                  HTMLLIElement:false, 
                  HTMLLinkElement:false, 
                  HTMLMapElement:false, 
                  HTMLMenuElement:false, 
                  HTMLMetaElement:false, 
                  HTMLModElement:false, 
                  HTMLObjectElement:false, 
                  HTMLOListElement:false, 
                  HTMLOptGroupElement:false, 
                  HTMLOptionElement:false, 
                  HTMLParagraphElement:false, 
                  HTMLParamElement:false, 
                  HTMLPreElement:false, 
                  HTMLQuoteElement:false, 
                  HTMLScriptElement:false, 
                  HTMLSelectElement:false, 
                  HTMLStyleElement:false, 
                  HTMLTableCaptionElement:false, 
                  HTMLTableCellElement:false, 
                  HTMLTableColElement:false, 
                  HTMLTableElement:false, 
                  HTMLTableRowElement:false, 
                  HTMLTableSectionElement:false, 
                  HTMLTextAreaElement:false, 
                  HTMLTitleElement:false, 
                  HTMLUListElement:false, 
                  HTMLVideoElement:false, 
                  history:false, 
                  Int16Array:false, 
                  Int32Array:false, 
                  Int8Array:false, 
                  Image:false, 
                  length:false, 
                  localStorage:false, 
                  location:false, 
                  MessageChannel:false, 
                  MessageEvent:false, 
                  MessagePort:false, 
                  moveBy:false, 
                  moveTo:false, 
                  MutationObserver:false, 
                  name:false, 
                  Node:false, 
                  NodeFilter:false, 
                  navigator:false, 
                  onbeforeunload:true, 
                  onblur:true, 
                  onerror:true, 
                  onfocus:true, 
                  onload:true, 
                  onresize:true, 
                  onunload:true, 
                  open:false, 
                  openDatabase:false, 
                  opener:false, 
                  Option:false, 
                  parent:false, 
                  print:false, 
                  removeEventListener:false, 
                  resizeBy:false, 
                  resizeTo:false, 
                  screen:false, 
                  scroll:false, 
                  scrollBy:false, 
                  scrollTo:false, 
                  sessionStorage:false, 
                  setInterval:false, 
                  setTimeout:false, 
                  SharedWorker:false, 
                  status:false, 
                  SVGAElement:false, 
                  SVGAltGlyphDefElement:false, 
                  SVGAltGlyphElement:false, 
                  SVGAltGlyphItemElement:false, 
                  SVGAngle:false, 
                  SVGAnimateColorElement:false, 
                  SVGAnimateElement:false, 
                  SVGAnimateMotionElement:false, 
                  SVGAnimateTransformElement:false, 
                  SVGAnimatedAngle:false, 
                  SVGAnimatedBoolean:false, 
                  SVGAnimatedEnumeration:false, 
                  SVGAnimatedInteger:false, 
                  SVGAnimatedLength:false, 
                  SVGAnimatedLengthList:false, 
                  SVGAnimatedNumber:false, 
                  SVGAnimatedNumberList:false, 
                  SVGAnimatedPathData:false, 
                  SVGAnimatedPoints:false, 
                  SVGAnimatedPreserveAspectRatio:false, 
                  SVGAnimatedRect:false, 
                  SVGAnimatedString:false, 
                  SVGAnimatedTransformList:false, 
                  SVGAnimationElement:false, 
                  SVGCSSRule:false, 
                  SVGCircleElement:false, 
                  SVGClipPathElement:false, 
                  SVGColor:false, 
                  SVGColorProfileElement:false, 
                  SVGColorProfileRule:false, 
                  SVGComponentTransferFunctionElement:false, 
                  SVGCursorElement:false, 
                  SVGDefsElement:false, 
                  SVGDescElement:false, 
                  SVGDocument:false, 
                  SVGElement:false, 
                  SVGElementInstance:false, 
                  SVGElementInstanceList:false, 
                  SVGEllipseElement:false, 
                  SVGExternalResourcesRequired:false, 
                  SVGFEBlendElement:false, 
                  SVGFEColorMatrixElement:false, 
                  SVGFEComponentTransferElement:false, 
                  SVGFECompositeElement:false, 
                  SVGFEConvolveMatrixElement:false, 
                  SVGFEDiffuseLightingElement:false, 
                  SVGFEDisplacementMapElement:false, 
                  SVGFEDistantLightElement:false, 
                  SVGFEFloodElement:false, 
                  SVGFEFuncAElement:false, 
                  SVGFEFuncBElement:false, 
                  SVGFEFuncGElement:false, 
                  SVGFEFuncRElement:false, 
                  SVGFEGaussianBlurElement:false, 
                  SVGFEImageElement:false, 
                  SVGFEMergeElement:false, 
                  SVGFEMergeNodeElement:false, 
                  SVGFEMorphologyElement:false, 
                  SVGFEOffsetElement:false, 
                  SVGFEPointLightElement:false, 
                  SVGFESpecularLightingElement:false, 
                  SVGFESpotLightElement:false, 
                  SVGFETileElement:false, 
                  SVGFETurbulenceElement:false, 
                  SVGFilterElement:false, 
                  SVGFilterPrimitiveStandardAttributes:false, 
                  SVGFitToViewBox:false, 
                  SVGFontElement:false, 
                  SVGFontFaceElement:false, 
                  SVGFontFaceFormatElement:false, 
                  SVGFontFaceNameElement:false, 
                  SVGFontFaceSrcElement:false, 
                  SVGFontFaceUriElement:false, 
                  SVGForeignObjectElement:false, 
                  SVGGElement:false, 
                  SVGGlyphElement:false, 
                  SVGGlyphRefElement:false, 
                  SVGGradientElement:false, 
                  SVGHKernElement:false, 
                  SVGICCColor:false, 
                  SVGImageElement:false, 
                  SVGLangSpace:false, 
                  SVGLength:false, 
                  SVGLengthList:false, 
                  SVGLineElement:false, 
                  SVGLinearGradientElement:false, 
                  SVGLocatable:false, 
                  SVGMPathElement:false, 
                  SVGMarkerElement:false, 
                  SVGMaskElement:false, 
                  SVGMatrix:false, 
                  SVGMetadataElement:false, 
                  SVGMissingGlyphElement:false, 
                  SVGNumber:false, 
                  SVGNumberList:false, 
                  SVGPaint:false, 
                  SVGPathElement:false, 
                  SVGPathSeg:false, 
                  SVGPathSegArcAbs:false, 
                  SVGPathSegArcRel:false, 
                  SVGPathSegClosePath:false, 
                  SVGPathSegCurvetoCubicAbs:false, 
                  SVGPathSegCurvetoCubicRel:false, 
                  SVGPathSegCurvetoCubicSmoothAbs:false, 
                  SVGPathSegCurvetoCubicSmoothRel:false, 
                  SVGPathSegCurvetoQuadraticAbs:false, 
                  SVGPathSegCurvetoQuadraticRel:false, 
                  SVGPathSegCurvetoQuadraticSmoothAbs:false, 
                  SVGPathSegCurvetoQuadraticSmoothRel:false, 
                  SVGPathSegLinetoAbs:false, 
                  SVGPathSegLinetoHorizontalAbs:false, 
                  SVGPathSegLinetoHorizontalRel:false, 
                  SVGPathSegLinetoRel:false, 
                  SVGPathSegLinetoVerticalAbs:false, 
                  SVGPathSegLinetoVerticalRel:false, 
                  SVGPathSegList:false, 
                  SVGPathSegMovetoAbs:false, 
                  SVGPathSegMovetoRel:false, 
                  SVGPatternElement:false, 
                  SVGPoint:false, 
                  SVGPointList:false, 
                  SVGPolygonElement:false, 
                  SVGPolylineElement:false, 
                  SVGPreserveAspectRatio:false, 
                  SVGRadialGradientElement:false, 
                  SVGRect:false, 
                  SVGRectElement:false, 
                  SVGRenderingIntent:false, 
                  SVGSVGElement:false, 
                  SVGScriptElement:false, 
                  SVGSetElement:false, 
                  SVGStopElement:false, 
                  SVGStringList:false, 
                  SVGStylable:false, 
                  SVGStyleElement:false, 
                  SVGSwitchElement:false, 
                  SVGSymbolElement:false, 
                  SVGTRefElement:false, 
                  SVGTSpanElement:false, 
                  SVGTests:false, 
                  SVGTextContentElement:false, 
                  SVGTextElement:false, 
                  SVGTextPathElement:false, 
                  SVGTextPositioningElement:false, 
                  SVGTitleElement:false, 
                  SVGTransform:false, 
                  SVGTransformList:false, 
                  SVGTransformable:false, 
                  SVGURIReference:false, 
                  SVGUnitTypes:false, 
                  SVGUseElement:false, 
                  SVGVKernElement:false, 
                  SVGViewElement:false, 
                  SVGViewSpec:false, 
                  SVGZoomAndPan:false, 
                  TimeEvent:false, 
                  top:false, 
                  Uint16Array:false, 
                  Uint32Array:false, 
                  Uint8Array:false, 
                  Uint8ClampedArray:false, 
                  WebSocket:false, 
                  window:false, 
                  Worker:false, 
                  XMLHttpRequest:false, 
                  XMLSerializer:false, 
                  XPathEvaluator:false, 
                  XPathException:false, 
                  XPathExpression:false, 
                  XPathNamespace:false, 
                  XPathNSResolver:false, 
                  XPathResult:false               }
;
               exports.devel =  {
                  alert:false, 
                  confirm:false, 
                  console:false, 
                  Debug:false, 
                  opera:false, 
                  prompt:false               }
;
               exports.worker =  {
                  importScripts:true, 
                  postMessage:true, 
                  self:true               }
;
               exports.nonstandard =  {
                  escape:false, 
                  unescape:false               }
;
               exports.couch =  {
                  require:false, 
                  respond:false, 
                  getRow:false, 
                  emit:false, 
                  send:false, 
                  start:false, 
                  sum:false, 
                  log:false, 
                  exports:false, 
                  module:false, 
                  provides:false               }
;
               exports.node =  {
                  __filename:false, 
                  __dirname:false, 
                  Buffer:false, 
                  DataView:false, 
                  console:false, 
                  exports:true, 
                  GLOBAL:false, 
                  global:false, 
                  module:false, 
                  process:false, 
                  require:false, 
                  setTimeout:false, 
                  clearTimeout:false, 
                  setInterval:false, 
                  clearInterval:false               }
;
               exports.phantom =  {
                  phantom:true, 
                  require:true, 
                  WebPage:true               }
;
               exports.rhino =  {
                  defineClass:false, 
                  deserialize:false, 
                  gc:false, 
                  help:false, 
                  importPackage:false, 
                  java:false, 
                  load:false, 
                  loadClass:false, 
                  print:false, 
                  quit:false, 
                  readFile:false, 
                  readUrl:false, 
                  runCommand:false, 
                  seal:false, 
                  serialize:false, 
                  spawn:false, 
                  sync:false, 
                  toint32:false, 
                  version:false               }
;
               exports.wsh =  {
                  ActiveXObject:true, 
                  Enumerator:true, 
                  GetObject:true, 
                  ScriptEngine:true, 
                  ScriptEngineBuildVersion:true, 
                  ScriptEngineMajorVersion:true, 
                  ScriptEngineMinorVersion:true, 
                  VBArray:true, 
                  WSH:true, 
                  WScript:true, 
                  XDomainRequest:true               }
;
               exports.dojo =  {
                  dojo:false, 
                  dijit:false, 
                  dojox:false, 
                  define:false, 
                  require:false               }
;
               exports.jquery =  {
                  $:false, 
                  jQuery:false               }
;
               exports.mootools =  {
                  $:false, 
                  $$:false, 
                  Asset:false, 
                  Browser:false, 
                  Chain:false, 
                  Class:false, 
                  Color:false, 
                  Cookie:false, 
                  Core:false, 
                  Document:false, 
                  DomReady:false, 
                  DOMEvent:false, 
                  DOMReady:false, 
                  Drag:false, 
                  Element:false, 
                  Elements:false, 
                  Event:false, 
                  Events:false, 
                  Fx:false, 
                  Group:false, 
                  Hash:false, 
                  HtmlTable:false, 
                  Iframe:false, 
                  IframeShim:false, 
                  InputValidator:false, 
                  instanceOf:false, 
                  Keyboard:false, 
                  Locale:false, 
                  Mask:false, 
                  MooTools:false, 
                  Native:false, 
                  Options:false, 
                  OverText:false, 
                  Request:false, 
                  Scroller:false, 
                  Slick:false, 
                  Slider:false, 
                  Sortables:false, 
                  Spinner:false, 
                  Swiff:false, 
                  Tips:false, 
                  Type:false, 
                  typeOf:false, 
                  URI:false, 
                  Window:false               }
;
               exports.prototypejs =  {
                  $:false, 
                  $$:false, 
                  $A:false, 
                  $F:false, 
                  $H:false, 
                  $R:false, 
                  $break:false, 
                  $continue:false, 
                  $w:false, 
                  Abstract:false, 
                  Ajax:false, 
                  Class:false, 
                  Enumerable:false, 
                  Element:false, 
                  Event:false, 
                  Field:false, 
                  Form:false, 
                  Hash:false, 
                  Insertion:false, 
                  ObjectRange:false, 
                  PeriodicalExecuter:false, 
                  Position:false, 
                  Prototype:false, 
                  Selector:false, 
                  Template:false, 
                  Toggle:false, 
                  Try:false, 
                  Autocompleter:false, 
                  Builder:false, 
                  Control:false, 
                  Draggable:false, 
                  Draggables:false, 
                  Droppables:false, 
                  Effect:false, 
                  Sortable:false, 
                  SortableObserver:false, 
                  Sound:false, 
                  Scriptaculous:false               }
;
               exports.yui =  {
                  YUI:false, 
                  Y:false, 
                  YUI_config:false               }
;
            }
();
         }
,  {} ], 
         :[function(require, module, exports)  {
            "use string";
            exports.unsafeString = /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i;
            exports.unsafeChars = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;
            exports.needEsc = /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;
            exports.needEscGlobal = /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
            exports.starSlash = /\*\//;
            exports.identifier = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/;
            exports.javascriptURL = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i;
            exports.fallsThrough = /^\s*\/\*\s*falls?\sthrough\s*\*\/\s*$/;
         }
,  {} ], 
         :[function(require, module, exports)  {
            "use strict";
            var state =  {
               syntax: {} , 
               reset:function()  {
                  this.tokens =  {
                     prev:null, 
                     next:null, 
                     curr:null                  }
, this.option =  {} ;
                  this.ignored =  {} ;
                  this.directive =  {} ;
                  this.jsonMode = false;
                  this.jsonWarnings = [];
                  this.lines = [];
                  this.tab = "";
                  this.cache =  {} ;
               }} ;
            exports.state = state;
         }
,  {} ], 
         :[function(require, module, exports)  {
            function()  {
               "use strict";
               exports.register = function(linter)  {
                  linter.on("Identifier", function(data)  {
                        if (linter.getOption("proto"))  {
                           return ;
                        }
                        if (data.name === "__proto__")  {
                           linter.warn("W103",  {
                                 line:data.line, 
                                 char:data.char, 
                                 data:[data.name]                              }
                           );
                        }
                     }
                  );
                  linter.on("Identifier", function(data)  {
                        if (linter.getOption("iterator"))  {
                           return ;
                        }
                        if (data.name === "__iterator__")  {
                           linter.warn("W104",  {
                                 line:data.line, 
                                 char:data.char, 
                                 data:[data.name]                              }
                           );
                        }
                     }
                  );
                  linter.on("Identifier", function(data)  {
                        if (! linter.getOption("nomen"))  {
                           return ;
                        }
                        if (data.name === "_")  {
                           return ;
                        }
                        if (linter.getOption("node"))  {
                           if (/^(__dirname|__filename)$/.test(data.name) && ! data.isProperty)  {
                              return ;
                           }
                        }
                        if (/^(_+.*|.*_+)$/.test(data.name))  {
                           linter.warn("W105",  {
                                 line:data.line, 
                                 char:data.from, 
                                 data:["dangling '_'", data.name]                              }
                           );
                        }
                     }
                  );
                  linter.on("Identifier", function(data)  {
                        if (! linter.getOption("camelcase"))  {
                           return ;
                        }
                        if (data.name.replace(/^_+/, "").indexOf("_") > - 1 && ! data.name.match(/^[A-Z0-9_]*$/))  {
                           linter.warn("W106",  {
                                 line:data.line, 
                                 char:data.from, 
                                 data:[data.name]                              }
                           );
                        }
                     }
                  );
                  linter.on("String", function(data)  {
                        var quotmark = linter.getOption("quotmark");
                        var code;
                        if (! quotmark)  {
                           return ;
                        }
                        if (quotmark === "single" && data.quote !== "'")  {
                           code = "W109";
                        }
                        if (quotmark === "double" && data.quote !== """)  {
                           code = "W108";
                        }
                        if (quotmark === true)  {
                           if (! linter.getCache("quotmark"))  {
                              linter.setCache("quotmark", data.quote);
                           }
                           if (linter.getCache("quotmark") !== data.quote)  {
                              code = "W110";
                           }
                        }
                        if (code)  {
                           linter.warn(code,  {
                                 line:data.line, 
                                 char:data.char                              }
                           );
                        }
                     }
                  );
                  linter.on("Number", function(data)  {
                        if (data.value.charAt(0) === ".")  {
                           linter.warn("W008",  {
                                 line:data.line, 
                                 char:data.char, 
                                 data:[data.value]                              }
                           );
                        }
                        if (data.value.substr(data.value.length - 1) === ".")  {
                           linter.warn("W047",  {
                                 line:data.line, 
                                 char:data.char, 
                                 data:[data.value]                              }
                           );
                        }
                        if (/^00+/.test(data.value))  {
                           linter.warn("W046",  {
                                 line:data.line, 
                                 char:data.char, 
                                 data:[data.value]                              }
                           );
                        }
                     }
                  );
                  linter.on("String", function(data)  {
                        var re = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i;
                        if (linter.getOption("scripturl"))  {
                           return ;
                        }
                        if (re.test(data.value))  {
                           linter.warn("W107",  {
                                 line:data.line, 
                                 char:data.char                              }
                           );
                        }
                     }
                  );
               }
;
            }
();
         }
,  {} ], 
         jshint:[function(require, module, exports)  {
            module.exports = require("B01lSJ");
         }
,  {} ], 
         B01lSJ:[function(require, module, exports)  {
            function()  {
               var _ = require("underscore");
               var events = require("events");
               var vars = require("../shared/vars.js");
               var messages = require("../shared/messages.js");
               var Lexer = require("./lex.js").Lexer;
               var reg = require("./reg.js");
               var state = require("./state.js").state;
               var style = require("./style.js");
               var console = require("console-browserify");
               var JSHINT = function()  {
                  "use strict";
                  var anonname, api, bang =  {
                     <:true, 
                     <=:true, 
                     ==:true, 
                     ===:true, 
                     !==:true, 
                     !=:true, 
                     >:true, 
                     >=:true, 
                     +:true, 
                     -:true, 
                     *:true, 
                     /:true, 
                     %:true                  }
, boolOptions =  {
                     asi:true, 
                     bitwise:true, 
                     boss:true, 
                     browser:true, 
                     camelcase:true, 
                     couch:true, 
                     curly:true, 
                     debug:true, 
                     devel:true, 
                     dojo:true, 
                     eqeqeq:true, 
                     eqnull:true, 
                     es3:true, 
                     es5:true, 
                     esnext:true, 
                     moz:true, 
                     evil:true, 
                     expr:true, 
                     forin:true, 
                     funcscope:true, 
                     gcl:true, 
                     globalstrict:true, 
                     immed:true, 
                     iterator:true, 
                     jquery:true, 
                     lastsemic:true, 
                     laxbreak:true, 
                     laxcomma:true, 
                     loopfunc:true, 
                     mootools:true, 
                     multistr:true, 
                     newcap:true, 
                     noarg:true, 
                     node:true, 
                     noempty:true, 
                     nonew:true, 
                     nonstandard:true, 
                     nomen:true, 
                     onevar:true, 
                     passfail:true, 
                     phantom:true, 
                     plusplus:true, 
                     proto:true, 
                     prototypejs:true, 
                     rhino:true, 
                     undef:true, 
                     scripturl:true, 
                     shadow:true, 
                     smarttabs:true, 
                     strict:true, 
                     sub:true, 
                     supernew:true, 
                     trailing:true, 
                     validthis:true, 
                     withstmt:true, 
                     white:true, 
                     worker:true, 
                     wsh:true, 
                     yui:true, 
                     onecase:true, 
                     regexp:true, 
                     regexdash:true                  }
, valOptions =  {
                     maxlen:false, 
                     indent:false, 
                     maxerr:false, 
                     predef:false, 
                     quotmark:false, 
                     scope:false, 
                     maxstatements:false, 
                     maxdepth:false, 
                     maxparams:false, 
                     maxcomplexity:false, 
                     unused:true, 
                     latedef:false                  }
, invertedOptions =  {
                     bitwise:true, 
                     forin:true, 
                     newcap:true, 
                     nomen:true, 
                     plusplus:true, 
                     regexp:true, 
                     undef:true, 
                     white:true, 
                     eqeqeq:true, 
                     onevar:true, 
                     strict:true                  }
, renamedOptions =  {
                     eqeq:"eqeqeq", 
                     vars:"onevar", 
                     windows:"wsh", 
                     sloppy:"strict"                  }
, declared, exported, functionicity = ["closure", "exception", "global", "label", "outer", "unused", "var"], funct, functions, global, implied, inblock, indent, lookahead, lex, member, membersOnly, noreach, predefined, scope, stack, unuseds, urls, warnings, extraModules = [], emitter = new events.EventEmitter();
                  function checkOption(name, t)  {
                     name = name.trim();
                     if (/^[+-]W\d{3}$/g.test(name))  {
                        return true;
                     }
                     if (valOptions[name] === undefined && boolOptions[name] === undefined)  {
                        if (t.type !== "jslint")  {
                           error("E001", t, name);
                           return false;
                        }
                     }
                     return true;
                  }
;
                  function isString(obj)  {
                     return Object.prototype.toString.call(obj) === "[object String]";
                  }
;
                  function isIdentifier(tkn, value)  {
                     if (! tkn) return false                     if (! tkn.identifier || tkn.value !== value) return false                     return true;
                  }
;
                  function isReserved(token)  {
                     if (! token.reserved)  {
                        return false;
                     }
                     if (token.meta && token.meta.isFutureReservedWord)  {
                        if (state.option.inES5(true) && ! token.meta.es5)  {
                           return false;
                        }
                        if (token.meta.strictOnly)  {
                           if (! state.option.strict && ! state.directive["use strict"])  {
                              return false;
                           }
                        }
                        if (token.isProperty)  {
                           return false;
                        }
                     }
                     return true;
                  }
;
                  function supplant(str, data)  {
                     return str.replace(/\{([^{}]*)\}/g, function(a, b)  {
                           var r = data[b];
                           return typeof r === "string" || typeof r === "number" ? r : a;
                        }
                     );
                  }
;
                  function combine(t, o)  {
                     var n;
                     for (n in o)  {
                           if (_.has(o, n) && ! _.has(JSHINT.blacklist, n))  {
                              t[n] = o[n];
                           }
                        }
                  }
;
                  function updatePredefined()  {
                     Object.keys(JSHINT.blacklist).forEach(function(key)  {
                           delete predefined[key];
                        }
                     );
                  }
;
                  function assume()  {
                     if (state.option.es5)  {
                        warning("I003");
                     }
                     if (state.option.couch)  {
                        combine(predefined, vars.couch);
                     }
                     if (state.option.rhino)  {
                        combine(predefined, vars.rhino);
                     }
                     if (state.option.phantom)  {
                        combine(predefined, vars.phantom);
                     }
                     if (state.option.prototypejs)  {
                        combine(predefined, vars.prototypejs);
                     }
                     if (state.option.node)  {
                        combine(predefined, vars.node);
                     }
                     if (state.option.devel)  {
                        combine(predefined, vars.devel);
                     }
                     if (state.option.dojo)  {
                        combine(predefined, vars.dojo);
                     }
                     if (state.option.browser)  {
                        combine(predefined, vars.browser);
                     }
                     if (state.option.nonstandard)  {
                        combine(predefined, vars.nonstandard);
                     }
                     if (state.option.jquery)  {
                        combine(predefined, vars.jquery);
                     }
                     if (state.option.mootools)  {
                        combine(predefined, vars.mootools);
                     }
                     if (state.option.worker)  {
                        combine(predefined, vars.worker);
                     }
                     if (state.option.wsh)  {
                        combine(predefined, vars.wsh);
                     }
                     if (state.option.globalstrict && state.option.strict !== false)  {
                        state.option.strict = true;
                     }
                     if (state.option.yui)  {
                        combine(predefined, vars.yui);
                     }
                     state.option.inMoz = function(strict)  {
                        if (strict)  {
                           return state.option.moz && ! state.option.esnext;
                        }
                        return state.option.moz;
                     }
;
                     state.option.inESNext = function(strict)  {
                        if (strict)  {
                           return ! state.option.moz && state.option.esnext;
                        }
                        return state.option.moz || state.option.esnext;
                     }
;
                     state.option.inES5 = function(strict)  {
                        if (strict)  {
                           return ! state.option.moz && ! state.option.esnext && ! state.option.es3;
                        }
                        return ! state.option.es3;
                     }
;
                     state.option.inES3 = function(strict)  {
                        if (strict)  {
                           return ! state.option.moz && ! state.option.esnext && state.option.es3;
                        }
                        return state.option.es3;
                     }
;
                  }
;
                  function quit(code, line, chr)  {
                     var percentage = Math.floor(line / state.lines.length * 100);
                     var message = messages.errors[code].desc;
                     throw  {
                        name:"JSHintError", 
                        line:line, 
                        character:chr, 
                        message:message + " (" + percentage + "% scanned).", 
                        raw:message                     }
;
                  }
;
                  function isundef(scope, code, token, a)  {
                     return JSHINT.undefs.push([scope, code, token, a]);
                  }
;
                  function warning(code, t, a, b, c, d)  {
                     var ch, l, w, msg;
                     if (/^W\d{3}$/.test(code))  {
                        if (state.ignored[code]) return                         msg = messages.warnings[code];
                     }
                      else if (/E\d{3}/.test(code))  {
                        msg = messages.errors[code];
                     }
                      else if (/I\d{3}/.test(code))  {
                        msg = messages.info[code];
                     }
                     t = t || state.tokens.next;
                     if (t.id === "(end)")  {
                        t = state.tokens.curr;
                     }
                     l = t.line || 0;
                     ch = t.from || 0;
                     w =  {
                        id:"(error)", 
                        raw:msg.desc, 
                        code:msg.code, 
                        evidence:state.lines[l - 1] || "", 
                        line:l, 
                        character:ch, 
                        scope:JSHINT.scope, 
                        a:a, 
                        b:b, 
                        c:c, 
                        d:d                     }
;
                     w.reason = supplant(msg.desc, w);
                     JSHINT.errors.push(w);
                     if (state.option.passfail)  {
                        quit("E042", l, ch);
                     }
                     warnings = 1;
                     if (warnings >= state.option.maxerr)  {
                        quit("E043", l, ch);
                     }
                     return w;
                  }
;
                  function warningAt(m, l, ch, a, b, c, d)  {
                     return warning(m,  {
                           line:l, 
                           from:ch                        }, 
                        a, b, c, d);
                  }
;
                  function error(m, t, a, b, c, d)  {
                     warning(m, t, a, b, c, d);
                  }
;
                  function errorAt(m, l, ch, a, b, c, d)  {
                     return error(m,  {
                           line:l, 
                           from:ch                        }, 
                        a, b, c, d);
                  }
;
                  function addInternalSrc(elem, src)  {
                     var i;
                     i =  {
                        id:"(internal)", 
                        elem:elem, 
                        value:src                     }
;
                     JSHINT.internals.push(i);
                     return i;
                  }
;
                  function addlabel(t, type, tkn, islet)  {
                     if (type === "exception")  {
                        if (_.has(funct["(context)"], t))  {
                           if (funct[t] !== true && ! state.option.node)  {
                              warning("W002", state.tokens.next, t);
                           }
                        }
                     }
                     if (_.has(funct, t) && ! funct["(global)"])  {
                        if (funct[t] === true)  {
                           if (state.option.latedef)  {
                              if (state.option.latedef === true && _.contains([funct[t], type], "unction") || ! _.contains([funct[t], type], "unction"))  {
                                 warning("W003", state.tokens.next, t);
                              }
                           }
                        }
                         else  {
                           if (! state.option.shadow && type !== "exception" || funct["(blockscope)"].getlabel(t))  {
                              warning("W004", state.tokens.next, t);
                           }
                        }
                     }
                     if (funct["(blockscope)"] && funct["(blockscope)"].current.has(t))  {
                        error("E044", state.tokens.next, t);
                     }
                     if (islet)  {
                        funct["(blockscope)"].current.add(t, type, state.tokens.curr);
                     }
                      else  {
                        funct[t] = type;
                        if (tkn)  {
                           funct["(tokens)"][t] = tkn;
                        }
                        if (funct["(global)"])  {
                           global[t] = funct;
                           if (_.has(implied, t))  {
                              if (state.option.latedef)  {
                                 if (state.option.latedef === true && _.contains([funct[t], type], "unction") || ! _.contains([funct[t], type], "unction"))  {
                                    warning("W003", state.tokens.next, t);
                                 }
                              }
                              delete implied[t];
                           }
                        }
                         else  {
                           scope[t] = funct;
                        }
                     }
                  }
;
                  function doOption()  {
                     var nt = state.tokens.next;
                     var body = nt.body.split(",").map(function(s)  {
                           return s.trim();
                        }
                     );
                     var predef =  {} ;
                     if (nt.type === "globals")  {
                        body.forEach(function(g)  {
                              g = g.split(":");
                              var key = g[0];
                              var val = g[1];
                              if (key.charAt(0) === "-")  {
                                 key = key.slice(1);
                                 val = false;
                                 JSHINT.blacklist[key] = key;
                                 updatePredefined();
                              }
                               else  {
                                 predef[key] = val === "true";
                              }
                           }
                        );
                        combine(predefined, predef);
                        for (var key in predef)  {
                              if (_.has(predef, key))  {
                                 declared[key] = nt;
                              }
                           }
                     }
                     if (nt.type === "exported")  {
                        body.forEach(function(e)  {
                              exported[e] = true;
                           }
                        );
                     }
                     if (nt.type === "members")  {
                        membersOnly = membersOnly ||  {} ;
                        body.forEach(function(m)  {
                              var ch1 = m.charAt(0);
                              var ch2 = m.charAt(m.length - 1);
                              if (ch1 === ch2 && ch1 === """ || ch1 === "'")  {
                                 m = m.substr(1, m.length - 2).replace("\b", "").replace("\t", "	").replace("\n", "
").replace("\v", "").replace("\f", "").replace("\r", "").replace("\\", "\").replace("\"", """);
                              }
                              membersOnly[m] = false;
                           }
                        );
                     }
                     var numvals = ["maxstatements", "maxparams", "maxdepth", "maxcomplexity", "maxerr", "maxlen", "indent"];
                     if (nt.type === "jshint" || nt.type === "jslint")  {
                        body.forEach(function(g)  {
                              g = g.split(":");
                              var key = g[0] || "".trim();
                              var val = g[1] || "".trim();
                              if (! checkOption(key, nt))  {
                                 return ;
                              }
                              if (numvals.indexOf(key) >= 0)  {
                                 if (val !== "false")  {
                                    val = + val;
                                    if (typeof val !== "number" || ! isFinite(val) || val <= 0 || Math.floor(val) !== val)  {
                                       error("E032", nt, g[1].trim());
                                       return ;
                                    }
                                    if (key === "indent")  {
                                       state.option["(explicitIndent)"] = true;
                                    }
                                    state.option[key] = val;
                                 }
                                  else  {
                                    if (key === "indent")  {
                                       state.option["(explicitIndent)"] = false;
                                    }
                                     else  {
                                       state.option[key] = false;
                                    }
                                 }
                                 return ;
                              }
                              if (key === "validthis")  {
                                 if (funct["(global)"])  {
                                    error("E009");
                                 }
                                  else  {
                                    if (val === "true" || val === "false")  {
                                       state.option.validthis = val === "true";
                                    }
                                     else  {
                                       error("E002", nt);
                                    }
                                 }
                                 return ;
                              }
                              if (key === "quotmark")  {
                                 switch(val) {
                                    case "true":
 
                                       
                                    case "false":
 
                                          state.option.quotmark = val === "true";
                                          break;
                                       
                                    case "double":
 
                                       
                                    case "single":
 
                                          state.option.quotmark = val;
                                          break;
                                       
                                    default:
 
                                          error("E002", nt);
                                       
}
;
                                 return ;
                              }
                              if (key === "unused")  {
                                 switch(val) {
                                    case "true":
 
                                          state.option.unused = true;
                                          break;
                                       
                                    case "false":
 
                                          state.option.unused = false;
                                          break;
                                       
                                    case "vars":
 
                                       
                                    case "strict":
 
                                          state.option.unused = val;
                                          break;
                                       
                                    default:
 
                                          error("E002", nt);
                                       
}
;
                                 return ;
                              }
                              if (key === "latedef")  {
                                 switch(val) {
                                    case "true":
 
                                          state.option.latedef = true;
                                          break;
                                       
                                    case "false":
 
                                          state.option.latedef = false;
                                          break;
                                       
                                    case "nofunc":
 
                                          state.option.latedef = "nofunc";
                                          break;
                                       
                                    default:
 
                                          error("E002", nt);
                                       
}
;
                                 return ;
                              }
                              var match = /^([+-])(W\d{3})$/g.exec(key);
                              if (match)  {
                                 state.ignored[match[2]] = match[1] === "-";
                                 return ;
                              }
                              var tn;
                              if (val === "true" || val === "false")  {
                                 if (nt.type === "jslint")  {
                                    tn = renamedOptions[key] || key;
                                    state.option[tn] = val === "true";
                                    if (invertedOptions[tn] !== undefined)  {
                                       state.option[tn] = ! state.option[tn];
                                    }
                                 }
                                  else  {
                                    state.option[key] = val === "true";
                                 }
                                 if (key === "newcap")  {
                                    state.option["(explicitNewcap)"] = true;
                                 }
                                 return ;
                              }
                              error("E002", nt);
                           }
                        );
                        assume();
                     }
                  }
;
                  function peek(p)  {
                     var i = p || 0, j = 0, t;
                     while (j <= i)  {
                           t = lookahead[j];
                           if (! t)  {
                              t = lookahead[j] = lex.token();
                           }
                           j = 1;
                        }
                     return t;
                  }
;
                  function advance(id, t)  {
                     switch(state.tokens.curr.id) {
                        case "(number)":
 
                              if (state.tokens.next.id === ".")  {
                                 warning("W005", state.tokens.curr);
                              }
                              break;
                           
                        case "-":
 
                              if (state.tokens.next.id === "-" || state.tokens.next.id === "--")  {
                                 warning("W006");
                              }
                              break;
                           
                        case "+":
 
                              if (state.tokens.next.id === "+" || state.tokens.next.id === "++")  {
                                 warning("W007");
                              }
                              break;
                           
}
;
                     if (state.tokens.curr.type === "(string)" || state.tokens.curr.identifier)  {
                        anonname = state.tokens.curr.value;
                     }
                     if (id && state.tokens.next.id !== id)  {
                        if (t)  {
                           if (state.tokens.next.id === "(end)")  {
                              error("E019", t, t.id);
                           }
                            else  {
                              error("E020", state.tokens.next, id, t.id, t.line, state.tokens.next.value);
                           }
                        }
                         else if (state.tokens.next.type !== "(identifier)" || state.tokens.next.value !== id)  {
                           warning("W116", state.tokens.next, id, state.tokens.next.value);
                        }
                     }
                     state.tokens.prev = state.tokens.curr;
                     state.tokens.curr = state.tokens.next;
                     for (; ; )  {
                           state.tokens.next = lookahead.shift() || lex.token();
                           if (! state.tokens.next)  {
                              quit("E041", state.tokens.curr.line);
                           }
                           if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)")  {
                              return ;
                           }
                           if (state.tokens.next.check)  {
                              state.tokens.next.check();
                           }
                           if (state.tokens.next.isSpecial)  {
                              doOption();
                           }
                            else  {
                              if (state.tokens.next.id !== "(endline)")  {
                                 break;
                              }
                           }
                        }
                  }
;
                  function expression(rbp, initial)  {
                     var left, isArray = false, isObject = false, isLetExpr = false;
                     if (! initial && state.tokens.next.value === "let" && peek(0).value === "(")  {
                        if (! state.option.inMoz(true))  {
                           warning("W118", state.tokens.next, "let expressions");
                        }
                        isLetExpr = true;
                        funct["(blockscope)"].stack();
                        advance("let");
                        advance("(");
                        state.syntax["let"].fud.call(state.syntax["let"].fud, false);
                        advance(")");
                     }
                     if (state.tokens.next.id === "(end)") error("E006", state.tokens.curr)                     advance();
                     if (initial)  {
                        anonname = "anonymous";
                        funct["(verb)"] = state.tokens.curr.value;
                     }
                     if (initial === true && state.tokens.curr.fud)  {
                        left = state.tokens.curr.fud();
                     }
                      else  {
                        if (state.tokens.curr.nud)  {
                           left = state.tokens.curr.nud();
                        }
                         else  {
                           error("E030", state.tokens.curr, state.tokens.curr.id);
                        }
                        var end_of_expr = state.tokens.next.identifier && ! state.tokens.curr.led && state.tokens.curr.line !== state.tokens.next.line;
                        while (rbp < state.tokens.next.lbp && ! end_of_expr)  {
                              isArray = state.tokens.curr.value === "Array";
                              isObject = state.tokens.curr.value === "Object";
                              if (left && left.value || left.first && left.first.value)  {
                                 if (left.value !== "new" || left.first && left.first.value && left.first.value === ".")  {
                                    isArray = false;
                                    if (left.value !== state.tokens.curr.value)  {
                                       isObject = false;
                                    }
                                 }
                              }
                              advance();
                              if (isArray && state.tokens.curr.id === "(" && state.tokens.next.id === ")")  {
                                 warning("W009", state.tokens.curr);
                              }
                              if (isObject && state.tokens.curr.id === "(" && state.tokens.next.id === ")")  {
                                 warning("W010", state.tokens.curr);
                              }
                              if (left && state.tokens.curr.led)  {
                                 left = state.tokens.curr.led(left);
                              }
                               else  {
                                 error("E033", state.tokens.curr, state.tokens.curr.id);
                              }
                           }
                     }
                     if (isLetExpr)  {
                        funct["(blockscope)"].unstack();
                     }
                     return left;
                  }
;
                  function adjacent(left, right)  {
                     left = left || state.tokens.curr;
                     right = right || state.tokens.next;
                     if (state.option.white)  {
                        if (left.character !== right.from && left.line === right.line)  {
                           left.from = left.character - left.from;
                           warning("W011", left, left.value);
                        }
                     }
                  }
;
                  function nobreak(left, right)  {
                     left = left || state.tokens.curr;
                     right = right || state.tokens.next;
                     if (state.option.white && left.character !== right.from || left.line !== right.line)  {
                        warning("W012", right, right.value);
                     }
                  }
;
                  function nospace(left, right)  {
                     left = left || state.tokens.curr;
                     right = right || state.tokens.next;
                     if (state.option.white && ! left.comment)  {
                        if (left.line === right.line)  {
                           adjacent(left, right);
                        }
                     }
                  }
;
                  function nonadjacent(left, right)  {
                     if (state.option.white)  {
                        left = left || state.tokens.curr;
                        right = right || state.tokens.next;
                        if (left.value === ";" && right.value === ";")  {
                           return ;
                        }
                        if (left.line === right.line && left.character === right.from)  {
                           left.from = left.character - left.from;
                           warning("W013", left, left.value);
                        }
                     }
                  }
;
                  function nobreaknonadjacent(left, right)  {
                     left = left || state.tokens.curr;
                     right = right || state.tokens.next;
                     if (! state.option.laxbreak && left.line !== right.line)  {
                        warning("W014", right, right.id);
                     }
                      else if (state.option.white)  {
                        left = left || state.tokens.curr;
                        right = right || state.tokens.next;
                        if (left.character === right.from)  {
                           left.from = left.character - left.from;
                           warning("W013", left, left.value);
                        }
                     }
                  }
;
                  function indentation(bias)  {
                     if (! state.option.white && ! state.option["(explicitIndent)"])  {
                        return ;
                     }
                     if (state.tokens.next.id === "(end)")  {
                        return ;
                     }
                     var i = indent + bias || 0;
                     if (state.tokens.next.from !== i)  {
                        warning("W015", state.tokens.next, state.tokens.next.value, i, state.tokens.next.from);
                     }
                  }
;
                  function nolinebreak(t)  {
                     t = t || state.tokens.curr;
                     if (t.line !== state.tokens.next.line)  {
                        warning("E022", t, t.value);
                     }
                  }
;
                  function comma(opts)  {
                     opts = opts ||  {} ;
                     if (state.tokens.curr.line !== state.tokens.next.line)  {
                        if (! state.option.laxcomma)  {
                           if (comma.first)  {
                              warning("I001");
                              comma.first = false;
                           }
                           warning("W014", state.tokens.curr, state.tokens.next.id);
                        }
                     }
                      else if (! state.tokens.curr.comment && state.tokens.curr.character !== state.tokens.next.from && state.option.white)  {
                        state.tokens.curr.from = state.tokens.curr.character - state.tokens.curr.from;
                        warning("W011", state.tokens.curr, state.tokens.curr.value);
                     }
                     advance(",");
                     if (state.tokens.next.value !== "]" && state.tokens.next.value !== "}")  {
                        nonadjacent(state.tokens.curr, state.tokens.next);
                     }
                     if (state.tokens.next.identifier && ! state.option.inES5())  {
                        switch(state.tokens.next.value) {
                           case "break":
 
                              
                           case "case":
 
                              
                           case "catch":
 
                              
                           case "continue":
 
                              
                           case "default":
 
                              
                           case "do":
 
                              
                           case "else":
 
                              
                           case "finally":
 
                              
                           case "for":
 
                              
                           case "if":
 
                              
                           case "in":
 
                              
                           case "instanceof":
 
                              
                           case "return":
 
                              
                           case "yield":
 
                              
                           case "switch":
 
                              
                           case "throw":
 
                              
                           case "try":
 
                              
                           case "var":
 
                              
                           case "let":
 
                              
                           case "while":
 
                              
                           case "with":
 
                                 error("E024", state.tokens.next, state.tokens.next.value);
                                 return false;
                              
}
;
                     }
                     if (state.tokens.next.type === "(punctuator)")  {
                        switch(state.tokens.next.value) {
                           case "}":
 
                              
                           case "]":
 
                              
                           case ",":
 
                                 if (opts.allowTrailing)  {
                                    return true;
                                 }
                              
                           case ")":
 
                                 error("E024", state.tokens.next, state.tokens.next.value);
                                 return false;
                              
}
;
                     }
                     return true;
                  }
;
                  function symbol(s, p)  {
                     var x = state.syntax[s];
                     if (! x || typeof x !== "object")  {
                        state.syntax[s] = x =  {
                           id:s, 
                           lbp:p, 
                           value:s                        }
;
                     }
                     return x;
                  }
;
                  function delim(s)  {
                     return symbol(s, 0);
                  }
;
                  function stmt(s, f)  {
                     var x = delim(s);
                     x.identifier = x.reserved = true;
                     x.fud = f;
                     return x;
                  }
;
                  function blockstmt(s, f)  {
                     var x = stmt(s, f);
                     x.block = true;
                     return x;
                  }
;
                  function reserveName(x)  {
                     var c = x.id.charAt(0);
                     if (c >= "a" && c <= "z" || c >= "A" && c <= "Z")  {
                        x.identifier = x.reserved = true;
                     }
                     return x;
                  }
;
                  function prefix(s, f)  {
                     var x = symbol(s, 150);
                     reserveName(x);
                     x.nud = typeof f === "function" ? f : function()  {
                        this.right = expression(150);
                        this.arity = "unary";
                        if (this.id === "++" || this.id === "--")  {
                           if (state.option.plusplus)  {
                              warning("W016", this, this.id);
                           }
                            else if (! this.right.identifier || isReserved(this.right) && this.right.id !== "." && this.right.id !== "[")  {
                              warning("W017", this);
                           }
                        }
                        return this;
                     }
;
                     return x;
                  }
;
                  function type(s, f)  {
                     var x = delim(s);
                     x.type = s;
                     x.nud = f;
                     return x;
                  }
;
                  function reserve(name, func)  {
                     var x = type(name, func);
                     x.identifier = true;
                     x.reserved = true;
                     return x;
                  }
;
                  function FutureReservedWord(name, meta)  {
                     var x = type(name, function()  {
                           return this;
                        }
                     );
                     meta = meta ||  {} ;
                     meta.isFutureReservedWord = true;
                     x.value = name;
                     x.identifier = true;
                     x.reserved = true;
                     x.meta = meta;
                     return x;
                  }
;
                  function reservevar(s, v)  {
                     return reserve(s, function()  {
                           if (typeof v === "function")  {
                              v(this);
                           }
                           return this;
                        }
                     );
                  }
;
                  function infix(s, f, p, w)  {
                     var x = symbol(s, p);
                     reserveName(x);
                     x.led = function(left)  {
                        if (! w)  {
                           nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
                           nonadjacent(state.tokens.curr, state.tokens.next);
                        }
                        if (s === "in" && left.id === "!")  {
                           warning("W018", left, "!");
                        }
                        if (typeof f === "function")  {
                           return f(left, this);
                        }
                         else  {
                           this.left = left;
                           this.right = expression(p);
                           return this;
                        }
                     }
;
                     return x;
                  }
;
                  function application(s)  {
                     var x = symbol(s, 42);
                     x.led = function(left)  {
                        if (! state.option.inESNext())  {
                           warning("W104", state.tokens.curr, "arrow function syntax (=>)");
                        }
                        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
                        nonadjacent(state.tokens.curr, state.tokens.next);
                        this.left = left;
                        this.right = doFunction(undefined, undefined, false, left);
                        return this;
                     }
;
                     return x;
                  }
;
                  function relation(s, f)  {
                     var x = symbol(s, 100);
                     x.led = function(left)  {
                        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
                        nonadjacent(state.tokens.curr, state.tokens.next);
                        var right = expression(100);
                        if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN"))  {
                           warning("W019", this);
                        }
                         else if (f)  {
                           f.apply(this, [left, right]);
                        }
                        if (! left || ! right)  {
                           quit("E041", state.tokens.curr.line);
                        }
                        if (left.id === "!")  {
                           warning("W018", left, "!");
                        }
                        if (right.id === "!")  {
                           warning("W018", right, "!");
                        }
                        this.left = left;
                        this.right = right;
                        return this;
                     }
;
                     return x;
                  }
;
                  function isPoorRelation(node)  {
                     return node && node.type === "(number)" && + node.value === 0 || node.type === "(string)" && node.value === "" || node.type === "null" && ! state.option.eqnull || node.type === "true" || node.type === "false" || node.type === "undefined";
                  }
;
                  function assignop(s)  {
                     symbol(s, 20).exps = true;
                     return infix(s, function(left, that)  {
                           that.left = left;
                           if (left)  {
                              if (predefined[left.value] === false && scope[left.value]["(global)"] === true)  {
                                 warning("W020", left);
                              }
                               else if (left["function"])  {
                                 warning("W021", left, left.value);
                              }
                              if (funct[left.value] === "const")  {
                                 error("E013", left, left.value);
                              }
                              if (left.id === ".")  {
                                 if (! left.left)  {
                                    warning("E031", that);
                                 }
                                  else if (left.left.value === "arguments" && ! state.directive["use strict"])  {
                                    warning("E031", that);
                                 }
                                 that.right = expression(19);
                                 return that;
                              }
                               else if (left.id === "[")  {
                                 if (state.tokens.curr.left.first)  {
                                    state.tokens.curr.left.first.forEach(function(t)  {
                                          if (funct[t.value] === "const")  {
                                             error("E013", t, t.value);
                                          }
                                       }
                                    );
                                 }
                                  else if (! left.left)  {
                                    warning("E031", that);
                                 }
                                  else if (left.left.value === "arguments" && ! state.directive["use strict"])  {
                                    warning("E031", that);
                                 }
                                 that.right = expression(19);
                                 return that;
                              }
                               else if (left.identifier && ! isReserved(left))  {
                                 if (funct[left.value] === "exception")  {
                                    warning("W022", left);
                                 }
                                 that.right = expression(19);
                                 return that;
                              }
                              if (left === state.syntax["function"])  {
                                 warning("W023", state.tokens.curr);
                              }
                           }
                           error("E031", that);
                        }, 
                        20);
                  }
;
                  function bitwise(s, f, p)  {
                     var x = symbol(s, p);
                     reserveName(x);
                     x.led = typeof f === "function" ? f : function(left)  {
                        if (state.option.bitwise)  {
                           warning("W016", this, this.id);
                        }
                        this.left = left;
                        this.right = expression(p);
                        return this;
                     }
;
                     return x;
                  }
;
                  function bitwiseassignop(s)  {
                     symbol(s, 20).exps = true;
                     return infix(s, function(left, that)  {
                           if (state.option.bitwise)  {
                              warning("W016", that, that.id);
                           }
                           nonadjacent(state.tokens.prev, state.tokens.curr);
                           nonadjacent(state.tokens.curr, state.tokens.next);
                           if (left)  {
                              if (left.id === "." || left.id === "[" || left.identifier && ! isReserved(left))  {
                                 expression(19);
                                 return that;
                              }
                              if (left === state.syntax["function"])  {
                                 warning("W023", state.tokens.curr);
                              }
                              return that;
                           }
                           error("E031", that);
                        }, 
                        20);
                  }
;
                  function suffix(s)  {
                     var x = symbol(s, 150);
                     x.led = function(left)  {
                        if (state.option.plusplus)  {
                           warning("W016", this, this.id);
                        }
                         else if (! left.identifier || isReserved(left) && left.id !== "." && left.id !== "[")  {
                           warning("W017", this);
                        }
                        this.left = left;
                        return this;
                     }
;
                     return x;
                  }
;
                  function optionalidentifier(fnparam, prop)  {
                     if (! state.tokens.next.identifier)  {
                        return ;
                     }
                     advance();
                     var curr = state.tokens.curr;
                     var meta = curr.meta ||  {} ;
                     var val = state.tokens.curr.value;
                     if (! isReserved(curr))  {
                        return val;
                     }
                     if (prop)  {
                        if (state.option.inES5() || meta.isFutureReservedWord)  {
                           return val;
                        }
                     }
                     if (fnparam && val === "undefined")  {
                        return val;
                     }
                     if (prop && ! api.getCache("displayed:I002"))  {
                        api.setCache("displayed:I002", true);
                        warning("I002");
                     }
                     warning("W024", state.tokens.curr, state.tokens.curr.id);
                     return val;
                  }
;
                  function identifier(fnparam, prop)  {
                     var i = optionalidentifier(fnparam, prop);
                     if (i)  {
                        return i;
                     }
                     if (state.tokens.curr.id === "function" && state.tokens.next.id === "(")  {
                        warning("W025");
                     }
                      else  {
                        error("E030", state.tokens.next, state.tokens.next.value);
                     }
                  }
;
                  function reachable(s)  {
                     var i = 0, t;
                     if (state.tokens.next.id !== ";" || noreach)  {
                        return ;
                     }
                     for (; ; )  {
                           t = peek(i);
                           if (t.reach)  {
                              return ;
                           }
                           if (t.id !== "(endline)")  {
                              if (t.id === "function")  {
                                 if (! state.option.latedef)  {
                                    break;
                                 }
                                 warning("W026", t);
                                 break;
                              }
                              warning("W027", t, t.value, s);
                              break;
                           }
                           i = 1;
                        }
                  }
;
                  function statement(noindent)  {
                     var values;
                     var i = indent, r, s = scope, t = state.tokens.next;
                     if (t.id === ";")  {
                        advance(";");
                        return ;
                     }
                     var res = isReserved(t);
                     if (res && t.meta && t.meta.isFutureReservedWord)  {
                        warning("W024", t, t.id);
                        res = false;
                     }
                     if (_.has(["[", "{"], t.value))  {
                        if (lookupBlockType().isDestAssign)  {
                           if (! state.option.inESNext())  {
                              warning("W104", state.tokens.curr, "destructuring expression");
                           }
                           values = destructuringExpression();
                           values.forEach(function(tok)  {
                                 isundef(funct, "W117", tok.token, tok.id);
                              }
                           );
                           advance("=");
                           destructuringExpressionMatch(values, expression(0, true));
                           advance(";");
                           return ;
                        }
                     }
                     if (t.identifier && ! res && peek().id === ":")  {
                        advance();
                        advance(":");
                        scope = Object.create(s);
                        addlabel(t.value, "label");
                        if (! state.tokens.next.labelled && state.tokens.next.value !== "{")  {
                           warning("W028", state.tokens.next, t.value, state.tokens.next.value);
                        }
                        state.tokens.next.label = t.value;
                        t = state.tokens.next;
                     }
                     if (t.id === "{")  {
                        block(true, true);
                        return ;
                     }
                     if (! noindent)  {
                        indentation();
                     }
                     r = expression(0, true);
                     if (! t.block)  {
                        if (! state.option.expr && ! r || ! r.exps)  {
                           warning("W030", state.tokens.curr);
                        }
                         else if (state.option.nonew && r && r.left && r.id === "(" && r.left.id === "new")  {
                           warning("W031", t);
                        }
                        while (state.tokens.next.id === ",")  {
                              if (comma())  {
                                 r = expression(0, true);
                              }
                               else  {
                                 return ;
                              }
                           }
                        if (state.tokens.next.id !== ";")  {
                           if (! state.option.asi)  {
                              if (! state.option.lastsemic || state.tokens.next.id !== "}" || state.tokens.next.line !== state.tokens.curr.line)  {
                                 warningAt("W033", state.tokens.curr.line, state.tokens.curr.character);
                              }
                           }
                        }
                         else  {
                           adjacent(state.tokens.curr, state.tokens.next);
                           advance(";");
                           nonadjacent(state.tokens.curr, state.tokens.next);
                        }
                     }
                     indent = i;
                     scope = s;
                     return r;
                  }
;
                  function statements(startLine)  {
                     var a = [], p;
                     while (! state.tokens.next.reach && state.tokens.next.id !== "(end)")  {
                           if (state.tokens.next.id === ";")  {
                              p = peek();
                              if (! p || p.id !== "(" && p.id !== "[")  {
                                 warning("W032");
                              }
                              advance(";");
                           }
                            else  {
                              a.push(statement(startLine === state.tokens.next.line));
                           }
                        }
                     return a;
                  }
;
                  function directives()  {
                     var i, p, pn;
                     for (; ; )  {
                           if (state.tokens.next.id === "(string)")  {
                              p = peek(0);
                              if (p.id === "(endline)")  {
                                 i = 1;
                                 do  {
                                       pn = peek(i);
                                       i = i + 1;
                                    }
 while (pn.id === "(endline)")                                 if (pn.id !== ";")  {
                                    if (pn.id !== "(string)" && pn.id !== "(number)" && pn.id !== "(regexp)" && pn.identifier !== true && pn.id !== "}")  {
                                       break;
                                    }
                                    warning("W033", state.tokens.next);
                                 }
                                  else  {
                                    p = pn;
                                 }
                              }
                               else if (p.id === "}")  {
                                 warning("W033", p);
                              }
                               else if (p.id !== ";")  {
                                 break;
                              }
                              indentation();
                              advance();
                              if (state.directive[state.tokens.curr.value])  {
                                 warning("W034", state.tokens.curr, state.tokens.curr.value);
                              }
                              if (state.tokens.curr.value === "use strict")  {
                                 if (! state.option["(explicitNewcap)"]) state.option.newcap = true                                 state.option.undef = true;
                              }
                              state.directive[state.tokens.curr.value] = true;
                              if (p.id === ";")  {
                                 advance(";");
                              }
                              continue;
                           }
                           break;
                        }
                  }
;
                  function block(ordinary, stmt, isfunc, isfatarrow)  {
                     var a, b = inblock, old_indent = indent, m, s = scope, t, line, d;
                     inblock = ordinary;
                     if (! ordinary || ! state.option.funcscope) scope = Object.create(scope)                     nonadjacent(state.tokens.curr, state.tokens.next);
                     t = state.tokens.next;
                     var metrics = funct["(metrics)"];
                     metrics.nestedBlockDepth = 1;
                     metrics.verifyMaxNestedBlockDepthPerFunction();
                     if (state.tokens.next.id === "{")  {
                        advance("{");
                        funct["(blockscope)"].stack();
                        line = state.tokens.curr.line;
                        if (state.tokens.next.id !== "}")  {
                           indent = state.option.indent;
                           while (! ordinary && state.tokens.next.from > indent)  {
                                 indent = state.option.indent;
                              }
                           if (isfunc)  {
                              m =  {} ;
                              for (d in state.directive)  {
                                    if (_.has(state.directive, d))  {
                                       m[d] = state.directive[d];
                                    }
                                 }
                              directives();
                              if (state.option.strict && funct["(context)"]["(global)"])  {
                                 if (! m["use strict"] && ! state.directive["use strict"])  {
                                    warning("E007");
                                 }
                              }
                           }
                           a = statements(line);
                           metrics.statementCount = a.length;
                           if (isfunc)  {
                              state.directive = m;
                           }
                           indent = state.option.indent;
                           if (line !== state.tokens.next.line)  {
                              indentation();
                           }
                        }
                         else if (line !== state.tokens.next.line)  {
                           indentation();
                        }
                        advance("}", t);
                        funct["(blockscope)"].unstack();
                        indent = old_indent;
                     }
                      else if (! ordinary)  {
                        if (isfunc)  {
                           if (stmt && ! isfatarrow && ! state.option.inMoz(true))  {
                              error("W118", state.tokens.curr, "function closure expressions");
                           }
                           if (! stmt)  {
                              m =  {} ;
                              for (d in state.directive)  {
                                    if (_.has(state.directive, d))  {
                                       m[d] = state.directive[d];
                                    }
                                 }
                           }
                           expression(0);
                           if (state.option.strict && funct["(context)"]["(global)"])  {
                              if (! m["use strict"] && ! state.directive["use strict"])  {
                                 warning("E007");
                              }
                           }
                        }
                         else  {
                           error("E021", state.tokens.next, "{", state.tokens.next.value);
                        }
                     }
                      else  {
                        funct["(nolet)"] = true;
                        if (! stmt || state.option.curly)  {
                           warning("W116", state.tokens.next, "{", state.tokens.next.value);
                        }
                        noreach = true;
                        indent = state.option.indent;
                        a = [statement(state.tokens.next.line === state.tokens.curr.line)];
                        indent = state.option.indent;
                        noreach = false;
                        delete funct["(nolet)"];
                     }
                     funct["(verb)"] = null;
                     if (! ordinary || ! state.option.funcscope) scope = s                     inblock = b;
                     if (ordinary && state.option.noempty && ! a || a.length === 0)  {
                        warning("W035");
                     }
                     metrics.nestedBlockDepth = 1;
                     return a;
                  }
;
                  function countMember(m)  {
                     if (membersOnly && typeof membersOnly[m] !== "boolean")  {
                        warning("W036", state.tokens.curr, m);
                     }
                     if (typeof member[m] === "number")  {
                        member[m] = 1;
                     }
                      else  {
                        member[m] = 1;
                     }
                  }
;
                  function note_implied(tkn)  {
                     var name = tkn.value, line = tkn.line, a = implied[name];
                     if (typeof a === "function")  {
                        a = false;
                     }
                     if (! a)  {
                        a = [line];
                        implied[name] = a;
                     }
                      else if (a[a.length - 1] !== line)  {
                        a.push(line);
                     }
                  }
;
                  type("(number)", function()  {
                        return this;
                     }
                  );
                  type("(string)", function()  {
                        return this;
                     }
                  );
                  state.syntax["(identifier)"] =  {
                     type:"(identifier)", 
                     lbp:0, 
                     identifier:true, 
                     nud:function()  {
                        var v = this.value, s = scope[v], f;
                        if (typeof s === "function")  {
                           s = undefined;
                        }
                         else if (typeof s === "boolean")  {
                           f = funct;
                           funct = functions[0];
                           addlabel(v, "var");
                           s = funct;
                           funct = f;
                        }
                        var block;
                        if (_.has(funct, "(blockscope)"))  {
                           block = funct["(blockscope)"].getlabel(v);
                        }
                        if (funct === s || block)  {
                           switch(block ? block[v]["(type)"] : funct[v]) {
                              case "unused":
 
                                    if (block) block[v]["(type)"] = "var"                                     else funct[v] = "var"                                    break;
                                 
                              case "unction":
 
                                    if (block) block[v]["(type)"] = "function"                                     else funct[v] = "function"                                    this["function"] = true;
                                    break;
                                 
                              case "function":
 
                                    this["function"] = true;
                                    break;
                                 
                              case "label":
 
                                    warning("W037", state.tokens.curr, v);
                                    break;
                                 
}
;
                        }
                         else if (funct["(global)"])  {
                           if (typeof predefined[v] !== "boolean")  {
                              if (! anonname === "typeof" || anonname === "delete" || state.tokens.next && state.tokens.next.value === "." || state.tokens.next.value === "[")  {
                                 if (! funct["(comparray)"].check(v))  {
                                    isundef(funct, "W117", state.tokens.curr, v);
                                 }
                              }
                           }
                           note_implied(state.tokens.curr);
                        }
                         else  {
                           switch(funct[v]) {
                              case "closure":
 
                                 
                              case "function":
 
                                 
                              case "var":
 
                                 
                              case "unused":
 
                                    warning("W038", state.tokens.curr, v);
                                    break;
                                 
                              case "label":
 
                                    warning("W037", state.tokens.curr, v);
                                    break;
                                 
                              case "outer":
 
                                 
                              case "global":
 
                                    break;
                                 
                              default:
 
                                    if (s === true)  {
                                       funct[v] = true;
                                    }
                                     else if (s === null)  {
                                       warning("W039", state.tokens.curr, v);
                                       note_implied(state.tokens.curr);
                                    }
                                     else if (typeof s !== "object")  {
                                       if (! anonname === "typeof" || anonname === "delete" || state.tokens.next && state.tokens.next.value === "." || state.tokens.next.value === "[")  {
                                          isundef(funct, "W117", state.tokens.curr, v);
                                       }
                                       funct[v] = true;
                                       note_implied(state.tokens.curr);
                                    }
                                     else  {
                                       switch(s[v]) {
                                          case "function":
 
                                             
                                          case "unction":
 
                                                this["function"] = true;
                                                s[v] = "closure";
                                                funct[v] = s["(global)"] ? "global" : "outer";
                                                break;
                                             
                                          case "var":
 
                                             
                                          case "unused":
 
                                                s[v] = "closure";
                                                funct[v] = s["(global)"] ? "global" : "outer";
                                                break;
                                             
                                          case "closure":
 
                                                funct[v] = s["(global)"] ? "global" : "outer";
                                                break;
                                             
                                          case "label":
 
                                                warning("W037", state.tokens.curr, v);
                                             
}
;
                                    }
                                 
}
;
                        }
                        return this;
                     }, 
                     led:function()  {
                        error("E033", state.tokens.next, state.tokens.next.value);
                     }} ;
                  type("(regexp)", function()  {
                        return this;
                     }
                  );
                  delim("(endline)");
                  delim("(begin)");
                  delim("(end)").reach = true;
                  delim("(error)").reach = true;
                  delim("}").reach = true;
                  delim(")");
                  delim("]");
                  delim(""").reach = true;
                  delim("'").reach = true;
                  delim(";");
                  delim(":").reach = true;
                  delim(",");
                  delim("#");
                  reserve("else");
                  reserve("case").reach = true;
                  reserve("catch");
                  reserve("default").reach = true;
                  reserve("finally");
                  reservevar("arguments", function(x)  {
                        if (state.directive["use strict"] && funct["(global)"])  {
                           warning("E008", x);
                        }
                     }
                  );
                  reservevar("eval");
                  reservevar("false");
                  reservevar("Infinity");
                  reservevar("null");
                  reservevar("this", function(x)  {
                        if (state.directive["use strict"] && ! state.option.validthis && funct["(statement)"] && funct["(name)"].charAt(0) > "Z" || funct["(global)"])  {
                           warning("W040", x);
                        }
                     }
                  );
                  reservevar("true");
                  reservevar("undefined");
                  assignop("=", "assign", 20);
                  assignop("+=", "assignadd", 20);
                  assignop("-=", "assignsub", 20);
                  assignop("*=", "assignmult", 20);
                  assignop("/=", "assigndiv", 20).nud = function()  {
                     error("E014");
                  }
;
                  assignop("%=", "assignmod", 20);
                  bitwiseassignop("&=", "assignbitand", 20);
                  bitwiseassignop("|=", "assignbitor", 20);
                  bitwiseassignop("^=", "assignbitxor", 20);
                  bitwiseassignop("<<=", "assignshiftleft", 20);
                  bitwiseassignop(">>=", "assignshiftright", 20);
                  bitwiseassignop(">>>=", "assignshiftrightunsigned", 20);
                  infix("?", function(left, that)  {
                        that.left = left;
                        that.right = expression(10);
                        advance(":");
                        that["else"] = expression(10);
                        return that;
                     }, 
                     30);
                  infix("||", "or", 40);
                  infix("&&", "and", 50);
                  bitwise("|", "bitor", 70);
                  bitwise("^", "bitxor", 80);
                  bitwise("&", "bitand", 90);
                  relation("==", function(left, right)  {
                        var eqnull = state.option.eqnull && left.value === "null" || right.value === "null";
                        if (! eqnull && state.option.eqeqeq) warning("W116", this, "===", "==")                         else if (isPoorRelation(left)) warning("W041", this, "===", left.value)                         else if (isPoorRelation(right)) warning("W041", this, "===", right.value)                        return this;
                     }
                  );
                  relation("===");
                  relation("!=", function(left, right)  {
                        var eqnull = state.option.eqnull && left.value === "null" || right.value === "null";
                        if (! eqnull && state.option.eqeqeq)  {
                           warning("W116", this, "!==", "!=");
                        }
                         else if (isPoorRelation(left))  {
                           warning("W041", this, "!==", left.value);
                        }
                         else if (isPoorRelation(right))  {
                           warning("W041", this, "!==", right.value);
                        }
                        return this;
                     }
                  );
                  relation("!==");
                  relation("<");
                  relation(">");
                  relation("<=");
                  relation(">=");
                  bitwise("<<", "shiftleft", 120);
                  bitwise(">>", "shiftright", 120);
                  bitwise(">>>", "shiftrightunsigned", 120);
                  infix("in", "in", 120);
                  infix("instanceof", "instanceof", 120);
                  infix("+", function(left, that)  {
                        var right = expression(130);
                        if (left && right && left.id === "(string)" && right.id === "(string)")  {
                           left.value = right.value;
                           left.character = right.character;
                           if (! state.option.scripturl && reg.javascriptURL.test(left.value))  {
                              warning("W050", left);
                           }
                           return left;
                        }
                        that.left = left;
                        that.right = right;
                        return that;
                     }, 
                     130);
                  prefix("+", "num");
                  prefix("+++", function()  {
                        warning("W007");
                        this.right = expression(150);
                        this.arity = "unary";
                        return this;
                     }
                  );
                  infix("+++", function(left)  {
                        warning("W007");
                        this.left = left;
                        this.right = expression(130);
                        return this;
                     }, 
                     130);
                  infix("-", "sub", 130);
                  prefix("-", "neg");
                  prefix("---", function()  {
                        warning("W006");
                        this.right = expression(150);
                        this.arity = "unary";
                        return this;
                     }
                  );
                  infix("---", function(left)  {
                        warning("W006");
                        this.left = left;
                        this.right = expression(130);
                        return this;
                     }, 
                     130);
                  infix("*", "mult", 140);
                  infix("/", "div", 140);
                  infix("%", "mod", 140);
                  suffix("++", "postinc");
                  prefix("++", "preinc");
                  state.syntax["++"].exps = true;
                  suffix("--", "postdec");
                  prefix("--", "predec");
                  state.syntax["--"].exps = true;
                  prefix("delete", function()  {
                        var p = expression(0);
                        if (! p || p.id !== "." && p.id !== "[")  {
                           warning("W051");
                        }
                        this.first = p;
                        return this;
                     }
                  ).exps = true;
                  prefix("~", function()  {
                        if (state.option.bitwise)  {
                           warning("W052", this, "~");
                        }
                        expression(150);
                        return this;
                     }
                  );
                  prefix("...", function()  {
                        if (! state.option.inESNext())  {
                           warning("W104", this, "spread/rest operator");
                        }
                        if (! state.tokens.next.identifier)  {
                           error("E030", state.tokens.next, state.tokens.next.value);
                        }
                        expression(150);
                        return this;
                     }
                  );
                  prefix("!", function()  {
                        this.right = expression(150);
                        this.arity = "unary";
                        if (! this.right)  {
                           quit("E041", this.line || 0);
                        }
                        if (bang[this.right.id] === true)  {
                           warning("W018", this, "!");
                        }
                        return this;
                     }
                  );
                  prefix("typeof", "typeof");
                  prefix("new", function()  {
                        var c = expression(155), i;
                        if (c && c.id !== "function")  {
                           if (c.identifier)  {
                              c["new"] = true;
                              switch(c.value) {
                                 case "Number":
 
                                    
                                 case "String":
 
                                    
                                 case "Boolean":
 
                                    
                                 case "Math":
 
                                    
                                 case "JSON":
 
                                       warning("W053", state.tokens.prev, c.value);
                                       break;
                                    
                                 case "Function":
 
                                       if (! state.option.evil)  {
                                          warning("W054");
                                       }
                                       break;
                                    
                                 case "Date":
 
                                    
                                 case "RegExp":
 
                                       break;
                                    
                                 default:
 
                                       if (c.id !== "function")  {
                                          i = c.value.substr(0, 1);
                                          if (state.option.newcap && i < "A" || i > "Z" && ! _.has(global, c.value))  {
                                             warning("W055", state.tokens.curr);
                                          }
                                       }
                                    
}
;
                           }
                            else  {
                              if (c.id !== "." && c.id !== "[" && c.id !== "(")  {
                                 warning("W056", state.tokens.curr);
                              }
                           }
                        }
                         else  {
                           if (! state.option.supernew) warning("W057", this)                        }
                        adjacent(state.tokens.curr, state.tokens.next);
                        if (state.tokens.next.id !== "(" && ! state.option.supernew)  {
                           warning("W058", state.tokens.curr, state.tokens.curr.value);
                        }
                        this.first = c;
                        return this;
                     }
                  );
                  state.syntax["new"].exps = true;
                  prefix("void").exps = true;
                  infix(".", function(left, that)  {
                        adjacent(state.tokens.prev, state.tokens.curr);
                        nobreak();
                        var m = identifier(false, true);
                        if (typeof m === "string")  {
                           countMember(m);
                        }
                        that.left = left;
                        that.right = m;
                        if (m && m === "hasOwnProperty" && state.tokens.next.value === "=")  {
                           warning("W001");
                        }
                        if (left && left.value === "arguments" && m === "callee" || m === "caller")  {
                           if (state.option.noarg) warning("W059", left, m)                            else if (state.directive["use strict"]) error("E008")                        }
                         else if (! state.option.evil && left && left.value === "document" && m === "write" || m === "writeln")  {
                           warning("W060", left);
                        }
                        if (! state.option.evil && m === "eval" || m === "execScript")  {
                           warning("W061");
                        }
                        return that;
                     }, 
                     160, true);
                  infix("(", function(left, that)  {
                        if (state.tokens.prev.id !== "}" && state.tokens.prev.id !== ")")  {
                           nobreak(state.tokens.prev, state.tokens.curr);
                        }
                        nospace();
                        if (state.option.immed && left && ! left.immed && left.id === "function")  {
                           warning("W062");
                        }
                        var n = 0;
                        var p = [];
                        if (left)  {
                           if (left.type === "(identifier)")  {
                              if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/))  {
                                 if ("Number String Boolean Date Object".indexOf(left.value) === - 1)  {
                                    if (left.value === "Math")  {
                                       warning("W063", left);
                                    }
                                     else if (state.option.newcap)  {
                                       warning("W064", left);
                                    }
                                 }
                              }
                           }
                        }
                        if (state.tokens.next.id !== ")")  {
                           for (; ; )  {
                                 p[p.length] = expression(10);
                                 n = 1;
                                 if (state.tokens.next.id !== ",")  {
                                    break;
                                 }
                                 comma();
                              }
                        }
                        advance(")");
                        nospace(state.tokens.prev, state.tokens.curr);
                        if (typeof left === "object")  {
                           if (left.value === "parseInt" && n === 1)  {
                              warning("W065", state.tokens.curr);
                           }
                           if (! state.option.evil)  {
                              if (left.value === "eval" || left.value === "Function" || left.value === "execScript")  {
                                 warning("W061", left);
                                 if (p[0] && [0].id === "(string)")  {
                                    addInternalSrc(left, p[0].value);
                                 }
                              }
                               else if (p[0] && p[0].id === "(string)" && left.value === "setTimeout" || left.value === "setInterval")  {
                                 warning("W066", left);
                                 addInternalSrc(left, p[0].value);
                              }
                               else if (p[0] && p[0].id === "(string)" && left.value === "." && left.left.value === "window" && left.right === "setTimeout" || left.right === "setInterval")  {
                                 warning("W066", left);
                                 addInternalSrc(left, p[0].value);
                              }
                           }
                           if (! left.identifier && left.id !== "." && left.id !== "[" && left.id !== "(" && left.id !== "&&" && left.id !== "||" && left.id !== "?")  {
                              warning("W067", left);
                           }
                        }
                        that.left = left;
                        return that;
                     }, 
                     155, true).exps = true;
                  prefix("(", function()  {
                        nospace();
                        var bracket, brackets = [];
                        var pn, pn1, i = 0;
                        do  {
                              pn = peek(i);
                              i = 1;
                              pn1 = peek(i);
                              i = 1;
                           }
 while (pn.value !== ")" && pn1.value !== "=>" && pn1.value !== ";" && pn1.type !== "(end)")                        if (state.tokens.next.id === "function")  {
                           state.tokens.next.immed = true;
                        }
                        var exprs = [];
                        if (state.tokens.next.id !== ")")  {
                           for (; ; )  {
                                 if (pn1.value === "=>" && state.tokens.next.value === "{")  {
                                    bracket = state.tokens.next;
                                    bracket.left = destructuringExpression();
                                    brackets.push(bracket);
                                    for (var t in bracket.left)  {
                                          exprs.push(bracket.left[t].token);
                                       }
                                 }
                                  else  {
                                    exprs.push(expression(0));
                                 }
                                 if (state.tokens.next.id !== ",")  {
                                    break;
                                 }
                                 comma();
                              }
                        }
                        advance(")", this);
                        nospace(state.tokens.prev, state.tokens.curr);
                        if (state.option.immed && exprs[0] && exprs[0].id === "function")  {
                           if (state.tokens.next.id !== "(" && state.tokens.next.id !== "." || peek().value !== "call" && peek().value !== "apply")  {
                              warning("W068", this);
                           }
                        }
                        if (state.tokens.next.value === "=>")  {
                           return exprs;
                        }
                        return exprs[0];
                     }
                  );
                  application("=>");
                  infix("[", function(left, that)  {
                        nobreak(state.tokens.prev, state.tokens.curr);
                        nospace();
                        var e = expression(0), s;
                        if (e && e.type === "(string)")  {
                           if (! state.option.evil && e.value === "eval" || e.value === "execScript")  {
                              warning("W061", that);
                           }
                           countMember(e.value);
                           if (! state.option.sub && reg.identifier.test(e.value))  {
                              s = state.syntax[e.value];
                              if (! s || ! isReserved(s))  {
                                 warning("W069", state.tokens.prev, e.value);
                              }
                           }
                        }
                        advance("]", that);
                        if (e && e.value === "hasOwnProperty" && state.tokens.next.value === "=")  {
                           warning("W001");
                        }
                        nospace(state.tokens.prev, state.tokens.curr);
                        that.left = left;
                        that.right = e;
                        return that;
                     }, 
                     160, true);
                  function comprehensiveArrayExpression()  {
                     var res =  {} ;
                     res.exps = true;
                     funct["(comparray)"].stack();
                     res.right = expression(0);
                     advance("for");
                     if (state.tokens.next.value === "each")  {
                        advance("each");
                        if (! state.option.inMoz(true))  {
                           warning("W118", state.tokens.curr, "for each");
                        }
                     }
                     advance("(");
                     funct["(comparray)"].setState("define");
                     res.left = expression(0);
                     advance(")");
                     if (state.tokens.next.value === "if")  {
                        advance("if");
                        advance("(");
                        funct["(comparray)"].setState("filter");
                        res.filter = expression(0);
                        advance(")");
                     }
                     advance("]");
                     funct["(comparray)"].unstack();
                     return res;
                  }
;
                  prefix("[", function()  {
                        var blocktype = lookupBlockType(true);
                        if (blocktype.isCompArray)  {
                           if (! state.option.inMoz(true))  {
                              warning("W118", state.tokens.curr, "array comprehension");
                           }
                           return comprehensiveArrayExpression();
                        }
                         else if (blocktype.isDestAssign && ! state.option.inESNext())  {
                           warning("W104", state.tokens.curr, "destructuring assignment");
                        }
                        var b = state.tokens.curr.line !== state.tokens.next.line;
                        this.first = [];
                        if (b)  {
                           indent = state.option.indent;
                           if (state.tokens.next.from === indent + state.option.indent)  {
                              indent = state.option.indent;
                           }
                        }
                        while (state.tokens.next.id !== "(end)")  {
                              while (state.tokens.next.id === ",")  {
                                    if (! state.option.inES5()) warning("W070")                                    advance(",");
                                 }
                              if (state.tokens.next.id === "]")  {
                                 break;
                              }
                              if (b && state.tokens.curr.line !== state.tokens.next.line)  {
                                 indentation();
                              }
                              this.first.push(expression(10));
                              if (state.tokens.next.id === ",")  {
                                 comma( {
                                       allowTrailing:true                                    }
                                 );
                                 if (state.tokens.next.id === "]" && ! state.option.inES5(true))  {
                                    warning("W070", state.tokens.curr);
                                    break;
                                 }
                              }
                               else  {
                                 break;
                              }
                           }
                        if (b)  {
                           indent = state.option.indent;
                           indentation();
                        }
                        advance("]", this);
                        return this;
                     }, 
                     160);
                  function property_name()  {
                     var id = optionalidentifier(false, true);
                     if (! id)  {
                        if (state.tokens.next.id === "(string)")  {
                           id = state.tokens.next.value;
                           advance();
                        }
                         else if (state.tokens.next.id === "(number)")  {
                           id = state.tokens.next.value.toString();
                           advance();
                        }
                     }
                     if (id === "hasOwnProperty")  {
                        warning("W001");
                     }
                     return id;
                  }
;
                  function functionparams(parsed)  {
                     var curr, next;
                     var params = [];
                     var ident;
                     var tokens = [];
                     var t;
                     if (parsed)  {
                        if (parsed instanceof Array)  {
                           for (var i in parsed)  {
                                 curr = parsed[i];
                                 if (_.contains(["{", "["], curr.id))  {
                                    for (t in curr.left)  {
                                          t = tokens[t];
                                          if (t.id)  {
                                             params.push(t.id);
                                             addlabel(t.id, "unused", t.token);
                                          }
                                       }
                                 }
                                  else if (curr.value === "...")  {
                                    if (! state.option.inESNext())  {
                                       warning("W104", curr, "spread/rest operator");
                                    }
                                    continue;
                                 }
                                  else  {
                                    addlabel(curr.value, "unused", curr);
                                 }
                              }
                           return params;
                        }
                         else  {
                           if (parsed.identifier === true)  {
                              addlabel(parsed.value, "unused", parsed);
                              return [parsed];
                           }
                        }
                     }
                     next = state.tokens.next;
                     advance("(");
                     nospace();
                     if (state.tokens.next.id === ")")  {
                        advance(")");
                        return ;
                     }
                     for (; ; )  {
                           if (_.contains(["{", "["], state.tokens.next.id))  {
                              tokens = destructuringExpression();
                              for (t in tokens)  {
                                    t = tokens[t];
                                    if (t.id)  {
                                       params.push(t.id);
                                       addlabel(t.id, "unused", t.token);
                                    }
                                 }
                           }
                            else if (state.tokens.next.value === "...")  {
                              if (! state.option.inESNext())  {
                                 warning("W104", state.tokens.next, "spread/rest operator");
                              }
                              advance("...");
                              nospace();
                              ident = identifier(true);
                              params.push(ident);
                              addlabel(ident, "unused", state.tokens.curr);
                           }
                            else  {
                              ident = identifier(true);
                              params.push(ident);
                              addlabel(ident, "unused", state.tokens.curr);
                           }
                           if (state.tokens.next.id === ",")  {
                              comma();
                           }
                            else  {
                              advance(")", next);
                              nospace(state.tokens.prev, state.tokens.curr);
                              return params;
                           }
                        }
                  }
;
                  function doFunction(name, statement, generator, fatarrowparams)  {
                     var f;
                     var oldOption = state.option;
                     var oldIgnored = state.ignored;
                     var oldScope = scope;
                     state.option = Object.create(state.option);
                     state.ignored = Object.create(state.ignored);
                     scope = Object.create(scope);
                     funct =  {
                        (name):name || """ + anonname + """, 
                        (line):state.tokens.next.line, 
                        (character):state.tokens.next.character, 
                        (context):funct, 
                        (breakage):0, 
                        (loopage):0, 
                        (metrics):createMetrics(state.tokens.next), 
                        (scope):scope, 
                        (statement):statement, 
                        (tokens): {} , 
                        (blockscope):funct["(blockscope)"], 
                        (comparray):funct["(comparray)"]                     }
;
                     if (generator)  {
                        funct["(generator)"] = true;
                     }
                     f = funct;
                     state.tokens.curr.funct = funct;
                     functions.push(funct);
                     if (name)  {
                        addlabel(name, "function");
                     }
                     funct["(params)"] = functionparams(fatarrowparams);
                     funct["(metrics)"].verifyMaxParametersPerFunction(funct["(params)"]);
                     block(false, true, true, fatarrowparams ? true : false);
                     if (generator && funct["(generator)"] !== "yielded")  {
                        error("E047", state.tokens.curr);
                     }
                     funct["(metrics)"].verifyMaxStatementsPerFunction();
                     funct["(metrics)"].verifyMaxComplexityPerFunction();
                     funct["(unusedOption)"] = state.option.unused;
                     scope = oldScope;
                     state.option = oldOption;
                     state.ignored = oldIgnored;
                     funct["(last)"] = state.tokens.curr.line;
                     funct["(lastcharacter)"] = state.tokens.curr.character;
                     funct = funct["(context)"];
                     return f;
                  }
;
                  function createMetrics(functionStartToken)  {
                     return  {
                        statementCount:0, 
                        nestedBlockDepth:- 1, 
                        ComplexityCount:1, 
                        verifyMaxStatementsPerFunction:function()  {
                           if (state.option.maxstatements && this.statementCount > state.option.maxstatements)  {
                              warning("W071", functionStartToken, this.statementCount);
                           }
                        }, 
                        verifyMaxParametersPerFunction:function(params)  {
                           params = params || [];
                           if (state.option.maxparams && params.length > state.option.maxparams)  {
                              warning("W072", functionStartToken, params.length);
                           }
                        }, 
                        verifyMaxNestedBlockDepthPerFunction:function()  {
                           if (state.option.maxdepth && this.nestedBlockDepth > 0 && this.nestedBlockDepth === state.option.maxdepth + 1)  {
                              warning("W073", null, this.nestedBlockDepth);
                           }
                        }, 
                        verifyMaxComplexityPerFunction:function()  {
                           var max = state.option.maxcomplexity;
                           var cc = this.ComplexityCount;
                           if (max && cc > max)  {
                              warning("W074", functionStartToken, cc);
                           }
                        }} ;
                  }
;
                  function increaseComplexityCount()  {
                     funct["(metrics)"].ComplexityCount = 1;
                  }
;
                  function parseCondAssignment()  {
                     switch(state.tokens.next.id) {
                        case "=":
 
                           
                        case "+=":
 
                           
                        case "-=":
 
                           
                        case "*=":
 
                           
                        case "%=":
 
                           
                        case "&=":
 
                           
                        case "|=":
 
                           
                        case "^=":
 
                           
                        case "/=":
 
                              if (! state.option.boss)  {
                                 warning("W084");
                              }
                              advance(state.tokens.next.id);
                              expression(20);
                           
}
;
                  }
;
                  function(x)  {
                     x.nud = function()  {
                        var b, f, i, p, t, g;
                        var props =  {} ;
                        function saveProperty(name, tkn)  {
                           if (props[name] && _.has(props, name)) warning("W075", state.tokens.next, i)                            else props[name] =  {}                            props[name].basic = true;
                           props[name].basictkn = tkn;
                        }
;
                        function saveSetter(name, tkn)  {
                           if (props[name] && _.has(props, name))  {
                              if (props[name].basic || props[name].setter) warning("W075", state.tokens.next, i)                           }
                            else  {
                              props[name] =  {} ;
                           }
                           props[name].setter = true;
                           props[name].setterToken = tkn;
                        }
;
                        function saveGetter(name)  {
                           if (props[name] && _.has(props, name))  {
                              if (props[name].basic || props[name].getter) warning("W075", state.tokens.next, i)                           }
                            else  {
                              props[name] =  {} ;
                           }
                           props[name].getter = true;
                           props[name].getterToken = state.tokens.curr;
                        }
;
                        b = state.tokens.curr.line !== state.tokens.next.line;
                        if (b)  {
                           indent = state.option.indent;
                           if (state.tokens.next.from === indent + state.option.indent)  {
                              indent = state.option.indent;
                           }
                        }
                        for (; ; )  {
                              if (state.tokens.next.id === "}")  {
                                 break;
                              }
                              if (b)  {
                                 indentation();
                              }
                              if (state.tokens.next.value === "get" && peek().id !== ":")  {
                                 advance("get");
                                 if (! state.option.inES5(true))  {
                                    error("E034");
                                 }
                                 i = property_name();
                                 if (! i)  {
                                    error("E035");
                                 }
                                 saveGetter(i);
                                 t = state.tokens.next;
                                 adjacent(state.tokens.curr, state.tokens.next);
                                 f = doFunction();
                                 p = f["(params)"];
                                 if (p)  {
                                    warning("W076", t, p[0], i);
                                 }
                                 adjacent(state.tokens.curr, state.tokens.next);
                              }
                               else if (state.tokens.next.value === "set" && peek().id !== ":")  {
                                 advance("set");
                                 if (! state.option.inES5(true))  {
                                    error("E034");
                                 }
                                 i = property_name();
                                 if (! i)  {
                                    error("E035");
                                 }
                                 saveSetter(i, state.tokens.next);
                                 t = state.tokens.next;
                                 adjacent(state.tokens.curr, state.tokens.next);
                                 f = doFunction();
                                 p = f["(params)"];
                                 if (! p || p.length !== 1)  {
                                    warning("W077", t, i);
                                 }
                              }
                               else  {
                                 g = false;
                                 if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)")  {
                                    if (! state.option.inESNext())  {
                                       warning("W104", state.tokens.next, "generator functions");
                                    }
                                    advance("*");
                                    g = true;
                                 }
                                 i = property_name();
                                 saveProperty(i, state.tokens.next);
                                 if (typeof i !== "string")  {
                                    break;
                                 }
                                 if (state.tokens.next.value === "(")  {
                                    if (! state.option.inESNext())  {
                                       warning("W104", state.tokens.curr, "concise methods");
                                    }
                                    doFunction(i, undefined, g);
                                 }
                                  else  {
                                    advance(":");
                                    nonadjacent(state.tokens.curr, state.tokens.next);
                                    expression(10);
                                 }
                              }
                              countMember(i);
                              if (state.tokens.next.id === ",")  {
                                 comma( {
                                       allowTrailing:true                                    }
                                 );
                                 if (state.tokens.next.id === ",")  {
                                    warning("W070", state.tokens.curr);
                                 }
                                  else if (state.tokens.next.id === "}" && ! state.option.inES5(true))  {
                                    warning("W070", state.tokens.curr);
                                 }
                              }
                               else  {
                                 break;
                              }
                           }
                        if (b)  {
                           indent = state.option.indent;
                           indentation();
                        }
                        advance("}", this);
                        if (state.option.inES5())  {
                           for (var name in props)  {
                                 if (_.has(props, name) && props[name].setter && ! props[name].getter)  {
                                    warning("W078", props[name].setterToken);
                                 }
                              }
                        }
                        return this;
                     }
;
                     x.fud = function()  {
                        error("E036", state.tokens.curr);
                     }
;
                  }
(delim("{"));
                  function destructuringExpression()  {
                     var id, ids;
                     var identifiers = [];
                     if (! state.option.inESNext())  {
                        warning("W104", state.tokens.curr, "destructuring expression");
                     }
                     var nextInnerDE = function()  {
                        var ident;
                        if (_.contains(["[", "{"], state.tokens.next.value))  {
                           ids = destructuringExpression();
                           for (var id in ids)  {
                                 id = ids[id];
                                 identifiers.push( {
                                       id:id.id, 
                                       token:id.token                                    }
                                 );
                              }
                        }
                         else if (state.tokens.next.value === ",")  {
                           identifiers.push( {
                                 id:null, 
                                 token:state.tokens.curr                              }
                           );
                        }
                         else  {
                           ident = identifier();
                           if (ident) identifiers.push( {
                                 id:ident, 
                                 token:state.tokens.curr                              }
                           )                        }
                     }
;
                     if (state.tokens.next.value === "[")  {
                        advance("[");
                        nextInnerDE();
                        while (state.tokens.next.value !== "]")  {
                              advance(",");
                              nextInnerDE();
                           }
                        advance("]");
                     }
                      else if (state.tokens.next.value === "{")  {
                        advance("{");
                        id = identifier();
                        if (state.tokens.next.value === ":")  {
                           advance(":");
                           nextInnerDE();
                        }
                         else  {
                           identifiers.push( {
                                 id:id, 
                                 token:state.tokens.curr                              }
                           );
                        }
                        while (state.tokens.next.value !== "}")  {
                              advance(",");
                              id = identifier();
                              if (state.tokens.next.value === ":")  {
                                 advance(":");
                                 nextInnerDE();
                              }
                               else  {
                                 identifiers.push( {
                                       id:id, 
                                       token:state.tokens.curr                                    }
                                 );
                              }
                           }
                        advance("}");
                     }
                     return identifiers;
                  }
;
                  function destructuringExpressionMatch(tokens, value)  {
                     if (value.first)  {
                        _.zip(tokens, value.first).forEach(function(val)  {
                              var token = val[0];
                              var value = val[1];
                              if (token && value)  {
                                 token.first = value;
                              }
                               else if (token && token.first && ! value)  {
                                 warning("W080", token.first, token.first.value);
                              }
                           }
                        );
                     }
                  }
;
                  var conststatement = stmt("const", function(prefix)  {
                        var tokens, value;
                        var lone;
                        if (! state.option.inESNext())  {
                           warning("W104", state.tokens.curr, "const");
                        }
                        this.first = [];
                        for (; ; )  {
                              var names = [];
                              nonadjacent(state.tokens.curr, state.tokens.next);
                              if (_.contains(["{", "["], state.tokens.next.value))  {
                                 tokens = destructuringExpression();
                                 lone = false;
                              }
                               else  {
                                 tokens = [ {
                                    id:identifier(), 
                                    token:state.tokens.curr                                 }
];
                                 lone = true;
                              }
                              for (var t in tokens)  {
                                    t = tokens[t];
                                    if (funct[t.id] === "const")  {
                                       warning("E011", null, t.id);
                                    }
                                    if (funct["(global)"] && predefined[t.id] === false)  {
                                       warning("W079", t.token, t.id);
                                    }
                                    if (t.id)  {
                                       addlabel(t.id, "const");
                                       names.push(t.token);
                                    }
                                 }
                              if (prefix)  {
                                 break;
                              }
                              this.first = this.first.concat(names);
                              if (state.tokens.next.id !== "=")  {
                                 warning("E012", state.tokens.curr, state.tokens.curr.value);
                              }
                              if (state.tokens.next.id === "=")  {
                                 nonadjacent(state.tokens.curr, state.tokens.next);
                                 advance("=");
                                 nonadjacent(state.tokens.curr, state.tokens.next);
                                 if (state.tokens.next.id === "undefined")  {
                                    warning("W080", state.tokens.curr, state.tokens.curr.value);
                                 }
                                 if (peek(0).id === "=" && state.tokens.next.identifier)  {
                                    error("E037", state.tokens.next, state.tokens.next.value);
                                 }
                                 value = expression(0);
                                 if (lone)  {
                                    tokens[0].first = value;
                                 }
                                  else  {
                                    destructuringExpressionMatch(names, value);
                                 }
                              }
                              if (state.tokens.next.id !== ",")  {
                                 break;
                              }
                              comma();
                           }
                        return this;
                     }
                  );
                  conststatement.exps = true;
                  var varstatement = stmt("var", function(prefix)  {
                        var tokens, lone, value;
                        if (funct["(onevar)"] && state.option.onevar)  {
                           warning("W081");
                        }
                         else if (! funct["(global)"])  {
                           funct["(onevar)"] = true;
                        }
                        this.first = [];
                        for (; ; )  {
                              var names = [];
                              nonadjacent(state.tokens.curr, state.tokens.next);
                              if (_.contains(["{", "["], state.tokens.next.value))  {
                                 tokens = destructuringExpression();
                                 lone = false;
                              }
                               else  {
                                 tokens = [ {
                                    id:identifier(), 
                                    token:state.tokens.curr                                 }
];
                                 lone = true;
                              }
                              for (var t in tokens)  {
                                    t = tokens[t];
                                    if (state.option.inESNext() && funct[t.id] === "const")  {
                                       warning("E011", null, t.id);
                                    }
                                    if (funct["(global)"] && predefined[t.id] === false)  {
                                       warning("W079", t.token, t.id);
                                    }
                                    if (t.id)  {
                                       addlabel(t.id, "unused", t.token);
                                       names.push(t.token);
                                    }
                                 }
                              if (prefix)  {
                                 break;
                              }
                              this.first = this.first.concat(names);
                              if (state.tokens.next.id === "=")  {
                                 nonadjacent(state.tokens.curr, state.tokens.next);
                                 advance("=");
                                 nonadjacent(state.tokens.curr, state.tokens.next);
                                 if (state.tokens.next.id === "undefined")  {
                                    warning("W080", state.tokens.curr, state.tokens.curr.value);
                                 }
                                 if (peek(0).id === "=" && state.tokens.next.identifier)  {
                                    error("E038", state.tokens.next, state.tokens.next.value);
                                 }
                                 value = expression(0);
                                 if (lone)  {
                                    tokens[0].first = value;
                                 }
                                  else  {
                                    destructuringExpressionMatch(names, value);
                                 }
                              }
                              if (state.tokens.next.id !== ",")  {
                                 break;
                              }
                              comma();
                           }
                        return this;
                     }
                  );
                  varstatement.exps = true;
                  var letstatement = stmt("let", function(prefix)  {
                        var tokens, lone, value, letblock;
                        if (! state.option.inESNext())  {
                           warning("W104", state.tokens.curr, "let");
                        }
                        if (state.tokens.next.value === "(")  {
                           if (! state.option.inMoz(true))  {
                              warning("W118", state.tokens.next, "let block");
                           }
                           advance("(");
                           funct["(blockscope)"].stack();
                           letblock = true;
                        }
                         else if (funct["(nolet)"])  {
                           error("E048", state.tokens.curr);
                        }
                        if (funct["(onevar)"] && state.option.onevar)  {
                           warning("W081");
                        }
                         else if (! funct["(global)"])  {
                           funct["(onevar)"] = true;
                        }
                        this.first = [];
                        for (; ; )  {
                              var names = [];
                              nonadjacent(state.tokens.curr, state.tokens.next);
                              if (_.contains(["{", "["], state.tokens.next.value))  {
                                 tokens = destructuringExpression();
                                 lone = false;
                              }
                               else  {
                                 tokens = [ {
                                    id:identifier(), 
                                    token:state.tokens.curr.value                                 }
];
                                 lone = true;
                              }
                              for (var t in tokens)  {
                                    t = tokens[t];
                                    if (state.option.inESNext() && funct[t.id] === "const")  {
                                       warning("E011", null, t.id);
                                    }
                                    if (funct["(global)"] && predefined[t.id] === false)  {
                                       warning("W079", t.token, t.id);
                                    }
                                    if (t.id && ! funct["(nolet)"])  {
                                       addlabel(t.id, "unused", t.token, true);
                                       names.push(t.token);
                                    }
                                 }
                              if (prefix)  {
                                 break;
                              }
                              this.first = this.first.concat(names);
                              if (state.tokens.next.id === "=")  {
                                 nonadjacent(state.tokens.curr, state.tokens.next);
                                 advance("=");
                                 nonadjacent(state.tokens.curr, state.tokens.next);
                                 if (state.tokens.next.id === "undefined")  {
                                    warning("W080", state.tokens.curr, state.tokens.curr.value);
                                 }
                                 if (peek(0).id === "=" && state.tokens.next.identifier)  {
                                    error("E037", state.tokens.next, state.tokens.next.value);
                                 }
                                 value = expression(0);
                                 if (lone)  {
                                    tokens[0].first = value;
                                 }
                                  else  {
                                    destructuringExpressionMatch(names, value);
                                 }
                              }
                              if (state.tokens.next.id !== ",")  {
                                 break;
                              }
                              comma();
                           }
                        if (letblock)  {
                           advance(")");
                           block(true, true);
                           this.block = true;
                           funct["(blockscope)"].unstack();
                        }
                        return this;
                     }
                  );
                  letstatement.exps = true;
                  blockstmt("function", function()  {
                        var generator = false;
                        if (state.tokens.next.value === "*")  {
                           advance("*");
                           if (state.option.inESNext(true))  {
                              generator = true;
                           }
                            else  {
                              warning("W119", state.tokens.curr, "function*");
                           }
                        }
                        if (inblock)  {
                           warning("W082", state.tokens.curr);
                        }
                        var i = identifier();
                        if (funct[i] === "const")  {
                           warning("E011", null, i);
                        }
                        adjacent(state.tokens.curr, state.tokens.next);
                        addlabel(i, "unction", state.tokens.curr);
                        doFunction(i,  {
                              statement:true                           }, 
                           generator);
                        if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line)  {
                           error("E039");
                        }
                        return this;
                     }
                  );
                  prefix("function", function()  {
                        var generator = false;
                        if (state.tokens.next.value === "*")  {
                           if (! state.option.inESNext())  {
                              warning("W119", state.tokens.curr, "function*");
                           }
                           advance("*");
                           generator = true;
                        }
                        var i = optionalidentifier();
                        if (i || state.option.gcl)  {
                           adjacent(state.tokens.curr, state.tokens.next);
                        }
                         else  {
                           nonadjacent(state.tokens.curr, state.tokens.next);
                        }
                        doFunction(i, undefined, generator);
                        if (! state.option.loopfunc && funct["(loopage)"])  {
                           warning("W083");
                        }
                        return this;
                     }
                  );
                  blockstmt("if", function()  {
                        var t = state.tokens.next;
                        increaseComplexityCount();
                        advance("(");
                        nonadjacent(this, t);
                        nospace();
                        expression(20);
                        parseCondAssignment();
                        advance(")", t);
                        nospace(state.tokens.prev, state.tokens.curr);
                        block(true, true);
                        if (state.tokens.next.id === "else")  {
                           nonadjacent(state.tokens.curr, state.tokens.next);
                           advance("else");
                           if (state.tokens.next.id === "if" || state.tokens.next.id === "switch")  {
                              statement(true);
                           }
                            else  {
                              block(true, true);
                           }
                        }
                        return this;
                     }
                  );
                  blockstmt("try", function()  {
                        var b;
                        function doCatch()  {
                           var oldScope = scope;
                           var e;
                           advance("catch");
                           nonadjacent(state.tokens.curr, state.tokens.next);
                           advance("(");
                           scope = Object.create(oldScope);
                           e = state.tokens.next.value;
                           if (state.tokens.next.type !== "(identifier)")  {
                              e = null;
                              warning("E030", state.tokens.next, e);
                           }
                           advance();
                           funct =  {
                              (name):"(catch)", 
                              (line):state.tokens.next.line, 
                              (character):state.tokens.next.character, 
                              (context):funct, 
                              (breakage):funct["(breakage)"], 
                              (loopage):funct["(loopage)"], 
                              (scope):scope, 
                              (statement):false, 
                              (metrics):createMetrics(state.tokens.next), 
                              (catch):true, 
                              (tokens): {} , 
                              (blockscope):funct["(blockscope)"], 
                              (comparray):funct["(comparray)"]                           }
;
                           if (e)  {
                              addlabel(e, "exception");
                           }
                           if (state.tokens.next.value === "if")  {
                              if (! state.option.inMoz(true))  {
                                 warning("W118", state.tokens.curr, "catch filter");
                              }
                              advance("if");
                              expression(0);
                           }
                           advance(")");
                           state.tokens.curr.funct = funct;
                           functions.push(funct);
                           block(false);
                           scope = oldScope;
                           funct["(last)"] = state.tokens.curr.line;
                           funct["(lastcharacter)"] = state.tokens.curr.character;
                           funct = funct["(context)"];
                        }
;
                        block(false);
                        while (state.tokens.next.id === "catch")  {
                              increaseComplexityCount();
                              if (b && ! state.option.inMoz(true))  {
                                 warning("W118", state.tokens.next, "multiple catch blocks");
                              }
                              doCatch();
                              b = true;
                           }
                        if (state.tokens.next.id === "finally")  {
                           advance("finally");
                           block(false);
                           return ;
                        }
                        if (! b)  {
                           error("E021", state.tokens.next, "catch", state.tokens.next.value);
                        }
                        return this;
                     }
                  );
                  blockstmt("while", function()  {
                        var t = state.tokens.next;
                        funct["(breakage)"] = 1;
                        funct["(loopage)"] = 1;
                        increaseComplexityCount();
                        advance("(");
                        nonadjacent(this, t);
                        nospace();
                        expression(20);
                        parseCondAssignment();
                        advance(")", t);
                        nospace(state.tokens.prev, state.tokens.curr);
                        block(true, true);
                        funct["(breakage)"] = 1;
                        funct["(loopage)"] = 1;
                        return this;
                     }
                  ).labelled = true;
                  blockstmt("with", function()  {
                        var t = state.tokens.next;
                        if (state.directive["use strict"])  {
                           error("E010", state.tokens.curr);
                        }
                         else if (! state.option.withstmt)  {
                           warning("W085", state.tokens.curr);
                        }
                        advance("(");
                        nonadjacent(this, t);
                        nospace();
                        expression(0);
                        advance(")", t);
                        nospace(state.tokens.prev, state.tokens.curr);
                        block(true, true);
                        return this;
                     }
                  );
                  blockstmt("switch", function()  {
                        var t = state.tokens.next, g = false;
                        funct["(breakage)"] = 1;
                        advance("(");
                        nonadjacent(this, t);
                        nospace();
                        this.condition = expression(20);
                        advance(")", t);
                        nospace(state.tokens.prev, state.tokens.curr);
                        nonadjacent(state.tokens.curr, state.tokens.next);
                        t = state.tokens.next;
                        advance("{");
                        nonadjacent(state.tokens.curr, state.tokens.next);
                        indent = state.option.indent;
                        this.cases = [];
                        for (; ; )  {
                              switch(state.tokens.next.id) {
                                 case "case":
 
                                       switch(funct["(verb)"]) {
                                          case "yield":
 
                                             
                                          case "break":
 
                                             
                                          case "case":
 
                                             
                                          case "continue":
 
                                             
                                          case "return":
 
                                             
                                          case "switch":
 
                                             
                                          case "throw":
 
                                                break;
                                             
                                          default:
 
                                                if (! reg.fallsThrough.test(state.lines[state.tokens.next.line - 2]))  {
                                                   warning("W086", state.tokens.curr, "case");
                                                }
                                             
}
;
                                       indentation(- state.option.indent);
                                       advance("case");
                                       this.cases.push(expression(20));
                                       increaseComplexityCount();
                                       g = true;
                                       advance(":");
                                       funct["(verb)"] = "case";
                                       break;
                                    
                                 case "default":
 
                                       switch(funct["(verb)"]) {
                                          case "yield":
 
                                             
                                          case "break":
 
                                             
                                          case "continue":
 
                                             
                                          case "return":
 
                                             
                                          case "throw":
 
                                                break;
                                             
                                          default:
 
                                                if (this.cases.length)  {
                                                   if (! reg.fallsThrough.test(state.lines[state.tokens.next.line - 2]))  {
                                                      warning("W086", state.tokens.curr, "default");
                                                   }
                                                }
                                             
}
;
                                       indentation(- state.option.indent);
                                       advance("default");
                                       g = true;
                                       advance(":");
                                       break;
                                    
                                 case "}":
 
                                       indent = state.option.indent;
                                       indentation();
                                       advance("}", t);
                                       funct["(breakage)"] = 1;
                                       funct["(verb)"] = undefined;
                                       return ;
                                    
                                 case "(end)":
 
                                       error("E023", state.tokens.next, "}");
                                       return ;
                                    
                                 default:
 
                                       if (g)  {
                                          switch(state.tokens.curr.id) {
                                             case ",":
 
                                                   error("E040");
                                                   return ;
                                                
                                             case ":":
 
                                                   g = false;
                                                   statements();
                                                   break;
                                                
                                             default:
 
                                                   error("E025", state.tokens.curr);
                                                   return ;
                                                
}
;
                                       }
                                        else  {
                                          if (state.tokens.curr.id === ":")  {
                                             advance(":");
                                             error("E024", state.tokens.curr, ":");
                                             statements();
                                          }
                                           else  {
                                             error("E021", state.tokens.next, "case", state.tokens.next.value);
                                             return ;
                                          }
                                       }
                                    
}
;
                           }
                     }
                  ).labelled = true;
                  stmt("debugger", function()  {
                        if (! state.option.debug)  {
                           warning("W087");
                        }
                        return this;
                     }
                  ).exps = true;
                  function()  {
                     var x = stmt("do", function()  {
                           funct["(breakage)"] = 1;
                           funct["(loopage)"] = 1;
                           increaseComplexityCount();
                           this.first = block(true);
                           advance("while");
                           var t = state.tokens.next;
                           nonadjacent(state.tokens.curr, t);
                           advance("(");
                           nospace();
                           expression(20);
                           parseCondAssignment();
                           advance(")", t);
                           nospace(state.tokens.prev, state.tokens.curr);
                           funct["(breakage)"] = 1;
                           funct["(loopage)"] = 1;
                           return this;
                        }
                     );
                     x.labelled = true;
                     x.exps = true;
                  }
();
                  blockstmt("for", function()  {
                        var s, t = state.tokens.next;
                        var letscope = false;
                        var foreachtok = null;
                        if (t.value === "each")  {
                           foreachtok = t;
                           advance("each");
                           if (! state.option.inMoz(true))  {
                              warning("W118", state.tokens.curr, "for each");
                           }
                        }
                        funct["(breakage)"] = 1;
                        funct["(loopage)"] = 1;
                        increaseComplexityCount();
                        advance("(");
                        nonadjacent(this, t);
                        nospace();
                        var nextop;
                        var i = 0;
                        var inof = ["in", "of"];
                        do  {
                              nextop = peek(i);
                              ++i;
                           }
 while (! _.contains(inof, nextop.value) && nextop.value !== ";" && nextop.type !== "(end)")                        if (_.contains(inof, nextop.value))  {
                           if (! state.option.inESNext() && nextop.value === "of")  {
                              error("W104", nextop, "for of");
                           }
                           if (state.tokens.next.id === "var")  {
                              advance("var");
                              state.syntax["var"].fud.call(state.syntax["var"].fud, true);
                           }
                            else if (state.tokens.next.id === "let")  {
                              advance("let");
                              letscope = true;
                              funct["(blockscope)"].stack();
                              state.syntax["let"].fud.call(state.syntax["let"].fud, true);
                           }
                            else  {
                              switch(funct[state.tokens.next.value]) {
                                 case "unused":
 
                                       funct[state.tokens.next.value] = "var";
                                       break;
                                    
                                 case "var":
 
                                       break;
                                    
                                 default:
 
                                       if (! funct["(blockscope)"].getlabel(state.tokens.next.value)) warning("W088", state.tokens.next, state.tokens.next.value)                                    
}
;
                              advance();
                           }
                           advance(nextop.value);
                           expression(20);
                           advance(")", t);
                           s = block(true, true);
                           if (state.option.forin && s && s.length > 1 || typeof s[0] !== "object" || s[0].value !== "if")  {
                              warning("W089", this);
                           }
                           funct["(breakage)"] = 1;
                           funct["(loopage)"] = 1;
                        }
                         else  {
                           if (foreachtok)  {
                              error("E045", foreachtok);
                           }
                           if (state.tokens.next.id !== ";")  {
                              if (state.tokens.next.id === "var")  {
                                 advance("var");
                                 state.syntax["var"].fud.call(state.syntax["var"].fud);
                              }
                               else if (state.tokens.next.id === "let")  {
                                 advance("let");
                                 letscope = true;
                                 funct["(blockscope)"].stack();
                                 state.syntax["let"].fud.call(state.syntax["let"].fud);
                              }
                               else  {
                                 for (; ; )  {
                                       expression(0, "for");
                                       if (state.tokens.next.id !== ",")  {
                                          break;
                                       }
                                       comma();
                                    }
                              }
                           }
                           nolinebreak(state.tokens.curr);
                           advance(";");
                           if (state.tokens.next.id !== ";")  {
                              expression(20);
                              parseCondAssignment();
                           }
                           nolinebreak(state.tokens.curr);
                           advance(";");
                           if (state.tokens.next.id === ";")  {
                              error("E021", state.tokens.next, ")", ";");
                           }
                           if (state.tokens.next.id !== ")")  {
                              for (; ; )  {
                                    expression(0, "for");
                                    if (state.tokens.next.id !== ",")  {
                                       break;
                                    }
                                    comma();
                                 }
                           }
                           advance(")", t);
                           nospace(state.tokens.prev, state.tokens.curr);
                           block(true, true);
                           funct["(breakage)"] = 1;
                           funct["(loopage)"] = 1;
                        }
                        if (letscope)  {
                           funct["(blockscope)"].unstack();
                        }
                        return this;
                     }
                  ).labelled = true;
                  stmt("break", function()  {
                        var v = state.tokens.next.value;
                        if (funct["(breakage)"] === 0) warning("W052", state.tokens.next, this.value)                        if (! state.option.asi) nolinebreak(this)                        if (state.tokens.next.id !== ";")  {
                           if (state.tokens.curr.line === state.tokens.next.line)  {
                              if (funct[v] !== "label")  {
                                 warning("W090", state.tokens.next, v);
                              }
                               else if (scope[v] !== funct)  {
                                 warning("W091", state.tokens.next, v);
                              }
                              this.first = state.tokens.next;
                              advance();
                           }
                        }
                        reachable("break");
                        return this;
                     }
                  ).exps = true;
                  stmt("continue", function()  {
                        var v = state.tokens.next.value;
                        if (funct["(breakage)"] === 0) warning("W052", state.tokens.next, this.value)                        if (! state.option.asi) nolinebreak(this)                        if (state.tokens.next.id !== ";")  {
                           if (state.tokens.curr.line === state.tokens.next.line)  {
                              if (funct[v] !== "label")  {
                                 warning("W090", state.tokens.next, v);
                              }
                               else if (scope[v] !== funct)  {
                                 warning("W091", state.tokens.next, v);
                              }
                              this.first = state.tokens.next;
                              advance();
                           }
                        }
                         else if (! funct["(loopage)"])  {
                           warning("W052", state.tokens.next, this.value);
                        }
                        reachable("continue");
                        return this;
                     }
                  ).exps = true;
                  stmt("return", function()  {
                        if (this.line === state.tokens.next.line)  {
                           if (state.tokens.next.id === "(regexp)") warning("W092")                           if (state.tokens.next.id !== ";" && ! state.tokens.next.reach)  {
                              nonadjacent(state.tokens.curr, state.tokens.next);
                              this.first = expression(0);
                              if (this.first && this.first.type === "(punctuator)" && this.first.value === "=" && ! state.option.boss)  {
                                 warningAt("W093", this.first.line, this.first.character);
                              }
                           }
                        }
                         else  {
                           nolinebreak(this);
                        }
                        reachable("return");
                        return this;
                     }
                  ).exps = true;
                  stmt("yield", function()  {
                        if (state.option.inESNext(true) && funct["(generator)"] !== true)  {
                           error("E046", state.tokens.curr, "yield");
                        }
                         else if (! state.option.inESNext())  {
                           warning("W104", state.tokens.curr, "yield");
                        }
                        funct["(generator)"] = "yielded";
                        if (this.line === state.tokens.next.line)  {
                           if (state.tokens.next.id === "(regexp)") warning("W092")                           if (state.tokens.next.id !== ";" && ! state.tokens.next.reach)  {
                              nonadjacent(state.tokens.curr, state.tokens.next);
                              this.first = expression(0);
                              if (this.first.type === "(punctuator)" && this.first.value === "=" && ! state.option.boss)  {
                                 warningAt("W093", this.first.line, this.first.character);
                              }
                           }
                        }
                         else if (! state.option.asi)  {
                           nolinebreak(this);
                        }
                        return this;
                     }
                  ).exps = true;
                  stmt("throw", function()  {
                        nolinebreak(this);
                        nonadjacent(state.tokens.curr, state.tokens.next);
                        this.first = expression(20);
                        reachable("throw");
                        return this;
                     }
                  ).exps = true;
                  FutureReservedWord("abstract");
                  FutureReservedWord("boolean");
                  FutureReservedWord("byte");
                  FutureReservedWord("char");
                  FutureReservedWord("class",  {
                        es5:true                     }
                  );
                  FutureReservedWord("double");
                  FutureReservedWord("enum",  {
                        es5:true                     }
                  );
                  FutureReservedWord("export",  {
                        es5:true                     }
                  );
                  FutureReservedWord("extends",  {
                        es5:true                     }
                  );
                  FutureReservedWord("final");
                  FutureReservedWord("float");
                  FutureReservedWord("goto");
                  FutureReservedWord("implements",  {
                        es5:true, 
                        strictOnly:true                     }
                  );
                  FutureReservedWord("import",  {
                        es5:true                     }
                  );
                  FutureReservedWord("int");
                  FutureReservedWord("interface");
                  FutureReservedWord("long");
                  FutureReservedWord("native");
                  FutureReservedWord("package",  {
                        es5:true, 
                        strictOnly:true                     }
                  );
                  FutureReservedWord("private",  {
                        es5:true, 
                        strictOnly:true                     }
                  );
                  FutureReservedWord("protected",  {
                        es5:true, 
                        strictOnly:true                     }
                  );
                  FutureReservedWord("public",  {
                        es5:true, 
                        strictOnly:true                     }
                  );
                  FutureReservedWord("short");
                  FutureReservedWord("static",  {
                        es5:true, 
                        strictOnly:true                     }
                  );
                  FutureReservedWord("super",  {
                        es5:true                     }
                  );
                  FutureReservedWord("synchronized");
                  FutureReservedWord("throws");
                  FutureReservedWord("transient");
                  FutureReservedWord("volatile");
                  var lookupBlockType = function()  {
                     var pn, pn1;
                     var i = 0;
                     var bracketStack = 0;
                     var ret =  {} ;
                     if (_.contains(["[", "{"], state.tokens.curr.value)) bracketStack = 1                     if (_.contains(["[", "{"], state.tokens.next.value)) bracketStack = 1                     if (_.contains(["]", "}"], state.tokens.next.value)) bracketStack = 1                     do  {
                           pn = peek(i);
                           pn1 = peek(i + 1);
                           i = i + 1;
                           if (_.contains(["[", "{"], pn.value))  {
                              bracketStack = 1;
                           }
                            else if (_.contains(["]", "}"], pn.value))  {
                              bracketStack = 1;
                           }
                           if (pn.identifier && pn.value === "for" && bracketStack === 1)  {
                              ret.isCompArray = true;
                              ret.notJson = true;
                              break;
                           }
                           if (_.contains(["}", "]"], pn.value) && pn1.value === "=")  {
                              ret.isDestAssign = true;
                              ret.notJson = true;
                              break;
                           }
                           if (pn.value === ";")  {
                              ret.isBlock = true;
                              ret.notJson = true;
                           }
                        }
 while (bracketStack > 0 && pn.id !== "(end)" && i < 15)                     return ret;
                  }
;
                  function destructuringAssignOrJsonValue()  {
                     var block = lookupBlockType();
                     if (block.notJson)  {
                        if (! state.option.inESNext() && block.isDestAssign)  {
                           warning("W104", state.tokens.curr, "destructuring assignment");
                        }
                        statements();
                     }
                      else  {
                        state.option.laxbreak = true;
                        state.jsonMode = true;
                        jsonValue();
                     }
                  }
;
                  var arrayComprehension = function()  {
                     var CompArray = function()  {
                        this.mode = "use";
                        this.variables = [];
                     }
;
                     var _carrays = [];
                     var _current;
                     function declare(v)  {
                        var l = _current.variables.filter(function(elt)  {
                              if (elt.value === v)  {
                                 elt.undef = false;
                                 return v;
                              }
                           }
                        ).length;
                        return l !== 0;
                     }
;
                     function use(v)  {
                        var l = _current.variables.filter(function(elt)  {
                              if (elt.value === v && ! elt.undef)  {
                                 if (elt.unused === true)  {
                                    elt.unused = false;
                                 }
                                 return v;
                              }
                           }
                        ).length;
                        return l === 0;
                     }
;
                     return  {
                        stack:function()  {
                           _current = new CompArray();
                           _carrays.push(_current);
                        }, 
                        unstack:function()  {
                           _current.variables.filter(function(v)  {
                                 if (v.unused) warning("W098", v.token, v.value)                                 if (v.undef) isundef(v.funct, "W117", v.token, v.value)                              }
                           );
                           _carrays.splice(_carrays[_carrays.length - 1], 1);
                           _current = _carrays[_carrays.length - 1];
                        }, 
                        setState:function(s)  {
                           if (_.contains(["use", "define", "filter"], s)) _current.mode = s                        }, 
                        check:function(v)  {
                           if (_current && _current.mode === "use")  {
                              _current.variables.push( {
                                    funct:funct, 
                                    token:state.tokens.curr, 
                                    value:v, 
                                    undef:true, 
                                    unused:false                                 }
                              );
                              return true;
                           }
                            else if (_current && _current.mode === "define")  {
                              if (! declare(v))  {
                                 _current.variables.push( {
                                       funct:funct, 
                                       token:state.tokens.curr, 
                                       value:v, 
                                       undef:false, 
                                       unused:true                                    }
                                 );
                              }
                              return true;
                           }
                            else if (_current && _current.mode === "filter")  {
                              if (use(v))  {
                                 isundef(funct, "W117", state.tokens.curr, v);
                              }
                              return true;
                           }
                           return false;
                        }} ;
                  }
;
                  function jsonValue()  {
                     function jsonObject()  {
                        var o =  {} , t = state.tokens.next;
                        advance("{");
                        if (state.tokens.next.id !== "}")  {
                           for (; ; )  {
                                 if (state.tokens.next.id === "(end)")  {
                                    error("E026", state.tokens.next, t.line);
                                 }
                                  else if (state.tokens.next.id === "}")  {
                                    warning("W094", state.tokens.curr);
                                    break;
                                 }
                                  else if (state.tokens.next.id === ",")  {
                                    error("E028", state.tokens.next);
                                 }
                                  else if (state.tokens.next.id !== "(string)")  {
                                    warning("W095", state.tokens.next, state.tokens.next.value);
                                 }
                                 if (o[state.tokens.next.value] === true)  {
                                    warning("W075", state.tokens.next, state.tokens.next.value);
                                 }
                                  else if (state.tokens.next.value === "__proto__" && ! state.option.proto || state.tokens.next.value === "__iterator__" && ! state.option.iterator)  {
                                    warning("W096", state.tokens.next, state.tokens.next.value);
                                 }
                                  else  {
                                    o[state.tokens.next.value] = true;
                                 }
                                 advance();
                                 advance(":");
                                 jsonValue();
                                 if (state.tokens.next.id !== ",")  {
                                    break;
                                 }
                                 advance(",");
                              }
                        }
                        advance("}");
                     }
;
                     function jsonArray()  {
                        var t = state.tokens.next;
                        advance("[");
                        if (state.tokens.next.id !== "]")  {
                           for (; ; )  {
                                 if (state.tokens.next.id === "(end)")  {
                                    error("E027", state.tokens.next, t.line);
                                 }
                                  else if (state.tokens.next.id === "]")  {
                                    warning("W094", state.tokens.curr);
                                    break;
                                 }
                                  else if (state.tokens.next.id === ",")  {
                                    error("E028", state.tokens.next);
                                 }
                                 jsonValue();
                                 if (state.tokens.next.id !== ",")  {
                                    break;
                                 }
                                 advance(",");
                              }
                        }
                        advance("]");
                     }
;
                     switch(state.tokens.next.id) {
                        case "{":
 
                              jsonObject();
                              break;
                           
                        case "[":
 
                              jsonArray();
                              break;
                           
                        case "true":
 
                           
                        case "false":
 
                           
                        case "null":
 
                           
                        case "(number)":
 
                           
                        case "(string)":
 
                              advance();
                              break;
                           
                        case "-":
 
                              advance("-");
                              if (state.tokens.curr.character !== state.tokens.next.from)  {
                                 warning("W011", state.tokens.curr);
                              }
                              adjacent(state.tokens.curr, state.tokens.next);
                              advance("(number)");
                              break;
                           
                        default:
 
                              error("E003", state.tokens.next);
                           
}
;
                  }
;
                  var blockScope = function()  {
                     var _current =  {} ;
                     var _variables = [_current];
                     function _checkBlockLabels()  {
                        for (var t in _current)  {
                              if (_current[t]["(type)"] === "unused")  {
                                 if (state.option.unused)  {
                                    var tkn = _current[t]["(token)"];
                                    var line = tkn.line;
                                    var chr = tkn.character;
                                    warningAt("W098", line, chr, t);
                                 }
                              }
                           }
                     }
;
                     return  {
                        stack:function()  {
                           _current =  {} ;
                           _variables.push(_current);
                        }, 
                        unstack:function()  {
                           _checkBlockLabels();
                           _variables.splice(_variables.length - 1, 1);
                           _current = _.last(_variables);
                        }, 
                        getlabel:function(l)  {
                           for (var i = _variables.length - 1; i >= 0; --i)  {
                                 if (_.has(_variables[i], l))  {
                                    return _variables[i];
                                 }
                              }
                        }, 
                        current: {
                           has:function(t)  {
                              return _.has(_current, t);
                           }, 
                           add:function(t, type, tok)  {
                              _current[t] =  {
                                 (type):type, 
                                 (token):tok                              }
;
                           }}                      }
;
                  }
;
                  var itself = function(s, o, g)  {
                     var a, i, k, x;
                     var optionKeys;
                     var newOptionObj =  {} ;
                     var newIgnoredObj =  {} ;
                     state.reset();
                     if (o && o.scope)  {
                        JSHINT.scope = o.scope;
                     }
                      else  {
                        JSHINT.errors = [];
                        JSHINT.undefs = [];
                        JSHINT.internals = [];
                        JSHINT.blacklist =  {} ;
                        JSHINT.scope = "(main)";
                     }
                     predefined = Object.create(null);
                     combine(predefined, vars.ecmaIdentifiers);
                     combine(predefined, vars.reservedVars);
                     combine(predefined, g ||  {} );
                     declared = Object.create(null);
                     exported = Object.create(null);
                     if (o)  {
                        a = o.predef;
                        if (a)  {
                           if (! Array.isArray(a) && typeof a === "object")  {
                              a = Object.keys(a);
                           }
                           a.forEach(function(item)  {
                                 var slice, prop;
                                 if (item[0] === "-")  {
                                    slice = item.slice(1);
                                    JSHINT.blacklist[slice] = slice;
                                 }
                                  else  {
                                    prop = Object.getOwnPropertyDescriptor(o.predef, item);
                                    predefined[item] = prop ? prop.value : false;
                                 }
                              }
                           );
                        }
                        optionKeys = Object.keys(o);
                        for (x = 0; x < optionKeys.length; x++)  {
                              if (/^-W\d{3}$/g.test(optionKeys[x]))  {
                                 newIgnoredObj[optionKeys[x].slice(1)] = true;
                              }
                               else  {
                                 newOptionObj[optionKeys[x]] = o[optionKeys[x]];
                                 if (optionKeys[x] === "newcap" && o[optionKeys[x]] === false) newOptionObj["(explicitNewcap)"] = true                                 if (optionKeys[x] === "indent") newOptionObj["(explicitIndent)"] = o[optionKeys[x]] === false ? false : true                              }
                           }
                     }
                     state.option = newOptionObj;
                     state.ignored = newIgnoredObj;
                     state.option.indent = state.option.indent || 4;
                     state.option.maxerr = state.option.maxerr || 50;
                     indent = 1;
                     global = Object.create(predefined);
                     scope = global;
                     funct =  {
                        (global):true, 
                        (name):"(global)", 
                        (scope):scope, 
                        (breakage):0, 
                        (loopage):0, 
                        (tokens): {} , 
                        (metrics):createMetrics(state.tokens.next), 
                        (blockscope):blockScope(), 
                        (comparray):arrayComprehension()                     }
;
                     functions = [funct];
                     urls = [];
                     stack = null;
                     member =  {} ;
                     membersOnly = null;
                     implied =  {} ;
                     inblock = false;
                     lookahead = [];
                     warnings = 0;
                     unuseds = [];
                     if (! isString(s) && ! Array.isArray(s))  {
                        errorAt("E004", 0);
                        return false;
                     }
                     api =  {
                        isJSON:function()  {
                           return state.jsonMode;
                        }, 
                        getOption:function(name)  {
                           return state.option[name] || null;
                        }, 
                        getCache:function(name)  {
                           return state.cache[name];
                        }, 
                        setCache:function(name, value)  {
                           state.cache[name] = value;
                        }, 
                        warn:function(code, data)  {
                           warningAt.apply(null, [code, data.line, data.char].concat(data.data));
                        }, 
                        on:function(names, listener)  {
                           names.split(" ").forEach(function(name)  {
                                 emitter.on(name, listener);
                              }
.bind(this));
                        }} ;
                     emitter.removeAllListeners();
                     extraModules || [].forEach(function(func)  {
                           func(api);
                        }
                     );
                     state.tokens.prev = state.tokens.curr = state.tokens.next = state.syntax["(begin)"];
                     lex = new Lexer(s);
                     lex.on("warning", function(ev)  {
                           warningAt.apply(null, [ev.code, ev.line, ev.character].concat(ev.data));
                        }
                     );
                     lex.on("error", function(ev)  {
                           errorAt.apply(null, [ev.code, ev.line, ev.character].concat(ev.data));
                        }
                     );
                     lex.on("fatal", function(ev)  {
                           quit("E041", ev.line, ev.from);
                        }
                     );
                     lex.on("Identifier", function(ev)  {
                           emitter.emit("Identifier", ev);
                        }
                     );
                     lex.on("String", function(ev)  {
                           emitter.emit("String", ev);
                        }
                     );
                     lex.on("Number", function(ev)  {
                           emitter.emit("Number", ev);
                        }
                     );
                     lex.start();
                     for (var name in o)  {
                           if (_.has(o, name))  {
                              checkOption(name, state.tokens.curr);
                           }
                        }
                     assume();
                     combine(predefined, g ||  {} );
                     comma.first = true;
                     try {
                        advance();
                        switch(state.tokens.next.id) {
                           case "{":
 
                              
                           case "[":
 
                                 destructuringAssignOrJsonValue();
                                 break;
                              
                           default:
 
                                 directives();
                                 if (state.directive["use strict"])  {
                                    if (! state.option.globalstrict && ! state.option.node)  {
                                       warning("W097", state.tokens.prev);
                                    }
                                 }
                                 statements();
                              
}
;
                        advance(state.tokens.next && state.tokens.next.value !== "." ? "(end)" : undefined);
                        var markDefined = function(name, context)  {
                           do  {
                                 if (typeof context[name] === "string")  {
                                    if (context[name] === "unused") context[name] = "var"                                     else if (context[name] === "unction") context[name] = "closure"                                    return true;
                                 }
                                 context = context["(context)"];
                              }
 while (context)                           return false;
                        }
;
                        var clearImplied = function(name, line)  {
                           if (! implied[name]) return                            var newImplied = [];
                           for (var i = 0; i < implied[name].length; i = 1)  {
                                 if (implied[name][i] !== line) newImplied.push(implied[name][i])                              }
                           if (newImplied.length === 0) delete implied[name]                            else implied[name] = newImplied                        }
;
                        var warnUnused = function(name, tkn, type, unused_opt)  {
                           var line = tkn.line;
                           var chr = tkn.character;
                           if (unused_opt === undefined)  {
                              unused_opt = state.option.unused;
                           }
                           if (unused_opt === true)  {
                              unused_opt = "last-param";
                           }
                           var warnable_types =  {
                              vars:["var"], 
                              last-param:["var", "param"], 
                              strict:["var", "param", "last-param"]                           }
;
                           if (unused_opt)  {
                              if (warnable_types[unused_opt] && warnable_types[unused_opt].indexOf(type) !== - 1)  {
                                 warningAt("W098", line, chr, name);
                              }
                           }
                           unuseds.push( {
                                 name:name, 
                                 line:line, 
                                 character:chr                              }
                           );
                        }
;
                        var checkUnused = function(func, key)  {
                           var type = func[key];
                           var tkn = func["(tokens)"][key];
                           if (key.charAt(0) === "(") return                            if (type !== "unused" && type !== "unction") return                            if (func["(params)"] && func["(params)"].indexOf(key) !== - 1) return                            if (func["(global)"] && _.has(exported, key))  {
                              return ;
                           }
                           warnUnused(key, tkn, "var");
                        }
;
                        for (i = 0; i < JSHINT.undefs.length; i = 1)  {
                              k = JSHINT.undefs[i].slice(0);
                              if (markDefined(k[2].value, k[0]))  {
                                 clearImplied(k[2].value, k[2].line);
                              }
                               else if (state.option.undef)  {
                                 warning.apply(warning, k.slice(1));
                              }
                           }
                        functions.forEach(function(func)  {
                              if (func["(unusedOption)"] === false)  {
                                 return ;
                              }
                              for (var key in func)  {
                                    if (_.has(func, key))  {
                                       checkUnused(func, key);
                                    }
                                 }
                              if (! func["(params)"]) return                               var params = func["(params)"].slice();
                              var param = params.pop();
                              var type, unused_opt;
                              while (param)  {
                                    type = func[param];
                                    unused_opt = func["(unusedOption)"] || state.option.unused;
                                    unused_opt = unused_opt === true ? "last-param" : unused_opt;
                                    if (param === "undefined") return                                     if (type === "unused" || type === "unction")  {
                                       warnUnused(param, func["(tokens)"][param], "param", func["(unusedOption)"]);
                                    }
                                     else if (unused_opt === "last-param")  {
                                       return ;
                                    }
                                    param = params.pop();
                                 }
                           }
                        );
                        for (var key in declared)  {
                              if (_.has(declared, key) && ! _.has(global, key))  {
                                 warnUnused(key, declared[key], "var");
                              }
                           }
                     }
                     catch (err) {
                        if (err && err.name === "JSHintError")  {
                           var nt = state.tokens.next ||  {} ;
                           JSHINT.errors.push( {
                                 scope:"(main)", 
                                 raw:err.raw, 
                                 reason:err.message, 
                                 line:err.line || nt.line, 
                                 character:err.character || nt.from                              }, 
                              null);
                        }
                         else  {
                           throw err;
                        }
                     }
                     if (JSHINT.scope === "(main)")  {
                        o = o ||  {} ;
                        for (i = 0; i < JSHINT.internals.length; i = 1)  {
                              k = JSHINT.internals[i];
                              o.scope = k.elem;
                              itself(k.value, o, g);
                           }
                     }
                     return JSHINT.errors.length === 0;
                  }
;
                  itself.addModule = function(func)  {
                     extraModules.push(func);
                  }
;
                  itself.addModule(style.register);
                  itself.data = function()  {
                     var data =  {
                        functions:[], 
                        options:state.option                     }
;
                     var implieds = [];
                     var members = [];
                     var fu, f, i, j, n, globals;
                     if (itself.errors.length)  {
                        data.errors = itself.errors;
                     }
                     if (state.jsonMode)  {
                        data.json = true;
                     }
                     for (n in implied)  {
                           if (_.has(implied, n))  {
                              implieds.push( {
                                    name:n, 
                                    line:implied[n]                                 }
                              );
                           }
                        }
                     if (implieds.length > 0)  {
                        data.implieds = implieds;
                     }
                     if (urls.length > 0)  {
                        data.urls = urls;
                     }
                     globals = Object.keys(scope);
                     if (globals.length > 0)  {
                        data.globals = globals;
                     }
                     for (i = 1; i < functions.length; i = 1)  {
                           f = functions[i];
                           fu =  {} ;
                           for (j = 0; j < functionicity.length; j = 1)  {
                                 fu[functionicity[j]] = [];
                              }
                           for (j = 0; j < functionicity.length; j = 1)  {
                                 if (fu[functionicity[j]].length === 0)  {
                                    delete fu[functionicity[j]];
                                 }
                              }
                           fu.name = f["(name)"];
                           fu.param = f["(params)"];
                           fu.line = f["(line)"];
                           fu.character = f["(character)"];
                           fu.last = f["(last)"];
                           fu.lastcharacter = f["(lastcharacter)"];
                           data.functions.push(fu);
                        }
                     if (unuseds.length > 0)  {
                        data.unused = unuseds;
                     }
                     members = [];
                     for (n in member)  {
                           if (typeof member[n] === "number")  {
                              data.member = member;
                              break;
                           }
                        }
                     return data;
                  }
;
                  itself.jshint = itself;
                  return itself;
               }
();
               if (typeof exports === "object" && exports)  {
                  exports.JSHINT = JSHINT;
               }
            }
();
         }
,  {
            events:2, 
            ../shared/vars.js:3, 
            ../shared/messages.js:7, 
            ./lex.js:8, 
            ./reg.js:4, 
            ./state.js:5, 
            ./style.js:6, 
            console-browserify:9, 
            underscore:10         }
], 
         :[function(require, module, exports)  {
            function(global)  {
               var util = require("util");
               var assert = require("assert");
               var slice = Array.prototype.slice;
               var console;
               var times =  {} ;
               if (typeof global !== "undefined" && global.console)  {
                  console = global.console;
               }
                else if (typeof window !== "undefined" && window.console)  {
                  console = window.console;
               }
                else  {
                  console = window.console =  {} ;
               }
               var functions = [[log, "log"], [info, "info"], [warn, "warn"], [error, "error"], [time, "time"], [timeEnd, "timeEnd"], [trace, "trace"], [dir, "dir"], [assert, "assert"]];
               for (var i = 0; i < functions.length; i++)  {
                     var tuple = functions[i];
                     var f = tuple[0];
                     var name = tuple[1];
                     if (! console[name])  {
                        console[name] = f;
                     }
                  }
               module.exports = console;
               function log()  {
               }
;
               function info()  {
                  console.log.apply(console, arguments);
               }
;
               function warn()  {
                  console.log.apply(console, arguments);
               }
;
               function error()  {
                  console.warn.apply(console, arguments);
               }
;
               function time(label)  {
                  times[label] = Date.now();
               }
;
               function timeEnd(label)  {
                  var time = times[label];
                  if (! time)  {
                     throw new Error("No such label: " + label);
                  }
                  var duration = Date.now() - time;
                  console.log(label + ": " + duration + "ms");
               }
;
               function trace()  {
                  var err = new Error();
                  err.name = "Trace";
                  err.message = util.format.apply(null, arguments);
                  console.error(err.stack);
               }
;
               function dir(object)  {
                  console.log(util.inspect(object) + "
");
               }
;
               function assert(expression)  {
                  if (! expression)  {
                     var arr = slice.call(arguments, 1);
                     assert.ok(false, util.format.apply(null, arr));
                  }
               }
;
            }
(window);
         }
,  {
            util:11, 
            assert:12         }
], 
         :[function(require, module, exports)  {
            function()  {
               "use strict";
               var _ = require("underscore");
               var errors =  {
                  E001:"Bad option: '{a}'.", 
                  E002:"Bad option value.", 
                  E003:"Expected a JSON value.", 
                  E004:"Input is neither a string nor an array of strings.", 
                  E005:"Input is empty.", 
                  E006:"Unexpected early end of program.", 
                  E007:"Missing "use strict" statement.", 
                  E008:"Strict violation.", 
                  E009:"Option 'validthis' can't be used in a global scope.", 
                  E010:"'with' is not allowed in strict mode.", 
                  E011:"const '{a}' has already been declared.", 
                  E012:"const '{a}' is initialized to 'undefined'.", 
                  E013:"Attempting to override '{a}' which is a constant.", 
                  E014:"A regular expression literal can be confused with '/='.", 
                  E015:"Unclosed regular expression.", 
                  E016:"Invalid regular expression.", 
                  E017:"Unclosed comment.", 
                  E018:"Unbegun comment.", 
                  E019:"Unmatched '{a}'.", 
                  E020:"Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'.", 
                  E021:"Expected '{a}' and instead saw '{b}'.", 
                  E022:"Line breaking error '{a}'.", 
                  E023:"Missing '{a}'.", 
                  E024:"Unexpected '{a}'.", 
                  E025:"Missing ':' on a case clause.", 
                  E026:"Missing '}' to match '{' from line {a}.", 
                  E027:"Missing ']' to match '[' form line {a}.", 
                  E028:"Illegal comma.", 
                  E029:"Unclosed string.", 
                  E030:"Expected an identifier and instead saw '{a}'.", 
                  E031:"Bad assignment.", 
                  E032:"Expected a small integer or 'false' and instead saw '{a}'.", 
                  E033:"Expected an operator and instead saw '{a}'.", 
                  E034:"get/set are ES5 features.", 
                  E035:"Missing property name.", 
                  E036:"Expected to see a statement and instead saw a block.", 
                  E037:"Constant {a} was not declared correctly.", 
                  E038:"Variable {a} was not declared correctly.", 
                  E039:"Function declarations are not invocable. Wrap the whole function invocation in parens.", 
                  E040:"Each value should have its own case label.", 
                  E041:"Unrecoverable syntax error.", 
                  E042:"Stopping.", 
                  E043:"Too many errors.", 
                  E044:"'{a}' is already defined and can't be redefined.", 
                  E045:"Invalid for each loop.", 
                  E046:"A yield statement shall be within a generator function (with syntax: `function*`)", 
                  E047:"A generator function shall contain a yield statement.", 
                  E048:"Let declaration not directly within block."               }
;
               var warnings =  {
                  W001:"'hasOwnProperty' is a really bad name.", 
                  W002:"Value of '{a}' may be overwritten in IE.", 
                  W003:"'{a}' was used before it was defined.", 
                  W004:"'{a}' is already defined.", 
                  W005:"A dot following a number can be confused with a decimal point.", 
                  W006:"Confusing minuses.", 
                  W007:"Confusing pluses.", 
                  W008:"A leading decimal point can be confused with a dot: '{a}'.", 
                  W009:"The array literal notation [] is preferrable.", 
                  W010:"The object literal notation {} is preferrable.", 
                  W011:"Unexpected space after '{a}'.", 
                  W012:"Unexpected space before '{a}'.", 
                  W013:"Missing space after '{a}'.", 
                  W014:"Bad line breaking before '{a}'.", 
                  W015:"Expected '{a}' to have an indentation at {b} instead at {c}.", 
                  W016:"Unexpected use of '{a}'.", 
                  W017:"Bad operand.", 
                  W018:"Confusing use of '{a}'.", 
                  W019:"Use the isNaN function to compare with NaN.", 
                  W020:"Read only.", 
                  W021:"'{a}' is a function.", 
                  W022:"Do not assign to the exception parameter.", 
                  W023:"Expected an identifier in an assignment and instead saw a function invocation.", 
                  W024:"Expected an identifier and instead saw '{a}' (a reserved word).", 
                  W025:"Missing name in function declaration.", 
                  W026:"Inner functions should be listed at the top of the outer function.", 
                  W027:"Unreachable '{a}' after '{b}'.", 
                  W028:"Label '{a}' on {b} statement.", 
                  W030:"Expected an assignment or function call and instead saw an expression.", 
                  W031:"Do not use 'new' for side effects.", 
                  W032:"Unnecessary semicolon.", 
                  W033:"Missing semicolon.", 
                  W034:"Unnecessary directive "{a}".", 
                  W035:"Empty block.", 
                  W036:"Unexpected /*member '{a}'.", 
                  W037:"'{a}' is a statement label.", 
                  W038:"'{a}' used out of scope.", 
                  W039:"'{a}' is not allowed.", 
                  W040:"Possible strict violation.", 
                  W041:"Use '{a}' to compare with '{b}'.", 
                  W042:"Avoid EOL escaping.", 
                  W043:"Bad escaping of EOL. Use option multistr if needed.", 
                  W044:"Bad or unnecessary escaping.", 
                  W045:"Bad number '{a}'.", 
                  W046:"Don't use extra leading zeros '{a}'.", 
                  W047:"A trailing decimal point can be confused with a dot: '{a}'.", 
                  W048:"Unexpected control character in regular expression.", 
                  W049:"Unexpected escaped character '{a}' in regular expression.", 
                  W050:"JavaScript URL.", 
                  W051:"Variables should not be deleted.", 
                  W052:"Unexpected '{a}'.", 
                  W053:"Do not use {a} as a constructor.", 
                  W054:"The Function constructor is a form of eval.", 
                  W055:"A constructor name should start with an uppercase letter.", 
                  W056:"Bad constructor.", 
                  W057:"Weird construction. Is 'new' unnecessary?", 
                  W058:"Missing '()' invoking a constructor.", 
                  W059:"Avoid arguments.{a}.", 
                  W060:"document.write can be a form of eval.", 
                  W061:"eval can be harmful.", 
                  W062:"Wrap an immediate function invocation in parens " + "to assist the reader in understanding that the expression " + "is the result of a function, and not the function itself.", 
                  W063:"Math is not a function.", 
                  W064:"Missing 'new' prefix when invoking a constructor.", 
                  W065:"Missing radix parameter.", 
                  W066:"Implied eval. Consider passing a function instead of a string.", 
                  W067:"Bad invocation.", 
                  W068:"Wrapping non-IIFE function literals in parens is unnecessary.", 
                  W069:"['{a}'] is better written in dot notation.", 
                  W070:"Extra comma. (it breaks older versions of IE)", 
                  W071:"This function has too many statements. ({a})", 
                  W072:"This function has too many parameters. ({a})", 
                  W073:"Blocks are nested too deeply. ({a})", 
                  W074:"This function's cyclomatic complexity is too high. ({a})", 
                  W075:"Duplicate key '{a}'.", 
                  W076:"Unexpected parameter '{a}' in get {b} function.", 
                  W077:"Expected a single parameter in set {a} function.", 
                  W078:"Setter is defined without getter.", 
                  W079:"Redefinition of '{a}'.", 
                  W080:"It's not necessary to initialize '{a}' to 'undefined'.", 
                  W081:"Too many var statements.", 
                  W082:"Function declarations should not be placed in blocks. " + "Use a function expression or move the statement to the top of " + "the outer function.", 
                  W083:"Don't make functions within a loop.", 
                  W084:"Expected a conditional expression and instead saw an assignment.", 
                  W085:"Don't use 'with'.", 
                  W086:"Expected a 'break' statement before '{a}'.", 
                  W087:"Forgotten 'debugger' statement?", 
                  W088:"Creating global 'for' variable. Should be 'for (var {a} ...'.", 
                  W089:"The body of a for in should be wrapped in an if statement to filter " + "unwanted properties from the prototype.", 
                  W090:"'{a}' is not a statement label.", 
                  W091:"'{a}' is out of scope.", 
                  W092:"Wrap the /regexp/ literal in parens to disambiguate the slash operator.", 
                  W093:"Did you mean to return a conditional instead of an assignment?", 
                  W094:"Unexpected comma.", 
                  W095:"Expected a string and instead saw {a}.", 
                  W096:"The '{a}' key may produce unexpected results.", 
                  W097:"Use the function form of "use strict".", 
                  W098:"'{a}' is defined but never used.", 
                  W099:"Mixed spaces and tabs.", 
                  W100:"This character may get silently deleted by one or more browsers.", 
                  W101:"Line is too long.", 
                  W102:"Trailing whitespace.", 
                  W103:"The '{a}' property is deprecated.", 
                  W104:"'{a}' is only available in JavaScript 1.7.", 
                  W105:"Unexpected {a} in '{b}'.", 
                  W106:"Identifier '{a}' is not in camel case.", 
                  W107:"Script URL.", 
                  W108:"Strings must use doublequote.", 
                  W109:"Strings must use singlequote.", 
                  W110:"Mixed double and single quotes.", 
                  W112:"Unclosed string.", 
                  W113:"Control character in string: {a}.", 
                  W114:"Avoid {a}.", 
                  W115:"Octal literals are not allowed in strict mode.", 
                  W116:"Expected '{a}' and instead saw '{b}'.", 
                  W117:"'{a}' is not defined.", 
                  W118:"'{a}' is only available in Mozilla JavaScript extensions (use moz option).", 
                  W119:"'{a}' is only available in ES6 (use esnext option)."               }
;
               var info =  {
                  I001:"Comma warnings can be turned off with 'laxcomma'.", 
                  I002:"Reserved words as properties can be used under the 'es5' option.", 
                  I003:"ES5 option is now set per default"               }
;
               exports.errors =  {} ;
               exports.warnings =  {} ;
               exports.info =  {} ;
               _.each(errors, function(desc, code)  {
                     exports.errors[code] =  {
                        code:code, 
                        desc:desc                     }
;
                  }
               );
               _.each(warnings, function(desc, code)  {
                     exports.warnings[code] =  {
                        code:code, 
                        desc:desc                     }
;
                  }
               );
               _.each(info, function(desc, code)  {
                     exports.info[code] =  {
                        code:code, 
                        desc:desc                     }
;
                  }
               );
            }
();
         }
,  {
            underscore:10         }
], 
         :[function(require, module, exports)  {
            function()  {
               "use strict";
               var _ = require("underscore");
               var events = require("events");
               var reg = require("./reg.js");
               var state = require("./state.js").state;
               var Token =  {
                  Identifier:1, 
                  Punctuator:2, 
                  NumericLiteral:3, 
                  StringLiteral:4, 
                  Comment:5, 
                  Keyword:6, 
                  NullLiteral:7, 
                  BooleanLiteral:8, 
                  RegExp:9               }
;
               var unicodeLetterTable = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 705, 710, 721, 736, 740, 748, 748, 750, 750, 880, 884, 886, 887, 890, 893, 902, 902, 904, 906, 908, 908, 910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366, 1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1610, 1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775, 1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957, 1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069, 2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2308, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2417, 2423, 2425, 2431, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929, 2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261, 3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344, 3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760, 3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3805, 3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138, 4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198, 4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4304, 4346, 4348, 4348, 4352, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900, 5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000, 6016, 6067, 6103, 6103, 6108, 6108, 6176, 6263, 6272, 6312, 6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516, 6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823, 6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7104, 7141, 7168, 7203, 7245, 7247, 7258, 7293, 7401, 7404, 7406, 7409, 7424, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521, 8526, 8526, 8544, 8584, 11264, 11310, 11312, 11358, 11360, 11492, 11499, 11502, 11520, 11557, 11568, 11621, 11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 11823, 11823, 12293, 12295, 12321, 12329, 12337, 12341, 12344, 12348, 12353, 12438, 12445, 12447, 12449, 12538, 12540, 12543, 12549, 12589, 12593, 12686, 12704, 12730, 12784, 12799, 13312, 13312, 19893, 19893, 19968, 19968, 40907, 40907, 40960, 42124, 42192, 42237, 42240, 42508, 42512, 42527, 42538, 42539, 42560, 42606, 42623, 42647, 42656, 42735, 42775, 42783, 42786, 42888, 42891, 42894, 42896, 42897, 42912, 42921, 43002, 43009, 43011, 43013, 43015, 43018, 43020, 43042, 43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259, 43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442, 43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595, 43616, 43638, 43642, 43642, 43648, 43695, 43697, 43697, 43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714, 43739, 43741, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43968, 44002, 44032, 44032, 55203, 55203, 55216, 55238, 55243, 55291, 63744, 64045, 64048, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594, 65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786, 65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334, 66352, 66378, 66432, 66461, 66464, 66499, 66504, 66511, 66513, 66517, 66560, 66717, 67584, 67589, 67592, 67592, 67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669, 67840, 67861, 67872, 67897, 68096, 68096, 68112, 68115, 68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405, 68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687, 69763, 69807, 73728, 74606, 74752, 74850, 77824, 78894, 92160, 92728, 110592, 110593, 119808, 119892, 119894, 119964, 119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980, 119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069, 120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121, 120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144, 120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570, 120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686, 120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779, 131072, 131072, 173782, 173782, 173824, 173824, 177972, 177972, 177984, 177984, 178205, 178205, 194560, 195101];
               var identifierStartTable = [];
               for (var i = 0; i < 128; i++)  {
                     identifierStartTable[i] = i === 36 || i >= 65 && i <= 90 || i === 95 || i >= 97 && i <= 122;
                  }
               var identifierPartTable = [];
               for (var i = 0; i < 128; i++)  {
                     identifierPartTable[i] = identifierStartTable[i] || i >= 48 && i <= 57;
                  }
               function asyncTrigger()  {
                  var _checks = [];
                  return  {
                     push:function(fn)  {
                        _checks.push(fn);
                     }, 
                     check:function()  {
                        for (var check in _checks)  {
                              _checks[check]();
                           }
                        _checks.splice(0, _checks.length);
                     }} ;
               }
;
               function Lexer(source)  {
                  var lines = source;
                  if (typeof lines === "string")  {
                     lines = lines.replace(/\r\n/g, "
").replace(/\r/g, "
").split("
");
                  }
                  if (lines[0] && lines[0].substr(0, 2) === "#!")  {
                     lines[0] = "";
                  }
                  this.emitter = new events.EventEmitter();
                  this.source = source;
                  this.lines = lines;
                  this.prereg = true;
                  this.line = 0;
                  this.char = 1;
                  this.from = 1;
                  this.input = "";
                  for (var i = 0; i < state.option.indent; i = 1)  {
                        state.tab = " ";
                     }
               }
;
               Lexer.prototype =  {
                  _lines:[], 
                  lines:function()  {
                     this._lines = state.lines;
                     return this._lines;
                  }, 
                  lines:function(val)  {
                     this._lines = val;
                     state.lines = this._lines;
                  }, 
                  peek:function(i)  {
                     return this.input.charAt(i || 0);
                  }, 
                  skip:function(i)  {
                     i = i || 1;
                     this.char = i;
                     this.input = this.input.slice(i);
                  }, 
                  on:function(names, listener)  {
                     names.split(" ").forEach(function(name)  {
                           this.emitter.on(name, listener);
                        }
.bind(this));
                  }, 
                  trigger:function()  {
                     this.emitter.emit.apply(this.emitter, Array.prototype.slice.call(arguments));
                  }, 
                  triggerAsync:function(type, args, checks, fn)  {
                     checks.push(function()  {
                           if (fn())  {
                              this.trigger(type, args);
                           }
                        }
.bind(this));
                  }, 
                  scanPunctuator:function()  {
                     var ch1 = this.peek();
                     var ch2, ch3, ch4;
                     switch(ch1) {
                        case ".":
 
                              if (/^[0-9]$/.test(this.peek(1)))  {
                                 return null;
                              }
                              if (this.peek(1) === "." && this.peek(2) === ".")  {
                                 return  {
                                    type:Token.Punctuator, 
                                    value:"..."                                 }
;
                              }
                           
                        case "(":
 
                           
                        case ")":
 
                           
                        case ";":
 
                           
                        case ",":
 
                           
                        case "{":
 
                           
                        case "}":
 
                           
                        case "[":
 
                           
                        case "]":
 
                           
                        case ":":
 
                           
                        case "~":
 
                           
                        case "?":
 
                              return  {
                                 type:Token.Punctuator, 
                                 value:ch1                              }
;
                           
                        case "#":
 
                              return  {
                                 type:Token.Punctuator, 
                                 value:ch1                              }
;
                           
                        case "":
 
                              return null;
                           
}
;
                     ch2 = this.peek(1);
                     ch3 = this.peek(2);
                     ch4 = this.peek(3);
                     if (ch1 === ">" && ch2 === ">" && ch3 === ">" && ch4 === "=")  {
                        return  {
                           type:Token.Punctuator, 
                           value:">>>="                        }
;
                     }
                     if (ch1 === "=" && ch2 === "=" && ch3 === "=")  {
                        return  {
                           type:Token.Punctuator, 
                           value:"==="                        }
;
                     }
                     if (ch1 === "!" && ch2 === "=" && ch3 === "=")  {
                        return  {
                           type:Token.Punctuator, 
                           value:"!=="                        }
;
                     }
                     if (ch1 === ">" && ch2 === ">" && ch3 === ">")  {
                        return  {
                           type:Token.Punctuator, 
                           value:">>>"                        }
;
                     }
                     if (ch1 === "<" && ch2 === "<" && ch3 === "=")  {
                        return  {
                           type:Token.Punctuator, 
                           value:"<<="                        }
;
                     }
                     if (ch1 === ">" && ch2 === ">" && ch3 === "=")  {
                        return  {
                           type:Token.Punctuator, 
                           value:">>="                        }
;
                     }
                     if (ch1 === "=" && ch2 === ">")  {
                        return  {
                           type:Token.Punctuator, 
                           value:ch1 + ch2                        }
;
                     }
                     if (ch1 === ch2 && "+-<>&|".indexOf(ch1) >= 0)  {
                        return  {
                           type:Token.Punctuator, 
                           value:ch1 + ch2                        }
;
                     }
                     if ("<>=!+-*%&|^".indexOf(ch1) >= 0)  {
                        if (ch2 === "=")  {
                           return  {
                              type:Token.Punctuator, 
                              value:ch1 + ch2                           }
;
                        }
                        return  {
                           type:Token.Punctuator, 
                           value:ch1                        }
;
                     }
                     if (ch1 === "/")  {
                        if (ch2 === "=" && /\/=(?!(\S*\/[gim]?))/.test(this.input))  {
                           return  {
                              type:Token.Punctuator, 
                              value:"/="                           }
;
                        }
                        return  {
                           type:Token.Punctuator, 
                           value:"/"                        }
;
                     }
                     return null;
                  }, 
                  scanComments:function()  {
                     var ch1 = this.peek();
                     var ch2 = this.peek(1);
                     var rest = this.input.substr(2);
                     var startLine = this.line;
                     var startChar = this.char;
                     function commentToken(label, body, opt)  {
                        var special = ["jshint", "jslint", "members", "member", "globals", "global", "exported"];
                        var isSpecial = false;
                        var value = label + body;
                        var commentType = "plain";
                        opt = opt ||  {} ;
                        if (opt.isMultiline)  {
                           value = "*/";
                        }
                        special.forEach(function(str)  {
                              if (isSpecial)  {
                                 return ;
                              }
                              if (label === "//" && str !== "jshint")  {
                                 return ;
                              }
                              if (body.substr(0, str.length) === str)  {
                                 isSpecial = true;
                                 label = label + str;
                                 body = body.substr(str.length);
                              }
                              if (! isSpecial && body.charAt(0) === " " && body.substr(1, str.length) === str)  {
                                 isSpecial = true;
                                 label = label + " " + str;
                                 body = body.substr(str.length + 1);
                              }
                              if (! isSpecial)  {
                                 return ;
                              }
                              switch(str) {
                                 case "member":
 
                                       commentType = "members";
                                       break;
                                    
                                 case "global":
 
                                       commentType = "globals";
                                       break;
                                    
                                 default:
 
                                       commentType = str;
                                    
}
;
                           }
                        );
                        return  {
                           type:Token.Comment, 
                           commentType:commentType, 
                           value:value, 
                           body:body, 
                           isSpecial:isSpecial, 
                           isMultiline:opt.isMultiline || false, 
                           isMalformed:opt.isMalformed || false                        }
;
                     }
;
                     if (ch1 === "*" && ch2 === "/")  {
                        this.trigger("error",  {
                              code:"E018", 
                              line:startLine, 
                              character:startChar                           }
                        );
                        this.skip(2);
                        return null;
                     }
                     if (ch1 !== "/" || ch2 !== "*" && ch2 !== "/")  {
                        return null;
                     }
                     if (ch2 === "/")  {
                        this.skip(this.input.length);
                        return commentToken("//", rest);
                     }
                     var body = "";
                     if (ch2 === "*")  {
                        this.skip(2);
                        while (this.peek() !== "*" || this.peek(1) !== "/")  {
                              if (this.peek() === "")  {
                                 body = "
";
                                 if (! this.nextLine())  {
                                    this.trigger("error",  {
                                          code:"E017", 
                                          line:startLine, 
                                          character:startChar                                       }
                                    );
                                    return commentToken("/*", body,  {
                                          isMultiline:true, 
                                          isMalformed:true                                       }
                                    );
                                 }
                              }
                               else  {
                                 body = this.peek();
                                 this.skip();
                              }
                           }
                        this.skip(2);
                        return commentToken("/*", body,  {
                              isMultiline:true                           }
                        );
                     }
                  }, 
                  scanKeyword:function()  {
                     var result = /^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(this.input);
                     var keywords = ["if", "in", "do", "var", "for", "new", "try", "let", "this", "else", "case", "void", "with", "enum", "while", "break", "catch", "throw", "const", "yield", "class", "super", "return", "typeof", "delete", "switch", "export", "import", "default", "finally", "extends", "function", "continue", "debugger", "instanceof"];
                     if (result && keywords.indexOf(result[0]) >= 0)  {
                        return  {
                           type:Token.Keyword, 
                           value:result[0]                        }
;
                     }
                     return null;
                  }, 
                  scanIdentifier:function()  {
                     var id = "";
                     var index = 0;
                     var type, char;
                     function isUnicodeLetter(code)  {
                        for (var i = 0; i < unicodeLetterTable.length; )  {
                              if (code < unicodeLetterTable[i++])  {
                                 return false;
                              }
                              if (code <= unicodeLetterTable[i++])  {
                                 return true;
                              }
                           }
                        return false;
                     }
;
                     function isHexDigit(str)  {
                        return /^[0-9a-fA-F]$/.test(str);
                     }
;
                     var readUnicodeEscapeSequence = function()  {
                        index = 1;
                        if (this.peek(index) !== "u")  {
                           return null;
                        }
                        var ch1 = this.peek(index + 1);
                        var ch2 = this.peek(index + 2);
                        var ch3 = this.peek(index + 3);
                        var ch4 = this.peek(index + 4);
                        var code;
                        if (isHexDigit(ch1) && isHexDigit(ch2) && isHexDigit(ch3) && isHexDigit(ch4))  {
                           code = parseInt(ch1 + ch2 + ch3 + ch4, 16);
                           if (isUnicodeLetter(code))  {
                              index = 5;
                              return "\u" + ch1 + ch2 + ch3 + ch4;
                           }
                           return null;
                        }
                        return null;
                     }
.bind(this);
                     var getIdentifierStart = function()  {
                        var chr = this.peek(index);
                        var code = chr.charCodeAt(0);
                        if (code === 92)  {
                           return readUnicodeEscapeSequence();
                        }
                        if (code < 128)  {
                           if (identifierStartTable[code])  {
                              index = 1;
                              return chr;
                           }
                           return null;
                        }
                        if (isUnicodeLetter(code))  {
                           index = 1;
                           return chr;
                        }
                        return null;
                     }
.bind(this);
                     var getIdentifierPart = function()  {
                        var chr = this.peek(index);
                        var code = chr.charCodeAt(0);
                        if (code === 92)  {
                           return readUnicodeEscapeSequence();
                        }
                        if (code < 128)  {
                           if (identifierPartTable[code])  {
                              index = 1;
                              return chr;
                           }
                           return null;
                        }
                        if (isUnicodeLetter(code))  {
                           index = 1;
                           return chr;
                        }
                        return null;
                     }
.bind(this);
                     char = getIdentifierStart();
                     if (char === null)  {
                        return null;
                     }
                     id = char;
                     for (; ; )  {
                           char = getIdentifierPart();
                           if (char === null)  {
                              break;
                           }
                           id = char;
                        }
                     switch(id) {
                        case "true":
 
                           
                        case "false":
 
                              type = Token.BooleanLiteral;
                              break;
                           
                        case "null":
 
                              type = Token.NullLiteral;
                              break;
                           
                        default:
 
                              type = Token.Identifier;
                           
}
;
                     return  {
                        type:type, 
                        value:id                     }
;
                  }, 
                  scanNumericLiteral:function()  {
                     var index = 0;
                     var value = "";
                     var length = this.input.length;
                     var char = this.peek(index);
                     var bad;
                     function isDecimalDigit(str)  {
                        return /^[0-9]$/.test(str);
                     }
;
                     function isOctalDigit(str)  {
                        return /^[0-7]$/.test(str);
                     }
;
                     function isHexDigit(str)  {
                        return /^[0-9a-fA-F]$/.test(str);
                     }
;
                     function isIdentifierStart(ch)  {
                        return ch === "$" || ch === "_" || ch === "\" || ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z";
                     }
;
                     if (char !== "." && ! isDecimalDigit(char))  {
                        return null;
                     }
                     if (char !== ".")  {
                        value = this.peek(index);
                        index = 1;
                        char = this.peek(index);
                        if (value === "0")  {
                           if (char === "x" || char === "X")  {
                              index = 1;
                              value = char;
                              while (index < length)  {
                                    char = this.peek(index);
                                    if (! isHexDigit(char))  {
                                       break;
                                    }
                                    value = char;
                                    index = 1;
                                 }
                              if (value.length <= 2)  {
                                 return  {
                                    type:Token.NumericLiteral, 
                                    value:value, 
                                    isMalformed:true                                 }
;
                              }
                              if (index < length)  {
                                 char = this.peek(index);
                                 if (isIdentifierStart(char))  {
                                    return null;
                                 }
                              }
                              return  {
                                 type:Token.NumericLiteral, 
                                 value:value, 
                                 base:16, 
                                 isMalformed:false                              }
;
                           }
                           if (isOctalDigit(char))  {
                              index = 1;
                              value = char;
                              bad = false;
                              while (index < length)  {
                                    char = this.peek(index);
                                    if (isDecimalDigit(char))  {
                                       bad = true;
                                    }
                                     else if (! isOctalDigit(char))  {
                                       break;
                                    }
                                    value = char;
                                    index = 1;
                                 }
                              if (index < length)  {
                                 char = this.peek(index);
                                 if (isIdentifierStart(char))  {
                                    return null;
                                 }
                              }
                              return  {
                                 type:Token.NumericLiteral, 
                                 value:value, 
                                 base:8, 
                                 isMalformed:false                              }
;
                           }
                           if (isDecimalDigit(char))  {
                              index = 1;
                              value = char;
                           }
                        }
                        while (index < length)  {
                              char = this.peek(index);
                              if (! isDecimalDigit(char))  {
                                 break;
                              }
                              value = char;
                              index = 1;
                           }
                     }
                     if (char === ".")  {
                        value = char;
                        index = 1;
                        while (index < length)  {
                              char = this.peek(index);
                              if (! isDecimalDigit(char))  {
                                 break;
                              }
                              value = char;
                              index = 1;
                           }
                     }
                     if (char === "e" || char === "E")  {
                        value = char;
                        index = 1;
                        char = this.peek(index);
                        if (char === "+" || char === "-")  {
                           value = this.peek(index);
                           index = 1;
                        }
                        char = this.peek(index);
                        if (isDecimalDigit(char))  {
                           value = char;
                           index = 1;
                           while (index < length)  {
                                 char = this.peek(index);
                                 if (! isDecimalDigit(char))  {
                                    break;
                                 }
                                 value = char;
                                 index = 1;
                              }
                        }
                         else  {
                           return null;
                        }
                     }
                     if (index < length)  {
                        char = this.peek(index);
                        if (isIdentifierStart(char))  {
                           return null;
                        }
                     }
                     return  {
                        type:Token.NumericLiteral, 
                        value:value, 
                        base:10, 
                        isMalformed:! isFinite(value)                     }
;
                  }, 
                  scanStringLiteral:function(checks)  {
                     var quote = this.peek();
                     if (quote !== """ && quote !== "'")  {
                        return null;
                     }
                     this.triggerAsync("warning",  {
                           code:"W108", 
                           line:this.line, 
                           character:this.char                        }, 
                        checks, function()  {
                           return state.jsonMode && quote !== """;
                        }
                     );
                     var value = "";
                     var startLine = this.line;
                     var startChar = this.char;
                     var allowNewLine = false;
                     this.skip();
                     while (this.peek() !== quote)  {
                           while (this.peek() === "")  {
                                 if (! allowNewLine)  {
                                    this.trigger("warning",  {
                                          code:"W112", 
                                          line:this.line, 
                                          character:this.char                                       }
                                    );
                                 }
                                  else  {
                                    allowNewLine = false;
                                    this.triggerAsync("warning",  {
                                          code:"W043", 
                                          line:this.line, 
                                          character:this.char                                       }, 
                                       checks, function()  {
                                          return ! state.option.multistr;
                                       }
                                    );
                                    this.triggerAsync("warning",  {
                                          code:"W042", 
                                          line:this.line, 
                                          character:this.char                                       }, 
                                       checks, function()  {
                                          return state.jsonMode && state.option.multistr;
                                       }
                                    );
                                 }
                                 if (! this.nextLine())  {
                                    this.trigger("error",  {
                                          code:"E029", 
                                          line:startLine, 
                                          character:startChar                                       }
                                    );
                                    return  {
                                       type:Token.StringLiteral, 
                                       value:value, 
                                       isUnclosed:true, 
                                       quote:quote                                    }
;
                                 }
                              }
                           allowNewLine = false;
                           var char = this.peek();
                           var jump = 1;
                           if (char < " ")  {
                              this.trigger("warning",  {
                                    code:"W113", 
                                    line:this.line, 
                                    character:this.char, 
                                    data:["<non-printable>"]                                 }
                              );
                           }
                           if (char === "\")  {
                              this.skip();
                              char = this.peek();
                              switch(char) {
                                 case "'":
 
                                       this.triggerAsync("warning",  {
                                             code:"W114", 
                                             line:this.line, 
                                             character:this.char, 
                                             data:["\'"]                                          }, 
                                          checks, function()  {
                                             return state.jsonMode;
                                          }
                                       );
                                       break;
                                    
                                 case "b":
 
                                       char = "";
                                       break;
                                    
                                 case "f":
 
                                       char = "";
                                       break;
                                    
                                 case "n":
 
                                       char = "
";
                                       break;
                                    
                                 case "r":
 
                                       char = "";
                                       break;
                                    
                                 case "t":
 
                                       char = "	";
                                       break;
                                    
                                 case "0":
 
                                       char = "";
                                       var n = parseInt(this.peek(1), 10);
                                       this.triggerAsync("warning",  {
                                             code:"W115", 
                                             line:this.line, 
                                             character:this.char                                          }, 
                                          checks);
                                       function ✖()  {
                                          return n >= 0 && n <= 7 && state.directive["use strict"];
                                       }
;
                                       ;
                                       break;
                                    
                                 case "u":
 
                                       char = String.fromCharCode(parseInt(this.input.substr(1, 4), 16));
                                       jump = 5;
                                       break;
                                    
                                 case "v":
 
                                       this.triggerAsync("warning",  {
                                             code:"W114", 
                                             line:this.line, 
                                             character:this.char, 
                                             data:["\v"]                                          }, 
                                          checks, function()  {
                                             return state.jsonMode;
                                          }
                                       );
                                       char = "";
                                       break;
                                    
                                 case "x":
 
                                       var x = parseInt(this.input.substr(1, 2), 16);
                                       this.triggerAsync("warning",  {
                                             code:"W114", 
                                             line:this.line, 
                                             character:this.char, 
                                             data:["\x-"]                                          }, 
                                          checks, function()  {
                                             return state.jsonMode;
                                          }
                                       );
                                       char = String.fromCharCode(x);
                                       jump = 3;
                                       break;
                                    
                                 case "\":
 
                                    
                                 case """:
 
                                    
                                 case "/":
 
                                       break;
                                    
                                 case "":
 
                                       allowNewLine = true;
                                       char = "";
                                       break;
                                    
                                 case "!":
 
                                       if (value.slice(value.length - 2) === "<")  {
                                          break;
                                       }
                                    
                                 default:
 
                                       this.trigger("warning",  {
                                             code:"W044", 
                                             line:this.line, 
                                             character:this.char                                          }
                                       );
                                    
}
;
                           }
                           value = char;
                           this.skip(jump);
                        }
                     this.skip();
                     return  {
                        type:Token.StringLiteral, 
                        value:value, 
                        isUnclosed:false, 
                        quote:quote                     }
;
                  }, 
                  scanRegExp:function()  {
                     var index = 0;
                     var length = this.input.length;
                     var char = this.peek();
                     var value = char;
                     var body = "";
                     var flags = [];
                     var malformed = false;
                     var isCharSet = false;
                     var terminated;
                     var scanUnexpectedChars = function()  {
                        if (char < " ")  {
                           malformed = true;
                           this.trigger("warning",  {
                                 code:"W048", 
                                 line:this.line, 
                                 character:this.char                              }
                           );
                        }
                        if (char === "<")  {
                           malformed = true;
                           this.trigger("warning",  {
                                 code:"W049", 
                                 line:this.line, 
                                 character:this.char, 
                                 data:[char]                              }
                           );
                        }
                     }
.bind(this);
                     if (! this.prereg || char !== "/")  {
                        return null;
                     }
                     index = 1;
                     terminated = false;
                     while (index < length)  {
                           char = this.peek(index);
                           value = char;
                           body = char;
                           if (isCharSet)  {
                              if (char === "]")  {
                                 if (this.peek(index - 1) !== "\" || this.peek(index - 2) === "\")  {
                                    isCharSet = false;
                                 }
                              }
                              if (char === "\")  {
                                 index = 1;
                                 char = this.peek(index);
                                 body = char;
                                 value = char;
                                 scanUnexpectedChars();
                              }
                              index = 1;
                              continue;
                           }
                           if (char === "\")  {
                              index = 1;
                              char = this.peek(index);
                              body = char;
                              value = char;
                              scanUnexpectedChars();
                              if (char === "/")  {
                                 index = 1;
                                 continue;
                              }
                              if (char === "[")  {
                                 index = 1;
                                 continue;
                              }
                           }
                           if (char === "[")  {
                              isCharSet = true;
                              index = 1;
                              continue;
                           }
                           if (char === "/")  {
                              body = body.substr(0, body.length - 1);
                              terminated = true;
                              index = 1;
                              break;
                           }
                           index = 1;
                        }
                     if (! terminated)  {
                        this.trigger("error",  {
                              code:"E015", 
                              line:this.line, 
                              character:this.from                           }
                        );
                        return void this.trigger("fatal",  {
                              line:this.line, 
                              from:this.from                           }
                        );
                     }
                     while (index < length)  {
                           char = this.peek(index);
                           if (! /[gim]/.test(char))  {
                              break;
                           }
                           flags.push(char);
                           value = char;
                           index = 1;
                        }
                     try {
                        new RegExp(body, flags.join(""));
                     }
                     catch (err) {
                        malformed = true;
                        this.trigger("error",  {
                              code:"E016", 
                              line:this.line, 
                              character:this.char, 
                              data:[err.message]                           }
                        );
                     }
                     return  {
                        type:Token.RegExp, 
                        value:value, 
                        flags:flags, 
                        isMalformed:malformed                     }
;
                  }, 
                  scanMixedSpacesAndTabs:function()  {
                     var at, match;
                     if (state.option.smarttabs)  {
                        match = this.input.match(/(\/\/|^\s?\*)? \t/);
                        at = match && ! match[1] ? 0 : - 1;
                     }
                      else  {
                        at = this.input.search(/ \t|\t [^\*]/);
                     }
                     return at;
                  }, 
                  scanUnsafeChars:function()  {
                     return this.input.search(reg.unsafeChars);
                  }, 
                  next:function(checks)  {
                     this.from = this.char;
                     var start;
                     if (/\s/.test(this.peek()))  {
                        start = this.char;
                        while (/\s/.test(this.peek()))  {
                              this.from = 1;
                              this.skip();
                           }
                        if (this.peek() === "")  {
                           if (! /^\s*$/.test(this.lines[this.line - 1]) && state.option.trailing)  {
                              this.trigger("warning",  {
                                    code:"W102", 
                                    line:this.line, 
                                    character:start                                 }
                              );
                           }
                        }
                     }
                     var match = this.scanComments() || this.scanStringLiteral(checks);
                     if (match)  {
                        return match;
                     }
                     match = this.scanRegExp() || this.scanPunctuator() || this.scanKeyword() || this.scanIdentifier() || this.scanNumericLiteral();
                     if (match)  {
                        this.skip(match.value.length);
                        return match;
                     }
                     return null;
                  }, 
                  nextLine:function()  {
                     var char;
                     if (this.line >= this.lines.length)  {
                        return false;
                     }
                     this.input = this.lines[this.line];
                     this.line = 1;
                     this.char = 1;
                     this.from = 1;
                     char = this.scanMixedSpacesAndTabs();
                     if (char >= 0)  {
                        this.trigger("warning",  {
                              code:"W099", 
                              line:this.line, 
                              character:char + 1                           }
                        );
                     }
                     this.input = this.input.replace(/\t/g, state.tab);
                     char = this.scanUnsafeChars();
                     if (char >= 0)  {
                        this.trigger("warning",  {
                              code:"W100", 
                              line:this.line, 
                              character:char                           }
                        );
                     }
                     if (state.option.maxlen && state.option.maxlen < this.input.length)  {
                        this.trigger("warning",  {
                              code:"W101", 
                              line:this.line, 
                              character:this.input.length                           }
                        );
                     }
                     return true;
                  }, 
                  start:function()  {
                     this.nextLine();
                  }, 
                  token:function()  {
                     var checks = asyncTrigger();
                     var token;
                     function isReserved(token, isProperty)  {
                        if (! token.reserved)  {
                           return false;
                        }
                        if (token.meta && token.meta.isFutureReservedWord)  {
                           if (state.option.inES5(true) && ! token.meta.es5)  {
                              return false;
                           }
                           if (token.meta.strictOnly)  {
                              if (! state.option.strict && ! state.directive["use strict"])  {
                                 return false;
                              }
                           }
                           if (isProperty)  {
                              return false;
                           }
                        }
                        return true;
                     }
;
                     var create = function(type, value, isProperty)  {
                        var obj;
                        if (type !== "(endline)" && type !== "(end)")  {
                           this.prereg = false;
                        }
                        if (type === "(punctuator)")  {
                           switch(value) {
                              case ".":
 
                                 
                              case ")":
 
                                 
                              case "~":
 
                                 
                              case "#":
 
                                 
                              case "]":
 
                                    this.prereg = false;
                                    break;
                                 
                              default:
 
                                    this.prereg = true;
                                 
}
;
                           obj = Object.create(state.syntax[value] || state.syntax["(error)"]);
                        }
                        if (type === "(identifier)")  {
                           if (value === "return" || value === "case" || value === "typeof")  {
                              this.prereg = true;
                           }
                           if (_.has(state.syntax, value))  {
                              obj = Object.create(state.syntax[value] || state.syntax["(error)"]);
                              if (! isReserved(obj, isProperty && type === "(identifier)"))  {
                                 obj = null;
                              }
                           }
                        }
                        if (! obj)  {
                           obj = Object.create(state.syntax[type]);
                        }
                        obj.identifier = type === "(identifier)";
                        obj.type = obj.type || type;
                        obj.value = value;
                        obj.line = this.line;
                        obj.character = this.char;
                        obj.from = this.from;
                        if (isProperty && obj.identifier)  {
                           obj.isProperty = isProperty;
                        }
                        obj.check = checks.check;
                        return obj;
                     }
.bind(this);
                     for (; ; )  {
                           if (! this.input.length)  {
                              return create(this.nextLine() ? "(endline)" : "(end)", "");
                           }
                           token = this.next(checks);
                           if (! token)  {
                              if (this.input.length)  {
                                 this.trigger("error",  {
                                       code:"E024", 
                                       line:this.line, 
                                       character:this.char, 
                                       data:[this.peek()]                                    }
                                 );
                                 this.input = "";
                              }
                              continue;
                           }
                           switch(token.type) {
                              case Token.StringLiteral:
 
                                    this.triggerAsync("String",  {
                                          line:this.line, 
                                          char:this.char, 
                                          from:this.from, 
                                          value:token.value, 
                                          quote:token.quote                                       }, 
                                       checks, function()  {
                                          return true;
                                       }
                                    );
                                    return create("(string)", token.value);
                                 
                              case Token.Identifier:
 
                                    this.trigger("Identifier",  {
                                          line:this.line, 
                                          char:this.char, 
                                          from:this.form, 
                                          name:token.value, 
                                          isProperty:state.tokens.curr.id === "."                                       }
                                    );
                                 
                              case Token.Keyword:
 
                                 
                              case Token.NullLiteral:
 
                                 
                              case Token.BooleanLiteral:
 
                                    return create("(identifier)", token.value, state.tokens.curr.id === ".");
                                 
                              case Token.NumericLiteral:
 
                                    if (token.isMalformed)  {
                                       this.trigger("warning",  {
                                             code:"W045", 
                                             line:this.line, 
                                             character:this.char, 
                                             data:[token.value]                                          }
                                       );
                                    }
                                    this.triggerAsync("warning",  {
                                          code:"W114", 
                                          line:this.line, 
                                          character:this.char, 
                                          data:["0x-"]                                       }, 
                                       checks, function()  {
                                          return token.base === 16 && state.jsonMode;
                                       }
                                    );
                                    this.triggerAsync("warning",  {
                                          code:"W115", 
                                          line:this.line, 
                                          character:this.char                                       }, 
                                       checks, function()  {
                                          return state.directive["use strict"] && token.base === 8;
                                       }
                                    );
                                    this.trigger("Number",  {
                                          line:this.line, 
                                          char:this.char, 
                                          from:this.from, 
                                          value:token.value, 
                                          base:token.base, 
                                          isMalformed:token.malformed                                       }
                                    );
                                    return create("(number)", token.value);
                                 
                              case Token.RegExp:
 
                                    return create("(regexp)", token.value);
                                 
                              case Token.Comment:
 
                                    state.tokens.curr.comment = true;
                                    if (token.isSpecial)  {
                                       return  {
                                          value:token.value, 
                                          body:token.body, 
                                          type:token.commentType, 
                                          isSpecial:token.isSpecial, 
                                          line:this.line, 
                                          character:this.char, 
                                          from:this.from                                       }
;
                                    }
                                    break;
                                 
                              case "":
 
                                    break;
                                 
                              default:
 
                                    return create("(punctuator)", token.value);
                                 
}
;
                        }
                  }} ;
               exports.Lexer = Lexer;
            }
();
         }
,  {
            events:2, 
            ./reg.js:4, 
            ./state.js:5, 
            underscore:10         }
], 
         :[function(require, module, exports)  {
            function()  {
               var util = require("util");
               var Buffer = require("buffer").Buffer;
               var pSlice = Array.prototype.slice;
               function objectKeys(object)  {
                  if (Object.keys) return Object.keys(object)                  var result = [];
                  for (var name in object)  {
                        if (Object.prototype.hasOwnProperty.call(object, name))  {
                           result.push(name);
                        }
                     }
                  return result;
               }
;
               var assert = module.exports = ok;
               assert.AssertionError = function(options)  {
                  this.name = "AssertionError";
                  this.message = options.message;
                  this.actual = options.actual;
                  this.expected = options.expected;
                  this.operator = options.operator;
                  var stackStartFunction = options.stackStartFunction || fail;
                  if (Error.captureStackTrace)  {
                     Error.captureStackTrace(this, stackStartFunction);
                  }
               }
;
               util.inherits(assert.AssertionError, Error);
               function replacer(key, value)  {
                  if (value === undefined)  {
                     return "" + value;
                  }
                  if (typeof value === "number" && isNaN(value) || ! isFinite(value))  {
                     return value.toString();
                  }
                  if (typeof value === "function" || value instanceof RegExp)  {
                     return value.toString();
                  }
                  return value;
               }
;
               function truncate(s, n)  {
                  if (typeof s == "string")  {
                     return s.length < n ? s : s.slice(0, n);
                  }
                   else  {
                     return s;
                  }
               }
;
               assert.AssertionError.prototype.toString = function()  {
                  if (this.message)  {
                     return [this.name + ":", this.message].join(" ");
                  }
                   else  {
                     return [this.name + ":", truncate(JSON.stringify(this.actual, replacer), 128), this.operator, truncate(JSON.stringify(this.expected, replacer), 128)].join(" ");
                  }
               }
;
               assert.AssertionError.__proto__ = Error.prototype;
               function fail(actual, expected, message, operator, stackStartFunction)  {
                  throw new assert.AssertionError( {
                        message:message, 
                        actual:actual, 
                        expected:expected, 
                        operator:operator, 
                        stackStartFunction:stackStartFunction                     }
                  );
               }
;
               assert.fail = fail;
               function ok(value, message)  {
                  if (! ! ! value) fail(value, true, message, "==", assert.ok)               }
;
               assert.ok = ok;
               assert.equal = function(actual, expected, message)  {
                  if (actual != expected) fail(actual, expected, message, "==", assert.equal)               }
;
               assert.notEqual = function(actual, expected, message)  {
                  if (actual == expected)  {
                     fail(actual, expected, message, "!=", assert.notEqual);
                  }
               }
;
               assert.deepEqual = function(actual, expected, message)  {
                  if (! _deepEqual(actual, expected))  {
                     fail(actual, expected, message, "deepEqual", assert.deepEqual);
                  }
               }
;
               function _deepEqual(actual, expected)  {
                  if (actual === expected)  {
                     return true;
                  }
                   else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected))  {
                     if (actual.length != expected.length) return false                     for (var i = 0; i < actual.length; i++)  {
                           if (actual[i] !== expected[i]) return false                        }
                     return true;
                  }
                   else if (actual instanceof Date && expected instanceof Date)  {
                     return actual.getTime() === expected.getTime();
                  }
                   else if (typeof actual != "object" && typeof expected != "object")  {
                     return actual == expected;
                  }
                   else  {
                     return objEquiv(actual, expected);
                  }
               }
;
               function isUndefinedOrNull(value)  {
                  return value === null || value === undefined;
               }
;
               function isArguments(object)  {
                  return Object.prototype.toString.call(object) == "[object Arguments]";
               }
;
               function objEquiv(a, b)  {
                  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false                  if (a.prototype !== b.prototype) return false                  if (isArguments(a))  {
                     if (! isArguments(b))  {
                        return false;
                     }
                     a = pSlice.call(a);
                     b = pSlice.call(b);
                     return _deepEqual(a, b);
                  }
                  try {
                     var ka = objectKeys(a), kb = objectKeys(b), key, i;
                  }
                  catch (e) {
                     return false;
                  }
                  if (ka.length != kb.length) return false                  ka.sort();
                  kb.sort();
                  for (i = ka.length - 1; i >= 0; i--)  {
                        if (ka[i] != kb[i]) return false                     }
                  for (i = ka.length - 1; i >= 0; i--)  {
                        key = ka[i];
                        if (! _deepEqual(a[key], b[key])) return false                     }
                  return true;
               }
;
               assert.notDeepEqual = function(actual, expected, message)  {
                  if (_deepEqual(actual, expected))  {
                     fail(actual, expected, message, "notDeepEqual", assert.notDeepEqual);
                  }
               }
;
               assert.strictEqual = function(actual, expected, message)  {
                  if (actual !== expected)  {
                     fail(actual, expected, message, "===", assert.strictEqual);
                  }
               }
;
               assert.notStrictEqual = function(actual, expected, message)  {
                  if (actual === expected)  {
                     fail(actual, expected, message, "!==", assert.notStrictEqual);
                  }
               }
;
               function expectedException(actual, expected)  {
                  if (! actual || ! expected)  {
                     return false;
                  }
                  if (expected instanceof RegExp)  {
                     return expected.test(actual);
                  }
                   else if (actual instanceof expected)  {
                     return true;
                  }
                   else if (expected.call( {} , actual) === true)  {
                     return true;
                  }
                  return false;
               }
;
               function _throws(shouldThrow, block, expected, message)  {
                  var actual;
                  if (typeof expected === "string")  {
                     message = expected;
                     expected = null;
                  }
                  try {
                     block();
                  }
                  catch (e) {
                     actual = e;
                  }
                  message = expected && expected.name ? " (" + expected.name + ")." : "." + message ? " " + message : ".";
                  if (shouldThrow && ! actual)  {
                     fail("Missing expected exception" + message);
                  }
                  if (! shouldThrow && expectedException(actual, expected))  {
                     fail("Got unwanted exception" + message);
                  }
                  if (shouldThrow && actual && expected && ! expectedException(actual, expected) || ! shouldThrow && actual)  {
                     throw actual;
                  }
               }
;
               assert.throws = function(block, error, message)  {
                  _throws.apply(this, [true].concat(pSlice.call(arguments)));
               }
;
               assert.doesNotThrow = function(block, error, message)  {
                  _throws.apply(this, [false].concat(pSlice.call(arguments)));
               }
;
               assert.ifError = function(err)  {
                  if (err)  {
                     throw err;
                  }
               }
;
            }
();
         }
,  {
            util:11, 
            buffer:13         }
], 
         :[function(require, module, exports)  {
            var events = require("events");
            exports.isArray = isArray;
            exports.isDate = function(obj)  {
               return Object.prototype.toString.call(obj) === "[object Date]";
            }
;
            exports.isRegExp = function(obj)  {
               return Object.prototype.toString.call(obj) === "[object RegExp]";
            }
;
            exports.print = function()  {
            }
;
            exports.puts = function()  {
            }
;
            exports.debug = function()  {
            }
;
            exports.inspect = function(obj, showHidden, depth, colors)  {
               var seen = [];
               var stylize = function(str, styleType)  {
                  var styles =  {
                     bold:[1, 22], 
                     italic:[3, 23], 
                     underline:[4, 24], 
                     inverse:[7, 27], 
                     white:[37, 39], 
                     grey:[90, 39], 
                     black:[30, 39], 
                     blue:[34, 39], 
                     cyan:[36, 39], 
                     green:[32, 39], 
                     magenta:[35, 39], 
                     red:[31, 39], 
                     yellow:[33, 39]                  }
;
                  var style =  {
                     special:"cyan", 
                     number:"blue", 
                     boolean:"yellow", 
                     undefined:"grey", 
                     null:"bold", 
                     string:"green", 
                     date:"magenta", 
                     regexp:"red"                  }
[styleType];
                  if (style)  {
                     return "[" + styles[style][0] + "m" + str + "[" + styles[style][1] + "m";
                  }
                   else  {
                     return str;
                  }
               }
;
               if (! colors)  {
                  stylize = function(str, styleType)  {
                     return str;
                  }
;
               }
               function format(value, recurseTimes)  {
                  if (value && typeof value.inspect === "function" && value !== exports && ! value.constructor && value.constructor.prototype === value)  {
                     return value.inspect(recurseTimes);
                  }
                  switch(typeof value) {
                     case "undefined":
 
                           return stylize("undefined", "undefined");
                        
                     case "string":
 
                           var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\'").replace(/\\"/g, """) + "'";
                           return stylize(simple, "string");
                        
                     case "number":
 
                           return stylize("" + value, "number");
                        
                     case "boolean":
 
                           return stylize("" + value, "boolean");
                        
}
;
                  if (value === null)  {
                     return stylize("null", "null");
                  }
                  var visible_keys = Object_keys(value);
                  var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;
                  if (typeof value === "function" && keys.length === 0)  {
                     if (isRegExp(value))  {
                        return stylize("" + value, "regexp");
                     }
                      else  {
                        var name = value.name ? ": " + value.name : "";
                        return stylize("[Function" + name + "]", "special");
                     }
                  }
                  if (isDate(value) && keys.length === 0)  {
                     return stylize(value.toUTCString(), "date");
                  }
                  var base, type, braces;
                  if (isArray(value))  {
                     type = "Array";
                     braces = ["[", "]"];
                  }
                   else  {
                     type = "Object";
                     braces = ["{", "}"];
                  }
                  if (typeof value === "function")  {
                     var n = value.name ? ": " + value.name : "";
                     base = isRegExp(value) ? " " + value : " [Function" + n + "]";
                  }
                   else  {
                     base = "";
                  }
                  if (isDate(value))  {
                     base = " " + value.toUTCString();
                  }
                  if (keys.length === 0)  {
                     return braces[0] + base + braces[1];
                  }
                  if (recurseTimes < 0)  {
                     if (isRegExp(value))  {
                        return stylize("" + value, "regexp");
                     }
                      else  {
                        return stylize("[Object]", "special");
                     }
                  }
                  seen.push(value);
                  var output = keys.map(function(key)  {
                        var name, str;
                        if (value.__lookupGetter__)  {
                           if (value.__lookupGetter__(key))  {
                              if (value.__lookupSetter__(key))  {
                                 str = stylize("[Getter/Setter]", "special");
                              }
                               else  {
                                 str = stylize("[Getter]", "special");
                              }
                           }
                            else  {
                              if (value.__lookupSetter__(key))  {
                                 str = stylize("[Setter]", "special");
                              }
                           }
                        }
                        if (visible_keys.indexOf(key) < 0)  {
                           name = "[" + key + "]";
                        }
                        if (! str)  {
                           if (seen.indexOf(value[key]) < 0)  {
                              if (recurseTimes === null)  {
                                 str = format(value[key]);
                              }
                               else  {
                                 str = format(value[key], recurseTimes - 1);
                              }
                              if (str.indexOf("
") > - 1)  {
                                 if (isArray(value))  {
                                    str = str.split("
").map(function(line)  {
                                          return "  " + line;
                                       }
                                    ).join("
").substr(2);
                                 }
                                  else  {
                                    str = "
" + str.split("
").map(function(line)  {
                                          return "   " + line;
                                       }
                                    ).join("
");
                                 }
                              }
                           }
                            else  {
                              str = stylize("[Circular]", "special");
                           }
                        }
                        if (typeof name === "undefined")  {
                           if (type === "Array" && key.match(/^\d+$/))  {
                              return str;
                           }
                           name = JSON.stringify("" + key);
                           if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/))  {
                              name = name.substr(1, name.length - 2);
                              name = stylize(name, "name");
                           }
                            else  {
                              name = name.replace(/'/g, "\'").replace(/\\"/g, """).replace(/(^"|"$)/g, "'");
                              name = stylize(name, "string");
                           }
                        }
                        return name + ": " + str;
                     }
                  );
                  seen.pop();
                  var numLinesEst = 0;
                  var length = output.reduce(function(prev, cur)  {
                        numLinesEst++;
                        if (cur.indexOf("
") >= 0) numLinesEst++                        return prev + cur.length + 1;
                     }, 
                     0);
                  if (length > 50)  {
                     output = braces[0] + base === "" ? "" : base + "
 " + " " + output.join(",
  ") + " " + braces[1];
                  }
                   else  {
                     output = braces[0] + base + " " + output.join(", ") + " " + braces[1];
                  }
                  return output;
               }
;
               return format(obj, typeof depth === "undefined" ? 2 : depth);
            }
;
            function isArray(ar)  {
               return ar instanceof Array || Array.isArray(ar) || ar && ar !== Object.prototype && isArray(ar.__proto__);
            }
;
            function isRegExp(re)  {
               return re instanceof RegExp || typeof re === "object" && Object.prototype.toString.call(re) === "[object RegExp]";
            }
;
            function isDate(d)  {
               if (d instanceof Date) return true               if (typeof d !== "object") return false               var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
               var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
               return JSON.stringify(proto) === JSON.stringify(properties);
            }
;
            function pad(n)  {
               return n < 10 ? "0" + n.toString(10) : n.toString(10);
            }
;
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            function timestamp()  {
               var d = new Date();
               var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
               return [d.getDate(), months[d.getMonth()], time].join(" ");
            }
;
            exports.log = function(msg)  {
            }
;
            exports.pump = null;
            var Object_keys = Object.keys || function(obj)  {
               var res = [];
               for (var key in obj) res.push(key)               return res;
            }
;
            var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function(obj)  {
               var res = [];
               for (var key in obj)  {
                     if (Object.hasOwnProperty.call(obj, key)) res.push(key)                  }
               return res;
            }
;
            var Object_create = Object.create || function(prototype, properties)  {
               var object;
               if (prototype === null)  {
                  object =  {
                     __proto__:null                  }
;
               }
                else  {
                  if (typeof prototype !== "object")  {
                     throw new TypeError("typeof prototype[" + typeof prototype + "] != 'object'");
                  }
                  var Type = function()  {
                  }
;
                  Type.prototype = prototype;
                  object = new Type();
                  object.__proto__ = prototype;
               }
               if (typeof properties !== "undefined" && Object.defineProperties)  {
                  Object.defineProperties(object, properties);
               }
               return object;
            }
;
            exports.inherits = function(ctor, superCtor)  {
               ctor.super_ = superCtor;
               ctor.prototype = Object_create(superCtor.prototype,  {
                     constructor: {
                        value:ctor, 
                        enumerable:false, 
                        writable:true, 
                        configurable:true                     }} );
            }
;
            var formatRegExp = /%[sdj%]/g;
            exports.format = function(f)  {
               if (typeof f !== "string")  {
                  var objects = [];
                  for (var i = 0; i < arguments.length; i++)  {
                        objects.push(exports.inspect(arguments[i]));
                     }
                  return objects.join(" ");
               }
               var i = 1;
               var args = arguments;
               var len = args.length;
               var str = String(f).replace(formatRegExp, function(x)  {
                     if (x === "%") return "%"                     if (i >= len) return x                     switch(x) {
                        case "%s":
 
                              return String(args[i++]);
                           
                        case "%d":
 
                              return Number(args[i++]);
                           
                        case "%j":
 
                              return JSON.stringify(args[i++]);
                           
                        default:
 
                              return x;
                           
}
;
                  }
               );
               for (var x = args[i]; i < len; x = args[++i])  {
                     if (x === null || typeof x !== "object")  {
                        str = " " + x;
                     }
                      else  {
                        str = " " + exports.inspect(x);
                     }
                  }
               return str;
            }
;
         }
,  {
            events:2         }
], 
         :[function(require, module, exports)  {
            function()  {
               function()  {
                  var root = this;
                  var previousUnderscore = root._;
                  var breaker =  {} ;
                  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
                  var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
                  var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
                  var _ = function(obj)  {
                     if (obj instanceof _) return obj                     if (! this instanceof _) return new _(obj)                     this._wrapped = obj;
                  }
;
                  if (typeof exports !== "undefined")  {
                     if (typeof module !== "undefined" && module.exports)  {
                        exports = module.exports = _;
                     }
                     exports._ = _;
                  }
                   else  {
                     root._ = _;
                  }
                  _.VERSION = "1.4.4";
                  var each = _.each = _.forEach = function(obj, iterator, context)  {
                     if (obj == null) return                      if (nativeForEach && obj.forEach === nativeForEach)  {
                        obj.forEach(iterator, context);
                     }
                      else if (obj.length === + obj.length)  {
                        for (var i = 0, l = obj.length; i < l; i++)  {
                              if (iterator.call(context, obj[i], i, obj) === breaker) return                            }
                     }
                      else  {
                        for (var key in obj)  {
                              if (_.has(obj, key))  {
                                 if (iterator.call(context, obj[key], key, obj) === breaker) return                               }
                           }
                     }
                  }
;
                  _.map = _.collect = function(obj, iterator, context)  {
                     var results = [];
                     if (obj == null) return results                     if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context)                     each(obj, function(value, index, list)  {
                           results[results.length] = iterator.call(context, value, index, list);
                        }
                     );
                     return results;
                  }
;
                  var reduceError = "Reduce of empty array with no initial value";
                  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context)  {
                     var initial = arguments.length > 2;
                     if (obj == null) obj = []                     if (nativeReduce && obj.reduce === nativeReduce)  {
                        if (context) iterator = _.bind(iterator, context)                        return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
                     }
                     each(obj, function(value, index, list)  {
                           if (! initial)  {
                              memo = value;
                              initial = true;
                           }
                            else  {
                              memo = iterator.call(context, memo, value, index, list);
                           }
                        }
                     );
                     if (! initial) throw new TypeError(reduceError)                     return memo;
                  }
;
                  _.reduceRight = _.foldr = function(obj, iterator, memo, context)  {
                     var initial = arguments.length > 2;
                     if (obj == null) obj = []                     if (nativeReduceRight && obj.reduceRight === nativeReduceRight)  {
                        if (context) iterator = _.bind(iterator, context)                        return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
                     }
                     var length = obj.length;
                     if (length !== + length)  {
                        var keys = _.keys(obj);
                        length = keys.length;
                     }
                     each(obj, function(value, index, list)  {
                           index = keys ? keys[--length] : --length;
                           if (! initial)  {
                              memo = obj[index];
                              initial = true;
                           }
                            else  {
                              memo = iterator.call(context, memo, obj[index], index, list);
                           }
                        }
                     );
                     if (! initial) throw new TypeError(reduceError)                     return memo;
                  }
;
                  _.find = _.detect = function(obj, iterator, context)  {
                     var result;
                     any(obj, function(value, index, list)  {
                           if (iterator.call(context, value, index, list))  {
                              result = value;
                              return true;
                           }
                        }
                     );
                     return result;
                  }
;
                  _.filter = _.select = function(obj, iterator, context)  {
                     var results = [];
                     if (obj == null) return results                     if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context)                     each(obj, function(value, index, list)  {
                           if (iterator.call(context, value, index, list)) results[results.length] = value                        }
                     );
                     return results;
                  }
;
                  _.reject = function(obj, iterator, context)  {
                     return _.filter(obj, function(value, index, list)  {
                           return ! iterator.call(context, value, index, list);
                        }, 
                        context);
                  }
;
                  _.every = _.all = function(obj, iterator, context)  {
                     iterator || iterator = _.identity;
                     var result = true;
                     if (obj == null) return result                     if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context)                     each(obj, function(value, index, list)  {
                           if (! result = result && iterator.call(context, value, index, list)) return breaker                        }
                     );
                     return ! ! result;
                  }
;
                  var any = _.some = _.any = function(obj, iterator, context)  {
                     iterator || iterator = _.identity;
                     var result = false;
                     if (obj == null) return result                     if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context)                     each(obj, function(value, index, list)  {
                           if (result || result = iterator.call(context, value, index, list)) return breaker                        }
                     );
                     return ! ! result;
                  }
;
                  _.contains = _.include = function(obj, target)  {
                     if (obj == null) return false                     if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != - 1                     return any(obj, function(value)  {
                           return value === target;
                        }
                     );
                  }
;
                  _.invoke = function(obj, method)  {
                     var args = slice.call(arguments, 2);
                     var isFunc = _.isFunction(method);
                     return _.map(obj, function(value)  {
                           return isFunc ? method : value[method].apply(value, args);
                        }
                     );
                  }
;
                  _.pluck = function(obj, key)  {
                     return _.map(obj, function(value)  {
                           return value[key];
                        }
                     );
                  }
;
                  _.where = function(obj, attrs, first)  {
                     if (_.isEmpty(attrs)) return first ? null : []                     return _[first ? "find" : "filter"](obj, function(value)  {
                           for (var key in attrs)  {
                                 if (attrs[key] !== value[key]) return false                              }
                           return true;
                        }
                     );
                  }
;
                  _.findWhere = function(obj, attrs)  {
                     return _.where(obj, attrs, true);
                  }
;
                  _.max = function(obj, iterator, context)  {
                     if (! iterator && _.isArray(obj) && obj[0] === + obj[0] && obj.length < 65535)  {
                        return Math.max.apply(Math, obj);
                     }
                     if (! iterator && _.isEmpty(obj)) return - Infinity                     var result =  {
                        computed:- Infinity, 
                        value:- Infinity                     }
;
                     each(obj, function(value, index, list)  {
                           var computed = iterator ? iterator.call(context, value, index, list) : value;
                           computed >= result.computed && result =  {
                              value:value, 
                              computed:computed                           }
;
                        }
                     );
                     return result.value;
                  }
;
                  _.min = function(obj, iterator, context)  {
                     if (! iterator && _.isArray(obj) && obj[0] === + obj[0] && obj.length < 65535)  {
                        return Math.min.apply(Math, obj);
                     }
                     if (! iterator && _.isEmpty(obj)) return Infinity                     var result =  {
                        computed:Infinity, 
                        value:Infinity                     }
;
                     each(obj, function(value, index, list)  {
                           var computed = iterator ? iterator.call(context, value, index, list) : value;
                           computed < result.computed && result =  {
                              value:value, 
                              computed:computed                           }
;
                        }
                     );
                     return result.value;
                  }
;
                  _.shuffle = function(obj)  {
                     var rand;
                     var index = 0;
                     var shuffled = [];
                     each(obj, function(value)  {
                           rand = _.random(index++);
                           shuffled[index - 1] = shuffled[rand];
                           shuffled[rand] = value;
                        }
                     );
                     return shuffled;
                  }
;
                  var lookupIterator = function(value)  {
                     return _.isFunction(value) ? value : function(obj)  {
                        return obj[value];
                     }
;
                  }
;
                  _.sortBy = function(obj, value, context)  {
                     var iterator = lookupIterator(value);
                     return _.pluck(_.map(obj, function(value, index, list)  {
                              return  {
                                 value:value, 
                                 index:index, 
                                 criteria:iterator.call(context, value, index, list)                              }
;
                           }
                        ).sort(function(left, right)  {
                              var a = left.criteria;
                              var b = right.criteria;
                              if (a !== b)  {
                                 if (a > b || a === void 0) return 1                                 if (a < b || b === void 0) return - 1                              }
                              return left.index < right.index ? - 1 : 1;
                           }
                        ), "value");
                  }
;
                  var group = function(obj, value, context, behavior)  {
                     var result =  {} ;
                     var iterator = lookupIterator(value || _.identity);
                     each(obj, function(value, index)  {
                           var key = iterator.call(context, value, index, obj);
                           behavior(result, key, value);
                        }
                     );
                     return result;
                  }
;
                  _.groupBy = function(obj, value, context)  {
                     return group(obj, value, context, function(result, key, value)  {
                           _.has(result, key) ? result[key] : result[key] = [].push(value);
                        }
                     );
                  }
;
                  _.countBy = function(obj, value, context)  {
                     return group(obj, value, context, function(result, key)  {
                           if (! _.has(result, key)) result[key] = 0                           result[key]++;
                        }
                     );
                  }
;
                  _.sortedIndex = function(array, obj, iterator, context)  {
                     iterator = iterator == null ? _.identity : lookupIterator(iterator);
                     var value = iterator.call(context, obj);
                     var low = 0, high = array.length;
                     while (low < high)  {
                           var mid = low + high >>> 1;
                           iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
                        }
                     return low;
                  }
;
                  _.toArray = function(obj)  {
                     if (! obj) return []                     if (_.isArray(obj)) return slice.call(obj)                     if (obj.length === + obj.length) return _.map(obj, _.identity)                     return _.values(obj);
                  }
;
                  _.size = function(obj)  {
                     if (obj == null) return 0                     return obj.length === + obj.length ? obj.length : _.keys(obj).length;
                  }
;
                  _.first = _.head = _.take = function(array, n, guard)  {
                     if (array == null) return void 0                     return n != null && ! guard ? slice.call(array, 0, n) : array[0];
                  }
;
                  _.initial = function(array, n, guard)  {
                     return slice.call(array, 0, array.length - n == null || guard ? 1 : n);
                  }
;
                  _.last = function(array, n, guard)  {
                     if (array == null) return void 0                     if (n != null && ! guard)  {
                        return slice.call(array, Math.max(array.length - n, 0));
                     }
                      else  {
                        return array[array.length - 1];
                     }
                  }
;
                  _.rest = _.tail = _.drop = function(array, n, guard)  {
                     return slice.call(array, n == null || guard ? 1 : n);
                  }
;
                  _.compact = function(array)  {
                     return _.filter(array, _.identity);
                  }
;
                  var flatten = function(input, shallow, output)  {
                     each(input, function(value)  {
                           if (_.isArray(value))  {
                              shallow ? push.apply(output, value) : flatten(value, shallow, output);
                           }
                            else  {
                              output.push(value);
                           }
                        }
                     );
                     return output;
                  }
;
                  _.flatten = function(array, shallow)  {
                     return flatten(array, shallow, []);
                  }
;
                  _.without = function(array)  {
                     return _.difference(array, slice.call(arguments, 1));
                  }
;
                  _.uniq = _.unique = function(array, isSorted, iterator, context)  {
                     if (_.isFunction(isSorted))  {
                        context = iterator;
                        iterator = isSorted;
                        isSorted = false;
                     }
                     var initial = iterator ? _.map(array, iterator, context) : array;
                     var results = [];
                     var seen = [];
                     each(initial, function(value, index)  {
                           if (isSorted ? ! index || seen[seen.length - 1] !== value : ! _.contains(seen, value))  {
                              seen.push(value);
                              results.push(array[index]);
                           }
                        }
                     );
                     return results;
                  }
;
                  _.union = function()  {
                     return _.uniq(concat.apply(ArrayProto, arguments));
                  }
;
                  _.intersection = function(array)  {
                     var rest = slice.call(arguments, 1);
                     return _.filter(_.uniq(array), function(item)  {
                           return _.every(rest, function(other)  {
                                 return _.indexOf(other, item) >= 0;
                              }
                           );
                        }
                     );
                  }
;
                  _.difference = function(array)  {
                     var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
                     return _.filter(array, function(value)  {
                           return ! _.contains(rest, value);
                        }
                     );
                  }
;
                  _.zip = function()  {
                     var args = slice.call(arguments);
                     var length = _.max(_.pluck(args, "length"));
                     var results = new Array(length);
                     for (var i = 0; i < length; i++)  {
                           results[i] = _.pluck(args, "" + i);
                        }
                     return results;
                  }
;
                  _.object = function(list, values)  {
                     if (list == null) return  {}                      var result =  {} ;
                     for (var i = 0, l = list.length; i < l; i++)  {
                           if (values)  {
                              result[list[i]] = values[i];
                           }
                            else  {
                              result[list[i][0]] = list[i][1];
                           }
                        }
                     return result;
                  }
;
                  _.indexOf = function(array, item, isSorted)  {
                     if (array == null) return - 1                     var i = 0, l = array.length;
                     if (isSorted)  {
                        if (typeof isSorted == "number")  {
                           i = isSorted < 0 ? Math.max(0, l + isSorted) : isSorted;
                        }
                         else  {
                           i = _.sortedIndex(array, item);
                           return array[i] === item ? i : - 1;
                        }
                     }
                     if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted)                     for (; i < l; i++) if (array[i] === item) return i                     return - 1;
                  }
;
                  _.lastIndexOf = function(array, item, from)  {
                     if (array == null) return - 1                     var hasIndex = from != null;
                     if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf)  {
                        return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
                     }
                     var i = hasIndex ? from : array.length;
                     while (i--) if (array[i] === item) return i                     return - 1;
                  }
;
                  _.range = function(start, stop, step)  {
                     if (arguments.length <= 1)  {
                        stop = start || 0;
                        start = 0;
                     }
                     step = arguments[2] || 1;
                     var len = Math.max(Math.ceil(stop - start / step), 0);
                     var idx = 0;
                     var range = new Array(len);
                     while (idx < len)  {
                           range[idx++] = start;
                           start = step;
                        }
                     return range;
                  }
;
                  _.bind = function(func, context)  {
                     if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1))                     var args = slice.call(arguments, 2);
                     return function()  {
                        return func.apply(context, args.concat(slice.call(arguments)));
                     }
;
                  }
;
                  _.partial = function(func)  {
                     var args = slice.call(arguments, 1);
                     return function()  {
                        return func.apply(this, args.concat(slice.call(arguments)));
                     }
;
                  }
;
                  _.bindAll = function(obj)  {
                     var funcs = slice.call(arguments, 1);
                     if (funcs.length === 0) funcs = _.functions(obj)                     each(funcs, function(f)  {
                           obj[f] = _.bind(obj[f], obj);
                        }
                     );
                     return obj;
                  }
;
                  _.memoize = function(func, hasher)  {
                     var memo =  {} ;
                     hasher || hasher = _.identity;
                     return function()  {
                        var key = hasher.apply(this, arguments);
                        return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
                     }
;
                  }
;
                  _.delay = function(func, wait)  {
                     var args = slice.call(arguments, 2);
                     return setTimeout(function()  {
                           return func.apply(null, args);
                        }, 
                        wait);
                  }
;
                  _.defer = function(func)  {
                     return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
                  }
;
                  _.throttle = function(func, wait)  {
                     var context, args, timeout, result;
                     var previous = 0;
                     var later = function()  {
                        previous = new Date();
                        timeout = null;
                        result = func.apply(context, args);
                     }
;
                     return function()  {
                        var now = new Date();
                        var remaining = wait - now - previous;
                        context = this;
                        args = arguments;
                        if (remaining <= 0)  {
                           clearTimeout(timeout);
                           timeout = null;
                           previous = now;
                           result = func.apply(context, args);
                        }
                         else if (! timeout)  {
                           timeout = setTimeout(later, remaining);
                        }
                        return result;
                     }
;
                  }
;
                  _.debounce = function(func, wait, immediate)  {
                     var timeout, result;
                     return function()  {
                        var context = this, args = arguments;
                        var later = function()  {
                           timeout = null;
                           if (! immediate) result = func.apply(context, args)                        }
;
                        var callNow = immediate && ! timeout;
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                        if (callNow) result = func.apply(context, args)                        return result;
                     }
;
                  }
;
                  _.once = function(func)  {
                     var ran = false, memo;
                     return function()  {
                        if (ran) return memo                        ran = true;
                        memo = func.apply(this, arguments);
                        func = null;
                        return memo;
                     }
;
                  }
;
                  _.wrap = function(func, wrapper)  {
                     return function()  {
                        var args = [func];
                        push.apply(args, arguments);
                        return wrapper.apply(this, args);
                     }
;
                  }
;
                  _.compose = function()  {
                     var funcs = arguments;
                     return function()  {
                        var args = arguments;
                        for (var i = funcs.length - 1; i >= 0; i--)  {
                              args = [funcs[i].apply(this, args)];
                           }
                        return args[0];
                     }
;
                  }
;
                  _.after = function(times, func)  {
                     if (times <= 0) return func()                     return function()  {
                        if (--times < 1)  {
                           return func.apply(this, arguments);
                        }
                     }
;
                  }
;
                  _.keys = nativeKeys || function(obj)  {
                     if (obj !== Object(obj)) throw new TypeError("Invalid object")                     var keys = [];
                     for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key                     return keys;
                  }
;
                  _.values = function(obj)  {
                     var values = [];
                     for (var key in obj) if (_.has(obj, key)) values.push(obj[key])                     return values;
                  }
;
                  _.pairs = function(obj)  {
                     var pairs = [];
                     for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]])                     return pairs;
                  }
;
                  _.invert = function(obj)  {
                     var result =  {} ;
                     for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key                     return result;
                  }
;
                  _.functions = _.methods = function(obj)  {
                     var names = [];
                     for (var key in obj)  {
                           if (_.isFunction(obj[key])) names.push(key)                        }
                     return names.sort();
                  }
;
                  _.extend = function(obj)  {
                     each(slice.call(arguments, 1), function(source)  {
                           if (source)  {
                              for (var prop in source)  {
                                    obj[prop] = source[prop];
                                 }
                           }
                        }
                     );
                     return obj;
                  }
;
                  _.pick = function(obj)  {
                     var copy =  {} ;
                     var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                     each(keys, function(key)  {
                           if (key in obj) copy[key] = obj[key]                        }
                     );
                     return copy;
                  }
;
                  _.omit = function(obj)  {
                     var copy =  {} ;
                     var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                     for (var key in obj)  {
                           if (! _.contains(keys, key)) copy[key] = obj[key]                        }
                     return copy;
                  }
;
                  _.defaults = function(obj)  {
                     each(slice.call(arguments, 1), function(source)  {
                           if (source)  {
                              for (var prop in source)  {
                                    if (obj[prop] == null) obj[prop] = source[prop]                                 }
                           }
                        }
                     );
                     return obj;
                  }
;
                  _.clone = function(obj)  {
                     if (! _.isObject(obj)) return obj                     return _.isArray(obj) ? obj.slice() : _.extend( {} , obj);
                  }
;
                  _.tap = function(obj, interceptor)  {
                     interceptor(obj);
                     return obj;
                  }
;
                  var eq = function(a, b, aStack, bStack)  {
                     if (a === b) return a !== 0 || 1 / a == 1 / b                     if (a == null || b == null) return a === b                     if (a instanceof _) a = a._wrapped                     if (b instanceof _) b = b._wrapped                     var className = toString.call(a);
                     if (className != toString.call(b)) return false                     switch(className) {
                        case "[object String]":
 
                              return a == String(b);
                           
                        case "[object Number]":
 
                              return a != + a ? b != + b : a == 0 ? 1 / a == 1 / b : a == + b;
                           
                        case "[object Date]":
 
                           
                        case "[object Boolean]":
 
                              return + a == + b;
                           
                        case "[object RegExp]":
 
                              return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                           
}
;
                     if (typeof a != "object" || typeof b != "object") return false                     var length = aStack.length;
                     while (length--)  {
                           if (aStack[length] == a) return bStack[length] == b                        }
                     aStack.push(a);
                     bStack.push(b);
                     var size = 0, result = true;
                     if (className == "[object Array]")  {
                        size = a.length;
                        result = size == b.length;
                        if (result)  {
                           while (size--)  {
                                 if (! result = eq(a[size], b[size], aStack, bStack)) break                              }
                        }
                     }
                      else  {
                        var aCtor = a.constructor, bCtor = b.constructor;
                        if (aCtor !== bCtor && ! _.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)  {
                           return false;
                        }
                        for (var key in a)  {
                              if (_.has(a, key))  {
                                 size++;
                                 if (! result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)) break                              }
                           }
                        if (result)  {
                           for (key in b)  {
                                 if (_.has(b, key) && ! size--) break                              }
                           result = ! size;
                        }
                     }
                     aStack.pop();
                     bStack.pop();
                     return result;
                  }
;
                  _.isEqual = function(a, b)  {
                     return eq(a, b, [], []);
                  }
;
                  _.isEmpty = function(obj)  {
                     if (obj == null) return true                     if (_.isArray(obj) || _.isString(obj)) return obj.length === 0                     for (var key in obj) if (_.has(obj, key)) return false                     return true;
                  }
;
                  _.isElement = function(obj)  {
                     return ! ! obj && obj.nodeType === 1;
                  }
;
                  _.isArray = nativeIsArray || function(obj)  {
                     return toString.call(obj) == "[object Array]";
                  }
;
                  _.isObject = function(obj)  {
                     return obj === Object(obj);
                  }
;
                  each(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function(name)  {
                        _["is" + name] = function(obj)  {
                           return toString.call(obj) == "[object " + name + "]";
                        }
;
                     }
                  );
                  if (! _.isArguments(arguments))  {
                     _.isArguments = function(obj)  {
                        return ! ! obj && _.has(obj, "callee");
                     }
;
                  }
                  if (typeof /./ !== "function")  {
                     _.isFunction = function(obj)  {
                        return typeof obj === "function";
                     }
;
                  }
                  _.isFinite = function(obj)  {
                     return isFinite(obj) && ! isNaN(parseFloat(obj));
                  }
;
                  _.isNaN = function(obj)  {
                     return _.isNumber(obj) && obj != + obj;
                  }
;
                  _.isBoolean = function(obj)  {
                     return obj === true || obj === false || toString.call(obj) == "[object Boolean]";
                  }
;
                  _.isNull = function(obj)  {
                     return obj === null;
                  }
;
                  _.isUndefined = function(obj)  {
                     return obj === void 0;
                  }
;
                  _.has = function(obj, key)  {
                     return hasOwnProperty.call(obj, key);
                  }
;
                  _.noConflict = function()  {
                     root._ = previousUnderscore;
                     return this;
                  }
;
                  _.identity = function(value)  {
                     return value;
                  }
;
                  _.times = function(n, iterator, context)  {
                     var accum = Array(n);
                     for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i)                     return accum;
                  }
;
                  _.random = function(min, max)  {
                     if (max == null)  {
                        max = min;
                        min = 0;
                     }
                     return min + Math.floor(Math.random() * max - min + 1);
                  }
;
                  var entityMap =  {
                     escape: {
                        &:"&amp;", 
                        <:"&lt;", 
                        >:"&gt;", 
                        ":"&quot;", 
                        ':"&#x27;", 
                        /:"&#x2F;"                     }} ;
                  entityMap.unescape = _.invert(entityMap.escape);
                  var entityRegexes =  {
                     escape:new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"), 
                     unescape:new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g")                  }
;
                  _.each(["escape", "unescape"], function(method)  {
                        _[method] = function(string)  {
                           if (string == null) return ""                           return "" + string.replace(entityRegexes[method], function(match)  {
                                 return entityMap[method][match];
                              }
                           );
                        }
;
                     }
                  );
                  _.result = function(object, property)  {
                     if (object == null) return null                     var value = object[property];
                     return _.isFunction(value) ? value.call(object) : value;
                  }
;
                  _.mixin = function(obj)  {
                     each(_.functions(obj), function(name)  {
                           var func = _[name] = obj[name];
                           _.prototype[name] = function()  {
                              var args = [this._wrapped];
                              push.apply(args, arguments);
                              return result.call(this, func.apply(_, args));
                           }
;
                        }
                     );
                  }
;
                  var idCounter = 0;
                  _.uniqueId = function(prefix)  {
                     var id = ++idCounter + "";
                     return prefix ? prefix + id : id;
                  }
;
                  _.templateSettings =  {
                     evaluate:/<%([\s\S]+?)%>/g, 
                     interpolate:/<%=([\s\S]+?)%>/g, 
                     escape:/<%-([\s\S]+?)%>/g                  }
;
                  var noMatch = /(.)^/;
                  var escapes =  {
                     ':"'", 
                     \:"\", 
                     :"r", 
                     
:"n", 
                     	:"t", 
                      :"u2028", 
                      :"u2029"                  }
;
                  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
                  _.template = function(text, data, settings)  {
                     var render;
                     settings = _.defaults( {} , settings, _.templateSettings);
                     var matcher = new RegExp([settings.escape || noMatch.source, settings.interpolate || noMatch.source, settings.evaluate || noMatch.source].join("|") + "|$", "g");
                     var index = 0;
                     var source = "__p+='";
                     text.replace(matcher, function(match, escape, interpolate, evaluate, offset)  {
                           source = text.slice(index, offset).replace(escaper, function(match)  {
                                 return "\" + escapes[match];
                              }
                           );
                           if (escape)  {
                              source = "'+
((__t=(" + escape + "))==null?'':_.escape(__t))+
'";
                           }
                           if (interpolate)  {
                              source = "'+
((__t=(" + interpolate + "))==null?'':__t)+
'";
                           }
                           if (evaluate)  {
                              source = "';
" + evaluate + "
__p+='";
                           }
                           index = offset + match.length;
                           return match;
                        }
                     );
                     source = "';
";
                     if (! settings.variable) source = "with(obj||{}){
" + source + "}
"                     source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};
" + source + "return __p;
";
                     try {
                        render = new Function(settings.variable || "obj", "_", source);
                     }
                     catch (e) {
                        e.source = source;
                        throw e;
                     }
                     if (data) return render(data, _)                     var template = function(data)  {
                        return render.call(this, data, _);
                     }
;
                     template.source = "function(" + settings.variable || "obj" + "){
" + source + "}";
                     return template;
                  }
;
                  _.chain = function(obj)  {
                     return _(obj).chain();
                  }
;
                  var result = function(obj)  {
                     return this._chain ? _(obj).chain() : obj;
                  }
;
                  _.mixin(_);
                  each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(name)  {
                        var method = ArrayProto[name];
                        _.prototype[name] = function()  {
                           var obj = this._wrapped;
                           method.apply(obj, arguments);
                           if (name == "shift" || name == "splice" && obj.length === 0) delete obj[0]                           return result.call(this, obj);
                        }
;
                     }
                  );
                  each(["concat", "join", "slice"], function(name)  {
                        var method = ArrayProto[name];
                        _.prototype[name] = function()  {
                           return result.call(this, method.apply(this._wrapped, arguments));
                        }
;
                     }
                  );
                  _.extend(_.prototype,  {
                        chain:function()  {
                           this._chain = true;
                           return this;
                        }, 
                        value:function()  {
                           return this._wrapped;
                        }} );
               }
.call(this);
            }
();
         }
,  {} ], 
         :[function(require, module, exports)  {
            exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes)  {
               var e, m, eLen = nBytes * 8 - mLen - 1, eMax = 1 << eLen - 1, eBias = eMax >> 1, nBits = - 7, i = isBE ? 0 : nBytes - 1, d = isBE ? 1 : - 1, s = buffer[offset + i];
               i = d;
               e = s & 1 << - nBits - 1;
               s = - nBits;
               nBits = eLen;
               for (; nBits > 0; e = e * 256 + buffer[offset + i], i = d, nBits = 8)                m = e & 1 << - nBits - 1;
               e = - nBits;
               nBits = mLen;
               for (; nBits > 0; m = m * 256 + buffer[offset + i], i = d, nBits = 8)                if (e === 0)  {
                  e = 1 - eBias;
               }
                else if (e === eMax)  {
                  return m ? NaN : s ? - 1 : 1 * Infinity;
               }
                else  {
                  m = m + Math.pow(2, mLen);
                  e = e - eBias;
               }
               return s ? - 1 : 1 * m * Math.pow(2, e - mLen);
            }
;
            exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes)  {
               var e, m, c, eLen = nBytes * 8 - mLen - 1, eMax = 1 << eLen - 1, eBias = eMax >> 1, rt = mLen === 23 ? Math.pow(2, - 24) - Math.pow(2, - 77) : 0, i = isBE ? nBytes - 1 : 0, d = isBE ? - 1 : 1, s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
               value = Math.abs(value);
               if (isNaN(value) || value === Infinity)  {
                  m = isNaN(value) ? 1 : 0;
                  e = eMax;
               }
                else  {
                  e = Math.floor(Math.log(value) / Math.LN2);
                  if (value * c = Math.pow(2, - e) < 1)  {
                     e--;
                     c = 2;
                  }
                  if (e + eBias >= 1)  {
                     value = rt / c;
                  }
                   else  {
                     value = rt * Math.pow(2, 1 - eBias);
                  }
                  if (value * c >= 2)  {
                     e++;
                     c = 2;
                  }
                  if (e + eBias >= eMax)  {
                     m = 0;
                     e = eMax;
                  }
                   else if (e + eBias >= 1)  {
                     m = value * c - 1 * Math.pow(2, mLen);
                     e = e + eBias;
                  }
                   else  {
                     m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                     e = 0;
                  }
               }
               for (; mLen >= 8; buffer[offset + i] = m & 255, i = d, m = 256, mLen = 8)                e = e << mLen | m;
               eLen = mLen;
               for (; eLen > 0; buffer[offset + i] = e & 255, i = d, e = 256, eLen = 8)                buffer[offset + i - d] = s * 128;
            }
;
         }
,  {} ], 
         :[function(require, module, exports)  {
            function()  {
               function SlowBuffer(size)  {
                  this.length = size;
               }
;
               ;
               var assert = require("assert");
               exports.INSPECT_MAX_BYTES = 50;
               function toHex(n)  {
                  if (n < 16) return "0" + n.toString(16)                  return n.toString(16);
               }
;
               function utf8ToBytes(str)  {
                  var byteArray = [];
                  for (var i = 0; i < str.length; i++) if (str.charCodeAt(i) <= 127) byteArray.push(str.charCodeAt(i))                      else  {
                        var h = encodeURIComponent(str.charAt(i)).substr(1).split("%");
                        for (var j = 0; j < h.length; j++) byteArray.push(parseInt(h[j], 16))                     }
                  return byteArray;
               }
;
               function asciiToBytes(str)  {
                  var byteArray = [];
                  for (var i = 0; i < str.length; i++) byteArray.push(str.charCodeAt(i) & 255)                  return byteArray;
               }
;
               function base64ToBytes(str)  {
                  return require("base64-js").toByteArray(str);
               }
;
               SlowBuffer.byteLength = function(str, encoding)  {
                  switch(encoding || "utf8") {
                     case "hex":
 
                           return str.length / 2;
                        
                     case "utf8":
 
                        
                     case "utf-8":
 
                           return utf8ToBytes(str).length;
                        
                     case "ascii":
 
                        
                     case "binary":
 
                           return str.length;
                        
                     case "base64":
 
                           return base64ToBytes(str).length;
                        
                     default:
 
                           throw new Error("Unknown encoding");
                        
}
;
               }
;
               function blitBuffer(src, dst, offset, length)  {
                  var pos, i = 0;
                  while (i < length)  {
                        if (i + offset >= dst.length || i >= src.length) break                        dst[i + offset] = src[i];
                        i++;
                     }
                  return i;
               }
;
               SlowBuffer.prototype.utf8Write = function(string, offset, length)  {
                  var bytes, pos;
                  return SlowBuffer._charsWritten = blitBuffer(utf8ToBytes(string), this, offset, length);
               }
;
               SlowBuffer.prototype.asciiWrite = function(string, offset, length)  {
                  var bytes, pos;
                  return SlowBuffer._charsWritten = blitBuffer(asciiToBytes(string), this, offset, length);
               }
;
               SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;
               SlowBuffer.prototype.base64Write = function(string, offset, length)  {
                  var bytes, pos;
                  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
               }
;
               SlowBuffer.prototype.base64Slice = function(start, end)  {
                  var bytes = Array.prototype.slice.apply(this, arguments);
                  return require("base64-js").fromByteArray(bytes);
               }
;
               function decodeUtf8Char(str)  {
                  try {
                     return decodeURIComponent(str);
                  }
                  catch (err) {
                     return String.fromCharCode(65533);
                  }
               }
;
               SlowBuffer.prototype.utf8Slice = function()  {
                  var bytes = Array.prototype.slice.apply(this, arguments);
                  var res = "";
                  var tmp = "";
                  var i = 0;
                  while (i < bytes.length)  {
                        if (bytes[i] <= 127)  {
                           res = decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
                           tmp = "";
                        }
                         else tmp = "%" + bytes[i].toString(16)                        i++;
                     }
                  return res + decodeUtf8Char(tmp);
               }
;
               SlowBuffer.prototype.asciiSlice = function()  {
                  var bytes = Array.prototype.slice.apply(this, arguments);
                  var ret = "";
                  for (var i = 0; i < bytes.length; i++) ret = String.fromCharCode(bytes[i])                  return ret;
               }
;
               SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;
               SlowBuffer.prototype.inspect = function()  {
                  var out = [], len = this.length;
                  for (var i = 0; i < len; i++)  {
                        out[i] = toHex(this[i]);
                        if (i == exports.INSPECT_MAX_BYTES)  {
                           out[i + 1] = "...";
                           break;
                        }
                     }
                  return "<SlowBuffer " + out.join(" ") + ">";
               }
;
               SlowBuffer.prototype.hexSlice = function(start, end)  {
                  var len = this.length;
                  if (! start || start < 0) start = 0                  if (! end || end < 0 || end > len) end = len                  var out = "";
                  for (var i = start; i < end; i++)  {
                        out = toHex(this[i]);
                     }
                  return out;
               }
;
               SlowBuffer.prototype.toString = function(encoding, start, end)  {
                  encoding = String(encoding || "utf8").toLowerCase();
                  start = + start || 0;
                  if (typeof end == "undefined") end = this.length                  if (+ end == start)  {
                     return "";
                  }
                  switch(encoding) {
                     case "hex":
 
                           return this.hexSlice(start, end);
                        
                     case "utf8":
 
                        
                     case "utf-8":
 
                           return this.utf8Slice(start, end);
                        
                     case "ascii":
 
                           return this.asciiSlice(start, end);
                        
                     case "binary":
 
                           return this.binarySlice(start, end);
                        
                     case "base64":
 
                           return this.base64Slice(start, end);
                        
                     case "ucs2":
 
                        
                     case "ucs-2":
 
                           return this.ucs2Slice(start, end);
                        
                     default:
 
                           throw new Error("Unknown encoding");
                        
}
;
               }
;
               SlowBuffer.prototype.hexWrite = function(string, offset, length)  {
                  offset = + offset || 0;
                  var remaining = this.length - offset;
                  if (! length)  {
                     length = remaining;
                  }
                   else  {
                     length = + length;
                     if (length > remaining)  {
                        length = remaining;
                     }
                  }
                  var strLen = string.length;
                  if (strLen % 2)  {
                     throw new Error("Invalid hex string");
                  }
                  if (length > strLen / 2)  {
                     length = strLen / 2;
                  }
                  for (var i = 0; i < length; i++)  {
                        var byte = parseInt(string.substr(i * 2, 2), 16);
                        if (isNaN(byte)) throw new Error("Invalid hex string")                        this[offset + i] = byte;
                     }
                  SlowBuffer._charsWritten = i * 2;
                  return i;
               }
;
               SlowBuffer.prototype.write = function(string, offset, length, encoding)  {
                  if (isFinite(offset))  {
                     if (! isFinite(length))  {
                        encoding = length;
                        length = undefined;
                     }
                  }
                   else  {
                     var swap = encoding;
                     encoding = offset;
                     offset = length;
                     length = swap;
                  }
                  offset = + offset || 0;
                  var remaining = this.length - offset;
                  if (! length)  {
                     length = remaining;
                  }
                   else  {
                     length = + length;
                     if (length > remaining)  {
                        length = remaining;
                     }
                  }
                  encoding = String(encoding || "utf8").toLowerCase();
                  switch(encoding) {
                     case "hex":
 
                           return this.hexWrite(string, offset, length);
                        
                     case "utf8":
 
                        
                     case "utf-8":
 
                           return this.utf8Write(string, offset, length);
                        
                     case "ascii":
 
                           return this.asciiWrite(string, offset, length);
                        
                     case "binary":
 
                           return this.binaryWrite(string, offset, length);
                        
                     case "base64":
 
                           return this.base64Write(string, offset, length);
                        
                     case "ucs2":
 
                        
                     case "ucs-2":
 
                           return this.ucs2Write(string, offset, length);
                        
                     default:
 
                           throw new Error("Unknown encoding");
                        
}
;
               }
;
               SlowBuffer.prototype.slice = function(start, end)  {
                  if (end === undefined) end = this.length                  if (end > this.length)  {
                     throw new Error("oob");
                  }
                  if (start > end)  {
                     throw new Error("oob");
                  }
                  return new Buffer(this, end - start, + start);
               }
;
               SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend)  {
                  var temp = [];
                  for (var i = sourcestart; i < sourceend; i++)  {
                        assert.ok(typeof this[i] !== "undefined", "copying undefined buffer bytes!");
                        temp.push(this[i]);
                     }
                  for (var i = targetstart; i < targetstart + temp.length; i++)  {
                        target[i] = temp[i - targetstart];
                     }
               }
;
               SlowBuffer.prototype.fill = function(value, start, end)  {
                  if (end > this.length)  {
                     throw new Error("oob");
                  }
                  if (start > end)  {
                     throw new Error("oob");
                  }
                  for (var i = start; i < end; i++)  {
                        this[i] = value;
                     }
               }
;
               function coerce(length)  {
                  length = ~ ~ Math.ceil(+ length);
                  return length < 0 ? 0 : length;
               }
;
               function Buffer(subject, encoding, offset)  {
                  if (! this instanceof Buffer)  {
                     return new Buffer(subject, encoding, offset);
                  }
                  var type;
                  if (typeof offset === "number")  {
                     this.length = coerce(encoding);
                     this.parent = subject;
                     this.offset = offset;
                  }
                   else  {
                     switch(type = typeof subject) {
                        case "number":
 
                              this.length = coerce(subject);
                              break;
                           
                        case "string":
 
                              this.length = Buffer.byteLength(subject, encoding);
                              break;
                           
                        case "object":
 
                              this.length = coerce(subject.length);
                              break;
                           
                        default:
 
                              throw new Error("First argument needs to be a number, " + "array or string.");
                           
}
;
                     if (this.length > Buffer.poolSize)  {
                        this.parent = new SlowBuffer(this.length);
                        this.offset = 0;
                     }
                      else  {
                        if (! pool || pool.length - pool.used < this.length) allocPool()                        this.parent = pool;
                        this.offset = pool.used;
                        pool.used = this.length;
                     }
                     if (isArrayIsh(subject))  {
                        for (var i = 0; i < this.length; i++)  {
                              if (subject instanceof Buffer)  {
                                 this.parent[i + this.offset] = subject.readUInt8(i);
                              }
                               else  {
                                 this.parent[i + this.offset] = subject[i];
                              }
                           }
                     }
                      else if (type == "string")  {
                        this.length = this.write(subject, 0, encoding);
                     }
                  }
               }
;
               function isArrayIsh(subject)  {
                  return Array.isArray(subject) || Buffer.isBuffer(subject) || subject && typeof subject === "object" && typeof subject.length === "number";
               }
;
               exports.SlowBuffer = SlowBuffer;
               exports.Buffer = Buffer;
               Buffer.poolSize = 8 * 1024;
               var pool;
               function allocPool()  {
                  pool = new SlowBuffer(Buffer.poolSize);
                  pool.used = 0;
               }
;
               Buffer.isBuffer = function(b)  {
                  return b instanceof Buffer || b instanceof SlowBuffer;
               }
;
               Buffer.concat = function(list, totalLength)  {
                  if (! Array.isArray(list))  {
                     throw new Error("Usage: Buffer.concat(list, [totalLength])
       list should be an Array.");
                  }
                  if (list.length === 0)  {
                     return new Buffer(0);
                  }
                   else if (list.length === 1)  {
                     return list[0];
                  }
                  if (typeof totalLength !== "number")  {
                     totalLength = 0;
                     for (var i = 0; i < list.length; i++)  {
                           var buf = list[i];
                           totalLength = buf.length;
                        }
                  }
                  var buffer = new Buffer(totalLength);
                  var pos = 0;
                  for (var i = 0; i < list.length; i++)  {
                        var buf = list[i];
                        buf.copy(buffer, pos);
                        pos = buf.length;
                     }
                  return buffer;
               }
;
               Buffer.prototype.inspect = function()  {
                  var out = [], len = this.length;
                  for (var i = 0; i < len; i++)  {
                        out[i] = toHex(this.parent[i + this.offset]);
                        if (i == exports.INSPECT_MAX_BYTES)  {
                           out[i + 1] = "...";
                           break;
                        }
                     }
                  return "<Buffer " + out.join(" ") + ">";
               }
;
               Buffer.prototype.get = function(i)  {
                  if (i < 0 || i >= this.length) throw new Error("oob")                  return this.parent[this.offset + i];
               }
;
               Buffer.prototype.set = function(i, v)  {
                  if (i < 0 || i >= this.length) throw new Error("oob")                  return this.parent[this.offset + i] = v;
               }
;
               Buffer.prototype.write = function(string, offset, length, encoding)  {
                  if (isFinite(offset))  {
                     if (! isFinite(length))  {
                        encoding = length;
                        length = undefined;
                     }
                  }
                   else  {
                     var swap = encoding;
                     encoding = offset;
                     offset = length;
                     length = swap;
                  }
                  offset = + offset || 0;
                  var remaining = this.length - offset;
                  if (! length)  {
                     length = remaining;
                  }
                   else  {
                     length = + length;
                     if (length > remaining)  {
                        length = remaining;
                     }
                  }
                  encoding = String(encoding || "utf8").toLowerCase();
                  var ret;
                  switch(encoding) {
                     case "hex":
 
                           ret = this.parent.hexWrite(string, this.offset + offset, length);
                           break;
                        
                     case "utf8":
 
                        
                     case "utf-8":
 
                           ret = this.parent.utf8Write(string, this.offset + offset, length);
                           break;
                        
                     case "ascii":
 
                           ret = this.parent.asciiWrite(string, this.offset + offset, length);
                           break;
                        
                     case "binary":
 
                           ret = this.parent.binaryWrite(string, this.offset + offset, length);
                           break;
                        
                     case "base64":
 
                           ret = this.parent.base64Write(string, this.offset + offset, length);
                           break;
                        
                     case "ucs2":
 
                        
                     case "ucs-2":
 
                           ret = this.parent.ucs2Write(string, this.offset + offset, length);
                           break;
                        
                     default:
 
                           throw new Error("Unknown encoding");
                        
}
;
                  Buffer._charsWritten = SlowBuffer._charsWritten;
                  return ret;
               }
;
               Buffer.prototype.toString = function(encoding, start, end)  {
                  encoding = String(encoding || "utf8").toLowerCase();
                  if (typeof start == "undefined" || start < 0)  {
                     start = 0;
                  }
                   else if (start > this.length)  {
                     start = this.length;
                  }
                  if (typeof end == "undefined" || end > this.length)  {
                     end = this.length;
                  }
                   else if (end < 0)  {
                     end = 0;
                  }
                  start = start + this.offset;
                  end = end + this.offset;
                  switch(encoding) {
                     case "hex":
 
                           return this.parent.hexSlice(start, end);
                        
                     case "utf8":
 
                        
                     case "utf-8":
 
                           return this.parent.utf8Slice(start, end);
                        
                     case "ascii":
 
                           return this.parent.asciiSlice(start, end);
                        
                     case "binary":
 
                           return this.parent.binarySlice(start, end);
                        
                     case "base64":
 
                           return this.parent.base64Slice(start, end);
                        
                     case "ucs2":
 
                        
                     case "ucs-2":
 
                           return this.parent.ucs2Slice(start, end);
                        
                     default:
 
                           throw new Error("Unknown encoding");
                        
}
;
               }
;
               Buffer.byteLength = SlowBuffer.byteLength;
               Buffer.prototype.fill = function(value, start, end)  {
                  value || value = 0;
                  start || start = 0;
                  end || end = this.length;
                  if (typeof value === "string")  {
                     value = value.charCodeAt(0);
                  }
                  if (! typeof value === "number" || isNaN(value))  {
                     throw new Error("value is not a number");
                  }
                  if (end < start) throw new Error("end < start")                  if (end === start) return 0                  if (this.length == 0) return 0                  if (start < 0 || start >= this.length)  {
                     throw new Error("start out of bounds");
                  }
                  if (end < 0 || end > this.length)  {
                     throw new Error("end out of bounds");
                  }
                  return this.parent.fill(value, start + this.offset, end + this.offset);
               }
;
               Buffer.prototype.copy = function(target, target_start, start, end)  {
                  var source = this;
                  start || start = 0;
                  end || end = this.length;
                  target_start || target_start = 0;
                  if (end < start) throw new Error("sourceEnd < sourceStart")                  if (end === start) return 0                  if (target.length == 0 || source.length == 0) return 0                  if (target_start < 0 || target_start >= target.length)  {
                     throw new Error("targetStart out of bounds");
                  }
                  if (start < 0 || start >= source.length)  {
                     throw new Error("sourceStart out of bounds");
                  }
                  if (end < 0 || end > source.length)  {
                     throw new Error("sourceEnd out of bounds");
                  }
                  if (end > this.length)  {
                     end = this.length;
                  }
                  if (target.length - target_start < end - start)  {
                     end = target.length - target_start + start;
                  }
                  return this.parent.copy(target.parent, target_start + target.offset, start + this.offset, end + this.offset);
               }
;
               Buffer.prototype.slice = function(start, end)  {
                  if (end === undefined) end = this.length                  if (end > this.length) throw new Error("oob")                  if (start > end) throw new Error("oob")                  return new Buffer(this.parent, end - start, + start + this.offset);
               }
;
               Buffer.prototype.utf8Slice = function(start, end)  {
                  return this.toString("utf8", start, end);
               }
;
               Buffer.prototype.binarySlice = function(start, end)  {
                  return this.toString("binary", start, end);
               }
;
               Buffer.prototype.asciiSlice = function(start, end)  {
                  return this.toString("ascii", start, end);
               }
;
               Buffer.prototype.utf8Write = function(string, offset)  {
                  return this.write(string, offset, "utf8");
               }
;
               Buffer.prototype.binaryWrite = function(string, offset)  {
                  return this.write(string, offset, "binary");
               }
;
               Buffer.prototype.asciiWrite = function(string, offset)  {
                  return this.write(string, offset, "ascii");
               }
;
               Buffer.prototype.readUInt8 = function(offset, noAssert)  {
                  var buffer = this;
                  if (! noAssert)  {
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset < buffer.length, "Trying to read beyond buffer length");
                  }
                  if (offset >= buffer.length) return                   return buffer.parent[buffer.offset + offset];
               }
;
               function readUInt16(buffer, offset, isBigEndian, noAssert)  {
                  var val = 0;
                  if (! noAssert)  {
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 1 < buffer.length, "Trying to read beyond buffer length");
                  }
                  if (offset >= buffer.length) return 0                  if (isBigEndian)  {
                     val = buffer.parent[buffer.offset + offset] << 8;
                     if (offset + 1 < buffer.length)  {
                        val = buffer.parent[buffer.offset + offset + 1];
                     }
                  }
                   else  {
                     val = buffer.parent[buffer.offset + offset];
                     if (offset + 1 < buffer.length)  {
                        val = buffer.parent[buffer.offset + offset + 1] << 8;
                     }
                  }
                  return val;
               }
;
               Buffer.prototype.readUInt16LE = function(offset, noAssert)  {
                  return readUInt16(this, offset, false, noAssert);
               }
;
               Buffer.prototype.readUInt16BE = function(offset, noAssert)  {
                  return readUInt16(this, offset, true, noAssert);
               }
;
               function readUInt32(buffer, offset, isBigEndian, noAssert)  {
                  var val = 0;
                  if (! noAssert)  {
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 3 < buffer.length, "Trying to read beyond buffer length");
                  }
                  if (offset >= buffer.length) return 0                  if (isBigEndian)  {
                     if (offset + 1 < buffer.length) val = buffer.parent[buffer.offset + offset + 1] << 16                     if (offset + 2 < buffer.length) val = buffer.parent[buffer.offset + offset + 2] << 8                     if (offset + 3 < buffer.length) val = buffer.parent[buffer.offset + offset + 3]                     val = val + buffer.parent[buffer.offset + offset] << 24 >>> 0;
                  }
                   else  {
                     if (offset + 2 < buffer.length) val = buffer.parent[buffer.offset + offset + 2] << 16                     if (offset + 1 < buffer.length) val = buffer.parent[buffer.offset + offset + 1] << 8                     val = buffer.parent[buffer.offset + offset];
                     if (offset + 3 < buffer.length) val = val + buffer.parent[buffer.offset + offset + 3] << 24 >>> 0                  }
                  return val;
               }
;
               Buffer.prototype.readUInt32LE = function(offset, noAssert)  {
                  return readUInt32(this, offset, false, noAssert);
               }
;
               Buffer.prototype.readUInt32BE = function(offset, noAssert)  {
                  return readUInt32(this, offset, true, noAssert);
               }
;
               Buffer.prototype.readInt8 = function(offset, noAssert)  {
                  var buffer = this;
                  var neg;
                  if (! noAssert)  {
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset < buffer.length, "Trying to read beyond buffer length");
                  }
                  if (offset >= buffer.length) return                   neg = buffer.parent[buffer.offset + offset] & 128;
                  if (! neg)  {
                     return buffer.parent[buffer.offset + offset];
                  }
                  return 255 - buffer.parent[buffer.offset + offset] + 1 * - 1;
               }
;
               function readInt16(buffer, offset, isBigEndian, noAssert)  {
                  var neg, val;
                  if (! noAssert)  {
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 1 < buffer.length, "Trying to read beyond buffer length");
                  }
                  val = readUInt16(buffer, offset, isBigEndian, noAssert);
                  neg = val & 32768;
                  if (! neg)  {
                     return val;
                  }
                  return 65535 - val + 1 * - 1;
               }
;
               Buffer.prototype.readInt16LE = function(offset, noAssert)  {
                  return readInt16(this, offset, false, noAssert);
               }
;
               Buffer.prototype.readInt16BE = function(offset, noAssert)  {
                  return readInt16(this, offset, true, noAssert);
               }
;
               function readInt32(buffer, offset, isBigEndian, noAssert)  {
                  var neg, val;
                  if (! noAssert)  {
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 3 < buffer.length, "Trying to read beyond buffer length");
                  }
                  val = readUInt32(buffer, offset, isBigEndian, noAssert);
                  neg = val & 2147483648;
                  if (! neg)  {
                     return val;
                  }
                  return 4294967295 - val + 1 * - 1;
               }
;
               Buffer.prototype.readInt32LE = function(offset, noAssert)  {
                  return readInt32(this, offset, false, noAssert);
               }
;
               Buffer.prototype.readInt32BE = function(offset, noAssert)  {
                  return readInt32(this, offset, true, noAssert);
               }
;
               function readFloat(buffer, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset + 3 < buffer.length, "Trying to read beyond buffer length");
                  }
                  return require("./buffer_ieee754").readIEEE754(buffer, offset, isBigEndian, 23, 4);
               }
;
               Buffer.prototype.readFloatLE = function(offset, noAssert)  {
                  return readFloat(this, offset, false, noAssert);
               }
;
               Buffer.prototype.readFloatBE = function(offset, noAssert)  {
                  return readFloat(this, offset, true, noAssert);
               }
;
               function readDouble(buffer, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset + 7 < buffer.length, "Trying to read beyond buffer length");
                  }
                  return require("./buffer_ieee754").readIEEE754(buffer, offset, isBigEndian, 52, 8);
               }
;
               Buffer.prototype.readDoubleLE = function(offset, noAssert)  {
                  return readDouble(this, offset, false, noAssert);
               }
;
               Buffer.prototype.readDoubleBE = function(offset, noAssert)  {
                  return readDouble(this, offset, true, noAssert);
               }
;
               function verifuint(value, max)  {
                  assert.ok(typeof value == "number", "cannot write a non-number as a number");
                  assert.ok(value >= 0, "specified a negative value for writing an unsigned value");
                  assert.ok(value <= max, "value is larger than maximum value for type");
                  assert.ok(Math.floor(value) === value, "value has a fractional component");
               }
;
               Buffer.prototype.writeUInt8 = function(value, offset, noAssert)  {
                  var buffer = this;
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset < buffer.length, "trying to write beyond buffer length");
                     verifuint(value, 255);
                  }
                  if (offset < buffer.length)  {
                     buffer.parent[buffer.offset + offset] = value;
                  }
               }
;
               function writeUInt16(buffer, value, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 1 < buffer.length, "trying to write beyond buffer length");
                     verifuint(value, 65535);
                  }
                  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++)  {
                        buffer.parent[buffer.offset + offset + i] = value & 255 << 8 * isBigEndian ? 1 - i : i >>> isBigEndian ? 1 - i : i * 8;
                     }
               }
;
               Buffer.prototype.writeUInt16LE = function(value, offset, noAssert)  {
                  writeUInt16(this, value, offset, false, noAssert);
               }
;
               Buffer.prototype.writeUInt16BE = function(value, offset, noAssert)  {
                  writeUInt16(this, value, offset, true, noAssert);
               }
;
               function writeUInt32(buffer, value, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 3 < buffer.length, "trying to write beyond buffer length");
                     verifuint(value, 4294967295);
                  }
                  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++)  {
                        buffer.parent[buffer.offset + offset + i] = value >>> isBigEndian ? 3 - i : i * 8 & 255;
                     }
               }
;
               Buffer.prototype.writeUInt32LE = function(value, offset, noAssert)  {
                  writeUInt32(this, value, offset, false, noAssert);
               }
;
               Buffer.prototype.writeUInt32BE = function(value, offset, noAssert)  {
                  writeUInt32(this, value, offset, true, noAssert);
               }
;
               function verifsint(value, max, min)  {
                  assert.ok(typeof value == "number", "cannot write a non-number as a number");
                  assert.ok(value <= max, "value larger than maximum allowed value");
                  assert.ok(value >= min, "value smaller than minimum allowed value");
                  assert.ok(Math.floor(value) === value, "value has a fractional component");
               }
;
               function verifIEEE754(value, max, min)  {
                  assert.ok(typeof value == "number", "cannot write a non-number as a number");
                  assert.ok(value <= max, "value larger than maximum allowed value");
                  assert.ok(value >= min, "value smaller than minimum allowed value");
               }
;
               Buffer.prototype.writeInt8 = function(value, offset, noAssert)  {
                  var buffer = this;
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset < buffer.length, "Trying to write beyond buffer length");
                     verifsint(value, 127, - 128);
                  }
                  if (value >= 0)  {
                     buffer.writeUInt8(value, offset, noAssert);
                  }
                   else  {
                     buffer.writeUInt8(255 + value + 1, offset, noAssert);
                  }
               }
;
               function writeInt16(buffer, value, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 1 < buffer.length, "Trying to write beyond buffer length");
                     verifsint(value, 32767, - 32768);
                  }
                  if (value >= 0)  {
                     writeUInt16(buffer, value, offset, isBigEndian, noAssert);
                  }
                   else  {
                     writeUInt16(buffer, 65535 + value + 1, offset, isBigEndian, noAssert);
                  }
               }
;
               Buffer.prototype.writeInt16LE = function(value, offset, noAssert)  {
                  writeInt16(this, value, offset, false, noAssert);
               }
;
               Buffer.prototype.writeInt16BE = function(value, offset, noAssert)  {
                  writeInt16(this, value, offset, true, noAssert);
               }
;
               function writeInt32(buffer, value, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 3 < buffer.length, "Trying to write beyond buffer length");
                     verifsint(value, 2147483647, - 2147483648);
                  }
                  if (value >= 0)  {
                     writeUInt32(buffer, value, offset, isBigEndian, noAssert);
                  }
                   else  {
                     writeUInt32(buffer, 4294967295 + value + 1, offset, isBigEndian, noAssert);
                  }
               }
;
               Buffer.prototype.writeInt32LE = function(value, offset, noAssert)  {
                  writeInt32(this, value, offset, false, noAssert);
               }
;
               Buffer.prototype.writeInt32BE = function(value, offset, noAssert)  {
                  writeInt32(this, value, offset, true, noAssert);
               }
;
               function writeFloat(buffer, value, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 3 < buffer.length, "Trying to write beyond buffer length");
                     verifIEEE754(value, 3.4028234663852886e+38, - 3.4028234663852886e+38);
                  }
                  require("./buffer_ieee754").writeIEEE754(buffer, value, offset, isBigEndian, 23, 4);
               }
;
               Buffer.prototype.writeFloatLE = function(value, offset, noAssert)  {
                  writeFloat(this, value, offset, false, noAssert);
               }
;
               Buffer.prototype.writeFloatBE = function(value, offset, noAssert)  {
                  writeFloat(this, value, offset, true, noAssert);
               }
;
               function writeDouble(buffer, value, offset, isBigEndian, noAssert)  {
                  if (! noAssert)  {
                     assert.ok(value !== undefined && value !== null, "missing value");
                     assert.ok(typeof isBigEndian === "boolean", "missing or invalid endian");
                     assert.ok(offset !== undefined && offset !== null, "missing offset");
                     assert.ok(offset + 7 < buffer.length, "Trying to write beyond buffer length");
                     verifIEEE754(value, 1.7976931348623157e+308, - 1.7976931348623157e+308);
                  }
                  require("./buffer_ieee754").writeIEEE754(buffer, value, offset, isBigEndian, 52, 8);
               }
;
               Buffer.prototype.writeDoubleLE = function(value, offset, noAssert)  {
                  writeDouble(this, value, offset, false, noAssert);
               }
;
               Buffer.prototype.writeDoubleBE = function(value, offset, noAssert)  {
                  writeDouble(this, value, offset, true, noAssert);
               }
;
               SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
               SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
               SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
               SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
               SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
               SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
               SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
               SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
               SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
               SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
               SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
               SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
               SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
               SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
               SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
               SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
               SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
               SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
               SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
               SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
               SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
               SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
               SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
               SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
               SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
               SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
               SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
               SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;
            }
();
         }
,  {
            assert:12, 
            ./buffer_ieee754:14, 
            base64-js:15         }
], 
         :[function(require, module, exports)  {
            function(exports)  {
               "use strict";
               var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
               function b64ToByteArray(b64)  {
                  var i, j, l, tmp, placeHolders, arr;
                  if (b64.length % 4 > 0)  {
                     throw "Invalid string. Length must be a multiple of 4";
                  }
                  placeHolders = b64.indexOf("=");
                  placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;
                  arr = [];
                  l = placeHolders > 0 ? b64.length - 4 : b64.length;
                  for (i = 0, j = 0; i < l; i = 4, j = 3)  {
                        tmp = lookup.indexOf(b64[i]) << 18 | lookup.indexOf(b64[i + 1]) << 12 | lookup.indexOf(b64[i + 2]) << 6 | lookup.indexOf(b64[i + 3]);
                        arr.push(tmp & 16711680 >> 16);
                        arr.push(tmp & 65280 >> 8);
                        arr.push(tmp & 255);
                     }
                  if (placeHolders === 2)  {
                     tmp = lookup.indexOf(b64[i]) << 2 | lookup.indexOf(b64[i + 1]) >> 4;
                     arr.push(tmp & 255);
                  }
                   else if (placeHolders === 1)  {
                     tmp = lookup.indexOf(b64[i]) << 10 | lookup.indexOf(b64[i + 1]) << 4 | lookup.indexOf(b64[i + 2]) >> 2;
                     arr.push(tmp >> 8 & 255);
                     arr.push(tmp & 255);
                  }
                  return arr;
               }
;
               function uint8ToBase64(uint8)  {
                  var i, extraBytes = uint8.length % 3, output = "", temp, length;
                  function tripletToBase64(num)  {
                     return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
                  }
;
                  ;
                  for (i = 0, length = uint8.length - extraBytes; i < length; i = 3)  {
                        temp = uint8[i] << 16 + uint8[i + 1] << 8 + uint8[i + 2];
                        output = tripletToBase64(temp);
                     }
                  switch(extraBytes) {
                     case 1:
 
                           temp = uint8[uint8.length - 1];
                           output = lookup[temp >> 2];
                           output = lookup[temp << 4 & 63];
                           output = "==";
                           break;
                        
                     case 2:
 
                           temp = uint8[uint8.length - 2] << 8 + uint8[uint8.length - 1];
                           output = lookup[temp >> 10];
                           output = lookup[temp >> 4 & 63];
                           output = lookup[temp << 2 & 63];
                           output = "=";
                           break;
                        
}
;
                  return output;
               }
;
               module.exports.toByteArray = b64ToByteArray;
               module.exports.fromByteArray = uint8ToBase64;
            }
();
         }
,  {} ]      }, 
       {} , ["B01lSJ"]);
   JSHINT = require("jshint").JSHINT;
}
();
function(args)  {
   "use strict";
   var filenames = [];
   var optstr;
   var predef;
   var opts =  {} ;
   var retval = 0;
   args.forEach(function(arg)  {
         if (arg.indexOf("=") > - 1)  {
            if (! optstr)  {
               optstr = arg;
            }
             else  {
               predef = arg;
            }
            return ;
         }
         if (optstr)  {
            predef = arg;
            return ;
         }
         filenames.push(arg);
      }
   );
   if (filenames.length === 0)  {
      print("Usage: jshint.js file.js");
      quit(1);
   }
   if (optstr)  {
      optstr.split(",").forEach(function(arg)  {
            var o = arg.split("=");
            if (o[0] === "indent")  {
               opts[o[0]] = parseInt(o[1], 10);
            }
             else  {
               opts[o[0]] = function(ov)  {
                  switch(ov) {
                     case "true":
 
                           return true;
                        
                     case "false":
 
                           return false;
                        
                     default:
 
                           return ov;
                        
}
;
               }
(o[1]);
            }
         }
      );
   }
   if (predef)  {
      opts.predef =  {} ;
      predef.split(",").forEach(function(arg)  {
            var global = arg.split("=");
            opts.predef[global[0]] = global[1] === "true" ? true : false;
         }
      );
   }
   filenames.forEach(function(name)  {
         var input = readFile(name);
         if (! input)  {
            print("jshint: Couldn't open file " + name);
            quit(1);
         }
         if (! JSHINT(input, opts))  {
            for (var i = 0, err; err = JSHINT.errors[i]; i = 1)  {
                  print(err.reason + " (" + name + ":" + err.line + ":" + err.character + ")");
                  print("> " + err.evidence || "".replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
                  print("");
               }
            retval = 1;
         }
      }
   );
   quit(retval);
}
(arguments);
