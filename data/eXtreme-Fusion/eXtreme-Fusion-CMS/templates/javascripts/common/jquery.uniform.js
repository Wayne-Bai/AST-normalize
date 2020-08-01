/*

TO DO: Test in all browsers, clean up theme file, prepare documentation, minisite?

Uniform v1.5
Copyright © 2009 Josh Pyles / Pixelmatrix Design LLC
http://pixelmatrixdesign.com

Requires jQuery 1.3 or newer

Much thanks to Thomas Reynolds and Buck Wilson for their help and advice on this

Disabling text selection is made possible by Mathias Bynens <http://mathiasbynens.be/>
and his noSelect plugin. <http://github.com/mathiasbynens/noSelect-jQuery-Plugin>

Also, thanks to David Kaneda and Eugene Bond for their contributions to the plugin

License:
MIT License - http://www.opensource.org/licenses/mit-license.php

Usage:

$(function(){
  $("select, :radio, :checkbox").uniform();
});

You can customize the classes that Uniform uses:

$("select, :radio, :checkbox").uniform({
  selectClass: 'mySelectClass',
  radioClass: 'myRadioClass',
  checkboxClass: 'myCheckboxClass',
  checkedClass: 'myCheckedClass',
  focusClass: 'myFocusClass'
});

Enjoy!

*/

