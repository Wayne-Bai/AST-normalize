//  ********** Library dart:core **************
//  ********** Natives dart:core **************
function $defProp(obj, prop, value) {
  Object.defineProperty(obj, prop,
      {value: value, enumerable: false, writable: true, configurable: true});
}
$defProp(Object.prototype, '$typeNameOf', function() {
  if ((typeof(window) != 'undefined' && window.constructor.name == 'DOMWindow')
      || typeof(process) != 'undefined') { // fast-path for Chrome and Node
    return this.constructor.name;
  }
  var str = Object.prototype.toString.call(this);
  str = str.substring(8, str.length - 1);
  if (str == 'Window') {
    str = 'DOMWindow';
  } else if (str == 'Document') {
    str = 'HTMLDocument';
  }
  return str;
});
function $throw(e) {
  // If e is not a value, we can use V8's captureStackTrace utility method.
  // TODO(jmesserly): capture the stack trace on other JS engines.
  if (e && (typeof e == 'object') && Error.captureStackTrace) {
    // TODO(jmesserly): this will clobber the e.stack property
    Error.captureStackTrace(e, $throw);
  }
  throw e;
}
$defProp(Object.prototype, '$index', function(i) {
  var proto = Object.getPrototypeOf(this);
  if (proto !== Object) {
    proto.$index = function(i) { return this[i]; }
  }
  return this[i];
});
$defProp(Array.prototype, '$index', function(index) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i];
});
$defProp(String.prototype, '$index', function(i) {
  return this[i];
});
function $wrap_call$1(fn) { return fn; }
function $add(x, y) {
  return ((typeof(x) == 'number' && typeof(y) == 'number') ||
          (typeof(x) == 'string'))
    ? x + y : x.$add(y);
}
function $mul(x, y) {
  return (typeof(x) == 'number' && typeof(y) == 'number')
    ? x * y : x.$mul(y);
}
function $sub(x, y) {
  return (typeof(x) == 'number' && typeof(y) == 'number')
    ? x - y : x.$sub(y);
}
$defProp(Object.prototype, "get$typeName", Object.prototype.$typeNameOf);
// ********** Code for Object **************
$defProp(Object.prototype, "get$dynamic", function() {
  "use strict"; return this;
});
$defProp(Object.prototype, "noSuchMethod", function(name, args) {
  $throw(new NoSuchMethodException(this, name, args));
});
$defProp(Object.prototype, "getContext$0", function() {
  return this.noSuchMethod("getContext", []);
});
$defProp(Object.prototype, "rotate$1", function($0) {
  return this.noSuchMethod("rotate", [$0]);
});
$defProp(Object.prototype, "scale$2", function($0, $1) {
  return this.noSuchMethod("scale", [$0, $1]);
});
$defProp(Object.prototype, "translate$2", function($0, $1) {
  return this.noSuchMethod("translate", [$0, $1]);
});
$defProp(Object.prototype, "webkitRequestAnimationFrame$2", function($0, $1) {
  return this.noSuchMethod("webkitRequestAnimationFrame", [$0, $1]);
});
// ********** Code for IndexOutOfRangeException **************
function IndexOutOfRangeException(_index) {
  this._index = _index;
}
IndexOutOfRangeException.prototype.is$IndexOutOfRangeException = function(){return true};
IndexOutOfRangeException.prototype.toString = function() {
  return ("IndexOutOfRangeException: " + this._index);
}
// ********** Code for NoSuchMethodException **************
function NoSuchMethodException(_receiver, _functionName, _arguments) {
  this._receiver = _receiver;
  this._functionName = _functionName;
  this._arguments = _arguments;
}
NoSuchMethodException.prototype.toString = function() {
  var sb = new StringBufferImpl("");
  for (var i = (0);
   i < this._arguments.get$length(); i++) {
    if (i > (0)) {
      sb.add(", ");
    }
    sb.add(this._arguments.$index(i));
  }
  sb.add("]");
  return $add(("NoSuchMethodException - receiver: '" + this._receiver + "' "), ("function name: '" + this._functionName + "' arguments: [" + sb + "]"));
}
// ********** Code for ClosureArgumentMismatchException **************
function ClosureArgumentMismatchException() {

}
ClosureArgumentMismatchException.prototype.toString = function() {
  return "Closure argument mismatch";
}
// ********** Code for IllegalArgumentException **************
function IllegalArgumentException(args) {
  this._args = args;
}
IllegalArgumentException.prototype.is$IllegalArgumentException = function(){return true};
IllegalArgumentException.prototype.toString = function() {
  return ("Illegal argument(s): " + this._args);
}
// ********** Code for UnsupportedOperationException **************
function UnsupportedOperationException(_message) {
  this._message = _message;
}
UnsupportedOperationException.prototype.toString = function() {
  return ("UnsupportedOperationException: " + this._message);
}
// ********** Code for dart_core_Function **************
Function.prototype.to$call$0 = function() {
  this.call$0 = this._genStub(0);
  this.to$call$0 = function() { return this.call$0; };
  return this.call$0;
};
Function.prototype.call$0 = function() {
  return this.to$call$0()();
};
function to$call$0(f) { return f && f.to$call$0(); }
Function.prototype.to$call$1 = function() {
  this.call$1 = this._genStub(1);
  this.to$call$1 = function() { return this.call$1; };
  return this.call$1;
};
Function.prototype.call$1 = function($0) {
  return this.to$call$1()($0);
};
function to$call$1(f) { return f && f.to$call$1(); }
Function.prototype.to$call$2 = function() {
  this.call$2 = this._genStub(2);
  this.to$call$2 = function() { return this.call$2; };
  return this.call$2;
};
Function.prototype.call$2 = function($0, $1) {
  return this.to$call$2()($0, $1);
};
function to$call$2(f) { return f && f.to$call$2(); }
// ********** Code for Math **************
// ********** Code for top level **************
//  ********** Library dart:coreimpl **************
// ********** Code for ListFactory **************
ListFactory = Array;
$defProp(ListFactory.prototype, "get$length", function() { return this.length; });
$defProp(ListFactory.prototype, "set$length", function(value) { return this.length = value; });
$defProp(ListFactory.prototype, "add", function(value) {
  this.push(value);
});
$defProp(ListFactory.prototype, "clear", function() {
  this.set$length((0));
});
// ********** Code for NumImplementation **************
NumImplementation = Number;
NumImplementation.prototype.abs = function() {
  'use strict'; return Math.abs(this);
}
// ********** Code for StringBufferImpl **************
function StringBufferImpl(content) {
  this.clear();
  this.add(content);
}
StringBufferImpl.prototype.add = function(obj) {
  var str = obj.toString();
  if (null == str || str.isEmpty()) return this;
  this._buffer.add(str);
  this._length = this._length + str.length;
  return this;
}
StringBufferImpl.prototype.clear = function() {
  this._buffer = new Array();
  this._length = (0);
  return this;
}
StringBufferImpl.prototype.toString = function() {
  if (this._buffer.get$length() == (0)) return "";
  if (this._buffer.get$length() == (1)) return this._buffer.$index((0));
  var result = StringBase.concatAll(this._buffer);
  this._buffer.clear();
  this._buffer.add(result);
  return result;
}
// ********** Code for StringBase **************
function StringBase() {}
StringBase.join = function(strings, separator) {
  if (strings.get$length() == (0)) return "";
  var s = strings.$index((0));
  for (var i = (1);
   i < strings.get$length(); i++) {
    s = $add($add(s, separator), strings.$index(i));
  }
  return s;
}
StringBase.concatAll = function(strings) {
  return StringBase.join(strings, "");
}
// ********** Code for StringImplementation **************
StringImplementation = String;
StringImplementation.prototype.isEmpty = function() {
  return this.length == (0);
}
// ********** Code for _Worker **************
// ********** Code for _ArgumentMismatchException **************
/** Implements extends for Dart classes on JavaScript prototypes. */
function $inherits(child, parent) {
  if (child.prototype.__proto__) {
    child.prototype.__proto__ = parent.prototype;
  } else {
    function tmp() {};
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
  }
}
$inherits(_ArgumentMismatchException, ClosureArgumentMismatchException);
function _ArgumentMismatchException(_message) {
  this._dart_coreimpl_message = _message;
  ClosureArgumentMismatchException.call(this);
}
_ArgumentMismatchException.prototype.toString = function() {
  return ("Closure argument mismatch: " + this._dart_coreimpl_message);
}
// ********** Code for _FunctionImplementation **************
_FunctionImplementation = Function;
_FunctionImplementation.prototype._genStub = function(argsLength, names) {
      // Fast path #1: if no named arguments and arg count matches
      if (this.length == argsLength && !names) {
        return this;
      }

      var paramsNamed = this.$optional ? (this.$optional.length / 2) : 0;
      var paramsBare = this.length - paramsNamed;
      var argsNamed = names ? names.length : 0;
      var argsBare = argsLength - argsNamed;

      // Check we got the right number of arguments
      if (argsBare < paramsBare || argsLength > this.length ||
          argsNamed > paramsNamed) {
        return function() {
          $throw(new _ArgumentMismatchException(
            'Wrong number of arguments to function. Expected ' + paramsBare +
            ' positional arguments and at most ' + paramsNamed +
            ' named arguments, but got ' + argsBare +
            ' positional arguments and ' + argsNamed + ' named arguments.'));
        };
      }

      // First, fill in all of the default values
      var p = new Array(paramsBare);
      if (paramsNamed) {
        p = p.concat(this.$optional.slice(paramsNamed));
      }
      // Fill in positional args
      var a = new Array(argsLength);
      for (var i = 0; i < argsBare; i++) {
        p[i] = a[i] = '$' + i;
      }
      // Then overwrite with supplied values for optional args
      var lastParameterIndex;
      var namesInOrder = true;
      for (var i = 0; i < argsNamed; i++) {
        var name = names[i];
        a[i + argsBare] = name;
        var j = this.$optional.indexOf(name);
        if (j < 0 || j >= paramsNamed) {
          return function() {
            $throw(new _ArgumentMismatchException(
              'Named argument "' + name + '" was not expected by function.' +
              ' Did you forget to mark the function parameter [optional]?'));
          };
        } else if (lastParameterIndex && lastParameterIndex > j) {
          namesInOrder = false;
        }
        p[j + paramsBare] = name;
        lastParameterIndex = j;
      }

      if (this.length == argsLength && namesInOrder) {
        // Fast path #2: named arguments, but they're in order and all supplied.
        return this;
      }

      // Note: using Function instead of 'eval' to get a clean scope.
      // TODO(jmesserly): evaluate the performance of these stubs.
      var f = 'function(' + a.join(',') + '){return $f(' + p.join(',') + ');}';
      return new Function('$f', 'return ' + f + '').call(null, this);
    
}
// ********** Code for top level **************
//  ********** Library dom **************
// ********** Code for DOMTypeJs **************
function $dynamic(name) {
  var f = Object.prototype[name];
  if (f && f.methods) return f.methods;

  var methods = {};
  if (f) methods.Object = f;
  function $dynamicBind() {
    // Find the target method
    var obj = this;
    var tag = obj.$typeNameOf();
    var method = methods[tag];
    if (!method) {
      var table = $dynamicMetadata;
      for (var i = 0; i < table.length; i++) {
        var entry = table[i];
        if (entry.map.hasOwnProperty(tag)) {
          method = methods[entry.tag];
          if (method) break;
        }
      }
    }
    method = method || methods.Object;
    var proto = Object.getPrototypeOf(obj);
    if (!proto.hasOwnProperty(name)) {
      $defProp(proto, name, method);
    }

    return method.apply(this, Array.prototype.slice.call(arguments));
  };
  $dynamicBind.methods = methods;
  $defProp(Object.prototype, name, $dynamicBind);
  return methods;
}
if (typeof $dynamicMetadata == 'undefined') $dynamicMetadata = [];

