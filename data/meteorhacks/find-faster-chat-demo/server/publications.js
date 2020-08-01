Meteor.publish('group', function(group) {
  return Chats.find({group: group}, {
    sort: {timestamp: -1},
    limit: 100
  });
});

