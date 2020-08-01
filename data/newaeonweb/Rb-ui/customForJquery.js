/*	Responsive Aeon Grid v2.0
	Designed & Built by Fernando Monteiro, http://www.newaeonweb.com.br	
	Licensed under GPL license, http://www.gnu.org/licenses/gpl-3.0-standalone.html
	
*/
//Basic script for Responsive navigation

    (function(){
        'use strict';

        $.extend($.fn, {
            Rbmenu: function(){
                $("#nav").before('<div id="menu"> <span>&#9776</span> </div>');

                    $("#menu").on('click', function(){
                        $("#nav").toggle();
                    });

                    $(window).resize(function(){ 
                        if(window.innerWidth > 768) { 
                            $("#nav").removeAttr("style");
                        } 
                    });

            }
        });
    })(jQuery);   


    $('nav ul').Rbmenu();       


    //Modal
    (function(){
        'use strict';

        $.extend($.fn, {
            Rbmodal: function(){
                //$('.Rb-modal').hide();
                    $('#open-modal').on('click', function(){
                        $('<div id="overlay" style="width:1269px;height:780px; background-color:rgba(0,0,0,0.3); position: fixed; top:0;left:0; z-index:2000"></div>').appendTo('body');
                        $(".Rb-modal").animate({
                            top: '+50'
                        }, 100);
                    });

                    $('#close-modal').on('click', function(){
                        $('#overlay').remove();
                        $(".Rb-modal").animate({
                            top: '-500'
                        }, 100);
                    });
            }
        });
    })(jQuery);   


    $('.Rb-modal').Rbmodal(); 


    // Accordion

    (function(){
        'use strict';
  
        $.extend($.fn, {
            Rbaccordion: function(){
                
                $('.RbaccordionHeading').on('click', function() {
                    $('.RbaccordionHeading').removeClass('Rbactive');
                        $('.Rbcontent').slideUp();
                   
                        if($(this).next().is(':hidden') === true) {
                            
                            $(this).addClass('Rbactive');
                                  
                                $(this).next().slideDown();
                        } 
                          
                });
                      
                $('.Rbcontent').hide();
            }
        });
    })(jQuery);

    $('.accordion').Rbaccordion();

    // tabs

    (function(){
        'use strict';

        $.extend($.fn, {
            Rbtabs: function(){

                $(this).find('div').eq(0).addClass('listTabs');
                $(this).find('div').eq(1).addClass('contentTabs');

                var tabsList = '.listTabs';
                var tabContent = '.contentTabs';
                    
                    $(tabContent + ' div').hide();
                    $(tabContent + ' div:first-child').show();
                
                $(tabsList + ' a').on('click', function() {           
                    $(tabsList + ' a').removeClass('selected');
                    $(this).addClass('selected');

                    $(tabContent + ' div').hide();
                    
                    $(tabContent +  ' ' + $(this).attr('href')).show();
                    return false;
                }); 
            }
        });
    })(jQuery);

    $('.tabs').Rbtabs();
