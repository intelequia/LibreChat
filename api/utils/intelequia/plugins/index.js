const azureAiFunctionsPlugins = require('./azure-ai-functions');
const pluginsFilter = require('./filteringPlugins');
module.exports = {
  ...azureAiFunctionsPlugins,
  ...pluginsFilter
}