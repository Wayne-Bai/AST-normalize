/**
 * Created by: Florin Chelaru
 * Date: 10/4/13
 * Time: 8:52 AM
 */

goog.provide('epiviz.workspaces.Workspace');

/**
 * @param {?string} id
 * @param {string} name
 * @param {{
 *   range: epiviz.datatypes.GenomicRange,
 *   computedMeasurements: epiviz.measurements.MeasurementSet,
 *   charts: Object.<epiviz.ui.charts.ChartType.DisplayType, Array.<{
 *     id: string,
 *     type: epiviz.ui.charts.ChartType,
 *     properties: epiviz.ui.charts.ChartProperties
 *   }>>
 * }} content
 * @constructor
 */
epiviz.workspaces.Workspace = function(id, name, content) {
  /**
   * @type {?string}
   * @private
   */
  this._id = id;

  /**
   * @type {string}
   * @private
   */
  this._name = name;

  /**
   * @type {epiviz.datatypes.GenomicRange}
   * @private
   */
  this._range = content.range;

  /**
   * @type {Object.<epiviz.ui.charts.ChartType.DisplayType, Array.<string>>}
   * @private
   */
  this._chartsOrder = {};

  /**
   * @type {Object.<string, {
   *   id: string,
   *   type: epiviz.ui.charts.ChartType,
   *   properties: epiviz.ui.charts.ChartProperties
   * }>}
   * @private
   */
  this._chartsById = {};
  for (var displayType in content.charts) {
    if (!content.charts.hasOwnProperty(displayType)) { continue; }

    this._chartsOrder[displayType] = [];

    for (var i = 0; i < content.charts[displayType].length; ++i) {
      this._chartsById[content.charts[displayType][i].id] = content.charts[displayType][i];

      this._chartsOrder[displayType].push(content.charts[displayType][i].id);
    }
  }

  /**
   * @type {epiviz.measurements.MeasurementSet}
   * @private
   */
  this._computedMeasurements = content.computedMeasurements || new epiviz.measurements.MeasurementSet();

  /**
   * @type {boolean}
   * @private
   */
  this._changed = false;
};

epiviz.workspaces.Workspace.DEFAULT_WORKSPACE_NAME = 'Default Workspace';

/**
 * @returns {string}
 */
epiviz.workspaces.Workspace.prototype.id = function() {
  return this._id;
};

/**
 * @returns {string}
 */
epiviz.workspaces.Workspace.prototype.name = function() {
  return this._name;
};

/**
 * @returns {epiviz.datatypes.GenomicRange}
 */
epiviz.workspaces.Workspace.prototype.range = function() {
  return this._range;
};

/**
 * @returns {Object.<epiviz.ui.charts.ChartType.DisplayType, Array.<{id: string, type: epiviz.ui.charts.ChartType, properties: epiviz.ui.charts.ChartProperties}>>}
 */
epiviz.workspaces.Workspace.prototype.charts = function() {
  var charts = {};
  for (var displayType in this._chartsOrder) {
    if (!this._chartsOrder.hasOwnProperty(displayType)) { continue; }
    charts[displayType] = [];
    for (var i = 0; i < this._chartsOrder[displayType].length; ++i) {
      charts[displayType].push(this._chartsById[this._chartsOrder[displayType][i]]);
    }
  }

  return charts;
};

/**
 * @returns {Object.<epiviz.ui.charts.ChartType.DisplayType, Array.<string>>}
 */
epiviz.workspaces.Workspace.prototype.chartsOrder = function() {
  return this._chartsOrder;
};

/**
 * @returns {epiviz.measurements.MeasurementSet}
 */
epiviz.workspaces.Workspace.prototype.computedMeasurements = function() {
  return this._computedMeasurements;
};

/**
 * @param {string} id
 * @param {epiviz.ui.charts.ChartType} type
 * @param {epiviz.ui.charts.ChartProperties} properties
 * @param {Object.<epiviz.ui.charts.ChartType.DisplayType, Array.<string>>} chartsOrder
 */
