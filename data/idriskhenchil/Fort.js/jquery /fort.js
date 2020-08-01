function solid() {
  var inputs = $(".form :input").not('button, [type="button"], [type="submit"]').on({
    input: cback
  });

  function cback() {
    var b = inputs.filter(function () {
        return !this.value.length;
      }).length,
      a = inputs.length;
    $(".top").css("width", 100 - (b / a) * 100 + "%");
  }
}