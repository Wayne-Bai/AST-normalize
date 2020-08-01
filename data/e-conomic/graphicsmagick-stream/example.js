var gm = require('./')
var fs = require('fs')

var convert = gm()

fs.createReadStream('sandbox/photo.jpg')
  .pipe(convert({scale:{width:200,height:200}}))
  .pipe(fs.createWriteStream('sandbox/output.jpg'))

fs.createReadStream('sandbox/photo.jpg')
  .pipe(convert({scale:300, rotate:180, format:'png'}))
  .pipe(fs.createWriteStream('sandbox/output1.png'))
