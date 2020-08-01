"use strict";

var all_details = {};
var number_of_responses = 0;

$(function () {
  var $graph = $('.graph');
  if ($graph.length) {
    var query = location.href.match(/\?.+/) || '';
    $.ajax({url: '/responses/count.json' + query}).done(function (data) {
      number_of_responses = data;
      $.ajax({url: '/responses/charts.json' + query}).done(function (data) {
        all_details = data;
        $graph.each(function () {
          addGraph(this.id.replace('graph_', ''));
        });
      });
    });
  }
});

var GRAPH_CONF = {
  // Width and height of the graph are exclusive of margins
  max_width: 900,
  height: 240,
  margin: {
    top: 10,
    right: 30,
    bottom: 20,
    left: 50
  },
  max_bar_width: 100
};

// Set the maximum number of bars based on a desired minimum bar width:
GRAPH_CONF.max_n_bars = Math.floor(GRAPH_CONF.max_width / 25);

function addGraph(id) {
  var details = all_details[id];
  var graph = d3.select("#graph_" + id);

  if (details.counts !== undefined) {
    // checkboxes or radio buttons
    checkboxesGraph(graph, details);
  } else if (details.choices !== undefined) {
    // slider or scaler
    sliderGraph(graph, details);
    // maintainIncreaseDecreaseGraph(graph, details);
  } else {
    console && console.log && console.log('Unsupported graph: ' + id);
  }
}

function sliderGraph(graph, details) {
  var values = details.choices;

  var n_choices = ((details.maximum_units - details.minimum_units) / details.step) + 1;
  var n_bars = Math.min(n_choices, GRAPH_CONF.max_n_bars);
  var width = graphWidth(n_bars);

  var x_lin = d3.scale.linear()
    .domain([details.minimum_units, details.maximum_units])
    .range([0, width]);

  if (n_bars === n_choices) {
    // There is enough room for 1 bar per choice.  Use an ordinal
    // scale and a 1:1 mapping between bins and choices.
    var x = d3.scale.ordinal()
      .domain(d3.range(details.minimum_units,
               details.maximum_units + details.step,
               details.step))
      .rangeBands([0, width]);

    var data = d3.layout.histogram()
      .bins(d3.range(details.minimum_units,
               details.maximum_units + details.step * 2,
               details.step))
      (values);

    var bar_width = x.rangeBand();
  } else {
    // Too many choices.  Use a linear scale and max_n_bars bins.
    var x = x_lin;

    var data = d3.layout.histogram()
      .bins(x.ticks(GRAPH_CONF.max_n_bars))
      (values);

    var bar_width = x(details.minimum_units + data[0].dx);
  }

  var max_bin_value = d3.max(data, function (d) { return d.y; });
  var max_bin_percentage = max_bin_value / number_of_responses;
  var median = d3.median(values);

  var y_prescale = d3.scale.linear()
    .domain([0, max_bin_value])
    .range([0, max_bin_percentage]);

  var y = d3.scale.linear()
    .domain([0, max_bin_percentage])
    .range([GRAPH_CONF.height, 0]);

  var default_value = parseFloat(details.default_value);
  function bar_class(d) {
    var maximum = parseFloat((d.x + d.dx).toFixed(10));
    if (default_value >= d.x && default_value < maximum) {
      return "default";
    }
    if (median >= d.x && median < maximum) {
      return "median";
    }
    return "standard";
  }

  var x_format = '';
  if (details.widget === 'scaler') {
    x_format = 'percentage';
  } else if (details.minimum_units === 0 && details.maximum_units === 1 && details.step === 1) {
    x_format = 'yesno';
  }

  var svg = drawGraph(graph, data, x, y, y_prescale, width, bar_width,
            bar_class, x_format, details);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", GRAPH_CONF.height + 30)
    .attr("text-anchor", "middle")
    .text(details.unit_name);

  if (n_choices > 2) {
    var mean_scaled = x_lin(parseFloat(details.mean_choice));
    svg.append("line")
      .attr("x1", mean_scaled)
      .attr("y1", GRAPH_CONF.height + 10)
      .attr("x2", mean_scaled)
      .attr("y2", 0)
      .attr("stroke-width", 1)
      .attr("stroke", "#000");
  }
}

function maintainIncreaseDecreaseGraph(graph, details) {
  var labels = [t('Decrease'), t('Maintain'), t('Increase')];

  var raw_counts = {};
  raw_counts[t('Decrease')] = 0;
  raw_counts[t('Maintain')] = 0;
  raw_counts[t('Increase')] = 0;
  for (var i = 0, l = details.choices.length; i < l; i++) {
    var key;
    if (details.choices[i] < details.default_value) {
      key = t('Decrease');
    }
    else if (details.choices[i] > details.default_value) {
      key = t('Increase');
    }
    else {
      key = t('Maintain');
    }
    raw_counts[key] += 1;
  }

  var raw_counts = d3.map(raw_counts);
  var data = [];
  for (var original_key in raw_counts) {
    if (raw_counts.hasOwnProperty(original_key)) {
      var key = original_key;
      if (key.charCodeAt(0) == 0) {
        key = key.substring(1);
      }
      data.push({x: key, y: raw_counts[original_key]});
    }
  }

  var width = graphWidth(data.length);

  var x = d3.scale.ordinal()
    .domain(labels)
    .rangeBands([0, width]);

  var bar_width = x.rangeBand();

  var max_data_value = d3.max(data, function (d) { return d.y; });

  var y_prescale = d3.scale.linear()
    .domain([0, max_data_value])
    .range([0, max_data_value / details.n]);

  var y = d3.scale.linear()
    .domain([0, max_data_value / details.n])
    .range([GRAPH_CONF.height, 0]);

  drawGraph(graph, data, x, y, y_prescale, width, bar_width, 'standard', '', details);
}

