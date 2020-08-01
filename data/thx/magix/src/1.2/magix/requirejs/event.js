/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.2
 **/
define("magix/event", ["magix/magix"], function(Magix) {
    eval(Magix.include('../tmpl/event'));
    return Event;
});