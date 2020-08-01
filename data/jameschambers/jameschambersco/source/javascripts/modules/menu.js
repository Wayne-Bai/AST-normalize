var Menu = (function() {

  // -------------------------------------------------
  //
  // UI
  // 
  // -------------------------------------------------

  var UI = {
    menu: '.js-menu',
    cross: '.js-close'
  };

  // -------------------------------------------------
  //
  // Bind UI events
  // 
  // -------------------------------------------------

  function bindEvents() {

    $(UI.menu).bind('click', onBurgerClick);
    $(UI.cross).bind('click', onCrossClick);

  }


  // -------------------------------------------------
  //
  // Burger click
  // 
  // -------------------------------------------------


  function onBurgerClick(event) {

    event.preventDefault();

    $('body').addClass('is--menu-active');

  }


  // -------------------------------------------------
  //
  // Cross click
  // 
  // -------------------------------------------------


  function onCrossClick(event) {

    event.preventDefault();

    $('body').removeClass('is--menu-active');

  }


  return {
    init: function() {
      bindEvents();
    }
  };

})();

Menu.init();