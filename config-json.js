let CONFIG = {
  publicURL: `https://democwise2016.github.io/action-MOOC-Podcast-202405/`,
  publicURLShorten: `https://rb.gy/hc67di`,  // https://democwise2016.github.io/action-MOOC-Podcast-202405/
  thumbnailBorderColor: '8E0045',
  titleAppend: '[MC+202405]',
  titleSuffix: '[MC+202405]',
  idAppend: false,

  maxDownloadItemPerFeed: 500000,
  maxDownloadFeed: 5000000,
  newArrialMax: 500000,
  maxDownloadItems: 1000000,
  maxExcutionMinutes: 15,
  maxSameTime: 2,
}

// let test = '1780'
// CONFIG.publicURL = `https://dangerous-lizard-99.telebit.io/`
// CONFIG.titleAppend = '[MC+] 20240125-' + test
// CONFIG.idAppend = '20240125-' + test
// CONFIG.maxDownloadItemPerFeed = 100
// CONFIG.debug = true

module.exports = CONFIG
