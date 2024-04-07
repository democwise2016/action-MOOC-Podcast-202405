const ShellSpawn = require('./ShellSpawn.js')
const fs = require('fs')

let isRunning = false
let sleep = function (ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function (cmdArray, stderrHandler, errorHandler) {
  while (isRunning === true) {
    await sleep(1000)
    fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 
  }

  isRunning = true
  // console.log(cmdArray)
  
  let result = await ShellSpawn(cmdArray, stderrHandler, errorHandler)
  fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 
  isRunning = false

  return result
}
