// const EventEmitter = require('events');



module.exports = function () {
  // const emitter = new EventEmitter();

  // Set a higher limit for this specific EventEmitter instance (e.g., 20 listeners)
  process.setMaxListeners(0);
}