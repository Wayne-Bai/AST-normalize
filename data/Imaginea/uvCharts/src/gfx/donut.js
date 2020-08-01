uv.DonutGraph = function (graphdef, config) {
	var self = this;
	uv.Graph.call(self, graphdef, config).setDefaults().init();

	self.radius = Math.min(self.height(), self.width()) * 2 / 5;
	self.center = {
		x : self.width() / 2,
		y : self.height() / 2
	};
	
	self.category = graphdef.categories[0];
	
	var data = uv.util.getCategoryData(self.graphdef, [self.category]),
		arcfunc = d3.svg.arc().innerRadius(self.radius * self.config.donut.factor).outerRadius(self.radius),
		layout = d3.layout.pie();

	self.chart.data(data);
	self.arcs = self.chart.selectAll('g.arc')
					.data(layout).enter()
					.append('g').classed(uv.constants.classes.arc + uv.util.formatClassName(self.category), true)
					.attr('transform', 'translate(' + self.center.x + ',' + self.center.y + ')');

	self.arcs.append('path')
			.attr('d', arcfunc)
			.style('fill', function (d, i) { return uv.util.getColorBand(self.config, i); })
			.style('stroke', self.config.donut.strokecolor)
			.style('stroke-width', self.config.donut.strokewidth)
		.on('mouseover', uv.effects.donut.mouseover(self.center, arcfunc, self.config))
		.on('mouseout', uv.effects.donut.mouseout(self.center, self.config));

	self.arcs.append('text')
			.attr('transform', function (d) { return 'translate(' + arcfunc.centroid(d) + ')'; })
			.attr('dy', '.35em')
			.attr('text-anchor', 'middle')
			.style('fill', self.config.label.showlabel ? self.config.donut.fontfill : 'none')
			.style('font-family', self.config.donut.fontfamily)
			.style('font-size', self.config.donut.fontsize)
			.style('font-weight', self.config.donut.fontweight)
			.style('font-variant', self.config.donut.fontvariant)
			.text(function (d) { return uv.util.getLabelValue(self, d); });
		
	self.arcs.append('svg:title')
		.text(function (d, i) { return uv.util.getTooltipText(self, self.category, self.labels[i], d);});

};

uv.DonutGraph.prototype = uv.util.inherits(uv.Graph);

uv.DonutGraph.prototype.setDefaults = function () {
	var self = this;
	self.graphdef.stepup = false;
	return this;
};