exports.checkin = {
	id: function(data){
		return data.checkin_id;
	}
};

exports.event = {
};

exports.group = {
};

exports.photo = {
	id: function(data){
		return data.photo_id;
	}
};

exports.member = {
};

exports.defaults = {
  groups: 'group',
  photos: 'photo',
  events: 'event',
  checkins: 'checkin',
  self: 'member'
};
