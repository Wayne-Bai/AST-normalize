parser = Npm.require('ua-parser');
geoip = Npm.require('geoip-lite');

Meteor.methods({

  /**
   * Log the initial visit
   * @param  {Obect} tracking - An object containing tracking variables
   * @return {Object}  The initial visit record
   */
  logVisit: function (tracking) {
    var h, r, visit, ip, geo, id;

    // Get the headers from the method request
    h = headers.get(this);

    // Parse the user agent from the headers
    r = parser.parse(h['user-agent']);

    // Autodetect spiders and only log visits for real users
    if (r.device != 'spider') {

      // Get the IP address from the headers
      ip = headers.methodClientIP(this);

      // Geo IP look up for the IP Address
      geo = geoip.lookup(ip);

      // Build the visit record object
      visit = {
        referer: h.referer,
        ipAddress: ip,
        userAgent:  {
          raw: r.string,
          browser: r.userAgent,
          device: r.device,
          os: r.os
        },
        trafficSource: tracking,
        geo: geo
      };

      // Insert the visit record
      id = VisitTracker.visits.insert(visit);

      visit._id = id;

      return visit

    } else {
      return 'Spider Detected'
    }
  },

  /**
   * Logs Return Visits into the visit record
   * @param  {String} id - The initial visit record id
   * @return {Object}  The updated visit record
   */
  logReturnVisit: function (id) {
    VisitTracker.visits.update(id, {$push: {returnVisits: new Date()} });
    return VisitTracker.visits.findOne(id);
  }

});