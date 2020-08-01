angular.module('app')
.service('Statistics', function($q,StatisticsUtils,Graph,utils){
  var self = this

  self.getStatisticsForDay = function(day){
    var data = {}

    data.pomodori = StatisticsUtils.getPomodori( day )
    data.pomodoriFull = Math.round(data.pomodori)
    data.hoursWorked = utils.trimDecimals(data.pomodoriFull*25/60,1)
    data.recordedDistractions = _.reduce(day, function(memo, pomodoro, key, list){
      return memo + pomodoro.distractions.length
    }, 0)

    data.tags = StatisticsUtils.getTagsForData( day )
    data.graph = Graph.getGraphData( day )

    return data
  }

  self.getTagsForWeek = function(week){
    return StatisticsUtils.getTagsForData( week )
  }

  self.getStatisticsForWeek = function(week){
    var data = {}

    data.pomodori = StatisticsUtils.getPomodori( week )
    data.pomodoriFull = Math.round(data.pomodori)
    data.avgPomodoriPerDay = utils.trimDecimals(data.pomodori / StatisticsUtils.numberOfDaysOfWorkInWeek(week), 1) || 0
    data.hoursWorked = utils.trimDecimals(data.pomodoriFull*25/60,1)
    data.avgHoursWorkedPerDay = utils.trimDecimals(data.hoursWorked / StatisticsUtils.numberOfDaysOfWorkInWeek(week), 1) || 0
    data.recordedDistractions = _.reduce(week, function(memo, pomodoro, key, list){
      return memo + pomodoro.distractions.length
    }, 0)
    data.avgRecordedDistractionsPerDay = utils.trimDecimals(data.recordedDistractions / StatisticsUtils.numberOfDaysOfWorkInWeek(week), 1) || 0

    data.tags = StatisticsUtils.getTagsForData( week )

    return data
  }
})