function $dynamicSetMetadata(inputTable) {
  // TODO: Deal with light isolates.
  var table = [];
  for (var i = 0; i < inputTable.length; i++) {
    var tag = inputTable[i][0];
    var tags = inputTable[i][1];
    var map = {};
    var tagNames = tags.split('|');
    for (var j = 0; j < tagNames.length; j++) {
      map[tagNames[j]] = true;
    }
    table.push({tag: tag, tags: tags, map: map});
  }
  $dynamicMetadata = table;
}
$dynamic("get$dartObjectLocalStorage").DOMType = function() { return this.dartObjectLocalStorage; };
$dynamic("set$dartObjectLocalStorage").DOMType = function(value) { return this.dartObjectLocalStorage = value; };
// ********** Code for AbstractWorkerJs **************
// ********** Code for ArrayBufferJs **************
// ********** Code for ArrayBufferViewJs **************
// ********** Code for NodeJs **************
$dynamic("get$parentNode").Node = function() {
  return this.parentNode;
}
// ********** Code for AttrJs **************
$dynamic("set$value").Attr = function(value) {
  this.value = value;
}
// ********** Code for AudioBufferJs **************
// ********** Code for AudioNodeJs **************
// ********** Code for AudioSourceNodeJs **************
// ********** Code for AudioBufferSourceNodeJs **************
// ********** Code for AudioChannelMergerJs **************
// ********** Code for AudioChannelSplitterJs **************
// ********** Code for AudioContextJs **************
// ********** Code for AudioDestinationNodeJs **************
// ********** Code for AudioParamJs **************
$dynamic("set$value").AudioParam = function(value) {
  this.value = value;
}
// ********** Code for AudioGainJs **************
// ********** Code for AudioGainNodeJs **************
// ********** Code for AudioListenerJs **************
// ********** Code for AudioPannerNodeJs **************
// ********** Code for EventJs **************
// ********** Code for AudioProcessingEventJs **************
// ********** Code for BarInfoJs **************
// ********** Code for BeforeLoadEventJs **************
// ********** Code for BiquadFilterNodeJs **************
// ********** Code for BlobJs **************
// ********** Code for CharacterDataJs **************
// ********** Code for TextJs **************
// ********** Code for CDATASectionJs **************
// ********** Code for CSSRuleJs **************
// ********** Code for CSSCharsetRuleJs **************
// ********** Code for CSSFontFaceRuleJs **************
// ********** Code for CSSImportRuleJs **************
// ********** Code for CSSMediaRuleJs **************
// ********** Code for CSSPageRuleJs **************
// ********** Code for CSSValueJs **************
// ********** Code for CSSPrimitiveValueJs **************
// ********** Code for CSSRuleListJs **************
// ********** Code for CSSStyleDeclarationJs **************
// ********** Code for CSSStyleRuleJs **************
// ********** Code for StyleSheetJs **************
// ********** Code for CSSStyleSheetJs **************
// ********** Code for CSSUnknownRuleJs **************
// ********** Code for CSSValueListJs **************
// ********** Code for CanvasGradientJs **************
// ********** Code for CanvasPatternJs **************
// ********** Code for CanvasPixelArrayJs **************
$dynamic("get$length").CanvasPixelArray = function() {
  return this.length;
}
$dynamic("$index").CanvasPixelArray = function(index) {
  return this[index];
}
$dynamic("add").CanvasPixelArray = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for CanvasRenderingContextJs **************
// ********** Code for CanvasRenderingContext2DJs **************
$dynamic("set$fillStyle").CanvasRenderingContext2D = function(value) {
  this.fillStyle = value;
}
$dynamic("set$lineWidth").CanvasRenderingContext2D = function(value) {
  this.lineWidth = value;
}
$dynamic("rotate$1").CanvasRenderingContext2D = function($0) {
  return this.rotate($0);
};
$dynamic("scale$2").CanvasRenderingContext2D = function($0, $1) {
  return this.scale($0, $1);
};
$dynamic("translate$2").CanvasRenderingContext2D = function($0, $1) {
  return this.translate($0, $1);
};
// ********** Code for ClientRectJs **************
$dynamic("get$height").ClientRect = function() {
  return this.height;
}
$dynamic("get$width").ClientRect = function() {
  return this.width;
}
// ********** Code for ClientRectListJs **************
// ********** Code for ClipboardJs **************
// ********** Code for CloseEventJs **************
// ********** Code for CommentJs **************
// ********** Code for UIEventJs **************
// ********** Code for CompositionEventJs **************
// ********** Code for ConsoleJs **************
ConsoleJs = (typeof console == 'undefined' ? {} : console);
ConsoleJs.get$dartObjectLocalStorage = function() { return this.dartObjectLocalStorage; };
ConsoleJs.set$dartObjectLocalStorage = function(value) { return this.dartObjectLocalStorage = value; };
// ********** Code for ConvolverNodeJs **************
// ********** Code for CoordinatesJs **************
// ********** Code for CounterJs **************
// ********** Code for CryptoJs **************
// ********** Code for CustomEventJs **************
// ********** Code for DOMApplicationCacheJs **************
// ********** Code for DOMExceptionJs **************
// ********** Code for DOMFileSystemJs **************
// ********** Code for DOMFileSystemSyncJs **************
// ********** Code for DOMFormDataJs **************
// ********** Code for DOMImplementationJs **************
// ********** Code for DOMMimeTypeJs **************
// ********** Code for DOMMimeTypeArrayJs **************
// ********** Code for DOMParserJs **************
// ********** Code for DOMPluginJs **************
// ********** Code for DOMPluginArrayJs **************
// ********** Code for DOMSelectionJs **************
// ********** Code for DOMTokenListJs **************
// ********** Code for DOMSettableTokenListJs **************
$dynamic("set$value").DOMSettableTokenList = function(value) {
  this.value = value;
}
// ********** Code for DOMURLJs **************
// ********** Code for DOMWindowJs **************
$dynamic("webkitRequestAnimationFrame$2").DOMWindow = function($0, $1) {
  return this.webkitRequestAnimationFrame($wrap_call$1(to$call$1($0)), $1);
};
// ********** Code for DataTransferItemJs **************
// ********** Code for DataTransferItemListJs **************
// ********** Code for DataViewJs **************
// ********** Code for DatabaseJs **************
// ********** Code for DatabaseSyncJs **************
// ********** Code for WorkerContextJs **************
// ********** Code for DedicatedWorkerContextJs **************
// ********** Code for DelayNodeJs **************
// ********** Code for DeviceMotionEventJs **************
// ********** Code for DeviceOrientationEventJs **************
// ********** Code for EntryJs **************
// ********** Code for DirectoryEntryJs **************
// ********** Code for EntrySyncJs **************
// ********** Code for DirectoryEntrySyncJs **************
// ********** Code for DirectoryReaderJs **************
// ********** Code for DirectoryReaderSyncJs **************
// ********** Code for DocumentJs **************
$dynamic("get$defaultView").Document = function() {
  return this.defaultView;
}
$dynamic("get$documentElement").Document = function() {
  return this.documentElement;
}
// ********** Code for DocumentFragmentJs **************
// ********** Code for DocumentTypeJs **************
// ********** Code for DynamicsCompressorNodeJs **************
// ********** Code for ElementJs **************
// ********** Code for ElementTimeControlJs **************
// ********** Code for ElementTraversalJs **************
// ********** Code for EntityJs **************
// ********** Code for EntityReferenceJs **************
// ********** Code for EntryArrayJs **************
// ********** Code for EntryArraySyncJs **************
// ********** Code for ErrorEventJs **************
// ********** Code for EventExceptionJs **************
// ********** Code for EventSourceJs **************
// ********** Code for EventTargetJs **************
// ********** Code for FileJs **************
// ********** Code for FileEntryJs **************
// ********** Code for FileEntrySyncJs **************
// ********** Code for FileErrorJs **************
// ********** Code for FileExceptionJs **************
// ********** Code for FileListJs **************
// ********** Code for FileReaderJs **************
// ********** Code for FileReaderSyncJs **************
// ********** Code for FileWriterJs **************
// ********** Code for FileWriterSyncJs **************
// ********** Code for Float32ArrayJs **************
var Float32ArrayJs = {};
$dynamic("get$length").Float32Array = function() {
  return this.length;
}
$dynamic("$index").Float32Array = function(index) {
  return this[index];
}
$dynamic("add").Float32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for Float64ArrayJs **************
var Float64ArrayJs = {};
$dynamic("get$length").Float64Array = function() {
  return this.length;
}
$dynamic("$index").Float64Array = function(index) {
  return this[index];
}
$dynamic("add").Float64Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for GeolocationJs **************
// ********** Code for GeopositionJs **************
// ********** Code for HTMLAllCollectionJs **************
// ********** Code for HTMLElementJs **************
// ********** Code for HTMLAnchorElementJs **************
// ********** Code for HTMLAppletElementJs **************
$dynamic("get$height").HTMLAppletElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLAppletElement = function() {
  return this.width;
}
// ********** Code for HTMLAreaElementJs **************
// ********** Code for HTMLMediaElementJs **************
// ********** Code for HTMLAudioElementJs **************
// ********** Code for HTMLBRElementJs **************
// ********** Code for HTMLBaseElementJs **************
// ********** Code for HTMLBaseFontElementJs **************
// ********** Code for HTMLBodyElementJs **************
// ********** Code for HTMLButtonElementJs **************
$dynamic("set$value").HTMLButtonElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLCanvasElementJs **************
$dynamic("get$height").HTMLCanvasElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLCanvasElement = function() {
  return this.width;
}
// ********** Code for HTMLCollectionJs **************
$dynamic("get$length").HTMLCollection = function() {
  return this.length;
}
$dynamic("$index").HTMLCollection = function(index) {
  return this[index];
}
$dynamic("add").HTMLCollection = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for HTMLDListElementJs **************
// ********** Code for HTMLDataListElementJs **************
// ********** Code for HTMLDetailsElementJs **************
// ********** Code for HTMLDirectoryElementJs **************
// ********** Code for HTMLDivElementJs **************
// ********** Code for HTMLDocumentJs **************
// ********** Code for HTMLEmbedElementJs **************
$dynamic("get$height").HTMLEmbedElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLEmbedElement = function() {
  return this.width;
}
// ********** Code for HTMLFieldSetElementJs **************
// ********** Code for HTMLFontElementJs **************
// ********** Code for HTMLFormElementJs **************
// ********** Code for HTMLFrameElementJs **************
$dynamic("get$height").HTMLFrameElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLFrameElement = function() {
  return this.width;
}
// ********** Code for HTMLFrameSetElementJs **************
// ********** Code for HTMLHRElementJs **************
$dynamic("get$width").HTMLHRElement = function() {
  return this.width;
}
// ********** Code for HTMLHeadElementJs **************
// ********** Code for HTMLHeadingElementJs **************
// ********** Code for HTMLHtmlElementJs **************
// ********** Code for HTMLIFrameElementJs **************
$dynamic("get$height").HTMLIFrameElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLIFrameElement = function() {
  return this.width;
}
// ********** Code for HTMLImageElementJs **************
$dynamic("get$height").HTMLImageElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLImageElement = function() {
  return this.width;
}
$dynamic("get$x").HTMLImageElement = function() {
  return this.x;
}
// ********** Code for HTMLInputElementJs **************
$dynamic("set$value").HTMLInputElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLIsIndexElementJs **************
// ********** Code for HTMLKeygenElementJs **************
// ********** Code for HTMLLIElementJs **************
$dynamic("set$value").HTMLLIElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLLabelElementJs **************
// ********** Code for HTMLLegendElementJs **************
// ********** Code for HTMLLinkElementJs **************
// ********** Code for HTMLMapElementJs **************
// ********** Code for HTMLMarqueeElementJs **************
$dynamic("get$height").HTMLMarqueeElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLMarqueeElement = function() {
  return this.width;
}
// ********** Code for HTMLMenuElementJs **************
// ********** Code for HTMLMetaElementJs **************
// ********** Code for HTMLMeterElementJs **************
$dynamic("set$value").HTMLMeterElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLModElementJs **************
// ********** Code for HTMLOListElementJs **************
// ********** Code for HTMLObjectElementJs **************
$dynamic("get$height").HTMLObjectElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLObjectElement = function() {
  return this.width;
}
// ********** Code for HTMLOptGroupElementJs **************
// ********** Code for HTMLOptionElementJs **************
$dynamic("set$value").HTMLOptionElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLOptionsCollectionJs **************
$dynamic("get$length").HTMLOptionsCollection = function() {
  return this.length;
}
// ********** Code for HTMLOutputElementJs **************
$dynamic("set$value").HTMLOutputElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLParagraphElementJs **************
// ********** Code for HTMLParamElementJs **************
$dynamic("set$value").HTMLParamElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLPreElementJs **************
$dynamic("get$width").HTMLPreElement = function() {
  return this.width;
}
// ********** Code for HTMLProgressElementJs **************
$dynamic("set$value").HTMLProgressElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLPropertiesCollectionJs **************
$dynamic("get$length").HTMLPropertiesCollection = function() {
  return this.length;
}
// ********** Code for HTMLQuoteElementJs **************
// ********** Code for HTMLScriptElementJs **************
// ********** Code for HTMLSelectElementJs **************
$dynamic("set$value").HTMLSelectElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLSourceElementJs **************
// ********** Code for HTMLSpanElementJs **************
// ********** Code for HTMLStyleElementJs **************
// ********** Code for HTMLTableCaptionElementJs **************
// ********** Code for HTMLTableCellElementJs **************
$dynamic("get$height").HTMLTableCellElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLTableCellElement = function() {
  return this.width;
}
// ********** Code for HTMLTableColElementJs **************
$dynamic("get$width").HTMLTableColElement = function() {
  return this.width;
}
// ********** Code for HTMLTableElementJs **************
$dynamic("get$width").HTMLTableElement = function() {
  return this.width;
}
// ********** Code for HTMLTableRowElementJs **************
// ********** Code for HTMLTableSectionElementJs **************
// ********** Code for HTMLTextAreaElementJs **************
$dynamic("set$value").HTMLTextAreaElement = function(value) {
  this.value = value;
}
// ********** Code for HTMLTitleElementJs **************
// ********** Code for HTMLTrackElementJs **************
// ********** Code for HTMLUListElementJs **************
// ********** Code for HTMLUnknownElementJs **************
// ********** Code for HTMLVideoElementJs **************
$dynamic("get$height").HTMLVideoElement = function() {
  return this.height;
}
$dynamic("get$width").HTMLVideoElement = function() {
  return this.width;
}
// ********** Code for HashChangeEventJs **************
// ********** Code for HighPass2FilterNodeJs **************
// ********** Code for HistoryJs **************
// ********** Code for IDBAnyJs **************
// ********** Code for IDBCursorJs **************
// ********** Code for IDBCursorWithValueJs **************
// ********** Code for IDBDatabaseJs **************
// ********** Code for IDBDatabaseErrorJs **************
// ********** Code for IDBDatabaseExceptionJs **************
// ********** Code for IDBFactoryJs **************
// ********** Code for IDBIndexJs **************
// ********** Code for IDBKeyJs **************
// ********** Code for IDBKeyRangeJs **************
// ********** Code for IDBObjectStoreJs **************
// ********** Code for IDBRequestJs **************
// ********** Code for IDBTransactionJs **************
// ********** Code for IDBVersionChangeEventJs **************
// ********** Code for IDBVersionChangeRequestJs **************
// ********** Code for ImageDataJs **************
$dynamic("get$height").ImageData = function() {
  return this.height;
}
$dynamic("get$width").ImageData = function() {
  return this.width;
}
// ********** Code for InjectedScriptHostJs **************
// ********** Code for InspectorFrontendHostJs **************
// ********** Code for Int16ArrayJs **************
var Int16ArrayJs = {};
$dynamic("get$length").Int16Array = function() {
  return this.length;
}
$dynamic("$index").Int16Array = function(index) {
  return this[index];
}
$dynamic("add").Int16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for Int32ArrayJs **************
var Int32ArrayJs = {};
$dynamic("get$length").Int32Array = function() {
  return this.length;
}
$dynamic("$index").Int32Array = function(index) {
  return this[index];
}
$dynamic("add").Int32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for Int8ArrayJs **************
var Int8ArrayJs = {};
$dynamic("get$length").Int8Array = function() {
  return this.length;
}
$dynamic("$index").Int8Array = function(index) {
  return this[index];
}
$dynamic("add").Int8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for JavaScriptAudioNodeJs **************
// ********** Code for JavaScriptCallFrameJs **************
// ********** Code for KeyboardEventJs **************
// ********** Code for LocationJs **************
// ********** Code for LowPass2FilterNodeJs **************
// ********** Code for MediaControllerJs **************
// ********** Code for MediaElementAudioSourceNodeJs **************
// ********** Code for MediaErrorJs **************
// ********** Code for MediaListJs **************
$dynamic("get$length").MediaList = function() {
  return this.length;
}
$dynamic("$index").MediaList = function(index) {
  return this[index];
}
$dynamic("add").MediaList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for MediaQueryListJs **************
// ********** Code for MediaQueryListListenerJs **************
// ********** Code for MemoryInfoJs **************
// ********** Code for MessageChannelJs **************
// ********** Code for MessageEventJs **************
// ********** Code for MessagePortJs **************
// ********** Code for MetadataJs **************
// ********** Code for MouseEventJs **************
$dynamic("get$x").MouseEvent = function() {
  return this.x;
}
// ********** Code for MutationCallbackJs **************
// ********** Code for MutationEventJs **************
// ********** Code for MutationRecordJs **************
// ********** Code for NamedNodeMapJs **************
$dynamic("get$length").NamedNodeMap = function() {
  return this.length;
}
$dynamic("$index").NamedNodeMap = function(index) {
  return this[index];
}
$dynamic("add").NamedNodeMap = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for NavigatorJs **************
// ********** Code for NodeFilterJs **************
// ********** Code for NodeIteratorJs **************
// ********** Code for NodeListJs **************
$dynamic("get$length").NodeList = function() {
  return this.length;
}
$dynamic("$index").NodeList = function(index) {
  return this[index];
}
$dynamic("add").NodeList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for NodeSelectorJs **************
// ********** Code for NotationJs **************
// ********** Code for NotificationJs **************
// ********** Code for NotificationCenterJs **************
// ********** Code for OESStandardDerivativesJs **************
// ********** Code for OESTextureFloatJs **************
// ********** Code for OESVertexArrayObjectJs **************
// ********** Code for OfflineAudioCompletionEventJs **************
// ********** Code for OperationNotAllowedExceptionJs **************
// ********** Code for OverflowEventJs **************
// ********** Code for PageTransitionEventJs **************
// ********** Code for PerformanceJs **************
// ********** Code for PerformanceNavigationJs **************
// ********** Code for PerformanceTimingJs **************
// ********** Code for PointerLockJs **************
// ********** Code for PopStateEventJs **************
// ********** Code for PositionErrorJs **************
// ********** Code for ProcessingInstructionJs **************
// ********** Code for ProgressEventJs **************
// ********** Code for RGBColorJs **************
// ********** Code for RangeJs **************
// ********** Code for RangeExceptionJs **************
// ********** Code for RealtimeAnalyserNodeJs **************
// ********** Code for RectJs **************
// ********** Code for SQLErrorJs **************
// ********** Code for SQLExceptionJs **************
// ********** Code for SQLResultSetJs **************
// ********** Code for SQLResultSetRowListJs **************
// ********** Code for SQLTransactionJs **************
// ********** Code for SQLTransactionSyncJs **************
// ********** Code for SVGElementJs **************
// ********** Code for SVGAElementJs **************
// ********** Code for SVGAltGlyphDefElementJs **************
// ********** Code for SVGTextContentElementJs **************
// ********** Code for SVGTextPositioningElementJs **************
$dynamic("get$x").SVGTextPositioningElement = function() {
  return this.x;
}
// ********** Code for SVGAltGlyphElementJs **************
// ********** Code for SVGAltGlyphItemElementJs **************
// ********** Code for SVGAngleJs **************
$dynamic("set$value").SVGAngle = function(value) {
  this.value = value;
}
// ********** Code for SVGAnimationElementJs **************
// ********** Code for SVGAnimateColorElementJs **************
// ********** Code for SVGAnimateElementJs **************
// ********** Code for SVGAnimateMotionElementJs **************
// ********** Code for SVGAnimateTransformElementJs **************
// ********** Code for SVGAnimatedAngleJs **************
// ********** Code for SVGAnimatedBooleanJs **************
// ********** Code for SVGAnimatedEnumerationJs **************
// ********** Code for SVGAnimatedIntegerJs **************
// ********** Code for SVGAnimatedLengthJs **************
// ********** Code for SVGAnimatedLengthListJs **************
// ********** Code for SVGAnimatedNumberJs **************
// ********** Code for SVGAnimatedNumberListJs **************
// ********** Code for SVGAnimatedPreserveAspectRatioJs **************
// ********** Code for SVGAnimatedRectJs **************
// ********** Code for SVGAnimatedStringJs **************
// ********** Code for SVGAnimatedTransformListJs **************
// ********** Code for SVGCircleElementJs **************
// ********** Code for SVGClipPathElementJs **************
// ********** Code for SVGColorJs **************
// ********** Code for SVGComponentTransferFunctionElementJs **************
// ********** Code for SVGCursorElementJs **************
$dynamic("get$x").SVGCursorElement = function() {
  return this.x;
}
// ********** Code for SVGDefsElementJs **************
// ********** Code for SVGDescElementJs **************
// ********** Code for SVGDocumentJs **************
$dynamic("get$rootElement").SVGDocument = function() {
  return this.rootElement;
}
// ********** Code for SVGElementInstanceJs **************
$dynamic("get$parentNode").SVGElementInstance = function() {
  return this.parentNode;
}
// ********** Code for SVGElementInstanceListJs **************
// ********** Code for SVGEllipseElementJs **************
// ********** Code for SVGExceptionJs **************
// ********** Code for SVGExternalResourcesRequiredJs **************
// ********** Code for SVGFEBlendElementJs **************
$dynamic("get$height").SVGFEBlendElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEBlendElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEBlendElement = function() {
  return this.x;
}
// ********** Code for SVGFEColorMatrixElementJs **************
$dynamic("get$height").SVGFEColorMatrixElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEColorMatrixElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEColorMatrixElement = function() {
  return this.x;
}
// ********** Code for SVGFEComponentTransferElementJs **************
$dynamic("get$height").SVGFEComponentTransferElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEComponentTransferElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEComponentTransferElement = function() {
  return this.x;
}
// ********** Code for SVGFECompositeElementJs **************
$dynamic("get$height").SVGFECompositeElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFECompositeElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFECompositeElement = function() {
  return this.x;
}
// ********** Code for SVGFEConvolveMatrixElementJs **************
$dynamic("get$height").SVGFEConvolveMatrixElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEConvolveMatrixElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEConvolveMatrixElement = function() {
  return this.x;
}
// ********** Code for SVGFEDiffuseLightingElementJs **************
$dynamic("get$height").SVGFEDiffuseLightingElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEDiffuseLightingElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEDiffuseLightingElement = function() {
  return this.x;
}
// ********** Code for SVGFEDisplacementMapElementJs **************
$dynamic("get$height").SVGFEDisplacementMapElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEDisplacementMapElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEDisplacementMapElement = function() {
  return this.x;
}
// ********** Code for SVGFEDistantLightElementJs **************
// ********** Code for SVGFEDropShadowElementJs **************
$dynamic("get$height").SVGFEDropShadowElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEDropShadowElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEDropShadowElement = function() {
  return this.x;
}
// ********** Code for SVGFEFloodElementJs **************
$dynamic("get$height").SVGFEFloodElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEFloodElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEFloodElement = function() {
  return this.x;
}
// ********** Code for SVGFEFuncAElementJs **************
// ********** Code for SVGFEFuncBElementJs **************
// ********** Code for SVGFEFuncGElementJs **************
// ********** Code for SVGFEFuncRElementJs **************
// ********** Code for SVGFEGaussianBlurElementJs **************
$dynamic("get$height").SVGFEGaussianBlurElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEGaussianBlurElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEGaussianBlurElement = function() {
  return this.x;
}
// ********** Code for SVGFEImageElementJs **************
$dynamic("get$height").SVGFEImageElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEImageElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEImageElement = function() {
  return this.x;
}
// ********** Code for SVGFEMergeElementJs **************
$dynamic("get$height").SVGFEMergeElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEMergeElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEMergeElement = function() {
  return this.x;
}
// ********** Code for SVGFEMergeNodeElementJs **************
// ********** Code for SVGFEMorphologyElementJs **************
$dynamic("get$height").SVGFEMorphologyElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEMorphologyElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEMorphologyElement = function() {
  return this.x;
}
// ********** Code for SVGFEOffsetElementJs **************
$dynamic("get$height").SVGFEOffsetElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFEOffsetElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFEOffsetElement = function() {
  return this.x;
}
// ********** Code for SVGFEPointLightElementJs **************
$dynamic("get$x").SVGFEPointLightElement = function() {
  return this.x;
}
// ********** Code for SVGFESpecularLightingElementJs **************
$dynamic("get$height").SVGFESpecularLightingElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFESpecularLightingElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFESpecularLightingElement = function() {
  return this.x;
}
// ********** Code for SVGFESpotLightElementJs **************
$dynamic("get$x").SVGFESpotLightElement = function() {
  return this.x;
}
// ********** Code for SVGFETileElementJs **************
$dynamic("get$height").SVGFETileElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFETileElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFETileElement = function() {
  return this.x;
}
// ********** Code for SVGFETurbulenceElementJs **************
$dynamic("get$height").SVGFETurbulenceElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFETurbulenceElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFETurbulenceElement = function() {
  return this.x;
}
// ********** Code for SVGFilterElementJs **************
$dynamic("get$height").SVGFilterElement = function() {
  return this.height;
}
$dynamic("get$width").SVGFilterElement = function() {
  return this.width;
}
$dynamic("get$x").SVGFilterElement = function() {
  return this.x;
}
// ********** Code for SVGStylableJs **************
// ********** Code for SVGFilterPrimitiveStandardAttributesJs **************
$dynamic("get$height").SVGFilterPrimitiveStandardAttributes = function() {
  return this.height;
}
$dynamic("get$width").SVGFilterPrimitiveStandardAttributes = function() {
  return this.width;
}
$dynamic("get$x").SVGFilterPrimitiveStandardAttributes = function() {
  return this.x;
}
// ********** Code for SVGFitToViewBoxJs **************
// ********** Code for SVGFontElementJs **************
// ********** Code for SVGFontFaceElementJs **************
// ********** Code for SVGFontFaceFormatElementJs **************
// ********** Code for SVGFontFaceNameElementJs **************
// ********** Code for SVGFontFaceSrcElementJs **************
// ********** Code for SVGFontFaceUriElementJs **************
// ********** Code for SVGForeignObjectElementJs **************
$dynamic("get$height").SVGForeignObjectElement = function() {
  return this.height;
}
$dynamic("get$width").SVGForeignObjectElement = function() {
  return this.width;
}
$dynamic("get$x").SVGForeignObjectElement = function() {
  return this.x;
}
// ********** Code for SVGGElementJs **************
// ********** Code for SVGGlyphElementJs **************
// ********** Code for SVGGlyphRefElementJs **************
$dynamic("get$x").SVGGlyphRefElement = function() {
  return this.x;
}
$dynamic("set$x").SVGGlyphRefElement = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGGlyphRefElement = function(value) {
  this.y = value;
}
// ********** Code for SVGGradientElementJs **************
// ********** Code for SVGHKernElementJs **************
// ********** Code for SVGImageElementJs **************
$dynamic("get$height").SVGImageElement = function() {
  return this.height;
}
$dynamic("get$width").SVGImageElement = function() {
  return this.width;
}
$dynamic("get$x").SVGImageElement = function() {
  return this.x;
}
// ********** Code for SVGLangSpaceJs **************
// ********** Code for SVGLengthJs **************
$dynamic("set$value").SVGLength = function(value) {
  this.value = value;
}
// ********** Code for SVGLengthListJs **************
// ********** Code for SVGLineElementJs **************
// ********** Code for SVGLinearGradientElementJs **************
// ********** Code for SVGLocatableJs **************
// ********** Code for SVGMPathElementJs **************
// ********** Code for SVGMarkerElementJs **************
// ********** Code for SVGMaskElementJs **************
$dynamic("get$height").SVGMaskElement = function() {
  return this.height;
}
$dynamic("get$width").SVGMaskElement = function() {
  return this.width;
}
$dynamic("get$x").SVGMaskElement = function() {
  return this.x;
}
// ********** Code for SVGMatrixJs **************
$dynamic("rotate$1").SVGMatrix = function($0) {
  return this.rotate($0);
};
$dynamic("translate$2").SVGMatrix = function($0, $1) {
  return this.translate($0, $1);
};
// ********** Code for SVGMetadataElementJs **************
// ********** Code for SVGMissingGlyphElementJs **************
// ********** Code for SVGNumberJs **************
$dynamic("set$value").SVGNumber = function(value) {
  this.value = value;
}
// ********** Code for SVGNumberListJs **************
// ********** Code for SVGPaintJs **************
// ********** Code for SVGPathElementJs **************
// ********** Code for SVGPathSegJs **************
// ********** Code for SVGPathSegArcAbsJs **************
$dynamic("get$x").SVGPathSegArcAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegArcAbs = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegArcAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegArcRelJs **************
$dynamic("get$x").SVGPathSegArcRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegArcRel = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegArcRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegClosePathJs **************
// ********** Code for SVGPathSegCurvetoCubicAbsJs **************
$dynamic("get$x").SVGPathSegCurvetoCubicAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoCubicAbs = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoCubicAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegCurvetoCubicRelJs **************
$dynamic("get$x").SVGPathSegCurvetoCubicRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoCubicRel = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoCubicRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegCurvetoCubicSmoothAbsJs **************
$dynamic("get$x").SVGPathSegCurvetoCubicSmoothAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoCubicSmoothAbs = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoCubicSmoothAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegCurvetoCubicSmoothRelJs **************
$dynamic("get$x").SVGPathSegCurvetoCubicSmoothRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoCubicSmoothRel = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoCubicSmoothRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegCurvetoQuadraticAbsJs **************
$dynamic("get$x").SVGPathSegCurvetoQuadraticAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoQuadraticAbs = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoQuadraticAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegCurvetoQuadraticRelJs **************
$dynamic("get$x").SVGPathSegCurvetoQuadraticRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoQuadraticRel = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoQuadraticRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegCurvetoQuadraticSmoothAbsJs **************
$dynamic("get$x").SVGPathSegCurvetoQuadraticSmoothAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoQuadraticSmoothAbs = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoQuadraticSmoothAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegCurvetoQuadraticSmoothRelJs **************
$dynamic("get$x").SVGPathSegCurvetoQuadraticSmoothRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegCurvetoQuadraticSmoothRel = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegCurvetoQuadraticSmoothRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegLinetoAbsJs **************
$dynamic("get$x").SVGPathSegLinetoAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegLinetoAbs = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegLinetoAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegLinetoHorizontalAbsJs **************
$dynamic("get$x").SVGPathSegLinetoHorizontalAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegLinetoHorizontalAbs = function(value) {
  this.x = value;
}
// ********** Code for SVGPathSegLinetoHorizontalRelJs **************
$dynamic("get$x").SVGPathSegLinetoHorizontalRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegLinetoHorizontalRel = function(value) {
  this.x = value;
}
// ********** Code for SVGPathSegLinetoRelJs **************
$dynamic("get$x").SVGPathSegLinetoRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegLinetoRel = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegLinetoRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegLinetoVerticalAbsJs **************
$dynamic("set$y").SVGPathSegLinetoVerticalAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegLinetoVerticalRelJs **************
$dynamic("set$y").SVGPathSegLinetoVerticalRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegListJs **************
// ********** Code for SVGPathSegMovetoAbsJs **************
$dynamic("get$x").SVGPathSegMovetoAbs = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegMovetoAbs = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegMovetoAbs = function(value) {
  this.y = value;
}
// ********** Code for SVGPathSegMovetoRelJs **************
$dynamic("get$x").SVGPathSegMovetoRel = function() {
  return this.x;
}
$dynamic("set$x").SVGPathSegMovetoRel = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPathSegMovetoRel = function(value) {
  this.y = value;
}
// ********** Code for SVGPatternElementJs **************
$dynamic("get$height").SVGPatternElement = function() {
  return this.height;
}
$dynamic("get$width").SVGPatternElement = function() {
  return this.width;
}
$dynamic("get$x").SVGPatternElement = function() {
  return this.x;
}
// ********** Code for SVGPointJs **************
$dynamic("get$x").SVGPoint = function() {
  return this.x;
}
$dynamic("set$x").SVGPoint = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGPoint = function(value) {
  this.y = value;
}
// ********** Code for SVGPointListJs **************
// ********** Code for SVGPolygonElementJs **************
// ********** Code for SVGPolylineElementJs **************
// ********** Code for SVGPreserveAspectRatioJs **************
// ********** Code for SVGRadialGradientElementJs **************
// ********** Code for SVGRectJs **************
$dynamic("get$height").SVGRect = function() {
  return this.height;
}
$dynamic("get$width").SVGRect = function() {
  return this.width;
}
$dynamic("get$x").SVGRect = function() {
  return this.x;
}
$dynamic("set$x").SVGRect = function(value) {
  this.x = value;
}
$dynamic("set$y").SVGRect = function(value) {
  this.y = value;
}
// ********** Code for SVGRectElementJs **************
$dynamic("get$height").SVGRectElement = function() {
  return this.height;
}
$dynamic("get$width").SVGRectElement = function() {
  return this.width;
}
$dynamic("get$x").SVGRectElement = function() {
  return this.x;
}
// ********** Code for SVGRenderingIntentJs **************
// ********** Code for SVGSVGElementJs **************
$dynamic("get$height").SVGSVGElement = function() {
  return this.height;
}
$dynamic("get$width").SVGSVGElement = function() {
  return this.width;
}
$dynamic("get$x").SVGSVGElement = function() {
  return this.x;
}
// ********** Code for SVGScriptElementJs **************
// ********** Code for SVGSetElementJs **************
// ********** Code for SVGStopElementJs **************
// ********** Code for SVGStringListJs **************
// ********** Code for SVGStyleElementJs **************
// ********** Code for SVGSwitchElementJs **************
// ********** Code for SVGSymbolElementJs **************
// ********** Code for SVGTRefElementJs **************
// ********** Code for SVGTSpanElementJs **************
// ********** Code for SVGTestsJs **************
// ********** Code for SVGTextElementJs **************
// ********** Code for SVGTextPathElementJs **************
// ********** Code for SVGTitleElementJs **************
// ********** Code for SVGTransformJs **************
// ********** Code for SVGTransformListJs **************
// ********** Code for SVGTransformableJs **************
// ********** Code for SVGURIReferenceJs **************
// ********** Code for SVGUnitTypesJs **************
// ********** Code for SVGUseElementJs **************
$dynamic("get$height").SVGUseElement = function() {
  return this.height;
}
$dynamic("get$width").SVGUseElement = function() {
  return this.width;
}
$dynamic("get$x").SVGUseElement = function() {
  return this.x;
}
// ********** Code for SVGVKernElementJs **************
// ********** Code for SVGViewElementJs **************
// ********** Code for SVGZoomAndPanJs **************
// ********** Code for SVGViewSpecJs **************
// ********** Code for SVGZoomEventJs **************
// ********** Code for ScreenJs **************
$dynamic("get$height").Screen = function() {
  return this.height;
}
$dynamic("get$width").Screen = function() {
  return this.width;
}
// ********** Code for ScriptProfileJs **************
// ********** Code for ScriptProfileNodeJs **************
// ********** Code for SharedWorkerJs **************
// ********** Code for SharedWorkerContextJs **************
// ********** Code for SpeechInputEventJs **************
// ********** Code for SpeechInputResultJs **************
// ********** Code for SpeechInputResultListJs **************
// ********** Code for StorageJs **************
$dynamic("get$dartObjectLocalStorage").Storage = function() {
      if (this === window.localStorage)
        return window._dartLocalStorageLocalStorage;
      else if (this === window.sessionStorage)
        return window._dartSessionStorageLocalStorage;
      else
        throw new UnsupportedOperationException('Cannot dartObjectLocalStorage for unknown Storage object.');
}
$dynamic("set$dartObjectLocalStorage").Storage = function(value) {
      if (this === window.localStorage)
        window._dartLocalStorageLocalStorage = value;
      else if (this === window.sessionStorage)
        window._dartSessionStorageLocalStorage = value;
      else
        throw new UnsupportedOperationException('Cannot dartObjectLocalStorage for unknown Storage object.');
}
// ********** Code for StorageEventJs **************
// ********** Code for StorageInfoJs **************
// ********** Code for StyleMediaJs **************
// ********** Code for StyleSheetListJs **************
$dynamic("get$length").StyleSheetList = function() {
  return this.length;
}
$dynamic("$index").StyleSheetList = function(index) {
  return this[index];
}
$dynamic("add").StyleSheetList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for TextEventJs **************
// ********** Code for TextMetricsJs **************
$dynamic("get$width").TextMetrics = function() {
  return this.width;
}
// ********** Code for TextTrackJs **************
// ********** Code for TextTrackCueJs **************
// ********** Code for TextTrackCueListJs **************
// ********** Code for TextTrackListJs **************
// ********** Code for TimeRangesJs **************
// ********** Code for TouchJs **************
// ********** Code for TouchEventJs **************
// ********** Code for TouchListJs **************
$dynamic("get$length").TouchList = function() {
  return this.length;
}
$dynamic("$index").TouchList = function(index) {
  return this[index];
}
$dynamic("add").TouchList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for TrackEventJs **************
// ********** Code for TreeWalkerJs **************
$dynamic("get$parentNode").TreeWalker = function() {
  return this.parentNode.bind(this);
}
// ********** Code for Uint16ArrayJs **************
var Uint16ArrayJs = {};
$dynamic("get$length").Uint16Array = function() {
  return this.length;
}
$dynamic("$index").Uint16Array = function(index) {
  return this[index];
}
$dynamic("add").Uint16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for Uint32ArrayJs **************
var Uint32ArrayJs = {};
$dynamic("get$length").Uint32Array = function() {
  return this.length;
}
$dynamic("$index").Uint32Array = function(index) {
  return this[index];
}
$dynamic("add").Uint32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for Uint8ArrayJs **************
var Uint8ArrayJs = {};
$dynamic("get$length").Uint8Array = function() {
  return this.length;
}
$dynamic("$index").Uint8Array = function(index) {
  return this[index];
}
$dynamic("add").Uint8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
// ********** Code for ValidityStateJs **************
// ********** Code for WaveShaperNodeJs **************
// ********** Code for WebGLActiveInfoJs **************
// ********** Code for WebGLBufferJs **************
// ********** Code for WebGLCompressedTexturesJs **************
// ********** Code for WebGLContextAttributesJs **************
// ********** Code for WebGLContextEventJs **************
// ********** Code for WebGLDebugRendererInfoJs **************
// ********** Code for WebGLDebugShadersJs **************
// ********** Code for WebGLFramebufferJs **************
// ********** Code for WebGLLoseContextJs **************
// ********** Code for WebGLProgramJs **************
// ********** Code for WebGLRenderbufferJs **************
// ********** Code for WebGLRenderingContextJs **************
// ********** Code for WebGLShaderJs **************
// ********** Code for WebGLTextureJs **************
// ********** Code for WebGLUniformLocationJs **************
// ********** Code for WebGLVertexArrayObjectOESJs **************
// ********** Code for WebKitAnimationJs **************
// ********** Code for WebKitAnimationEventJs **************
// ********** Code for WebKitAnimationListJs **************
// ********** Code for WebKitBlobBuilderJs **************
// ********** Code for WebKitCSSFilterValueJs **************
// ********** Code for WebKitCSSKeyframeRuleJs **************
// ********** Code for WebKitCSSKeyframesRuleJs **************
// ********** Code for WebKitCSSMatrixJs **************
// ********** Code for WebKitCSSTransformValueJs **************
// ********** Code for WebKitMutationObserverJs **************
// ********** Code for WebKitNamedFlowJs **************
// ********** Code for WebKitPointJs **************
$dynamic("get$x").WebKitPoint = function() {
  return this.x;
}
$dynamic("set$x").WebKitPoint = function(value) {
  this.x = value;
}
$dynamic("set$y").WebKitPoint = function(value) {
  this.y = value;
}
// ********** Code for WebKitTransitionEventJs **************
// ********** Code for WebSocketJs **************
// ********** Code for WheelEventJs **************
$dynamic("get$x").WheelEvent = function() {
  return this.x;
}
// ********** Code for WorkerJs **************
// ********** Code for WorkerLocationJs **************
// ********** Code for WorkerNavigatorJs **************
// ********** Code for XMLHttpRequestJs **************
// ********** Code for XMLHttpRequestExceptionJs **************
// ********** Code for XMLHttpRequestProgressEventJs **************
// ********** Code for XMLHttpRequestUploadJs **************
// ********** Code for XMLSerializerJs **************
// ********** Code for XPathEvaluatorJs **************
// ********** Code for XPathExceptionJs **************
// ********** Code for XPathExpressionJs **************
// ********** Code for XPathNSResolverJs **************
// ********** Code for XPathResultJs **************
// ********** Code for XSLTProcessorJs **************
// ********** Code for dom__Collections **************
function dom__Collections() {}
// ********** Code for _AudioContextFactoryProvider **************
function _AudioContextFactoryProvider() {}
// ********** Code for _FileReaderFactoryProvider **************
function _FileReaderFactoryProvider() {}
// ********** Code for _TypedArrayFactoryProvider **************
function _TypedArrayFactoryProvider() {}
// ********** Code for _WebKitCSSMatrixFactoryProvider **************
function _WebKitCSSMatrixFactoryProvider() {}
// ********** Code for _WebKitPointFactoryProvider **************
function _WebKitPointFactoryProvider() {}
// ********** Code for _WebSocketFactoryProvider **************
function _WebSocketFactoryProvider() {}
// ********** Code for _XMLHttpRequestFactoryProvider **************
function _XMLHttpRequestFactoryProvider() {}
// ********** Code for dom__VariableSizeListIterator **************
function dom__VariableSizeListIterator() {}
// ********** Code for dom__FixedSizeListIterator **************
$inherits(dom__FixedSizeListIterator, dom__VariableSizeListIterator);
function dom__FixedSizeListIterator() {}
// ********** Code for _Lists **************
function _Lists() {}
// ********** Code for top level **************
function get$window() {
  return window;
}
function get$document() {
  return window.document;
}
//  ********** Library htmlimpl **************
// ********** Code for DOMWrapperBase **************
DOMWrapperBase._wrap$ctor = function(_ptr) {
  this._ptr = _ptr;
  this._ptr.set$dartObjectLocalStorage(this);
}
DOMWrapperBase._wrap$ctor.prototype = DOMWrapperBase.prototype;
function DOMWrapperBase() {}
DOMWrapperBase.prototype.get$_ptr = function() { return this._ptr; };
// ********** Code for EventTargetWrappingImplementation **************
$inherits(EventTargetWrappingImplementation, DOMWrapperBase);
EventTargetWrappingImplementation._wrap$ctor = function(ptr) {
  DOMWrapperBase._wrap$ctor.call(this, ptr);
}
EventTargetWrappingImplementation._wrap$ctor.prototype = EventTargetWrappingImplementation.prototype;
function EventTargetWrappingImplementation() {}
// ********** Code for NodeWrappingImplementation **************
$inherits(NodeWrappingImplementation, EventTargetWrappingImplementation);
NodeWrappingImplementation._wrap$ctor = function(ptr) {
  EventTargetWrappingImplementation._wrap$ctor.call(this, ptr);
}
NodeWrappingImplementation._wrap$ctor.prototype = NodeWrappingImplementation.prototype;
function NodeWrappingImplementation() {}
// ********** Code for ElementWrappingImplementation **************
$inherits(ElementWrappingImplementation, NodeWrappingImplementation);
ElementWrappingImplementation._wrap$ctor = function(ptr) {
  NodeWrappingImplementation._wrap$ctor.call(this, ptr);
}
ElementWrappingImplementation._wrap$ctor.prototype = ElementWrappingImplementation.prototype;
function ElementWrappingImplementation() {}
ElementWrappingImplementation.prototype.query = function(selectors) {
  return LevelDom.wrapElement(this._ptr.querySelector(selectors));
}
// ********** Code for AnchorElementWrappingImplementation **************
$inherits(AnchorElementWrappingImplementation, ElementWrappingImplementation);
AnchorElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
AnchorElementWrappingImplementation._wrap$ctor.prototype = AnchorElementWrappingImplementation.prototype;
function AnchorElementWrappingImplementation() {}
AnchorElementWrappingImplementation.prototype.toString = function() {
  return this._ptr.toString();
}
// ********** Code for AreaElementWrappingImplementation **************
$inherits(AreaElementWrappingImplementation, ElementWrappingImplementation);
AreaElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
AreaElementWrappingImplementation._wrap$ctor.prototype = AreaElementWrappingImplementation.prototype;
function AreaElementWrappingImplementation() {}
// ********** Code for MediaElementWrappingImplementation **************
$inherits(MediaElementWrappingImplementation, ElementWrappingImplementation);
MediaElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
MediaElementWrappingImplementation._wrap$ctor.prototype = MediaElementWrappingImplementation.prototype;
function MediaElementWrappingImplementation() {}
// ********** Code for AudioElementWrappingImplementation **************
$inherits(AudioElementWrappingImplementation, MediaElementWrappingImplementation);
AudioElementWrappingImplementation._wrap$ctor = function(ptr) {
  MediaElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
AudioElementWrappingImplementation._wrap$ctor.prototype = AudioElementWrappingImplementation.prototype;
function AudioElementWrappingImplementation() {}
// ********** Code for BRElementWrappingImplementation **************
$inherits(BRElementWrappingImplementation, ElementWrappingImplementation);
BRElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
BRElementWrappingImplementation._wrap$ctor.prototype = BRElementWrappingImplementation.prototype;
function BRElementWrappingImplementation() {}
// ********** Code for BaseElementWrappingImplementation **************
$inherits(BaseElementWrappingImplementation, ElementWrappingImplementation);
BaseElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
BaseElementWrappingImplementation._wrap$ctor.prototype = BaseElementWrappingImplementation.prototype;
function BaseElementWrappingImplementation() {}
// ********** Code for ButtonElementWrappingImplementation **************
$inherits(ButtonElementWrappingImplementation, ElementWrappingImplementation);
ButtonElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ButtonElementWrappingImplementation._wrap$ctor.prototype = ButtonElementWrappingImplementation.prototype;
function ButtonElementWrappingImplementation() {}
ButtonElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for CanvasElementWrappingImplementation **************
$inherits(CanvasElementWrappingImplementation, ElementWrappingImplementation);
CanvasElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
CanvasElementWrappingImplementation._wrap$ctor.prototype = CanvasElementWrappingImplementation.prototype;
function CanvasElementWrappingImplementation() {}
CanvasElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
CanvasElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
CanvasElementWrappingImplementation.prototype.getContext = function(contextId) {
  if (null == contextId) {
    return LevelDom.wrapCanvasRenderingContext(this._ptr.getContext$0());
  }
  else {
    return LevelDom.wrapCanvasRenderingContext(this._ptr.getContext(contextId));
  }
}
CanvasElementWrappingImplementation.prototype.getContext$0 = CanvasElementWrappingImplementation.prototype.getContext;
// ********** Code for CanvasRenderingContextWrappingImplementation **************
$inherits(CanvasRenderingContextWrappingImplementation, DOMWrapperBase);
CanvasRenderingContextWrappingImplementation._wrap$ctor = function(ptr) {
  DOMWrapperBase._wrap$ctor.call(this, ptr);
}
CanvasRenderingContextWrappingImplementation._wrap$ctor.prototype = CanvasRenderingContextWrappingImplementation.prototype;
function CanvasRenderingContextWrappingImplementation() {}
// ********** Code for CanvasRenderingContext2DWrappingImplementation **************
$inherits(CanvasRenderingContext2DWrappingImplementation, CanvasRenderingContextWrappingImplementation);
CanvasRenderingContext2DWrappingImplementation._wrap$ctor = function(ptr) {
  CanvasRenderingContextWrappingImplementation._wrap$ctor.call(this, ptr);
}
CanvasRenderingContext2DWrappingImplementation._wrap$ctor.prototype = CanvasRenderingContext2DWrappingImplementation.prototype;
function CanvasRenderingContext2DWrappingImplementation() {}
CanvasRenderingContext2DWrappingImplementation.prototype.set$fillStyle = function(value) {
  this._ptr.set$fillStyle(LevelDom.unwrapMaybePrimitive(value));
}
CanvasRenderingContext2DWrappingImplementation.prototype.set$lineWidth = function(value) {
  this._ptr.set$lineWidth(value);
}
CanvasRenderingContext2DWrappingImplementation.prototype.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
  this._ptr.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.beginPath = function() {
  this._ptr.beginPath();
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.clearRect = function(x, y, width, height) {
  this._ptr.clearRect(x, y, width, height);
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.closePath = function() {
  this._ptr.closePath();
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.fill = function() {
  this._ptr.fill();
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.restore = function() {
  this._ptr.restore();
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.rotate = function(angle) {
  this._ptr.rotate$1(angle);
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.save = function() {
  this._ptr.save();
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.scale = function(sx, sy) {
  this._ptr.scale$2(sx, sy);
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.stroke = function() {
  this._ptr.stroke();
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.translate = function(tx, ty) {
  this._ptr.translate$2(tx, ty);
  return;
}
CanvasRenderingContext2DWrappingImplementation.prototype.rotate$1 = CanvasRenderingContext2DWrappingImplementation.prototype.rotate;
CanvasRenderingContext2DWrappingImplementation.prototype.scale$2 = CanvasRenderingContext2DWrappingImplementation.prototype.scale;
CanvasRenderingContext2DWrappingImplementation.prototype.translate$2 = CanvasRenderingContext2DWrappingImplementation.prototype.translate;
// ********** Code for DListElementWrappingImplementation **************
$inherits(DListElementWrappingImplementation, ElementWrappingImplementation);
DListElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
DListElementWrappingImplementation._wrap$ctor.prototype = DListElementWrappingImplementation.prototype;
function DListElementWrappingImplementation() {}
// ********** Code for DataListElementWrappingImplementation **************
$inherits(DataListElementWrappingImplementation, ElementWrappingImplementation);
DataListElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
DataListElementWrappingImplementation._wrap$ctor.prototype = DataListElementWrappingImplementation.prototype;
function DataListElementWrappingImplementation() {}
// ********** Code for DetailsElementWrappingImplementation **************
$inherits(DetailsElementWrappingImplementation, ElementWrappingImplementation);
DetailsElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
DetailsElementWrappingImplementation._wrap$ctor.prototype = DetailsElementWrappingImplementation.prototype;
function DetailsElementWrappingImplementation() {}
// ********** Code for DivElementWrappingImplementation **************
$inherits(DivElementWrappingImplementation, ElementWrappingImplementation);
DivElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
DivElementWrappingImplementation._wrap$ctor.prototype = DivElementWrappingImplementation.prototype;
function DivElementWrappingImplementation() {}
// ********** Code for EmbedElementWrappingImplementation **************
$inherits(EmbedElementWrappingImplementation, ElementWrappingImplementation);
EmbedElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
EmbedElementWrappingImplementation._wrap$ctor.prototype = EmbedElementWrappingImplementation.prototype;
function EmbedElementWrappingImplementation() {}
EmbedElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
EmbedElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for FieldSetElementWrappingImplementation **************
$inherits(FieldSetElementWrappingImplementation, ElementWrappingImplementation);
FieldSetElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
FieldSetElementWrappingImplementation._wrap$ctor.prototype = FieldSetElementWrappingImplementation.prototype;
function FieldSetElementWrappingImplementation() {}
// ********** Code for FontElementWrappingImplementation **************
$inherits(FontElementWrappingImplementation, ElementWrappingImplementation);
FontElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
FontElementWrappingImplementation._wrap$ctor.prototype = FontElementWrappingImplementation.prototype;
function FontElementWrappingImplementation() {}
// ********** Code for FormElementWrappingImplementation **************
$inherits(FormElementWrappingImplementation, ElementWrappingImplementation);
FormElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
FormElementWrappingImplementation._wrap$ctor.prototype = FormElementWrappingImplementation.prototype;
function FormElementWrappingImplementation() {}
// ********** Code for HRElementWrappingImplementation **************
$inherits(HRElementWrappingImplementation, ElementWrappingImplementation);
HRElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
HRElementWrappingImplementation._wrap$ctor.prototype = HRElementWrappingImplementation.prototype;
function HRElementWrappingImplementation() {}
HRElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for HeadElementWrappingImplementation **************
$inherits(HeadElementWrappingImplementation, ElementWrappingImplementation);
HeadElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
HeadElementWrappingImplementation._wrap$ctor.prototype = HeadElementWrappingImplementation.prototype;
function HeadElementWrappingImplementation() {}
// ********** Code for HeadingElementWrappingImplementation **************
$inherits(HeadingElementWrappingImplementation, ElementWrappingImplementation);
HeadingElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
HeadingElementWrappingImplementation._wrap$ctor.prototype = HeadingElementWrappingImplementation.prototype;
function HeadingElementWrappingImplementation() {}
// ********** Code for IFrameElementWrappingImplementation **************
$inherits(IFrameElementWrappingImplementation, ElementWrappingImplementation);
IFrameElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
IFrameElementWrappingImplementation._wrap$ctor.prototype = IFrameElementWrappingImplementation.prototype;
function IFrameElementWrappingImplementation() {}
IFrameElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
IFrameElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for ImageElementWrappingImplementation **************
$inherits(ImageElementWrappingImplementation, ElementWrappingImplementation);
ImageElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ImageElementWrappingImplementation._wrap$ctor.prototype = ImageElementWrappingImplementation.prototype;
function ImageElementWrappingImplementation() {}
ImageElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
ImageElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
ImageElementWrappingImplementation.prototype.get$x = function() {
  return this._ptr.get$x();
}
// ********** Code for InputElementWrappingImplementation **************
$inherits(InputElementWrappingImplementation, ElementWrappingImplementation);
InputElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
InputElementWrappingImplementation._wrap$ctor.prototype = InputElementWrappingImplementation.prototype;
function InputElementWrappingImplementation() {}
InputElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for KeygenElementWrappingImplementation **************
$inherits(KeygenElementWrappingImplementation, ElementWrappingImplementation);
KeygenElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
KeygenElementWrappingImplementation._wrap$ctor.prototype = KeygenElementWrappingImplementation.prototype;
function KeygenElementWrappingImplementation() {}
// ********** Code for LIElementWrappingImplementation **************
$inherits(LIElementWrappingImplementation, ElementWrappingImplementation);
LIElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
LIElementWrappingImplementation._wrap$ctor.prototype = LIElementWrappingImplementation.prototype;
function LIElementWrappingImplementation() {}
LIElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for LabelElementWrappingImplementation **************
$inherits(LabelElementWrappingImplementation, ElementWrappingImplementation);
LabelElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
LabelElementWrappingImplementation._wrap$ctor.prototype = LabelElementWrappingImplementation.prototype;
function LabelElementWrappingImplementation() {}
// ********** Code for LegendElementWrappingImplementation **************
$inherits(LegendElementWrappingImplementation, ElementWrappingImplementation);
LegendElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
LegendElementWrappingImplementation._wrap$ctor.prototype = LegendElementWrappingImplementation.prototype;
function LegendElementWrappingImplementation() {}
// ********** Code for LinkElementWrappingImplementation **************
$inherits(LinkElementWrappingImplementation, ElementWrappingImplementation);
LinkElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
LinkElementWrappingImplementation._wrap$ctor.prototype = LinkElementWrappingImplementation.prototype;
function LinkElementWrappingImplementation() {}
// ********** Code for MapElementWrappingImplementation **************
$inherits(MapElementWrappingImplementation, ElementWrappingImplementation);
MapElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
MapElementWrappingImplementation._wrap$ctor.prototype = MapElementWrappingImplementation.prototype;
function MapElementWrappingImplementation() {}
// ********** Code for MarqueeElementWrappingImplementation **************
$inherits(MarqueeElementWrappingImplementation, ElementWrappingImplementation);
MarqueeElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
MarqueeElementWrappingImplementation._wrap$ctor.prototype = MarqueeElementWrappingImplementation.prototype;
function MarqueeElementWrappingImplementation() {}
MarqueeElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
MarqueeElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for MenuElementWrappingImplementation **************
$inherits(MenuElementWrappingImplementation, ElementWrappingImplementation);
MenuElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
MenuElementWrappingImplementation._wrap$ctor.prototype = MenuElementWrappingImplementation.prototype;
function MenuElementWrappingImplementation() {}
// ********** Code for MetaElementWrappingImplementation **************
$inherits(MetaElementWrappingImplementation, ElementWrappingImplementation);
MetaElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
MetaElementWrappingImplementation._wrap$ctor.prototype = MetaElementWrappingImplementation.prototype;
function MetaElementWrappingImplementation() {}
// ********** Code for MeterElementWrappingImplementation **************
$inherits(MeterElementWrappingImplementation, ElementWrappingImplementation);
MeterElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
MeterElementWrappingImplementation._wrap$ctor.prototype = MeterElementWrappingImplementation.prototype;
function MeterElementWrappingImplementation() {}
MeterElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for ModElementWrappingImplementation **************
$inherits(ModElementWrappingImplementation, ElementWrappingImplementation);
ModElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ModElementWrappingImplementation._wrap$ctor.prototype = ModElementWrappingImplementation.prototype;
function ModElementWrappingImplementation() {}
// ********** Code for OListElementWrappingImplementation **************
$inherits(OListElementWrappingImplementation, ElementWrappingImplementation);
OListElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
OListElementWrappingImplementation._wrap$ctor.prototype = OListElementWrappingImplementation.prototype;
function OListElementWrappingImplementation() {}
// ********** Code for OptGroupElementWrappingImplementation **************
$inherits(OptGroupElementWrappingImplementation, ElementWrappingImplementation);
OptGroupElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
OptGroupElementWrappingImplementation._wrap$ctor.prototype = OptGroupElementWrappingImplementation.prototype;
function OptGroupElementWrappingImplementation() {}
// ********** Code for OptionElementWrappingImplementation **************
$inherits(OptionElementWrappingImplementation, ElementWrappingImplementation);
OptionElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
OptionElementWrappingImplementation._wrap$ctor.prototype = OptionElementWrappingImplementation.prototype;
function OptionElementWrappingImplementation() {}
OptionElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for OutputElementWrappingImplementation **************
$inherits(OutputElementWrappingImplementation, ElementWrappingImplementation);
OutputElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
OutputElementWrappingImplementation._wrap$ctor.prototype = OutputElementWrappingImplementation.prototype;
function OutputElementWrappingImplementation() {}
OutputElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for ParagraphElementWrappingImplementation **************
$inherits(ParagraphElementWrappingImplementation, ElementWrappingImplementation);
ParagraphElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ParagraphElementWrappingImplementation._wrap$ctor.prototype = ParagraphElementWrappingImplementation.prototype;
function ParagraphElementWrappingImplementation() {}
// ********** Code for ParamElementWrappingImplementation **************
$inherits(ParamElementWrappingImplementation, ElementWrappingImplementation);
ParamElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ParamElementWrappingImplementation._wrap$ctor.prototype = ParamElementWrappingImplementation.prototype;
function ParamElementWrappingImplementation() {}
ParamElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for PreElementWrappingImplementation **************
$inherits(PreElementWrappingImplementation, ElementWrappingImplementation);
PreElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
PreElementWrappingImplementation._wrap$ctor.prototype = PreElementWrappingImplementation.prototype;
function PreElementWrappingImplementation() {}
PreElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for ProgressElementWrappingImplementation **************
$inherits(ProgressElementWrappingImplementation, ElementWrappingImplementation);
ProgressElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ProgressElementWrappingImplementation._wrap$ctor.prototype = ProgressElementWrappingImplementation.prototype;
function ProgressElementWrappingImplementation() {}
ProgressElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for QuoteElementWrappingImplementation **************
$inherits(QuoteElementWrappingImplementation, ElementWrappingImplementation);
QuoteElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
QuoteElementWrappingImplementation._wrap$ctor.prototype = QuoteElementWrappingImplementation.prototype;
function QuoteElementWrappingImplementation() {}
// ********** Code for SVGElementWrappingImplementation **************
$inherits(SVGElementWrappingImplementation, ElementWrappingImplementation);
SVGElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGElementWrappingImplementation._wrap$ctor.prototype = SVGElementWrappingImplementation.prototype;
function SVGElementWrappingImplementation() {}
// ********** Code for SVGAElementWrappingImplementation **************
$inherits(SVGAElementWrappingImplementation, SVGElementWrappingImplementation);
SVGAElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAElementWrappingImplementation._wrap$ctor.prototype = SVGAElementWrappingImplementation.prototype;
function SVGAElementWrappingImplementation() {}
// ********** Code for SVGAltGlyphDefElementWrappingImplementation **************
$inherits(SVGAltGlyphDefElementWrappingImplementation, SVGElementWrappingImplementation);
SVGAltGlyphDefElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAltGlyphDefElementWrappingImplementation._wrap$ctor.prototype = SVGAltGlyphDefElementWrappingImplementation.prototype;
function SVGAltGlyphDefElementWrappingImplementation() {}
// ********** Code for SVGTextContentElementWrappingImplementation **************
$inherits(SVGTextContentElementWrappingImplementation, SVGElementWrappingImplementation);
SVGTextContentElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGTextContentElementWrappingImplementation._wrap$ctor.prototype = SVGTextContentElementWrappingImplementation.prototype;
function SVGTextContentElementWrappingImplementation() {}
// ********** Code for SVGTextPositioningElementWrappingImplementation **************
$inherits(SVGTextPositioningElementWrappingImplementation, SVGTextContentElementWrappingImplementation);
SVGTextPositioningElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGTextContentElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGTextPositioningElementWrappingImplementation._wrap$ctor.prototype = SVGTextPositioningElementWrappingImplementation.prototype;
function SVGTextPositioningElementWrappingImplementation() {}
SVGTextPositioningElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLengthList(this._ptr.get$x());
}
// ********** Code for SVGAltGlyphElementWrappingImplementation **************
$inherits(SVGAltGlyphElementWrappingImplementation, SVGTextPositioningElementWrappingImplementation);
SVGAltGlyphElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGTextPositioningElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAltGlyphElementWrappingImplementation._wrap$ctor.prototype = SVGAltGlyphElementWrappingImplementation.prototype;
function SVGAltGlyphElementWrappingImplementation() {}
// ********** Code for SVGAltGlyphItemElementWrappingImplementation **************
$inherits(SVGAltGlyphItemElementWrappingImplementation, SVGElementWrappingImplementation);
SVGAltGlyphItemElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAltGlyphItemElementWrappingImplementation._wrap$ctor.prototype = SVGAltGlyphItemElementWrappingImplementation.prototype;
function SVGAltGlyphItemElementWrappingImplementation() {}
// ********** Code for SVGAnimationElementWrappingImplementation **************
$inherits(SVGAnimationElementWrappingImplementation, SVGElementWrappingImplementation);
SVGAnimationElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAnimationElementWrappingImplementation._wrap$ctor.prototype = SVGAnimationElementWrappingImplementation.prototype;
function SVGAnimationElementWrappingImplementation() {}
// ********** Code for SVGAnimateColorElementWrappingImplementation **************
$inherits(SVGAnimateColorElementWrappingImplementation, SVGAnimationElementWrappingImplementation);
SVGAnimateColorElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGAnimationElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAnimateColorElementWrappingImplementation._wrap$ctor.prototype = SVGAnimateColorElementWrappingImplementation.prototype;
function SVGAnimateColorElementWrappingImplementation() {}
// ********** Code for SVGAnimateElementWrappingImplementation **************
$inherits(SVGAnimateElementWrappingImplementation, SVGAnimationElementWrappingImplementation);
SVGAnimateElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGAnimationElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAnimateElementWrappingImplementation._wrap$ctor.prototype = SVGAnimateElementWrappingImplementation.prototype;
function SVGAnimateElementWrappingImplementation() {}
// ********** Code for SVGAnimateMotionElementWrappingImplementation **************
$inherits(SVGAnimateMotionElementWrappingImplementation, SVGAnimationElementWrappingImplementation);
SVGAnimateMotionElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGAnimationElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAnimateMotionElementWrappingImplementation._wrap$ctor.prototype = SVGAnimateMotionElementWrappingImplementation.prototype;
function SVGAnimateMotionElementWrappingImplementation() {}
// ********** Code for SVGAnimateTransformElementWrappingImplementation **************
$inherits(SVGAnimateTransformElementWrappingImplementation, SVGAnimationElementWrappingImplementation);
SVGAnimateTransformElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGAnimationElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGAnimateTransformElementWrappingImplementation._wrap$ctor.prototype = SVGAnimateTransformElementWrappingImplementation.prototype;
function SVGAnimateTransformElementWrappingImplementation() {}
// ********** Code for SVGAnimatedLengthListWrappingImplementation **************
$inherits(SVGAnimatedLengthListWrappingImplementation, DOMWrapperBase);
SVGAnimatedLengthListWrappingImplementation._wrap$ctor = function(ptr) {
  DOMWrapperBase._wrap$ctor.call(this, ptr);
}
SVGAnimatedLengthListWrappingImplementation._wrap$ctor.prototype = SVGAnimatedLengthListWrappingImplementation.prototype;
function SVGAnimatedLengthListWrappingImplementation() {}
// ********** Code for SVGAnimatedLengthWrappingImplementation **************
$inherits(SVGAnimatedLengthWrappingImplementation, DOMWrapperBase);
SVGAnimatedLengthWrappingImplementation._wrap$ctor = function(ptr) {
  DOMWrapperBase._wrap$ctor.call(this, ptr);
}
SVGAnimatedLengthWrappingImplementation._wrap$ctor.prototype = SVGAnimatedLengthWrappingImplementation.prototype;
function SVGAnimatedLengthWrappingImplementation() {}
// ********** Code for SVGAnimatedNumberWrappingImplementation **************
$inherits(SVGAnimatedNumberWrappingImplementation, DOMWrapperBase);
SVGAnimatedNumberWrappingImplementation._wrap$ctor = function(ptr) {
  DOMWrapperBase._wrap$ctor.call(this, ptr);
}
SVGAnimatedNumberWrappingImplementation._wrap$ctor.prototype = SVGAnimatedNumberWrappingImplementation.prototype;
function SVGAnimatedNumberWrappingImplementation() {}
// ********** Code for SVGCircleElementWrappingImplementation **************
$inherits(SVGCircleElementWrappingImplementation, SVGElementWrappingImplementation);
SVGCircleElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGCircleElementWrappingImplementation._wrap$ctor.prototype = SVGCircleElementWrappingImplementation.prototype;
function SVGCircleElementWrappingImplementation() {}
// ********** Code for SVGClipPathElementWrappingImplementation **************
$inherits(SVGClipPathElementWrappingImplementation, SVGElementWrappingImplementation);
SVGClipPathElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGClipPathElementWrappingImplementation._wrap$ctor.prototype = SVGClipPathElementWrappingImplementation.prototype;
function SVGClipPathElementWrappingImplementation() {}
// ********** Code for SVGComponentTransferFunctionElementWrappingImplementation **************
$inherits(SVGComponentTransferFunctionElementWrappingImplementation, SVGElementWrappingImplementation);
SVGComponentTransferFunctionElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGComponentTransferFunctionElementWrappingImplementation._wrap$ctor.prototype = SVGComponentTransferFunctionElementWrappingImplementation.prototype;
function SVGComponentTransferFunctionElementWrappingImplementation() {}
// ********** Code for SVGCursorElementWrappingImplementation **************
$inherits(SVGCursorElementWrappingImplementation, SVGElementWrappingImplementation);
SVGCursorElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGCursorElementWrappingImplementation._wrap$ctor.prototype = SVGCursorElementWrappingImplementation.prototype;
function SVGCursorElementWrappingImplementation() {}
SVGCursorElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGDefsElementWrappingImplementation **************
$inherits(SVGDefsElementWrappingImplementation, SVGElementWrappingImplementation);
SVGDefsElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGDefsElementWrappingImplementation._wrap$ctor.prototype = SVGDefsElementWrappingImplementation.prototype;
function SVGDefsElementWrappingImplementation() {}
// ********** Code for SVGDescElementWrappingImplementation **************
$inherits(SVGDescElementWrappingImplementation, SVGElementWrappingImplementation);
SVGDescElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGDescElementWrappingImplementation._wrap$ctor.prototype = SVGDescElementWrappingImplementation.prototype;
function SVGDescElementWrappingImplementation() {}
// ********** Code for SVGEllipseElementWrappingImplementation **************
$inherits(SVGEllipseElementWrappingImplementation, SVGElementWrappingImplementation);
SVGEllipseElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGEllipseElementWrappingImplementation._wrap$ctor.prototype = SVGEllipseElementWrappingImplementation.prototype;
function SVGEllipseElementWrappingImplementation() {}
// ********** Code for SVGFEBlendElementWrappingImplementation **************
$inherits(SVGFEBlendElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEBlendElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEBlendElementWrappingImplementation._wrap$ctor.prototype = SVGFEBlendElementWrappingImplementation.prototype;
function SVGFEBlendElementWrappingImplementation() {}
SVGFEBlendElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEBlendElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEBlendElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEColorMatrixElementWrappingImplementation **************
$inherits(SVGFEColorMatrixElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEColorMatrixElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEColorMatrixElementWrappingImplementation._wrap$ctor.prototype = SVGFEColorMatrixElementWrappingImplementation.prototype;
function SVGFEColorMatrixElementWrappingImplementation() {}
SVGFEColorMatrixElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEColorMatrixElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEColorMatrixElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEComponentTransferElementWrappingImplementation **************
$inherits(SVGFEComponentTransferElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEComponentTransferElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEComponentTransferElementWrappingImplementation._wrap$ctor.prototype = SVGFEComponentTransferElementWrappingImplementation.prototype;
function SVGFEComponentTransferElementWrappingImplementation() {}
SVGFEComponentTransferElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEComponentTransferElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEComponentTransferElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEConvolveMatrixElementWrappingImplementation **************
$inherits(SVGFEConvolveMatrixElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEConvolveMatrixElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEConvolveMatrixElementWrappingImplementation._wrap$ctor.prototype = SVGFEConvolveMatrixElementWrappingImplementation.prototype;
function SVGFEConvolveMatrixElementWrappingImplementation() {}
SVGFEConvolveMatrixElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEConvolveMatrixElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEConvolveMatrixElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEDiffuseLightingElementWrappingImplementation **************
$inherits(SVGFEDiffuseLightingElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEDiffuseLightingElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEDiffuseLightingElementWrappingImplementation._wrap$ctor.prototype = SVGFEDiffuseLightingElementWrappingImplementation.prototype;
function SVGFEDiffuseLightingElementWrappingImplementation() {}
SVGFEDiffuseLightingElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEDiffuseLightingElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEDiffuseLightingElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEDisplacementMapElementWrappingImplementation **************
$inherits(SVGFEDisplacementMapElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEDisplacementMapElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEDisplacementMapElementWrappingImplementation._wrap$ctor.prototype = SVGFEDisplacementMapElementWrappingImplementation.prototype;
function SVGFEDisplacementMapElementWrappingImplementation() {}
SVGFEDisplacementMapElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEDisplacementMapElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEDisplacementMapElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEDistantLightElementWrappingImplementation **************
$inherits(SVGFEDistantLightElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEDistantLightElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEDistantLightElementWrappingImplementation._wrap$ctor.prototype = SVGFEDistantLightElementWrappingImplementation.prototype;
function SVGFEDistantLightElementWrappingImplementation() {}
// ********** Code for SVGFEDropShadowElementWrappingImplementation **************
$inherits(SVGFEDropShadowElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEDropShadowElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEDropShadowElementWrappingImplementation._wrap$ctor.prototype = SVGFEDropShadowElementWrappingImplementation.prototype;
function SVGFEDropShadowElementWrappingImplementation() {}
SVGFEDropShadowElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEDropShadowElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEDropShadowElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEFloodElementWrappingImplementation **************
$inherits(SVGFEFloodElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEFloodElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEFloodElementWrappingImplementation._wrap$ctor.prototype = SVGFEFloodElementWrappingImplementation.prototype;
function SVGFEFloodElementWrappingImplementation() {}
SVGFEFloodElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEFloodElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEFloodElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEFuncAElementWrappingImplementation **************
$inherits(SVGFEFuncAElementWrappingImplementation, SVGComponentTransferFunctionElementWrappingImplementation);
SVGFEFuncAElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGComponentTransferFunctionElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEFuncAElementWrappingImplementation._wrap$ctor.prototype = SVGFEFuncAElementWrappingImplementation.prototype;
function SVGFEFuncAElementWrappingImplementation() {}
// ********** Code for SVGFEFuncBElementWrappingImplementation **************
$inherits(SVGFEFuncBElementWrappingImplementation, SVGComponentTransferFunctionElementWrappingImplementation);
SVGFEFuncBElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGComponentTransferFunctionElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEFuncBElementWrappingImplementation._wrap$ctor.prototype = SVGFEFuncBElementWrappingImplementation.prototype;
function SVGFEFuncBElementWrappingImplementation() {}
// ********** Code for SVGFEFuncGElementWrappingImplementation **************
$inherits(SVGFEFuncGElementWrappingImplementation, SVGComponentTransferFunctionElementWrappingImplementation);
SVGFEFuncGElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGComponentTransferFunctionElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEFuncGElementWrappingImplementation._wrap$ctor.prototype = SVGFEFuncGElementWrappingImplementation.prototype;
function SVGFEFuncGElementWrappingImplementation() {}
// ********** Code for SVGFEFuncRElementWrappingImplementation **************
$inherits(SVGFEFuncRElementWrappingImplementation, SVGComponentTransferFunctionElementWrappingImplementation);
SVGFEFuncRElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGComponentTransferFunctionElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEFuncRElementWrappingImplementation._wrap$ctor.prototype = SVGFEFuncRElementWrappingImplementation.prototype;
function SVGFEFuncRElementWrappingImplementation() {}
// ********** Code for SVGFEGaussianBlurElementWrappingImplementation **************
$inherits(SVGFEGaussianBlurElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEGaussianBlurElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEGaussianBlurElementWrappingImplementation._wrap$ctor.prototype = SVGFEGaussianBlurElementWrappingImplementation.prototype;
function SVGFEGaussianBlurElementWrappingImplementation() {}
SVGFEGaussianBlurElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEGaussianBlurElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEGaussianBlurElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEImageElementWrappingImplementation **************
$inherits(SVGFEImageElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEImageElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEImageElementWrappingImplementation._wrap$ctor.prototype = SVGFEImageElementWrappingImplementation.prototype;
function SVGFEImageElementWrappingImplementation() {}
SVGFEImageElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEImageElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEImageElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEMergeElementWrappingImplementation **************
$inherits(SVGFEMergeElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEMergeElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEMergeElementWrappingImplementation._wrap$ctor.prototype = SVGFEMergeElementWrappingImplementation.prototype;
function SVGFEMergeElementWrappingImplementation() {}
SVGFEMergeElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEMergeElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEMergeElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEMergeNodeElementWrappingImplementation **************
$inherits(SVGFEMergeNodeElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEMergeNodeElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEMergeNodeElementWrappingImplementation._wrap$ctor.prototype = SVGFEMergeNodeElementWrappingImplementation.prototype;
function SVGFEMergeNodeElementWrappingImplementation() {}
// ********** Code for SVGFEOffsetElementWrappingImplementation **************
$inherits(SVGFEOffsetElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEOffsetElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEOffsetElementWrappingImplementation._wrap$ctor.prototype = SVGFEOffsetElementWrappingImplementation.prototype;
function SVGFEOffsetElementWrappingImplementation() {}
SVGFEOffsetElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFEOffsetElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFEOffsetElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFEPointLightElementWrappingImplementation **************
$inherits(SVGFEPointLightElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFEPointLightElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFEPointLightElementWrappingImplementation._wrap$ctor.prototype = SVGFEPointLightElementWrappingImplementation.prototype;
function SVGFEPointLightElementWrappingImplementation() {}
SVGFEPointLightElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedNumber(this._ptr.get$x());
}
// ********** Code for SVGFESpecularLightingElementWrappingImplementation **************
$inherits(SVGFESpecularLightingElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFESpecularLightingElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFESpecularLightingElementWrappingImplementation._wrap$ctor.prototype = SVGFESpecularLightingElementWrappingImplementation.prototype;
function SVGFESpecularLightingElementWrappingImplementation() {}
SVGFESpecularLightingElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFESpecularLightingElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFESpecularLightingElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFESpotLightElementWrappingImplementation **************
$inherits(SVGFESpotLightElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFESpotLightElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFESpotLightElementWrappingImplementation._wrap$ctor.prototype = SVGFESpotLightElementWrappingImplementation.prototype;
function SVGFESpotLightElementWrappingImplementation() {}
SVGFESpotLightElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedNumber(this._ptr.get$x());
}
// ********** Code for SVGFETileElementWrappingImplementation **************
$inherits(SVGFETileElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFETileElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFETileElementWrappingImplementation._wrap$ctor.prototype = SVGFETileElementWrappingImplementation.prototype;
function SVGFETileElementWrappingImplementation() {}
SVGFETileElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFETileElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFETileElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFETurbulenceElementWrappingImplementation **************
$inherits(SVGFETurbulenceElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFETurbulenceElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFETurbulenceElementWrappingImplementation._wrap$ctor.prototype = SVGFETurbulenceElementWrappingImplementation.prototype;
function SVGFETurbulenceElementWrappingImplementation() {}
SVGFETurbulenceElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFETurbulenceElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFETurbulenceElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFilterElementWrappingImplementation **************
$inherits(SVGFilterElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFilterElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFilterElementWrappingImplementation._wrap$ctor.prototype = SVGFilterElementWrappingImplementation.prototype;
function SVGFilterElementWrappingImplementation() {}
SVGFilterElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGFilterElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGFilterElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGFontElementWrappingImplementation **************
$inherits(SVGFontElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFontElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFontElementWrappingImplementation._wrap$ctor.prototype = SVGFontElementWrappingImplementation.prototype;
function SVGFontElementWrappingImplementation() {}
// ********** Code for SVGFontFaceElementWrappingImplementation **************
$inherits(SVGFontFaceElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFontFaceElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFontFaceElementWrappingImplementation._wrap$ctor.prototype = SVGFontFaceElementWrappingImplementation.prototype;
function SVGFontFaceElementWrappingImplementation() {}
// ********** Code for SVGFontFaceFormatElementWrappingImplementation **************
$inherits(SVGFontFaceFormatElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFontFaceFormatElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFontFaceFormatElementWrappingImplementation._wrap$ctor.prototype = SVGFontFaceFormatElementWrappingImplementation.prototype;
function SVGFontFaceFormatElementWrappingImplementation() {}
// ********** Code for SVGFontFaceNameElementWrappingImplementation **************
$inherits(SVGFontFaceNameElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFontFaceNameElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFontFaceNameElementWrappingImplementation._wrap$ctor.prototype = SVGFontFaceNameElementWrappingImplementation.prototype;
function SVGFontFaceNameElementWrappingImplementation() {}
// ********** Code for SVGFontFaceSrcElementWrappingImplementation **************
$inherits(SVGFontFaceSrcElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFontFaceSrcElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFontFaceSrcElementWrappingImplementation._wrap$ctor.prototype = SVGFontFaceSrcElementWrappingImplementation.prototype;
function SVGFontFaceSrcElementWrappingImplementation() {}
// ********** Code for SVGFontFaceUriElementWrappingImplementation **************
$inherits(SVGFontFaceUriElementWrappingImplementation, SVGElementWrappingImplementation);
SVGFontFaceUriElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGFontFaceUriElementWrappingImplementation._wrap$ctor.prototype = SVGFontFaceUriElementWrappingImplementation.prototype;
function SVGFontFaceUriElementWrappingImplementation() {}
// ********** Code for SVGForeignObjectElementWrappingImplementation **************
$inherits(SVGForeignObjectElementWrappingImplementation, SVGElementWrappingImplementation);
SVGForeignObjectElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGForeignObjectElementWrappingImplementation._wrap$ctor.prototype = SVGForeignObjectElementWrappingImplementation.prototype;
function SVGForeignObjectElementWrappingImplementation() {}
SVGForeignObjectElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGForeignObjectElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGForeignObjectElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGGElementWrappingImplementation **************
$inherits(SVGGElementWrappingImplementation, SVGElementWrappingImplementation);
SVGGElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGGElementWrappingImplementation._wrap$ctor.prototype = SVGGElementWrappingImplementation.prototype;
function SVGGElementWrappingImplementation() {}
// ********** Code for SVGGlyphElementWrappingImplementation **************
$inherits(SVGGlyphElementWrappingImplementation, SVGElementWrappingImplementation);
SVGGlyphElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGGlyphElementWrappingImplementation._wrap$ctor.prototype = SVGGlyphElementWrappingImplementation.prototype;
function SVGGlyphElementWrappingImplementation() {}
// ********** Code for SVGGlyphRefElementWrappingImplementation **************
$inherits(SVGGlyphRefElementWrappingImplementation, SVGElementWrappingImplementation);
SVGGlyphRefElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGGlyphRefElementWrappingImplementation._wrap$ctor.prototype = SVGGlyphRefElementWrappingImplementation.prototype;
function SVGGlyphRefElementWrappingImplementation() {}
SVGGlyphRefElementWrappingImplementation.prototype.get$x = function() {
  return this._ptr.get$x();
}
SVGGlyphRefElementWrappingImplementation.prototype.set$x = function(value) {
  this._ptr.set$x(value);
}
SVGGlyphRefElementWrappingImplementation.prototype.set$y = function(value) {
  this._ptr.set$y(value);
}
// ********** Code for SVGGradientElementWrappingImplementation **************
$inherits(SVGGradientElementWrappingImplementation, SVGElementWrappingImplementation);
SVGGradientElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGGradientElementWrappingImplementation._wrap$ctor.prototype = SVGGradientElementWrappingImplementation.prototype;
function SVGGradientElementWrappingImplementation() {}
// ********** Code for SVGHKernElementWrappingImplementation **************
$inherits(SVGHKernElementWrappingImplementation, SVGElementWrappingImplementation);
SVGHKernElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGHKernElementWrappingImplementation._wrap$ctor.prototype = SVGHKernElementWrappingImplementation.prototype;
function SVGHKernElementWrappingImplementation() {}
// ********** Code for SVGImageElementWrappingImplementation **************
$inherits(SVGImageElementWrappingImplementation, SVGElementWrappingImplementation);
SVGImageElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGImageElementWrappingImplementation._wrap$ctor.prototype = SVGImageElementWrappingImplementation.prototype;
function SVGImageElementWrappingImplementation() {}
SVGImageElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGImageElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGImageElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGLineElementWrappingImplementation **************
$inherits(SVGLineElementWrappingImplementation, SVGElementWrappingImplementation);
SVGLineElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGLineElementWrappingImplementation._wrap$ctor.prototype = SVGLineElementWrappingImplementation.prototype;
function SVGLineElementWrappingImplementation() {}
// ********** Code for SVGLinearGradientElementWrappingImplementation **************
$inherits(SVGLinearGradientElementWrappingImplementation, SVGGradientElementWrappingImplementation);
SVGLinearGradientElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGGradientElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGLinearGradientElementWrappingImplementation._wrap$ctor.prototype = SVGLinearGradientElementWrappingImplementation.prototype;
function SVGLinearGradientElementWrappingImplementation() {}
// ********** Code for SVGMPathElementWrappingImplementation **************
$inherits(SVGMPathElementWrappingImplementation, SVGElementWrappingImplementation);
SVGMPathElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGMPathElementWrappingImplementation._wrap$ctor.prototype = SVGMPathElementWrappingImplementation.prototype;
function SVGMPathElementWrappingImplementation() {}
// ********** Code for SVGMarkerElementWrappingImplementation **************
$inherits(SVGMarkerElementWrappingImplementation, SVGElementWrappingImplementation);
SVGMarkerElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGMarkerElementWrappingImplementation._wrap$ctor.prototype = SVGMarkerElementWrappingImplementation.prototype;
function SVGMarkerElementWrappingImplementation() {}
// ********** Code for SVGMaskElementWrappingImplementation **************
$inherits(SVGMaskElementWrappingImplementation, SVGElementWrappingImplementation);
SVGMaskElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGMaskElementWrappingImplementation._wrap$ctor.prototype = SVGMaskElementWrappingImplementation.prototype;
function SVGMaskElementWrappingImplementation() {}
SVGMaskElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGMaskElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGMaskElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGMetadataElementWrappingImplementation **************
$inherits(SVGMetadataElementWrappingImplementation, SVGElementWrappingImplementation);
SVGMetadataElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGMetadataElementWrappingImplementation._wrap$ctor.prototype = SVGMetadataElementWrappingImplementation.prototype;
function SVGMetadataElementWrappingImplementation() {}
// ********** Code for SVGMissingGlyphElementWrappingImplementation **************
$inherits(SVGMissingGlyphElementWrappingImplementation, SVGElementWrappingImplementation);
SVGMissingGlyphElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGMissingGlyphElementWrappingImplementation._wrap$ctor.prototype = SVGMissingGlyphElementWrappingImplementation.prototype;
function SVGMissingGlyphElementWrappingImplementation() {}
// ********** Code for SVGPathElementWrappingImplementation **************
$inherits(SVGPathElementWrappingImplementation, SVGElementWrappingImplementation);
SVGPathElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGPathElementWrappingImplementation._wrap$ctor.prototype = SVGPathElementWrappingImplementation.prototype;
function SVGPathElementWrappingImplementation() {}
// ********** Code for SVGPatternElementWrappingImplementation **************
$inherits(SVGPatternElementWrappingImplementation, SVGElementWrappingImplementation);
SVGPatternElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGPatternElementWrappingImplementation._wrap$ctor.prototype = SVGPatternElementWrappingImplementation.prototype;
function SVGPatternElementWrappingImplementation() {}
SVGPatternElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGPatternElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGPatternElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGPolygonElementWrappingImplementation **************
$inherits(SVGPolygonElementWrappingImplementation, SVGElementWrappingImplementation);
SVGPolygonElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGPolygonElementWrappingImplementation._wrap$ctor.prototype = SVGPolygonElementWrappingImplementation.prototype;
function SVGPolygonElementWrappingImplementation() {}
// ********** Code for SVGPolylineElementWrappingImplementation **************
$inherits(SVGPolylineElementWrappingImplementation, SVGElementWrappingImplementation);
SVGPolylineElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGPolylineElementWrappingImplementation._wrap$ctor.prototype = SVGPolylineElementWrappingImplementation.prototype;
function SVGPolylineElementWrappingImplementation() {}
// ********** Code for SVGRadialGradientElementWrappingImplementation **************
$inherits(SVGRadialGradientElementWrappingImplementation, SVGGradientElementWrappingImplementation);
SVGRadialGradientElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGGradientElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGRadialGradientElementWrappingImplementation._wrap$ctor.prototype = SVGRadialGradientElementWrappingImplementation.prototype;
function SVGRadialGradientElementWrappingImplementation() {}
// ********** Code for SVGRectElementWrappingImplementation **************
$inherits(SVGRectElementWrappingImplementation, SVGElementWrappingImplementation);
SVGRectElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGRectElementWrappingImplementation._wrap$ctor.prototype = SVGRectElementWrappingImplementation.prototype;
function SVGRectElementWrappingImplementation() {}
SVGRectElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGRectElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGRectElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGScriptElementWrappingImplementation **************
$inherits(SVGScriptElementWrappingImplementation, SVGElementWrappingImplementation);
SVGScriptElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGScriptElementWrappingImplementation._wrap$ctor.prototype = SVGScriptElementWrappingImplementation.prototype;
function SVGScriptElementWrappingImplementation() {}
// ********** Code for SVGSetElementWrappingImplementation **************
$inherits(SVGSetElementWrappingImplementation, SVGAnimationElementWrappingImplementation);
SVGSetElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGAnimationElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGSetElementWrappingImplementation._wrap$ctor.prototype = SVGSetElementWrappingImplementation.prototype;
function SVGSetElementWrappingImplementation() {}
// ********** Code for SVGStopElementWrappingImplementation **************
$inherits(SVGStopElementWrappingImplementation, SVGElementWrappingImplementation);
SVGStopElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGStopElementWrappingImplementation._wrap$ctor.prototype = SVGStopElementWrappingImplementation.prototype;
function SVGStopElementWrappingImplementation() {}
// ********** Code for SVGStyleElementWrappingImplementation **************
$inherits(SVGStyleElementWrappingImplementation, SVGElementWrappingImplementation);
SVGStyleElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGStyleElementWrappingImplementation._wrap$ctor.prototype = SVGStyleElementWrappingImplementation.prototype;
function SVGStyleElementWrappingImplementation() {}
// ********** Code for SVGSwitchElementWrappingImplementation **************
$inherits(SVGSwitchElementWrappingImplementation, SVGElementWrappingImplementation);
SVGSwitchElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGSwitchElementWrappingImplementation._wrap$ctor.prototype = SVGSwitchElementWrappingImplementation.prototype;
function SVGSwitchElementWrappingImplementation() {}
// ********** Code for SVGSymbolElementWrappingImplementation **************
$inherits(SVGSymbolElementWrappingImplementation, SVGElementWrappingImplementation);
SVGSymbolElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGSymbolElementWrappingImplementation._wrap$ctor.prototype = SVGSymbolElementWrappingImplementation.prototype;
function SVGSymbolElementWrappingImplementation() {}
// ********** Code for SVGTRefElementWrappingImplementation **************
$inherits(SVGTRefElementWrappingImplementation, SVGTextPositioningElementWrappingImplementation);
SVGTRefElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGTextPositioningElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGTRefElementWrappingImplementation._wrap$ctor.prototype = SVGTRefElementWrappingImplementation.prototype;
function SVGTRefElementWrappingImplementation() {}
// ********** Code for SVGTSpanElementWrappingImplementation **************
$inherits(SVGTSpanElementWrappingImplementation, SVGTextPositioningElementWrappingImplementation);
SVGTSpanElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGTextPositioningElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGTSpanElementWrappingImplementation._wrap$ctor.prototype = SVGTSpanElementWrappingImplementation.prototype;
function SVGTSpanElementWrappingImplementation() {}
// ********** Code for SVGTextElementWrappingImplementation **************
$inherits(SVGTextElementWrappingImplementation, SVGTextPositioningElementWrappingImplementation);
SVGTextElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGTextPositioningElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGTextElementWrappingImplementation._wrap$ctor.prototype = SVGTextElementWrappingImplementation.prototype;
function SVGTextElementWrappingImplementation() {}
// ********** Code for SVGTextPathElementWrappingImplementation **************
$inherits(SVGTextPathElementWrappingImplementation, SVGTextContentElementWrappingImplementation);
SVGTextPathElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGTextContentElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGTextPathElementWrappingImplementation._wrap$ctor.prototype = SVGTextPathElementWrappingImplementation.prototype;
function SVGTextPathElementWrappingImplementation() {}
// ********** Code for SVGTitleElementWrappingImplementation **************
$inherits(SVGTitleElementWrappingImplementation, SVGElementWrappingImplementation);
SVGTitleElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGTitleElementWrappingImplementation._wrap$ctor.prototype = SVGTitleElementWrappingImplementation.prototype;
function SVGTitleElementWrappingImplementation() {}
// ********** Code for SVGUseElementWrappingImplementation **************
$inherits(SVGUseElementWrappingImplementation, SVGElementWrappingImplementation);
SVGUseElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGUseElementWrappingImplementation._wrap$ctor.prototype = SVGUseElementWrappingImplementation.prototype;
function SVGUseElementWrappingImplementation() {}
SVGUseElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGUseElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGUseElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for SVGVKernElementWrappingImplementation **************
$inherits(SVGVKernElementWrappingImplementation, SVGElementWrappingImplementation);
SVGVKernElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGVKernElementWrappingImplementation._wrap$ctor.prototype = SVGVKernElementWrappingImplementation.prototype;
function SVGVKernElementWrappingImplementation() {}
// ********** Code for SVGViewElementWrappingImplementation **************
$inherits(SVGViewElementWrappingImplementation, SVGElementWrappingImplementation);
SVGViewElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGViewElementWrappingImplementation._wrap$ctor.prototype = SVGViewElementWrappingImplementation.prototype;
function SVGViewElementWrappingImplementation() {}
// ********** Code for ScriptElementWrappingImplementation **************
$inherits(ScriptElementWrappingImplementation, ElementWrappingImplementation);
ScriptElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ScriptElementWrappingImplementation._wrap$ctor.prototype = ScriptElementWrappingImplementation.prototype;
function ScriptElementWrappingImplementation() {}
// ********** Code for SelectElementWrappingImplementation **************
$inherits(SelectElementWrappingImplementation, ElementWrappingImplementation);
SelectElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SelectElementWrappingImplementation._wrap$ctor.prototype = SelectElementWrappingImplementation.prototype;
function SelectElementWrappingImplementation() {}
SelectElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for SourceElementWrappingImplementation **************
$inherits(SourceElementWrappingImplementation, ElementWrappingImplementation);
SourceElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SourceElementWrappingImplementation._wrap$ctor.prototype = SourceElementWrappingImplementation.prototype;
function SourceElementWrappingImplementation() {}
// ********** Code for SpanElementWrappingImplementation **************
$inherits(SpanElementWrappingImplementation, ElementWrappingImplementation);
SpanElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SpanElementWrappingImplementation._wrap$ctor.prototype = SpanElementWrappingImplementation.prototype;
function SpanElementWrappingImplementation() {}
// ********** Code for StyleElementWrappingImplementation **************
$inherits(StyleElementWrappingImplementation, ElementWrappingImplementation);
StyleElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
StyleElementWrappingImplementation._wrap$ctor.prototype = StyleElementWrappingImplementation.prototype;
function StyleElementWrappingImplementation() {}
// ********** Code for TableCaptionElementWrappingImplementation **************
$inherits(TableCaptionElementWrappingImplementation, ElementWrappingImplementation);
TableCaptionElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TableCaptionElementWrappingImplementation._wrap$ctor.prototype = TableCaptionElementWrappingImplementation.prototype;
function TableCaptionElementWrappingImplementation() {}
// ********** Code for TableCellElementWrappingImplementation **************
$inherits(TableCellElementWrappingImplementation, ElementWrappingImplementation);
TableCellElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TableCellElementWrappingImplementation._wrap$ctor.prototype = TableCellElementWrappingImplementation.prototype;
function TableCellElementWrappingImplementation() {}
TableCellElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
TableCellElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for TableColElementWrappingImplementation **************
$inherits(TableColElementWrappingImplementation, ElementWrappingImplementation);
TableColElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TableColElementWrappingImplementation._wrap$ctor.prototype = TableColElementWrappingImplementation.prototype;
function TableColElementWrappingImplementation() {}
TableColElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for TableElementWrappingImplementation **************
$inherits(TableElementWrappingImplementation, ElementWrappingImplementation);
TableElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TableElementWrappingImplementation._wrap$ctor.prototype = TableElementWrappingImplementation.prototype;
function TableElementWrappingImplementation() {}
TableElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for TableRowElementWrappingImplementation **************
$inherits(TableRowElementWrappingImplementation, ElementWrappingImplementation);
TableRowElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TableRowElementWrappingImplementation._wrap$ctor.prototype = TableRowElementWrappingImplementation.prototype;
function TableRowElementWrappingImplementation() {}
// ********** Code for TableSectionElementWrappingImplementation **************
$inherits(TableSectionElementWrappingImplementation, ElementWrappingImplementation);
TableSectionElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TableSectionElementWrappingImplementation._wrap$ctor.prototype = TableSectionElementWrappingImplementation.prototype;
function TableSectionElementWrappingImplementation() {}
// ********** Code for TextAreaElementWrappingImplementation **************
$inherits(TextAreaElementWrappingImplementation, ElementWrappingImplementation);
TextAreaElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TextAreaElementWrappingImplementation._wrap$ctor.prototype = TextAreaElementWrappingImplementation.prototype;
function TextAreaElementWrappingImplementation() {}
TextAreaElementWrappingImplementation.prototype.set$value = function(value) {
  this._ptr.set$value(value);
}
// ********** Code for TitleElementWrappingImplementation **************
$inherits(TitleElementWrappingImplementation, ElementWrappingImplementation);
TitleElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TitleElementWrappingImplementation._wrap$ctor.prototype = TitleElementWrappingImplementation.prototype;
function TitleElementWrappingImplementation() {}
// ********** Code for TrackElementWrappingImplementation **************
$inherits(TrackElementWrappingImplementation, ElementWrappingImplementation);
TrackElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
TrackElementWrappingImplementation._wrap$ctor.prototype = TrackElementWrappingImplementation.prototype;
function TrackElementWrappingImplementation() {}
// ********** Code for UListElementWrappingImplementation **************
$inherits(UListElementWrappingImplementation, ElementWrappingImplementation);
UListElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
UListElementWrappingImplementation._wrap$ctor.prototype = UListElementWrappingImplementation.prototype;
function UListElementWrappingImplementation() {}
// ********** Code for UnknownElementWrappingImplementation **************
$inherits(UnknownElementWrappingImplementation, ElementWrappingImplementation);
UnknownElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
UnknownElementWrappingImplementation._wrap$ctor.prototype = UnknownElementWrappingImplementation.prototype;
function UnknownElementWrappingImplementation() {}
// ********** Code for VideoElementWrappingImplementation **************
$inherits(VideoElementWrappingImplementation, MediaElementWrappingImplementation);
VideoElementWrappingImplementation._wrap$ctor = function(ptr) {
  MediaElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
VideoElementWrappingImplementation._wrap$ctor.prototype = VideoElementWrappingImplementation.prototype;
function VideoElementWrappingImplementation() {}
VideoElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
VideoElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for WebGLRenderingContextWrappingImplementation **************
$inherits(WebGLRenderingContextWrappingImplementation, CanvasRenderingContextWrappingImplementation);
WebGLRenderingContextWrappingImplementation._wrap$ctor = function(ptr) {
  CanvasRenderingContextWrappingImplementation._wrap$ctor.call(this, ptr);
}
WebGLRenderingContextWrappingImplementation._wrap$ctor.prototype = WebGLRenderingContextWrappingImplementation.prototype;
function WebGLRenderingContextWrappingImplementation() {}
// ********** Code for LevelDom **************
function LevelDom() {}
LevelDom.wrapCanvasRenderingContext = function(raw) {
  if (null == raw) {
    return null;
  }
  if (null != raw.get$dartObjectLocalStorage()) {
    return raw.get$dartObjectLocalStorage();
  }
  switch (raw.get$typeName()) {
    case "CanvasRenderingContext":

      return new CanvasRenderingContextWrappingImplementation._wrap$ctor(raw);

    case "CanvasRenderingContext2D":

      return new CanvasRenderingContext2DWrappingImplementation._wrap$ctor(raw);

    case "WebGLRenderingContext":

      return new WebGLRenderingContextWrappingImplementation._wrap$ctor(raw);

    default:

      $throw(new UnsupportedOperationException($add("Unknown type:", raw.toString())));

  }
}
LevelDom.wrapDocument = function(raw) {
  if (null == raw) {
    return null;
  }
  if (null != raw.get$dartObjectLocalStorage()) {
    return raw.get$dartObjectLocalStorage();
  }
  switch (raw.get$typeName()) {
    case "HTMLDocument":

      return new DocumentWrappingImplementation._wrap$ctor(raw, raw.get$documentElement());

    case "SVGDocument":

      return new SVGDocumentWrappingImplementation._wrap$ctor(raw);

    default:

      $throw(new UnsupportedOperationException($add("Unknown type:", raw.toString())));

  }
}
LevelDom.wrapElement = function(raw) {
  if (null == raw) {
    return null;
  }
  if (null != raw.get$dartObjectLocalStorage()) {
    return raw.get$dartObjectLocalStorage();
  }
  switch (raw.get$typeName()) {
    case "HTMLAnchorElement":

      return new AnchorElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLAreaElement":

      return new AreaElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLAudioElement":

      return new AudioElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLBRElement":

      return new BRElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLBaseElement":

      return new BaseElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLBodyElement":

      return new BodyElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLButtonElement":

      return new ButtonElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLCanvasElement":

      return new CanvasElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLDListElement":

      return new DListElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLDataListElement":

      return new DataListElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLDetailsElement":

      return new DetailsElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLDivElement":

      return new DivElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLElement":

      return new ElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLEmbedElement":

      return new EmbedElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLFieldSetElement":

      return new FieldSetElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLFontElement":

      return new FontElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLFormElement":

      return new FormElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLHRElement":

      return new HRElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLHeadElement":

      return new HeadElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLHeadingElement":

      return new HeadingElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLHtmlElement":

      return new DocumentWrappingImplementation._wrap$ctor(raw.get$parentNode(), raw);

    case "HTMLIFrameElement":

      return new IFrameElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLImageElement":

      return new ImageElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLInputElement":

      return new InputElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLKeygenElement":

      return new KeygenElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLLIElement":

      return new LIElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLLabelElement":

      return new LabelElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLLegendElement":

      return new LegendElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLLinkElement":

      return new LinkElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLMapElement":

      return new MapElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLMarqueeElement":

      return new MarqueeElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLMediaElement":

      return new MediaElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLMenuElement":

      return new MenuElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLMetaElement":

      return new MetaElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLMeterElement":

      return new MeterElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLModElement":

      return new ModElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLOListElement":

      return new OListElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLObjectElement":

      return new ObjectElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLOptGroupElement":

      return new OptGroupElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLOptionElement":

      return new OptionElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLOutputElement":

      return new OutputElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLParagraphElement":

      return new ParagraphElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLParamElement":

      return new ParamElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLPreElement":

      return new PreElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLProgressElement":

      return new ProgressElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLQuoteElement":

      return new QuoteElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAElement":

      return new SVGAElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAltGlyphDefElement":

      return new SVGAltGlyphDefElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAltGlyphElement":

      return new SVGAltGlyphElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAltGlyphItemElement":

      return new SVGAltGlyphItemElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAnimateColorElement":

      return new SVGAnimateColorElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAnimateElement":

      return new SVGAnimateElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAnimateMotionElement":

      return new SVGAnimateMotionElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAnimateTransformElement":

      return new SVGAnimateTransformElementWrappingImplementation._wrap$ctor(raw);

    case "SVGAnimationElement":

      return new SVGAnimationElementWrappingImplementation._wrap$ctor(raw);

    case "SVGCircleElement":

      return new SVGCircleElementWrappingImplementation._wrap$ctor(raw);

    case "SVGClipPathElement":

      return new SVGClipPathElementWrappingImplementation._wrap$ctor(raw);

    case "SVGComponentTransferFunctionElement":

      return new SVGComponentTransferFunctionElementWrappingImplementation._wrap$ctor(raw);

    case "SVGCursorElement":

      return new SVGCursorElementWrappingImplementation._wrap$ctor(raw);

    case "SVGDefsElement":

      return new SVGDefsElementWrappingImplementation._wrap$ctor(raw);

    case "SVGDescElement":

      return new SVGDescElementWrappingImplementation._wrap$ctor(raw);

    case "SVGElement":

      return new SVGElementWrappingImplementation._wrap$ctor(raw);

    case "SVGEllipseElement":

      return new SVGEllipseElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEBlendElement":

      return new SVGFEBlendElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEColorMatrixElement":

      return new SVGFEColorMatrixElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEComponentTransferElement":

      return new SVGFEComponentTransferElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEConvolveMatrixElement":

      return new SVGFEConvolveMatrixElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEDiffuseLightingElement":

      return new SVGFEDiffuseLightingElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEDisplacementMapElement":

      return new SVGFEDisplacementMapElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEDistantLightElement":

      return new SVGFEDistantLightElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEDropShadowElement":

      return new SVGFEDropShadowElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEFloodElement":

      return new SVGFEFloodElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEFuncAElement":

      return new SVGFEFuncAElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEFuncBElement":

      return new SVGFEFuncBElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEFuncGElement":

      return new SVGFEFuncGElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEFuncRElement":

      return new SVGFEFuncRElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEGaussianBlurElement":

      return new SVGFEGaussianBlurElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEImageElement":

      return new SVGFEImageElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEMergeElement":

      return new SVGFEMergeElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEMergeNodeElement":

      return new SVGFEMergeNodeElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEOffsetElement":

      return new SVGFEOffsetElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFEPointLightElement":

      return new SVGFEPointLightElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFESpecularLightingElement":

      return new SVGFESpecularLightingElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFESpotLightElement":

      return new SVGFESpotLightElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFETileElement":

      return new SVGFETileElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFETurbulenceElement":

      return new SVGFETurbulenceElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFilterElement":

      return new SVGFilterElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFontElement":

      return new SVGFontElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFontFaceElement":

      return new SVGFontFaceElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFontFaceFormatElement":

      return new SVGFontFaceFormatElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFontFaceNameElement":

      return new SVGFontFaceNameElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFontFaceSrcElement":

      return new SVGFontFaceSrcElementWrappingImplementation._wrap$ctor(raw);

    case "SVGFontFaceUriElement":

      return new SVGFontFaceUriElementWrappingImplementation._wrap$ctor(raw);

    case "SVGForeignObjectElement":

      return new SVGForeignObjectElementWrappingImplementation._wrap$ctor(raw);

    case "SVGGElement":

      return new SVGGElementWrappingImplementation._wrap$ctor(raw);

    case "SVGGlyphElement":

      return new SVGGlyphElementWrappingImplementation._wrap$ctor(raw);

    case "SVGGlyphRefElement":

      return new SVGGlyphRefElementWrappingImplementation._wrap$ctor(raw);

    case "SVGGradientElement":

      return new SVGGradientElementWrappingImplementation._wrap$ctor(raw);

    case "SVGHKernElement":

      return new SVGHKernElementWrappingImplementation._wrap$ctor(raw);

    case "SVGImageElement":

      return new SVGImageElementWrappingImplementation._wrap$ctor(raw);

    case "SVGLineElement":

      return new SVGLineElementWrappingImplementation._wrap$ctor(raw);

    case "SVGLinearGradientElement":

      return new SVGLinearGradientElementWrappingImplementation._wrap$ctor(raw);

    case "SVGMPathElement":

      return new SVGMPathElementWrappingImplementation._wrap$ctor(raw);

    case "SVGMarkerElement":

      return new SVGMarkerElementWrappingImplementation._wrap$ctor(raw);

    case "SVGMaskElement":

      return new SVGMaskElementWrappingImplementation._wrap$ctor(raw);

    case "SVGMetadataElement":

      return new SVGMetadataElementWrappingImplementation._wrap$ctor(raw);

    case "SVGMissingGlyphElement":

      return new SVGMissingGlyphElementWrappingImplementation._wrap$ctor(raw);

    case "SVGPathElement":

      return new SVGPathElementWrappingImplementation._wrap$ctor(raw);

    case "SVGPatternElement":

      return new SVGPatternElementWrappingImplementation._wrap$ctor(raw);

    case "SVGPolygonElement":

      return new SVGPolygonElementWrappingImplementation._wrap$ctor(raw);

    case "SVGPolylineElement":

      return new SVGPolylineElementWrappingImplementation._wrap$ctor(raw);

    case "SVGRadialGradientElement":

      return new SVGRadialGradientElementWrappingImplementation._wrap$ctor(raw);

    case "SVGRectElement":

      return new SVGRectElementWrappingImplementation._wrap$ctor(raw);

    case "SVGSVGElement":

      return new SVGSVGElementWrappingImplementation._wrap$ctor(raw);

    case "SVGScriptElement":

      return new SVGScriptElementWrappingImplementation._wrap$ctor(raw);

    case "SVGSetElement":

      return new SVGSetElementWrappingImplementation._wrap$ctor(raw);

    case "SVGStopElement":

      return new SVGStopElementWrappingImplementation._wrap$ctor(raw);

    case "SVGStyleElement":

      return new SVGStyleElementWrappingImplementation._wrap$ctor(raw);

    case "SVGSwitchElement":

      return new SVGSwitchElementWrappingImplementation._wrap$ctor(raw);

    case "SVGSymbolElement":

      return new SVGSymbolElementWrappingImplementation._wrap$ctor(raw);

    case "SVGTRefElement":

      return new SVGTRefElementWrappingImplementation._wrap$ctor(raw);

    case "SVGTSpanElement":

      return new SVGTSpanElementWrappingImplementation._wrap$ctor(raw);

    case "SVGTextContentElement":

      return new SVGTextContentElementWrappingImplementation._wrap$ctor(raw);

    case "SVGTextElement":

      return new SVGTextElementWrappingImplementation._wrap$ctor(raw);

    case "SVGTextPathElement":

      return new SVGTextPathElementWrappingImplementation._wrap$ctor(raw);

    case "SVGTextPositioningElement":

      return new SVGTextPositioningElementWrappingImplementation._wrap$ctor(raw);

    case "SVGTitleElement":

      return new SVGTitleElementWrappingImplementation._wrap$ctor(raw);

    case "SVGUseElement":

      return new SVGUseElementWrappingImplementation._wrap$ctor(raw);

    case "SVGVKernElement":

      return new SVGVKernElementWrappingImplementation._wrap$ctor(raw);

    case "SVGViewElement":

      return new SVGViewElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLScriptElement":

      return new ScriptElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLSelectElement":

      return new SelectElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLSourceElement":

      return new SourceElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLSpanElement":

      return new SpanElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLStyleElement":

      return new StyleElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTableCaptionElement":

      return new TableCaptionElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTableCellElement":

      return new TableCellElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTableColElement":

      return new TableColElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTableElement":

      return new TableElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTableRowElement":

      return new TableRowElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTableSectionElement":

      return new TableSectionElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTextAreaElement":

      return new TextAreaElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTitleElement":

      return new TitleElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLTrackElement":

      return new TrackElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLUListElement":

      return new UListElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLUnknownElement":

      return new UnknownElementWrappingImplementation._wrap$ctor(raw);

    case "HTMLVideoElement":

      return new VideoElementWrappingImplementation._wrap$ctor(raw);

    default:

      $throw(new UnsupportedOperationException($add("Unknown type:", raw.toString())));

  }
}
LevelDom.wrapSVGAnimatedLength = function(raw) {
  return null == raw ? null : null != raw.get$dartObjectLocalStorage() ? raw.get$dartObjectLocalStorage() : new SVGAnimatedLengthWrappingImplementation._wrap$ctor(raw);
}
LevelDom.wrapSVGAnimatedLengthList = function(raw) {
  return null == raw ? null : null != raw.get$dartObjectLocalStorage() ? raw.get$dartObjectLocalStorage() : new SVGAnimatedLengthListWrappingImplementation._wrap$ctor(raw);
}
LevelDom.wrapSVGAnimatedNumber = function(raw) {
  return null == raw ? null : null != raw.get$dartObjectLocalStorage() ? raw.get$dartObjectLocalStorage() : new SVGAnimatedNumberWrappingImplementation._wrap$ctor(raw);
}
LevelDom.wrapWindow = function(raw) {
  return null == raw ? null : null != raw.get$dartObjectLocalStorage() ? raw.get$dartObjectLocalStorage() : new WindowWrappingImplementation._wrap$ctor(raw);
}
LevelDom.unwrapMaybePrimitive = function(raw) {
  return (null == raw || (typeof(raw) == 'string') || (typeof(raw) == 'number') || (typeof(raw) == 'boolean')) ? raw : raw.get$_ptr();
}
LevelDom.unwrap = function(raw) {
  return null == raw ? null : raw.get$_ptr();
}
LevelDom.initialize = function() {
  $globals.secretWindow = LevelDom.wrapWindow(get$window());
  $globals.secretDocument = LevelDom.wrapDocument(get$document());
}
// ********** Code for BodyElementWrappingImplementation **************
$inherits(BodyElementWrappingImplementation, ElementWrappingImplementation);
BodyElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
BodyElementWrappingImplementation._wrap$ctor.prototype = BodyElementWrappingImplementation.prototype;
function BodyElementWrappingImplementation() {}
// ********** Code for DocumentWrappingImplementation **************
$inherits(DocumentWrappingImplementation, ElementWrappingImplementation);
DocumentWrappingImplementation._wrap$ctor = function(_documentPtr, ptr) {
  this._documentPtr = _documentPtr;
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
  this._documentPtr.get$dynamic().set$dartObjectLocalStorage(this);
}
DocumentWrappingImplementation._wrap$ctor.prototype = DocumentWrappingImplementation.prototype;
function DocumentWrappingImplementation() {}
DocumentWrappingImplementation.prototype.get$window = function() {
  return LevelDom.wrapWindow(this._documentPtr.get$defaultView());
}
// ********** Code for _ListWrapper **************
function _ListWrapper() {}
_ListWrapper.prototype.get$length = function() {
  return this._list.get$length();
}
_ListWrapper.prototype.$index = function(index) {
  return this._list.$index(index);
}
_ListWrapper.prototype.add = function(value) {
  return this._list.add(value);
}
_ListWrapper.prototype.clear = function() {
  return this._list.clear();
}
// ********** Code for ObjectElementWrappingImplementation **************
$inherits(ObjectElementWrappingImplementation, ElementWrappingImplementation);
ObjectElementWrappingImplementation._wrap$ctor = function(ptr) {
  ElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
ObjectElementWrappingImplementation._wrap$ctor.prototype = ObjectElementWrappingImplementation.prototype;
function ObjectElementWrappingImplementation() {}
ObjectElementWrappingImplementation.prototype.get$height = function() {
  return this._ptr.get$height();
}
ObjectElementWrappingImplementation.prototype.get$width = function() {
  return this._ptr.get$width();
}
// ********** Code for SVGDocumentWrappingImplementation **************
$inherits(SVGDocumentWrappingImplementation, DocumentWrappingImplementation);
SVGDocumentWrappingImplementation._wrap$ctor = function(ptr) {
  DocumentWrappingImplementation._wrap$ctor.call(this, ptr, ptr.get$rootElement());
}
SVGDocumentWrappingImplementation._wrap$ctor.prototype = SVGDocumentWrappingImplementation.prototype;
function SVGDocumentWrappingImplementation() {}
// ********** Code for SVGSVGElementWrappingImplementation **************
$inherits(SVGSVGElementWrappingImplementation, SVGElementWrappingImplementation);
SVGSVGElementWrappingImplementation._wrap$ctor = function(ptr) {
  SVGElementWrappingImplementation._wrap$ctor.call(this, ptr);
}
SVGSVGElementWrappingImplementation._wrap$ctor.prototype = SVGSVGElementWrappingImplementation.prototype;
function SVGSVGElementWrappingImplementation() {}
SVGSVGElementWrappingImplementation.prototype.get$height = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$height());
}
SVGSVGElementWrappingImplementation.prototype.get$width = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$width());
}
SVGSVGElementWrappingImplementation.prototype.get$x = function() {
  return LevelDom.wrapSVGAnimatedLength(this._ptr.get$x());
}
// ********** Code for WindowWrappingImplementation **************
$inherits(WindowWrappingImplementation, EventTargetWrappingImplementation);
WindowWrappingImplementation._wrap$ctor = function(ptr) {
  EventTargetWrappingImplementation._wrap$ctor.call(this, ptr);
}
WindowWrappingImplementation._wrap$ctor.prototype = WindowWrappingImplementation.prototype;
function WindowWrappingImplementation() {}
WindowWrappingImplementation.prototype.webkitCancelRequestAnimationFrame = function(id) {
  this._ptr.webkitCancelRequestAnimationFrame(id);
}
WindowWrappingImplementation.prototype.webkitRequestAnimationFrame = function(callback, element) {
  return this._ptr.webkitRequestAnimationFrame$2(callback, LevelDom.unwrap(element));
}
WindowWrappingImplementation.prototype.webkitRequestAnimationFrame$2 = function($0, $1) {
  return this.webkitRequestAnimationFrame(to$call$1($0), $1);
};
// ********** Code for top level **************
var _pendingRequests;
var _pendingMeasurementFrameCallbacks;
//  ********** Library html **************
// ********** Code for top level **************
var secretWindow;
var secretDocument;
function html_get$document() {
  if (null == $globals.secretWindow) {
    LevelDom.initialize();
  }
  return $globals.secretDocument;
}
//  ********** Library utilslib **************
// ********** Code for top level **************
//  ********** Library easingoff **************
// ********** Code for easingoff **************
function easingoff() {

}
easingoff.prototype.run = function() {
  var canvas = html_get$document().query("#canvas");
  var context = canvas.getContext("2d");
  var log = html_get$document().query("#log");
  var ball = new Ball(), easing = (0.05), targetX = canvas.get$width() / (2);
  ball.set$y(canvas.get$height() / (2));
  function drawFrame(t) {
    var animRequest = html_get$document().get$window().webkitRequestAnimationFrame(drawFrame, canvas);
    context.clearRect((0), (0), canvas.get$width(), canvas.get$height());
    var dx = $sub(targetX, ball.get$x());
    if (dx.abs() < (1)) {
      ball.set$x(targetX);
      html_get$document().get$window().webkitCancelRequestAnimationFrame(animRequest);
      log.set$value("Animation done!");
    }
    else {
      var vx = $mul(dx, easing);
      ball.set$x($add(ball.get$x(), vx));
    }
    ball.draw(context);
  }
  ;
  drawFrame((0));
}
// ********** Code for Ball **************
function Ball() {
  this.radius = (40);
  this.color = "#ffff00";
  this._defaultValues();
}
Ball.prototype.get$x = function() { return this.x; };
Ball.prototype.set$x = function(value) { return this.x = value; };
Ball.prototype.get$y = function() { return this.y; };
Ball.prototype.set$y = function(value) { return this.y = value; };
Ball.prototype.get$lineWidth = function() { return this.lineWidth; };
Ball.prototype.set$lineWidth = function(value) { return this.lineWidth = value; };
Ball.prototype._defaultValues = function() {
  this.x = (0);
  this.y = (0);
  this.rotation = (0);
  this.scaleX = (1);
  this.scaleY = (1);
  this.lineWidth = (1);
  this.vx = (0);
  this.vy = (0);
  this.id = "";
}
Ball.prototype.draw = function(context) {
  context.save();
  context.translate$2(this.x, this.y);
  context.rotate$1(this.rotation);
  context.scale$2(this.scaleX, this.scaleY);
  context.set$lineWidth(this.lineWidth);
  context.set$fillStyle("rgb(200,200,0)");
  context.beginPath();
  context.arc((0), (0), this.radius, (0), (6.283185307179586), true);
  context.closePath();
  context.fill();
  if (this.lineWidth > (0)) {
    context.stroke();
  }
  context.restore();
}
// ********** Code for top level **************
function main() {
  new easingoff().run();
}
// 115 dynamic types.
// 501 types
// 41 !leaf
(function(){
  var v0/*Document*/ = 'Document|HTMLDocument|SVGDocument';
  var v1/*HTMLInputElement*/ = 'HTMLInputElement|HTMLIsIndexElement';
  var v2/*SVGTextPositioningElement*/ = 'SVGTextPositioningElement|SVGAltGlyphElement|SVGTRefElement|SVGTSpanElement|SVGTextElement';
  var v3/*AudioParam*/ = 'AudioParam|AudioGain';
  var v4/*HTMLCollection*/ = 'HTMLCollection|HTMLOptionsCollection|HTMLPropertiesCollection';
  var v5/*Node*/ = [v0/*Document*/,v1/*HTMLInputElement*/,v2/*SVGTextPositioningElement*/,'Node|Attr|CharacterData|Comment|Text|CDATASection|DocumentFragment|DocumentType|Element|HTMLElement|HTMLAnchorElement|HTMLAppletElement|HTMLAreaElement|HTMLBRElement|HTMLBaseElement|HTMLBaseFontElement|HTMLBodyElement|HTMLButtonElement|HTMLCanvasElement|HTMLDListElement|HTMLDataListElement|HTMLDetailsElement|HTMLDirectoryElement|HTMLDivElement|HTMLEmbedElement|HTMLFieldSetElement|HTMLFontElement|HTMLFormElement|HTMLFrameElement|HTMLFrameSetElement|HTMLHRElement|HTMLHeadElement|HTMLHeadingElement|HTMLHtmlElement|HTMLIFrameElement|HTMLImageElement|HTMLKeygenElement|HTMLLIElement|HTMLLabelElement|HTMLLegendElement|HTMLLinkElement|HTMLMapElement|HTMLMarqueeElement|HTMLMediaElement|HTMLAudioElement|HTMLVideoElement|HTMLMenuElement|HTMLMetaElement|HTMLMeterElement|HTMLModElement|HTMLOListElement|HTMLObjectElement|HTMLOptGroupElement|HTMLOptionElement|HTMLOutputElement|HTMLParagraphElement|HTMLParamElement|HTMLPreElement|HTMLProgressElement|HTMLQuoteElement|HTMLScriptElement|HTMLSelectElement|HTMLSourceElement|HTMLSpanElement|HTMLStyleElement|HTMLTableCaptionElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableElement|HTMLTableRowElement|HTMLTableSectionElement|HTMLTextAreaElement|HTMLTitleElement|HTMLTrackElement|HTMLUListElement|HTMLUnknownElement|SVGElement|SVGAElement|SVGAltGlyphDefElement|SVGAltGlyphItemElement|SVGAnimationElement|SVGAnimateColorElement|SVGAnimateElement|SVGAnimateMotionElement|SVGAnimateTransformElement|SVGSetElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement|SVGCursorElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEDropShadowElement|SVGFEFloodElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGFontElement|SVGFontFaceElement|SVGFontFaceFormatElement|SVGFontFaceNameElement|SVGFontFaceSrcElement|SVGFontFaceUriElement|SVGForeignObjectElement|SVGGElement|SVGGlyphElement|SVGGlyphRefElement|SVGGradientElement|SVGLinearGradientElement|SVGRadialGradientElement|SVGHKernElement|SVGImageElement|SVGLineElement|SVGMPathElement|SVGMarkerElement|SVGMaskElement|SVGMetadataElement|SVGMissingGlyphElement|SVGPathElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTextContentElement|SVGTextPathElement|SVGTitleElement|SVGUseElement|SVGVKernElement|SVGViewElement|Entity|EntityReference|Notation|ProcessingInstruction'].join('|');
  var table = [
    // [dynamic-dispatch-tag, tags of classes implementing dynamic-dispatch-tag]
    ['AudioParam', v3/*AudioParam*/]
    , ['Document', v0/*Document*/]
    , ['HTMLCollection', v4/*HTMLCollection*/]
    , ['HTMLInputElement', v1/*HTMLInputElement*/]
    , ['SVGTextPositioningElement', v2/*SVGTextPositioningElement*/]
    , ['Node', v5/*Node*/]
    , ['DOMType', [v3/*AudioParam*/,v4/*HTMLCollection*/,v5/*Node*/,'DOMType|AbstractWorker|SharedWorker|Worker|ArrayBuffer|ArrayBufferView|DataView|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|Uint16Array|Uint32Array|Uint8Array|AudioBuffer|AudioContext|AudioListener|AudioNode|AudioChannelMerger|AudioChannelSplitter|AudioDestinationNode|AudioGainNode|AudioPannerNode|AudioSourceNode|AudioBufferSourceNode|MediaElementAudioSourceNode|BiquadFilterNode|ConvolverNode|DelayNode|DynamicsCompressorNode|HighPass2FilterNode|JavaScriptAudioNode|LowPass2FilterNode|RealtimeAnalyserNode|WaveShaperNode|BarInfo|Blob|File|CSSRule|CSSCharsetRule|CSSFontFaceRule|CSSImportRule|CSSMediaRule|CSSPageRule|CSSStyleRule|CSSUnknownRule|WebKitCSSKeyframeRule|WebKitCSSKeyframesRule|CSSRuleList|CSSStyleDeclaration|CSSValue|CSSPrimitiveValue|CSSValueList|WebKitCSSFilterValue|WebKitCSSTransformValue|SVGColor|SVGPaint|CanvasGradient|CanvasPattern|CanvasPixelArray|CanvasRenderingContext|CanvasRenderingContext2D|WebGLRenderingContext|ClientRect|ClientRectList|Clipboard|Coordinates|Counter|Crypto|DOMApplicationCache|DOMException|DOMFileSystem|DOMFileSystemSync|DOMFormData|DOMImplementation|DOMMimeType|DOMMimeTypeArray|DOMParser|DOMPlugin|DOMPluginArray|DOMSelection|DOMTokenList|DOMSettableTokenList|DOMURL|DOMWindow|DataTransferItem|DataTransferItemList|Database|DatabaseSync|DirectoryReader|DirectoryReaderSync|ElementTimeControl|ElementTraversal|Entry|DirectoryEntry|FileEntry|EntryArray|EntryArraySync|EntrySync|DirectoryEntrySync|FileEntrySync|Event|AudioProcessingEvent|BeforeLoadEvent|CloseEvent|CustomEvent|DeviceMotionEvent|DeviceOrientationEvent|ErrorEvent|HashChangeEvent|IDBVersionChangeEvent|MessageEvent|MutationEvent|OfflineAudioCompletionEvent|OverflowEvent|PageTransitionEvent|PopStateEvent|ProgressEvent|XMLHttpRequestProgressEvent|SpeechInputEvent|StorageEvent|TrackEvent|UIEvent|CompositionEvent|KeyboardEvent|MouseEvent|SVGZoomEvent|TextEvent|TouchEvent|WheelEvent|WebGLContextEvent|WebKitAnimationEvent|WebKitTransitionEvent|EventException|EventSource|EventTarget|FileError|FileException|FileList|FileReader|FileReaderSync|FileWriter|FileWriterSync|Geolocation|Geoposition|HTMLAllCollection|History|IDBAny|IDBCursor|IDBCursorWithValue|IDBDatabase|IDBDatabaseError|IDBDatabaseException|IDBFactory|IDBIndex|IDBKey|IDBKeyRange|IDBObjectStore|IDBRequest|IDBVersionChangeRequest|IDBTransaction|ImageData|InjectedScriptHost|InspectorFrontendHost|JavaScriptCallFrame|Location|MediaController|MediaError|MediaList|MediaQueryList|MediaQueryListListener|MemoryInfo|MessageChannel|MessagePort|Metadata|MutationCallback|MutationRecord|NamedNodeMap|Navigator|NodeFilter|NodeIterator|NodeList|NodeSelector|Notification|NotificationCenter|OESStandardDerivatives|OESTextureFloat|OESVertexArrayObject|OperationNotAllowedException|Performance|PerformanceNavigation|PerformanceTiming|PointerLock|PositionError|RGBColor|Range|RangeException|Rect|SQLError|SQLException|SQLResultSet|SQLResultSetRowList|SQLTransaction|SQLTransactionSync|SVGAngle|SVGAnimatedAngle|SVGAnimatedBoolean|SVGAnimatedEnumeration|SVGAnimatedInteger|SVGAnimatedLength|SVGAnimatedLengthList|SVGAnimatedNumber|SVGAnimatedNumberList|SVGAnimatedPreserveAspectRatio|SVGAnimatedRect|SVGAnimatedString|SVGAnimatedTransformList|SVGElementInstance|SVGElementInstanceList|SVGException|SVGExternalResourcesRequired|SVGFitToViewBox|SVGLangSpace|SVGLength|SVGLengthList|SVGLocatable|SVGTransformable|SVGMatrix|SVGNumber|SVGNumberList|SVGPathSeg|SVGPathSegArcAbs|SVGPathSegArcRel|SVGPathSegClosePath|SVGPathSegCurvetoCubicAbs|SVGPathSegCurvetoCubicRel|SVGPathSegCurvetoCubicSmoothAbs|SVGPathSegCurvetoCubicSmoothRel|SVGPathSegCurvetoQuadraticAbs|SVGPathSegCurvetoQuadraticRel|SVGPathSegCurvetoQuadraticSmoothAbs|SVGPathSegCurvetoQuadraticSmoothRel|SVGPathSegLinetoAbs|SVGPathSegLinetoHorizontalAbs|SVGPathSegLinetoHorizontalRel|SVGPathSegLinetoRel|SVGPathSegLinetoVerticalAbs|SVGPathSegLinetoVerticalRel|SVGPathSegMovetoAbs|SVGPathSegMovetoRel|SVGPathSegList|SVGPoint|SVGPointList|SVGPreserveAspectRatio|SVGRect|SVGRenderingIntent|SVGStringList|SVGStylable|SVGFilterPrimitiveStandardAttributes|SVGTests|SVGTransform|SVGTransformList|SVGURIReference|SVGUnitTypes|SVGZoomAndPan|SVGViewSpec|Screen|ScriptProfile|ScriptProfileNode|SpeechInputResult|SpeechInputResultList|Storage|StorageInfo|StyleMedia|StyleSheet|CSSStyleSheet|StyleSheetList|TextMetrics|TextTrack|TextTrackCue|TextTrackCueList|TextTrackList|TimeRanges|Touch|TouchList|TreeWalker|ValidityState|WebGLActiveInfo|WebGLBuffer|WebGLCompressedTextures|WebGLContextAttributes|WebGLDebugRendererInfo|WebGLDebugShaders|WebGLFramebuffer|WebGLLoseContext|WebGLProgram|WebGLRenderbuffer|WebGLShader|WebGLTexture|WebGLUniformLocation|WebGLVertexArrayObjectOES|WebKitAnimation|WebKitAnimationList|WebKitBlobBuilder|WebKitCSSMatrix|WebKitMutationObserver|WebKitNamedFlow|WebKitPoint|WebSocket|WorkerContext|DedicatedWorkerContext|SharedWorkerContext|WorkerLocation|WorkerNavigator|XMLHttpRequest|XMLHttpRequestException|XMLHttpRequestUpload|XMLSerializer|XPathEvaluator|XPathException|XPathExpression|XPathNSResolver|XPathResult|XSLTProcessor'].join('|')]
  ];
  $dynamicSetMetadata(table);
})();
var $globals = {};
main();
