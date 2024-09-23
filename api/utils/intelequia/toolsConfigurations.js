
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


module.exports = {
  VerifyAzureAIFunctionsTool,
};