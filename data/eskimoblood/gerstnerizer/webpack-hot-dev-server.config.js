module.exports = require("./make-webpack-config")({
	hot: true,
	devServer: true,
	hotComponents: true,
	devtool: "source-map",
	debug: true,
});
