var local = this,
  defaultSpacing = 0.25;

function _getDomain(data, axis) {
  return _.chain(data)
    .pluck('data')
    .flatten()
    .pluck(axis)
    .uniq()
    .filter(function (d) {
      return d !== undefined && d !== null;
    })
    .value()
    .sort(d3.ascending);
}

_scales.ordinal = function (data, axis, bounds, extents) {
  var domain = _getDomain(data, axis);
  return d3.scale.ordinal()
    .domain(domain)
    .rangeRoundBands(bounds, defaultSpacing);
};

_scales.linear = function (data, axis, bounds, extents) {
  return d3.scale.linear()
    .domain(extents)
    .nice()
    .rangeRound(bounds);
};

_scales.exponential = function (data, axis, bounds, extents) {
  return d3.scale.pow()
    .exponent(0.65)
    .domain(extents)
    .nice()
    .rangeRound(bounds);
};

_scales.time = function (data, axis, bounds, extents) {
  return d3.time.scale()
    .domain(_.map(extents, function (d) { return new Date(d); }))
    .range(bounds);
};

function _extendDomain(domain, axis) {
  var min = domain[0],
    max = domain[1],
    diff,
    e;

  if (min === max) {
    e = Math.max(Math.round(min / 10), 4);
    min -= e;
    max += e;
  }

  diff = max - min;
  min = (min) ? min - (diff / 10) : min;
  min = (domain[0] > 0) ? Math.max(min, 0) : min;
  max = (max) ? max + (diff / 10) : max;
  max = (domain[1] < 0) ? Math.min(max, 0) : max;

  return [min, max];
}

function _getExtents(options, data, xType, yType) {
  var extents,
    nData = _.chain(data)
      .pluck('data')
      .flatten()
      .value();

  extents = {
    x: d3.extent(nData, function (d) { return d.x; }),
    y: d3.extent(nData, function (d) { return d.y; })
  };

  _.each([xType, yType], function (type, i) {
    var axis = (i) ? 'y' : 'x',
      extended;
    extents[axis] = d3.extent(nData, function (d) { return d[axis]; });
    if (type === 'ordinal') {
      return;
    }

    _.each([axis + 'Min', axis + 'Max'], function (minMax, i) {
      if (type !== 'time') {
        extended = _extendDomain(extents[axis]);
      }

      if (options.hasOwnProperty(minMax) && options[minMax] !== null) {
        extents[axis][i] = options[minMax];
      } else if (type !== 'time') {
        extents[axis][i] = extended[i];
      }
    });
  });

  return extents;
}

_scales.xy = function (self, data, xType, yType) {
  var o = self._options,
    extents = _getExtents(o, data, xType, yType),
    scales = {},
    horiz = [o.axisPaddingLeft, self._width],
    vert = [self._height, o.axisPaddingTop],
    xScale,
    yScale;

  _.each([xType, yType], function (type, i) {
    var axis = (i === 0) ? 'x' : 'y',
      bounds = (i === 0) ? horiz : vert,
      fn = xChart.getScale(type);
    scales[axis] = fn(data, axis, bounds, extents[axis]);
  });

  return scales;
};
