// Make the html element editable :) (c) doxtop@synrc.com
+function($){ "use strict";

    var Htmlbox = function (element, options) {
        this.$element = $(element).attr({'contenteditable': true, 'data-html': true})
        this.$element.addClass(options.class)
        var toolbar   = $("<ul>").attr({'class': options.toolbarclass})

        options.toolbar.map(function(item){
            var icon = item.icon, cmd = item.cmd, arg = cmd.arg, ui = cmd.ui, postback, html

            if(!arg) arg = null
            if(!ui) ui = false
            if(cmd.tag) {
                var encoded  = $(element).data(cmd.tag);
                if (encoded) arg = $($('<div>').html(encoded)[0]).html()

                postback = $(element).data(cmd.tag+'Postback')
                if(postback) $(element).on("wire", function(){return window[postback]()})}

            var li = $("<li>")
            var b = $("<button>").attr({class: 'btn btn-default '+ item.class,
                tabindex: -1, type: 'button', title: item.title})
                .on('focus', function(e){ e.stopPropagation()})
                .on('click', function(e){
                    document.execCommand(cmd.name, ui, arg)
                    if(cmd.name=='formatBlock') document.execCommand('insertHtml', false, '<p></p>')
                    if(cmd.tag && postback) $(element).trigger(e = $.Event('wire')) })
                .appendTo(li)

            if(icon) $("<i/>").attr('class', icon).addClass('fa fa-lg').appendTo(b)
            li.appendTo(toolbar)
        })
        toolbar.insertBefore(this.$element)
    }

    Htmlbox.DEFAULTS = {class: "htmlbox", toolbarclass: "htmlbox-toolbar nav nav-pills",
        toolbar: [
        {title:'image',     cmd: {name:'insertHtml', tag:'upload'},   icon: 'fa-picture-o' },
        {title:'bold',      cmd: {name:'Bold'}, icon:'fa fa-bold'},
        {title:'blockquote',cmd: {name:'formatBlock',arg:'blockquote'},icon:'fa-quote-right'},
        {title:'code',      cmd: {name:'formatBlock',arg:'pre'},      icon:'fa-code'}]}

    $.fn.htmlbox = function(settings){
        return this.each(function(){
            var $this   = $(this)
            var data    = $this.data('htmlbox')

            var options = $.extend(true, Htmlbox.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('htmlbox', (data = new Htmlbox(this, options)))
        })
    }

    $.fn.htmlbox.Constructor = Htmlbox

    $.fn.htmlbox.noConflict = function () {
        $.fn.htmlbox = old
        return this
    }

    $(window).on('load', function () {
        $('[data-edit="htmlbox"]').each(function () {
            var $this = $(this)
            $this.htmlbox($this.data())
        })
    })

}(window.jQuery)