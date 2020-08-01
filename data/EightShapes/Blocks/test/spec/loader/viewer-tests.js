'use strict';

describe("Blocks viewer frames a component", function() {
  beforeEach(function(done) {
    setTimeout(function () {
      done();
    }, 300);
  });

  it("with a container", function (done) {
    expect($('#base .b-viewer_container')).toBeInDOM();
    done();
  });

  it('with a responsive selector if data-frame-resizable="true"', function (done) {
    expect($('#base .b-viewer_container.is-resizable')).toBeInDOM();
    expect($('#base .b-viewer_container .b-responsive_sizes')).toBeInDOM();
    expect($('#base .b-frame_container.ui-resizable')).toBeInDOM();
    done();
  });

  it('with an iframe', function (done) {
    expect($('#base .b-viewer_container iframe')).toBeInDOM();
    expect(window['header-frame-1'].src).toEqual('http://localhost/prototypes/Blocks/test/viewer-template.html');
    done();
  });
});

describe("Blocks viewer loads a component inside an iframe", function() {
  beforeEach(function(done) {
    setTimeout(function () {
      done();
    }, 800);
  });

/*
TODO: Figure out how to inspect the iframe
  it('and loads the component in the iframe', function (done) {
    expect($('#base .b-viewer_container iframe .l-header')).toBeInDOM();
    expect($('#base .b-viewer_container iframe .l-header.with-content.json-from-config .name')).toHaveText('Nathan Curtis');
    done();
  });
*/
});
