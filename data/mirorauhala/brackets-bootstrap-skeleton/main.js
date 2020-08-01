/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 2, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
  "use strict";
  /*
   * Simple extension that adds a "File > New Bootstrap 3 Document" menu item
   * to insert an Bootstrap 3 HTML "skeleton" at cursor position
   */
  var AppInit            = brackets.getModule("utils/AppInit"),
      CommandManager     = brackets.getModule("command/CommandManager"),
      EditorManager      = brackets.getModule("editor/EditorManager"),
      Menus              = brackets.getModule("command/Menus"),
      PreferencesManager = brackets.getModule("preferences/PreferencesManager");

  // The user's indentation settings
  var indentUnits  = "";

  // jQuery version constant
  var JQUERY_VERSION = "1.11.1";


  /**
   * @private
   * http://stackoverflow.com/a/4550005
   * @param str Text to be repeated.
   * @param num Number of times text should be repeated.
   * @return {string} repeated the number of times stated.
   */
  function _repeatString(str, num) {
    return (new Array(num + 1)).join(str);
  }

  /**
   * @private
   * Get the current indentation settings for use in inserted code
   * @return {string} User's current indentation settings
   */
  function _getIndentSize() {
    // Check the current project's preference on tabs and
    // update the indentation settings for either tabs for spaces
    return (PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT) ?
            _repeatString("\u0009", PreferencesManager.get("tabSize")) :
            _repeatString("\u0020", PreferencesManager.get("spaceUnits")));
  }
  
  /**
   * @private
   * Set the current indentation settings for use in inserted code
   */
  function _setIndentSize() {
    // Do NOT attempt to assign `indentUnits` directly to the function.
    // It will completely break otherwise.
    var tempVar  = _getIndentSize();
    indentUnits  = tempVar;
  }


  // Get user's indentation settings
  PreferencesManager.on("change", function (e, data) {
    data.ids.forEach(function (value, index) {
      // A relevant preference was changed, update our settings
      if (value === "useTabChar" || value === "tabSize" || value === "spaceUnits") {
        _setIndentSize();
      }
    });
  });


  /**
   * @private
   * Get the latest stable Boostrap version using the GitHub API
   */
  function _getLatestBootstrap() {
    // However, we define a fallback just in case...
    var fallbackVersion = "3.2.0";
    var result = new $.Deferred();

    // Perform an asynchronous request
    $.ajax({
      cache: true,
      dataType: "json",
      url: "https://api.github.com/repos/twbs/bootstrap/releases",
      success: function(data) {
        // Do not accept prereleases
        if (!data[0].prerelease) {
          result.resolve(data[0].tag_name.replace(/^v/, ""));
        }
      },
      error: function() {
        result.resolve(fallbackVersion);
      }
    });
    return result.promise();
  }


  /**
   * @private
   * Insert the selected elements into the document
   */
  function _inserthtmlSkelly() {

    var htmlSkelly = "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n" +
        "indent-size<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
        "indent-size<meta name='description' content=''>\nindent-size<meta name='author' content=''>\n" +
        "indent-size<title>Starter Template for Bootstrap boots-version</title>\nindent-size<link rel='shortcut icon' href=''>\n" +
        "indent-size<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/boots-version/css/bootstrap.min.css'>\n" +
        "indent-size<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/boots-version/css/bootstrap-theme.min.css'>\n" +
        "indent-size<style>body{padding-top:50px;}.starter-template{padding:40px 15px;text-align:center;}</style>\n\n" +
        "indent-size<!--[if IE]>\nindent-sizeindent-size<script src='https://cdn.jsdelivr.net/html5shiv/3.7.2/html5shiv.min.js'></script>\n" +
        "indent-sizeindent-size<script src='https://cdn.jsdelivr.net/respond/1.4.2/respond.min.js'></script>\nindent-size<![endif]-->\n" +
        "</head>\n\n<body>\nindent-size<nav class='navbar navbar-inverse navbar-fixed-top' role='navigation'>\n" +
        "indent-sizeindent-size<div class='container'>\nindent-sizeindent-sizeindent-size<div class='navbar-header'>\n" +
        "indent-sizeindent-sizeindent-sizeindent-size<button type='button' class='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'>\n" +
        "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='sr-only'>Toggle navigation</span>\n" +
        "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='icon-bar'></span>\n" +
        "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='icon-bar'></span>\n" +
        "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='icon-bar'></span>\nindent-sizeindent-sizeindent-sizeindent-size</button>\n" +
        "indent-sizeindent-sizeindent-sizeindent-size<a class='navbar-brand' href='#'>Project name</a>\nindent-sizeindent-sizeindent-size</div>\n\n" +
        "indent-sizeindent-sizeindent-size<div class='collapse navbar-collapse'>\n" +
        "indent-sizeindent-sizeindent-sizeindent-size<ul class='nav navbar-nav'>\n" +
        "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<li class='active'><a href='#'>Home</a></li>\n" +
        "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<li><a href='#about'>About</a></li>\n" +
        "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<li><a href='#contact'>Contact</a></li>\n" +
        "indent-sizeindent-sizeindent-sizeindent-size</ul>\nindent-sizeindent-sizeindent-size</div><!--.nav-collapse -->\n" +
        "indent-sizeindent-size</div>\nindent-size</nav>\n\n" +
        "indent-size<div class='container'>\nindent-sizeindent-size<div class='starter-template'>\n" +
        "indent-sizeindent-sizeindent-size<h1>Hello, world!</h1>\n" +
        "indent-sizeindent-sizeindent-sizeindent-size<p class='lead'>Now you can start your own project with <a target='_blank' href='http://getbootstrap.com/'>Bootstrap boots-version</a>. This plugin is a fork from <a href='https://github.com/le717/brackets-html-skeleton#readme'>HTML Skeleton</a>.</p>\n" +
        "indent-sizeindent-size</div>\nindent-size</div>\n\n" +
        "indent-size<script src='https://ajax.googleapis.com/ajax/libs/jquery/jq-version/jquery.min.js'></script>\n" +
        "indent-size<script src='https://maxcdn.bootstrapcdn.com/bootstrap/boots-version/js/bootstrap.min.js'></script>\n" +
        "</body>\n</html>\n";

    // Since fetching the lastest version is an async process,
    // the rest of the actions need to be too
    _getLatestBootstrap().then(function (version) {
      var editor = EditorManager.getCurrentFullEditor();
      if (editor) {
        // Insert the skeleton at the current cursor position
        var insertionPos = editor.getCursorPos();
        editor.document.batchOperation(function () {
          // Do a regex search for asset version keywords
          // and replace them with the appropriate version number,
          // as well as for the `indent-size` keyword with indentation settings
          // Also replace all single quotes with double quotes
          htmlSkelly = htmlSkelly.replace(/boots-version/g, version)
                                 .replace(/jq-version/g, JQUERY_VERSION)
                                 .replace(/indent-size/g, indentUnits)
                                 .replace(/'/g, "\"");
          editor.document.replaceRange(htmlSkelly, insertionPos);
        });
      }
    });
  }


  /**
   * @private
   * Load the extension after Brackets itself has finished loading.
   */
  AppInit.appReady(function () {
    var EXTENSION_ID = "mirorauhala.bootstrap-skeleton";
    CommandManager.register("New Bootstrap 3 Document", EXTENSION_ID, _inserthtmlSkelly);
    var theMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    theMenu.addMenuItem(EXTENSION_ID);
    _setIndentSize();
  });
});
