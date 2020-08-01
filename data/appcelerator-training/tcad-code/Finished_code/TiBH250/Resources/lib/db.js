//bootstrap database
var db = Ti.Database.open('TiBountyHunter');
db.execute('CREATE TABLE IF NOT EXISTS fugitives(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, captured INTEGER);');
db.close();

exports.list = function(_captured) {
	var fugitiveList = [];
	var db = Ti.Database.open('TiBountyHunter');
	var result = db.execute('SELECT * FROM fugitives WHERE captured = ? ORDER BY name ASC', (_captured) ? 1 : 0);
	while (result.isValidRow()) {
		fugitiveList.push({
			//add these attributes for the benefit of a table view
			title: result.fieldByName('name'),
			id: result.fieldByName('id'), //custom data attribute to pass to detail page
			hasChild:true,
			color: '#fff',
			name: result.fieldByName('name'),
			captured: (Number(result.fieldByName('captured')) === 1)
		});
		result.next();
	}
	result.close(); //make sure to close the result set
	db.close();

	return fugitiveList;
};

// we need to call this w/in this file, so set to a local variable
var add = function(_name) {
	var db = Ti.Database.open('TiBountyHunter');
	db.execute("INSERT INTO fugitives(name,captured) VALUES(?,?)",_name,0);
	db.close();

	//Dispatch a message to let others know the database has been updated
	Ti.App.fireEvent("databaseUpdated");
};
// then add to the exports list
exports.add = add;

exports.del = function(_id) {
	var db = Ti.Database.open('TiBountyHunter');
	db.execute("DELETE FROM fugitives WHERE id = ?",_id);
	db.close();

	//Dispatch a message to let others know the database has been updated
	Ti.App.fireEvent("databaseUpdated");
};

exports.bust = function(_id) {
	var db = Ti.Database.open('TiBountyHunter');
	db.execute("UPDATE fugitives SET captured = 1 WHERE id = ?",_id);
	db.close();

	//Dispatch a message to let others know the database has been updated
	Ti.App.fireEvent("databaseUpdated");
};

