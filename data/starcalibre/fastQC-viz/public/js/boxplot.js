// boxplot object

function BoxPlot() {
  this.strokeWidth = 0.75;
  this.barWidth = 3;
  this.margin = {top: 30, right: 30, bottom: 40, left: 30};
}

BoxPlot.prototype.bindTo = function(value) {
  if(!arguments.length) { return value }
  this.element = value;
  return this
};

BoxPlot.prototype.width = function(value) {
  if(!arguments.length) { return value }
  this.width = value - this.margin.left - this.margin.right;
  return this
};

BoxPlot.prototype.height = function(value) {
  if(!arguments.length) { return value }
  this.height = value - this.margin.top - this.margin.bottom;
  return this
};

BoxPlot.prototype.drawBox = function(i, value) {
  // add whiskers
  this.svg.append('line')
    .attr('x1', this.xScale(i+1))
    .attr('y1', this.yScale(value['90p']))
    .attr('x2', this.xScale(i+1))
    .attr('y2', this.yScale(value['3q']))
    .attr('stroke', 'black')
    .attr('stroke-width', this.strokeWidth)
    .classed('boxplot', true);

  this.svg.append('line')
    .attr('x1', this.xScale(i+1))
    .attr('y1', this.yScale(value['1q']))
    .attr('x2', this.xScale(i+1))
    .attr('y2', this.yScale(value['10p']))
    .attr('stroke', 'black')
    .attr('stroke-width', this.strokeWidth)
    .classed('boxplot', true);

  // add IQR box
  this.svg.append('rect')
    .attr('x', this.xScale(i+1) - this.barWidth)
    .attr('y', this.yScale(value['3q']))
    .attr('width', 2*this.barWidth)
    .attr('height', this.yScale(value['1q']) - this.yScale(value['3q']))
    .attr('stroke', 'black')
    .attr('fill', '#f0f000')
    .attr('stroke-width', this.strokeWidth)
    .classed('boxplot', true);

  // add min line
  this.svg.append('line')
    .attr('x1', this.xScale(i+1) - this.barWidth)
    .attr('y1', this.yScale(value['10p']))
    .attr('x2', this.xScale(i+1) + this.barWidth)
    .attr('y2', this.yScale(value['10p']))
    .attr('stroke', 'black')
    .attr('stroke-width', this.strokeWidth)
    .classed('boxplot', true);

  // add max line
  this.svg.append('line')
    .attr('x1', this.xScale(i+1) - this.barWidth)
    .attr('y1', this.yScale(value['90p']))
    .attr('x2', this.xScale(i+1) + this.barWidth)
    .attr('y2', this.yScale(value['90p']))
    .attr('stroke', 'black')
    .attr('stroke-width', this.strokeWidth)
    .classed('boxplot', true);

  // add median line
  this.svg.append('line')
    .attr('x1', this.xScale(i+1) - this.barWidth)
    .attr('y1', this.yScale(value['med']))
    .attr('x2', this.xScale(i+1) + this.barWidth)
    .attr('y2', this.yScale(value['med']))
    .attr('stroke', 'black')
    .attr('stroke-width', this.strokeWidth)
    .classed('boxplot', true);
};

BoxPlot.prototype.render = function(data) {

  console.log(data);

  // remove any existing plots before rendering
  $(this.element).empty();

  // find max
  var yMax = d3.max(data, function(d) {return d['90p']} );
  var xMax = data.length;

  // define axis and scales
  // create 20 odd ticks on x axis
  this.xScale = d3.scale.linear()
    .domain([0, xMax])
    .range([0, this.width]);
  this.xAxis = d3.svg.axis()
    .scale(this.xScale)
    .tickValues(function () {
      var ticks = [];
      for(var i = 0; i < Math.floor(xMax/2); i++) {
        ticks.push(2*i+1)
      }
      return ticks;
    })
    .orient('bottom');

  this.yScale = d3.scale.linear()
    .domain([0, yMax])
    .range([this.height, 0]);
  this.yAxis = d3.svg.axis()
    .scale(this.yScale)
    .ticks(20)
    .orient('left');

  // setup canvas
  this.svg = d3.select(this.element).append('svg')
    .attr('id', 'box-plot')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr('height', this.height + this.margin.top + this.margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  // call drawBox function on each object in data array
  for(var i = 0; i < data.length; i++) {
    this.drawBox(i, data[i]);
  }

  // append x and y axis
  this.svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + this.height + ')')
    .call(this.xAxis);
  this.svg.append('g')
    .attr('class', 'y axis')
    .call(this.yAxis);

  // add x axis label
  this.svg.append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'end')
    .attr('x', this.width/2 + 50)
    .attr('y', this.height + 35)
    .text('Position in read (bp)');

  // add title
  this.svg.append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'end')
    .attr('x', this.width/2 + 150)
    .attr('y', -10)
    .text('Quality scores across all bases (Illumina >v1.3 encoding)');

};
