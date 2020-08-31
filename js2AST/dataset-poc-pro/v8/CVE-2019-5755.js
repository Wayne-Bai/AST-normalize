function foo(trigger) {
  return (trigger ? -0 : 0) - 0;
}

assertEquals(0, foo(false));
%OptimizeFunctionOnNextCall(foo);
assertEquals(-0, foo(true)); // Failure: expected <-0> found <0>
