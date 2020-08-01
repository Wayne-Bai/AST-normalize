require('sproutcore-jui/mixins/widget');
require('sproutcore-jui/mixins/target_support');
require('sproutcore-jui/jquery-ui/jquery.ui.dialog');
require('sproutcore-jui/jquery-ui/ext/jquery.ui.dialog');

var get = SC.get, set = SC.set;

/**
  @class
  @since SproutCore JUI 1.0
  @extends JUI.DialogButton
*/
JUI.DialogButton = SC.Object.extend(JUI.TargetSupport, {
  title: 'OK',
  action: 'close',
  executeAction: function() {
    this._super(get(this, 'action'));
  }
});

/**
  @class
  @since SproutCore JUI 1.0
  @extends JUI.Dialog
*/
JUI.Dialog = SC.View.extend(JUI.Widget, JUI.TargetSupport, {
  uiType: 'dialog',
  uiEvents: ['beforeClose'],
  uiOptions: ['title', '_buttons', 'position', 'closeOnEscape',
    'modal', 'draggable', 'resizable', 'autoReposition',
    'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight'],

  isOpen: false,
  message: '',
  buttons: [],

  defaultTemplate: SC.Handlebars.compile('<p>{{message}}</p>'),

  open: function() {
    if (get(this, 'state') !== 'inDOM') {
      this._insertElementLater(SC.K);
    } else {
      get(this, 'ui').open();
    }
  },

  close: function() {
    get(this, 'ui').close();
  },

  didInsertElement: function() {
    this._super();
    get(this, 'ui')._bind({
      dialogopen: $.proxy(this._open, this),
      dialogclose: $.proxy(this._close, this)
    });
  },

  _buttons: function() {
    return get(this, 'buttons').map(this._buildButton, this);
  }.property('buttons').cacheable(),

  _buildButton: function(buttonPath) {
    var button = this.getPath(buttonPath);
    if (!button.isInstance) {
      button = button.create({
        target: get(this, 'targetObject') || this
      });
      set(this, buttonPath, button);
    }
    var props = {text: get(button, 'title')};
    props.click = $.proxy(button, 'executeAction')
    return props;
  },

  _open: function() {
    set(this, 'isOpen', true);
    this.didOpenDialog();
  },

  _close: function() {
    set(this, 'isOpen', false);
    this.didCloseDialog();
  },

  didOpenDialog: SC.K,
  didCloseDialog: SC.K
});

JUI.Dialog.close = function() {
  $('.ui-dialog-content:visible').dialog('close');
};

JUI.ModalDialog = JUI.Dialog.extend({
  buttons: ['ok'],
  ok: JUI.DialogButton,
  resizable: false,
  draggable: false,
  modal: true
});

JUI.AlertDialog = JUI.ModalDialog.create({
  open: function(message, title, icon) {
    set(this, 'title', title);
    set(this, 'message', message);
    set(this, 'icon', icon);
    this._super();
  },
  info: function(message, title) {
    this.open(message, title, 'info');
  },
  error: function(message, title) {
    this.open(message, title, 'error');
  }
});

JUI.ConfirmDialog = JUI.ModalDialog.create(JUI.TargetSupport, {
  buttons: ['yes', 'no'],
  yes: JUI.DialogButton.extend({
    title: 'YES',
    action: 'didConfirm'
  }),
  no: JUI.DialogButton.extend({title: 'NO'}),
  didConfirm: function() {
    get(this, 'answer').resolve();
    this.close();
  },
  didCloseDialog: function() {
    var answer = get(this, 'answer');
    if (answer && !answer.isResolved()) {
      answer.reject();
    }
    set(this, 'answer', null);
  },
  open: function(message, title, target, action) {
    var answer = SC.$.Deferred();
    set(this, 'answer', answer);
    set(this, 'title', title);
    set(this, 'message', message);

    if (!action) {
      action = target;
      target = this;
    }
    if (typeof action === 'string') {
      action = target[action];
    }
    answer.done(function() {
      action.call(target, true);
    });
    answer.fail(function() {
      action.call(target, false);
    });

    this._super();
  }
});
