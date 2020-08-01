uv.Table = function () {
	this.caption = undefined;
	this.position = undefined;
	this.graphdef = undefined;

	this.table = undefined;
	this.header = undefined;
	this.body = undefined;
	this.bodyrows = {};
};

uv.Table.prototype.init = function (graphdef, config) {
	this.graphdef = graphdef;
	this.config = uv.util.extend({}, config);
	this.position = this.config.meta.pos || 'body';

	this.table = d3.select(this.position).append('table').classed(this.config.table.tableclass, true);
	this.header = this.table.append('thead').classed(this.config.table.headerclass, true);
	this.body = this.table.append('tbody').classed(this.config.table.bodyclass, true);
	this.footer = this.table.append('tfoot').classed(this.config.table.footerclass, true);
};

uv.Table.prototype.finalize = function () {
	//console.log(this);
};