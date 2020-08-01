/*matisse.events*/
define(["matisse", "matisse.util", "matisse.layouts.content"], function (matisse, util, layoutsContent) {
    "use strict";
    return {

        /**
         * Handler for Import Image Button Click
         * @method importImageButtonClickHandler
         * @param none
         */
       /* importImageButtonClickHandler: function () {
            $('#loadicon').bind("click", function () {
                var args = {};
                args.path = 'images/conventional-html-layout.png';
                args.name = "importimage";
                args.left = 300;
                args.top = 200;
                args.uid = util.uniqid();
                args.palette = 'imagepalette';
                loadImage(args);
            });
        },*/

        /**
         * Handler for New Document Button Click
         * @method newButtonClickHanlder
         * @param none
         */
        newButtonClickHanlder: function () {
            $('#newdocicon').bind("click", function () {
                var pageURL = document.location.href;
                // get the index of '/' from url (ex:http://localhost:8000/qd7kt3vd)
                var indx = pageURL.indexOf('/');
                pageURL = pageURL.substr(0, indx);
                window.open(pageURL + '/boards/', "mywindow");
            });
        },

        /**
         * Open a Properties panel for currently selected object
         * @method openPropertiesPanel
         * @param none
         */
        openPropertiesPanel: function () {
            if (canvas.getActiveObject() === undefined) {
                return;
            }
            var win_width = $(window).width() - 300;
            var menu_width = $('div.bottom').width();
            $('#propdiv').dialog({
                position: [win_width - menu_width, 300]
            });
            $('#propdiv').dialog('open');
        },
        
        /**
         * Opens whiteboard actions submenu
         * @method openSubmenu
         * @param event
         */
        openSubmenu: function (event) {
        	event.stopPropagation();
        	var $this = $(this).find('div.m-submenu-list').first();
        	if(!$this.is(":visible")) {
        		$this.show();
        		$('body').one("click", {list : $this}, function (event) {event.data.list.hide();});
        	}
        },

        /**
         * Initializes the Properties Window, hide it initially
         * @method initPropWindow
         * @param none
         *
         */
        initPropWindow: function () {
            $('#propdiv').dialog();
            $('#propdiv').dialog({
                width: 'auto',
                height: 'auto',
                resizable: false,
                open: function(event, ui) { $('span.prop_icon','div.m-quick-edit').addClass('selected') },
                close: function(event, ui) { $('span.prop_icon','div.m-quick-edit').removeClass('selected') }
            });
            $('#propdiv').dialog('close');
        },

	/**
         * Handler for Logout Button Click
         * @method logoutButtonClickHandler
         * @param none
         */
        logoutButtonClickHandler: function () {
            $('#logouticon').bind("click", function () {
                window.location="/logout";
            });
        },
        helpButtonListener: function () {
            $('#helpicon').bind("click", showHelp);
        },
		/**
		* Triggering 'inputfile click' when clicked on 'loadicon' - Fake file upload
		* @method - importImageButtonListener
		*/
		importImageButtonListener: function() {
			$("#loadicon").click(function () {
				$("#inputfile").click(); 
			});
			$('#inputfile').change(this.fileSelected);
		},
		/**
		* When user selects a file from local system, load that file and add it to canvas
		* @method - fileSelected
		*/
		fileSelected: function() {
			var oFile = document.getElementById('inputfile').files[0];
			var filepath = document.getElementById('inputfile').value;
			var oReader = new FileReader();
			oReader.onload = (function (theFile) {
				return function (e) {
					var args = {};
					args.left = 100;
					args.top = 300;
					args.scaleX = 1;
					args.scaleY = 1;
					args.angle = 0;
					args.uid = util.uniqid();
					args.name = 'importimage';
					args.palette = 'shapes';
					args.self = true;
					var img = new Image();
					img.onload = function() {
						args.image = this;
						args.src = this.src;
						args.width = this.width;
						args.height = this.height;
						matisse.main.addImageToCanvas(args);	
					}
					img.src = e.target.result
					
				};
			})(oFile);
			// Read in the image file as a data URL.
			oReader.readAsDataURL(oFile);
		},
		
		bindContainerCombo: function () {
			$("#container").bind("change", function (e) {
				var val = document.getElementById("container").value;
				var img = '/images/'+val+'.png'
				canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
			})
		},

		bindLayoutCombo: function () {
			$("#layout").bind("change", function (e) {
				var val = document.getElementById("layout").value;					
				var obj = matisse.layout.content.layouts[val].toolAction();
				matisse.comm.sendDrawMsg({			
					action: val,
					palette: "content",
					args: [{
						uid: obj.uid,
						object: obj						
					}]
				});				
			})
		}
	} // end of return;
});