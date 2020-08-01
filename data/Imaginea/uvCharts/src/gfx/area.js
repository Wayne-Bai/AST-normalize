uv.AreaGraph = function (graphdef, config) {
	var self = this;
	uv.Graph.call(self, graphdef, config).setDefaults().init();

	self.areagroups = [];
	self.dataset = uv.util.getDataArray(self.graphdef);

	var areagroup, areapath, areafunc, idx, len,
		domainData = self.graphdef.dataset[self.graphdef.categories[0]];

	self.axes[self.config.graph.orientation === 'Horizontal' ? 'ver' : 'hor'].scale.domain(domainData.map(function (d) { return d.name; }));

	for (idx = 0, len = self.dataset.length; idx < len; idx = idx + 1) {
		areapath = self.chart.append('g').classed('cg-' + uv.util.formatClassName(self.categories[idx]), true)
												.append('g').classed('cge-' + uv.util.formatClassName(self.categories[idx]), true).datum(self.dataset[idx]);
		areagroup = { path: areapath, linefunc: undefined, areafunc: undefined, line: undefined, area: undefined };
		self['draw' + self.config.graph.orientation + 'Area'](areagroup, idx);
		self.areagroups.push(areagroup);
	}

	self.finalize();
};

uv.AreaGraph.prototype = uv.util.inherits(uv.Graph);

uv.AreaGraph.prototype.setDefaults = function () {
	var self = this;
	self.graphdef.stepup = false;
	return this;
};

uv.AreaGraph.prototype.drawHorizontalArea = function (areagroup, idx) {
	var self = this,
		color = uv.util.getColorBand(self.config, idx);
		
	self.axes.ver.scale.rangePoints([0, self.height()]);

	areagroup.linefunc = d3.svg.line()
				.x(function (d) { return self.axes.hor.scale(d.value); })
				.y(function (d) { return self.axes.ver.scale(d.name) + self.axes.ver.scale.rangeBand() / 2; })
				.interpolate(self.config.area.interpolation);

	areagroup.areafunc = d3.svg.area()
				.x0(self.axes.hor.scale(0))
				.x1(areagroup.linefunc.x())
				.y(areagroup.linefunc.y())
				.interpolate(self.config.area.interpolation);

	areagroup.area = areagroup.path.append('svg:path')
				.classed(uv.constants.classes.areapath + idx, true)
				.attr('d', areagroup.areafunc)
				.style('opacity', self.config.area.opacity)
				.style('-moz-opacity', self.config.area.opacity)
				.style('fill', color);

	areagroup.line = areagroup.path.append('svg:path')
				.classed(uv.constants.classes.linepath + idx, true)
				.attr('d', areagroup.linefunc)
				.style('stroke', 'white')
				.style('fill', 'none');

	areagroup.path.selectAll('.' + uv.constants.classes.dot)
				.data(self.dataset[idx])
				.enter().append('circle')
				.classed(uv.constants.classes.dot, true)
				.attr('cx', areagroup.linefunc.x())
				.attr('cy', areagroup.linefunc.y())
				.attr('r', 3.5)
				.style('fill', 'white');
};

uv.AreaGraph.prototype.drawVerticalArea = function (areagroup, idx) {
	var self = this,
		color = uv.util.getColorBand(self.config, idx);
	
	self.axes.hor.scale.rangePoints([0, self.width()]);

	areagroup.linefunc = d3.svg.line()
				.x(function (d) { return self.axes.hor.scale(d.name) + self.axes.hor.scale.rangeBand() / 2; })
				.y(function (d) { return self.axes.ver.scale(d.value); })
				.interpolate(self.config.area.interpolation);

	areagroup.areafunc = d3.svg.area()
				.x(areagroup.linefunc.x())
				.y0(areagroup.linefunc.y())
				.y1(self.axes.ver.scale(0))
				.interpolate(self.config.area.interpolation);

	areagroup.area = areagroup.path.append('svg:path')
				.classed(uv.constants.classes.areapath + idx, true)
				.attr('d', areagroup.areafunc)
				.style('opacity', self.config.area.opacity)
				.style('-moz-opacity', self.config.area.opacity)
				.style('fill', color);

	areagroup.line = areagroup.path.append('svg:path')
				.classed(uv.constants.classes.linepath + idx, true)
				.attr('d', areagroup.linefunc)
				.style('stroke', 'white')
				.style('fill', 'none');

	areagroup.path.selectAll('.' + uv.constants.classes.dot)
				.data(self.dataset[idx])
				.enter().append('circle')
				.classed(uv.constants.classes.dot, true)
				.attr('cx', areagroup.linefunc.x())
				.attr('cy', areagroup.linefunc.y())
				.attr('r', 3.5)
				.style('fill', 'white');
};