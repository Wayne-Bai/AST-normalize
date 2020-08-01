import StateMachine from 'torii/lib/state-machine';

module('State Machine - Unit', {
  setup: function(){
  }
});

test("can transition from one state to another", function(){
  var sm = new StateMachine({
    initialState: 'initial',
    states: {
      initial: {
        foo: 'bar'
      },
      started: {
        baz: 'blah'
      }
    }
  });

  equal(sm.currentStateName, 'initial');
  equal(sm.state.foo, 'bar');
  ok(!sm.state.baz, 'has no baz state when initial');

  sm.transitionTo('started');
  equal(sm.currentStateName, 'started');
  equal(sm.state.baz, 'blah');
  ok(!sm.state.foo, 'has no foo state when started');
});
