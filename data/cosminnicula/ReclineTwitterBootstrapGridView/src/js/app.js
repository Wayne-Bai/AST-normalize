jQuery(function($) {
	window.ReclineTestApp = new ReclineTestApp({
		el: $('.recline-test')
	})
});

var ReclineTestApp = Backbone.View.extend({
	initialize: function() {
		this.explorerDiv = $('.gridview');

		var dataset = this.getLocalDataset();
		
		this.createTable(dataset);
		this.createPager(dataset);
		this.createQueryEditor(dataset);
	},

	createTable: function(dataset) {
		var $el = $('<div />');
		$el.appendTo(this.explorerDiv);
	
		var view = new recline.View.TwitterBootstrapGrid({
           model: dataset
         });
		 
		var $dataViewContainer = this.el.find('.gridview');
		$dataViewContainer.append(view.el);
		
		view.model.fetch()
			.done(function(dataset) {
				view.model.query();
			});
	},
	
	createPager: function(dataset) {
		var pager = new recline.View.TwitterBootstrapPager({
			model: dataset
		});
		
		var $pagerContainer = this.el.find('.pagerview');
		$pagerContainer.append(pager.el);
	},
	
	createQueryEditor: function(dataset) {
		var queryEditor = new recline.View.TwitterBootstrapQueryEditor({
			model: dataset.queryState,
			docCount : dataset.docCount
		});
		
		var $queryEditorContainer = this.el.find('.queryeditorview');
		$queryEditorContainer.append(queryEditor.el);
	},
	
	getLocalDataset: function() {
		var fields = [
			{id: 'ID'},
			{id: 'Name'},
			{id: 'Weight'},
			{id: 'Processor'},
			{id: 'Harddisk'}
		];
		
		var documents = [
			{ID: 0, Name: 'Laptop Alienware M17xR3 Base Nebula Red', Weight: 4.26, Processor: 'Intel Core i7 2.3 GHz', Harddisk: 'SSD' },
			{ID: 1, Name: 'Sony VAIO VPCZ23Z9E', Weight: 4.26, Processor: 'Intel Core i7 2.8 GHz', Harddisk: 'SSD' },
			{ID: 2, Name: 'Apple MacBook Pro', Weight: 2.99, Processor: 'Intel Core i7 2.4 GHz', Harddisk: 'SSD' },
			{ID: 3, Name: 'Dell Precision M4600', Weight: 2.8, Processor: 'Intel Core i7 2.2 GHz', Harddisk: 'HDD 7200 rpm' },
			{ID: 4, Name: 'Asus Lamborghini VX7SX-S1197Z', Weight: 3.82, Processor: 'Intel Core i7 2.2 GHz', Harddisk: 'HDD 7200 rpm' },
			{ID: 5, Name: 'HP EliteBook 8460p', Weight: 2.07, Processor: 'Intel Core i7 2.8 GHz', Harddisk: 'SSD' },
			{ID: 6, Name: 'Lenovo ThinkPad X220', Weight: 1.44, Processor: 'Intel Core i5 1.5 GHz', Harddisk: 'SSD' },
			{ID: 7, Name: 'Toshiba Qosmio X770-107', Weight: 3.4, Processor: 'Intel Core i7 2.0 GHz', Harddisk: '7200 rpm' },
			{ID: 8, Name: 'Apple MacBook Air', Weight: 1.35, Processor: 'Intel Core i5 1.7 GHz', Harddisk: 'SSD' },
			{ID: 9, Name: 'Acer Aspire S3-951-2464G24', Weight: 1.4, Processor: 'Intel Core i5 1.6 GHz', Harddisk: 'SSD' },
		];
		
		var dataset = recline.Backend.Memory.createDataset(documents, fields);
		
		return dataset;
	}
});

