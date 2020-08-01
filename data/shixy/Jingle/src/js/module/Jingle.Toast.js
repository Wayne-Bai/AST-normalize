/**
 *  消息组件
 */
J.Toast = (function($){
    var toast_type = 'toast',_toast,timer,
        //定义模板
        TEMPLATE = {
            toast : '<a href="#">{value}</a>',
            success : '<a href="#"><i class="icon checkmark-circle"></i>{value}</a>',
            error : '<a href="#"><i class="icon cancel-circle"></i>{value}</a></div>',
            info : '<a href="#"><i class="icon info-2"></i>{value}</a>'
        }

    var _init = function(){
        //全局只有一个实例
        $('body').append('<div id="jingle_toast"></div>');
        _toast = $('#jingle_toast');
        _subscribeCloseTag();
    }

    /**
     * 关闭消息提示
     */
    var hide = function(){
        J.anim(_toast,'scaleOut',function(){
            _toast.hide();
           _toast.empty();
        });
    }
    /**
     * 显示消息提示
     * @param type 类型  toast|success|error|info  空格 + class name 可以实现自定义样式
     * @param text 文字内容
     * @param duration 持续时间 为0则不自动关闭,默认为3000ms
     */
    var show = function(type,text,duration){
        if(timer) clearTimeout(timer);
        var classname = type.split(/\s/);
        toast_type = classname[0];
        _toast.attr('class',type).html(TEMPLATE[toast_type].replace('{value}',text)).show();
        J.anim(_toast,'scaleIn');
        if(duration !== 0){//为0 不自动关闭
            timer = setTimeout(hide,duration || J.settings.toastDuration);
        }
    }
    var _subscribeCloseTag = function(){
        _toast.on('tap','[data-target="close"]',function(){
            hide();
        })
    }
    _init();
    return {
        show : show,
        hide : hide
    }
})(J.$);