(function($) {
  $.uniform = {
    options: {
      selectClass:   'selector',
      radioClass: 'radio',
      checkboxClass: 'checker',
      fileClass: 'uploader',
      filenameClass: 'filename',
      fileBtnClass: 'action',
      fileDefaultText: 'Brak pliku...',
      fileBtnText: 'Przeglądaj',
      checkedClass: 'checked',
      focusClass: 'focus',
      disabledClass: 'disabled',
      activeClass: 'active',
      hoverClass: 'hover',
      useID: true,
      idPrefix: 'uniform',
      resetSelector: false
    },
    elements: []
  };

  if($.browser.msie && $.browser.version < 7){
    $.support.selectOpacity = false;
  }else{
    $.support.selectOpacity = true;
  }

  $.fn.uniform = function(options) {

    options = $.extend($.uniform.options, options);

    var el = this;
    //code for specifying a reset button
    if(options.resetSelector != false){
      $(options.resetSelector).mouseup(function(){
        function resetThis(){
          $.uniform.update(el);
        }
        setTimeout(resetThis, 10);
      });
    }

    function doSelect(elem){

      var divTag = $('<div />'),
          spanTag = $('<span />');

      divTag.addClass(options.selectClass);

      if(options.useID){
        divTag.attr("id", options.idPrefix+"-"+elem.attr("id"));
      }
      
      var selected = elem.find(":selected:first");
      if(selected.length == 0){
        selected = elem.find("option:first");
      }
      spanTag.html(selected.text());
      
      elem.css('opacity', 0);
      elem.wrap(divTag);
      elem.before(spanTag);

      //redefine variables
      divTag = elem.parent("div");
      spanTag = elem.siblings("span");

      elem.change(function() {
        spanTag.text(elem.find(":selected").text());
        divTag.removeClass(options.activeClass);
      })
      .focus(function() {
        divTag.addClass(options.focusClass);
      })
      .blur(function() {
        divTag.removeClass(options.focusClass);
        divTag.removeClass(options.activeClass);
      })
      .mousedown(function() {
        divTag.addClass(options.activeClass);
      })
      .mouseup(function() {
        divTag.removeClass(options.activeClass);
      })
      .click(function(){
        divTag.removeClass(options.activeClass);
      })
      .hover(function() {
        divTag.addClass(options.hoverClass);
      }, function() {
        divTag.removeClass(options.hoverClass);
      })
      .keyup(function(){
        spanTag.text(elem.find(":selected").text());
      });

      //handle disabled state
      if($(elem).attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }
      $.uniform.noSelect(spanTag);
      
      storeElement(elem);

    }

    function doCheckbox(elem){

      var divTag = $('<div />'),
          spanTag = $('<span />');

      divTag.addClass(options.checkboxClass);

      //assign the id of the element
      if(options.useID){
        divTag.attr("id", options.idPrefix+"-"+elem.attr("id"));
      }

      //wrap with the proper elements
      $(elem).wrap(divTag);
      $(elem).wrap(spanTag);

      //redefine variables
      spanTag = elem.parent();
      divTag = spanTag.parent();

      //hide normal input and add focus classes
      $(elem)
      .css("opacity", 0)
      .focus(function(){

        divTag.addClass(options.focusClass);
      })
      .blur(function(){

        divTag.removeClass(options.focusClass);
      })
      .click(function(){

        if(!$(elem).attr("checked")){
          //box was just unchecked, uncheck span
          spanTag.removeClass(options.checkedClass);
        }else{
          //box was just checked, check span.
          spanTag.addClass(options.checkedClass);
        }
      })
      .mousedown(function() {
        divTag.addClass(options.activeClass);
      })
      .mouseup(function() {
        divTag.removeClass(options.activeClass);
      })
      .hover(function() {
        divTag.addClass(options.hoverClass);
      }, function() {
        divTag.removeClass(options.hoverClass);
      });

      //handle defaults
      if($(elem).attr("checked")){
        //box is checked by default, check our box
        spanTag.addClass(options.checkedClass);
      }

      //handle disabled state
      if($(elem).attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }

      storeElement(elem);

    }

    function doRadio(elem){

      var divTag = $('<div />'),
          spanTag = $('<span />');

      divTag.addClass(options.radioClass);

      if(options.useID){
        divTag.attr("id", options.idPrefix+"-"+elem.attr("id"));
      }

      //wrap with the proper elements
      $(elem).wrap(divTag);
      $(elem).wrap(spanTag);

      //redefine variables
      spanTag = elem.parent();
      divTag = spanTag.parent();

      //hide normal input and add focus classes
      $(elem)
      .css("opacity", 0)
      .focus(function(){
        divTag.addClass(options.focusClass);
      })
      .blur(function(){
        divTag.removeClass(options.focusClass);
      })
      .click(function(){
        if(!$(elem).attr("checked")){
          //box was just unchecked, uncheck span
          spanTag.removeClass(options.checkedClass);
        }else{
          //box was just checked, check span
          $("."+options.radioClass + " span."+options.checkedClass + ":has([name='" + $(elem).attr('name') + "'])").removeClass(options.checkedClass);
          spanTag.addClass(options.checkedClass);
        }
      })
      .mousedown(function() {
        if(!$(elem).is(":disabled")){
          divTag.addClass(options.activeClass);
        }
      })
      .mouseup(function() {
        divTag.removeClass(options.activeClass);
      })
      .hover(function() {
        divTag.addClass(options.hoverClass);
      }, function() {
        divTag.removeClass(options.hoverClass);
      });

      //handle defaults
      if($(elem).attr("checked")){
        //box is checked by default, check span
        spanTag.addClass(options.checkedClass);
      }
      //handle disabled state
      if($(elem).attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }

      storeElement(elem);

    }

    function doFile(elem){
      //sanitize input
      var $el = $(elem);

      var divTag = $('<div />'),
          filenameTag = $('<span>'+options.fileDefaultText+'</span>'),
          btnTag = $('<span>'+options.fileBtnText+'</span>');

      divTag.addClass(options.fileClass);
      filenameTag.addClass(options.filenameClass);
      btnTag.addClass(options.fileBtnClass);

      if(options.useID){
        divTag.attr("id", options.idPrefix+"-"+$el.attr("id"));
      }

      //wrap with the proper elements
      $el.wrap(divTag);
      $el.after(btnTag);
      $el.after(filenameTag);

      //redefine variables
      divTag = $el.closest("div");
      filenameTag = $el.siblings("."+options.filenameClass);
      btnTag = $el.siblings("."+options.fileBtnClass);

      //set the size
      if(!$el.attr("size")){
        var divWidth = divTag.width();
        //$el.css("width", divWidth);
        $el.attr("size", divWidth/10);
      }

      //actions
      var setFilename = function()
      {
        var filename = $el.val();
        if (filename === '')
        {
          filename = options.fileDefaultText;
        }
        else
        {
          filename = filename.split(/[\/\\]+/);
          filename = filename[(filename.length-1)];
        }
        filenameTag.text(filename);
      };

      // Account for input saved across refreshes
      setFilename();

      $el
      .css("opacity", 0)
      .focus(function(){
        divTag.addClass(options.focusClass);
      })
      .blur(function(){
        divTag.removeClass(options.focusClass);
      })
      .mousedown(function() {
        if(!$(elem).is(":disabled")){
          divTag.addClass(options.activeClass);
        }
      })
      .mouseup(function() {
        divTag.removeClass(options.activeClass);
      })
      .hover(function() {
        divTag.addClass(options.hoverClass);
      }, function() {
        divTag.removeClass(options.hoverClass);
      });

      // IE7 doesn't fire onChange until blur or second fire.
      if ($.browser.msie)
      {
        // IE considers browser chrome blocking I/O, so it
        // suspends tiemouts until after the file has been selected.
        $el.click(function() {
          setTimeout(setFilename, 0);
        });
      }
      else
      {
        // All other browsers behave properly
        $el.change(setFilename);
      }

      //handle defaults
      if($el.attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }
      
      $.uniform.noSelect(filenameTag);
      $.uniform.noSelect(btnTag);
      storeElement(elem);

    }

    function storeElement(elem){
      //store this element in our global array
      elem = $(elem).get();
      if(elem.length > 1){
        $.each(elem, function(i, val){
          $.uniform.elements.push(val);
        });
      }else{
        $.uniform.elements.push(elem);
      }
    }
    
    //noSelect v1.0
    $.uniform.noSelect = function(elem) {
      function f() {
       return false;
      };
      $(elem).each(function() {
       this.onselectstart = this.ondragstart = f; // Webkit & IE
       $(this)
        .mousedown(f) // Webkit & Opera
        .css({ MozUserSelect: 'none' }); // Firefox
      });
     };

    $.uniform.update = function(elem){
      if(elem == undefined){
        elem = $($.uniform.elements);
      }
      //sanitize input
      elem = $(elem);

      elem.each(function(){
        //do to each item in the selector
        //function to reset all classes
        var $e = $(this);

        if($e.is("select")){
          //element is a select
          var spanTag = $e.siblings("span");
          var divTag = $e.parent("div");

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);

          //reset current selected text
          spanTag.html($e.find(":selected").text());

          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }

        }else if($e.is(":checkbox")){
          //element is a checkbox
          var spanTag = $e.closest("span");
          var divTag = $e.closest("div");

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);
          spanTag.removeClass(options.checkedClass);

          if($e.is(":checked")){
            spanTag.addClass(options.checkedClass);
          }
          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }

        }else if($e.is(":radio")){
          //element is a radio
          var spanTag = $e.closest("span");
          var divTag = $e.closest("div");

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);
          spanTag.removeClass(options.checkedClass);

          if($e.is(":checked")){
            spanTag.addClass(options.checkedClass);
          }

          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }
        }else if($e.is(":file")){
          var divTag = $e.parent("div");
          var filenameTag = $e.siblings(options.filenameClass);
          btnTag = $e.siblings(options.fileBtnClass);

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);

          filenameTag.text($e.val());

          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }
        }
      });
    }

    return this.each(function() {
      if($.support.selectOpacity){
        var elem = $(this);

        if(elem.is("select")){
          //element is a select
          if(elem.attr("multiple") != true){
            //element is not a multi-select
            if(elem.attr("size") == undefined || elem.attr("size") <= 1){
              doSelect(elem);
            }
          }
        }else if(elem.is(":checkbox")){
          //element is a checkbox
          doCheckbox(elem);
        }else if(elem.is(":radio")){
          //element is a radio
          doRadio(elem);
        }else if(elem.is(":file")){
          //element is a file upload
          doFile(elem);
        }

      }
    });
  };
})(jQuery);


function counter(suffix) {
    if (!suffix) {var suffix = '';}
    var seocounter_title = 70;
    var seocounter_meta = 155;
    $('input, textarea').each(function(){
        var s = false;
        var c = $(this).attr('class');
		if (c)
		{
        var a = c.split(' ');
        var r = /num_(.*)/i;
        for(i=0; i<a.length; i++) {
            var m = r.exec(a[i]);
            if (m != null && m.length > 1) {
            	s = m[1];
            }
        }
        if (s == 'title') {s=seocounter_title-suffix.length;}
        if (s == 'meta') {s=seocounter_meta;}
        if ((s != false) && (!$('#num_'+$(this).attr('name')).length)) {
            var l = s - $(this).val().length;
            $(this).after(' <span class="MaxNum" id="num_'+$(this).attr('name')+'">'+l+'</span>');
            $(this).keyup(function(){
                var l = s - $(this).val().length;                
                $('#num_'+$(this).attr('name')).html(l);
            });
        }
		}
    });
}