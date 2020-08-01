(function($) {
  $.checkable = {
    options:{
      focusedClass:'focused',
      checkedClass:'checked',
      disabledClass:'disabled'
    }
  };
  
  $.fn.checkable = function(options) {
    var options = $.extend($.checkable.options, options);
    
    return this.each(function() {
      var container = $(this);
      var input = $(this).find('input:radio');
      
      if (input.is(':disabled'))
        container.addClass('disabled');
      
      container.click(function(e) {
        if ($(e.target).is('label') || input.is(':disabled')) { return true; }
        
        if (input.is(':checkbox')) {
          input.is(':checked') ? input.attr('checked',false) : input.attr('checked',true);
          input.trigger('checkable.change');
        } else {
          input.attr('checked',true);
          $('input:radio[name=' + input.attr('name') + ']').trigger('checkable.change'); 
        }
      });
      
      input.css({'position':'absolute','left':'-999em'});
      input.focus(function() { container.addClass(options.focusedClass) });
      input.blur(function() { container.removeClass(options.focusedClass); input.trigger('checkable.change') });
      input.change(function() {
        input.trigger('checkable.change');
        $('input:radio[name=' + input.attr('name') + ']').trigger('checkable.change'); 
      });
      
      input.bind('checkable.change', function() {
        if ($(this).is(':checked')) {
          container.addClass(options.checkedClass);
        } else {
          container.removeClass(options.checkedClass);
        }
      });
      
      input.trigger('checkable.change');
    });
  };
})(jQuery);