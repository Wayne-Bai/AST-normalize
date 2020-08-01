function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

    var large_x = function(d){
         d.x = d.x*100000000;
    };


  var big_numbers = [];
  deep_copy(data[0], big_numbers);
  big_numbers.forEach(large_x);
  var dataseries1 = new Plottable.Dataset(big_numbers);


  //Axis
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var IdTitle = new Plottable.Component.Label("Identity");
  var GenTitle = new Plottable.Component.Label("General");
  var FixTitle = new Plottable.Component.Label("Fixed");
  var CurrTitle = new Plottable.Component.Label("Currency");
  var PerTitle = new Plottable.Component.Label("Percentage");
  var SITitle = new Plottable.Component.Label("SI");
  var CustTitle = new Plottable.Component.Label("Custom");

  var custFormatter = function(d) { return "= ' w ' ="; };

  var plot = new Plottable.Plot.Line(xScale, yScale).addDataset(dataseries1);
  plot.project("x", "x", xScale).project("y", "y", yScale);
  var basicTable = new Plottable.Component.Table([[yAxis, plot], [null, xAxis]]);
  var formatChoices = new Plottable.Component.Table([[IdTitle, GenTitle, FixTitle],[CurrTitle, null, PerTitle], [SITitle, null, CustTitle]]);
  var bigTable = new Plottable.Component.Table([[basicTable],[formatChoices]]);
  formatChoices.xAlign("center");

  bigTable.renderTo(svg);


  function identity_frmt() {
    xAxis.formatter(Plottable.Formatters.identity());
    yAxis.formatter(Plottable.Formatters.identity());
  }
  function general_frmt() {
    xAxis.formatter(Plottable.Formatters.general(2));
    yAxis.formatter(Plottable.Formatters.general(2));
  }
  function fixed_frmt() {
    xAxis.formatter(Plottable.Formatters.fixed(2));
    yAxis.formatter(Plottable.Formatters.fixed(2));
  }
  function currency_frmt() {
    xAxis.formatter(Plottable.Formatters.currency(2, '$', true));
    yAxis.formatter(Plottable.Formatters.currency(2, '$', true));
  }
  function percentage_frmt() {
    xAxis.formatter(Plottable.Formatters.percentage(2));
    yAxis.formatter(Plottable.Formatters.percentage(2));
  }
  function SI_frmt() {
     xAxis.formatter(Plottable.Formatters.siSuffix(2));
     yAxis.formatter(Plottable.Formatters.siSuffix(2));
  }
  function custom_frmt() {
     xAxis.formatter(custFormatter);
     yAxis.formatter(custFormatter);
  }

  IdTitle.registerInteraction(new Plottable.Interaction.Click().callback(identity_frmt));
  GenTitle.registerInteraction(new Plottable.Interaction.Click().callback(general_frmt));
  FixTitle.registerInteraction(new Plottable.Interaction.Click().callback(fixed_frmt));
  CurrTitle.registerInteraction(new Plottable.Interaction.Click().callback(currency_frmt));
  PerTitle.registerInteraction(new Plottable.Interaction.Click().callback(percentage_frmt));
  SITitle.registerInteraction(new Plottable.Interaction.Click().callback(SI_frmt));
  CustTitle.registerInteraction(new Plottable.Interaction.Click().callback(custom_frmt));

}
