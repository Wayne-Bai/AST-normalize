/*
Ockley 1.0
Copyright 2011,  Matthew Page
licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
*/
module.exports = {
  stylesheets: function() {
    return ["//ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css",
            "libs/codemirror2/lib/codemirror.css",
            "libs/codemirror2/theme/default.css",
            "css/editor.css",
            "css/apex.css"];
  },
  scripts: function(){
    return ["libs/underscore/underscore-min.js",
            "libs/backbone/backbone.js",
            "//ajax.aspnetcdn.com/ajax/jquery.templates/beta1/jquery.tmpl.min.js",
            "//ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js",
            "libs/ui.tabs.closable/ui.tabs.closable.min.js",
            "libs/jquery.ui.selectmenu.js",
            "libs/codemirror2/lib/codemirror.js",
            "libs/codemirror2/mode/htmlmixed/htmlmixed.js",
            "libs/codemirror2/mode/xml/xml.js",
            "libs/codemirror2/mode/css/css.js",
            "libs/codemirror2/mode/javascript/javascript.js",
            "libs/miniTip/jquery.miniTip.min.js",
            "js/apex.js",
            "js/messagedialog.js",
            "js/finddialog.js",
            "js/newdialog.js",
            "js/toolbar.js",
            "js/doc.js",
            "js/doclist.js",
            "js/doclistitem.js",
            "js/editortabs.js",
            "js/editorview.js"];
  }
};

