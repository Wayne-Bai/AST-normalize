/*
 * Copyright (C) 2012-2013 CloudJee, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


/* LOCALIZATION NOTES:
 * This file is not localized at this time as we do not believe that localization of
 * custom javascript code is likely to be supported.
 */
dojo.provide("wm.studio.app.events");

terminus = "_end: 0";
pageScript = function(name, defaultFunctions) {
    if (defaultFunctions && !defaultFunctions.match(/,\s*$/)) defaultFunctions += ",";
    return [
        'dojo.declare("' + name + '", wm.Page, {',
        '    start: function() {',
        '        ',
        '    },',
             (defaultFunctions ? "    " + defaultFunctions : ""),
        '    ' + terminus,
        '});'
    ].join('\n');
}

getEvent = function(name, text) {
    //var r = new RegExp(name + ":\\s+function\\(.*?},$", "m");
    var r = new RegExp(name + ": function\\(", "");
    var m = text.match(r)||[];
    //console.log(r.source, m);
    return (m[0]||'').replace(/\r/g, "");
}

getArgs = function(ctrl, name) {
    var fn = ctrl._designee.constructor.prototype[name], m = fn&&fn.toString().match(/function\s*\(([^)]*)/);
    //return m&&m[1]&&(", " + m[1]) || " /*,args*/";
    return !m&&" /*,args*/" || m[1]&&(", " + m[1]) || "";
}

getEventCode = function(ctrl, name, value, code) {
    var a = getArgs(ctrl, name);
    if (wm.isInstanceType(ctrl, wm.Page))
    a = a.substring(1);
    else
    a = "inSender" + a;
    return value + ": function(" + a + ") {\n        " + code + "\n    },\n    ";

}

/* Does not appear to get called */
writeCodeFragment = function(code) {
    var t = studio.getScript();
    studio.setScript(t.replace(terminus, code + terminus));
}

removeCodeFragment = function(start, end) {
    var code = studio.getScript();
    var re = new RegExp("\\/\\*\\s+" + start + "\\s+\\*\\/[\\S\\s]*\\/\\*\\s+" + end + "\\s+\\*\\/.*\n    ", "i");
    code = code.replace(re, "");
    studio.setScript(t);
}


eventList = function(eventname, editor) {
  var tmpEventName = eventname.replace(/^on/,"");
  var code = editor.getText();
  var reg = new RegExp("\\bon\\S*" + tmpEventName + "\\:\\s*function", "gi");
  var results = code.match(reg);
  if (results == null) {
    return [];
  }
  for (var i = 0; i < results.length; i++) {
    results[i] = results[i].replace(/\:.*$/, "");
  }
  return results;
}

getAllEventsInCode = function() {
  var code = studio.getScript();
  var reg = new RegExp("\\b\\S*.*" + "\\:\\s*function", "gi");
  var results = code.match(reg);
  if (results == null) {
    return [];
  }
  for (var i = 0; i < results.length; i++) {
    results[i] = results[i].replace(/\s*\:.*$/, "");
  }
  results = wm.Array.removeElement(results, "start"); // pretty rare we'll want to list this
  return results;
}

eventEdit = function(ctrl, name, value, noInSenderInArgs, optionalArgList) {
    var appLevel = ctrl instanceof wm.Application || ctrl.owner instanceof wm.Application;
    var code = (appLevel) ? studio.getAppScript() : studio.getScript();

    if (wm.isInstanceType(ctrl, wm.Page))
    value = name;
    if (!getEvent( value, code)) {
    var a = (optionalArgList) ? ", " + optionalArgList : getArgs(ctrl, name);
    if (wm.isInstanceType(ctrl, wm.Page) || noInSenderInArgs)
        a = a.substring(1);
    else
        a = "inSender" + a;
    code = code.replace(terminus, value + ": function(" + a + ") {\n        \n    },\n    " + terminus);
    if (appLevel)
        studio.setAppScript(code);
    else
        studio.setScript(code);
    }

    studio.navGotoSourceClick();
    studio.sourceTabs.setLayer((appLevel) ? "appsource" : "scriptLayer");
    caretToEvent(value, appLevel ? studio.appsourceEditor : studio.editArea);
}

eventChange = function(editor, oldName, newName) {
    if (oldName && newName && oldName!=newName) {
        var r  = new RegExp(oldName + ": function\\(", "m");

        var r2 = new RegExp("console.error\\('ERROR IN " + oldName + ": ", "m");
        var code = editor.getText();
        code = code.replace(r, newName + ": function(");
        code = code.replace(r2, "console.error('ERROR IN " + newName + ": ");
        editor.setText(code);
    }
}

eventCopy = function(editor,oldName, newName) {
    if (oldName && newName && oldName!=newName) {
        var r = new RegExp(oldName + ": function(\\(.*?\\))", "m");
            var code = editor.getText();
                var match = code.match(r);
                if (!match) return;
                if (getEvent(newName, code)) return;
            var newcode = newName + ": function" + match[1] + " {\n      this." + oldName + match[1] + ";\n    },\n  ";
        editor.setText(code.replace(terminus,  newcode +  terminus));
    }
}


caretToEvent = function(name, editor) {
    var r = new RegExp("[\\s\\S]*" + name + ": function\\([\\s\\S]*?{[\\s\\S]*?\\n[^\\n\\r\\S]*", "m");

    var t = editor.getText();
    var m = t.match(r);
    if (m)
        editor.setCursorPositionInText(m[0].length);
}

/*setCaretPosition = function(ctrl, pos){
    if(ctrl.setSelectionRange){
        ctrl.focus();
        ctrl.setSelectionRange(pos,pos);
    } else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    } else return false;
}*/

textareaTab = function(e) {
    var t = e.target;
    if (t && t.tagName=='TEXTAREA' && e.keyCode==dojo.keys.TAB) {
        //IE
        if(document.selection){
            t.focus();
            var sel = document.selection.createRange();
            sel.text = "    ";
        }
        //Mozilla + Netscape
        else if(t.selectionStart || t.selectionStart == "0"){
            var scrollY = t.scrollTop, scrollX = t.scrollLeft, start = t.selectionStart, end = t.selectionEnd;
            t.value = t.value.substring(0,start) + "    " + t.value.substring(end,t.value.length);
            t.focus();
            t.selectionStart = t.selectionEnd = start+1;
            t.scrollTop = scrollY;
            t.scrollLeft = scrollX;
        }
        else t.value += "    ";
        dojo.stopEvent(e);
    }
}

dojo.addOnLoad(function(){
    dojo.connect(document, "keypress", textareaTab);
});
