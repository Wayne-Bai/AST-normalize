var planUtils = require('./plan_utils.js');

exports.decodePlan = function(filename, outputFile) {
	var header = {unknown:[]};
	
	var f = new planUtils.PlanFile(filename);

	header.size = f.readInteger(2);
	header.version = f.readInteger(2) + '.' + f.readInteger(2);
	header.creationDate = f.readTimestamp();
	
	header.unknown.push(f.readInteger(2));
	header.unknown.push(f.readInteger(4));
	header.listLength1 = f.readInteger(4);
	header.unknown.push(f.readHexDump(4));

	header.description = f.readString(header.size - f.pos);
	
	var list1 = [];
	for (var i = 0; i < header.listLength1; i++) {
		list1.push([
			i,
			f.readInteger(4),
			f.readInteger(4),
			f.readInteger(2)
		]);
	}
	planUtils.exportTSV(outputFile, '1', list1, 'info1_id,unknown1,unknown2,unknown3');
	
	var list2 = [];
	var p0 = f.pos;
	var i = 0;
	while (f.pos < f.length) {
		list2.push([
			i,
			f.pos - p0,
			f.readNullString()
		]);
	}
	planUtils.exportTSV(outputFile, '2', list2, 'info2_id,offset,unknown1');
	
	header.bytesLeft = f.check(outputFile);
	
	planUtils.exportHeader(outputFile, header);
}


