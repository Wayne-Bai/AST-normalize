/* See license.txt for terms of usage */

define([
    "httpmonitor/lib/trace",
    "httpmonitor/lib/dom",
    "httpmonitor/lib/url",
    "httpmonitor/chrome/chrome",
],
function(FBTrace, Dom, Url, Chrome) {

// ********************************************************************************************* //
// Constants

var Ci = Components.interfaces;
var Cc = Components.classes;
var Cu = Components.utils;

var Fonts = {};

// ********************************************************************************************* //
// Fonts

/**
 * Retrieves all fonts used inside a node
 * @node: Node to return the fonts for
 * @return Array of fonts
 */
Fonts.getFonts = function(node)
{
    if (!Dom.domUtils)
        return [];

    var range = node.ownerDocument.createRange();
    range.selectNode(node);
    var fontFaces = Dom.domUtils.getUsedFontFaces(range);
    var fonts = [];
    for (var i=0; i<fontFaces.length; i++)
        fonts.push(fontFaces.item(i));

    return fonts;
}

/**
 * Retrieves the information about a font
 * @context: Context of the font
 * @win: Window the font is used in
 * @identifier: Either a URL in case of a Fonts font or the font name
 * @return Object with information about the font
 */
Fonts.getFontInfo = function(context, win, identifier)
{
    if (!context)
        context = Chrome.currentContext;

    var doc = win ? win.document : context.window.document;
    if (!doc)
    {
        if (FBTrace.DBG_ERRORS)
            FBTrace.sysout("lib.getFontInfo; NO DOCUMENT", {win:win, context:context});
        return false;
    }

    var fonts = Fonts.getFonts(doc.documentElement);
    var url = Url.splitURLBase(identifier);

    if (FBTrace.DBG_FONTS)
        FBTrace.sysout("Fonts.getFontInfo;", {fonts:fonts, url:url});

    for (var i=0; i<fonts.length; i++)
    {
        if ((fonts[i].rule && url && identifier == fonts[i].URI) ||
            identifier == fonts[i].CSSFamilyName || identifier == fonts[i].name)
        {
            return fonts[i];
        }
    }

    return false;
}

// ********************************************************************************************* //

return Fonts;

// ********************************************************************************************* //
});