epiviz.workspaces.Workspace.prototype.chartAdded = function(id, type, properties, chartsOrder) {
  this._chartsById[id] = {
    id: id,
    type: type,
    properties: properties.copy()
  };

  this._chartsOrder = chartsOrder;

  this._setChanged();
};

/**
 * @param {string} id
 * @param {Object.<epiviz.ui.charts.ChartType.DisplayType, Array.<string>>} chartsOrder
 */
epiviz.workspaces.Workspace.prototype.chartRemoved = function(id, chartsOrder) {
  if (!this._chartsById[id]) { return; }
  delete this._chartsById[id];
  this._chartsOrder = chartsOrder;

  this._setChanged();
};

/**
 * @param {string} chartId
 * @param {number|string} width
 * @param {number|string} height
 */
epiviz.workspaces.Workspace.prototype.chartSizeChanged = function(chartId, width, height) {
  if (this._chartsById[chartId].properties.width == width && this._chartsById[chartId].properties.height == height) { return; }
  this._chartsById[chartId].properties.width = width;
  this._chartsById[chartId].properties.height = height;

  this._setChanged();
};

/**
 * @param chartId
 * @param margins
 */
epiviz.workspaces.Workspace.prototype.chartMarginsChanged = function(chartId, margins) {
  if (this._chartsById[chartId].properties.margins.equals(margins)) { return; }
  this._chartsById[chartId].properties.margins = margins ? margins.copy() : margins;

  this._setChanged();
};

/**
 * @param {string} chartId
 * @param {epiviz.ui.charts.ColorPalette} colors
 */
epiviz.workspaces.Workspace.prototype.chartColorsChanged = function(chartId, colors) {
  if (this._chartsById[chartId].properties.colors.equals(colors)) { return; }
  this._chartsById[chartId].properties.colors = colors;

  this._setChanged();
};

/**
 * @param {string} chartId
 * @param {Object.<string, string>} modifiedMethods
 */
epiviz.workspaces.Workspace.prototype.chartMethodsModified = function(chartId, modifiedMethods) {
  if (epiviz.utils.mapEquals(
      this._chartsById[chartId].properties.modifiedMethods,
      modifiedMethods)) { return; }

  this._chartsById[chartId].properties.modifiedMethods = epiviz.utils.mapCopy(modifiedMethods);

  this._setChanged();
};

/**
 * @param {string} chartId
 * @param {Object<string, *>} customSettingsValues
 */
epiviz.workspaces.Workspace.prototype.chartCustomSettingsChanged = function(chartId, customSettingsValues) {
  if (epiviz.utils.mapEquals(this._chartsById[chartId].properties.customSettingsValues, customSettingsValues)) { return; }
  this._chartsById[chartId].properties.customSettingsValues = customSettingsValues ? epiviz.utils.mapCopy(customSettingsValues) : customSettingsValues;

  this._setChanged();
};

/**
 * @param {epiviz.datatypes.GenomicRange} range
 */
epiviz.workspaces.Workspace.prototype.locationChanged = function(range) {
  if (this._range.equals(range)) { return; }

  this._range = range;

  this._setChanged();
};

/**
 * @param {epiviz.measurements.MeasurementSet} measurements
 */
epiviz.workspaces.Workspace.prototype.computedMeasurementsAdded = function(measurements) {
  var sizeBefore = this._computedMeasurements.size();
  this._computedMeasurements.addAll(measurements);

  if (sizeBefore != this._computedMeasurements.size()) { this._setChanged(); }
};

/**
 * @param {epiviz.measurements.MeasurementSet} measurements
 */
epiviz.workspaces.Workspace.prototype.computedMeasurementsRemoved = function(measurements) {
  var sizeBefore = this._computedMeasurements.size();
  this._computedMeasurements.removeAll(measurements);

  if (sizeBefore != this._computedMeasurements.size()) { this._setChanged(); }
};

