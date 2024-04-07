const StringToRGBColorCode = require('./StringToRGBColorCode.js')
const OutputFeedFilenameBuilder = require('./../podcast/OutputFeedFilenameBuilder.js')

module.exports = function (CONFIG) {
  if (CONFIG.publicURL.endsWith('/') === false) {
    CONFIG.publicURL = CONFIG.publicURL + '/'
  }

  for (let i = 0; i < CONFIG.feedList.length; i++) {
    let feedItem = CONFIG.feedList[i]
  
    if (!feedItem.feedURL && feedItem.homepageURL) {
      if (Array.isArray(feedItem.homepageURL)) {
        feedItem.feedURL = feedItem.homepageURL
      }
      else if (feedItem.homepageURL.startsWith('https://www.youtube.com/channel/')) {
        let id = feedItem.homepageURL.split('/').slice(-1)[0]
        feedItem.feedURL = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id
      }
      else if (feedItem.homepageURL.startsWith('https://www.youtube.com/playlist?list=')) {
        let id = feedItem.homepageURL.split('=').slice(-1)[0]
        feedItem.feedURL = 'http://www.youtube.com/feeds/videos.xml?playlist_id=' + id
      }
    }
    
    if (CONFIG.idAppend) {
      feedItem.feedID = CONFIG.idAppend + '-' + feedItem.feedID
    }

    if (feedItem.thumbnailBorderColor === true) {
      feedItem.thumbnailBorderColor = StringToRGBColorCode(feedItem.title)
    }
    else if (feedItem.thumbnailBorderColor) {
      feedItem.thumbnailBorderColor = feedItem.thumbnailBorderColor.toUpperCase()
    }
    else {
      feedItem.thumbnailBorderColor = CONFIG.thumbnailBorderColor
    }

    if (!feedItem.url && feedItem.homepageURL) {
      // feedItem.thumbnailBorderColor = StringToRGBColorCode(feedItem.title)
      let url = feedItem.homepageURL
      if (Array.isArray(url)) {
        url = url[0].url
      }
      feedItem.url = url
    }
    // console.log(feedItem.thumbnailBorderColor)

    feedItem.feedFilename = OutputFeedFilenameBuilder(feedItem)
  
    CONFIG.feedList[i] = feedItem
  }

  return CONFIG
}