
const jwtDecode = require('jsonwebtoken/decode');


/**
 * Fetch remote assistants permission file, and returns list of assistants in wich the specified user has permissions.
 * @param {*} userId  user to verify permissions
 * @param {*} allAssistants complete list of assistant retrieved by remote API
 * @returns {Array} list of assistants in wich the specified user has permissions
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */

async function checkGroupPermissions(userId, allAssistants, permissionsNodeName) {
  const assistants = global.myCache.get(permissionsNodeName);
  const result = [];

  if (!assistants || assistants.length === 0) {
    // If no assistant permissions are defined, return all assistants  
    return allAssistants;
  }

  const {findUser} = require('~/models');
  const user =  await findUser({ _id: userId });  
  if (!user.groups || user.groups.length === 0) {
    // If no groups are defined for the user, return empty result
    return result;
  }
  
  allAssistants.forEach((assistant) => {
    const assist = assistants.find(a => a.assistant === assistant.id) 
    if(assist && assist.groups) {
      const matches = assist.groups.some((groupId) => {
        return user.groups.includes(groupId);
      });
      if (matches) {
        result.push(assistant);
      }
    }else{
      result.push(assistant);
    }
  })

  return result;
}

module.exports = {
  checkGroupPermissions
};