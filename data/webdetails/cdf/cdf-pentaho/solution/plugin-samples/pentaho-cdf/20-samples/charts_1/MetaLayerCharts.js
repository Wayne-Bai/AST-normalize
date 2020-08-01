/*!
 * Copyright 2002 - 2013 Webdetails, a Pentaho company.  All rights reserved.
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

var MetaLayerCharts = {
  /*startDate: MetaLayer.getLastMonthDate(), // Default start date
   endDate: MetaLayer.getCurrentDate(), // Default end date
   startMonth: MetaLayer.getMonth(), // Default month date*/
};

MetaLayerCharts = {

  regionsMeasure: "[Region].[All Regions]",
  selectedRegionMeasure: "[Region].[All Regions]",
  departmentMeasure: "[Department].[All Departments]",

  pieChartClicked: function (value) {
    if (value == "All Regions") {
      MetaLayerCharts.regionsMeasure = "[Region].[All Regions].Children";
      Dashboards.fireChange("MetaLayerCharts.regionsMeasure", MetaLayerCharts.regionsMeasure);
    }
    else {
      MetaLayerCharts.selectedRegionMeasure = "[Region].[All Regions].[" + value + "]";
      Dashboards.fireChange("MetaLayerCharts.selectedRegionMeasure", MetaLayerCharts.selectedRegionMeasure);
    }
  },

  barChartClicked: function (value) {

    MetaLayerCharts.departmentMeasure = "[Department].[All Departments].[" + value + "]";
    Dashboards.fireChange("MetaLayerCharts.departmentMeasure", encode_prepare(MetaLayerCharts.departmentMeasure));
  },

  pieChartDefinition: {
    width: 300,
    height: 200,
    chartType: "PieChart",
    datasetType: "CategoryDataset",
    is3d: "true",
    isStacked: "true",
    includeLegend: "false",
    foregroundAlpha: 0.7,
    queryType: 'mdx',
    jndi: "SampleData",
    catalog: "solution:steel-wheels/analysis/SampleData.mondrian.xml",
    urlTemplate: "javascript:MetaLayerCharts.pieChartClicked( encode_prepare('{region}') )",
    parameterName: "region",
    titleKey: "chartsamples.piechart.title",
    query: function () {

      var query = "with member [Measures].[Variance Percent] as '([Measures].[Variance] / [Measures].[Budget])'," +
          " format_string = IIf(((([Measures].[Variance] / [Measures].[Budget]) * 100.0) > 2.0), \"|#.00%|style='green'\"," +
          " IIf(((([Measures].[Variance] / [Measures].[Budget]) * 100.0) < 0.0), \"|#.00%|style='red'\", \"#.00%\"))" +
          " select NON EMPTY {[Measures].[Actual], [Measures].[Budget], [Measures].[Variance], [Measures].[Variance Percent]} ON COLUMNS," +
          " NON EMPTY ( " + MetaLayerCharts.regionsMeasure + " ) ON ROWS " +
          " from [Quadrant Analysis]";

      return query;
    }
  },

  barChartDefinition: {
    width: 300,
    height: 250,
    chartType: "BarChart",
    datasetType: "CategoryDataset",
    is3d: "true",
    isStacked: "true",
    includeLegend: "false",
    foregroundAlpha: 0.7,
    queryType: 'mdx',
    jndi: "SampleData",
    catalog: "solution:steel-wheels/analysis/SampleData.mondrian.xml",
    titleKey: "chartsamples.barchart.title",
    urlTemplate: "javascript:MetaLayerCharts.barChartClicked('{department}')",
    parameterName: "department",
    query: function () {

      var query = "with member [Measures].[Variance Percent] as '([Measures].[Variance] / [Measures].[Budget])'," +
          " format_string = IIf(((([Measures].[Variance] / [Measures].[Budget]) * 100.0) > 2.0), \"|#.00%|style='green'\"," +
          " IIf(((([Measures].[Variance] / [Measures].[Budget]) * 100.0) < 0.0), \"|#.00%|style='red'\", \"#.00%\"))" +
          " select NON EMPTY {[Measures].[Actual], [Measures].[Budget], [Measures].[Variance], [Measures].[Variance Percent]} ON COLUMNS," +
          " NON EMPTY ([Department].[All Departments].Children ) ON ROWS " +
          " from [Quadrant Analysis]" +
          " where (" + MetaLayerCharts.selectedRegionMeasure + ")";

      return query;
    }
  },

  dialChartDefinition: {
    width: 300,
    height: 200,
    chartType: "DialChart",
    queryType: 'mdx',
    is3d: 'true',
    jndi: "SampleData",
    titleKey: "chartsamples.dialchart.title",
    catalog: "solution:steel-wheels/analysis/SampleData.mondrian.xml",
    //colors: ["#F16C3A","#FFFF00","#B0D837"],
    intervals: [7000000, 70000000, 150000000],
    includeLegend: true,

    query: function () {

      var query = " select NON EMPTY [Measures].[Budget] ON COLUMNS," +
          " NON EMPTY (" + MetaLayerCharts.departmentMeasure + " ) ON ROWS " +
          " from [Quadrant Analysis]";

      return query;
    }
  }
};
