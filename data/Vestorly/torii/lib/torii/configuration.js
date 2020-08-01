var get = Ember.get;

var configuration       = get(window, 'ENV.torii') || {};
configuration.providers = configuration.providers || {};

function configurable(configKey, defaultValue){
  return Ember.computed(function(){
    var namespace = this.get('configNamespace'),
        fullKey   = namespace ? [namespace, configKey].join('.') : configKey,
        value     = get(configuration, fullKey);
    if (typeof value === 'undefined') {
      if (typeof defaultValue !== 'undefined') {
        if (typeof defaultValue === 'function') {
          return defaultValue.call(this);
        } else {
          return defaultValue;
        }
      } else {
        throw new Error("Expected configuration value "+fullKey+" to be defined!");
      }
    }
    return value;
  });
}

export {configurable};

export default configuration;
