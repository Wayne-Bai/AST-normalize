/**!
 * jquery.fast-Slider
 * @author CreoArt
 * @license Apache 2.0
 * @site https://github.com/CreoArt/jqeury.fast-Slider
 */
(function($) {
    $.fn.Slider = function(s) {
        var $this = this,
            s = $.extend({
                next_bt: '.next',
                prev_bt: '.prev',
                bt_hide: false,
                type: false,
                hs: false,
                duration: 1000,
                debug: false,
                animating: false,
                circle: false
            }, s);
        $this.s = s;
        $this.windowLoaded = false; $this.ul = $('ul:first',this); $this.li = $('li', $this.ul); $this.lif = $('li:first', $this.ul); $this.idx = 0; $this.id = $(this).attr('id'); $this.next_bt = $($this.s.next_bt, this); $this.prev_bt = $($this.s.prev_bt, this); $this.hh = 0; $this.ulw = 0; $this.ulfw = 0; $this.obj = 0; $this.objr = 0; $this.liw = 0;
        var make = function() {
            if ($this.s.bt_hide && !$this.s.circle)
                $this.prev_bt.hide();
            $this.setup = function() {
                $this.windowLoaded = true;
                if ($this.s.debug) {
                    console.log('--- Slider setup ---');
                    console.log('id: '+$this.id);
                    console.log('--- Settings ---');
                    console.log(s);
                    if ($this.s.type == 'gallary')
                        console.log('gallary mode');
                    console.log('li.length: '+$this.li.length);
                    console.log('container & ul setup css');
                }
                $($this).css({
                    'overflow': 'hidden',
                    'position': 'relative'
                });
                $this.ul.css({
                    'list-style': 'none',
                    'overflow': 'hidden',
                    'position': 'relative',
                    'float': 'left',
                    'width': '9999px'
                });
                $this.ulfw = ($($this).outerWidth()-$this.next_bt.outerWidth()-$this.prev_bt.outerWidth());
                if ($this.s.debug) {
                    console.log('container width: '+$($this).outerWidth());
                    console.log('next bottom width: '+$this.next_bt.outerWidth());
                    console.log('prev bottom width: '+$this.prev_bt.outerWidth());
                    console.log('ul factory width: '+ $this.ulfw);
                }
                if ($this.s.debug)
                    console.log('li setup css and max height');
                $this.li.each(function() {
                    if ($this.hh < $(this).outerHeight(true))
                        $this.hh = $(this).outerHeight(true);
                    $(this).css({
                        'list-style': 'none',
                        'position': 'relative',
                        'float': 'left'
                    });
                    if ($this.s.type == 'gallary') {
                        $(this).addClass('gl_'+$this.id);
                        $(this).attr('rel','gl_'+$this.id+'_'+$this.idx);
                        $(this).css('cursor','pointer');
                        $(this).click($this.gallary);
                        $this.idx++;
                    }
                });
                $this.obj = Math.ceil($this.ulfw / $this.li[0].clientWidth);
                $this.objr = ($this.ulfw / $this.li[0].clientWidth);
                if ($this.s.debug) {
                    console.log('Obj: '+$this.obj);
                    console.log('Objr: '+$this.objr);
                }
                if($this.s.hs) {
                    if (s.debug)
                        console.log('li max height: '+$this.hh);
                    $(this).height($this.hh);
                }
            };
            $this.overlay = function(o, text, cb) {
                var o = $.extend({
                        width: 'auto',
                        height: 'auto',
                        close: true,
                        type: false,
                        style: '',
                        idx: false
                    }, o),
                    close = '', next = '', prev = '';
                if (o.type == 'gallary') {
                    next = '<div id="SliderOverlayNext" style="position:absolute;top:0;bottom:0;right:-20px;background: url(\'images/slider-next.png\') right center no-repeat; width:70px;cursor:pointer;" rel="'+o.idx+'"></div>';
                    prev = '<div id="SliderOverlayPrev" style="position:absolute;top:0;bottom:0;left:-20px;background: url(\'images/slider-prev.png\') left center no-repeat; width:70px;cursor:pointer;" rel="'+o.idx+'"></div>'
                }
                if (o.close)
                    close = '<img id="SliderOverlayClose" style="position:absolute;top:-24px;right:-24px;z-index:1002;cursor:pointer;" src="images/slider-close.png">';
                if($('#SliderOverlay').html() == null)
                    $('body').append('<div id="SliderOverlay" style="position:fixed;top:0;bottom:0;left:0;right:0;background:#000;opacity:0.5;z-index:1000;"></div>');
                if($('#SliderOverlayBox').html() == null) {
                    $('body').append('<div id="SliderOverlayBox" style="display:none;position:fixed;top:50%;left:50%;background:#fff;z-index:1001;width:'+o.width+';height:'+o.height+';'+o.style+'">'+text+''+close+''+next+''+prev+'</div>');
                    $this.overlay_bind(o, cb);
                } else {
                    $('#SliderOverlayBox').css({
                        width: o.width+'px',
                        height: o.height+'px'
                    });
                    $('#SliderOverlayBox').html(text+''+close+''+next+''+prev);
                    $this.overlay_bind(o, cb);
                }
            };
            $this.overlay_bind = function(o, cb) {
                $('#SliderOverlayBox').css({
                    'margin-top': '-'+($('#SliderOverlayBox').outerHeight()/2)+'px',
                    'margin-left': '-'+($('#SliderOverlayBox').outerWidth()/2)+'px'
                });
                if (o.close) {
                    $('#SliderOverlay').click($this.overlay_close);
                    $('#SliderOverlayClose').click($this.overlay_close);
                }
                if (o.type == 'gallary') {
                    $('#SliderOverlayNext').click($this.gallary_next);
                    $('#SliderOverlayPrev').click($this.gallary_prev);
                }
                if ($('#SliderOverlayBox').is(':hidden')) {
                    $('#SliderOverlayBox').show('slow', function(){
                        if (cb)
                            cb();
                    });
                } else {
                    if (cb)
                        cb();
                }
            };
            $this.overlay_close = function() {
                $('#SliderOverlay').remove();
                $('#SliderOverlayBox').remove();
            };
            $this.gallary = function() {
                var img = $('img',$(this)).attr('rel'),
                    idx = $(this).attr('rel');
                $this.gallary_load(idx, img);
            };
            $this.gallary_array = function() {
                var idx = [];
                $('.gl_'+$this.id).each(function() {
                    idx.push($(this).attr('rel'))
                });
                return idx;
            };
            $this.gallary_prev = function() {
                var idx = $this.gallary_array(),
                    t = $(this).attr('rel');
                var i = idx.indexOf(t);
                if (i == 0)
                    i = idx.length - 1;
                else
                    i--;
                var img = $('img',$("li[rel='"+idx[i]+"']")).attr('rel');
                $this.gallary_load(idx[i], img);
            };
            $this.gallary_next = function() {
                var idx = $this.gallary_array(),
                    t = $(this).attr('rel');
                var i = idx.indexOf(t);
                if (idx.length-1 < i+1)
                    i = 0;
                else
                    i++;
                var img = $('img',$("li[rel='"+idx[i]+"']")).attr('rel');
                $this.gallary_load(idx[i], img);
            };
            $this.gallary_load = function(idx,img) {
                var osw = {
                    style: 'padding:20px;',
                    close: false
                }
                $this.overlay(osw, '<center>Подождите идет загрузка...</center>', function() {
                    var image = new Image();
                    image.onload = function() {
                        var os = {
                            width: this.width,
                            height: this.height,
                            type: 'gallary',
                            idx: idx
                        };
                        $this.overlay(os, '<img src="'+this.src+'" border="0">');
                    };
                    image.src = img+'?'+(new Date().getTime());
                });
            };
            $this.next = function() {
                if ($this.s.animating || !$this.windowLoaded) {
                    return false;
                }
                $this.s.animating = true;
                var stop = 0;
                var st = "$(el)";
                var end = ".animate({left: '-'+twh+'px'}, $this.s.duration, function() { $(this).css('left','');});";
                var el = $('li:not(:hidden):first', $this.ul),
                    eln = $('li:not(:hidden)', $this.ul);
                if (!$this.s.circle && $this.s.bt_hide && eln.length <= ($this.objr + 1))
                    $this.next_bt.hide();
                if (eln.length <= $this.objr && !$this.s.circle) {
                    $this.s.animating = false;
                    return false;
                }
                if (eln.length <= ($this.objr + 1) && $this.s.circle)
                    $('li:first', $this.ul).appendTo($this.ul).css('left',0).show();
                twh = $(el).outerWidth(true);
                $(el).animate({left: '-'+twh+'px'}, $this.s.duration, function() {
                    $(this).hide();
                    $this.s.animating = false;
                });
                for (var i = 0; i < $this.obj; i++) {
                    st += ".next()";
                    eval(st+end);
                }
                return false;
            };
            $this.prev = function() {
                if ($this.s.animating || !$this.windowLoaded) {
                    return false;
                }
                $this.s.animating = true;
                var lihl = $('li:hidden:last', $this.ul),
                    linhf = $('li:not(:hidden):first', $this.ul);
                if ($('li:hidden', $this.ul).length == 0 && !$this.s.bt_hide && !$this.s.circle) {
                    $this.s.animating = false;
                    return false;
                }
                if ($('li:hidden', $this.ul).length == 0 && $this.s.circle) {
                    var el = $('li:last', $this.ul);
                    twh = el.outerWidth(true);
                    $(el).css({left: '-'+twh+'px'});
                    el.insertBefore($('li:first', $this.ul))
                    lihl = el;
                }
                var twh = lihl.outerWidth(true);
                lihl.show();
                lihl.animate({left: '0px'}, 1000, function() {
                    $(this).css('left','');
                    $this.s.animating = false;
                });
                var st = "linhf";
                var end = ".css('left','-'+twh+'px').animate({left: '0px'}, 1000, function() {$(this).css('left','');});"
                for (var i = 0; i < $this.obj; i++) {
                    if(i != 0)
                        st += ".next()";
                    eval(st+end);
                }
                if($('li:hidden', $this.ul).length == 0 && $this.s.bt_hide && !$this.s.circle)
                    $this.prev_bt.hide();
                if(!$this.s.circle && $this.s.bt_hide)
                    $this.next_bt.show();
                return false;
            };
            $this.next_bt.click($this.next);
            $this.prev_bt.click($this.prev);

            $(window).load(function() { $this.setup(); });
        };
        return this.each(make);
    };
})(jQuery);
