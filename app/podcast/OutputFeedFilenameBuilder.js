const ParseUBID = require('./../ub/ParseUBID.js')

module.exports = function (feedItem = {}) {
  let {
    feedID,
    feedURL
  } = feedItem

  let filename = ParseUBID(feedURL)
  if (feedID) {
    filename = feedID + '-' + filename
  }

  return filename
}