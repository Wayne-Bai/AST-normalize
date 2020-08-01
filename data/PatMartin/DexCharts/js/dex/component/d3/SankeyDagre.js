// SANKEY.JS
//from Mike Bostock
d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];
 
  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };
 
  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };
 
  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };
 
  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };
 
  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };
 
  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };
 
  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };
 
  sankey.link = function() {
    var curvature = .5;
 
    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }
 
    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };
 
    return link;
  };
 
  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }
 
  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }
 
  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var dg = new dagre.Digraph();

    nodes.forEach(function(node)
    {
      dg.addNode(node.name);
    });
    
    links.forEach(function(link)
    {
      dg.addEdge(null, link.source.name, link.target.name);
    });

    var layout = dagre.layout().nodeSep(20).rankDir("LR").run(dg);

    dex.console.log("LAYOUT", layout);

    var ranks = {};
    //dex.console.log("RANKS", ranks);
    var maxRank = 0;

    layout.eachNode(function(u, value)
    {
      console.log("Node " + u + ": " + JSON.stringify(value));
      ranks[u] = value.rank;
      if (value.rank > maxRank)
      {
        maxRank = value.rank;
      }
    });

    //ranks.keys().map(function(key) { return ranks[key]});

    var remainingNodes = nodes,
        nextNodes,
        visited = {},
        x = 0,
        numColumns = 1;
        column = {},
        incoming = {},
        outgoing = {};

    nodes.forEach(function(node) {
      dex.console.log("DG", dg, "DG NODE(" + node.name + ")", dg.node(node.name));
      column[node.name] = 0;
      incoming[node.name] = 0;
      outgoing[node.name] = 0
    });

    links.forEach(function(link) {
      dex.console.log("LINK:", link);
      incoming[link.target.name]++;
      outgoing[link.source.name]++;
      column[link.target.name]++;
      if (numColumns <= column[link.target.name])
      {
        numColumns = column[link.target.name] + 1;
      }
    });

    dex.console.log("INCOMING:", incoming, "OUTGOING:", outgoing);

    remainingNodes.forEach(function(node) {
      x++;
      dex.console.log("NODE: " + node.name + ", COLUMN: " + column[node.name]);
      node.x = ranks[node.name];
      node.dx = nodeWidth;
      //x++;
      //node.sourceLinks.forEach(function(link) {
      //  console.dir(node)
      //  if (link.target.name == node.name)
      //  {
      //    x++;
      //    console.log(x);
      //  }
      //});
    });

//    while (remainingNodes.length) {
//      dex.console.log("REMAINING: ", remainingNodes);
//      nextNodes = [];
//      remainingNodes.forEach(function(node) {
//        visited[node.name] = true;
//        node.x = x;
//        node.dx = nodeWidth;
//        node.sourceLinks.forEach(function(link) {
//          dex.console.log("NODE: " + node.name + ", TARGET: " + link.target.name);
//          if (!visited[link.target.name])
//          {
//            nextNodes.push(link.target);
//          }
//        });
//      });
//      remainingNodes = nextNodes;
//      ++x;
//    }

    dex.console.log("Num Columns: " + numColumns);
 
    moveSinksRight(numColumns);
    scaleNodeBreadths((size[0] - nodeWidth) / (maxRank));
  }
 
  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }
 
  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }
 
  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }
 
  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });
 
    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }
 
    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });
 
      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });
 
      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }
 
    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });
 
      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }
 
    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });
 
      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }
 
    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;
 
        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }
 
        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;
 
          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }
 
    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }
 
  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });
 
    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }
 
    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }
 
  function center(node) {
    return node.y + node.dy / 2;
  }
 
  function value(link) {
    return link.value;
  }
 
  return sankey;
};

