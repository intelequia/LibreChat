const { Tool } = require('langchain/tools');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
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

  /**
   * Recieves the query and user personal information to create Graph API request
   * @Organization Intelequia
   * @Author Enrique M. Pedroza Castillo
   * @param {*} query 
   * @param {*} userInfo 
   * @returns Object
   */
  async getGraphApi(query, userInfo){
    const url = `https://${this.resourceName}.openai.azure.com/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`
    const headers = {
      "api-key" : this.azureOpenAIKey,
      "Content-Type" : "application/json"
    }
    const message = `Dime el body de una llamada a la API de Microsoft Graph para obtener "${query}".Ten en cuenta que la peticion se hara desde una aplicacion, con lo cual /me no funcionara. El resultado me lo devuelves en json, y en un campo del json me pones la URL a la que tengo que llamar, en otro el tipo de llamada (si es POST, GET, PATCH, etc.) y en otro campo el body del mensaje. Ciñete a responderme el mensaje en json y nada más. Me vas a limitar los resultados a 10. En caso de que necesites informacion de mi usuario usa lo siguiente: ${userInfo}`
    const body = {
      "messages":[
        {
          "role" : "user",
          "content" : message
        }
      ],
      "temperature": 0.7,
      "top_p": 0.95,
      "max_tokens": 800
    }
    const {data} = await axios.post(url,body,{headers})
    const {choices} = data
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
  async createClient() {
    const credential = new ClientSecretCredential(this.tenantId, this.clientId, this.clientSecret);

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
          return tokenResponse.token;
        }
      },

    });
    return client;
  }

  createFilter(parts) {
    return parts.join(' OR ');
  }

  /**
   * Makes the request to MS Graph and retrieves the data
   * @Organization Intelequia
   * @Author Enrique M. Pedroza Castillo 
   * @param {*} url 
   * @returns String
   */
  async searchInGraph(url) {
    const graphUrl = url.replace("https://graph.microsoft.com/v1.0/","")

    try {
      const { value } = await this.client.api(graphUrl).get();
      return JSON.stringify(value);
    } catch (error) {
      console.error("Error fetching users from Microsoft Graph:", error);
      throw new Error("Unable to retrieve user information");
    }
  }

  /**
   * Method that Search User Data in Graph for self information requests
   * @Author Enrique M. Pedroza Castillo
   * @Organization Intelequia
   * @param {*} user email 
   * @returns String 
   */
  async getUserId(email){
    const result = await this.client.api(`/users/${email}`).get();
    return JSON.stringify(result);
  }

  async _call(data) {
    this.client = await this.createClient();

    const userInfo = await this.getUserId(data.userEmail)
    const graphSpecs =  await this.getGraphApi(data.query, userInfo)
    return await this.searchInGraph(graphSpecs.url)
  }
}

module.exports = MicrosoftGraph;