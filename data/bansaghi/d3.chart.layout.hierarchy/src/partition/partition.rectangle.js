
d3.chart("hierarchy").extend("partition.rectangle", {

  initialize : function() {

    var chart = this;
    
    chart.d3.layout = d3.layout.partition();

    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

   
    var x = d3.scale.linear().range([0, chart._width]),
        y = d3.scale.linear().range([0, chart._height]);

    chart.d3.transform = function(d, ky) { return "translate(8," + d.dx * ky / 2 + ")"; };


    chart.layer("base", chart.layers.base, {

      dataBind: function(data) {
        return this.selectAll(".partition").data(data);
      },

      insert: function() {
        return this.append("g").classed("partition", true)
          .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });
      },

      events: {
        enter: function() {
          var kx = chart._width  / chart.root.dx,
              ky = chart._height / 1; 

          this.append("rect")
            .attr("class", function(d) { return d.children ? "parent" : "child"; })
            .attr("width", chart.root.dy * kx)
            .attr("height", function(d) { return d.dx * ky; }); 

          this.append("text")
            .attr("transform", function(d) { return chart.d3.transform(d, ky); })
            .attr("dy", ".35em")
            .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
            .text(function(d) { return d[chart._name]; });

          this.on("click", function(event) {
            var that = this;

            setTimeout(function() {
              var dblclick = parseInt(that.getAttribute("data-double"), 10);
              if( dblclick > 0 ) {
                that.setAttribute("data-double", dblclick-1);
              } else {
                chart.trigger("singleClick", event);
              }
            }, 300);
            d3.event.stopPropagation();

          }).on("dblclick", function(event) {
            this.setAttribute("data-double", 2);
            chart.trigger("doubleClick", event);
            d3.event.stopPropagation();
          });
        }
      }
    });
  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout.nodes(root);
  },


  collapsible: function() {
    var chart = this;

    var node,
        x = d3.scale.linear(),
        y = d3.scale.linear().range([0, chart._height]);

    chart.layers.base.on("merge", function() {
      node = chart.root;
      chart.on("singleClick", function(d) { collapse(node == d ? chart.root : d); });
    });

    chart.base.on("click", function() { collapse(chart.root); });


    function collapse(d) {
      var kx = (d.y ? chart._width - 40 : chart._width) / (1 - d.y),
          ky = chart._height / d.dx;

      x.domain([d.y, 1]).range([d.y ? 40 : 0, chart._width]);
      y.domain([d.x, d.x + d.dx]);

      var t = chart.layers.base.transition()
        .duration(chart._duration);

      t.selectAll(".partition")
        .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

      t.selectAll("rect")
        .attr("width", d.dy * kx)
        .attr("height", function(d) { return d.dx * ky; });

      t.selectAll("text")
        .attr("transform", function(d) { return chart.d3.transform(d, ky); })
        .style("opacity",  function(d) { return d.dx * ky > 12 ? 1 : 0; });

      node = d;
    }
  
    return chart;
  },
});


