define([
  'jquery',
  'underscore'
], function($, _) {
  
  /*
   * ResponsiveAdapter
   *
   * Knows how diverse Modules react different in some aspects to different 
   * devices.
   * Knows which preset to choose for the device on which we are. 
   * i.e. replaces large with large_phone
   *
   */
  var ResponsiveAdapter = {

    /*
     * Mediatype is defined in devices.css with media queries. 
     * Default values for media types are 'desktop', 'pads', 'phones'
     */
    getMediaType: function() {
      if (this.mediaType) {
        return this.mediaType;
      } else {
        if (!window.getComputedStyle) {
          return this.mediaType = 'desktop'; // jshint ignore:line
        }
        var mt = window.getComputedStyle(document.body,':after')
          .getPropertyValue('content').match(/[a-zA-Z_\-0-9]+/g);

        return this.mediaType = mt && mt.length>0 ? mt[0] : 'desktop'; // jshint ignore:line
      }
    },
    
    /*
     * Expects an options-Hash opts and a key of this Hash. The described value 
     * can be a directly returned single value or an object Hash with the
     * mediaTypes managed by this adapter as keys.
     */
    getOptionByMediaType: function(opts, key) {
      if ($.isPlainObject(opts[key])) {
        return opts[key][this.getMediaType()];
      } else {
        return opts[key];
      }
    },
    
    presetMapperThumb: function(imageModel) {
      var preset;
      switch(this.getMediaType()) {
        case 'desktop':
        case 'pad':
        case 'phone':
          preset = imageModel.get('thumb');
          break;
      }
      return preset;
    },

    presetMapperLarge: function(imageModel) {
      var preset;
      switch(this.getMediaType()) {
        case 'desktop':
          preset = imageModel.get('large');
          break;
        case 'pad':
          preset = imageModel.get('large_pads');
          break;
        case 'phone':
          preset = imageModel.get('large_phones');
          break;
      }
      return preset;
    }
    
  };
  
  return ResponsiveAdapter;
});
