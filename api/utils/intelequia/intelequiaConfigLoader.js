const fetch = require('node-fetch');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const User = require('~/models/User');
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

  if(url && url != ""){

    const graphClient = await createGraphClient()
    const result = await loadPermissionConfigFiles (url)
    const {permissions, assistantCreator, functions} = result;

    global.myCache.set("functions", functions);
    global.myCache.set("assistantCreator", assistantCreator);
    global.myCache.set("permissions", permissions);

    await loadUserGroupsFromGraph(graphClient)
    await updateUsersRoles(graphClient)
  }
  else{
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
async function createGraphClient(){
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
 * Checks GRAPH groups that has permissions to AssistantCreator and updates users roles to ADMIN
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
async function updateUsersRoles(graphClient){

  const adminGroups = global.myCache.get("assistantCreator"); 

  try{
    let usersToAdmin = [];
    adminGroups.map(async (group) => {
      let url = '/groups/' + group + "/members"

      const {value} = await graphClient.api(url).get();

      for (const user of value) {

        const {mail} = user
        const dbUserId = await User.findOne({ email:mail }).select('_id').lean();

        if (dbUserId && !usersToAdmin.includes(dbUserId)) 
          usersToAdmin.push(dbUserId);
        
      }
      await User.updateMany({ _id: { $in: usersToAdmin } }, { $set: { role: 'ADMIN' } });
      usersToAdmin = [];
    })

  }catch(e){
    console.log(e)
    logger.error(`[intelequiaConfigLoader] Fetching azure groups: Fetching remote configuration file at URL "${url}"`);
  }
}


/**
 * Connects with Azure Graph Api to get all the groups of users within database by its email 
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
async function loadUserGroupsFromGraph(graphClient){
  logger.info(`[intelequiaConfigLoader] Fetching azure groups: Downloading groups from azure `);
  
  const users = await User.find({  }).select('email').lean();
  var userEmails = [];

  users.map((user) => {
    userEmails.push(user.email);
  })

  var filter = "";
  for(let i = 0; i < userEmails.length; i++){
    if( i % 15 == 0 ){
      try {
        // Value is parameter inside Graph API response
        const {value} = await graphClient.api('/users?$select=id,mail&$filter=' + filter).get();
        for (const user of value) {
          const result = await graphClient.api('/users/' + user.id + '/joinedTeams').get();
          var userGroups = result.value;
          var groupsIds = [];
          
          for (const group of userGroups) 
            groupsIds.push(group.id);
          const dbUser = users.find(u => u.email == user.mail);
    
          global.myCache.set(dbUser._id.toString(), groupsIds,process.env.USER_GROUPS_CACHE_TTL);
        }
        filter = "";
      } catch (error) {
        console.log(error)
        logger.error(`[intelequiaConfigLoader] Fetching azure groups: Fetching remote configuration file at URL "${url}"`);
      }
    }
    else{
      filter = userEmails.map(email => `userPrincipalName eq '${email}'`).join(' or ');
      filter += `userPrincipalName eq '${userEmails[i]}'`;

      if( !( (i+1) % 15 == 0 || i == userEmails.length - 1)){
        filter += ' or ';
      }
    }
  }
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
  try{
    const response = await fetch(url);
    if(response.ok){
      return await response.json();
    }
  } catch(e){
    console.log(e)
    logger.error(
      `[validateTools] fetch remote configuration file: Error fetching remote functions at URL "${url}": ${response.statusText} (HTTP ${response.status})`,
    );
  }
}


/**
 * Verifies if user groups are updated in cache, if not updates them with token specified groups
 * @param {*} jwt 
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */
async function updateUserInfoInCache(jwt,user) {
  let userIdToken = jwtDecode(jwt)
  var userCachedGroups = global.myCache.get(user._id.toString());

  if (userCachedGroups != null && userCachedGroups.length > 0 ){
    const userGroupsInToken = userIdToken["groups"]

    // verify if two arrays are equal
    const containsAll = (arr1, arr2) => 
      arr2.every(arr2Item => arr1.includes(arr2Item))
      
    const sameMembers = (arr1, arr2) => 
      containsAll(arr1, arr2) && containsAll(arr2, arr1);

    const areGroupsUpdated = sameMembers(userCachedGroups, userGroupsInToken)
    
    if(!areGroupsUpdated){
      global.myCache.set(user._id.toString(), userIdToken.groups, process.env.USER_GROUPS_CACHE_TTL)

      const adminGroups = global.myCache.get("assistantCreator");
      const isAdmin = adminGroups.some(adminGroup => userIdToken.groups.includes(adminGroup));

      if(isAdmin)
        await User.updateOne({ _id: user._id }, { $set: { role: 'ADMIN' } });
    };

  }
  else{
    global.myCache.set(user._id.toString(), userIdToken.groups, process.env.USER_GROUPS_CACHE_TTL);  
    const adminGroups = global.myCache.get("assistantCreator");
    const isAdmin = adminGroups.some(adminGroup => userIdToken.groups.includes(adminGroup));

    if(isAdmin)
      await User.updateOne({ _id: user._id }, { $set: { role: 'ADMIN' } });
  }

}

async function SaveFunctionsInCache(AssistantList){
  var functions = global.myCache.get("functions");
  AssistantList.forEach((assistant) => {
    assistant.tools.forEach((tool) => {
      if(tool.function){
        if (IsToolAFunction(tool.function.name)) {
          functions.forEach((func) => {
            if(func.name == tool.function.name){
              func.specifications = tool
            }
          });
        }
      }
    });
  });
  global.myCache.set("functions", functions, process.env.FUNCTIONS_CACHE_TTL);
}

async function GetFunctionSpecification(ToolName){
    const functions = global.myCache.get("functions");
    const f = functions.find((func) => func.name === ToolName);
    return f.specifications;  
}

async function IsToolAFunction(ToolName){
  const functions = global.myCache.get("functions");
  return functions.some((func) => func.name === ToolName);
}

module.exports =  {intelequiaConfigLoader, updateUserInfoInCache, IsToolAFunction, SaveFunctionsInCache, GetFunctionSpecification};