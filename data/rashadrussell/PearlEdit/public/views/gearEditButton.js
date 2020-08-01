YUI.add('gear-edit-button', function(Y) {

	var GearEditButton,
		EditModule = Y.Pearl.EditModule;

	// GearEditButton View
	// Responsible appending an edit button to pearl-edit each DOM element in order to reveal EditModule
	GearEditButton = Y.Base.create('gearEditButton', Y.View, [], {
		
		// ---- Initialize Gear Buttons -----------------------------------------------------------------------------------
		initializer: function() {

			var gearButton,
				that           = this,
				container      = this.get('container'),
				gearButtonLink = 1;

			container.all('.pearl-edit').each(function(n) {

				n.get('children').each(function(child) {

					gearButton = Y.Node.create('<img class="gearButton ' + 'pure-gearButtonLink-' + gearButtonLink + '" src="/img/gear.png" alt="edit" />');

					gearButton.setStyles({
						'display' : 'none',
						'width'   : '20',
						'height'  : '20',
						'position': 'absolute',
						'left'    : child.getX(),
						'z-index' : '1000'
					});

					child.insert(gearButton, 'before');
					child.addClass('pure-gearButtonLink-' + gearButtonLink);

					gearButtonLink++;

				});							

			});

			this.renderModule();

		},

		// ---- Render View to DOM ---------------------------------------------------------------------------------
		render: function() {			
			

			return this;
		},

		renderModule: function() {
			var linkIndex,
				moduleLink,
				container  = this.get('container');
				
			container.all('.pearl-edit').each(function(n) {

				n.get('children').each(function(child) {

					if(child.hasClass('gearButton')) {

						child.on('click', function(e) {

							linkIndex = e.target.get('className').indexOf('pure-gearButtonLink-'),
							moduleLink = e.target.get('className').substr(linkIndex);
							new EditModule().render(e.target, moduleLink);

						});
					}

				});	

			});
		}

	}, {
		ATTRS: {
			container: {
				valueFn: function() { return Y.one('#layout-iframe').get('contentWindow').get('document').get('body'); }
			}			
		}
	});
	
	Y.namespace('Pearl').GearEditButton = GearEditButton;

}, '@VERSION@', {

	requires: [
		'view',
		'node',
		'edit-module',
		'event-mouseenter'
	]

});