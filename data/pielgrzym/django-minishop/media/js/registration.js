$(document).ready(function(){ 
    $("input[name='birthdate']").datepick({dateFormat: 'yy-mm-dd', minDate: '-105Y', yearRange: '-105:0'}); 

    // Custom selectors  
    jQuery.extend(jQuery.expr[":"], {
      blank: "!jQuery.trim(a.value)",
      filled: "!!jQuery.trim(a.value)",
      unchecked: "!a.checked"
    });                    
    // billing address
      $("#billing_address input[type='radio'][name='form-0-is_corporate']").bind('click.switchfields', function(){
        var value = $(this).val();
        if(value == 'True') {
        $("#billing_address p:has(input.corporate_field)").show();
        $("#billing_address p:has(input.private_field)").hide();
        } else {
        $("#billing_address p:has(input.corporate_field)").hide();
        $("#billing_address p:has(input.private_field)").show();
        }
      });

    // shipping address
      $("#shipping_address input[type='radio'][name='form-1-is_corporate']").bind('click.switchfields', function(){
        var value = $(this).val();
        if(value == 'True') {
        $("#shipping_address p:has(input.corporate_field)").show();
        $("#shipping_address p:has(input.private_field)").hide();
        } else {
        $("#shipping_address p:has(input.corporate_field)").hide();
        $("#shipping_address p:has(input.private_field)").show();
        }
      });

      $("input[type='radio'][name='form-0-is_corporate']:checked, input[type='radio'][name='form-1-is_corporate']:checked").trigger('click.switchfields');

      $("input[type='radio'][name='addr_diff']").bind('click.switchaddr', function(){
        var value = $(this).val();
        if(value == 1) {
          $("div#shipping_address p, div#shipping_address ul").hide();
        } else { 
          $("div#shipping_address p, div#shipping_address ul").show();
          $("input[type='radio'][name='form-1-is_corporate']:checked").trigger('click.switchfields');
        }
        });
      
      if($("input[type='radio'][name='addr_diff']:checked").length == 0 || $("input[name='form-1-city']").is(":blank")) {
          $("input[type='radio'][name='addr_diff']:first").attr("checked", "checked");
          $("div#shipping_address p, div#shipping_address ul").hide();
      }
      if($("#shipping_address ul.errorlist").length > 0) {
        $("input[type='radio'][name='addr_diff'][value='2']").trigger('click');
      }

    $("form.formular").submit(function(){
      if($("input[type='radio'][name='addr_diff']:checked").val() == "1") {
      $("input[type='radio'][name='form-1-is_corporate'][value='False']").attr("checked", "checked");
      $("input[type='radio'][name='form-1-is_corporate'][value='True']").removeAttr("checked");
      $("div#shipping_address input[type='text']").val("");
      }
      $("input[name='addr_diff']").removeAttr("name");
    });

    }); // eof doc ready
