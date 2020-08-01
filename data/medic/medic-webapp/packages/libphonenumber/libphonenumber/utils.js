var i18n = require('libphonenumber/phoneformat'),
    standardFormat = i18n.phonenumbers.PhoneNumberFormat.E164;

var _cleanPhone = function(phone) {
  phone = phone.replace(/[^\d\+]/g, '');
  var prefix = phone.substr(0, 1) === '+' ? '+' : '';
  phone = phone.replace(/[^\d]/g, '');
  return prefix + phone;
};

var _init = function(settings, phone) {
  return {
    util: i18n.phonenumbers.PhoneNumberUtil.getInstance(),
    phone: _cleanPhone(phone),
    countryCode: settings && settings.default_country_code,
    country: function() {
      return this.util.getRegionCodeForCountryCode(this.countryCode);
    },
    parse: function() {
      return this.util.parseAndKeepRawInput(this.phone, this.country());
    },
    format: function() {
      return this.util.format(this.parse(), standardFormat).toString();
    },
    validate: function() {
      return this.util.isValidNumber(this.parse());
    }
  };
};

exports.format = function(settings, phone) {
  try {
    return _init(settings, phone).format();
  } catch (e) {}
  return false;
};

exports.validate = function(settings, phone) {
  try {
    return _init(settings, phone).validate();
  } catch (e) {}
  return false;
};
