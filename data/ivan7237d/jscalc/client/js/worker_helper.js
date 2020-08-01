
/**
 * Worker script used on IE.
 */

self.onmessage = function(e) {
  self.onmessage = null;
  eval(e.data);
};
