const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')

const NodeCacheSqlite = require('./NodeCacheSqlite.js')
const ShellSpawn = require('./ShellSpawn.js')



let maxThreads = 3
let currentThreads = 0
// let maxExcutionMS = 60000

const TorController = require('./TorController.js')

let sleep = function (ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let reduceCurrentThreads = function () {
  currentThreads--
  if (currentThreads < 0) {
    currentThreads = 0
  }
}

const CONFIG = require('./../../config.js')

let startTimer = false
let maxExcutionMS = CONFIG.maxExcutionMinutes * 60 * 1000

const MAX_RETRY = 10

const fs = require('fs')

async function GetHTML (url, options = {}) {
  fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 

  let browserCloseTimer
  let browser

  if (!startTimer) {
    startTimer = (new Date()).getTime()
  }

  if ((new Date()).getTime() - startTimer > maxExcutionMS) {
    // throw Error ('GetHTML timeout: ' + url)
    console.error(['GetHTML timeout: ', url].join('\t'))
    return undefined
  }

  if ((url.endsWith('.txt') || url.endsWith('.csv')) && !options.crawler) {
    options.crawler = 'fetch'
  }

  let {
    cacheDay = 0.5, 
    encoding = null,
    crawler = 'puppeteer', // fetch or puppeteer or xml
    puppeteerArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=800,600'],
    puppeteerAgent,
    // puppeteerWaitUntil = `networkidle2`,
    puppeteerWaitUntil = `networkidle0`,
    // puppeteerWaitUntil = `domcontentloaded`,
    puppeteerWaitForSelector,
    puppeteerWaitForSelectorTimeout = 30000,
    retry = 0,
    timeout = 2 * 60 * 1000
  } = options

  crawler = 'fetch'

  if (TorController.isStarted()) {
    puppeteerArgs.push('--proxy-server=socks5://127.0.0.1:9050')
  }

  // if (timeout < 3 * 60 * 1000) {
  //   timeout = 3 * 60 * 1000
  // }

  if (retry > MAX_RETRY) {
    await TorController.restart({force: true})
    // throw Error ('GetHTML failed: ' + url)
    console.error([`[GetHTML] Retry reach max ${MAX_RETRY}, failed`, url, (new Date().toISOString())].join('\t'))
    return undefined
  }

  // if (crawler === 'puppeteer') {
  //   console.trace('GetHTML: ' + url)
  // }

  if (crawler === 'xml') {
    let fetchOptions = {...options}
    fetchOptions.crawler = 'fetch'
    let output = await GetHTML(url, fetchOptions);

    let $xml = cheerio.load(output, {
      xmlMode: true
    })

    return $xml
  }

  try {

    // console.log('GetHTML', 0, crawler)
    // return await NodeCacheSqlite.get('GetHTML', url + '|' + JSON.stringify(options), async function () {
    return await NodeCacheSqlite.get('GetHTML', url, async function () {

      let isTimeouted = false
      // setTimeout(() => {
      //   isTimeouted = true
      //   throw Error(['GetHTML timeout', url, crawler, (new Date().toISOString())].join(' '))
      // }, timeout)

          // console.log('GetHTML before start', url, currentThreads, crawler, (new Date().toISOString()))
      while (currentThreads > maxThreads) {
        console.log(['[GetHTML] wait', url, currentThreads, crawler, (new Date().toISOString())].join('\t'))
        await sleep(30000)
      }
      currentThreads++
      console.log(['[GetHTML] start', url, currentThreads, crawler, (new Date().toISOString())].join('\t'))


      if (crawler === 'fetch') {
        const response = await fetch(url);
        if (isTimeouted) {
          return undefined
        }

        if (!encoding) {
          reduceCurrentThreads()
          console.log(['[GetHTML] End', url, (new Date().toISOString())].join('\t'))
          return await response.text()
        }
        else {
          const buffer = await response.arrayBuffer()
          reduceCurrentThreads()
          console.log(['[GetHTML] End',url, (new Date().toISOString())].join('\t'))
          return iconv.decode(Buffer.from(buffer), encoding)
        }
      }
      else {
        try {
          // console.log('GetHTML', 1)
          if (!browser) {
            // await TorController.start()
            browser = await puppeteer.launch({
              //headless: false,
              args: puppeteerArgs,
              ignoreHTTPSErrors: true,
              headless: "new"
            });
          }
            
          clearTimeout(browserCloseTimer)
          browserCloseTimer = setTimeout(async () => {
            console.error(['[GetHTML] timeout, force close browser', url, crawler, (new Date().toISOString())].join('\t'))
            // isTimeouted = true
            if (browser && typeof(browser.close) === 'function') {
              await browser.close();
            }
            reduceCurrentThreads()
            // await TorController.restart()
            browser = null
          }, 100 * 1000)
          
          // console.log('GetHTML', 2)
          // setTimeout(async () => {
          //   console.error(['GetHTML timeout, force close browser', url, crawler, (new Date().toISOString())].join(' '))
          //   isTimeouted = true
          //   if (browser && typeof(browser.close) === 'function') {
          //     await browser.close();
          //   }
          //   // let pid = await ShellSpawn(['pidof', 'tor'])
          //   await TorController.restart()
          //   reduceCurrentThreads()
          //   browser = false
          // }, timeout)

          // console.log('GetHTML', 3)
          const page = await browser.newPage();
          // console.log('GetHTML', 4)
          if (puppeteerAgent) {
            await page.setUserAgent(puppeteerAgent);
          }
            
          await page.goto(url, {waitUntil: puppeteerWaitUntil});

          if (puppeteerWaitForSelector) {
            await page.waitForSelector(puppeteerWaitForSelector, {
              timeout: puppeteerWaitForSelectorTimeout
            })
          }
          // console.log('GetHTML', 5)
          let output = await page.content()

          clearTimeout(browserCloseTimer)
          await sleep(1000)
          reduceCurrentThreads()

          if (output.indexOf(`This page appears when Go` + `o` + `gle automatically detects requests coming from your computer network which appear to be in violation of the`) > -1) {
            console.log(['[GetHTML] deny from Go' + 'o' + 'gle', url, (new Date().toISOString())].join('\t'))
            await TorController.restart({force: true})
            retry++
            options.retry = retry
            return await GetHTML(url, options)
          }

          if (isTimeouted) {
            return undefined
          }
          retry = 0
          console.log(['[GetHTML] end', url, currentThreads, crawler, (new Date().toISOString())].join('\t'))
          
          return output
        }
        catch (e) {
          console.error(e)
          clearTimeout(browserCloseTimer)

          await browser.close();
          browser = null
          
          await sleep(3000)

          retry++
          options.retry = retry
          reduceCurrentThreads()
          if ((await TorController.restart()) === false) {
            return undefined
          }
          // if (isTimeouted) {
          //   return undefined
          // }

          console.log(['[GetHTML] Retry', options.retry, url, (new Date().toISOString())].join('\t'))
          return await GetHTML(url, options)
        } 
      }
    }, parseInt(cacheDay * 1000 * 60 * 60 * 24, 10))
  }
  catch (e) {
    console.error(e)
    return undefined
  }
}

module.exports = GetHTML