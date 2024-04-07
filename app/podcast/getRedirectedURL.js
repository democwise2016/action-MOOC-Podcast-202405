const { http, https } = require('follow-redirects')

const getRedirectedURL = function (url) {
  return new Promise((resolve, reject) => {
    let protocal = http
    if (url.startsWith('https://')) {
      protocal = https
    }
    
    protocal.get(url, response => {
      resolve(response.responseUrl)
    }).on('error', err => {
      reject(err);
    });
  })
}

module.exports = getRedirectedURL