(function($, ko) {

  var ns = 'markerRenderer';
  
  function MarkerRenderer(canvas, palette, options) {
    var self = this;
    
    this.settings = {
      stroke: 12
    };
    
    $.extend(this.settings, options || {})
    
    this.canvas = canvas;
    this.ctx = canvas.ctx;
    this.work = canvas.workCtx;
    
    this.currentStroke = [];
    this.color = '0,0,0,0.3';
    this.maxLength = 20;
    
    this.debug = $('#workboard')[0].getContext('2d');
    
    $(document).bind(ns + '.down', function(event, position) {
      self.currentStroke = [{x: position.x, y: position.y}, {x: position.x + .1, y: position.y + .1}];
      self.stroke();
    });
    
    $(document).bind(ns + '.move', function(event, position) {
      if (self.currentStroke.length > self.maxLength) {
        self.imprint();
      }
      self.currentStroke.push({x: position.x, y: position.y});
      self.stroke();
    });
    
    $(document).bind(ns + '.up', function(event, position) {
      self.imprint();
    });
    
    $(document).bind('palette.color', function(event, color) {
      //self.color = color;
    });
  }
  
  MarkerRenderer.prototype = {
    
    _drawLine: function(ctx, points, width, color) {
      if (points.length === 0) return;
      ctx.save();
        if (color === null) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = '#000';
        }
        else {
          ctx.strokeStyle = color;
        }
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(this.currentStroke[0].x, this.currentStroke[0].y);
        for (var i = 1; i < this.currentStroke.length; i++) {
          ctx.lineTo(this.currentStroke[i].x, this.currentStroke[i].y);
        }
        ctx.stroke();
      ctx.restore();
    },
    
    stroke: function() {
      this._drawLine(this.work, this.currentStroke, 12, null);
      this._drawLine(this.work, this.currentStroke, 10, 'rgba(' + this.color + ')');
    },
    
    imprint: function() {
      this._drawLine(this.work, this.currentStroke, 12, null);
      this._drawLine(this.ctx, this.currentStroke, 10, 'rgba(' + this.color + ')');
      this.currentStroke = [];
    }
    
  }
  
  window.MarkerRenderer = MarkerRenderer;

})(jQuery, ko);