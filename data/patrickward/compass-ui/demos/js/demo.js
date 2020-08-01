$(function(){

  // Load each section and it's associated demo code
  $('div[id^="demo-"]').each(function() {
    $(this).load('sections/' + $(this).attr('id').substr(5) + '.html', function() {
      loadDemo($(this).attr('id'));
    });
  });

  function loadDemo(argument) {

    switch(argument) {

      // ---------------------------
      // Countries 
      // ---------------------------
      case 'demo-autocomplete':
        var countryList = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome", "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

        $("#countries").autocomplete({
          source: countryList
        });
        // code
        break;

      // ---------------------------
      // Accordion 
      // ---------------------------
      case 'demo-accordion':
        $(".accordion").accordion({ header: "h3" });
        break;
      
      // ---------------------------
      // Sliders 
      // ---------------------------
      case 'demo-sliders':
        // Horizontal Slider
        $('#horizSlider').slider({
          range: true,
          values: [17, 67]
        }).width(500);

        // Vertical Slider				
        $("#eq > span").each(function() {
          var value = parseInt($(this).text());
          $(this).empty().slider({
            value: value,
            range: "min",
            animate: true,
            orientation: "vertical"
          });
        });
        break;

      // ---------------------------
      // Tabs 
      // ---------------------------
      case 'demo-tabs':
        $('#tabs').tabs();
        break;

      // ---------------------------
      // Dialog 
      // ---------------------------
      case 'demo-dialog':
        // Dialog			
        $('#dialog').dialog({
          autoOpen: false,
          width: 600,
          buttons: {
            "Ok": function() { 
              $(this).dialog("close"); 
            }, 
          "Cancel": function() { 
            $(this).dialog("close"); 
          } 
          },
          modal: true
        });

        $('#dialog_link').button().click(function(){
          $('#dialog').dialog('open');
          return false;
        });
        break; 

      // ---------------------------
      // Datepicker 
      // ---------------------------
      case 'demo-datepicker':
        $('#datepicker').datepicker({
          showButtonPanel: true
        }).children().show();

        $('#datepicker2').datepicker({
          numberOfMonths: 3,
          showButtonPanel: true
        }).children().show();
        break;

      // ---------------------------
      //  Icons
      // ---------------------------
      case 'demo-icons':
        //hover states on the static widgets
        $('#dialog_link, ul#icons li').hover(
            function() { $(this).addClass('ui-state-hover'); }, 
            function() { $(this).removeClass('ui-state-hover'); }
            );
        break;
        
      // ---------------------------
      //  Buttons
      // ---------------------------
      case 'demo-buttons': 
        // Button
        $("#divButton, #linkButton, #submitButton, #inputButton").button();

        // Icon Buttons
        $("#leftIconButton").button({
          icons: {
                   primary: 'ui-icon-wrench'
                 }
        });

        $("#bothIconButton").button({
          icons: {
                   primary: 'ui-icon-wrench',
          secondary: 'ui-icon-triangle-1-s'
                 }
        });					

        // Color buttons
        $("#dangerButton, #safeButton").button();

        // Button Set
        $("#radio1").buttonset();

        $("#buttonInModal").button({
          icons: {primary: 'ui-icon-wrench'}
        });


        break;

      // ---------------------------
      //  Progressbar
      // ---------------------------
      case 'demo-progressbar': 
        // Progressbar
        $("#progressbar").progressbar({
          value: 37
        }).width(500);
        $("#animateProgress").click(function(event) {
          var randNum = Math.random() * 90;
          $("#progressbar div").animate( { width: randNum+"%" } );
          event.preventDefault();
        });
        break;
        
      // ---------------------------
      //  Combinations
      // ---------------------------
      case 'demo-combinations': 
        // Combinations
        $('#tabs2').tabs();
        $("#accordion2").accordion({ header: "h4" });
        // Nested button tests
        $("#nestedButtonTest_1, #nestedButtonTest_2, #buttonInModal")
          .button().click(function(e) {
            e.preventDefault();
          });
        break;
      // ---------------------------
      //  Combinations
      // ---------------------------
      case 'demo-form': 
        $('.format-ui-button').button();
        break;
      default:
        // code
    }

  }

  // Handle Style Switching
  $('#toggle-css a').click(function() {
    var name = $(this).html();
    var summary = $(this).attr('data-summary');
    summary = name + '<br><span class="summary">' + summary + '</span>';
    // $('link[rel=stylesheet]').attr({href: $(this).attr('rel') + '?' + Date.now() });
    $('link[id="theme"]').attr({href: $(this).attr('rel') + '?' + Number(new Date()) });
    $('h2#showing span')
      .fadeOut('slow', function() {
        $(this)
          .html(summary)
          .fadeIn('slow');
      });
  });

  // trigger a click on the first theme choice
  $('#toggle-css a:first').click();

});

