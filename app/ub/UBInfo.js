const request = require('request')
const cheerio = require('cheerio')

const moment = require('moment')

let isLoading = false
let cache = {}

const NodeCacheSqlite = require('./../lib/NodeCacheSqlite.js')
const UBVideoIdParser = require('./items/UBVideoIdParser.js')

const fs = require('fs')

let cacheLimit = Number(3 * 60 * 60)
//cacheLimit = 0

// const TorHTMLLoader = use('App/Helpers/tor-html-loader/tor-html-loader.js')
const GetHTML = require('./../lib/GetHTML.js')
const TorController = require('../lib/TorController.js')

class UBInfo {
  
  load (url) {
    if (!url) {
      console.trace("URL is undefined")
      return false
    }

    if (url.indexOf('www.y' + 'out' + 'ube.com/channel/') > -1 || url.indexOf('www.y' + 'out' + 'ube.com/@') > -1) {
      return this.loadChannel(url)
    }
    else if (url.indexOf('www.y' + 'out' + 'ube.com/playlist?list=') > -1) {
      return this.loadPlaylist(url)
    }
    else if (url.indexOf('y' + 'out' + 'ube.com/playlist?list=') > -1) {
      return this.loadPlaylist(url)
    }
    else {
      return this.loadVideo(url)
    }
  }
  
  sleep (time = 500) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
  async loadChannel (url) {
    if (cache[url]) {
      return cache[url]
    }
    

    return await NodeCacheSqlite.get('loadChannel', url, async () => {

      // let html = await this.loadHTML(url, 5184000000)
      let html = await this.loadHTML(url, 2 * 24 * 60 * 60 * 1000)
      // console.log(html)
      if (!html || html === '') {
        // await NodeCacheSqlite.clear('ubinfo', url)
        console.error(['[UBInfo] loadChannel, body html is empty: ', url, (new Date().toISOString())].join('\t'))
        await NodeCacheSqlite.clear('GetHTML', url)
        
        //throw new Error('body html is empty: ' + url)
        await TorController.restart()
        await this.sleep(3 * 1000)
        // return await this.loadChannel(url)
        return this.loadChannel(url)
      }

      let info = this.parseChannelHTML(html, url)
      if (!info) {
        console.error(['[UBInfo] loadChannel, info is empty: ', url, (new Date().toISOString())].join('\t'))
        await NodeCacheSqlite.clear('GetHTML', url)
        // await this.sleep(30 * 1000)
        await TorController.restart()
        // return await this.loadChannel(url)
        return this.loadChannel(url)
      }

      cache[url] = info
      console.log(['[UBInfo] loadChannel is finished', url, (new Date().toISOString())].join('\t'))
      return info
    }, 180 * 24 * 60 * 60 * 1000)
      
  }
  
  async loadVideo (url) {
    if (cache[url]) {
      return cache[url]
    }
    
    return await NodeCacheSqlite.get('loadVideo', url, async () => {
      let html = await this.loadHTML(url, 2 * 24 * 60 * 60 * 1000)
      if (!html || html === '') {
        // await NodeCacheSqlite.clear('ubinfo', url)
        console.error(['[UBInfo] loadVideo, body html is empty: ', url, (new Date().toISOString())].join('\t'))
        await NodeCacheSqlite.clear('GetHTML', url)
        
        //console.error('body html is empty: ' + url)
        //throw new Error('body html is empty: ' + url)
        await TorController.restart()
        await this.sleep(3 * 1000)
        // return await this.loadChannel(url)
        return this.loadVideo(url)
      }
      
      let info = this.parseVideoHTML(html, url)
      if (!info) {
        console.error(['[UBInfo] loadVideo, info is empty: ', url, (new Date().toISOString())].join('\t'))
        await NodeCacheSqlite.clear('GetHTML', url)
        await TorController.restart()
        await this.sleep(3000)
        return await this.loadVideo(url)
      }
      
      if (info.isOffline) {
        // await NodeCacheSqlite.clear('ubinfo', url)
        console.error(['[UBInfo] video isOffline', url, (new Date().toISOString())].join('\t'))
        await NodeCacheSqlite.clear('GetHTML', url)
        // await NodeCacheSqlite.clear('loadVideo', url)
        // info = undefined
        return undefined
        // await NodeCacheSqlite.clear('tor-html-loader', url)
      }
      
      cache[url] = info
      console.log(['[UBInfo] loadVideo is finished', url, (new Date().toISOString())].join('\t'))
      return info
    }, 60 * 24 * 60 * 60 * 1000)
  }
  
