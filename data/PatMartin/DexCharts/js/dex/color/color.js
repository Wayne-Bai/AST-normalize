dex.color = {};

dex.color.toHex = function (color) {
  if (color.substr(0, 1) === '#') {
    return color;
  }
  //console.log("COLOR: " + color)
  var digits = /rgb\((\d+),(\d+),(\d+)\)/.exec(color);
  //console.log("DIGITS: " + digits);
  var red = parseInt(digits[1]);
  var green = parseInt(digits[2]);
  var blue = parseInt(digits[3]);

  var rgb = blue | (green << 8) | (red << 16);
  return '#' + rgb.toString(16);
};

dex.color.colorScheme = function (colorScheme, numColors) {
  if (colorScheme == "1") {
    return d3.scale.category10();
  }
  else if (colorScheme == "2") {
    return d3.scale.category20();
  }
  else if (colorScheme == "3") {
    return d3.scale.category20b();
  }
  else if (colorScheme == "4") {
    return d3.scale.category20c();
  }
  else if (colorScheme == "HiContrast") {
    return d3.scale.ordinal().range(colorbrewer[colorScheme][9]);
  }
  else if (colorScheme in colorbrewer) {
    //console.log("LENGTH: " + len);
    var c;
    var effColors = Math.pow(2, Math.ceil(Math.log(numColors) / Math.log(2)));
    //console.log("EFF LENGTH: " + len);

    // Find the best cmap:
    if (effColors > 128) {
      effColors = 256;
    }

    for (c = effColors; c >= 2; c--) {
      if (colorbrewer[colorScheme][c]) {
        return d3.scale.ordinal().range(colorbrewer[colorScheme][c]);
      }
    }
    for (c = effColors; c <= 256; c++) {
      if (colorbrewer[colorScheme][c]) {
        return d3.scale.ordinal().range(colorbrewer[colorScheme][c]);
      }
    }
    return d3.scale.category20();
  }
  else {
    return d3.scale.category20();
  }
};

dex.color.shadeColor = function (color, percent) {
  var R = parseInt(color.substring(1, 3), 16)
  var G = parseInt(color.substring(3, 5), 16)
  var B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
  var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
  var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
};

dex.color.gradient = function (baseColor) {
  if (baseColor.charAt(0) == 'r') {
    baseColor = colorToHex(baseColor);
  }
  var gradientId;
  gradientId = "gradient" + baseColor.substring(1)
  console.log("GradientId: " + gradientId);
  console.log("BaseColor : " + baseColor);

  //var lightColor = shadeColor(baseColor, -10)
  var darkColor = shadeColor(baseColor, -20)

  var grad = d3.select("#gradients").selectAll("#" + gradientId)
    .data([ gradientId ])
    .enter()
    .append("radialGradient")
    .attr("class", "colorGradient")
    .attr("id", gradientId)
    .attr("gradientUnits", "objectBoundingBox")
    .attr("fx", "30%")
    .attr("fy", "30%")

  grad.append("stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:#FFFFFF")

  // Middle
  grad.append("stop")
    .attr("offset", "40%")
    .attr("style", "stop-color:" + baseColor)

  // Outer Edges
  grad.append("stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:" + darkColor)

  return "url(#" + gradientId + ")";
};
