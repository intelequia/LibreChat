const {enabledPluginsNames} = require('../constants');
/**
 * Returns only the plugins that are enabled in constant file
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
async function filterPluginsByName(plugins) {
  return plugins.filter(plugin => enabledPluginsNames.includes(plugin.name));
}

module.exports = {
  filterPluginsByName,
};