  async loadDuration(url) {
    let info = await this.loadVideo(url)
    return info.duration
  }
  
  async loadPlaylist (url) {
    if (cache[url]) {
      return cache[url]
    }
    
    return await NodeCacheSqlite.get('loadPlaylist', url, async () => {
      let html = await this.loadHTML(url, 0.5 * 24 * 60 * 60 * 1000)
      if (html.indexOf(`{"videoOwner":{"videoOwnerRenderer":{"thumbnail":{"thumbnails":[{"url":"`) === -1) {
        // throw Error('Playlist html is error: ' + url)
        console.error(['[UBInfo] Playlist html is error: ', url, (new Date().toISOString())].join('\t'))
        // return undefined
        await NodeCacheSqlite.clear('GetHTML', url)

        await TorController.restart()
        await this.sleep(3 * 1000)
        // return await this.loadChannel(url)
        return this.loadVideo(url)
      }
      
      if (html === null || typeof html !== 'string') {
        // await NodeCacheSqlite.clear('ubinfo', url)

        console.error(['[UBInfo] Playlist html is null: ', url, (new Date().toISOString())].join('\t'))
        await NodeCacheSqlite.clear('GetHTML', url)
        return undefined
      }

      let info = this.parsePlaylistHTML(html, url)
      if (!info) {
        console.error(['[UBInfo] loadPlaylist is undefined', url, (new Date().toISOString())].join('\t'))
        return undefined
      }
      console.log(['[UBInfo] loadPlaylist is finished', url, (new Date().toISOString())].join('\t'))
      cache[url] = info
      return info
    })
  }
  
  async loadHTML(url, cacheExpire = 43200000) {
    while (isLoading === true) {
      await this.sleep()
      
      if (cache[url]) {
        return false
      }
    }
    
    let cacheDay = cacheExpire / 24 / 60 / 60 / 1000

    isLoading = true
    
    return new Promise(async (resolve, reject) => {
      try {
        // let body = await TorHTMLLoader.loadHTML(url, cacheExpire)
        let body = await GetHTML(url, {
          cacheDay
        })
        // console.log(url, body)
        isLoading = false
        resolve(body)
      }
      catch (e) {
        reject(e)
      } 
      
//      request(url, (error, response, body) => {
//        resolve(body)
//        isLoading = false
//      });
    })
  }
  
  sliceBetween(text, header, footer) {
    if (typeof(text) !== 'string') {
      return undefined
    }
    
    let startPos = text.indexOf(header)
    if (startPos === -1) {
      return undefined
      startPos = 0
    }
    else {
      startPos = startPos + header.length
    }
    
    let endPos = text.indexOf(footer, startPos)
    if (endPos === -1) {
      return undefined
      endPos = text.length
    }
    
    return text.slice(startPos, endPos)
  }
  
