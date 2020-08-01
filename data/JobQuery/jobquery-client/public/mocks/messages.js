var messages = [];

for(var i = 1; i < 50; i++){
  var date = faker.Date.recent(5);
  messages.push({
    _id: i,
    from: faker.Internet.email(),
    to: faker.Internet.email(),
    text: faker.Lorem.paragraph(),
    createdAt: date,
    updatedAt: date
  });
}

var message = messages[0];