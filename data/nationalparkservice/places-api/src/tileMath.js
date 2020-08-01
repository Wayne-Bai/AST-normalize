// Tile Math Functions from OpenStreetMap
// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames

exports.long2tile = function long2tile(lon, zoom) {
  return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
};
exports.lat2tile = function lat2tile(lat, zoom) {
  return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
};
exports.tile2long = function tile2long(xt, zt) {
  return (xt / Math.pow(2, zt) * 360 - 180);
};
exports.tile2lat = function tile2lat(yy, zy) {
  var n = Math.PI - 2 * Math.PI * yy / Math.pow(2, zy);
  return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
};
