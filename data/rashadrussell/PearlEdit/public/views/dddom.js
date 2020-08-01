YUI.add('dd-dom', function(Y) {

	var DDDOM;

	// DDDOM View
	// Responsible for establishing a drag & drop environment for DOM elements in the layout
	DDDOM = Y.Base.create('ddDOM', Y.View, [], {

		// ---- Initialize Drag & Drop Environment ----------------------------------------------------------------
		initializer: function() {

			var dd = new Y.DD.Delegate({
		        container: this.get('container'),
		        nodes: '.pearl-edit',
		        dragConfig: {
		            plugins: [{
		                fn: Y.Plugin.DDConstrainedToAncestor,
		                cfg: {
		                    constrain: null,
		                    constrain2ancestor: '.pearl-group'
		                }
		            },
	                {
	                	fn: Y.Plugin.DDProxy,
	                	cfg: { moveOnEnd: false }
	                }]
		        }
		    });

			this.get('container').all('.pearl-edit').plug(Y.Plugin.Drop);

			// ---- Set Drag & Drop Event Listeners --------------------------------------------------------------------
			Y.DD.DDM.on('drag:start', this.dragProxy);
			Y.DD.DDM.on('drop:over' , this.setShim);
			Y.DD.DDM.on('drag:end'  , this.resetProxy);

		},

		// ---- Render View to DOM --------------------------------------------------------------------------------
		render: function() {			
			

			return this;
		},


		// ---- Event Functions -----------------------------------------------------------------------------------

		// ---- Lower opacity for dragged node and its proxy ------------------------------------------------------
		dragProxy: function(e) {
    		var drag = e.target;

    		drag.get('node').setStyle('opacity', '.25');
    		drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
    		drag.get('dragNode').setStyles({
        		opacity: '.5',
       			borderColor: drag.get('node').getStyle('borderColor'),
       		 	backgroundColor: drag.get('node').getStyle('backgroundColor')
    		});

		},

		// ---- Bring dragged node back to full opacity -----------------------------------------------------------
		resetProxy: function(e) {
			var drag = e.target;

    		drag.get('node').setStyles({
       			visibility: '',
        		opacity: '1'
    		});
		},

		//---- On drop event, complete node swap ------------------------------------------------------------------
		setShim: function(e) {
    		var drag = e.drag.get('node'),
        		drop = e.drop.get('node'),
        		dragPureGroup = drag.ancestor('.pearl-group'),
        		dropPureGroup = drop.ancestor('.pearl-group');


        	if(!drop.hasClass('placeholder-image') && (dragPureGroup === dropPureGroup)) {

        		Y.DD.DDM.swapNode(drag, drop);

        	} else if(drag.ancestor('#sidebar') && (!drop.ancestor('#sidebar'))) {

        		drop.insert(drag, 'after');

        	}

        	e.drop.sizeShim();
    		
		}

	}, {

		ATTRS: {
			container: {
				valueFn: function() { return Y.one('#layout-iframe').get('contentWindow').get('document').get('body'); }
			}			
		}
	});

	Y.namespace('Pearl').DDDOM = DDDOM;

}, '@VERSION@', {

	requires: [
		'view',
		'node',
		'dd-multi-container'

	]

});
