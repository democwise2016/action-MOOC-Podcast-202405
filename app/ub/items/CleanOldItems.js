const fs = require('fs')
const getFileListByCreationDate = require('./getFileListByCreationDate.js')

const CONFIG = require('./../../../config.js')
const NodeCacheSqlite = require('./../../lib/NodeCacheSqlite.js')

const expire = 356 * 24 * 60 * 60 * 1000

module.exports = async function (feedItem = {}) {
  let {
    feedFilename,
    options = {}
  } = feedItem

  let {
    maxItems = CONFIG.maxDownloadItemPerFeed,
  } = options

  // --------------------
  // 列出目前檔案，按照建立日期排序
  let folder = `/output/${feedFilename}/`

  let fileList = getFileListByCreationDate(folder)
  // console.log(fileList)

  for (let i = 0; i < fileList.length - maxItems; i++) {
    let filePath = folder + fileList[i]
    console.log('Clean: ', filePath)
    fs.unlinkSync(filePath)
    await NodeCacheSqlite.set('CleanOldItems', filePath, true, expire)
  }
}