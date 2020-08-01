var Stats = Stats || {};

(function() {
  'use strict';

  Stats = {
    simpleMovingAverage: function(period) {
      var nums = [];

      return function(num) {
        var sum = 0,
            n   = period;

        nums.push(num);
        if(nums.length > period){
          nums.shift(); // remove the first element of the array
        }

        // sum all the elements in the time period
        var sum = _.reduce(nums, function(memo, num){ return memo + num; }, 0);

        if(nums.length < period){
          n = nums.length;
        }

        return sum/n;
      };
    }
  };
})();
