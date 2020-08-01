/* node-highlight is based on highlight.js (see vendor/highlight.js)       */
/* usage: html = require("highlight").Highlight(code_string);              */
/* NB! You also need to include a CSS file from vendor/highlight.js/styles */

// load syntax highlighter
var hljs = require("./vendor/highlight.js/highlight").hljs;

// load lang
require("./vendor/highlight.js/languages/javascript")(hljs);



/**
 * highlight(text, tabReplace, useCodeBlocks) -> HTML
 * - text (String): text to be highlighted
 * - tabReplace (String): defaults to 4 spaces if none, replaces \t chars
 * - useCodeBlocks (Boolean): If TRUE use only text between <code> and </code>
 *
 * Highlights program code inside a string by setting appropriate CSS class
 * elements.
 **/
this.Highlight = function(text, tabReplace, useCodeBlocks){
    tabReplace = tabReplace || '    ';
    if(!!useCodeBlocks){
        // JS regexpes have some multiline issues, so we temporarily remove them
        return text.replace(/\n/g,'\uffff').replace(/<code>(.*?)<\/code>/gm, function(original, source){
            return '<code>'+hljs.highlightText(source.replace(/\uffff/g,"\n"), tabReplace)+'</code>';
        }).replace(/&amp;(\w+;)/g,'&$1').replace(/\uffff/g,"\n");
    }else
        return hljs.highlightText(text, tabReplace);
}