function Sankey(userConfig)
{
  var defaults =
  {
    // The parent container of this chart.
    'parent'           : null,
    // Set these when you need to CSS style components independently.
    'id'               : 'Sankey',
    'class'            : 'Sankey',
    // Our data...
    'csv'              :
    {
      // Give folks without data something to look at anyhow.
      'header'         : [ "X", "Y", "WEIGHT"],
      'data'           : [["DA1","DA2", 1],["B1","B2", 2],["C1","C2", 2], ["C2", "C3", 4]]
    },
    'relationships'    : null,
    // width and height of our bar chart.
    'width'            : 600,
    'height'           : 400,
    // The x an y indexes to chart.
    'xoffset'          : 20,
    'yoffset'          : 0,
    'color'            : d3.scale.category20(),
    'link' :
    {
      'stroke'      : dex.config.stroke({'opacity' : .2}),
      'fill'        : 'none',
      'fillOpacity' : .2
    },
    'node' :
    {
      'width'   : 32,
      'padding' : 10
    }
  };

  dex.console.log("USER-CONFIG", userConfig, "DEFAULTS:", defaults);

  defaults.link.stroke.width = function(d) { return Math.max(1, d.dy); }

  var config = dex.object.overlay(dex.config.expand(userConfig), dex.config.expand(defaults));

  if (!config.relationships)
  {
    if (config.csv.header.length < 3 ||
        !dex.csv.isColumnNumeric(config.csv, config.csv.header.length-1))
    {
      config.relationships =
      [
        // Default relationship: Equal weighting of 1.
        { 'source' : 0, 'target' : 1,
          'value' : function (i) { return 1; },
          'category' : function(i) { return 1}}
      ];
    }
    else
    {
      config.relationships = [];
      
      for (i=1; i<config.csv.header.length-1; i++)
      {
        config.relationships.push(
        {
          'source'   : i-1,
          'target'   : i,
          'value'    : function(i) { return config.csv.data[i][config.csv.header.length-1]; },
          'category' : function(i) { return 1; }
        });
      }
    }
  }

  var chart = new DexComponent(userConfig, config);
  chart.render = function()
  {
    this.update();
  };

  chart.update = function()
  {
    var sankeyData =
    [
      {
        'source'   : "A1",
        'target'   : "A2",
        'value'    : 1,
        'category' : 1
      },
      {
        'source'   : "B1",
        'target'   : "B2",
        'value'    : 2,
        'category' : 2
      },
    ];

    sankeyData = [];


    for (ri=0; ri<config.relationships.length; ri++)
    {
      for (i=0; i<config.csv.data.length; i++)
      {
        var relation = [];
        relation.source   = config.csv.data[i][config.relationships[ri].source];
        relation.target   = config.csv.data[i][config.relationships[ri].target];
        relation.category = config.relationships[ri].category(i);

        relation.value = config.relationships[ri].value(i);
        sankeyData.push(relation);
      }
    }
    var units = "Units";
 
    var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; };
 
    // append the svg canvas to the page
    var svg = d3.select("#ChartArea").append("svg")
      .attr("width", config.width)
      .attr("height", config.height)
      .append("g")
      .attr("transform", 
        "translate(" + config.xoffset + "," + config.yoffset + ")");
 
    // Set the sankey diagram properties
    var sankey = d3.sankey()
      .nodeWidth(config.node.width)
      .nodePadding(config.node.padding)
      .size([config.width, config.height]);
 
    var path = sankey.link();

    //set up graph in same style as original example but empty
    graph = {"nodes" : [], "links" : []};
    
    sankeyData.forEach(function (d)
    {
      graph.nodes.push({ "name": d.source });
      graph.nodes.push({ "name": d.target });
      graph.links.push({ "source": d.source, "target": d.target, "value": +d.value,
      "category" : d.category });
    });

    //thanks Mike Bostock https://groups.google.com/d/msg/d3-js/pl297cFtIQk/Eso4q_eBu1IJ
    //this handy little function returns only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest()
      .key(function (d) { return d.name; })
      .map(graph.nodes));
    
    // it appears d3 with force layout wants a numeric source and target
    // so loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //now loop through each nodes to make nodes an array of objects rather than an array of strings
    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { "name": d };
    });
 
    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

    // add in the links
    var link = svg.append("g").selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", "link")
      .call(dex.config.configureStroke, config.link.stroke)
//          .style("fill", config.link.fill)
//          .style("fill-opacity", config.link.fillOpacity)
      .attr("d", path)
      // Width of connection
      .style('fill', config.link.fill)
      .style('fill-opacity', config.link.fillOpacity)
 //     .style('stroke', "red")

      .sort(function(a, b) { return b.dy - a.dy; });

     dex.console.log("STROKE:", config.link.stroke);

     //console.log("GRAPH");
     //console.dir(graph);
     //console.dir(link);

    // add the link titles
    link.append("title")
      .text(function(d) {
        return d.source.name + " -> " + 
        d.target.name + "\n" + format(d.value);
        });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() { 
        this.parentNode.appendChild(this); })
        .on("drag", dragmove));
   
    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
        return d.color = config.color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
        return d3.rgb(d.color).darker(2); })
      .append("title")
        .text(function(d) { 
        return d.name + "\n" + format(d.value); });
   
    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < config.width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // the function for moving the nodes
    function dragmove(d)
    {
      d3.select(this).attr("transform", 
          "translate(" + (
               d.x = Math.max(0, Math.min(config.width - d.dx, d3.event.x))
            ) + "," + (
                     d.y = Math.max(0, Math.min(config.height - d.dy, d3.event.y))
              ) + ")");
      sankey.relayout();
      link.attr("d", path);
    }
  };

  return chart;
}