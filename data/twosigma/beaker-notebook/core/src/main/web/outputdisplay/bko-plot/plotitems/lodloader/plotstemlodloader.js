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
  var retfunc = function(plotUtils, PlotSampler, PlotStem,
    PlotLodStem, PlotAuxStem, PlotLodBox, PlotAuxBox) {
    var PlotStemLodLoader = function(data, lodthresh){
      this.datacopy = {};
      _(this.datacopy).extend(data);  // save for later use
      _(this).extend(data); // copy properties to itself
      this.lodthresh = lodthresh;
      this.format(lodthresh);
    };
    // class constants
    PlotStemLodLoader.prototype.lodTypes = ["stem", "stem+", "box"];
    PlotStemLodLoader.prototype.lodSteps = [5, 10, 10];

    PlotStemLodLoader.prototype.format = function() {
      // create plot type index
      this.lodTypeIndex = 0;
      this.lodType = this.lodTypes[this.lodTypeIndex]; // line, box

      // create the plotters
      this.zoomHash = plotUtils.randomString(3);
      this.plotter = new PlotStem(this.datacopy);
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

    PlotStemLodLoader.prototype.zoomLevelChanged = function(scope) {
      this.sampleStep = -1;
      this.zoomHash = plotUtils.randomString(3);
      if (this.lodOn === false) { return; }
      if (this.lodType === "stem") {
        this.lodplotter.setZoomHash(this.zoomHash);
        this.lodplotter.clearTips(scope);
      } else if (this.lodType === "stem+" || this.lodType === "box") {
        this.lodplotter.setZoomHash(this.zoomHash);
        this.lodplotter2.setZoomHash(this.zoomHash2);
        this.lodplotter.clearTips(scope);
        this.lodplotter2.clearTips(scope);
      }
    };

    PlotStemLodLoader.prototype.applyZoomHash = function(hash) {
      this.zoomHash = hash;
      if (this.lodType === "stem") {
        this.lodplotter.setZoomHash(hash);
      } else if (this.lodType === "stem+" ||  this.lodType === "box") {
        this.lodplotter.setZoomHash(hash);
        this.lodplotter2.setZoomHash(hash);
      }
    };

    PlotStemLodLoader.prototype.switchLodType = function(scope) {
      this.clear(scope);  // must clear first before changing lodType
      this.lodTypeIndex = (this.lodTypeIndex + 1) % this.lodTypes.length;
      this.lodType = this.lodTypes[this.lodTypeIndex];
      this.createLodPlotter();
    };

    PlotStemLodLoader.prototype.applyLodType = function(type) {
      this.lodType = type;
      this.lodTypeIndex = this.lodTypes.indexOf(type);  // maybe -1
      if (this.lodTypeIndex === -1) { this.lodTypeIndex = 0; }
      this.createLodPlotter();
    };

    PlotStemLodLoader.prototype.createLodPlotter = function() {
      var data = {};
      _(data).extend(this.datacopy);
      if (this.lodType === "stem") {
        this.lodplotter = new PlotLodStem(data);
        this.lodplotter.setZoomHash(this.zoomHash);
      } else if (this.lodType === "stem+") {
        data.width += 1.5;
        data.color_opacity *= .5;
        this.lodplotter = new PlotLodStem(data);
        this.lodplotter2 = new PlotLodStem(data);
        this.lodplotter.setZoomHash(this.zoomHash);
        this.lodplotter2.setZoomHash(this.zoomHash);

        _(data).extend(this.datacopy);
        this.auxplotter = new PlotAuxStem(data);
      } else if (this.lodType === "box") {
        // lod boxes are plotted with special coloring (inversed color)
        data.stroke = data.color; // assume the user has no way to set outline for stem
        data.color_opacity *= .25;
        data.stroke_opacity = 1.0;
        this.lodplotter = new PlotLodBox(data);
        this.lodplotter2 = new PlotLodBox(data);
        this.lodplotter.setWidthShrink(1);
        this.lodplotter2.setWidthShrink(1);
        this.lodplotter.setZoomHash(this.zoomHash);
        this.lodplotter2.setZoomHash(this.zoomHash);

        _(data).extend(this.datacopy); // normal color for aux box
        this.auxplotter = new PlotAuxBox(data);
        this.auxplotter.setWidthShrink(1);  // reduce box width by 1px (left and right)
      }
    };

    PlotStemLodLoader.prototype.toggleLodAuto = function(scope) {
      this.lodAuto = !this.lodAuto;
      this.clear(scope);
    };

    PlotStemLodLoader.prototype.applyLodAuto = function(auto) {
      this.lodAuto = auto;
    };

    PlotStemLodLoader.prototype.toggleLod = function(scope) {
      if (this.lodType === "off") {
        this.lodType = this.lodTypes[this.lodTypeIndex];
      } else {
        this.lodType = "off";
      }
      this.clear(scope);
    };

    PlotStemLodLoader.prototype.render = function(scope){
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
        if (this.lodType === "stem") {
          this.lodplotter.render(scope, this.elementSamples);
        } else if (this.lodType === "stem+" || this.lodType === "box") {
          this.auxplotter.render(scope, this.elementAuxes, "a");
          this.lodplotter.render(scope, this.elementSamples, "yBtm");
          this.lodplotter2.render(scope, this.elementSamples2, "yTop");
        }
      } else {
        this.plotter.render(scope);
      }
    };

    PlotStemLodLoader.prototype.getRange = function(){
      return this.plotter.getRange();
    };

    PlotStemLodLoader.prototype.applyAxis = function(xAxis, yAxis) {
      this.xAxis = xAxis;
      this.yAxis = yAxis;
      this.plotter.applyAxis(xAxis, yAxis);
      // sampler is created AFTER coordinate axis remapping
      this.createSampler();
    };

    PlotStemLodLoader.prototype.createSampler = function() {
      var xs = [], ys = [], y2s = [], _ys = [], _y2s = [];
      for (var i = 0; i < this.elements.length; i++) {
        var ele = this.elements[i];
        xs.push(ele.x);
        ys.push(ele.y);
        y2s.push(ele.y2);
        _ys.push(ele._y);
        _y2s.push(ele._y2);
      }
      this.sampler = new PlotSampler(xs, ys, _ys);
      this.sampler2 = new PlotSampler(xs, y2s, _y2s);
    };

    PlotStemLodLoader.prototype.filter = function(scope) {
      this.plotter.filter(scope);
      this.vindexL = this.plotter.vindexL;
      this.vindexR = this.plotter.vindexR;
      this.vlength = this.plotter.vlength;
    };

    PlotStemLodLoader.prototype.sample = function(scope) {
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
      this.elementSamples2 = this.sampler2.sample(xl, xr, this.sampleStep);
      var count = this.elementSamples.length;

      if (this.lodType === "stem") {
        var elements = [];
        for (var i = 0; i < count; i++) {
          elements.push({
            x : this.elementSamples[i].x,
            min : this.elementSamples[i].avg,
            max : this.elementSamples2[i].avg,
            hash: this.elementSamples[i].hash,
            xl : this.elementSamples[i].xl,
            xr : this.elementSamples[i].xr
          });
        }
        this.elementSamples = elements;
      } else if (this.lodType === "stem+") {
        this.elementAuxes = [];
        // prepare the aux box in between
        for (var i = 0; i < count; i++) {
          this.elementAuxes.push({
            x : this.elementSamples[i].x,
            y : this.elementSamples[i].max,
            y2 : this.elementSamples2[i].min
          });
        }
      } else if (this.lodType === "box") {
        this.elementAuxes = [];
        // prepare the aux box in between
        for (var i = 0; i < count; i++) {
          this.elementAuxes.push({
            x : this.elementSamples[i].xl,
            x2 : this.elementSamples[i].xr,
            y : this.elementSamples[i].max,
            y2 : this.elementSamples2[i].min
          });
        }
      }
    };

    PlotStemLodLoader.prototype.clear = function(scope) {
      scope.maing.select("#" + this.id).selectAll("*").remove();
      this.clearTips(scope);
    };

    PlotStemLodLoader.prototype.clearTips = function(scope) {
      if (this.lodOn === false) {
        this.plotter.clearTips(scope);
        return;
      }
      if (this.lodType === "bar") {
        this.lodplotter.clearTips(scope);
      } else if (this.lodType === "box") {
        this.lodplotter.clearTips(scope);
        this.lodplotter2.clearTips(scope);
      }
    };

    PlotStemLodLoader.prototype.createTip = function(ele, g) {
      if (this.lodOn === false) {
        return this.plotter.createTip(ele);
      }
      var xAxis = this.xAxis,
          yAxis = this.yAxis;
      var tip = {};
      var sub = "sample" + (g !== "" ? (" " + g) : "");
      if (this.legend != null) {
        tip.title = this.legend + " (" + sub + ")";
      }
      tip.xl = plotUtils.getTipStringPercent(ele.xl, xAxis, 6);
      tip.xr = plotUtils.getTipStringPercent(ele.xr, xAxis, 6);
      if (this.lodType === "stem") {
        tip.avg_yTop = plotUtils.getTipStringPercent(ele.max, yAxis, 6);
        tip.avg_yBtm = plotUtils.getTipStringPercent(ele.min, yAxis, 6);
      } else if (this.lodType === "stem+" || this.lodType === "box") {
        tip.max = plotUtils.getTipString(ele._max, yAxis, true);
        tip.min = plotUtils.getTipString(ele._min, yAxis, true);
        tip.avg = plotUtils.getTipStringPercent(ele.avg, yAxis, 6);
      }
      return plotUtils.createTipString(tip);
    };

    return PlotStemLodLoader;
  };
  beaker.bkoFactory('PlotStemLodLoader',
    ['plotUtils', 'PlotSampler', 'PlotStem',
    'PlotLodStem', 'PlotAuxStem', 'PlotLodBox', 'PlotAuxBox', retfunc]);
})();
