const { Tool } = require('langchain/tools');
const qs = require('qs');

const axios = require('axios');

class MicrosoftGraph extends Tool {

  constructor(fields) {
    super();
    this.name = 'microsoft-graph';
    this.description = 'Use the \'microsoft-graph\' tool to retrieve search results from Graph';
    this.tenantId = process.env.MS_GRAPH_TENANT_ID;
    this.clientId = process.env.MS_GRAPH_CLIENT_ID;
    this.clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
    this.resourceName = process.env.AZURE_RESOURSE_NAME;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION
    this.azureOpenAIKey = process.env.AZURE_OPENAI_API_KEY
  }

  async getGraphTokenFromRefresh(refresh_token){
    const tenantId = process.env.OPENID_TENANT_ID;
    const clientId = process.env.OPENID_CLIENT_ID;
    const clientSecret = process.env.OPENID_CLIENT_SECRET;
    const scope = process.env.OPENID_SCOPE + " " + process.env.OPENAI_GRAPH_SCOPES;
    const body = {
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token,
      scope
    }

    try{
      const response = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,  qs.stringify(body) , {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    
      return response.data.access_token;
    } catch (e){
      console.error (e)
    }

  }

  /**
   * Recieves the query and user personal information to create Graph API request
   * @Organization Intelequia
   * @Author Enrique M. Pedroza Castillo
   * @param {*} query 
   * @param {*} userInfo 
   * @returns Object
   */
  async getGraphApi(query) {
    const url = `https://${this.resourceName}.openai.azure.com/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`
    const headers = {
      "api-key": this.azureOpenAIKey,
      "Content-Type": "application/json"
    }
    const now = new Date()

    const instructions = [
      `Dime el body de una llamada a la API de Microsoft Graph para obtener "${query}".`,
      `Ten en cuenta que la peticion se hara desde una aplicacion con permisos delegados`,
      `El resultado me lo devuelves en json, y en un campo del json me pones la URL a la que tengo que llamar, en otro el tipo de llamada (si es POST, GET, PATCH, etc.) y en otro campo el body del mensaje.`,
      `Ciñete a responderme el mensaje en json y nada más.`,
      `Me vas a limitar los resultados a 10.`,
      `No uses urls con variables como {chat-id} o {user-id}`,
      `Ten en cuenta que la fecha actual es: ${now}`
    ]
    const message = instructions.join(' ');
    const body = {
      "messages": [
        {
          "role": "user",
          "content": message
        }
      ],
      "temperature": 0.7,
      "top_p": 0.95,
      "max_tokens": 800
    }
    const { data } = await axios.post(url, body, { headers })
    const { choices } = data
    const responseMessage = choices[0].message.content
    const jsonString = responseMessage.replace(/```json\n|\n```/g, '').trim();
    return JSON.parse(jsonString);
  }

  /**
   * Creates Client to make requests to MS Graph
   * @Organization Intelequia
   * @Author Enrique M. Pedroza Castillo
   * @returns 
   */

  async createClient(userEmail, url) {
    const cachedToken = global.myCache.get( userEmail + "-graph" )
    const userAccessToken = await this.getGraphTokenFromRefresh ( cachedToken )

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${userAccessToken}`
        }
      });
      return JSON.stringify(response.data);
    } catch (error) {
      console.error('Error en la llamada a Graph API:', error);
      console.error('URL Requested: ',url)
      if(error.status == 403)
        return "You dont have permission"
      if(error.status == 401 && userAccessToken == undefined)
        return "Your Sesion has expired, Log in again"
    }
  }

  createFilter(parts) {
    return parts.join(' OR ');
  }

  /**
   * Method that Search User Data in Graph for self information requests
   * @Author Enrique M. Pedroza Castillo
   * @Organization Intelequia
   * @param {*} user email 
   * @returns String 
   */
  async getUserId(email) {
    const result = await this.client.api(`/users/${email}`).get();
    return JSON.stringify(result);
  }

  async _call(data) {
    global.appInsights.trackEvent({
      name: 'Plugin',
      properties: {
        toolName: data.toolName ?? "microsoft-graph",
        userEmail: data.userEmail ?? "",
        assistantId: data.assistant ?? ""
      },
    });

    const query = data.query ?? data;
    const graphSpecs = await this.getGraphApi(query)
    return await this.createClient(data.userEmail, graphSpecs.url);
  }
}

module.exports = MicrosoftGraph;