'use strict';
var os = require('os');
var EventEmitter = require('events').EventEmitter;
var ffmpeg = require('fluent-ffmpeg');
var ytdl = require('ytdl-core');
var async = require('async');
var progress = require('progress-stream');
var sanitize = require('sanitize-filename');

class UBMp3Downloader extends EventEmitter {

    constructor(options) {
        super();
        this.ubBaseUrl = 'http://www.yo' + 'utu' + 'be.com/watch?v=';
        this.ubVideoQuality = (options && options.youtubeVideoQuality ? options.youtubeVideoQuality : 'highestaudio');
        this.outputPath = options && options.outputPath ? options.outputPath : os.homedir();
        this.queueParallelism = (options && options.queueParallelism ? options.queueParallelism : 1);
        this.progressTimeout = (options && options.progressTimeout ? options.progressTimeout : 1000);
        this.fileNameReplacements = [[/'/g, ''], [/\|/g, ''], [/'/g, ''], [/\//g, ''], [/\?/g, ''], [/:/g, ''], [/;/g, '']];
        this.requestOptions = (options && options.requestOptions ? options.requestOptions : { maxRedirects: 5 });
        this.outputOptions = (options && options.outputOptions ? options.outputOptions : []);
        this.allowWebm = (options && options.allowWebm ? options.allowWebm : false);

        if (options && options.ffmpegPath) {
            ffmpeg.setFfmpegPath(options.ffmpegPath);
        }

        this.setupQueue();
    }

    setupQueue() {
        let self = this;
        //Async download/transcode queue
        this.downloadQueue = async.queue(function (task, callback) {

            self.emit('queueSize', self.downloadQueue.running() + self.downloadQueue.length());

            self.performDownload(task, function(err, result) {
                callback(err, result);
            }).catch(function (err) {
              throw err
            });

        }, self.queueParallelism);
    }

    cleanFileName (fileName) {
        this.fileNameReplacements.forEach(function(replacement) {
            fileName = fileName.replace(replacement[0], replacement[1]);
        });
        return fileName;
    }

    parseVideoID (url) {

        if (!url) {
          return undefined
        }
      
        if (url.indexOf('user/', 5) === 0) { // 1.
          return false
        }
      
        //if ( preg_match('/^[a-zA-Z0-9\-\_]{11}$/', $url)) { // 2.
        //return $url;
        if (/^[a-zA-Z0-9\-\_]{11}$/.test(url)) {
          return url
        }
      
        let matchResult
        matchResult = url.match(/(?:watch\?v=|v\/|embed\/|ytscreeningroom\?v=|\?v=|\?vi=|e\/|watch\?.*vi?=|\?feature=[a-z_]*&v=|vi\/)([a-zA-Z0-9\-\_]{11})/)
        if (matchResult) {
          return matchResult[1]
        }
      
        matchResult = url.match(/([a-zA-Z0-9\-\_]{11})(?:\?[a-z]|\&[a-z])/)
        if (matchResult) {
          return matchResult[1]
        }
        
        matchResult = url.match(/u\/1\/([a-zA-Z0-9\-\_]{11})(?:\?rel=0)?$/)
        if (matchResult) {
          return false
        }
        
        matchResult = url.match(/(?:watch%3Fv%3D|watch\?v%3D)([a-zA-Z0-9\-\_]{11})[%&]/)
        if (matchResult) {
          return matchResult[1]
        }
      
        // 7. Rules for special cases
        matchResult = url.match(/watchv=([a-zA-Z0-9\-\_]{11})&list=/)
        if (matchResult) {
          return matchResult[1]
        }
      
        return false
    }

    download (videoId, fileName) {
        if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
            videoId = this.parseVideoID(videoId)
        }

        let self = this;
        const task = {
            videoId: videoId,
            fileName: fileName
        }

        // console.log(task)
    
        this.downloadQueue.push(task, function (err, data) {
    
            self.emit('queueSize', self.downloadQueue.running() + self.downloadQueue.length());
    
            if (err) {
                self.emit('error', err, data);
            } else {
                self.emit('finished', err, data);
            }
        });
    
    }

    async performDownload(task, callback) {
        let self = this;
        let info;
        const videoUrl = this.ubBaseUrl+task.videoId;
        let resultObj = {
            videoId: task.videoId
        };
        
        //console.log(self.requestOptions)

         try {
            info = await ytdl.getInfo(videoUrl, { 
              quality: this.ubVideoQuality,
              requestOptions: self.requestOptions
            })
         } catch (err){
            return callback(err);
         }
      
        var videoTitle = this.cleanFileName(info.videoDetails.title);
        var artist = 'Unknown';
        var title = 'Unknown';
        //var thumbnail = info.videoDetails.thumbnail.thumbnails[0].url || null;
        var thumbnail = info.videoDetails.thumbnails[0].url || null;
    
        if (videoTitle.indexOf('-') > -1) {
            var temp = videoTitle.split('-');
            if (temp.length >= 2) {
                artist = temp[0].trim();
                title = temp[1].trim();
            }
        } else {
            title = videoTitle;
        }

        //Derive file name, if given, use it, if not, from video title
        const fileName = (task.fileName ? self.outputPath + '/' + task.fileName : self.outputPath + '/' + (sanitize(videoTitle) || info.videoId) + '.mp3');

        //Stream setup

        const streamOptions =  {
            quality: self.youtubeVideoQuality,
            requestOptions: self.requestOptions
        };

        if (!self.allowWebm) {
            streamOptions.filter = format => format.container === 'mp4';
        }

        const stream = ytdl.downloadFromInfo(info, streamOptions);

        stream.on('error', function(err){
          callback(err, null);
        });

        let isOnProgress = false
        stream.on('response', function(httpResponse) {
            if (isOnProgress === true) {
                return false
            }
            isOnProgress = true

            //Setup of progress module
            const str = progress({
                length: parseInt(httpResponse.headers['content-length']),
                time: self.progressTimeout
            });
            // console.log(parseInt(httpResponse.headers['content-length']))
            // console.log(self.progressTimeout)

            //Add progress event listener
            str.on('progress', function(progress) {
                // console.log(progress)
                if (progress.percentage === 100) {
                    resultObj.stats= {
                        transferredBytes: progress.transferred,
                        runtime: progress.runtime,
                        averageSpeed: parseFloat(progress.speed.toFixed(2))
                    }
                }
                self.emit('progress', {videoId: task.videoId, progress: progress})
            });

            let outputOptions = [
                '-id3v2_version', '4',
                '-metadata', 'title=' + title,
                '-metadata', 'artist=' + artist,
                // '-pix_fmt', 'yuv360p',
                // '-ac', '1', 
                // '-ar', '48000',
                // '-acodec', 'pcm_s16le'
                // '-c:a', 'copy',
                // '-c:v', 'libx264'
            ];
            // console.log(outputOptions)
            if (self.outputOptions) {
                outputOptions = outputOptions.concat(self.outputOptions);
            }
            
            const audioBitrate = info.formats.find(format => !!format.audioBitrate).audioBitrate

            //Start encoding
            const proc = new ffmpeg({
                source: stream.pipe(str)
            })
            .audioBitrate(audioBitrate || 192)
            .withAudioCodec('libmp3lame')
            .toFormat('mp3')
            .outputOptions(...outputOptions)
            // .on('progress', function(progress) {
            //     console.log(progress)
            // })
            .on('error', function(err) {
                callback(err, null);
            })
            .on('end', function() {
              
                isOnProgress = false
              
                resultObj.file =  fileName;
                resultObj.youtubeUrl = videoUrl;
                resultObj.videoTitle = videoTitle;
                resultObj.artist = artist;
                resultObj.title = title;
                resultObj.thumbnail = thumbnail;
                callback(null, resultObj);
            })
            .saveToFile(fileName)

        });
    
    }

}

module.exports = UBMp3Downloader
