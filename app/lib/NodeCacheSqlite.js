
let enableCache = true
// enableCache = false

const sqliteStore = require('cache-manager-sqlite')
const cacheManager = require('cache-manager')

/* global path, __dirname, cacheClass, sequelize, databases, databaseName */
const cachePath = '/cache/'
const path = require('path')
const fs = require('fs')

function isAsyncFunction(func) {
  return func.constructor.name === 'AsyncFunction';
}

const NodeCacheSqlite = {
  databases: {},
  getDatabase: async function (databaseName) {

    if (typeof(databaseName) !== 'string') {
      console.trace(['databaseName is invalid: ', JSON.stringify(databaseName), (new Date().toISOString())].join('\t'))
    }

    if (this.databases[databaseName]) {
      return this.databases[databaseName]
    }

    this.databases[databaseName] = cacheManager.caching({
      store: sqliteStore,
      name: 'cache',
      path: path.join(cachePath, 'node-cache-sqlite_' + databaseName + '.sqlite')
    })

    // console.log(path.join(cachePath, databaseName + '.sqlite'), fs.existsSync(path.join(cachePath, databaseName + '.sqlite')))

    return this.databases[databaseName]
  },
  get: async function (databaseName, key, value, expire) {
    // console.log(databaseName)
    let database = await this.getDatabase(databaseName)

    let result = await database.get(key)

    if (!expire || (result === undefined && value !== undefined)) {
      result = await this.set(databaseName, key, value, expire)
    }
    else {
      console.log(['[CACHE] hitted', databaseName, key, expire, (new Date().toISOString())].join('\t'))
    }
    return result
  },
  set: async function (databaseName, key, value, expire) {
    // console.log(databaseName)
    let database = await this.getDatabase(databaseName)

    let result = value
    if (typeof(value) === 'function') {
      try {
        if (isAsyncFunction(value)) {
          result = await value()
          
        }
        else {
          result = value()
        }
      }
      catch (e) {
        return undefined
      }
      // console.log(key, result)
      if (result !== undefined) {
        await database.set(key, result, { ttl: expire / 1000})
      }
        
    }
    else {
      // console.log(key, result)
      await database.set(key, result, {ttl: expire / 1000})
    }
    return result
  },
  isExists: async function (databaseName, key) {
    // return ((await this.get(databaseName, key)) !== undefined)
    let database = await this.getDatabase(databaseName)
    let result = await database.get(key)

    // console.log('[CACHE]', 'isExists', key, result, (result !== undefined && result !== null))

    return (result !== undefined && result !== null)
  },
  clear: async function (databaseName, key) {
    // await database.del(key)
    if (await this.isExists(databaseName, key)) {
      let database = await this.getDatabase(databaseName)
      await database.set(key, undefined, {ttl: 0})
    }
    console.log([`[CACHE] clear`, databaseName, key, (new Date().toISOString())].join('\t'))
    return true
  }
}

module.exports = NodeCacheSqlite  