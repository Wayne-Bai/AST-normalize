module.exports = exports = data = {};

data.valid = {
  name:             'CSS',
  label:            'Rate your CSS ability',
  type:             'scale',
  position:         1
};

data.valid2 = {
  name:             'UX',
  label:            'Rate your UX ability',
  type:             'scale',
  position:         1
};

data.valid3 = {
  name:             'AngularJS',
  label:            'Rate your AngularJS ability',
  type:             'scale',
  position:         1
};

data.valid4 = {
  name:             'Node.js/Express',
  label:            'Rate your Node.js/Express ability',
  type:             'scale',
  position:         1
};

data.valid5 = {
  name:             'Backbone',
  label:            'Rate your Backbone ability',
  type:             'scale',
  position:         1
};

data.valid6 = {
  name:             'HTML',
  label:            'Rate your HTML ability',
  type:             'scale',
  position:         1
};

data.missing = {};

data.missing.name = {
  label:            'Rate your CSS ability',
  type:             'scale',
  position:         1
};

data.missing.label = {
  name:             'CSS',
  type:             'scale',
  position:         1
};

data.invalid = {};

data.invalid.name = {
  name:             Number(123),
  label:            'Rate your CSS ability',
  type:             'scale',
  position:         1
};

data.invalid.isPublic = {
  name:             'CSS',
  label:            'Rate your CSS ability',
  type:             'scale',
  position:         1,
  isPublic:         'notvalid'
};

data.mixedScale = {
  name:             'CSS',
  label:            'Rate your CSS ability',
  scaleDescription: [123, true, 'undefined', null, 'extra long'],
  isPublic:         'notvalid',
  position:         1,
};
