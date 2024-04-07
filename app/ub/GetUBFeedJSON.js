let Parser = require('rss-parser');
// let parser = new Parser();
let parser
let NodeCacheSqlite = require('./../lib/NodeCacheSqlite.js');

module.exports = async function (feedURL, options = {}) {
  let {
    cacheDay = 0.3, 
  } = options

  // return await NodeCacheSqlite.get('GetUBFeedJSON', feedURL, async function () {
    console.log('get feed', JSON.stringify(feedURL), (new Date()).toISOString())

    if (!parser) {
      parser = new Parser()
    }

    let output
    if (typeof(feedURL) === 'string') {
      output = await parser.parseURL(feedURL)
    }
    else {
      // output = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?playlist_id=PLbpi6ZahtOH40g4wyFnJmxVVlasfCUOW3`)
      // console.log(output)
      output = {
        link: feedURL[0].url,
        items: feedURL.map(item => {
          return {
            title: item.title,
            link: item.url
          }
        })
      }

      // console.log(output)
    }


    if (output.link === feedURL) {
      let id = feedURL.split('=').slice(-1)[0]
      output.link = 'https://www.youtube.com/playlist?list=' + id
      // channelURL = 
    }
    if (!output.feedLink) {
      let tmpFeedURL = feedURL
      if (Array.isArray(tmpFeedURL)) {
        tmpFeedURL = tmpFeedURL[0].url
      }
      output.feedLink = tmpFeedURL
      // channelURL = 
    }

    // output

    // console.log(output)

    return output
  // }, parseInt(cacheDay * 1000 * 60 * 60 * 24, 10))
}