const { Tool } = require('langchain/tools');
const axios = require('axios');

class Dataverse extends Tool {

  constructor(fields) {
    super();
    this.name = 'dataverse';
    this.description =  'Use the \'dataverse\' tool to retrieve search results from Dataverse/Dynamics';

    this.dataverseURL = process.env.DATAVERSE_URL;

    this.resourceName = process.env.AZURE_RESOURSE_NAME;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION;
    this.azureOpenAIKey = process.env.AZURE_OPENAI_API_KEY;
  }

  /**
   * Recieves the query and generate url to call dataverse api
   * @Organization Intelequia
   * @Author Pablo Suarez Romero
   * @param {*} query 
   * @param {*} userInfo 
   * @returns Object
   */
  async getDataverseApi(query){
    const url = `https://${this.resourceName}.openai.azure.com/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`
    const headers = {
      "api-key" : this.azureOpenAIKey,
      "Content-Type" : "application/json"
    }

    const now = new Date()

    const systemPrompt = [
      `Dime el body de una llamada a la API de Dataverse para obtener "${query}".`,
      `Ten en cuenta que la peticion se hara desde una aplicacion con permisos delegados.`, 
      `El resultado me lo devuelves en json, y en un campo del json me pones la URL a la que tengo que llamar, en otro el tipo de llamada (si es POST, GET, PATCH, etc.) y en otro campo el body del mensaje.`,
      `Ciñete a responderme el mensaje en json y nada más.`, 
      `Me vas a limitar los resultados a 10.`,
      `La url de dynamics es ${this.dataverseURL} puedes sacar la información de las tablas incidents, accounts filtrado por la query`,
      `En la tabla incidents los campos más importantes son title, ticketnumber, description, createdon, customerid_account (es el id de la tabla account).`,
      `En la tabla account los campos importantes son name, description, inteleq_addressplaceholder, telephone1, inteleq_intereses.`,
      `Recuerda filtrar los datos por lo que pide el usuario, usa la documentacion ofical para de la API de Dynamics 365 (Dataverse)para filtrar OData.`,
      `Todas las busquedas son por nombres nunca va a ser por id`,
      `Ten en cuenta que la fecha actual es: ${now}`
    ]
    
    const message = systemPrompt.join(' ');


    const body = {
      "messages":[
        {
          "role" : "user",
          "content" :  message
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
   * Call dataverse api and returns data
   * @Organization Intelequia
   * @Author Pablo Suarez Romero
   * @param {*} dynamicsRequest 
   * @param {*} token 
   * @returns Object
   */
  async searchInDynamics(dynamicsRequest, token) {
    const { url, method, body } = dynamicsRequest;

    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await axios({
        method: method,
        url: url,
        headers: headers,
        data: body
      });

      return JSON.stringify(response.data);
    } catch (error) {
      console.error("Error fetching data from Microsoft Dynamics 365:", error);
      if(error.status == 400)
        return "Try again later"
      if(error.status == 403)
        return "You dont have permission"
      if(error.status == 401 && token == undefined)
        return "You need to login again"
      throw new Error("Unable to retrieve data from Dynamics 365");
    }
  }


  async _call(data) {
    global.appInsights.trackEvent({
      name: 'Plugin',
      properties: {
        toolName: data.toolName ?? "dataverse",
        userEmail: data.userEmail ?? "",
        assistantId: data.assistant ?? ""
      },
    });

    const token =  await global.myCache.get(data.userEmail.toString() + '-dynamics');  

    const dynamicsRequest = await this.getDataverseApi(data.query);
    const search = await this.searchInDynamics(dynamicsRequest, token);
    return search;
  }
}

module.exports = Dataverse;