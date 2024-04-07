const feedList = require('./config-list.js')
const jsonList = require('./config-json.js')
const ConfigCheck = require('./app/config/ConfigCheck.js')

let CONFIG = {
  ...jsonList,
  feedList
}

module.exports = ConfigCheck(CONFIG)