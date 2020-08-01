function HorizontalLegend(userConfig)
{ 	
  var chart = new DexComponent(userConfig,
  {
    'parent'          : null,
    'labels'          : [ "A", "B", "C" ],
    'id'              : "HorizontalLegend",
    'class'           : "HorizontalLegend",
    'xoffset'         : 10,
    'yoffset'         : 20,
    'cellWidth'       : 30,
    'cellHeight'      : 20,
    'tickLength'      : 25,
    'caption'         : "Legend",
    'color'           : d3.scale.category20c(),
    'captionFontSize' : 14,
    'captionXOffset'  : 0,
    'captionYOffset'  : -6
  });

  chart.render = function()
  {
    this.update();
  };

  chart.update = function()
  {
    var chart = this;
    var config = chart.config;
  
  // Create our x scale
  var x = d3.scale.ordinal()
    .domain(config.labels)
    .range(d3.range(config.labels.length).map(function(i) { return i * config.cellWidth; }));

  // Create the x axis.
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(config.tickLength)
    .tickPadding(10)
    .tickValues(config.labels)
    .tickFormat(function(d) { return d; });

  // Append a graphics node to the supplied svg node.
  var chartContainer = d3.select(config.parent).append("g")
    .attr("class", config["class"])
    .attr("id", config["id"])
    .attr("transform", "translate(" + config.xoffset + "," + config.yoffset + ")");

  // Draw a colored rectangle for each ordinal range.
  chartContainer.selectAll("rect")
    .data(config.labels)
    .enter().append("rect")
    .attr("height", config.cellHeight)
    .attr("x", function(d, i) { return x(i); })
    .attr("width", function(d) { return config.cellWidth; })
    .style("fill", function(d, i)
    {
      return config.color(i);
    });

  // Add the caption.
  chartContainer.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", config.captionYOffset)
    .attr("x", config.captionXOffset)
    .text(config.caption)
    .style("font-size", config.captionFontSize);
};

return chart;
}
