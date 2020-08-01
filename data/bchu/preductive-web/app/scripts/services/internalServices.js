//0-5 = 30 min
//6-10 = 45min
//11-15 = 1hr
//16-20 = 2hr
//21-25 = 4hr
//26-30 = 6hr
//31-35 = Half day
//36-40 = All day
//41-45 = 2 days
//46-50 = 4 days
//51-55 = all week
//56-60 = 2 weeks
//61-65 = 1 month
//66-75 = a long time
//76-85 = I don't know
angular.module('todoWebApp')
  .factory('ReadableDuration', function() {
    return {
      //pos will be from 0 to 100
      durationFromSlider: function(pos, textOnly) {
        var duration;
        var output = '';
        pos = pos / 100 * 85;

        if (pos < 5) {
          output = '30 minutes';
          duration = {minutes:30};
        }
        else if (pos < 10) {
          output = '45 minutes';
          duration = {minutes:45};
        }
        else if (pos < 15) {
          duration = {hours:1};
          output = '1 hour';
        }
        else if (pos < 20) {
          output = '2 hours';
          duration = {hours:2};
        }
        else if (pos < 25) {
          output = '4 hours';
          duration = {hours:4};
        }
        else if (pos < 30) {
          output = '6 hours';
          duration = {hours:6};
        }
        else if (pos < 35) {
          output = 'Half day';
          duration = {hours:10};
        }
        else if (pos < 40) {
          output = 'All day';
          duration = {days:1};
        }
        else if (pos < 45) {
          output = '2 days';
          duration = {days:2};
        }
        else if (pos < 50) {
          output = '4 days';
          duration = {days:4};
        }
        else if (pos < 55) {
          output = '1 week';
          duration = {weeks:1};
        }
        else if (pos < 60) {
          output = '2 weeks';
          duration = {weeks:2};
        }
        else if (pos < 65) {
          output = '1 month';
          duration = {months:1};
        }
        else if (pos < 75) {
          output = 'A long time';
          duration = -1;
        }
        else if (pos <= 85) {
          output = "I don't know";
          duration = -2;
        }
        if (textOnly) {
          return output;
        }
        if (duration !== -1 && duration !== -2) {
          return moment.duration(duration);
        }
        return duration;
      }
    };
  })

//0-5 = 15 min
//5-15 = 30 min
//15-20 = 45 min
//25-30 = 1 hour
//30-35 = 2 hours
//35-40 = 3 hours
//40-45 = 4 hours
//45-50 = 6 hours
//50-55 = 8 hours
//55-60 = All day
//60-65 = 2 days
  .factory('ReadableChunk', function() {
    return {
      //pos will be from 0 to 100
      durationFromSlider: function(pos, textOnly) {
        var duration;
        var output = '';
        pos = pos / 100 * 65;

        if (pos < 5) {
          output = '15 minutes';
          duration = {minutes:15};
        }
        else if (pos < 15) {
          output = '30 minutes';
          duration = {minutes:30};
        }
        else if (pos < 20) {
          duration = {minutes:45};
          output = '45 minutes';
        }
        else if (pos < 30) {
          output = '1 hour';
          duration = {hour:1};
        }
        else if (pos < 35) {
          output = '2 hours';
          duration = {hour:2};
        }
        else if (pos < 40) {
          output = '3 hours';
          duration = {hour:3};
        }
        else if (pos < 45) {
          output = '4 hours';
          duration = {hour:4};
        }
        else if (pos < 50) {
          output = '6 hours';
          duration = {hour:6};
        }
        else if (pos < 55) {
          output = '8 hours';
          duration = {hour:8};
        }
        else if (pos < 60) {
          output = 'All day';
          duration = {day:1};
        }
        else if (pos <= 65) {
          output = '2 days';
          duration = {day:2};
        }
        if (textOnly) {
          return output;
        }
        return duration;
      }
    };
  });