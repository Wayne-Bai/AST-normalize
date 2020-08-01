$(document).ready(function() {

    /*---------------------------*/
    /*--------- GLOBALS ---------*/
    /*---------------------------*/

    var $hamburger = $('.hamburger-icon'),
        $item = $('.has-parallax'),
        $btn = $('.follow button'),
        $carousel = $('.carousel'),
        $nav = $('.nav'),
        $play = $('.audio .play'),
        $audio = $('audio').get(0),
        $bars = $('.bars'),
        $count = $('.count');

    /*---------------------------*/
    /*--- HAMBURGER ANIMATION ---*/
    /*---------------------------*/

    $hamburger.on('click', function() {
        $(this).toggleClass('active');

        // You can write code here
        // Open a menu for example

    });


    /*------------------------*/
    /*--- PROFILE PARALLAX ---*/
    /*------------------------*/

    $item.on({
        mousemove: function(e) {
            var $this = $(this);
            $this.find('.is-parallax').velocity({
                translateZ: 0,
                translateX: Math.floor((e.pageX - $this.offset().left) - ($this.width() / 2)),
                translateY: Math.floor((e.pageY - $this.offset().top) - ($this.height() / 2)),
                scale: '2'
            }, {
                duration: 400,
                easing: 'linear',
                queue: false
            });
        },
        mouseleave: function() {
            $(this).find('.is-parallax').velocity({
                translateZ: 0,
                translateX: 0,
                translateY: 0,
                scale: '1'
            }, {
                duration: 1000,
                easing: 'easeOutSine',
                queue: false
            });
        }
    });

    /*-------------------------*/
    /*----- RIPPLE EFFECT -----*/
    /*-------------------------*/



    $btn.on('click', function(event) {
        event.preventDefault();

        var $div = $('<div/>'),
            btnOffset = $(this).offset(),
            xPos = event.pageX - btnOffset.left,
            yPos = event.pageY - btnOffset.top;



        $div.addClass('ripple-effect');
        var $ripple = $(".ripple-effect");

        $ripple.css("height", $(this).height());
        $ripple.css("width", $(this).height());
        $div
            .css({
                top: yPos - ($ripple.height() / 2),
                left: xPos - ($ripple.width() / 2),                
            })
            .appendTo($(this));

        window.setTimeout(function() {
            $div.remove();
        }, 2000);
    });



    /*------------------------*/
    /*--- WEATHER CAROUSEL ---*/
    /*------------------------*/

    $carousel.owlCarousel({
        navigation: false,
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true
    });

    /*--- NAV ---*/

    $nav.on('click', function() {
        if ($(this).hasClass('next')) {
            $carousel.trigger('owl.next');
        } else {
            $carousel.trigger('owl.prev');
        }
    });

    /*----------------------*/
    /*--- AUDIO CAROUSEL ---*/
    /*----------------------*/

    var play = 0;
    $play.on('click', function() {
        play++;


        /*--- CHANGE ICON ---*/
        if (play % 2 == 0) {
            $(this).removeClass('icon-pause').addClass('icon-play-arrow');
            $audio.pause();
        } else {
            $(this).removeClass('icon-play-arrow').addClass('icon-pause');
            $audio.play();
        }
    });

    /*-------------------*/
    /*------ CHART ------*/
    /*-------------------*/

    $bars.addClass('animate');

    /*--- COUNT UP PLUGIN ---*/

    $.fn.countTo = function(options) {
        options = $.extend({}, $.fn.countTo.defaults, options || {});

        var loops = Math.ceil(options.speed / options.refreshInterval),
            increment = (options.to - options.from) / loops;

        return $(this).each(function() {
            var _this = this,
                loopCount = 0,
                value = options.from,
                interval = setInterval(updateTimer, options.refreshInterval);

            function updateTimer() {
                value += increment;
                loopCount++;
                $(_this).html(formatNumber(value));

                if (typeof(options.onUpdate) == 'function') {
                    options.onUpdate.call(_this, value);
                }

                if (loopCount >= loops) {
                    clearInterval(interval);
                    value = options.to;

                    if (typeof(options.onComplete) == 'function') {
                        options.onComplete.call(_this, value);
                    }
                }
            }
        });
    };

    $.fn.countTo.defaults = {
        from: 0,
        to: 100,
        speed: 1000,
        refreshInterval: 100,
        decimals: 0,
        onUpdate: null,
        onComplete: null,
    };

    /*--- NUMBER FORMAT ---*/

    function formatNumber(num) {
        var p = num.toFixed(2).split(".");
        return p[0].split("").reverse().reduce(function(acc, num, i, orig) {
            return num + (i && !(i % 3) ? "," : "") + acc;
        }, "");
    }

    /*--- COUNT UP ---*/

    $count.each(function() {

        var start = $(this).data('before'),
            end = $(this).data('count');

        $(this).countTo({
            from: start,
            to: end,
            speed: 2000,
            refreshInterval: 50
        });

    });


});
