define([
    "hr/dom"
], function($) {
    $.fn.singleDblClick = function(single_click_callback, double_click_callback, timeout) {
        return this.each(function(){
            var clicks = 0, self = this;
            $(this).click(function(event){
                clicks++;
                if (clicks == 1) {
                    setTimeout(function(){
                        if(clicks == 1) {
                            single_click_callback.call(self, event);
                        } else {
                            double_click_callback.call(self, event);
                        }
                        clicks = 0;
                    }, timeout || 300);
                }
            });
        });
    };
});