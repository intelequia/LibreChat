const azureAiFunctionsPlugins = require('./implementations');
const pluginsAndTools = require('./pluginsAndTools');
const specifications = require ('./specifications')
module.exports = {
  ...azureAiFunctionsPlugins,
  ...pluginsAndTools,
  ...specifications
}