const availableTools = require('./manifest.json');

// Structured Tools
const DALLE3 = require('./structured/DALLE3');
const StructuredWolfram = require('./structured/Wolfram');
const StructuredACS = require('./structured/AzureAISearch');
const StructuredSD = require('./structured/StableDiffusion');
const GoogleSearchAPI = require('./structured/GoogleSearch');
const TraversaalSearch = require('./structured/TraversaalSearch');
const TavilySearchResults = require('./structured/TavilySearchResults');
/**
 * Intelequia Plugins
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
const {
  AzureAIFunctions,
  Dataverse,
  MicrosoftGraph,
  BingSearch
} = require("~/utils")

module.exports = {
  availableTools,
  // Structured Tools
  DALLE3,
  StructuredSD,
  StructuredACS,
  GoogleSearchAPI,
  TraversaalSearch,
  StructuredWolfram,
  TavilySearchResults,
  TraversaalSearch,
  // Intelequia Plugins
  AzureAIFunctions,
  Dataverse,
  MicrosoftGraph,
  BingSearch
};
