const ParseUBID = require('./ParseUBID.js')
const GetUBFeedJSON = require('./GetUBFeedJSON.js')
const UBInfo = require('./UBInfo.js')
const PodcastFeedBuilder = require('./../podcast/PodcastFeedBuilder.js')
const UBDownloaderItems = require('./items/UBDownloaderItems.js')
const getFileListByCreationDate = require('./items/getFileListByCreationDate.js')

const fs = require('fs');

const ShellSpawn = require('./../lib/ShellSpawn.js')

// const OutputFeedFilenameBuilder = require('./../podcast/OutputFeedFilenameBuilder.js')
let RSSBuildCounter = 0

module.exports = async function (feedItem = {}) {

  let {
    feedURL, 
    feedID,
    feedFilename,
    // itemFilters, 
    // options = {}
  } = feedItem

  // ---------
  // 取得ID
  if (!feedID) {
    feedID = ParseUBID(feedURL)
  }
  // console.log(getFileListByCreationDate(`/output/${feedID}`))

  // console.log(id)

  // ---------
  // 取得Feed的資訊
  let feedJSON = await GetUBFeedJSON(feedURL)
  // fs.writeFileSync('/output/feed.json', JSON.stringify(feedJSON, null, 2), 'utf8')
  
  // ---------
  // 取得頻道的網址
  let channelURL = feedJSON.link
  let channelInfo = await UBInfo.load(channelURL)

  if (!channelInfo) {
    return false
  }

  // console.log(channelInfo)
  // feedJSON.channelAvatar = channelInfo.channelAvatar
  // feedJSON.thumbnail = channelInfo.thumbnail
  feedJSON = {
    ...channelInfo,
    ...feedJSON,
    ...feedItem
  }

  // ---------
  // 逐一下載？
  // let filename = OutputFeedFilenameBuilder(feedItem)
  feedJSON.items = await UBDownloaderItems(feedJSON.items, feedItem)
  
  // ---------
  // 建立Feed
  let outputFeedString = await PodcastFeedBuilder(feedJSON)

  // console.log(outputFeedString)
  fs.writeFileSync(`/output/${feedFilename}.rss`, outputFeedString, 'utf8') 
  RSSBuildCounter++
  console.log([`[UBDownloader] RSS build`, feedFilename, RSSBuildCounter, (new Date().toISOString())].join('\t'))

  // await ShellSpawn([`chmod`, `-R`, `777`, `/output/*`])
  // console.log([`[UBDownloader] Chmod finish`, feedFilename, RSSBuildCounter, (new Date().toISOString())].join('\t'))
}