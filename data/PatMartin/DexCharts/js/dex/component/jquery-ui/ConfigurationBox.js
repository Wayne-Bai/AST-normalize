function ConfigurationBox(userConfig)
{
  var chart = new DexComponent(userConfig,
  {
  	// The parent container of this chart.
    'parent'           : null,
    // Set these when you need to CSS style components independently.
    'id'               : 'ConfigurationBox',
    'class'            : 'ui-widget-content',
    'width'            : 600,
    'height'           : 100,
    'xoffset'          : 10,
    'yoffset'          : 10,
    'title'            : "Options",
    'components'       : [],
    'resizeable'       : true,
    'draggable'        : true
  });

  chart.render = function()
  {
    var chart = this;
    var config = chart.config;
    var i;

    // Create the main container.
    if (config.parent === null)
    {
      config.parent = document.body;
    }

    chart.main =
      jQuery('<div/>',
      {
        'id' : config['id'],
        'class' : config['class']
      }).appendTo(config.parent);

    for (i=0; i<config.components.length; i++)
    {
      config.components[i].attr('parent', chart.main);
      config.components[i].render();
    }
    chart.update();
  };

  chart.update = function()
  {
    var chart = this,
        config = chart.config,
        ri, ci;

    jQuery('<h3/>',
    {
      'class' : 'ui-widget-header',
      'text'  : config.title
    }).appendTo(chart.main);

    for (ci = 0; ci<config.components.length; ci+=1)
    {
      config.components[ci].update();
      dex.console.log("CMP", config.components[ci], "DOM", config.components[ci].dom());
      config.components[ci].dom().appendTo(chart.main);
    }

    config.resizeable && $("#" + config.id).resizable();
    config.draggable && $("#" + config.id).draggable();
  };

  chart.dom = function()
  {
    return chart.main;
  };

  chart.add = function(components)
  {
    var chart = this,
        config = chart.config,
        i;

    for (i = 0; i<arguments.length; i+=1)
    {
      config.components.push(arguments[i]);
    }
    return chart;
  };

  return chart;
}