function checkboxesGraph(graph, details) { // or radio buttons
  var labels = [];
  var label_map = {};
  if (details.options !== undefined && details.labels !== undefined) { // radio buttons
    // we need to create a label map to translate
    // options into labels.
    for (var i = 0; i < details.options.length; i++) {
      label_map[details.options[i]] = details.labels[i];
      labels.push(details.labels[i]);
    }
  } else { // checkboxes
    for (var key in details.raw_counts) {
      if (details.raw_counts.hasOwnProperty(key)) {
        labels.push(key);
      }
    }
  }

  var raw_counts = d3.map(details.raw_counts);
  var data = [];
  for (var original_key in raw_counts) {
    if (raw_counts.hasOwnProperty(original_key)) {
      var key = original_key;
      if (key.charCodeAt(0) == 0) {
        key = key.substring(1);
      }
      if (details.options !== undefined && details.labels !== undefined) { // radio buttons
        key = label_map[key];
      }
      data.push({x: key, y: raw_counts[original_key]});
    }
  }

  var width = graphWidth(data.length);

  var x = d3.scale.ordinal()
    .domain(labels)
    .rangeBands([0, width]);

  var bar_width = x.rangeBand();

  var max_data_value = d3.max(data, function (d) { return d.y; });
  var max_percentage = d3.max(d3.values(details.counts));

  var y_prescale = d3.scale.linear()
    .domain([0, max_data_value])
    .range([0, max_percentage]);

  var y = d3.scale.linear()
    .domain([0, max_percentage])
    .range([GRAPH_CONF.height, 0]);

  drawGraph(graph, data, x, y, y_prescale, width, bar_width, 'standard', '', details);
}

function drawGraph(graph, data, x, y, y_prescale, width, bar_width,
           bar_class, x_format, details) {
  // Actually draws the graph and returns its svg container.
  // graph: d3.select-ed container in which to put the graph.
  // data: data to graph
  // x, y, y_prescale: scales
  // width: width of graph
  // bar_width: width of each bar
  // bar_class: class to apply to each bar.  Can be a function.
  // x_format: apply special formatting to the x-axis:
  //   percentage: format as percentage
  //   yesno: format 0 as "no" and others as "yes" (translated)

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  if (x_format === 'percentage') {
    xAxis = xAxis.tickFormat(d3.format(".0%"));
  } else if (x_format === 'yesno') {
    xAxis = xAxis.tickFormat(function (d) {
      if (details.labels) {
        return details.labels[d];
      }
      else {
        return (d === 0) ? t('no') : t('yes');
      }
    });
  } else if (x.domain().every(function (n) {return $.isNumeric(n);})) {
    xAxis = xAxis.tickFormat(function (x) {
      return d3.format(".3f")(x).replace(/\.([0-9]*[1-9])?0+(\D)?$/, '.$1$2').replace(/\.(\D)?$/, '$1');
    });
  }

  function makeYAxis() {
    return d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".0%"));
  }

  var svg = graph.append("svg")
    .attr("width", width + GRAPH_CONF.margin.left +
        GRAPH_CONF.margin.right)
    .attr("height", GRAPH_CONF.height + GRAPH_CONF.margin.top +
        GRAPH_CONF.margin.bottom);

  var container = svg.append("g")
    .attr("transform", "translate(" + GRAPH_CONF.margin.left + "," +
        GRAPH_CONF.margin.top + ")");

  var bar = container.selectAll(".bar")
    .data(data)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function (d) {
      return "translate(" + x(d.x) + "," + y(y_prescale(d.y)) + ")";
    });

  // Bars.
  bar.append("rect")
    .attr("class", bar_class)
    .attr("x", 1)
    .attr("width", bar_width - 1)
    .attr("height", function (d) {
      return GRAPH_CONF.height - y(y_prescale(d.y));
    });

  // Numbers on top of bar.
  // @note White grid lines will occasionally cross these, and we can't change
  // the order in which they appear in the SVG to prevent this, because the
  // white grid lines' parent is `container` but the numbers' parent is `bar`.
  bar.append("text")
    .attr("dy", ".75em")
    .attr("y", -10)
    .attr("x", bar_width / 2)
    .attr("text-anchor", "middle")
    .text(function (d) { return d3.format(",.0f")(d.y); });

  // Y-axis.
  container.append("g")
    .attr("class", "y axis")
    .call(makeYAxis());

  container.append("text")
    .attr("dy", ".75em")
    .attr("y", -50)
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .text(t('y_axis'));

  // White grid lines.
  container.append("g")
    .attr("class", "grid")
    .call(makeYAxis()
      .ticks(5)
      .tickSize(-width, 0)
      .tickFormat(""));

  // X-axis.
  container.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + GRAPH_CONF.height + ")")
    .call(xAxis)
    .selectAll("text")
    .call(wrap, bar_width);

  var max_label_height = 0;
  container.selectAll('g.x.axis g.tick text').each(function () {
    if (this.getBBox().height > max_label_height) {
      max_label_height = this.getBBox().height;
    }
  });

  var old_height = parseInt(svg.attr("height"));
  svg.attr("height", old_height + max_label_height);

  return container;
}

function graphWidth(n_bars) {
  // Returns an appropriate graph width based on the number of bars.

  var trial_bar_width = Math.floor(GRAPH_CONF.max_width / n_bars);
  var width = n_bars * Math.min(trial_bar_width, GRAPH_CONF.max_bar_width);
  return width;
}

// from: http://bl.ocks.org/mbostock/7555321
// Also replaces HTML tags (such as <br>) with space.
function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().replace(/<[^>]+>/g, " ").split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}
