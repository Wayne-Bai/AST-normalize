describe('GraphUtils', function () {
	var graphdef = {
		categories : ['Firefox', 'IE', 'Chrome', 'Opera', 'Safari'],
		dataset : {
			'Firefox': [
				{name: '2001', value: 50},
				{name: '2002', value: 150},
				{name: '2003', value: 20},
				{name: '2004', value: 80},
				{name: '2005', value: 40}
			],
			'IE' : [
				{name: '2001', value: 60 },
				{name: '2002', value: 70 },
				{name: '2003', value: 80 },
				{name: '2004', value: 90 },
				{name: '2005', value: 20 }
			],
			'Chrome' : [
				{name: '2001', value: 10},
				{name: '2002', value: 30},
				{name: '2003', value: 50},
				{name: '2004', value: 90},
				{name: '2005', value: 70}
			],			
			'Opera': [
				{name: '2001', value: 90},
				{name: '2002', value: 60},
				{name: '2003', value: 30},
				{name: '2004', value: 10},
				{name: '2005', value: 70}
			],
			'Safari' : [
				{name: '2001', value: 30},
				{name: '2002', value: 10},
				{name: '2003', value: 60},
				{name: '2004', value: 90},
				{name: '2005', value: 40}
			]
		}
	};
	
	var config = r3.config;
	
	it('should get right max value for a dataset', function () {
		expect(r3.util.getMaxValue(graphdef)).toEqual(150);
	});
	
	it('should get right step up max value for a dataset', function () {
		expect(r3.util.getStepMaxValue(graphdef)).toEqual(360);
	});
	
	it('should get right Data Array for a dataset', function() {
		expect(r3.util.getDataArray(graphdef)).toEqual(
				[[
					{name: '2001', value: 50},
					{name: '2002', value: 150},
					{name: '2003', value: 20},
					{name: '2004', value: 80},
					{name: '2005', value: 40}
				],[
					{name: '2001', value: 60 },
					{name: '2002', value: 70 },
					{name: '2003', value: 80 },
					{name: '2004', value: 90 },
					{name: '2005', value: 20 }
				],[
					{name: '2001', value: 10},
					{name: '2002', value: 30},
					{name: '2003', value: 50},
					{name: '2004', value: 90},
					{name: '2005', value: 70}
				],[
					{name: '2001', value: 90},
					{name: '2002', value: 60},
					{name: '2003', value: 30},
					{name: '2004', value: 10},
					{name: '2005', value: 70}
				],[
					{name: '2001', value: 30},
					{name: '2002', value: 10},
					{name: '2003', value: 60},
					{name: '2004', value: 90},
					{name: '2005', value: 40}
				]]
		);		
	});

	it('should get the right labels for a dataset', function () {
		expect(r3.util.getLabelArray(graphdef)).toEqual(['2001','2002','2003','2004','2005']);
	});
	
	it('should get the right categories for a dataset', function () {
		expect(r3.util.getCategoryArray(graphdef)).toEqual(['Firefox', 'IE', 'Chrome', 'Opera', 'Safari']);
	});
	
	it('should get the right data array for a set of Categories 1', function () {
		var categories = ['Firefox', 'Chrome', 'Opera'];
		var data = [ [50, 150, 20, 80, 40], [10, 30, 50, 90, 70], [90, 60, 30, 10, 70] ];
		expect(r3.util.getCategoryData(graphdef, categories)).toEqual(data);
	});
	
	it('should get the right data array for a set of Categories 2', function () {
		var categories = ['IE'];
		var data = [[60, 70, 80, 90, 20]];
		expect(r3.util.getCategoryData(graphdef, categories)).toEqual(data);
	});
	
	it('should make pascal case string 1', function () {
		var str = 'graphUtil';
		expect(r3.util.getPascalCasedName(str)).toEqual('GraphUtil');
	});
	
	it('should get right color string', function () {
		expect(r3.util.getColorBand(config, 1)).toEqual('#3388dd');
	});
});