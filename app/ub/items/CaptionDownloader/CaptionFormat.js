
const SentenceAppendPeriod = require('./SentenceAppendPeriod.js')
// const containsChineseCharacters = require('./containsChineseCharacters')
const CalculateParagraphInterval = require('./CalculateParagraphInterval.js')

const CONFIG = require('./../../../../config-json.js')
const CaptionScreenshot = require('./CaptionScreenshot.js')

const NextParagraphEnd = [
  '完畢',
  '看看',
  '成功',
  '囉',
  '今天的內容',
  '的喔',
  '使用了',
  '演示吧',
  '來開始',
  '懂的都懂',
  '到了極致',
  // '方式'
]

const NextParagraphStart = [
  '不過',
  '那除此之外',
  '第一',
  '第二',
  '第三',
  '第四',
  '第五',
  '第六',
  '第七',
  '第八',
  '第九',
  '第十',
  '首先',
  '那同一時間',
  '為什麼',
  '好 ',
  '那接下來',
  '接著',
  '其實',
  '其实',
  '接下來',
  '那再來',
  'ok',
  '如果喜歡',
  '這件事',
  '我舉一個',
  '你還有希望',
  '今天',
  '我们先说',
  '我还给大家',
  '今天视频',
  '好了',
  '随着',
  '以上',
  '那要說',
  '那為了怕',
  '那在最後',
  '大家可以',
  '除了',
  '其它改变',
  '123',
  '聊完',
  '同样的',
  '这次',
  '而这一次',
  '按理說',
  '初看',
  '有趣的是',
  '總之',
  '比如',
  '譬如',
  '舉例來說',
  '憑借',
  '可惜',
  '咦，',
  '嗯，',
  '最後',
  '由於',
  '我們知道',
  '上一步驟',
  '原來因為',
  '這就說明',
  '最經典',
  '本期節目',
  '這種',
  '這個設計',
  '這等於是',
  '當然如果',
  '另外',
  '可以想像',
  '蠻開心能看到',
  '那最有趣的',
  '最重要的',
  '影片中',
  '好啦',
  '你說',
  // '方式'
]



// let paragraphInterval = 0.02
let ScreenshotInterval = 60

const fs = require('fs')

function testIsNextParagraphEnd(text) {

  if (text.endsWith('。')) {
    text = text.slice(0, -1).trim()
  }
  if (text.endsWith('.')) {
    text = text.slice(0, -1).trim()
  }
  for (let i = 0; i < NextParagraphEnd.length; i++) {
    if (text.endsWith(NextParagraphEnd[i])) {
      // console.log(text, NextParagraphEnd[i])
      return true
    }
  }
  return false
}

function testIsNextParagraphStart(text) {

  for (let i = 0; i < NextParagraphStart.length; i++) {
    if (text.startsWith(NextParagraphStart[i])) {
      // console.log(text, NextParagraphStart[i])
      return true
    }
  }
  return false
}

