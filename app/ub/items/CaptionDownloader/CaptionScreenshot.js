const CONFIG = require('./../../../../config-json.js')
const ShellSpawnQueue = require('../../../lib/ShellSpawnQueue.js')
const fs = require('fs')

let main = async function (utID, time) {

  time = parseInt(time, 10)
  if (fs.existsSync(`/output/file-cache/${utID}_${time}.jpg`) === false) {
    // console.log(`/file-cache/${utID}_${time}.jpg`)
    fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 
    await ShellSpawnQueue([`python3`, `/app/python/screenshot.py`, `"${utID}"`, time])
    fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 
  }

  return {
    text: `<p><img src="${CONFIG.publicURL}file-cache/${utID}_${time}.jpg" /></p>`, 
    start: time
  }
}

module.exports = main