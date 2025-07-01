const axios = require('axios');
const querystring = require('querystring');


/**
 * A call to microsoft login to refresh token with dynamics
 * @Organization Intelequia
 * @Author Pablo Suárez Romero 
 * @returns Token
 */
async function getDynamicsTokenFromRefresh(refresh_token){
  const tenantId = process.env.OPENID_TENANT_ID;
  const clientId = process.env.OPENID_CLIENT_ID;
  const clientSecret = process.env.OPENID_CLIENT_SECRET;
  const scope = process.env.OPENID_DYNAMICS_SCOPE;

  const response = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, querystring.stringify({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token,
    scope
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data.access_token;
}

async function updateDynamicsInCache(jwt,user) {

  const token = await getDynamicsTokenFromRefresh(jwt);
  await global.myCache.set(user.email + '-dynamics', token, process.env.USER_GROUPS_CACHE_TTL);  
}

module.exports =  {getDynamicsTokenFromRefresh, updateDynamicsInCache};