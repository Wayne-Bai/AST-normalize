(function($) {

    $.fn.MadnessEnjineer = function(options) {
        // FUNCTIONS
        function saveSelection() {
	        // Remove markers for previously saved selection
	        if (savedSel) {
	            rangy.removeMarkers(savedSel);
	        }
	        savedSel = rangy.saveSelection();
	        savedSelActiveElement = document.activeElement;
	    }

	    function restoreSelection() {
	        if (savedSel) {
	            rangy.restoreSelection(savedSel, true);
	            window.setTimeout(function() {
	                if (savedSelActiveElement && typeof savedSelActiveElement.focus != "undefined") {
	                    savedSelActiveElement.focus();
	                }
	            }, 1);
	        }
	    }

        //Set Defaults (OPTS) 
        var opts = $.extend({
                rte_id: "rte-wysiwyg",
                rte_code: "rte-code",
                rte_preview: "rte-preview",
                rte_tabs: "rte-tabs",
                rte_controls: "rte-controls"
            }, options),

            //Global Vars
            editor,
            savedSel = null,
            savedSelActiveElement = null,
            $this = $(this);

        // Set document editing rules
        document.execCommand('insertBrOnReturn', false, true);
        document.execCommand('enableObjectResizing', false, true);

        // Create Editor View
        $rte = $("<div />").attr({
            id: opts.rte_id,
            contentEditable: "true",
            unselectable: "false"
        }).html($this.html());

        // Create Code View
        $code = $("<div />").attr({
            id: opts.rte_code
        });

        // Create Preview
        $preview = $("<div />").attr({
            id: opts.rte_preview
        });

        // Build RTE
        $this.html($rte);
        if (opts.rte_code) {
            $code.html($rte.html());
            $this.append($code);
        }
        if (opts.rte_preview) {
            $this.append($preview);
        }
        if (opts.rte_tabs) {
            $('#' + opts.rte_id).addClass("tab-pane, active");
            $('#' + opts.rte_code).addClass("tab-pane");
            $('#' + opts.rte_preview).addClass("tab-pane");
            $('#' + opts.rte_tabs).tab();
        }

        // Start ACE Editor
        editor = ace.edit(opts.rte_code);
        editor.getSession().setMode("ace/mode/html");

        // EVENT HANDLERS
        $('#' + opts.rte_preview).on("click", function(){
            $('#' + opts.rte_preview).html($('#' + opts.rte_id).html());
        });
        editor.getSession().on("change", function() {
            try {
                $("#" + opts.rte_id).html(editor.getSession().getValue());
            } catch (e) {
                console.log(e);
            }
        });
        $(".tab-code, .tab-preview").on("mousedown", function(e) {
            $("#" + opts.rte_controls).fadeOut();
            $("#rte").css("bottom", "0");
        });
        $(".tab-wysiwyg").on("mousedown", function() {
            $("#" + opts.rte_controls).fadeIn();
            $("#rte").css("bottom", "33px");
        });
        $(document).on("input, blur", "#" + opts.rte_id, function() {
            try {
                editor.getSession().setValue($("#" + opts.rte_id).html());
            } catch (e) {
                console.log(e);
            }
        });

        //Color pickers
        $('[data-rte="bColor"],[data-rte="fColor"]').on("mousedown", function() {
            saveSelection();
            $(this).find("input").trigger("click");
            return false;
            
        });
        $('[data-rte="bColor"] input').on("change", function() {
            //document.execCommand('backColor', false, $(this).val());
            $rte.css("background-color", $(this).val());
            //$('[data-rte="bColor"] i').css('color',$(this).val());
        });
        $('[data-rte="fColor"] input').on("change", function() {
            restoreSelection();
            document.execCommand('foreColor', false, $(this).val());
        });


        //Bold Text
        $('[data-rte="bold"]').on("mousedown", function() {
            document.execCommand('bold', false, null);
            return false;
        });

        //Italicize Text
        $('[data-rte="italic"]').on("mousedown", function() {
            document.execCommand('italic', false, null);
            return false;
        });
        //Underline Text
        $('[data-rte="underline"]').on("mousedown", function() {
            document.execCommand('underline', false, null);
            return false;
        });
        //Strike Text
        $('[data-rte="strike"]').on("mousedown", function() {
            document.execCommand('strikeThrough', false, null);
            return false;
        });
        //Justify Left Line
        $('[data-rte="aLeft"]').on("mousedown", function() {
            document.execCommand('justifyLeft', false, null);
            return false;
        });
        //Justify Center Line
        $('[data-rte="aCenter"]').on("mousedown", function() {
            document.execCommand('justifyCenter', false, null);
            return false;
        });
        //Justify Right Line
        $('[data-rte="aRight"]').on("mousedown", function() {
            document.execCommand('justifyRight', false, null);
            return false;
        });
        //Justify Full Line
        $('[data-rte="aJustify"]').on("mousedown", function() {
            document.execCommand('justifyFull', false, null);
            return false;
        });
        //Create UL
        $('[data-rte="ul"]').on("mousedown", function() {
            document.execCommand('insertUnorderedList', false, null);
            return false;
        });
        //Create OL
        $('[data-rte="ol"]').on("mousedown", function() {
            document.execCommand('insertOrderedList', false, null);
            return false;
        });
        //Create P
        $('[data-rte="p"]').on("mousedown", function() {
            document.execCommand('insertParagraph', false, null);
            return false;
        });
        //Indent Line
        $('[data-rte="indent"]').on("mousedown", function() {
            document.execCommand('indent', false, null);
            return false;
        });
        //Outdent Line
        $('[data-rte="outdent"]').on("mousedown", function() {
            document.execCommand('outdent', false, null);
            return false;
        });
        //Create Link Popup
        $('[data-rte="link"]').on("mousedown", function() {
            var link = prompt("Please enter link address");

            if (link && link != '' && link != 'http://') {
                document.execCommand('createlink', false, link);
            }
            return false;
        });
    };
})(jQuery);
