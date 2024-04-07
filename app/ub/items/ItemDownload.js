const ItemDownloadPathBuilder = require('./ItemDownloadPathBuilder.js')
const fs = require('fs')
const UBMp3DownloaderWrapper = require('./UBMp3Downloader/UBMp3DownloaderWrapper.js')
const NodeCacheSqlite = require('./../../lib/NodeCacheSqlite.js')

const CONFIG = require('./../../../config.js')

let downloadCount = 0

module.exports = async function (item, feedItem = {}) {

  let {
    feedFilename,
    options = {}
  } = feedItem
  // console.log(item)

  let id = item.id
  if (id.indexOf(':') > -1) {
    id = id.split(':').slice(-1)[0]
  }

  if (await NodeCacheSqlite.isExists('UBMp3DownloadFailed', id)) {
    console.log(['[ItemDownload] UBMp3DownloadFailed existed', id, (new Date().toISOString())].join('\t'))
    return false
  }

  if (downloadCount > CONFIG.maxDownloadItems) {
    console.log(['[ItemDownload] Reach CONFIG.maxDownloadItems, download stop', id, downloadCount, CONFIG.maxDownloadItems, (new Date().toISOString())].join('\t'))
    return false
  }

  let cached = true
  let {localPath, publicPath} = await ItemDownloadPathBuilder(feedFilename, id, item.yyyymmddDate)

  if (fs.existsSync(localPath) === false) {
    try {
      await UBMp3DownloaderWrapper(id, localPath, options)
      downloadCount++
    }
    catch (e) {
      console.error(e)
      await NodeCacheSqlite.set('UBMp3DownloadFailed', id, true)
      console.log(['[ItemDownload] UBMp3DownloadFialed', id, (new Date().toISOString())].join('\t'))
      return false
    }
    // await CleanOldItems(feedID, options)
    cached = false
  }
  item.mediaURL = publicPath

  return {
    item,
    cached
  }
}