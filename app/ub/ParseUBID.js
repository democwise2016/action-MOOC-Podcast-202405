const URL = require('url')

function extractYouTubeVideoId(url) {
  // Regular expression to match YouTube URLs
  var regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/;
  
  // Try to match the regex pattern with the provided URL
  var match = url.match(regex);

  // If a match is found, return the video ID; otherwise, return null
  if (match && match[1]) {
      return match[1];
  } else {
      return null;
  }
}

module.exports = function (url) {
  if (Array.isArray(url)) {
    url = url[0].url
  }

  let queryData = URL.parse(url, true).query
  // console.log(queryData)
  if (queryData.channel_id) {
    return 'ch_' + queryData.channel_id
  }
  else if (queryData.list) {
    return 'pl_' + queryData.list
  }
  else if (queryData.playlist_id) {
    return 'pl_' + queryData.playlist_id
  }

  let id = extractYouTubeVideoId(url)
  if (id) {
    return 'ub_' + id
  }
  
  return ''
}