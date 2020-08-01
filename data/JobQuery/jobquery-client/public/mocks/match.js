var matches = [];

for(var i = 1; i < 50; i++){
  var usedIds = {};
  var date = faker.Date.recent(5);
  for(var j = 0; j < 30; j++){
    var index = Math.floor((Math.random() * 50) + 1);
    usedIds[index] = true;
  }

  var oppIds = Object.keys(usedIds);
  for(var j = 0; j < oppIds.length; j++){
    matches.push({
      userId: i,
      oppId: parseInt(oppIds[j]),
      userInterest: Math.floor((Math.random() * 4) + 1),
      answers: [],
      createdAt: date,
      updatedAt: date
    });
  }
}