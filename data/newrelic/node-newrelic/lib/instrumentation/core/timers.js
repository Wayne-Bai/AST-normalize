'use strict'

var wrap = require('../../shimmer').wrapMethod

module.exports = initialize

function initialize(agent, timers) {
  var processMethods = ['nextTick', '_nextDomainTick', '_tickDomainCallback']

  wrap(process, 'process', processMethods, function bindProcess(original) {
    return function nextTickWrapper(fn) {
      return original(agent.tracer.bindFunction(fn))
    }
  })

  var asynchronizers = [
    'setTimeout',
    'setInterval',
  ]

  wrap(timers, 'timers', asynchronizers, function wrapTimers(original, method) {
    return agent.tracer.wrapFunctionFirst('timers.' + method, null, original)
  })

  //We don't want to create segments for setImmediate calls, as the
  //object allocation may incur too much overhead in some situations
  var uninstrumented = [
    'setImmediate',
  ]

  wrap(timers, 'timers', uninstrumented, function wrapUninstrumented(original, method) {
    return agent.tracer.wrapFunctionFirstNoSegment(original, method)
  })

  var clearTimeouts = ['clearTimeout', 'clearImmediate']

  wrap(timers, 'timers', clearTimeouts, function wrapClear(original) {
    return function wrappedClear(timer) {
      var segment
      if (timer && timer._onTimeout) {
        segment = agent.tracer.getSegmentFromWrapped(timer._onTimeout)
        timer._onTimeout = agent.tracer.getOriginal(timer._onTimeout)
      }

      if (timer && timer._onImmediate) {
        timer._onImmediate = agent.tracer.getOriginal(timer._onImmediate)
      }

      if (segment) segment.ignore = true

      return original.apply(this, arguments)
    }
  })
}
