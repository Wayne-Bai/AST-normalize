var ds = new Miso.Dataset({
  data: [
    { one : 1, two : 4, three : 7 },
    { one : 2, two : 5, three : 8 },
    { one : 6, two : 8, three : 55 }
  ]
});

ds.fetch({
  success: function() {
    log( "Column 'one' sum: " + this.sum('one') );
    log( "Column 'two' sum: " + this.sum('two') );
  }
});
