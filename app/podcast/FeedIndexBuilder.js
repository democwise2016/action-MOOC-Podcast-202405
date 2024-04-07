const fs = require('fs')
const ParseUBID = require('./../ub/ParseUBID.js')
const CONFIG = require('../../config.js')
const OutputFeedFilenameBuilder = require('./OutputFeedFilenameBuilder.js')

module.exports = function () {
  let {publicURL, feedList} = CONFIG

  // feedList 按照title排序
  // feedList.sort(function(a, b) {
  //   return a.title.localeCompare(b.title, "zh-Hant-TW");
  // })

  let head = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>action-MOOC-Podcast</title>
  <script>
  function copyPlainString (text) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function () {
      //console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
      //console.error('Async: Could not copy text: ', err);
    });
  }
  </script>
</head>
<body>
<ol>
`
  let foot = `</ol>
</body>
</html>`

  let body = []
  feedList.forEach((feedItem) => {
    let {title, feedID, feedURL, homepageURL} = feedItem
    if (!feedID) {
      feedID = ParseUBID(feedURL)
    }

    let filename = OutputFeedFilenameBuilder(feedItem)
      
    let outputFeedURL = publicURL + filename + '.rss'
    if (Array.isArray(homepageURL)) {
      homepageURL = homepageURL[0].url
    }
    body.push(`<li>
      <button type="button" style="font-size: 3rem" onclick="copyPlainString('${outputFeedURL}');this.style.color='red';">COPY</button>
      <a href="${outputFeedURL}" target="_blank">${title}</a>
      (<a href="${homepageURL}" target="_blank">source</a>)
    </li>`)
  })

  let html = head + body.join('\n') + foot
  fs.writeFileSync(`/output/index.html`, html, 'utf-8')
}