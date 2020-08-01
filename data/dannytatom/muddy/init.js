var fs      = require('fs')
  , net     = require('net')
  , http    = require('http')
  , express = require('express')

var alias     = require('./lib/alias')
  , trigger   = require('./lib/trigger')
  , formatter = require('./lib/formatter')

var config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))
  , app    = express()
  , server = http.createServer(app)
  , io     = require('socket.io').listen(server)

var createResponse = function(command, data) {
  return { command: command, data: data }
}

var log = function(string) {
  console.log('\033[36m[ muddy ]\033[0m → ' + string)
}

app.configure(function() {
  app.set('views', __dirname + '/views')
  app.use(express.static(__dirname + '/public'))
})

app.get('/', function(req, res) {
  res.render('index.ejs', {
    layout: false,
    locals: { mud: config.name }
  })
})

io.sockets.on('connection', function(socket) {
  var mud = net.createConnection(config.port, config.host)
  mud.setEncoding('utf8')

  log(socket.id + ' connected to ' + config.host + ':' + config.port)

  mud.addListener('data', function(data) {
    var commands  = trigger.scan(data)
      , formatted = formatter.go(data)

    socket.emit('message', createResponse('updateWorld', formatted))

    if (commands) {
      for (var i = 0; i < commands.length; i++) {
        mud.write(commands[i])
      }
    }
  })

  socket.on('message', function(data) {
    if (data.match(/^;alias add/i)) {
      alias.create(data)
    } else if (data.match(/^;alias ls/i)) {
      socket.send(createResponse('listAliases', alias.list()))
    } else if (data.match(/^;alias rm/i)) {
      alias.remove(data)
    } else if (data.match(/^;trigger add/i)) {
      trigger.create(data)
    } else if (data.match(/^;trigger ls/i)) {
      socket.send(createResponse('listTriggers', trigger.list()))
    } else if (data.match(/^;trigger rm/i)) {
      trigger.remove(data)
    } else {
      mud.write(alias.format(data))
    }
  })
})

server.listen(6660)
