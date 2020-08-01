/**
 * fastuts.js
 * @author Guilherme Augusto Madaleno <guimadaleno@me.com>
 * @version 0.9
 */

$.fn.fastuts = function (options)
{

	/* Default options */

	var opt =
	{

		/* Fastuts main selector */

		selector: $(this).selector.replace('.', '').replace('#', ''),

		/* Basic settings */

		settings:
		{
			allowKeys: 		(options && options.settings && options.settings.allowKeys) ? options.settings.allowKeys : true,
			autoScroll: 	(options && options.settings && options.settings.autoScroll) ? options.settings.autoScroll : true,
			spacing: 		(options && options.settings && options.settings.spacing) ? options.settings.spacing : '40px',
			time: 			(options && options.settings && options.settings.time) ? options.settings.time : 0.3,
			minHeight: 		(options && options.settings && options.settings.minHeight) ? options.settings.minHeight : 400,
		},

		/* Overlay settings */

		overlay:
		{
			class: 			(options && options.overlay && options.overlay.class) ? options.overlay.class : 'fastuts-overlay',
			color: 			(options && options.overlay && options.overlay.color) ? options.overlay.color : 'rgba(0,0,0,0.8)',
			allowEscapeKey: (options && options.overlay && options.overlay.allowEscapeKey) ? options.overlay.allowEscapeKey : true,
			onClose: 		(options && options.overlay && options.overlay.onClose && $.type(options.overlay.onClose) === 'function') ? options.overlay.onClose : false
		},

		/* Buttons settings */

		buttons:
		{

			close:
			{
				class: 		'fastuts-button-close',
				text: 		(options && options.buttons && options.buttons.close && options.buttons.close.text) ? options.buttons.close.text : 'Close',
				callback: 	(options && options.buttons && options.buttons.close && options.buttons.close.callback && $.type(options.buttons.close.callback) === 'function') ? options.buttons.close.callback : false
			},

			prev:
			{
				class: 		'fastuts-button-prev',
				text: 		(options && options.buttons && options.buttons.prev && options.buttons.prev.text) ? options.buttons.prev.text : '&#10094;',
				callback: 	(options && options.buttons && options.buttons.prev && options.buttons.prev.callback && $.type(options.buttons.prev.callback) === 'function') ? options.buttons.prev.callback : false
			},

			next:
			{
				class: 		'fastuts-button-next',
				text: 		(options && options.buttons && options.buttons.next && options.buttons.next.text) ? options.buttons.next.text : '&#10095;',
				callback: 	(options && options.buttons && options.buttons.next && options.buttons.next.callback && $.type(options.buttons.next.callback) === 'function') ? options.buttons.next.callback : false
			}

		},

		/* Default classes used by Fastuts */

		classes:
		{

			/* Tooltip arrow classes */

			arrows:
			{
				top: 		"fastuts-tooltip-arrow-top",
				right: 		"fastuts-tooltip-arrow-right",
				bottom: 	"fastuts-tooltip-arrow-bottom",
				left: 		"fastuts-tooltip-arrow-left"
			},

			/* Fastuts content classes */

			content:
			{
				buttons: 	"fastuts-buttons",
				holder: 	"fastuts-holder",
				text: 		"fastuts-text",
				tooltip: 	"fastuts-tooltip"
			}

		},

		/* Fastuts default attributes */

		attributes:
		{
			order: 				"data-fastuts-order",
			previousElPosition: "data-fastuts-previous-element-position",
			previousPosition: 	"data-fastuts-previous-position",
			previousZIndex: 	"data-fastuts-previous-zindex",
			tip: 				(options && options.attributes && options.attributes.tip) ? options.attributes.tip : "data-fastuts-tip"
		},

		/* onReady callback */

		onReady: (options && options.onReady && $.type(options.onReady) === 'function') ? options.onReady : false,

		/* Fastuts main holder ID and class */

		holder: "fastuts-main-holder",

		/* Variables used by Fastuts function */

		fn:
		{
			alignTimer: 	false,
			block: 			false,
			el: 			this,
			elAttrCount: 	0,
			elCurPos: 		0, // ??????????
			elHeight: 		"",
			elLeft: 		"",
			elLoc: 			"",
			elMargin: 		"",
			elNum: 			[],
			elPos: 			"",
			elSize: 		0,
			elTop: 			"",
			elWidth: 		"",
			elWindowLeft: 	"",
			elWindowRight: 	"",
			elWindowTop: 	"",
			elZIndex: 		0,
			indexTimer: 	false,
			holderCSS: 		false,
			holderIndex: 	1,
			index: 			0
		}
	};

	/* Main function */

	var fn =
	{
		init: function()
		{

			if ($(window).height() <= opt.settings.minHeight)
			{
				console.log('Fastuts cannot be loaded. Mininum height of ' + opt.settings.minHeight + 'px required.');
			}
			else
			{

				$(opt.fn.el).each(function()
				{

					if ($(this).hasClass(opt.selector) && $(this).attr(opt.attributes.tip))
					{
						opt.fn.elSize++;
					}

					if ($(this).attr(opt.attributes.order))
					{
						opt.fn.elAttrCount++;
					}

				});

				if (opt.fn.elAttrCount && opt.fn.elSize)
				{

					var currentNumber = 0;

					$(opt.fn.el).each(function()
					{
						currentNumber = (parseInt($(this).attr(opt.attributes.order)) - 1);
						opt.fn.elNum[currentNumber] = this;
					});

					opt.fn.el = opt.fn.elNum;

				}

				$("#" + opt.holder).remove();

				$('body').append('<div id="' + opt.holder + '" class="' + opt.holder + '" style="display: none;"><div class="' + opt.overlay.class + '"></div><div class="' + opt.classes.content.holder + '"><div class="' + opt.classes.content.tooltip + '"><div class="' + opt.classes.content.text + '"></div><div class="' + opt.classes.content.buttons + '"><a href="#" class="' + opt.buttons.close.class + '">' + opt.buttons.close.text + '</a><a href="#" class="' + opt.buttons.prev.class + '">' + opt.buttons.prev.text + '</a><a href="#" class="' + opt.buttons.next.class + '">' + opt.buttons.next.text + '</a></div></div></div></div>');

				if (opt.fn.elSize)
				{

					if ($(opt.fn.el[(opt.fn.holderIndex - 1)]).attr(opt.attributes.tip) && $(opt.fn.el[(opt.fn.holderIndex - 1)]).hasClass(opt.selector))
					{

						fn.displayBlock (opt.fn.el[(opt.fn.holderIndex - 1)]);
						fn.displayButtons (1, opt.fn.elSize);

						if (opt.onReady)
						{
							opt.onReady();
						}

						$("." + opt.buttons.prev.class).off('click').on('click', function()
						{

							fn.prevBlock(function()
							{

								if (opt.buttons.prev.callback)
								{
									opt.buttons.prev.callback (opt.fn.index, opt.fn.el);
								}

							});

							return false;

						});

						$("." + opt.buttons.next.class).off('click').on('click', function()
						{

							fn.nextBlock(function()
							{

								if (opt.buttons.next.callback)
								{
									opt.buttons.next.callback (opt.fn.index, opt.fn.el);
								}

							});

							return false;

						});

						if (opt.settings.allowKeys == true)
						{

							$(document).keyup(function(e)
							{

								if (e.keyCode == 37)
								{

									fn.prevBlock(function()
									{

										if (opt.buttons.prev.callback)
										{
											opt.buttons.prev.callback (opt.fn.index, opt.fn.el);
										}

										return false;

									});

								}
								else if (e.keyCode == 39)
								{

									fn.nextBlock(function()
									{

										if (opt.buttons.next.callback)
										{
											opt.buttons.next.callback (opt.fn.index, opt.fn.el);
										}

										return false;

									});

								}

							});
						}

						$("." + opt.buttons.close.class).off('click').on('click', function(event)
						{

							if (opt.buttons.close.callback && opt.buttons.close.callback ())
							{
								fn.hide();
								return false;
							}
							else
							{
								fn.hide();
								return false;
							}

						});

						if (opt.overlay.allowEscapeKey == true)
						{

							$(document).keyup(function(e)
							{

								if (e.keyCode == 27)
								{

									if (opt.overlay.onClose)
									{
										opt.overlay.onClose ();
									}

									fn.hide();

								}

							});

						}

						$('.' + opt.overlay.class).off('click').on('click', function()
						{

							if (opt.overlay.onClose)
							{
								opt.overlay.onClose ();
							}

							fn.hide();

							return false;

						});

						$("#" + opt.holder).fadeIn(200);

					}

				}

			}

		},

		displayBlock: function (block)
		{

			if ($(block).html() && $(block).hasClass(opt.selector) && $(block).attr(opt.attributes.tip))
			{

				opt.fn.elLoc  			= $(block).offset();
				opt.fn.elPos 			= $(block).css('position');
				opt.fn.elMargin 		= (opt.settings.spacing && opt.settings.spacing.indexOf() == -1) ? parseInt(opt.settings.spacing.replace("px", '')) : 40;
				opt.fn.elWidth 			= parseInt($(block).css('width').replace('px', '')) + (opt.fn.elMargin);
				opt.fn.elHeight 		= parseInt($(block).css('height').replace('px', '')) + (opt.fn.elMargin);
				opt.fn.elTop 			= (opt.fn.elLoc.top - (opt.fn.elMargin / 2));
				opt.fn.elLeft 			= (opt.fn.elLoc.left - (opt.fn.elMargin / 2));
				opt.fn.elWindowTop 		= (opt.fn.elTop + opt.fn.elHeight);
				opt.fn.elWindowRight 	= (opt.fn.elLeft + opt.fn.elWidth);
				opt.fn.elWindowLeft 	= opt.fn.elLeft;
				opt.fn.alignTimer;

				opt.fn.holderCSS =
				{
					position: 			'absolute',
					width: 				opt.fn.elWidth + 'px',
					height: 			opt.fn.elHeight + 'px',
					top: 				opt.fn.elTop + 'px',
					left: 				opt.fn.elLeft + 'px',
					webkitTransition: 	'all ' + opt.settings.time + 's',
					transition: 		'all ' + opt.settings.time + 's',
					backgroundColor: 	($('body').css('backgroundColor')) ? $('body').css('backgroundColor') : '#FFFFFF'
				};

				$('*').filter(function()
				{
					if ($(this).css('position') == 'fixed')
					{
						$(this).attr(opt.attributes.previousPosition, 'fixed');
						$(this).css('position', 'absolute');
					}
				});

				$("." + opt.classes.content.tooltip).children('.' + opt.classes.content.text).html($(block).attr(opt.attributes.tip));

				$(opt.fn.el).each(function()
				{

					if ($(this).attr(opt.attributes.previousZIndex))
					{
						$(this).css('z-index', $(this).attr(opt.attributes.previousZIndex));
					}

				});

				opt.fn.elZIndex = $(block).css('z-index');
				opt.fn.elCurPos = $(block).css('position');

				if (!$(block).attr(opt.attributes.previousZIndex))
				{
					$(block).attr(opt.attributes.previousZIndex, opt.fn.elZIndex);
				}

				if (!$(block).attr(opt.attributes.previousElPosition))
				{
					$(block).attr(opt.attributes.previousElPosition, opt.fn.elCurPos);
				}

				if (opt.fn.indexTimer)
				{
					clearTimeout(opt.fn.indexTimer);
				}

				opt.fn.indexTimer = setTimeout(function()
				{

					$(block).css
					({
						zIndex: 			'2147483637',
						position: 			(opt.fn.elCurPos === 'static') ? 'relative' : opt.fn.elCurPos
					}).hide().fadeIn(200);

				}, (opt.settings.time * 750));

				$('.' + opt.overlay.class).css
				({
					position: 			'fixed',
					left: 				'0px',
					top: 				'0px',
					right: 				'0px',
					bottom: 			'0px',
					backgroundColor: 	(opt.overlay.color) ? opt.overlay.color : 'rgba(0,0,0,0.8)'
				});

				$('.' + opt.holder).css
				({
					position: 			'absolute',
					left: 				'0px',
					top: 				'0px',
					right: 				'0px',
					bottom: 			'0px'
				});

				if (opt.fn.elWindowTop >= ($(window).height() - 200))
				{

					$("." + opt.classes.content.tooltip).removeClass(opt.classes.arrows.top).addClass(opt.classes.arrows.bottom).css
					({
						top: '-' + ($("." + opt.classes.content.tooltip).height() + 20) + 'px'
					});

					if (opt.settings.autoScroll)
					{
						$("html, body").clearQueue().animate({ scrollTop: (opt.fn.elTop - ($("." + opt.classes.content.tooltip).height() + 40)) }, 500);
					}

				}
				else
				{

					$("." + opt.classes.content.tooltip).removeClass(opt.classes.arrows.bottom).addClass(opt.classes.arrows.top).css
					({
						top: (opt.fn.elHeight + 20) + 'px'
					});

					if (opt.settings.autoScroll)
					{
						$("html, body").clearQueue().animate({ scrollTop: (opt.fn.elTop - 20) }, 500);
					}

				}

				if (opt.fn.elWindowLeft <= 100)
				{

					$("." + opt.classes.content.tooltip).removeClass(opt.classes.arrows.right).addClass(opt.classes.arrows.left).css
					({
						left: 			'0px',
						right: 			'auto',
						marginLeft: 	'inherit'
					});

				}
				else if (opt.fn.elWindowRight >= ($(window).width() - 100))
				{

					$("." + opt.classes.content.tooltip).removeClass(opt.classes.arrows.left).addClass(opt.classes.arrows.right).css
					({
						left: 			'auto',
						right: 			'0px',
						marginRight: 	'inherit'
					});

				}
				else
				{

					$("." + opt.classes.content.tooltip).removeClass(opt.classes.arrows.left).removeClass(opt.classes.arrows.right).css
					({
						left: 			'50%',
						right: 			'auto',
						marginLeft: 	'-' + ($("." + opt.classes.content.tooltip).width() / 2) + 'px',
						marginRight: 	'auto'
					});

				}

				$('.' + opt.classes.content.holder).css(opt.fn.holderCSS);

				$('html, body').css('overflow', 'hidden');

				$(window).bind('resize', function()
				{

					if (opt.fn.alignTimer)
						clearTimeout(opt.fn.alignTimer);

					opt.fn.alignTimer = setTimeout(function()
					{

						opt.fn.elLoc 			= $(block).offset();
						opt.fn.elTop 			= (opt.fn.elLoc.top - (opt.fn.elMargin / 2));
						opt.fn.elLeft 			= (opt.fn.elLoc.left - (opt.fn.elMargin / 2));
						opt.fn.elWindowTop 		= (opt.fn.elTop + opt.fn.elHeight);

						$('.' + opt.classes.content.holder).css
						({
							position: 			'absolute',
							width: 				opt.fn.elWidth + 'px',
							height: 			opt.fn.elHeight + 'px',
							top: 				opt.fn.elTop + 'px',
							left: 				opt.fn.elLeft + 'px',
							webkitTransition: 	(options && opt.settings.time) ? 'all ' + opt.settings.time + 's' : 'all 0.2s',
							transition: 		(options && opt.settings.time) ? 'all ' + opt.settings.time + 's' : 'all 0.2s',
							backgroundColor: 	($('body').css('backgroundColor')) ? $('body').css('backgroundColor') : '#FFFFFF'
						});

					}, 300);

				});

			}

		},

		displayButtons: function (currentIndexNum, blocksNum)
		{

			if (currentIndexNum == 1 && opt.fn.el.length > 1)
			{

				$("." + opt.buttons.prev.class).hide();
				$("." + opt.buttons.next.class).fadeIn(100);

			}
			else if (currentIndexNum == 1 && opt.fn.el.length <= 1)
			{

				$("." + opt.buttons.prev.class).hide();
				$("." + opt.buttons.next.class).hide();

			}
			else if (currentIndexNum == blocksNum)
			{

				$("." + opt.buttons.prev.class).fadeIn(100);
				$("." + opt.buttons.next.class).hide();

			}
			else
			{

				$("." + opt.buttons.prev.class).fadeIn(100);
				$("." + opt.buttons.next.class).fadeIn(100);

			}

		},

		hide: function ()
		{

			$("." + opt.holder).fadeOut(100, function()
			{

				opt.fn.holderIndex = 1;
				opt.fn.index = 0;

			});

			$(opt.fn.el).css('z-index', opt.fn.elZIndex);

			$('*[' + opt.attributes.previousPosition + '="fixed"]').filter(function()
			{

				if ($(this).attr(opt.attributes.previousPosition) === 'fixed')
				{

					$(this).removeAttr(opt.attributes.previousPosition);
					$(this).css('position', 'fixed');

				}

			});

			$('*[' + opt.attributes.previousElPosition + ']').filter(function()
			{

				$(this).css('position', $(this).attr(opt.attributes.previousElPosition));
				$(this).removeAttr(opt.attributes.previousElPosition);

			});

			$('html, body').css('overflow', 'auto');

		},

		nextBlock: function (callback)
		{

			if (opt.fn.holderIndex < opt.fn.elSize)
			{

				opt.fn.index = opt.fn.holderIndex = (opt.fn.holderIndex + 1);
				fn.displayBlock (opt.fn.el[(opt.fn.holderIndex - 1)]);
				fn.displayButtons (opt.fn.index, opt.fn.elSize);
				callback();

			}

		},

		prevBlock: function (callback)
		{

			if (opt.fn.holderIndex > 1)
			{

				opt.fn.index = opt.fn.holderIndex = (opt.fn.holderIndex - 1);
				fn.displayBlock (opt.fn.el[(opt.fn.holderIndex - 1)]);
				fn.displayButtons (opt.fn.index, opt.fn.elSize);
				callback();

			}

		}

	};

	fn.init();

};