module.exports = exports = data = {};

data.valid = {
  user:         null,
  opportunity:          null,
  isProcessed:    true,
  userInterest:   1,
  adminOverride:  4
};

data.valid2 = {
  user:         null,
  opportunity:          null,
  isProcessed:    true,
  userInterest:   3,
  adminOverride:  1
};

data.valid3 = {
  user:         null,
  opportunity:          null,
  isProcessed:    false,
  userInterest:   4
};

data.valid4 = {
  user:         null,
  opportunity:          null,
  isProcessed:    false,
  userInterest:   2
};

data.invalid = {};

data.invalid.userInterestMax = {
  user:         null,
  opportunity:          null,
  userInterest:   5
};

data.invalid.userInterestMin = {
  user:         null,
  opportunity:          null,
  userInterest:   -1
};

data.invalid.adminOverrideMax = {
  user:         null,
  opportunity:          null,
  adminOverride:  5
};

data.invalid.adminOverrideMin = {
  user:         null,
  opportunity:          null,
  adminOverride:  -1
};

