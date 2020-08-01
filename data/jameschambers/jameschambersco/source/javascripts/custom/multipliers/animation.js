// -------------------------------------------------
//
// Parenting Javascript animation demo
// 
// -------------------------------------------------

var animation = (function() {

  // -------------------------------------------------
  //
  // Sets up the attributes for the demo
  // 
  // -------------------------------------------------


  var CONFIG = {
    'tempo': 1,
    'masterTempo': 0.005,
    'stage': {
      'width': 538,
      'height': 335
    }
  };

  var STATES = {
    'increment': 0
  };


  // -------------------------------------------------
  //
  // Set up models for segments
  // 
  // -------------------------------------------------

  var Head_model = Backbone.Model.extend({
    defaults: {
      'length': 130,
      'width': 130,
      'height': 0,
      'color': '#fff',
      'topPin': 10,
      'bottomPin': 10,
      'amount': 120,
      'angle': 90,
      'multiplier': 1,
      'parented': true
    }
  });

  var Neck_model = Backbone.Model.extend({
    defaults: {
      'length': 120,
      'width': 15,
      'height': 0, // Unused? 
      'color': '#ddd',
      'topPin': 10,
      'bottomPin': 10,
      'x': (CONFIG.stage.width / 2),
      'y': CONFIG.stage.height,
      'amount': 90,
      'angle': 90,
      'multiplier': 1,
      'parented': true
    }
  });


  // -------------------------------------------------
  //
  // Creates a sketch context
  // 
  // -------------------------------------------------

  function create_sketch_context($container) {

    return Sketch.create({
      'container': $container,
      'globals': false,
      'fullscreen': false,
      'width': CONFIG.stage.width,
      'height': CONFIG.stage.height
    });

  }


  // -------------------------------------------------
  //
  // Reach a segment to a point
  // 
  // -------------------------------------------------

  function reach(segment, xpos, ypos) {

    var dx = xpos - segment.x,
      dy = ypos - segment.y;

    segment.rotation = Math.atan2(dy, dx);

    if (segment.rotation < 0) {
      segment.rotation += 2 * Math.PI;
    }

    var w = segment.getPin().x - segment.x,
      h = segment.getPin().y - segment.y;

    return {
      x: xpos - w,
      y: ypos - h
    };

  }


  // -------------------------------------------------
  //
  // Draw loop
  // 
  // -------------------------------------------------

  function draw(options) {

    var ctx,
      head,
      neck,
      neck_reach_x,
      neck_reach_y;

    // Create the models for head/neck, passing
    // in the custom model attributes if different
    var neck_model = new Neck_model(options.neck);
    var head_model = new Head_model(options.head);

    // Set up the range input
    // Setup the sketch context
    ctx = create_sketch_context($('.js-parenting-' + options.id)[0]);
    // Set up head
    head = new Segment(head_model.attributes);
    // Set up neck
    neck = new Segment(neck_model.attributes);

    // 
    // Set the movement range values to the initial defaults...
    // 
    $('.js-amount-' + options.id + '[name="head"]').val(head_model.get('amount'));
    $('.js-amount-' + options.id + '[name="neck"]').val(neck_model.get('amount'));

    // Set up the ranger function for custom ranges
    $('.js-amount-' + options.id).ranger({
      label: false
    });

    // Update the movement amount when the range inputs change
    $('.js-amount-' + options.id).bind('change', function(e) {
      var $elem = $(e.currentTarget);
      var model = ($elem.attr('name') == 'head') ? head_model : neck_model;
      model.set('amount', $elem.val());
    });

    // Update the movement amount when the range inputs change
    $('.js-checkbox-' + options.id).bind('change', function(e) {
      head_model.set('parented', this.checked);
    });

    // 
    // Set the multiplier values (if there are any)
    // 


    // Update the movement amount when the range inputs change
    $('.js-multiplier-' + options.id).bind('change', function(e) {
      var $elem = $(e.currentTarget);
      var model = ($elem.attr('name') == 'head') ? head_model : neck_model;
      model.set('multiplier', $elem.val());
    });

    // Set the multiplier values
    $('.js-multiplier-' + options.id + '[name="head"] > option[value="' + head_model.get('multiplier').toFixed(1) + '"]').attr("selected", true);
    $('.js-multiplier-' + options.id + '[name="neck"] > option[value="' + neck_model.get('multiplier').toFixed(1) + '"]').attr("selected", true);

    // Set the formstone plugin
    $('.js-multiplier-' + options.id).selecter({});


    // Draw loop
    ctx.draw = function() {

      // Neck
      var neck_pos = draw_segment_at_position({
        context: ctx,
        element: neck,
        segment: neck_model.attributes,
        has_parenting: options.has_parenting
      });

      // Head
      draw_segment_at_position({
        context: ctx,
        element: head,
        segment: head_model.attributes,
        has_parenting: options.has_parenting,
        parent: neck_pos
      });

      // Update the increment value
      STATES.increment = new Date().getTime() * (CONFIG.tempo * CONFIG.masterTempo);

    }

  }

  // -------------------------------------------------
  //
  // Pin Length - gets the inner length of a segment 
  // for use in positioning it's children
  // 
  // -------------------------------------------------

  function pinLength(segment) {

    return segment.length - segment.topPin - segment.bottomPin;

  }


  // -------------------------------------------------
  //
  // Moves a segment. Accepts an options object:
  // 
  // - context: to draw onto
  // - element: to move
  // - segment: object with attrs which define @segment
  // - parent: optional. Parent object to move from. 
  // 
  // -------------------------------------------------

  function draw_segment_at_position(options) {

    // Reach
    var amplitude = ((options.segment.amount) * (Math.PI / 180)) / 2;
    var startPoint = (180 + parseInt(options.segment.angle, 10));
    var amp = (amplitude * Math.sin(STATES.increment * options.segment.multiplier));

    // Set the Angle & End Point
    var thetaAngle = (startPoint * (Math.PI / 180)) + amp;

    // Set the position of the element
    if (String(options.parent) !== 'undefined') {

      // Apply parenting? 
      if (options.segment.parented == true) {
        thetaAngle = (thetaAngle + options.parent.theta) - (270 * (Math.PI / 180));
      }

      // Set the origin of the element to that of the parent
      options.element.x = options.parent.x;
      options.element.y = options.parent.y;

    } else {

      options.element.x = options.segment.x;
      options.element.y = options.segment.y;

    }

    var endPointX = options.element.x + (pinLength(options.segment) * Math.cos(thetaAngle));
    var endPointY = options.element.y + (pinLength(options.segment) * Math.sin(thetaAngle));
    var destinationPos = reach(options.element, endPointX, endPointY);

    // Draw
    options.element.draw(options.context);

    // Return values so we can position any 
    // subsequent child elements 
    return {
      theta: thetaAngle,
      x: endPointX,
      y: endPointY
    };

  }

  // Expose public methods
  return {
    draw: draw
  };

})();


// -------------------------------------------------
//
// Sets up the demos
// 
// -------------------------------------------------

// parenting.draw({
//   id: 1,
//   neck: {
//     amount: 50,
//     multiplier: 1,
//     parented: true
//   },
//   head: {
//     amount: 70,
//     multiplier: 1,
//     parented: true
//   }
// });


animation.draw({
  id: 2,
  neck: {
    amount: 50,
    multiplier: 1.0
  },
  head: {
    amount: 40,
    multiplier: 3.0
  }
});