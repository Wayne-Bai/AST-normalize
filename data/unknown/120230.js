! ✖ / env;
node;
var jsdom = require("jsdom");
jsdom.env("<html><body></body></html>", function(errors, window)  {
      for (var i in window)  {
            if (i == "console")  {
               continue;
            }
            eval(i + "=window['" + i + "'];");
         }
      OpenLayers = require("./lib/OpenLayers.js").OpenLayers;
      var map = new OpenLayers.Map(document.createElement("map"));
      map.addLayer(new OpenLayers.Layer("",  {
               isBaseLayer:true            }
         ));
      map.setCenter(new OpenLayers.LonLat(- 71, 42), 10);
      var px = map.getPixelFromLonLat(map.getLonLatFromPixel(new OpenLayers.Pixel(100, 100)));
      console.log(px);
      px = map.getLonLatFromPixel(map.getPixelFromLonLat(new OpenLayers.LonLat(10, 10)));
      console.log(px);
   }
);
