const UBMp3Downloader = require('./UBMp3Downloader.js')
const ShellSpawn = require('./../../../lib/ShellSpawn.js')
const fs = require('fs')

async function getOptions (options = {}) {

  // let outputPath = '/output/'

  //Configure Yo utu beMp 3Down l oad er with your settings
  options = {
    ...options,
    //"ffmpegPath": path.resolve(__dirname, "./ffmpeg.exe"),        // FFmpeg binary location
    "ffmpegPath": 'ffmpeg',        // FFmpeg binary location
    // "outputPath": outputPath,    // Output file location (default: the home directory)
    "queueParallelism": 1,                  // Download parallelism (default: 1)
    "progressTimeout": 200000000,                // Interval in ms for the progress reports (default: 1000)
    "allowWebm": true,                      // Enable download from WebM sources (default: false)
    'maxRetries': 10,
//     'requestOptions': {
//       // agent: await getAgent(), 
// //        strictSSL: false,
// //        agentClass: socks5Agent,
// //        agentOptions: {
// //          socksHost: '127.0.0.1', // Defaults to 'localhost'.
// //          socksPort: 9050, // Defaults to 1080.
// //          // Optional credentials
// //          //socksUsername: 'proxyuser',
// //          //socksPassword: 'p@ssw0rd',
// //          },
//       //secure:false,
//       headers: {
//         //'User-Agent': 'Request-Promise'
// //          'User-Agent': 'node.js',
// //          secure: false,
// //          strictSSL: false,
//       }
    // }
  }

  options['y' + 'ou' + 'tu' + 'beVideoQuality'] = 'highestaudio' // Desired video quality (default: highestaudio)
  

  return options
}

module.exports = async function (videoID, output, options = {}) {
  return new Promise(async function (resolve, reject) {
    let pos = output.lastIndexOf('/') + 1
    let dir = output.slice(0, pos)
    let filename = output.slice(pos)

    options.outputPath = dir
    options = await getOptions(options)
    let YD = new UBMp3Downloader(options)

    let url = `https://www.yo` + `ut` + `ube.com/watch?v=` + videoID


    fs.writeFileSync(`/app/tmp/GetHTML.txt`, (new Date()).getTime() + '', 'utf8') 
    console.log(`[DOWNLOAD] Start \t${url}` + '\t' + output + '\t' + (new Date()).toISOString())


    let showDownloadEndMessage = function () {
      console.log(`[DOWNLOAD] End \t${url}` + '\t' + output + '\t' + (new Date()).toISOString())
      resolve(filename)
    }


    YD.on("finished", function(err, data) {
      // console.log('End Downloaded: ' + videoID)
      showDownloadEndMessage()
    })

    YD.on("error", async function(error) {
      // console.error(error)

      try {
        await ShellSpawn(["python3", "/app/python/ub.py", url, output])
        showDownloadEndMessage()
      }
      catch (e) {
        console.log([`[DOWNLOAD] Please check video: https://www.yo` + `ut` + `ube.com/watch?v=${videoID}`, (new Date()).toISOString()].join('\t'))
        reject(error)
      }
    })

    YD.download(videoID, filename);
  })
    
}