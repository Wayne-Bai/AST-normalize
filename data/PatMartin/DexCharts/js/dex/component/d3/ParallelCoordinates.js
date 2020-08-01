function ParallelCoordinates(userConfig) {
  var color = d3.scale.category20();

  var defaults =
  {
    'id'              : "ParallelCoordinates",
    'class'           : "ParallelCoordinates",
    'parent'          : null,
    'height'          : 400,
    'width'           : 600,
    //'color'              : d3.scale.category20(),
    'title'           : 'Parallel Coordinates',
    'csv'             : {
      'header' : [ "X", "Y" ],
      'data'   : [
        [0, 0],
        [1, 1],
        [2, 4],
        [3, 9],
        [4, 16]
      ]
    },
    'rows'            : 0,
    'transform'       : 'translate(50 50)',
    'normalize'       : false,
    'axis'            : dex.config.axis({'orient' : 'left'}),
    'verticalLabel'   : dex.config.text({
      // If you want to stagger labels.
      //'dy' : function(d, i) { return (i % 2) ? -10 : -30; },
      'dy'     : -10,
      'font'   : dex.config.font({'size' : 32 }),
      'anchor' : 'middle',
      'text'   : function (d) {
        return d;
      }
    }),
    'axisLabel'       : dex.config.text({
      'font'   : dex.config.font({'size' : 14 }),
      'anchor' : 'left'}),
    'selected.link'   : {
      'stroke' : dex.config.stroke(
        {
          'color' : function (d, i) {
            return color(i);
          },
          'width' : 5
        }),
      'fill'   : {
        'fillColor'   : "none",
        'fillOpacity' : 1.0
      }
    },
    'unselected.link' : {
      'stroke' : dex.config.stroke(
        {
          'color'     : function (d, i) {
            return color(i);
          },
          'width'     : 1,
          'dasharray' : "10 10"
        }),
      'fill'   : {
        'fillColor'   : "none",
        'fillOpacity' : 0.1
      }
    },
    'brush'           : {
      'width'   : 16,
      'x'       : -8,
      'opacity' : 1,
      'color'   : "green",
      'stroke'  : dex.config.stroke({'color' : "black", 'width' : 2})
    }
  };

//var config = dex.object.overlay(dex.config.expand(userConfig), dex.config.expand(defaults));

  var chart = new DexComponent(userConfig, defaults);

  chart.render = function () {
    this.update();
  };

  chart.update = function () {
    var chart = this;
    var config = chart.config;
    var csv = config.csv;

    var numericColumns =
      dex.csv.getNumericColumnNames(csv);

    var jsonData = dex.csv.toJson(csv);

    var x = d3.scale.ordinal()
      .rangePoints([0, config.width], 1);

    var y = {};

    var line = d3.svg.line();

    //var axis = d3.svg.axis().orient("left");
    dex.console.log(config.axis);
    var scale = dex.config.createScale(dex.config.scale(config.axis.scale));
    config.axis.scale = scale;
    dex.console.log(config.axis);
    var axis = d3.svg.axis();
    dex.config.configureAxis(axis, config.axis);

    // Holds unselected paths.
    var background;
    // Holds selected paths.
    var foreground;
    // Will hold our column names.
    var dimensions;
    var key;

    var chartContainer = d3.select(config.parent).append("g")
      .attr("id", config["id"])
      .attr("class", config["class"])
      .attr("transform", config.transform);

    // Extract the list of dimensions and create a scale for each.
    //x.domain(dimensions = d3.keys(cars[0]).filter(function(d)
    //{
    //  return d != "name" && (y[d] = d3.scale.linear()
    //    .domain(d3.extent(cars, function(p) { return +p[d]; }))
    //    .range([height, 0]));
    //}));
    var allExtents = []

    numericColumns.forEach(function (d) {
      allExtents = allExtents.concat(d3.extent(jsonData, function (p) {
        return +p[d];
      }));
    });

    var normalizedExtent = d3.extent(allExtents);

    // REM: Figure out how to switch over to consistent extends.  Snapping.
    x.domain(dimensions = d3.keys(jsonData[0]).filter(function (d) {
      if (d === "name") return false;

      if (dex.object.contains(numericColumns, d)) {
        var extent = d3.extent(jsonData, function (p) {
          return +p[d];
        });
        if (config.normalize) {
          extent = normalizedExtent;
        }

        y[d] = d3.scale.linear()
          .domain(extent)
          .range([config.height, 0]);
        allExtents.concat(extent);
      }
      else {
        y[d] = d3.scale.ordinal()
          .domain(jsonData.map(function (p) {
            return p[d];
          }))
          .rangePoints([config.height, 0]);
      }

      return true;
    }));

    // Add grey background lines for context.
    background = chartContainer.append("g")
      .attr("class", "background")
      .selectAll("path")
      .data(jsonData)
      .enter().append("path")
      .call(dex.config.configureLink, config.unselected.link)
      .attr("d", path)
      .attr("id", "fillpath");

    foreground = chartContainer.append("g")
      .selectAll("path")
      .data(jsonData)
      .enter().append("path")
      .attr("d", path)
      .call(dex.config.configureLink, config.selected.link)
      .attr("title", function (d, i) {
        var info = "<table border=\"1\">";
        for (key in jsonData[i]) {
          info += "<tr><td><b><i>" + key + "</i></b></td><td>" + jsonData[i][key] + "</td></tr>"
        }
        return info + "</table>";
      })
      .on("mouseover", function () {
        d3.select(this)
          .style("stroke-width", config.selected.link.stroke.width + (config.selected.link.stroke.width / 3))
          .style("stroke-opacity", config.selected.link.stroke.opacity);
      })
      .on("mouseout", function () {
        d3.select(this)
          .style("stroke-width", config.selected.link.stroke.width)
          .style("stroke-opacity", config.selected.link.stroke.opacity);
      });

    // Add a group element for each dimension.
    var g = chartContainer.selectAll(".dimension")
      .data(dimensions)
      .enter().append("g")
      //.attr("font-size", config.fontSize)
      // REM: Not quite a label...
      .call(dex.config.configureText, config.axisLabel)
      .attr("class", "dimension")
      .attr("transform", function (d) {
        return "translate(" + x(d) + ")";
      });

    // Add an axis and title.
    g.append("g")
      .attr("class", "axis")
      .each(function (d) {
        d3.select(this).call(axis.scale(y[d]));
      })
      .append("text")
      .call(dex.config.configureText, config.verticalLabel);

    // Add and store a brush for each axis.
    g.append("g")
      .attr("class", "brush")
      .each(function (d) {
        d3.select(this).call(y[d].brush =
          d3.svg.brush().y(y[d])
            .on("brush", brush)
            .on("brushend", brushend));
      })
      .selectAll("rect")
      .call(dex.config.configureRectangle, config.brush);

    // Returns the path for a given data point.
    function path(d) {
      return line(dimensions.map(function (p) {
        return [x(p), y[p](d[p])];
      }));
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      // Get a list of our active brushes.
      var actives = dimensions.filter(function (p) {
          return !y[p].brush.empty();
        }),

      // Get an array of min/max values for each brush constraint.
        extents = actives.map(function (p) {
          return y[p].brush.extent();
        });

      foreground.style("display", function (d) {
        return actives.every(
          // P is column name, i is an index
          function (p, i) {
            // Categorical
            //console.log("P: " + p + ", I: " + i);
            if (!dex.object.contains(numericColumns, p)) {
              return extents[i][0] <= y[p](d[p]) && y[p](d[p]) <= extents[i][1];
            }
            // Numeric
            else {
              return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }
          }) ? null : "none";
      });
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brushend() {
      //dex.console.log("chart: ", chart);
      var activeData = [];
      var i;

      // WARNING:
      //
      // Can't find an elegant way to get back at the data so I am getting
      // at the data in an inelegant manner instead.  Mike Bostock ever
      // changes the __data__ convention and this will break.
      for (i = 0; i < foreground[0].length; i++) {
        if (!(foreground[0][i]["style"]["display"] == "none")) {
          activeData.push(foreground[0][i]['__data__']);
        }
      }

      //dex.console.log("Selected: ", dex.json.toCsv(activeData, dimensions));
      chart.notify({ "type" : "select", "selected" : dex.json.toCsv(activeData, dimensions)});
    }
  };

  return chart;
}