  parseVideoHTML (body, url) {
    
    if (!url) {
      throw Error('no url')
    }
    
    if (!body) {
      console.error(['[UBInfo] parseVideoHTML, body is empty: ', url, (new Date().toISOString())].join('\t'))
      return {
        isOffline: true,
        bodyIsEmpty: true
      }
    }
    else if (body.indexOf('captcha-page-content') > -1) {
      console.error('Captcha deny: ' + url)
      return {
        isOffline: true
      }
    }
    
    
    let $
    try {
      $ = cheerio.load(body);
    }
    catch (e) {
      try {
        $ = cheerio.load(`<div>${body}</div>`)
      }
      catch (e2) {
        //throw new Error('URL loading error: ' + url)
        // console.error('URL loading error: ' + url)
        console.error(['[UBInfo] parseVideoHTML, URL loading error: ', url, (new Date().toISOString())].join('\t'))
        return {
          isOffline: true
        }
      }
    }
    
    let info = {}
    
    
    info.isOffline = (body.indexOf('"playabilityStatus":{"status":"LIVE_STREAM_OFFLINE"') > -1
            || body.indexOf('"thumbnailOverlays":[{"thumbnailOverlayTimeStatusRenderer":{"text":{"accessibility":{"accessibilityData":{"label":"LIVE"}},"simpleText":"LIVE"},"style":"LIVE","icon":{"iconType":"LIVE"}}},') > -1
            || body.indexOf('{"subreason":{"simpleText":"This video is private."}') > -1
            || body.indexOf(',"errorScreen":{"playerErrorMessageRenderer":{"subreason":{"simpleText":') > -1)
    
    if (info.isOffline) {
      console.log(url, 'isOffline', body.indexOf('"playabilityStatus":{"status":"LIVE_STREAM_OFFLINE"') > -1
            , body.indexOf('"thumbnailOverlays":[{"thumbnailOverlayTimeStatusRenderer":{"text":{"accessibility":{"accessibilityData":{"label":"LIVE"}},"simpleText":"LIVE"},"style":"LIVE","icon":{"iconType":"LIVE"}}},') > -1
            , body.indexOf('{"subreason":{"simpleText":"This video is private."}') > -1
            , body.indexOf(',"errorScreen":{"playerErrorMessageRenderer":{"subreason":{"simpleText":') > -1)
    }
    
    //info.description = $('meta[itemprop="description"]').eq(0).attr('content')
    info.description = this.sliceBetween(body, `"},"description":{"simpleText":"`, `"},"lengthSeconds":"`)
    if (typeof(info.description) === 'string') {
      info.description = info.description.trim().split('\\n').join('\n').trim()
    }
    
    info.id = UBVideoIdParser(url)
    if (info.id.indexOf(':') > -1) {
      info.id = info.id.split(':').slice(-1)[0]
    }

    info.thumbnail = `https://img.youtube.com/vi/${info.id}/maxresdefault.jpg`
    info.thumbnails = [
      `https://img.youtube.com/vi/${info.id}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${info.id}/0.jpg`,
      `https://img.youtube.com/vi/${info.id}/1.jpg`,
      `https://img.youtube.com/vi/${info.id}/2.jpg`,
      `https://img.youtube.com/vi/${info.id}/3.jpg`
    ]

    info.ownerChannelName = this.sliceBetween(body, `","ownerChannelName":"`, `"`)
    info.channelId = $('meta[itemprop="channelId"]').eq(0).attr('content')
    info.channelLink = 'https://www.y' + 'out' + 'ube.com/channel/' + info.channelId
    
    info.channelAvatar = this.sliceBetween(body, `"}}},{"videoSecondaryInfoRenderer":{"owner":{"videoOwnerRenderer":{"thumbnail":{"thumbnails":[{"url":"`, `"`)
    if (!info.channelAvatar) {
      info.channelAvatar = this.sliceBetween(body, `"{"videoSecondaryInfoRenderer":{"owner":{"videoOwnerRenderer":{"thumbnail":{"thumbnails":[{"url":"`, `"`)
    }
    if (!info.channelAvatar) {
      info.channelAvatar = this.sliceBetween(body, `{"videoSecondaryInfoRenderer":{"owner":{"videoOwnerRenderer":{"thumbnail":{"thumbnails":[{"url":"`, `"`)
    }
    
    
    if (info.channelAvatar) {
      try {
        info.channelAvatar = info.channelAvatar.split('=s48-c-k').join('=s1024-c-k')
      }
      catch (e) {
        console.error(['[UBInfo] parseVideoHTML, cannot found channelAvatar: ' + url, (new Date().toISOString())].join('\t'))
        return false
      }
    }
    
    info.duration = moment.duration($('meta[itemprop="duration"]').eq(0).attr('content')).asSeconds()
    
    if (info.duration === 0) {
      info.isOffline = true
    }
    
    info.author_url = $('span[itemprop="author"] > link[itemprop="url"]').eq(0).attr('href')
    info.genre = $('meta[itemprop="genre"]').eq(0).attr('content')
    
    // <meta itemprop="startDate" content="2021-01-02T04:00:12+00:00">
    // 2020-12-27T11:51:47.000Z
    
    info.date = $('meta[itemprop="datePublished"]').eq(0).attr('content')
    if (!info.date) {
      info.date = $('meta[itemprop="uploadDate"]').eq(0).attr('content')
    }
    // uploadDate
    // 2020-12-31
    // console.log({d1: info.date})
    if (info.date && info.date.indexOf('-') > -1) {
      if (info.date.indexOf('T') > -1) {
        // info.date = info.date.slice(0, info.date.indexOf('T'))
        info.date = info.date.slice(0, info.date.lastIndexOf('-')) + '.000Z'
      }
      else {
        info.date = info.date + 'T00:00:00.000Z'
      }
      
    }
    else {
      //throw Error('info.date not found: ' + url + '\n\n' + body)
      // console.log('=----------------------------=')
      // console.log(body.length)
      // fs.writeFileSync('/cache/video.html', body)
      // console.log('=----------------------------=')
      console.log(['[UBInfo] info.date not found: ' + url, $('meta[itemprop="uploadDate"]').length, $('meta[itemprop="datePublished"]').length, (new Date().toISOString())].join('\t'))

      // console.error('info.date not found: ' + url)
      return {
        isOffline: true
      }
    }

    // console.log({d2: info.date})
    
    //console.log(info.date)
    
    info.pubDate = info.date
    info.isoDate = info.date
    try {
      info.mmddDate =  moment(info.date).format('MMDD')
      info.yyyymmddDate =  moment(info.date).format('YYYYMMDD')
    }
    catch (e) {
      console.log({'error-date': info.date})
      console.error(e)
    }
      
    
    // window["ytInitialPlayerResponse"] = 
    
    // "},"description":{"simpleText":"
    // "},"lengthSeconds":"
    
    return info
  }
  
