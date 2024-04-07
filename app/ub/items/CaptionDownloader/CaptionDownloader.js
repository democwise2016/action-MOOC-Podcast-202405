const NodeCacheSqlite = require('../../../lib/NodeCacheSqlite.js')
const ShellSpawnQueue = require('../../../lib/ShellSpawnQueue.js')
const CaptionFormat = require('./CaptionFormat.js')
const UBVideoIdParser = require('./../UBVideoIdParser.js')
const fs = require('fs')

const TimeMarkAnalysis = require('./TimeMarkAnalysis.js')

const CONFIG = require('./../../../../config-json.js')

// https://youtu.be/85AqJsmxDZs
module.exports = async function (utID = 'https://youtu.be/JxbFotMgqik', timeMarkList = []) {
  fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 
  let expire = 365 * 24 * 60 * 60 * 1000

  // if (CONFIG.debug) {
  //   expire = 0
  // }
  // expire = 0  // for test

  // console.log({utID})

  let main = async () => {
    let url
    try {
      if (utID.startsWith('http')) {
        url = utID
        utID = UBVideoIdParser(utID)
      }
      // console.log({utID})
      if (!utID) {
        new Error('Invalid UT ID')
      }

      await ShellSpawnQueue([`python3`, `/app/python/caption.py`, `"https://www.youtube.com/watch?v=${utID}"`])
      let srtPath = `/app/tmp/srt-${utID}.txt`
      let srt = `[]`
      // console.log({srtPath})
      if (fs.existsSync(srtPath) === false) {
        // if (!url) {
        //   url = `https://www.youtube.com/watch?v=${utID}`
        // }
        // await ShellSpawnQueue([`python3`, `/app/python/youtube_audio_to_text.py`, `"${url}"`])

        // if (fs.existsSync(srtPath) === false) {
        //   return false
        // }
        console.error([`[CaptionDownloader]`, srtPath, `not found`].join('\t'))
        // return false
      }
      else {
        srt = fs.readFileSync(srtPath, 'utf-8')
      }
      
      // console.log(srt)
      if (Array.isArray(timeMarkList) === false) {
        timeMarkList = TimeMarkAnalysis(timeMarkList)
      }
      // console.log({timeMarkList})

      captionParagraph = await CaptionFormat(srt, utID, timeMarkList)
      // console.log({captionParagraph})

      if (fs.existsSync(srtPath)) {
        fs.unlinkSync(srtPath)
      }
      fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 
      return captionParagraph
    }
    catch (e) {
      console.error(e)
      return false
    }
  }

  if (CONFIG.debug) {
    return await main()
  }
  else {
    return await NodeCacheSqlite.get('CaptionDownloader', utID, main, expire)
  }
    
    
}