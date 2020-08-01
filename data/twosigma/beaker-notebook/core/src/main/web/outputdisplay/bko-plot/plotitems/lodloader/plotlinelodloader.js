/*
*  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*         http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

(function() {
  'use strict';
  var retfunc = function(plotUtils, PlotSampler, PlotLine, PlotLodLine, PlotLodBox, PlotLodRiver) {
    var PlotLineLodLoader = function(data, lodthresh){
      this.datacopy = {};
      _(this.datacopy).extend(data);  // save for later use
      _(this).extend(data); // copy properties to itself
      this.lodthresh = lodthresh;
      this.format(lodthresh);
    };
    // class constants
    PlotLineLodLoader.prototype.lodTypes = ["line", "box", "river"];
    PlotLineLodLoader.prototype.lodSteps = [5, 10, 5];

    PlotLineLodLoader.prototype.format = function() {
      // create plot type index
      this.lodTypeIndex = 0;
      this.lodType = this.lodTypes[this.lodTypeIndex];

      // create the plotters
      this.zoomHash = plotUtils.randomString(3);
      this.plotter = new PlotLine(this.datacopy);
      this.createLodPlotter();

      // a few switches and constants
      this.isLodItem = true;
      this.lodOn = false;
      this.lodAuto = true;
      this.sampleStep = -1;
      if (this.color != null) {
        this.tip_color = plotUtils.createColor(this.color, this.color_opacity);
      } else {
        this.tip_color = "gray";
      }

      this.itemProps = {
        "id" : this.id,
        "st" : this.color,
        "st_op" : this.color_opacity,
        "st_w" : this.width,
        "st_da" : this.stroke_dasharray,
        "d" : ""
      };
      this.elementProps = [];
    };

    PlotLineLodLoader.prototype.zoomLevelChanged = function(scope) {
      this.sampleStep = -1;
      this.zoomHash = plotUtils.randomString(3);
      if (this.lodOn === false) { return; }
      this.lodplotter.setZoomHash(this.zoomHash);
      this.lodplotter.clearTips(scope);
    };

    PlotLineLodLoader.prototype.applyZoomHash = function(hash) {
      this.zoomHash = hash;
      this.lodplotter.setZoomHash(hash);
    };

    PlotLineLodLoader.prototype.switchLodType = function(scope) {
      this.clear(scope);  // must clear first before changing lodType
      this.lodTypeIndex = (this.lodTypeIndex + 1) % this.lodTypes.length;
      this.lodType = this.lodTypes[this.lodTypeIndex];
      this.createLodPlotter();
    };

    PlotLineLodLoader.prototype.applyLodType = function(type) {
      this.lodType = type;
      this.lodTypeIndex = this.lodTypes.indexOf(type);  // maybe -1
      if (this.lodTypeIndex === -1) { this.lodTypeIndex = 0; }
      this.createLodPlotter();
    };

    PlotLineLodLoader.prototype.createLodPlotter = function() {
      var data = {};
      _(data).extend(this.datacopy);
      if (this.lodType === "line") {
        this.lodplotter = new PlotLodLine(data);
        this.lodplotter.setZoomHash(this.zoomHash);
      } else if (this.lodType === "box") {
        data.stroke = data.color;
        data.color_opacity *= .25;
        data.stroke_opacity = 1.0;
        this.lodplotter = new PlotLodBox(data);
        this.lodplotter.setWidthShrink(1);
        this.lodplotter.setZoomHash(this.zoomHash);
      } else if (this.lodType === "river") {
        data.stroke = data.color;  // assume the user has no way to set outline for line
        data.color_opacity *= .25;
        data.stroke_opacity = 1.0;
        this.lodplotter = new PlotLodRiver(data);
        this.lodplotter.setZoomHash(this.zoomHash);
      }
    };

    PlotLineLodLoader.prototype.toggleLodAuto = function(scope) {
      this.lodAuto = !this.lodAuto;
      this.clear(scope);
    };

    PlotLineLodLoader.prototype.applyLodAuto = function(auto) {
      this.lodAuto = auto;
    };

    PlotLineLodLoader.prototype.toggleLod = function(scope) {
      if (this.lodType === "off") {
        this.lodType = this.lodTypes[this.lodTypeIndex];
      } else {
        this.lodType = "off";
      }
      this.clear(scope);
    };

    PlotLineLodLoader.prototype.render = function(scope){
      if (this.showItem === false) {
        this.clear(scope);
        return;
      }

      this.filter(scope);

      var lod = false;
      if (this.lodType !== "off") {
        if ( (this.lodAuto === true && this.vlength > this.lodthresh) || this.lodAuto === false) {
          lod = true;
        }
      }

      if (this.lodOn != lod) {
        scope.legendDone = false;
        this.clear(scope);
      }
      this.lodOn = lod;

      if (this.lodOn === true) {
        this.sample(scope);
        this.lodplotter.render(scope, this.elementSamples);
      } else {
        this.plotter.render(scope);
      }
    };

    PlotLineLodLoader.prototype.getRange = function() {
      return this.plotter.getRange();
    };

    PlotLineLodLoader.prototype.applyAxis = function(xAxis, yAxis) {
      this.xAxis = xAxis;
      this.yAxis = yAxis;
      this.plotter.applyAxis(xAxis, yAxis);
      // sampler is created AFTER coordinate axis remapping
      this.createSampler();
    };

    PlotLineLodLoader.prototype.createSampler = function() {
      var xs = [], ys = [], _ys = [];
      for (var i = 0; i < this.elements.length; i++) {
        var ele = this.elements[i];
        xs.push(ele.x);
        ys.push(ele.y);
        _ys.push(ele._y);
      }
      this.sampler = new PlotSampler(xs, ys, _ys);
    };


    PlotLineLodLoader.prototype.filter = function(scope) {
      this.plotter.filter(scope);
      this.vindexL = this.plotter.vindexL;
      this.vindexR = this.plotter.vindexR;
      this.vlength = this.plotter.vlength;
    };

    PlotLineLodLoader.prototype.sample = function(scope) {

      var xAxis = this.xAxis,
          yAxis = this.yAxis;
      var xl = scope.focus.xl, xr = scope.focus.xr;

      if (this.sampleStep === -1) {
        var pixelWidth = scope.plotSize.width;
        var count = Math.ceil(pixelWidth / this.lodSteps[this.lodTypeIndex]);
        var s = (xr - xl) / count;
        this.sampleStep = s;
      }

      var step = this.sampleStep;
      xl = Math.floor(xl / step) * step;
      xr = Math.ceil(xr / step) * step;

      this.elementSamples = this.sampler.sample(xl, xr, this.sampleStep);
    };

    PlotLineLodLoader.prototype.clear = function(scope) {
      scope.maing.select("#" + this.id).selectAll("*").remove();
      this.clearTips(scope);
    };

    PlotLineLodLoader.prototype.clearTips = function(scope) {
      if (this.lodOn === false) {
        this.plotter.clearTips(scope);
        return;
      }
      this.lodplotter.clearTips(scope);
    };

    PlotLineLodLoader.prototype.createTip = function(ele) {
      if (this.lodOn === false) {
        return this.plotter.createTip(ele);
      }
      var xAxis = this.xAxis,
          yAxis = this.yAxis;
      var tip = {};
      if (this.legend != null) {
        tip.title = this.legend + " (sample)";
      }
      var eles = this.elements;
      tip.xl = plotUtils.getTipStringPercent(ele.xl, xAxis, 6);
      tip.xr = plotUtils.getTipStringPercent(ele.xr, xAxis, 6);
      tip.max = plotUtils.getTipString(ele._max, yAxis, true);
      tip.min = plotUtils.getTipString(ele._min, yAxis, true);
      tip.avg = plotUtils.getTipStringPercent(ele.avg, yAxis, 6);
      return plotUtils.createTipString(tip);
    };

    return PlotLineLodLoader;
  };
  beaker.bkoFactory('PlotLineLodLoader',
    ['plotUtils', 'PlotSampler', 'PlotLine', 'PlotLodLine', 'PlotLodBox', 'PlotLodRiver',
    retfunc]);
})();
