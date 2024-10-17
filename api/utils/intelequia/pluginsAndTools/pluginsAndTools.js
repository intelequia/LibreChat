const {enabledPluginsNames, intelequiaTools} = require('../constants');
/**
 * Returns only the plugins that are enabled in constant file
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
async function filterPluginsByName(plugins) {
  return plugins.filter(plugin => enabledPluginsNames.includes(plugin.name));
}

/**
 * Returns only the tools that are enabled in constant file
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
async function isToolEnabled(tool) {
  return intelequiaTools.includes(tool);
}

module.exports = {
  filterPluginsByName,
  isToolEnabled
};