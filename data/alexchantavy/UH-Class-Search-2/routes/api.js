var dbAccess = require('../backend/db-access.js');

// not really used
module.exports.courses = function(req, res) {
  dbAccess.getAllCourses(false, function(err, docs) {
    if (err) {
      console.log(JSON.stringify(err, undefined, 2));
      res.send('error!');
    } else {
      // send docs up to index `cursor`
      var from = req.query.from;
      var to = req.query.to

      if (from
          && !to
          && from < docs.length 
          && from >= 0) {

        res.json(docs.slice(from));

      } else if (from 
               && to 
               && from < docs.length 
               && to < docs.length
               && from >= 0 
               && to > 0) {

        res.json(docs.slice(from, to))

      } else {
        res.json(docs);
      }

    }
  });    
};


/**
 *  List of possible GET params:
 *  genEdFocus
 *  course
 *  credits
 *  days
 *  start
 *  end
 *  seatsAvail 
 **/
module.exports.search = function(req, res) {
  // build our options object from the get params

  var opts = {};

  if (req.query.campus != null) {
    switch(req.query.campus) {
      case 'Any':
        break;
      case 'UH Manoa': 
        opts.campus = 'MAN';
        break;
      case 'Hawaii CC': 
        opts.campus = 'HAW';
        break;
      case 'Honolulu CC': 
        opts.campus = 'HON';
        break;
      case 'Kauai CC': 
        opts.campus = 'KAU';
        break;
      case 'Leeward CC': 
        opts.campus = 'LEE';
        break;
      case 'UH Hilo': 
        opts.campus = 'HIL';
        break;
      case 'Kapiolani CC': 
        opts.campus = 'KAP';
        break;                        
      case 'Maui CC': 
        opts.campus = 'MAU';
        break;            
      case 'UH West Oahu': 
        opts.campus = 'WOA';
        break;            
      case 'Windward CC': 
        opts.campus = 'WIN';
        break;            
      default: break;
    }
  }

  if (req.query.genEdFocus != null && req.query.genEdFocus != '' &&
      req.query.genEdFocus != 'Any') {
    opts.genEdFocus = req.query.genEdFocus;
  }
  if (req.query.course != null && req.query.course != '' &&
      req.query.course != 'Any') {
    opts.course = req.query.course;
  }
  if (req.query.credits != null && req.query.credits != '' &&
      req.query.credits != 'Any') {
    opts.credits = req.query.credits;
  }
  if (req.query.days != null && req.query.days != '' &&
      req.query.days != 'Any') {
    opts.days = req.query.days;
  }
  if (req.query.start != null && req.query.start != '' && 
      req.query.start != 'Any') {
    opts.start = req.query.start;
  }
  if (req.query.end != null && req.query.end != '' &&
      req.query.end != 'Any') {
    opts.end = req.query.end;
  }
  if (req.query.seatsAvail != null && req.query.seatsAvail != '') {
    opts.seatsAvail = true;
  }
  if (req.query.instructor != null && req.query.instructor != '') {
    opts.instructor = req.query.instructor;
  }
  console.log(opts);
  // run the query
  dbAccess.get(opts, false, function(err, courses) {
    if (err) {
      console.log('ho someting wen break.');
      console.log(err);
      if (err.message == 'noCriteriaGiven') {
        res.render('gopicksearch');
      }
    } else {
      res.render('table', {"courses": courses});
    }
  });
};