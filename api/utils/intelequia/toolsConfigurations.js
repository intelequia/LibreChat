const { intelequiaTools } = require("./constants");
const {bingSearchSpecification, microsoftGraphSpecification } = require("./pluginsAndTools/specifications")
/**
 * Verifies if tool is defined in the tools configuration file and returns the tool instance
 * @param {*} tool 
 * @param {*} user 
 * @param {*} toolOptions 
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */


async function VerifyAzureAIFunctionsTool(tool, user, toolOptions, loadToolWithAuth, toolAuthFields, toolConstructors) {
  const azureOpenAIFunctions = global.myCache.get("functions");
  if(await isToolDefinedInFunctions(tool,azureOpenAIFunctions)){
    const options = toolOptions[tool] || {};
    const toolInstance = await loadToolWithAuth(
      user,
      toolAuthFields["azure-ai-functions"],
      toolConstructors["AzureAIFunctions"],
      options,
    );
    return {status:true, value:toolInstance};
  }
  return {status:false, value:null};
} 

/**
 * Verifies if tool is defined in intelquia tools and returns the tool instance
 * @param {*} tool 
 * @param {*} user 
 * @param {*} toolOptions 
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
async function VerifyIntelequiaToolInstance(tool, user, toolOptions, loadToolWithAuth, toolAuthFields, toolConstructors){
  if(intelequiaTools.includes(tool)){
    const options = toolOptions[tool] || {};
    const toolInstance = await loadToolWithAuth(
      user,
      toolAuthFields[tool],
      toolConstructors[tool],
      options,
    );
    return {status:true, value:toolInstance};
  }

  return {status:false, value:null};
}

/**
 * Verify if a tool is defined in the functions
 * @param {} tool  tool name
 * @param {} functions  JSON object with the functions
 * @returns {boolean} If its found or not
 * @Author Enrique M. Pedroza Castillo
 * @Organization Intelequia
 */

async function isToolDefinedInFunctions(tool,functions){
  return functions.some(f => f.name === tool);
}

/**
 * Returns Tool Specifications
 * @param {} tool  tool name
 * @Author Enrique M. Pedroza Castillo
 * @Organization Intelequia
 */

async function GetToolSpecification (tool){
  switch(tool){
    case "bing-search":
      return bingSearchSpecification
    case "microsoft-graph":
      return microsoftGraphSpecification
    }
}

module.exports = {
  VerifyAzureAIFunctionsTool,
  VerifyIntelequiaToolInstance,
  GetToolSpecification
};