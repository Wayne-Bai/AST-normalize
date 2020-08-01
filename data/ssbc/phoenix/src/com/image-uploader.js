var h = require('hyperscript')
var createHash = require('multiblob/util').createHash
var pull = require('pull-stream')
var pushable = require('pull-pushable')

module.exports = function (app, opts) {
  opts = opts || {}
  
  // markup

  var fileInput = h('input', { type: 'file', accept: 'image/*', onchange: fileChosen })
  var canvas = h('canvas', { 
    onmousedown: onmousedown, 
    onmouseup:   onmouseup, 
    onmouseout:  onmouseup, 
    onmousemove: onmousemove, 
    width: 275, 
    height: 275
  })
  var zoomSlider = h('input', { type: 'range', value: 50, oninput: onresize })
  var bgColorSelect = h('input', { type: 'color', value: '#fff', onchange: draw })
  var editor = h('.image-uploader-editor',
    { style: 'display: none' },
    h('small', 'drag to crop'), h('br'),
    canvas,
    h('p', zoomSlider),
    h('p', 'Background: ', bgColorSelect),
    h('p',
      h('button.btn.btn-action.btn-strong.pull-right', { onclick: onsave }, 'Save'),
      h('button.btn.btn-action', { onclick: oncancel }, 'Cancel')))
  var el = h('.image-uploader.well',
    h('form', 
      h('label', 'Upload Picture'), h('br'),
      fileInput),
    editor)

  // handlers

  var img = h('img')
  var dragging = false, mx, my, ox=0, oy=0, zoom=1

  function draw () {
    var ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = bgColorSelect.value
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, ox, oy, img.width * zoom, img.height * zoom)

    if (dragging)
      drawHexagonOverlay()
  }
  function drawHexagonOverlay () {
    // hexagon coords (based on the behavior of the css hexagon)
    var left = 20
    var right = canvas.width - 20
    var w12 = canvas.width / 2
    var h14 = canvas.height / 4
    var h34 = h14 * 3

    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.75;
    ctx.globalCompositeOperation = 'overlay'
    ctx.beginPath()
    ctx.moveTo(w12,   0)
    ctx.lineTo(right, h14)
    ctx.lineTo(right, h34)
    ctx.lineTo(w12,   canvas.height)
    ctx.lineTo(left,  h34)
    ctx.lineTo(left,  h14)
    ctx.lineTo(w12,   0)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  function fileChosen (e) {
    var file = fileInput.files[0]
    var reader = new FileReader()
    reader.onload = function(e) {
      ox = oy = 0
      zoom = 1
      zoomSlider.value = 50
      img.src = e.target.result

      draw()
      editor.style.display = 'block'
    }
    reader.readAsDataURL(file)
  }

  function onmousedown (e) {
    e.preventDefault()
    dragging = true
    mx = e.clientX
    my = e.clientY
    draw()
  }

  function onmouseup (e) {
    e.preventDefault()
    dragging = false
    draw()
  }

  function onmousemove (e) {
    e.preventDefault()
    if (dragging) {
      ox += e.clientX - mx
      oy += e.clientY - my
      draw()
      mx = e.clientX
      my = e.clientY
    }
  }

  function onresize (e) {
    zoom = (zoomSlider.value / 50)
    draw()
  }

  function onsave (e) {
    e.preventDefault()
    if (!opts.onupload)
      throw "onupload not specified"

    var hasher = createHash()
    var ps = pushable()
    pull(
      ps,
      hasher,
      pull.map(function (buf) { return new Buffer(new Uint8Array(buf)).toString('base64') }),
      app.ssb.blobs.add(function (err) {
        if(err) return console.error(err) //:TODO:
        opts.onupload(hasher)
      })
    )

    canvas.toBlob(function (blob) {
      var reader = new FileReader()
      reader.onloadend = function () {
        ps.push(new Buffer(new Uint8Array(reader.result)))
        ps.end()
      }
      reader.readAsArrayBuffer(blob)
    }, 'image/png')
  }

  function oncancel (e) {
    e.preventDefault()
    editor.style.display = 'none'
    fileInput.value = ''
  }

  return el
}