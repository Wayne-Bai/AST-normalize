/*!
 * Copyright 2002 - 2014 Webdetails, a Pentaho company.  All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to  http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or  implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

wd = wd || {};
wd.helpers = wd.helpers || {};

wd.helpers.jfreechartHelper = {
  getOpenFlashChart: function(result) {
    return result.replace(/openflashchart/g, wd.cdf.endpoints.getOpenFlashChart());
  },
  getCaption: function(cd, myself, exportFile, cdfComponent) {
    return {
      title: {
        title: cd.title != undefined ? cd.title : "Details",
        oclass: 'title'
      },
      chartType: {
        title: "Chart Type",
        show: function() {
          return cd.chartType != 'function' && ( cd.chartType == "BarChart" || cd.chartType == "PieChart");
        },
        icon: function() {
          return cd.chartType == "BarChart" ? "jfPieIcon" : "jfBarIcon";
        },
        oclass: 'options',
        callback: function() {
          cd.chartType = cd.chartType == "BarChart" ? "PieChart" : "BarChart";
          myself.update();
        }
      },
      excel: {
        title: "Excel",
        icon: "jfExcelIcon",
        oclass: 'options',
        callback: function() {
          exportFile("excel", cd);
        }
      },
      csv: {
        title: "CSV",
        icon: "jfCsvIcon",
        oclass: 'options',
        callback: function() {
          exportFile("csv", cd);
        }
      },
      zoom: {
        title: 'Zoom',
        icon: "jfMagnifyIcon",
        oclass: 'options',
        callback: function() {
          Dashboards.incrementRunningCalls();
          var parameters = myself.getParameters();
          var width = 200, height = 200;
          var urlTemplate, parameterName = "";
          for(p in parameters) {
            if(parameters[p][0] == 'width') {
              width += parameters[p][1];
              parameters[p] = ['width', width]
            }
            if(parameters[p][0] == 'height') {
              height += parameters[p][1];
              parameters[p] = ['height', height]
            }
            if(parameters[p][0] == 'parameterName') {
              parameterName = parameters[p][1];
              parameters[p] = ['parameterName', 'parameterValue']
            }
            if(parameters[p][0] == 'urlTemplate') {
              urlTemplate = parameters[p][1];
              parameters[p] = ['urlTemplate', "javascript:chartClick('" + myself.name + "','{parameterValue}');"]
            }
          }
          myself.zoomCallBack = function(value) {
            eval(urlTemplate.replace("{" + parameterName + "}", value));
          };
          Dashboards.callPentahoAction(myself, "system", "pentaho-cdf/actions", cdfComponent, parameters, function(jXML) {
            if(jXML != null) {
              var openWindow = window.open(wd.cdf.endpoints.getCaptifyZoom(), "_blank", 'width=' + (width + 17) + ',height=' + (height + 20));
              /* Requires disabling popup blockers */
              if(!openWindow) {
                Dashboards.log("Please disable popup blockers and try again.");
              } else {
                var maxTries = 10;
                var loadChart = function() {
                  if(typeof openWindow.loadChart != "undefined") {
                    openWindow.loadChart(jXML.find("ExecuteActivityResponse:first-child").text());
                  } else if(maxTries > 0) {
                    maxTries -= 1;
                    setTimeout(loadChart, 500);
                  }
                };
                loadChart();
              }
            }
            Dashboards.decrementRunningCalls();
          });
        }
      },
      details: {
        title: 'Details',
        icon: "jfTableIcon",
        oclass: 'options',
        callback: function() {
          myself.pivotDefinition = {
            jndi: cd.jndi,
            catalog: cd.catalog,
            query: cd.query
          };
          PivotLinkComponent.openPivotLink(myself);
        }

      }

    };
  }
}
