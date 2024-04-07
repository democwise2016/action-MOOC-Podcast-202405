const UBDownloader = require('./ub/UBDownloader.js')
const FeedIndexBuilder = require('./podcast/FeedIndexBuilder.js')
const CONFIG = require('./../config.js')
const fs = require('fs')

const EventEmitter = require('./lib/EventEmitter.js')
const PreventTerminate = require('./lib/PreventTerminate.js')

// const sqliteStore = require('cache-manager-sqlite')
// const cacheManager = require('cache-manager')
const NodeCacheSqlite = require('./lib/NodeCacheSqlite.js')

// const UBMp3DownloaderWrapper = require('./ub/items/UBMp3Downloader/UBMp3DownloaderWrapper.js')

let main = async () => {
  // return await NodeCacheSqlite.set('test', 'a', 1, 1000 * 1000)

  EventEmitter()
  PreventTerminate()

  const maxExcutionMS = CONFIG.maxExcutionMinutes * 60 * 1000;
  const timeout = setTimeout(() => {
    console.log(`Process has been terminated after ${CONFIG.maxExcutionMinutes} minutes. ${(new Date().toISOString())}`);
    process.exit(0); // You can provide an exit code (non-zero) if needed.
  }, maxExcutionMS);

  // On disk cache on employees table
  // const cache = cacheManager.caching({
  //   store: sqliteStore,
  //   name: 'cache',
  //   path: '/cache/cache.sqlite'
  // })


  // // TTL in seconds
  // await cache.set('foo2', 'boo22', {ttl: 100000000})
  // const value = await cache.get('foo2')
  // console.log(value)
  // return false

  // console.log(await NodeCacheSqlite.get('a', 'bb22', () => {return '11c2222'}))
  // return false

  let cloneConfig = JSON.parse(JSON.stringify(CONFIG))
  delete cloneConfig.feedList
  console.log(JSON.stringify(cloneConfig, null, 2))

  // https://www.youtube.com/watch?v=DRTT505hUeE
  // await UBMp3DownloaderWrapper('I2D9M2QmdrA', '/output/_test/test.mp3')
  // await UBMp3DownloaderWrapper('KK0rwW_r0zs', '/output/_test/test.mp3')
  // await UBMp3DownloaderWrapper('Na1b71JhJLA', '/output/_test/test.mp3')
  // return false

  let {feedList} = CONFIG

  // let options = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UCmMnzrvnsSnv-0u9M1Rxiqw')
  // console.log(options)
  // let podcastFeed = await PodcastFeedBuilder(options)
  // console.log(podcastFeed)
  // let info = await UBInfo.load(`https://youtu.be/I2D9M2QmdrA`)
  // console.log(info)

  // 先檢查看看有沒有人還沒建立
  let newArrial = false
  for (let i = 0; i < feedList.length; i++) {
    let feedItem = feedList[i]

    if (fs.existsSync('/output/' + feedItem.feedFilename + '.rss') === false) {
      // newArrial = true
      console.log('Start new arrial mode')
      break
    }
  }

  // 建立run-counter.txt
  let runCounter = 0
  if (fs.existsSync('/cache/run-count.txt')) {
    runCounter = Number(fs.readFileSync('/cache/run-count.txt', 'utf8'))
  }
  runCounter++
  fs.writeFileSync('/cache/run-count.txt', runCounter + '', 'utf8')


  console.log('Run counter: ' + runCounter)

  // feedList.sort(() => Math.random() - 0.5)
  let startIndex = (CONFIG.maxDownloadFeed * runCounter) % feedList.length

  // -------------------------

  let runnerCount = 0

  let ranI = []

  // https://www.youtube.com/@LINETODAYWORLD
  for (let currentIndex = startIndex; currentIndex < startIndex + CONFIG.maxDownloadFeed; currentIndex++) {
    let i = currentIndex % feedList.length
    if (ranI.indexOf(i) > -1) {
      continue
    }
    ranI.push(i)
    
    let feedItem = feedList[i]
    if (!feedItem) {
      continue
    }
    // if (feedItem.title !== '敖厂长') {
    //   continue
    // }

    // let {url, itemFilter, options} = feedList[i]
    console.log(`[${i}/${feedList.length}]`, 'Checking ', feedList[i].title, feedList[i].feedFilename, new Date().toISOString())
    try {
      if (newArrial === false) {
        UBDownloader(feedList[i])
        runnerCount++
        if (runnerCount >= CONFIG.maxDownloadFeed) {
          // console.log('Exit new arrial mode')
          // break
          console.log('not new arrial')
          continue
        }
      }
      else {
        if (fs.existsSync('/output/' + feedItem.feedFilename + '.rss') === false) {
          UBDownloader(feedList[i])
          runnerCount++
          console.log('new arrial', runnerCount, feedList[i].title, feedList[i].feedFilename)
          if (runnerCount >= CONFIG.newArrialMax) {
            // console.log('Exit new arrial mode')
            break
          }
        }
      }
    }
    catch (e) {
      console.error(e)
    }
  }
  
  FeedIndexBuilder()
}

main()