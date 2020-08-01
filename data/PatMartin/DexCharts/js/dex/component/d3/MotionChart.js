MotionChart.prototype = new DexComponent();
function MotionChart(userConfig) {
  var defaultColor = d3.scale.category10();

  var defaults =
  {
    // The parent container of this chart.
    'parent': null,
    'timeLabel': null,
    // Set these when you need to CSS style components independently.
    'id': 'MotionChart',
    'class': 'MotionChart',
    // Our data...
    'csv': {
      // Give folks without data something to look at anyhow.
      'header': [ "time", "category", "x", "y", "name", "size" ],
      'data': [
        [2010, "C1", 1, 1, "NAME1", 1],
        [2010, "C2", 2, 2, "NAME2", 2],
        [2011, "C1", 3, 3, "NAME1", 2],
        [2011, "C2", 4, 4, "NAME2", 1],
        [2012, "C1", 1, 1, "NAME1", 1],
        [2012, "C2", 25, 25, "NAME2", 20],
        [2013, "C1", 50, 50, "NAME1", 2],
        [2013, "C2", 100, 100, "NAME2", 1]
      ]
    },
    'index': {
      'time': 0,
      'category': 1,
      'x': 2,
      'y': 3,
      'name': 4,
      'size': 5
    },
    // width and height of our bar chart.
    'width': 600,
    'height': 400,
    'xoffset': 50,
    'yoffset': 0,
    'color': d3.scale.category20(),
    'opacity': 1.0,
    'maxDuration': 1000,
    'xaxis': {
      'scale': d3.scale.linear(),
      'orient': "bottom",
      'ticks': 5,
      //'tickValues'  : null,
      'tickSubdivide': 1,
      'tickSize': {
        'major': 5,
        'minor': 3,
        'end': 5
      },
      'tickPadding': 5,
      'tickFormat': d3.format(",d"),

      'label': {
        'x': 500,
        'y': -6,
        'transform': "",
        'dy': ".71em",
        'font': {
          'size': 18,
          'family': 'sans-serif',
          'style': 'normal',
          'variant': 'normal',
          'weight': 'normal'
        },
        'text': 'X Axis',
        'anchor': 'end',
        'color': 'black'
      }
    },
    'yaxis': {
      'scale': d3.scale.linear(),
      'orient': 'left',
      'ticks': 10,
      //'tickValues'  : null,
      'tickSubdivide': 1,
      'tickSize': {
        'major': 5,
        'minor': 3,
        'end': 5
      },
      'tickPadding': 5,
      'tickFormat': d3.format(",d"),

      'label': {
        'x': 300,
        'y': 6,
        'transform': "rotate(-90)",
        'dy': ".71em",
        'font': {
          'size': 18,
          'family': 'sans-serif',
          'style': 'normal',
          'variant': 'normal',
          'weight': 'normal'
        },
        'text': 'Y Axis',
        'anchor': 'end',
        'color': 'black'
      }
    },
    'rect': {
      'stroke': {
        'color': 'black',
        'width': 1,
        'opacity': .5
      }
    }
  };

  //dex.console.log("USER-CONFIG", userConfig, "DEFAULTS:", defaults);

  var config = dex.object.overlay(dex.config.expand(userConfig), dex.config.expand(defaults));
  var chart = new DexComponent(userConfig, config);

  chart.render = function () {
    window.onresize = this.resize;
    this.update();
  };

  chart.update = function () {
    // If we need to call super:
    //DexComponent.prototype.update.call(this);
    var chart = this.chart;
    var config = this.config;
    var csv = config.csv;

    if (config.debug) {
      console.log("===== Motion Chart Configuration =====");
      console.dir(config);
    }

    var chartContainer = d3.select(config.parent).append("g")
      .attr("id", config["id"])
      .attr("class", config["class"])
      .attr("transform", "translate(" + config.xoffset + "," + config.yoffset + ")");

    var xMin, xMax, yMin, yMax, sizeMin, sizeMax, timeMin, timeMax, timeLenMax;
    var play = true;

    var timeGroups = dex.csv.group(csv, [config.index.time]);

    dex.console.log("Time Groups", timeGroups);

    for (ri = 0; ri < timeGroups.length; ri++) {
      timeGroups[ri].data = dex.csv.group(timeGroups[ri].csv, [ config.index.name, config.index.category ])
    }

    dex.console.log("json", dex.csv.toJson(csv), "groups", timeGroups);

    //document.title = title;
    //document.getElementById('titletext').innerHTML = title;

    //var colorwheel = d3.select("radialGradient").id()
    //console.log("JSONDATA: " + jsonData);

    var data = csv.data;
    var header = csv.header;

    //var jsonData = dex.csv.toJson(csv);
    //dex.console.log("JSON", jsonData);

    xMax = dex.matrix.max(data, config.index.x);
    xMin = dex.matrix.min(data, config.index.x);
    yMax = dex.matrix.max(data, config.index.y);
    yMin = dex.matrix.min(data, config.index.y);
    sizeMax = dex.matrix.max(data, config.index.size);
    sizeMin = dex.matrix.min(data, config.index.size);
    timeMax = dex.matrix.max(data, config.index.time);
    timeMin = dex.matrix.min(data, config.index.time);
    timeLenMax = timeMax.toString().length;

    d3.selectAll("circle").remove();
    d3.selectAll(".timeLabel").remove();

    /*
     console.log("XMIN: " + xMin);
     console.log("XMAX: " + xMax)
     console.log("YMIN: " + yMin)
     console.log("YMAX: " + yMax)
     console.log("SMIN: " + sizeMin)
     console.log("SMAX: " + sizeMax)
     console.log("TLEN: " + timeLenMax);
     */

    readJson = function (text, callback) {
      callback(text ? JSON.parse(text) : null);
    };

    // Various accessors that specify the four dimensions of data to visualize.
    function x(d) {
      return d[config.index.x];
    }

    function y(d) {
      return d[config.index.y];
    }

    function radius(d) {
      return d[config.index.size];
    }

    function color(d) {
      return d[config.index.category];
    }

    function key(d) {
      return d[config.index.name];
    }

    var radiusScale = d3.scale.sqrt().domain([sizeMin, sizeMax]).range([1, 80]);
    var colorScale = d3.scale.category20();

    // The x & y axes.
    var xAxis = d3.svg.axis()
      .scale(config.xaxis.scale.domain([xMin, xMax]).range([0, config.width]))
      .ticks(config.xaxis.ticks)
      .tickSubdivide(config.xaxis.tickSubdivide)
      .tickSize(config.xaxis.tickSize.major, config.xaxis.tickSize.minor, config.xaxis.tickSize.end)
      .tickPadding(config.xaxis.tickPadding)
      .tickFormat(config.xaxis.tickFormat)
      .orient(config.xaxis.orient);

    var yAxis = d3.svg.axis()
      .scale(config.yaxis.scale.domain([yMin, yMax]).range([config.height, 0]))
      .ticks(config.yaxis.ticks)
      .tickSubdivide(config.yaxis.tickSubdivide)
      .tickSize(config.yaxis.tickSize.major, config.yaxis.tickSize.minor, config.yaxis.tickSize.end)
      .tickPadding(config.yaxis.tickPadding)
      .tickFormat(config.yaxis.tickFormat)
      .orient(config.yaxis.orient);

    //xAxis.append("g").attr("transform", "rotate(-90)")
    // REM: Make configurable...
    var timeFontSize = 18;
    var timeLabelSvg = d3.select(config.timeLabel).append("g");

    // Add the x-axis.
    chartContainer.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + config.height + ")")
      .call(xAxis);

    // Add the y-axis.
    chartContainer.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    // Add an x-axis label.
    chartContainer.append("text")
      .style("font-size", config.xaxis.label.font.size + "px")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", config.width)
      .attr("y", config.height - 6)
      .text(config.yaxis.label.text);

    // Add a y-axis label.
    chartContainer.append("text")
      .style("font-size", config.yaxis.label.font.size + "px")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 10)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text(config.yaxis.label.text);

    // Add the time label
    // REM: HARDCODED
    var timeFontSize = 18;
    var label = timeLabelSvg.append("text")
      .attr("class", "timeLabel")
      .attr("text-anchor", "end")
      .style("font-size", timeFontSize + "px")
      .attr("y", timeFontSize)
      .attr("x", timeFontSize * timeLenMax);

    dex.console.log("TIMEMIN", timeMin);

    // Add a dot per nation. Initialize the data at 1800, and set the colors.
    var dot = chartContainer.append("g")
      .attr("class", "dots")
      .selectAll(".dot")
      // Used to be 1800
      .data(interpolateData(timeMin))
      .enter().append("circle")
      .attr("class", "dot")
      //.style("fill", function(d) { return colorScale(color(d)); })
      .style("opacity", config.opacity)
      .style("fill", function (d) {
        return config.color(d[0][config.index.category]);
      })
      .call(position)
      .sort(order)
      .attr("title", function (d, i) {
        dex.console.log("D", d);
        return "TITLE: " + d[0][config.index.time];
      })
      .on("mouseover", function (d) {
        d3.select(this).style("stroke-width", "3").style("opacity", 1);
        var el = d3.select(this)
        var xpos = Number(el.attr('cx'))
        var ypos = (el.attr('cy') - d.radius - 10)
      })
      .on("mouseout", function () {
        d3.select(this)
          .style("stroke-width", "1").style("opacity", config.opacity);
      });

