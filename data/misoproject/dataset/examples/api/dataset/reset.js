var ds = new Miso.Dataset({
  data: [
    { one : 1, two : 4, three : 7 },
    { one : 2, two : 5, three : 8 }
  ]
});

ds.fetch({
  success: function() {
    log( this.column('two').data );
    this.reset();
    log( this.column('two').data );
  }
});
