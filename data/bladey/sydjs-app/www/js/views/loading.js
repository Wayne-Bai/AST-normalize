;(function() {
	
	new View('loading', {
		
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height -
					this.$('.statusbar').height();
				
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.statusbar').height()
				});
				
			},
			visible: function() {
				
				var self = this;
				
				var availableHeight = app.viewportSize.height -
					this.$('.statusbar').height();
				
				this.$('.logo').css('marginTop', (availableHeight / 2) - (this.$('.logo').height() / 2) - this.$('.statusbar').height());
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('white');
				
				// analytics
				app.trackEvent({ label: 'Loading', category: 'view', action: 'visible' });
				
			},
			hidden: function() {}
		}
		
	});
	
})();
