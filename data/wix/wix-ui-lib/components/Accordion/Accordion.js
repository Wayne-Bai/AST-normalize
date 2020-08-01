jQuery.fn.definePlugin('Accordion', function($){
	
	return {
		init: function(){
			this.markup();
			this.showFirst();
			this.bindEvents();
			this.applyCSS();
		},
		markup:function(){
			if(!this.$el.hasClass('accordion')){
				this.$el.addClass('accordion');
			}
            if(this.options.border){
                this.$el.find('.' + this.options.triggerClass).addClass(this.options.borderClass);
                this.$el.find('.' + this.options.triggerClass).find('li:nth-last-child(1)').addClass('last-child');
            }

		},
		getDefaults: function(){
			return {
				triggerClass : "acc-pane",
				triggerCSS : {},
                borderClass: 'border',
				contentClass : "acc-content",
				contentCSS : {},
				animationTime : 150,
				activeClass : 'acc-active',
				ease : 'linear',
				openByDeafult:'acc-open',
				value : 0,
				toggleOpen: true,
                border: true
			};
		},
		showFirst: function () {
			var opt = this.options;
			this.$el.find('.' + opt.contentClass).hide();
			var $panels = this.$el.find('.' + opt.triggerClass);
			var $toOpen;
			if(typeof this.options.value === 'string'){
				$toOpen = $panels.filter(this.options.value);
			} else {
				$toOpen = $panels.eq(this.options.value || 0);
			}
			
			var $openByDefault = this.$el.find('.'+opt.triggerClass+'.' + opt.openByDeafult)
			$toOpen = $toOpen.add($openByDefault);
			
			$toOpen.addClass(opt.activeClass + ' ' + opt.openByDeafult)
				.find('.'+opt.contentClass)
				.css('display','block');
		},
		getValue: function () {
			var triggers = this.$el.find('.' + this.options.triggerClass);
			for(var i = 0; i < triggers.length; i++){
				if(triggers.eq(i).hasClass(this.options.activeClass)){
					return i;
				}
			}
			return -1;
		},
		setValue: function ($el) {
			var opt = this.options;
			if(typeof $el === 'number'){
				$el = this.$el.find('.' + opt.triggerClass).eq($el); 
			}
			if ($el.find('.' + opt.contentClass).is(':hidden')) {
				this.openElementContent($el);
			} else if (opt.toggleOpen){
				this.closeElementContent($el);
			}
		},
		closeElementContent: function ($el) {
			var opt = this.options;
			this.$el.find('.' + opt.triggerClass)
				.removeClass(opt.openByDeafult)
				.removeClass(opt.activeClass)
				.find('.' + opt.contentClass)
				.slideUp(opt.animationTime, opt.ease, function(){
                    $(document.body).trigger('uilib-update-scroll-bars');
                });
        },
		openElementContent: function ($el) {
			var opt = this.options;
			this.closeElementContent($el);
			
			var $active = $el.toggleClass(opt.activeClass).find('.'+opt.contentClass);
			$active.slideDown(opt.animationTime, opt.ease, function(){
				$active.css('overflow', 'visible');			
				$(document.body).trigger('uilib-update-scroll-bars');
			});
		},
        applyCSS: function () {
			this.$el.find('.' + this.options.contentClass).css(this.options.contentCSS);
			this.$el.find('.' + this.options.triggerClass).css(this.options.triggerCSS);
		},
		bindEvents: function () {
			var that = this;
			this.$el.on('click', '.' + this.options.triggerClass, function (e) {
				if($(e.target).parents('.'+that.options.contentClass).length === 0){
					e.preventDefault();
					that.setValue($(this));
					that.triggerChangeEvent(that.getValue());
				}
			});
		}
	};

});