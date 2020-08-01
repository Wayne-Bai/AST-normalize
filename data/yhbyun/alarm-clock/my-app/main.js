var app      = require('app')
  , Menu     = require('menu')
  , MenuItem = require('menu-item')
  , BW       = require('browser-window')
  , ipc      = require('ipc')
  , dialog   = require('dialog')
  , path     = require('path')
  , win;

var volume = 35;

app.commandLine.appendSwitch('enable-transparent-visuals');

app.on('ready', function() {
  win = new BW({
    width  : 400,
    height : 600,
    frame: false,
    title: 'Alarm Clock'
  });

  win.on('closed', function() {
    win = null;
  });

  win.loadUrl('file://' + __dirname + '/index.html');
  win.show();

  var menu_tmpl = [{
    label: 'Alarm Clock',
    submenu: [{
      label: 'Preferences...',
      accelerator: 'Command+,',
      click: function() {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Waring',
          buttons: ['OK'],
          message: 'not implemented yet'
        });
      }
    }, {
      type: 'separator'
    }, {
      label: 'Reload',
      accelerator: 'Command+R',
      click: function() {
        win.reload();
      }
    }, {
      label: 'Toggle DevTools',
      accelerator: 'Alt+Command+I',
      click: function() {
        win.toggleDevTools();
      }
    }, {
      type: 'separator'
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function() { app.quit(); }
    }]
  }];
  menu = Menu.buildFromTemplate(menu_tmpl);
  Menu.setApplicationMenu(menu);

  /**
   * @param {browser-window} win, target window to send console log message two.
   * @param {String} msg, the message we are sending.
   */
  console.send = function(win, msg) {
    win.webContents.on('did-finish-load', function() {
      win.webContents.send('send-console', msg);
    });
  }

});

ipc.on('asynchronous-message', function(event, arg) {
  var files, file;

  switch (arg) {
    case 'select-file':
      if (files = dialog.showOpenDialog({
        title: 'Select MP3 File',
        filters: [{name: "MP3 Files", extensions:['mp3']}],
        properties :  ['openFile']
      })) {
        file = files[0];
        if (path.extname(file) === '.mp3') {
          event.sender.send('asynchronous-reply', file);
        } else {
          dialog.showMessageBox({
            type: 'warning',
            title: 'Waring',
            buttons: ['OK'],
            message: '\'' + file + '\'' + ' is not a mp3 file.'
          });
        }
      }
      break;
  }
});