/**
 * @returns {boolean}
 */
epiviz.workspaces.Workspace.prototype.changed = function() {
  return this._changed;
};

/**
 */
epiviz.workspaces.Workspace.prototype.resetChanged = function() {
  this._changed = false;
};

/**
 * @private
 */
epiviz.workspaces.Workspace.prototype._setChanged = function() {
  this._changed = true;
};

/**
 * Creates a copy of the current workspace, with a new id and new name
 * @param {string} name
 * @param {string} [id]
 */
epiviz.workspaces.Workspace.prototype.copy = function(name, id) {
  var charts = this.charts();
  return new epiviz.workspaces.Workspace(id || null, name, {
    range: this._range,
    computedMeasurements: new epiviz.measurements.MeasurementSet(this._computedMeasurements),
    charts: charts
  });
};

/**
 * @returns {{
 *   id: ?string,
 *   name: string,
 *   content: {
 *     range: {seqName: string, start: number, width: number},
 *     measurements: Array.<{
 *       id: string,
 *       name: string,
 *       type: epiviz.measurements.Measurement.Type,
 *       datasourceId: string,
 *       datasourceGroup: string,
 *       dataprovider: string,
 *       formula: string,
 *       defaultChartType: ?string,
 *       annotation: ?Object.<string, string>,
 *       minValue: ?number,
 *       maxValue: ?number,
 *       metadata: ?Array.<string>
 *     }>,
 *     charts: Object.<string, Array.<{
 *       type: string,
 *       properties: {width: number|string, height: number|string, margins: {top: number, left: number, bottom: number, right: number}, measurements: Array.<number>, colors: Array.<string>, modifiedMethods: Object.<string, string>}
 *     }>>}}}
 */
epiviz.workspaces.Workspace.prototype.raw = function() {
  /**
   * @type {epiviz.measurements.MeasurementHashtable.<number>}
   */
  var wsMeasurements = new epiviz.measurements.MeasurementHashtable();
  var charts = {};

  this._computedMeasurements.foreach(function(m) {
    var mIndex;
    var componentMs = m.componentMeasurements();
    componentMs.foreach(function(compM) {
      var mIndex = wsMeasurements.get(compM);
      if (mIndex === null) {
        mIndex = wsMeasurements.size();
        wsMeasurements.put(compM, mIndex);
      }
    });

    var refMs = m.formula().referredMeasurements;
    for (var j in refMs) {
      if (!refMs.hasOwnProperty(j)) { continue; }
      mIndex = wsMeasurements.get(refMs[j]);
      if (mIndex === null) {
        mIndex = wsMeasurements.size();
        wsMeasurements.put(refMs[j], mIndex);
      }
    }

    mIndex = wsMeasurements.get(m);
    if (mIndex === null) {
      mIndex = wsMeasurements.size();
      wsMeasurements.put(m, mIndex);
    }
  });

  for (var displayType in this._chartsOrder) {
    if (!this._chartsOrder.hasOwnProperty(displayType)) { continue; }

    charts[displayType] = [];
    for (var i = 0; i < this._chartsOrder[displayType].length; ++i) {
      var chartData = this._chartsById[this._chartsOrder[displayType][i]];
      var props = chartData.properties;

      /** @type {Array.<number>} */
      var ms = [];

      (function(ms) {
        props.measurements.foreach(function(m) {
          var mIndex = wsMeasurements.get(m);
          if (mIndex === null) {
            mIndex = wsMeasurements.size();
            wsMeasurements.put(m, mIndex);
          }

          ms.push(mIndex);
        });
      })(ms);

      charts[displayType].push({
        id: chartData.id,
        type: chartData.type.typeName(),
        properties: {
          width: props.width,
          height: props.height,
          margins: props.margins.raw(),
          measurements: ms,
          colors: props.colors.raw(),
          modifiedMethods: epiviz.utils.mapCopy(props.modifiedMethods),
          customSettings: props.customSettingsValues || null
        }
      });
    }
  }

  var rawMs = new Array(wsMeasurements.size());
  wsMeasurements.foreach(function(m, j) {
    rawMs[j] = m.raw(wsMeasurements);
  });

  return {
    id: this._id,
    name: this._name,
    content: {
      range: this._range.raw(),
      measurements: rawMs,
      charts: charts
    }
  };
};

