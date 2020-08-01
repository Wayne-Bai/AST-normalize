uv.effects = {};

uv.effects.bar = {};
uv.effects.bar.mouseover = function (graph, idx) {
	var config = graph.config,
		category = graph.categories[idx],
		label = graph.labels[idx];

	var effect = function () {
		graph.frame.selectAll('rect.cr-' + uv.util.formatClassName(category))
			.transition().duration(config.effects.hover)
				.style('fill', config.effects.hovercolor)
				.style('stroke', config.effects.strokecolor);
	
		if(config.effects.showhovertext){
			graph.frame.selectAll('text.cr-' + uv.util.formatClassName(category))
				.transition().duration(config.effects.hover)
					.style('fill', config.effects.textcolor)
					.style('opacity', 1);
		}
	};

	if(config.legend.legendtype === 'categories'){
		graph.effects[category].mouseover = effect;
	}else{
		graph.effects[label].mouseover = effect;
	}
	return effect;
};

uv.effects.bar.mouseout = function (graph, idx, defColor) {
	var config = graph.config,
		category = graph.categories[idx],
		barColor = uv.util.getColorBand(graph.config, idx),
		textColor = defColor || uv.util.getColorBand(graph.config, idx),
		label = graph.labels[idx];

	var effect = function () {
		graph.frame.selectAll('rect.cr-' + uv.util.formatClassName(category))
			.transition().duration(config.effects.hover)
				.style('fill', barColor)
				.style('stroke', 'none');
	
		graph.frame.selectAll('text.cr-' + uv.util.formatClassName(category))
			.transition().duration(config.effects.hover)
				.style('fill', graph.config.label.showlabel ? textColor : 'none');
	};

	if(config.legend.legendtype === 'categories'){
		graph.effects[category].mouseout = effect;
	}else{
		graph.effects[label].mouseout = effect;
	}
	return effect;
};

uv.effects.area = {};
uv.effects.area.mouseover = function (graph, idx) {
	var config = graph.config,
		category = graph.categories[idx];

	var effect = function () {
		graph.frame.selectAll('.cge-' + uv.util.formatClassName(category)).select('path.' + uv.constants.classes.area + uv.util.formatClassName(category))
		.transition().duration(config.effects.hover)
		.style('fill',config.effects.hovercolor);
	};

	graph.effects[category].mouseover = effect;
	return effect;
};

uv.effects.area.mouseout = function (graph, idx) {
	var config = graph.config,
		category = graph.categories[idx];

	var effect = function () {
		graph.frame.selectAll('.cge-'+ uv.util.formatClassName(category)).select('path.'+ uv.constants.classes.area + uv.util.formatClassName(category));
		graph.frame.selectAll('.cge-'+uv.util.formatClassName(category)).select('path.' + uv.constants.classes.area +uv.util.formatClassName(category))
		.transition().duration(config.effects.hover)
		.style('fill',uv.util.getColorBand(config,idx));
	};

	graph.effects[category].mouseout = effect;
	return effect;
};


uv.effects.line = {};
uv.effects.line.mouseover = function (graph, idx) {
	var config = graph.config,
		category = graph.categories[idx];

	var effect = function () {
		graph.frame.selectAll('.cge-' + uv.util.formatClassName(category)).selectAll('circle')
			.transition().duration(config.effects.hover)
				.style('fill', config.effects.hovercolor)
				.style('fill-opacity', 1)
				.style('stroke', config.effects.hovercolor);

		graph.frame.selectAll('.cge-' + uv.util.formatClassName(category)).select('path')
			.transition().duration(config.effects.hover)
				.style('stroke', config.effects.hovercolor);

		if(config.effects.showhovertext){
			graph.frame.selectAll('.cge-' + uv.util.formatClassName(category)).selectAll('text')
				.transition().duration(config.effects.hover)
					.style('fill', config.effects.textcolor);
		}
	};
	graph.effects[category].mouseover = effect;

	return effect;
};

