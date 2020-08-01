/* JadEdit - An embeddable JavaScript editor using Jade template syntax.
 * ===================================================================== */

// The staring point of the applications. Initializes the components
// =================================================================

(function Main(EDITOR) {
	var $placeHolder = $("#jadedit");

	// Storing posted/cached data for translation
	var existingContents = $placeHolder.val();
	$placeHolder.val('');

	// Making sure JadEdit containers exist
	if (!$placeHolder.length && !$placeHolder.attr('name').length) {
		document.write('invalid config.');
	}

	// Loading required CodeMirror modules
	$('head').append('<link type="text/css" rel="stylesheet" href="/default.css" />');
	$('head').append('<link type="text/css" rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/codemirror.min.css" />');
	$('head').append('<link type="text/css" rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/theme/ambiance.min.css" />');
	$.ajaxSetup({cache: true});
	$.getScript("//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/codemirror.min.js", function () {
		$.when(
				$.getScript('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/mode/javascript/javascript.min.js'),
				$.getScript('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/mode/xml/xml.min.js'),
				$.getScript('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/mode/css/css.min.js'),
				$.getScript('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/mode/jade/jade.min.js'),
				$.getScript('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.21.0/mode/htmlmixed/htmlmixed.min.js'),
				$.Deferred(function (deferred) {
					$(deferred.resolve);
				})
			).then(function () {
				start();
			});
	});

	function start() {
		$.ajaxSetup({cache: false});

		// Puts editor templates next to the original textarea,
		// then put the textarea into editor container element.
		$placeHolder.after(EDITOR.getEditorTemplate($placeHolder.attr('name')));
		$placeHolder.attr('name', "");
		$placeHolder.appendTo("#jadedit-editor-view");

		var editor = CodeMirror.fromTextArea($placeHolder[0], {
			lineNumbers: true,
			theme: 'ambiance',
			mode: 'jade'
		});

		var sourceEditor = CodeMirror.fromTextArea(document.getElementById('jadedit-source-view-textarea'), {
			lineNumbers: true,
			theme: 'ambiance',
			mode: 'htmlmixed'
		});

		var editorElements = {
			$editorButton: $("#jadedit-editor-button"),
			$previewButton: $('#jadedit-preview-button'),
			$sourceButton: $('#jadedit-source-button'),
			$sourcePin: $('#jadedit-source-pin'),
			$previewPin: $('#jadedit-preview-pin'),
			$editorView: $('#jadedit-editor-view'),
			$sourceView: $('#jadedit-source-view'),
			$previewView: $('#jadedit-preview-view'),
			$hidden: $('#jadedit-hidden'),
			editor: editor,
			sourceEditor: sourceEditor
		};

		EDITOR.registerEditorEvents(editorElements);

		EDITOR.loadInitialData(editor, existingContents);
	}
}(EDITOR));