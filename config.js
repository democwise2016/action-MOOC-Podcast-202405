// const ItemFiltersPreset = require('./app/config/ItemFiltersPreset.js')
const ConfigCheck = require('./app/config/ConfigCheck.js')
const feedList = require('./config-list.js')
const ConfigJSON = require('./config-json.js')

let CONFIG = {
  ...ConfigJSON,

  feedList
}

module.exports = async function () {
  return await ConfigCheck(CONFIG)
}