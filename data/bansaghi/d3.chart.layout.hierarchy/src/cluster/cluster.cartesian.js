
d3.chart("cluster-tree.cartesian").extend("cluster.cartesian", {

  initialize : function() {
    this.d3.layout = d3.layout.cluster();
  },
});
