/* Writerrific
Created by Laurens Debackere
On March 30th 2013

Licensed under the GPL license.
Please, leave this attribution unless you actually contribute to the code and change something.
-main.js-
Main javascript file, containing everything this app needs
*/

// This function generates the iframe content and then adds it to the iframe
function generateIframe(){
    var md = $('#input').val();
    var converter = new Markdown.Converter();
  var html = converter.makeHtml(md);
    document.getElementById('output').innerHTML = html;
}

// When ready...
window.addEventListener("load",function() {
  // Set a timeout...
  setTimeout(function(){
    // Hide the address bar!
    window.scrollTo(0, 1);
  }, 0);
});


// The save to localstorage functions, used for the persistance of the textarea
function saveIt() {
  var editor = document.querySelector("#input"); 
  if (window.localStorage["TextEditorData"]) { 
    editor.value = window.localStorage["TextEditorData"]; 
   }    
  editor.addEventListener("keyup", function() { 
    window.localStorage["TextEditorData"] = editor.value;
  });
}

jQuery(document).ready(function($) { // On ready function
	/*TEXTAREA: Autofocus */
 $("textarea:visible:enabled:first").focus();

 
/* IFRAME: Hide By Default */
 $('#output').toggle();

/* IFRAME: Preview Toggle */
 $("#preview").click(function() {
    $('#output').toggle();
     $(this).text(function(i, text){
          return text === 'Preview' ? 'Close Preview' : 'Preview';
      })
 });

 /* FULLSCREEN: Toggle the "Distraction Free"-mode */
 $('#full').click(function() {
            screenfull.toggle();
              $("#full").text(function(i, text){
          return text === "Distraction Free" ? "Exit Distraction Free" : "Distraction Free";
      })
        });

  /* EXTRA: Load the functions so that no keyup is required upon launch of the app */
  saveIt();
  generateIframe();

  /* EXTRA: Load the share function on launch so no keyup is required. */
  var md = $('#input').val();
  $("#mail").attr("href", "mailto:change@me.com?&body=" + encodeURIComponent(md));

});



/* SHARE: Change the content of the share function on keyup */
$('#input').keyup(function() {
    var md = $('#input').val();
$("#mail").attr("href", "mailto:change@me.com?&body=" + encodeURIComponent(md));
});


/* IFRAME: Regenerate on keyup */
$('#input').keyup(function() {
  generateIframe();
});


/* TEXTAREA: The rich text editor functions. */


/* TEXTAREA: Add code */
$("#code").click(function() {
var code = "``\nalert('Hello World!');\n``";
var already = $('textarea#input').val();
var total = already + code;
$("textarea#input").val(total);
$("textarea").focus();
  generateIframe();
});


/* TEXTAREA: Add image */
$("#image").click(function() {
var image = '![picture alt](http://placekitten.com/200/300 "Cats Are Awesome (title)")';
var already = $('textarea#input').val();
var total = already + image;
$("textarea#input").val(total);
  generateIframe();
});

/* TEXTAREA: Add h1 */
$("#h1").click(function() {
var h1 = '#Title';
var already = $('textarea#input').val();
var total = already + h1;
$("textarea#input").val(total);
$("textarea").focus();
  generateIframe();
});

/* TEXTAREA: Add h2 */
$("#h2").click(function() {
var h2 = '##Subheader';
var already = $('textarea#input').val();
var total = already + h2;
$("textarea#input").val(total);
$("textarea").focus();
  generateIframe();
});

/* TEXTAREA: Add link */
$("#link").click(function() {
var link = '[Google](http://google.com)';
var already = $('textarea#input').val();
var total = already + link;
$("textarea#input").val(total);
$("textarea").focus();
  generateIframe();
});

/* TEXTAREA: Add blockquote */
$("#blockquote").click(function() {
var quote = '> To dare mighty things...';
var already = $('textarea#input').val();
var total = already + quote;
$("textarea#input").val(total);
$("textarea").focus();
  generateIframe();
});

/* TEXTAREA: Add list */
$("#list").click(function() {
var list = "* First thing \n* Second thing \n* Third Thing";
var already = $('textarea#input').val();
var total = already + list;
$("textarea#input").val(total);
$("textarea").focus();
  generateIframe();
});