//.on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
//.on("mouseout", function(){d3.select(this).style("fill", "white");})

    // Add a title.
    //dot.append("title")
    //  .text(function(d) { return d.name + ":\\n\\n" + xtitle + "=" + d.x +
    //                        "\\n" + ytitle + "=" + d.y + "\\nsize = " + d.size});

    // Start a transition that interpolates the data based on year.

    if (play) {
      chartContainer.transition()
        .duration(Math.min(data.length * 1000, config.maxDuration))
        .ease("linear")
        .tween("time", tweenTime)
        .each("end", enableInteraction);
    }
    else {
      //tween("year", yearMax);
      displayTime(timeMax);
      enableInteraction();
    }

    // Positions the dots based on data.
    function position(dot) {
      dot.attr("cx", function (d) {
        return config.xaxis.scale(x(d[0]));
      })
        .attr("cy", function (d) {
          return config.xaxis.scale(y(d[0]));
        })
        .attr("r", function (d) {
          return radiusScale(radius(d[0]));
        });
    }

    // Defines a sort order so that the smallest dots are drawn on top.
    function order(a, b) {
      return radius(b) - radius(a);
    }

    // After the transition finishes, you can mouseover to change the year.
    function enableInteraction() {
      //dex.console.log("LABEL: " + label);
      var box = label.node().getBBox();

      var timeScale = d3.scale.linear()
        .domain([timeMin, timeMax])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);

      timeLabelSvg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

      function mouseover() {
        label.classed("active", true);
      }

      function mouseout() {
        label.classed("active", false);
      }

      function mousemove() {
        displayTime(timeScale.invert(d3.mouse(this)[0]));
      }
    }

    // Tweens the entire chart by first tweening the year, and then the data.
    // For the interpolated data, the dots and label are redrawn.
    function tweenTime() {
      var time = d3.interpolateNumber(timeMin, timeMax);
      return function (t) {
        displayTime(time(t));
      };
    }

    // Updates the display to show the specified year.
    function displayTime(time) {
      dot.data(interpolateData(time), key).call(position).sort(order);
      //dot.select("title")
      //  .text(function(d) { return d.name + ":\\n\\n" + xtitle + "=" + d.x + "\\n" +
      //                      ytitle + "=" + d.y + "\\nsize = " + d.size});
      label.text(Math.round(time));
    }

    function getTimeData(time) {
      var ri;
      // Locate the most applicable time group.
      for (ri = 0; ri < timeGroups.length; ri++) {
        if (time <= timeGroups[ri].time) {
          return timeGroups[ri];
        }
      }

      // Otherwise return the last one.
      return timeGroups[timeGroups.length - 1];
    }

    // Interpolates the dataset for the given (fractional) year.
    function interpolateData(time) {
      var timeGroup = getTimeData(time);

      dex.console.log("InterpolateData(" + time + ")", timeGroup);
      return timeGroup.data.map(function (od) {
        return od.csv.data.map(function (d) {
          dex.console.log("DATA", d);
          //var idata = dex.object.clone(d);
          //d[config.index.x]    = interpolateValues(time, times, tmatrix[config.index.x]);
          //d[config.index.y]    = interpolateValues(time, times, tmatrix[config.index.y]);
          //d[config.index.size] = interpolateValues(time, times, tmatrix[config.index.size]);
          //dex.console.log("D", d);
          return d;
        });
      });
    }

    // A bisector since some data is sparsely-defined.
    var bisect = d3.bisector(function (d) {
      return d[0];
    });

    // Finds (and possibly interpolates) the value for the specified year.
    function interpolateValues(time, times, values) {
      dex.console.log("interpolateValues", time, times, values);
      var i = bisect.left(times, time, 0, times.length - 1),
        a = values[i];
      if (i > 0) {
        var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
        return a[1] * (1 - t) + b[1] * t;
      }
      dex.console.log("INTERPOLATED: " + i);
      return a[1];

      // Structure has changed, figure out a different way to interpolate.
      // For now, just return 1.
      //return 1;
    }
  };

  return chart;
}