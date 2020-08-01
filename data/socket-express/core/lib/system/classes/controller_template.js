module.exports = {
  $deps: ['View'],
  $extend: 'Controller',
  before: function($super, req, res) {
    $super(req, res);
    if (this.autoRender) {
      this.template = this.$.View.factory();
    }
  },
  after: function($super, req, res) {
    $super(req, res);
  },
  autoRender: true,
  template: 'template'
};
