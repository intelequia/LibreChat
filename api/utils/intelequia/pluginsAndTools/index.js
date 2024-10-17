const azureAiFunctionsPlugins = require('./azure-ai-functions');
const pluginsAndTools = require('./pluginsAndTools');
const specifications = require ('./specifications')
module.exports = {
  ...azureAiFunctionsPlugins,
  ...pluginsAndTools,
  ...specifications
}