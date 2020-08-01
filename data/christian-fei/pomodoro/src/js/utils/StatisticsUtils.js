angular.module('app')
.service('StatisticsUtils', function(utils){
  var self = this

  self.isPartial = function(pomodoro){
    return !!pomodoro.cancelledAt
      && pomodoro.cancelledAt>pomodoro.startedAt
      && (pomodoro.cancelledAt-pomodoro.startedAt)<25*60*1000
  }

  self.percentualValue = function(min,absoluteValue,max,margin){
    if( absoluteValue>max || absoluteValue<min ){return false}
    margin = margin || 0
    return (100-margin) * (absoluteValue - min) / (max - min) + margin/2
  }

  self.groupByProperty = function(property,data){
    return _.groupBy(data, function(pomodoro, key, list){
      return pomodoro[property]
    })
  }

  self.groupDataByDay = function(data){
    return self.groupByProperty('day', data)
  }

  self.groupDataByWeek = function(data){
    return self.groupByProperty('week', data)
  }

  self.extractByProperty = function(property,value,data){
    var query = {}
    query[property] = value
    return _.where(data, query)
  }

  self.getSingleDay = function(data, day){
    return self.extractByProperty('day', day, data)
  }

  self.getSingleWeek = function(data, week){
    return self.extractByProperty('week', week, data)
  }

  self.getTagsForData = function(data){
    return _.reduce(data, function(memo, pomodoro, key, list){
      _.each(pomodoro.tags, function(tag, key, list){
        if( memo.indexOf( tag ) === -1 ) { memo.push(tag) }
      })
      return memo
    }, [])
  }

  self.getPomodori = function(data){
    return _.reduce(data, function(memo, pomodoro, key, list){
      if( pomodoro.type==='pomodoro' ){
        if( self.isPartial(pomodoro) ){
          memo += (pomodoro.cancelledAt-pomodoro.startedAt) / (25*60*1000)
        }else{
          memo += 1
        }
      }
      return utils.trimDecimals(memo,1)
    }, 0)
  }

  self.numberOfDaysOfWorkInWeek = function(week){
    var days = _.groupBy(week, function(day, key, list){
      return day.day
    })
    return Object.keys(days).length
  }


  self.getNormalizedTimeSpan = function(firstPomodoro,lastPomodoro,_minTimeSpan){
    var minTimeSpan = _minTimeSpan ? _minTimeSpan*1000*60*60 : 1000*60*60/2

    var timeMin = firstPomodoro.startedAt
    var timeMax = lastPomodoro.startedAt + lastPomodoro.minutes*60*1000

    timeMin = moment(timeMin).startOf('hour').unix()*1000
    timeMax = moment(timeMax).endOf('hour').unix()*1000

    var timeSpan = timeMax - timeMin
    if( timeSpan < minTimeSpan ){
      timeMin -= minTimeSpan
      timeMax += minTimeSpan
    }
    return {
      timeMin: timeMin,
      timeMax: timeMax,
    }
  }
})