async function CaptionFormat(srt, utID, timeMarkList = []) {
  // let srtObject = JSON.parse(srt)
  let srtObject = []
  // console.log(srt)
  try {
    srtObject = eval(srt)
  }
  catch (e) {
    console.log(e)
    return false
  }
  // console.log(srtObject)

  if (timeMarkList.length > 0) {
    timeMarkList.sort()
  }

  let paragraphInterval = CalculateParagraphInterval(srtObject)
  let maxSentencesInParagraph = Math.ceil(srtObject.length / 7)
  // console.log({paragraphInterval})

  let paragraphs = []
  let sentences = []
  let lastEnd = false
  // let hasChineseCharacters = false

  if (timeMarkList.length > 0 && timeMarkList[0].time === 0) {
    paragraphs.push([{text: `<strong># ${timeMarkList[0].title}</strong>`, start: timeMarkList[0].time}])
    timeMarkList.shift()
  }

  let tmp = []
  for (let i = 0; i < srtObject.length; i++) {
    let {text, start, duration, end} = srtObject[i]
    text.split('\n').forEach(t => {
      tmp.push({
        text: t,
        start,
        duration,
        end
      })
    })
  }
  srtObject = tmp

  let lastImagePragraphIndex = -1
  let lastImagePragraphTime = -1

  // console.log(`srtObject.length `, srtObject.length )
  // console.log(`timeMarkList`, timeMarkList )
  if (srtObject.length === 0) {
    return await noCaption(utID, timeMarkList)
  }

  for (let i = 0; i < srtObject.length; i++) {
    let {text, start, duration, end} = srtObject[i]
    text = text.trim()
    // console.log(text)
    text = SentenceAppendPeriod(text)

    // if (containsChineseCharacters(text)) {
    //   hasChineseCharacters = true
    // }
    // console.log(timeMarkList.length, start, timeMarkList[0])
    if (timeMarkList.length > 0 && start > timeMarkList[0].time) {
      // console.log('timeMark', text)
      if (sentences.length > 0) {
        paragraphs.push(sentences)
      }

      if (paragraphs[(paragraphs.length - 1)][0].text.startsWith('<p><img src="') === false) {
        paragraphs.push([
          await CaptionScreenshot(utID, timeMarkList[0].time)
        ])
      }
      paragraphs.push([
        getTimeMarkItem(utID, timeMarkList[0])
      ])
      lastImagePragraphIndex = paragraphs.length
      lastImagePragraphTime = timeMarkList[0].time
        
      sentences = [{text, start}]

      if (end) {
        lastEnd = end
      }
      else {
        lastEnd = start + duration
      }
      
      timeMarkList.shift()
      continue
    }

    if (sentences.length >3 && testIsNextParagraphEnd(text)) {
      // console.log('結尾', text)
      sentences.push({text, start})
      paragraphs.push(sentences)

      let time = start + duration
      if ((time - lastImagePragraphTime) > ScreenshotInterval) {
        paragraphs.push([
          await CaptionScreenshot(utID, time)
        ])
        lastImagePragraphTime = time
      }
      sentences = []
        

      if (end) {
        lastEnd = end
      }
      else {
        lastEnd = start + duration
      }
        
      continue
    }

    // console.log('開頭', text)
    if (sentences.length >3 && testIsNextParagraphStart(text)) {
      // console.log('開頭', text)
      if (sentences.length > 0) {
        paragraphs.push(sentences)
      }
      
      let time = start + duration
      if ((time - lastImagePragraphTime) > ScreenshotInterval) {
        
        paragraphs.push([
          await CaptionScreenshot(utID, time)
        ])
        lastImagePragraphTime = time
      }
      sentences = [{text, start}]
      
      lastEnd = start
        
      continue
    }

    if (lastEnd === false) {
      // console.log(text, lastEnd)
      sentences.push({text, start})
      continue
    }
    
    if ((start - lastEnd) > paragraphInterval) {
      // console.log('換句', start, lastEnd)
      if (sentences.length > 0) {
        paragraphs.push(sentences)
      }

      let time = start
      // console.log(time, lastImagePragraphTime)
      if ((time - lastImagePragraphTime) > ScreenshotInterval) {
        paragraphs.push([
          await CaptionScreenshot(utID, time)
        ])
        lastImagePragraphTime = time
      }

      // text = `[!!!]` + text
      sentences = [{text, start}]

      if (end) {
        lastEnd = end
      }
      else {
        lastEnd = start + duration
      }
        
      continue
    }

    sentences.push({text, start})
    
    if (end) {
      lastEnd = end
    }
    else {
      lastEnd = start + duration
    }
  }

  if (sentences.length > 0) {
    paragraphs.push(sentences)
  }

  // console.log(paragraphs)

  // --------------------
  // 分割
  let output = []
  paragraphs.map (sentences => {
    if (sentences.length < maxSentencesInParagraph) {
      output.push(sentences)
      return
    }

    let split = 2
    while (sentences.length / split > maxSentencesInParagraph) {
      split++
    }

    let splitedSentences = splitArray(sentences, split)
    output = output.concat(splitedSentences)
  })

  // --------------------
  // 插入圖片
  lastImagePragraphTime = -1
  let outputScreenshots = []
  for (let i = 0; i < output.length; i++) {
    let o = output[i]
    let {text, start} = o[0]

    if (!text) {
      continue
    }

    if (text.startsWith('<p><img src="')) {
      lastImagePragraphTime = start

      outputScreenshots.push(o)
      continue
    }

    if (start - lastImagePragraphTime > ScreenshotInterval) {
      outputScreenshots.push([
        await CaptionScreenshot(utID, start)
      ])
    }

    outputScreenshots.push(o)
  }

  // --------------------
  // 合併
  // console.log('Count paragraphs', output.length)
  return outputScreenshots.map (sentences => {
    sentences = sentences.map(sentence => sentence.text)
    return '<p style="max-width: calc(100vw - 1rem);  word-wrap: break-word; overflow-wrap: break-word; ">' + SentenceAppendPeriod(sentences.join('').trim()) + '</p>'
    // return sentences.join('').trim()
  // }).join('\n')
}).join('')
}

function splitArray(array, split = 3) {
  const length = array.length;
  const third = Math.floor(length / split);

  let output = []
  while (array.length > 0) {
    output.push(array.splice(0, third));
  }

  return output
}

async function noCaption (utID, timeMarkList = []) {
  if (timeMarkList.length === 0) {
    return ''
  }

  let paragraphs = []
  // console.log(timeMarkList)

  for (let i = 0; i < timeMarkList.length; i++) {
      paragraphs.push([
        getTimeMarkItem(utID, timeMarkList[i])
      ])
      paragraphs.push([
        await CaptionScreenshot(utID, timeMarkList[i].time)
      ])
      // console.log(paragraphs)
    }
    return paragraphs.map (sentences => {
        sentences = sentences.map(sentence => sentence.text)
        return '<p style="max-width: calc(100vw - 1rem);  word-wrap: break-word; overflow-wrap: break-word; ">' + SentenceAppendPeriod(sentences.join('').trim()) + '</p>'
        // return sentences.join('').trim()
      // }).join('\n')
    }).join('')
}

function getTimeMarkItem(utID, timeMark) {
  return {text: `<a href="https://youtu.be/${utID}&t=${timeMark.time}" target="_blank"><strong># ${timeMark.title}</strong></a>`, start: timeMark.time}
}

module.exports = CaptionFormat