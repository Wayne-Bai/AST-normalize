var string = '1 string to rule them all'

var leakyArr = []
var count = 2
setInterval(function () {
  leakyArr.push(string.replace(/1/g, count++))
}, 0)

setInterval(function () {
  gc()
  console.log(process.memoryUsage())
}, 2000)
