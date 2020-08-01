MenupanelErrorsAssistant = Class.create( ExampleAssistantBase, {
	stylesheet : "menupanel-example",
	hideheader : true,
	panelOpen : false,
	setup : function($super){
		$super();
		
		this.menupanel = this.controller.sceneElement.querySelector('div[x-mojo-menupanel]');
		this.scrim = this.controller.sceneElement.querySelector('div[x-mojo-menupanel-scrim]');
		
		this.controller.listen('palm-header-toggle-menupanel',Mojo.Event.tap, this.toggleMenuPanel.bindAsEventListener(this));
		this.controller.listen(this.scrim, Mojo.Event.tap, this.toggleMenuPanel.bindAsEventListener(this));

		this._dragHandler = this._dragHandler.bindAsEventListener(this);

		this.menuPanelVisibleTop = this.menupanel.offsetTop;
		this.menupanel.style.top = (0 - this.menupanel.offsetHeight - this.menupanel.offsetTop)+'px';
		this.menuPanelHiddenTop = this.menupanel.offsetTop;
		
		this.scrim.hide();
		this.scrim.style.opacity = 0;
	},
	
	animateMenuPanel : function(panel, reverse, callback){
		Mojo.Animation.animateStyle(panel, 'top', 'bezier', {
					from: this.menuPanelHiddenTop,
					to: this.menuPanelVisibleTop,
					duration: MenupanelExampleAssistant.kMenuPanelAnimationDuration,
					curve:'over-easy',
					reverse:reverse,
					onComplete:callback
				}
		);
	},
	
	menuPanelOn : function(){
		var animateMenuCallback;
		var that = this;
		that.panelOpen = true;
		this.scrim.style.opacity = 0;
		this.scrim.show();
		this.enableSceneScroller();
		animateMenuCallback = function(){
			that.menupanel.show();
			that.animateMenuPanel(that.menupanel, false, Mojo.doNothing);
		};
		Mojo.Animation.Scrim.animate(this.scrim, 0, 1, animateMenuCallback);
	},
	
	menuPanelOff :function(){
		var animateMenuCallback;
		var that = this;
		that.panelOpen = false;
		this.disableSceneScroller();
		animateMenuCallback = function(){
			that.menupanel.hide();
			Mojo.Animation.Scrim.animate(that.scrim, 1, 0, that.scrim.hide.bind(that.scrim));
		};
		this.animateMenuPanel(this.menupanel, true, animateMenuCallback);
	},
	
	toggleMenuPanel : function(e){
		if(this.panelOpen){
			this.menuPanelOff();
		}else{
			this.menuPanelOn();
		}
	},
	/*
	 * Disable the scene scroller to prevent the web view from scrolling underneath whatever is being displayed on top of it
	 */
	disableSceneScroller : function() {
		this.controller.listen(this.controller.sceneElement, Mojo.Event.dragStart, this._dragHandler);
	},
	/** @private */
	_dragHandler: function(event) {
		// prevents the scene from scrolling.
		event.stop();
	},
	/*
	 * Enable the scene scroller (everything back to normal)
	 */
	enableSceneScroller : function() {
		this.controller.stopListening(this.controller.sceneElement, Mojo.Event.dragStart, this._dragHandler);
	}
});

MenupanelExampleAssistant.kMenuPanelAnimationDuration = 0.12;