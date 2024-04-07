const fs = require('fs')
// const UBVideoIdParser = require('./UBVideoIdParser.js')
const ShellSpawn = require('./../../lib/ShellSpawn.js')
const CONFIG = require('../../../config.js')

module.exports = async function (feedFilename, itemID, dateString) {
  if (fs.existsSync(`/output/${feedFilename}`) === false) {
    await ShellSpawn(`mkdir -p /output/${feedFilename}`)
  }

  let filename = `${itemID}.mp3`
  if (dateString) {
    filename = dateString + '-' + filename
  }

  return {
    localPath: `/output/${feedFilename}/${filename}`,
    publicPath: CONFIG.publicURL + `${feedFilename}/${filename}`,
  }
}