const fetch = require('node-fetch');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
// const { findUser, createUser, updateUser } = require('~/models');
const { logger } = require('~/config');
const jwtDecode = require('jsonwebtoken/decode');

/**
 * Manage all permission operations, loads, saves parameters and configure users role
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 * @param {} url  URL to fetch the functions
 * @returns {Object} JSON object with the functions
 */
async function intelequiaConfigLoader() {
  const url = process.env.REMOTE_CONFIG_FILE_URL;

  if (url && url != "") {
    logger.info("[IntelequiaConfigLoader] Loading GraphClient and Permissions files ...")
    const result = await loadPermissionConfigFiles(url)
    const { permissions, functions, assistantAdminRole } = result;

    global.myCache.set("functions", functions);
    global.myCache.set("permissions", permissions);
    global.myCache.set("assistantAdminRole", assistantAdminRole);

  }
  else {
    logger.error(
      `[validateTools] fetch remote configuration file: Error fetching remote functions at URL "${url}": ${response.statusText} (HTTP ${response.status})`,
    );
  }
}

/**
 * Creates Azure Graph Client instance 
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo 
 * @returns 
 */
async function createGraphClient() {
  const tenantId = process.env.OPENID_TENANT_ID;
  const clientId = process.env.OPENID_CLIENT_ID;
  const clientSecret = process.env.OPENID_CLIENT_SECRET;

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
        return tokenResponse.token;
      }
    }
  });
  return client;
}


/**
 * Fetch file with Azure OpenAI functions specifications
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 * @param {} url  URL to fetch the functions
 * @returns {Object} JSON object with the functions
 */

async function loadPermissionConfigFiles(url) {

  logger.info(`[validateTools] fetch remote configuration file: Fetching remote configuration file at URL "${url}"`);
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log(e)
    logger.error(
      `[validateTools] fetch remote configuration file: Error fetching remote functions at URL "${url}": ${response.statusText} (HTTP ${response.status})`,
    );
  }
}


/**
 * Load groups from token to cache, and check the admin
 * @param {*} jwt 
 * @param {*} user 
 * @Organization Intelequia
 * @Author Pablo Suárez Romero
 */
async function updateUserInfoInCache(jwt, user, updateUser) {
  let userIdToken = jwtDecode(jwt)

  const adminGroup = global.myCache.get("assistantAdminRole");

  let userGroupsInToken = userIdToken.groups

  global.myCache.set(user._id.toString(), userGroupsInToken, process.env.USER_GROUPS_CACHE_TTL)

  const role = userGroupsInToken ?
    (userGroupsInToken.includes(adminGroup) ? 'ADMIN' : 'USER') :
    'USER';
  const userId = user._id.toString();
  await updateUser(userId , { role });
  return role;
}

async function saveGraphToken(token, user) {
  global.myCache.set(user.email.toString() + "-graph", token, process.env.USER_GROUPS_CACHE_TTL);
}

async function SaveFunctionsInCache(AssistantList) {
  var functions = global.myCache.get("functions");
  AssistantList.forEach((assistant) => {
    assistant.tools.forEach((tool) => {
      if (tool.function) {
        if (IsToolAFunction(tool.function.name)) {
          functions.forEach((func) => {
            if (func.name == tool.function.name) {
              func.specifications = tool
            }
          });
        }
      }
    });
  });
  global.myCache.set("functions", functions, process.env.FUNCTIONS_CACHE_TTL);
}

async function GetFunctionSpecification(ToolName) {
  const functions = global.myCache.get("functions");
  const f = functions.find((func) => func.name === ToolName);
  return f.specifications;
}

async function IsToolAFunction(ToolName) {
  const functions = global.myCache.get("functions");
  return functions.some((func) => func.name === ToolName);
}

module.exports = {
  intelequiaConfigLoader,
  updateUserInfoInCache,
  IsToolAFunction,
  SaveFunctionsInCache,
  GetFunctionSpecification,
  saveGraphToken
};