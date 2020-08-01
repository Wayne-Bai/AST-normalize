$(document).ready(function(){
    
      $("input[type='radio'][name='is_corporate']").bind('click.switchfields', function(){
        var value = $(this).val();
        if(value == 'True') {
        $("p:has(input.corporate_field)").show();
        $("p:has(input.private_field)").hide();
        } else {
        $("p:has(input.corporate_field)").hide();
        $("p:has(input.private_field)").show();
        }
      });
      $("input[type='radio'][name='is_corporate']:checked").trigger('click.switchfields');
    
    }); // eof doc. ready
