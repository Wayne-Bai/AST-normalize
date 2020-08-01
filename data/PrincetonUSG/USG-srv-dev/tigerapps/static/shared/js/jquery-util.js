(function( $ ){
//plugin buttonset vertical
$.fn.buttonsetsq = function() {
  $(this).buttonset();
  var labels = $('label', this);
  var l0 = $(labels[0]).removeClass('ui-corner-left').addClass('ui-corner-tl');
  var l1 = $(labels[1]).addClass('ui-corner-tr');
  var l2 = $(labels[2]).addClass('ui-corner-bl')
  var l3 = $(labels[3]).removeClass('ui-corner-right').addClass('ui-corner-br');
  var w0 = l0.width();
  var w1 = l1.width();
  var w2 = l2.width();
  var w3 = l3.width();
  if (w0 + w1 > w2 + w3) {
      var rat = (w0 + w1) / (w2 + w3);
      l2.width(w2 * rat);
      l3.width(w3 * rat);
  } else {
      var rat = (w2 + w3) / (w0 + w1);
      l0.width(w0 * rat);
      l1.width(w1 * rat);
  }
      
};
})( jQuery );

$.fn.showSpinner = function() {
    this.html('<img src="/static/shared/img/loading-spinner.gif" class="loading-spinner">');
}

