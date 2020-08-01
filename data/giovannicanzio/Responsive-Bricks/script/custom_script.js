$(document).ready(function() {
    
    /* 
     * CENTER MENU ITEMS OF top_navigation 
     */
    
//    var topMenuWidth = $("#top_navigation ul").width();
//    var mainContainerWidth = $(".container").width();
//    var topMenuMarginLeft = (mainContainerWidth-topMenuWidth)/2;
//    
//    $("#top_navigation ul").css("margin-left", topMenuMarginLeft);
   
   //////////////////////////
   
   /*
    * DISPLAY top_navigation NESTED MENUS IN sec_menu_container BLOCK
    * 
    * To make it work, set a "sec_menu_container" block and place it in left (or right) column
    * 
    * Example:
    * 
    * BLOCK NAME: Secondary menu
    * 
    * CONTENT (in full-HTML mode): 
    *   <div id="sec_menu_container"></div>
    *   
    * VISIBILITY: everywhere except <frontpage>
    * 
    */
   
   if($("#top_navigation ul.menu li.expanded ul").html() != null) {

   // store html in a variable
   var secMenuCode = $("ul.menu li.expanded ul").html();

   // remove nested menu
   $("ul.menu li.expanded ul").remove();
   
   // copy it into the placeholder block
   var newSecMenu = "<ul class=\"menu\">"+secMenuCode+"</ul>";
   $("#sec_menu_container").html(newSecMenu);
   
   }
   
   
   
   // full-width patch

   // if leftCol has no text...
    if(($("#leftCol")[0].innerText == '') 
            && ($("#rightCol_1")[0].innerText == '')
              ) {
        $("#content").attr("class", "sixteen columns");
    } 
    
    // if leftCol AND rightcol have text...
    
    else if (($("#leftCol")[0].innerText != '') 
            && ($("#rightCol_1")[0].innerText != '')
              ){
        $("#content").attr("class", "eight columns");
    } 
    
    // in any other case...
    
    else {
        if ($("#leftCol")[0].innerText == '') {
            $("#leftCol").addClass('hidden');
        }
        if ($("#rightCol_1")[0].innerText == '') {
            $("#rightCol_1").addClass('hidden');
        }
        $("#content").attr("class", "twelve columns");
    };
    
    // HIDE EMPTY TITLES

    $('h3').each(function(index) {
        
    // if the browser doesn't support .trim() we add it as a method of String.prototype object    
    
    if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, ''); 
            }
        }

    if ($(this).text().trim().length == 0) {
            $(this).addClass("hidden");
        }
    });

})

