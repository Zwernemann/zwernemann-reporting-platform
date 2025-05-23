const config = require('./jsreport.config')
console.log('MZW in index')
module.exports = function (options) {
  config.options = options
  config.directory = __dirname
  return config
}