/**
 * @param {{
 *   id: ?string,
 *   name: string,
 *   content: {
 *     range: {seqName: string, start: number, width: number},
 *     measurements: Array,
 *     charts: Object.<string, Array.<{
 *       id: string,
 *       type: string,
 *       properties: {
 *        width: number|string,
 *        height: number|string,
 *        margins: {top: number, left: number, bottom: number, right: number},
 *        measurements: Array.<number>,
 *        colors: Array.<string>,
 *        modifiedMethods: ?Object<string, string>,
 *        customSettings: Object.<string, *>
 *      }
 *     }>>}}} o
 * @param {epiviz.ui.charts.ChartFactory} chartFactory
 * @returns {epiviz.workspaces.Workspace}
 */
epiviz.workspaces.Workspace.fromRawObject = function(o, chartFactory) {
  var i;
  var ms = new Array(o.content.measurements.length);
  var computedMeasurements = new epiviz.measurements.MeasurementSet();

  // First, parse all non-computed measurements, as we may need them in parsing the computed measurements
  for (i = 0; i < o.content.measurements.length; ++i) {
    if (!o.content.measurements[i].formula) {
      ms[i] = epiviz.measurements.Measurement.fromRawObject(o.content.measurements[i]);
    }
  }

  // Second, parse computed measurements
  for (i = 0; i < o.content.measurements.length; ++i) {
    if (o.content.measurements[i].formula) {
      ms[i] = epiviz.measurements.Measurement.fromRawObject(o.content.measurements[i], ms);
      computedMeasurements.add(ms[i]);
    }
  }

  var charts = {};
  for (var t in o.content.charts) {
    if (!o.content.charts.hasOwnProperty(t)) { continue; }
    charts[t] = [];
    for (i = 0; i < o.content.charts[t].length; ++i) {
      /**
       * @type {{id: string, type: string, properties: {
       *        width: number|string,
       *        height: number|string,
       *        margins: {top: number, left: number, bottom: number, right: number},
       *        measurements: Array.<number>,
       *        colors: Array.<string>,
       *        modifiedMethods: ?Object.<string, string>,
       *        customSettings: Object.<string, *>
       *      }}}
       */
      var chartInfo = o.content.charts[t][i];
      var chartMs = new epiviz.measurements.MeasurementSet();
      for (var j = 0; j < chartInfo.properties.measurements.length; ++j) {
        chartMs.add(ms[chartInfo.properties.measurements[j]]);
      }
      var chartType = chartFactory.get(chartInfo.type);

      if (!chartType) { continue; }

      charts[t].push({
        id: chartInfo.id,
        type: chartType,
        properties: new epiviz.ui.charts.ChartProperties(
          chartInfo.properties.width,
          chartInfo.properties.height,
          epiviz.ui.charts.Margins.fromRawObject(chartInfo.properties.margins),
          chartMs,
          epiviz.ui.charts.ColorPalette.fromRawObject(chartInfo.properties.colors),
          chartInfo.properties.modifiedMethods,
          chartInfo.properties.customSettings,
          chartType.customSettingsDefs())
      });
    }
  }

  return new epiviz.workspaces.Workspace(o.id, o.name, {
    range: epiviz.datatypes.GenomicRange.fromRawObject(o.content.range),
    computedMeasurements: computedMeasurements,
    charts: charts
  });
};