uv.effects.line.mouseout = function (graph, idx, defColor) {
	var config = graph.config,
		category = graph.categories[idx],
		color = defColor || uv.util.getColorBand(graph.config, idx);

	var effect = function () {
		graph.frame.selectAll('.cge-' + uv.util.formatClassName(category)).selectAll('circle')
			.transition().duration(config.effects.hover)
				.style('fill', color)
				.style('fill-opacity', 0.6)
				.style('stroke', '#fff');

		graph.frame.selectAll('.cge-' + uv.util.formatClassName(category)).select('path')
			.transition().duration(config.effects.hover)
				.style('stroke', color);

		graph.frame.selectAll('.cge-' + uv.util.formatClassName(category)).selectAll('text')
			.transition().duration(config.effects.hover)
				.style('fill', graph.config.label.showlabel ? color : 'none');

	};	
	graph.effects[category].mouseout = effect;
	return effect;
};

uv.effects.caption = {};
uv.effects.caption.mouseover = function (config) {
	return function () {
		d3.select(this.parentNode.parentNode).select('.' + uv.constants.classes.hoverbg)
			.transition().duration(config.effects.duration)
				.style('fill', config.caption.hovercolor);
	};
};

uv.effects.caption.mouseout = function (config) {
	return function () {
		d3.select(this.parentNode.parentNode).select('.' + uv.constants.classes.hoverbg)
			.transition().duration(config.effects.duration)
				.style('fill', config.graph.bgcolor);
	};
};

uv.effects.donut = {};
uv.effects.donut.mouseover = function (center, arcfunc, config, d) {
	return function (d) {
		var dev = {
				x : arcfunc.centroid(d)[0] / 5,
				y : arcfunc.centroid(d)[1] / 5
			};

		d3.select(this.parentNode)
			.transition().duration(config.effects.duration)
				.attr('transform', 'translate(' + (center.x + dev.x) + ',' + (center.y + dev.y) + ')');
	};
};

uv.effects.donut.mouseout = function (center, config) {
	return function () {
		d3.select(this.parentNode)
			.transition().duration(config.effects.duration)
				.attr('transform', 'translate(' + center.x + ',' + center.y + ')');
	};
};

uv.effects.pie = {};
uv.effects.pie.mouseover = function (graph ,center, arcfunc, config) {
	var effect =  function (d) {
		var dev = {
				x : arcfunc.centroid(d)[0] / 5,
				y : arcfunc.centroid(d)[1] / 5
			};
		d3.select(this.parentNode)
			.transition().duration(config.effects.duration)
				.attr('transform', 'translate(' + (center.x + dev.x) + ',' + (center.y + dev.y) + ')');
	};
	return effect;
};

uv.effects.pie.mouseout = function (graph, center, config) {
	var effect =  function () {
		d3.select(this.parentNode)
			.transition().duration(config.effects.duration)
				.attr('transform', 'translate(' + center.x + ',' + center.y + ')');
	};
	return effect;
};

uv.effects.legend = {};
uv.effects.legend.mouseover = function (self, idx) {
	if(self.config.legend.legendtype === 'categories'){
		return self.effects.group[self.categories[idx]].mouseover;
	}else{
		return self.effects.group[self.labels[idx]].mouseover;
	}
};

uv.effects.legend.mouseout = function (self, idx) {
	if(self.config.legend.legendtype === 'categories'){
		return self.effects.group[self.categories[idx]].mouseout;
	}else{
		return self.effects.group[self.labels[idx]].mouseout;
	}
};

uv.effects.legend.click = function (i, ctx, graph) {
	var disabled = (d3.select(ctx).attr('disabled') === 'false') ? false : true;
	graph.toggleGraphGroup(i);
	d3.select(ctx).select('rect').style('fill', disabled ? uv.util.getColorBand(graph.config, i) : uv.config.legend.inactivecolor);
	d3.select(ctx).select('text').style('fill', disabled ? null : uv.config.legend.inactivecolor);
	d3.select(ctx).attr('disabled', disabled ? 'false' : 'true');
};
