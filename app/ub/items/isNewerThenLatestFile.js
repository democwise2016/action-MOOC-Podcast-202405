const getFileListByCreationDate = require('./getFileListByCreationDate.js')

module.exports = function(item, feedFilename) {
  
  let folder = `/output/${feedFilename}/`
  let fileList = getFileListByCreationDate(folder)
  if (fileList.length === 0) {
    return true
  }
  
  let latestFile = fileList[(fileList.length - 1)]
  let latestDate = Number(latestFile.split('-')[0])
  if (latestDate < 10000) {
    return true
  }

  let currentDate = Number(item.yyyymmddDate)

  return currentDate > latestDate
}