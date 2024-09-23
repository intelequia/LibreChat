
const jwtDecode = require('jsonwebtoken/decode');

/**
 * Fetch remote assistants permission file, and returns list of assistants in wich the specified user has permissions.
 * @param {*} userId  user to verify permissions
 * @param {*} allAssistants complete list of assistant retrieved by remote API
 * @returns {Array} list of assistants in wich the specified user has permissions
 * @Organization Intelequia
 * @Author Enrique M. Pedroza Castillo
 */

async function verifyAssistantPermissions(userId, allAssistants) {
  const targetGroupIds = global.myCache.get(userId);
  const assistants = global.permissions;
  const result = [];

  if( targetGroupIds == null ){
    allAssistants.forEach((assistant) => {
      const exist = assistants.some((a) => a.assistant === assistant.id );
      if (!exist) {
        result.push(assistant);
      }
    })
    return result;
  }

  allAssistants.forEach((assistant) => {
    const exist = assistants.some((a) => a.assistant === assistant.id);
    if (!exist) {
      result.push(assistant);
    } else {
      assistants.forEach((assist) => {
        if (assist.assistant == assistant.id) {
          const matches = assist.groups.some((groupId) => {
            return targetGroupIds.includes(groupId);
          });

          if (matches) {
            result.push(assistant);
          }
        }
      });
    }
  });

  return result;
}

/**
 * Checks if user has permissions to configure assistants, and verifies if it has to return cached value
 * @param {*} headers 
 * @param {*} cachedValue 
 * @returns 
 */
async function verifyAssistantConfigurations(headers, cachedValue) {
  let jwt = '';
  let found = false;
  for (let header of headers) {
    if (header.includes('Bearer')) {
      jwt = header.replace('Bearer ', '');
      found = true;
      break;
    }
  }

  if (global.assistantCreator) {
    if (global.assistantCreator.length === 0) {
      return false;
    }
  } else {
    return true;
  }

  if (found && jwt !== 'undefined' && jwt !== '' && jwt !== 'null') {
    let userToken = jwtDecode(jwt);
    const userGroups = global.myCache.get(userToken.id);
    if (userGroups) {
      for (let group of userGroups) {
        if (global.assistantCreator.includes(group)) {
          return true;
        }
      }
    }
  }

  // en caso de que no exista jwt, verificamos si existe en cache
  if (cachedValue && (jwt === 'undefined' || jwt === '' || jwt === 'null')) {
    return cachedValue.userAssistantConfigPermission;
  }

  // por defecto no tiene permisos
  return false;
}

module.exports = {
  verifyAssistantPermissions,
  verifyAssistantConfigurations
};