  parseChannelHTML (body, url) {
    let info = {}
    
    try {
      if (!body) {
        throw new Error('body is empty: ' + url)
      }
      
      // console.log('================')
      // console.log(body.length)
      // fs.writeFileSync('/cache/channel.html', body, 'utf-8')
      // console.log('================')

      var $ = cheerio.load(body);


      // <meta property="og:title" content="TODAY 看世界">
      info.title = $('meta[name="title"]').eq(0).attr('content')
      if (!info.title) {
        info.title = $('meta[property="og:title"]').eq(0).attr('content')
      }

      info.channelAvatar = this.sliceBetween(body, `"}},"avatar":{"thumbnails":[{"url":"`, `"`)
      //console.log('channelAvatar', body)
      if (!info.channelAvatar) {
        // NodeCacheSqlite.clear('GetHTML', url)
        // throw new Error('channelAvatar is not found', url)
        console.error(['[UBInfo] parseChannelHTML, channelAvatar is not found', url, (new Date().toISOString())].join('\t'))
        return undefined
      }
      info.channelAvatar = info.channelAvatar.split('=s100-c-k').join('=s1024-c-k')
      info.channelAvatar = info.channelAvatar.split('=s48-c-k').join('=s1024-c-k')
      info.thumbnail = info.channelAvatar
    }
    catch (e) {
      console.error(e)
      // console.error('parseChannelHTML error! ', url)
      // throw new Error(e)
      return undefined
    }
    
    return info
  }
  
  parsePlaylistHTML (body, url) {
    var $ = cheerio.load(body);
    
    let info = {}
    
    info.title = $('meta[name="title"]').eq(0).attr('content')
    info.title = encodeURIComponent(info.title)
    //console.log(body.length,body.indexOf(`{"videoOwner":{"videoOwnerRenderer":{"thumbnail":{"thumbnails":[{"url":"`))
    info.ownerAvatar = this.sliceBetween(body, `{"videoOwner":{"videoOwnerRenderer":{"thumbnail":{"thumbnails":[{"url":"`, `"`)
    if (info.ownerAvatar) {
      info.ownerAvatar = info.ownerAvatar.split('=s100-c-k').join('=s1024-c-k')
      info.ownerAvatar = info.ownerAvatar.split('=s48-c-k').join('=s1024-c-k')
      info.thumbnail = info.ownerAvatar
    }
    else {
      return false
    }
    
    return info
  }
}

module.exports = new UBInfo()