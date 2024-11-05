const { Tool } = require('langchain/tools');
const axios = require('axios');
const intelequiaCountTokens = require('../../intelequiaTokenCount')
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

    this.userId = fields.userId;

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

    const getDataverseTableSchema = [
      `Necesito que en base a esta consulta "${query}" me digas a que endpoint llamar.`,
     ` El resultado me lo devuelves en json, en este json vas a poner en el atributo 'apiSchema' la consulta que corresponda.`
      `Ciñete a responderme el mensaje en json y nada más. `
      `Solo vas a proporcionar la siguiente URL Cambiando [Nombre de tabla] por el valor correspondiente`
      `La url base sera siempre la misma "https://intelequia.crm4.dynamics.com/api/data/v9.2/EntityDefinitions(LogicalName='[Nombre de tabla]')/Attributes?$select=LogicalName,Description".`
     ` Si la consulta es sobre un proyecto la tabla sera 'cr794_proyecto'`
      `Si la consulta es sobre un cliente la tabla sera 'account',`
      `Si la consulta es sobre un Usuario la tabla sera 'systemuser',`
     ` Si la consulta es sobre un Equipo la tabla sera 'team',`
    ]

    const systemPrompt = [
      `Dime el body de una llamada a la API de Dataverse para obtener "${query}".`,
      `Ten en cuenta que la peticion se hara desde una aplicacion con permisos delegados.`, 
      `El resultado me lo devuelves en json, y en un campo del json me pones la URL a la que tengo que llamar, en otro el tipo de llamada (si es POST, GET, PATCH, etc.) y en otro campo el body del mensaje.`,
      `Ciñete a responderme el mensaje en json y nada más.`, 
      `Me vas a limitar los resultados a 10.`,
      `La url de dynamics es ${this.dataverseURL}.`,
      `Puedes sacar toda la información de las tablas: quote (que llamaras si te preguntan por ofertas), cr794_proyecto, entitlement, activitypointer, contact, opportunity, incidents, accounts filtrado por la query`,
      `En la tabla incidents vas a tener la propiedad customerid_account que es el id de la tabla account.`,
      `En la tabla opportunity vas a tener la propiedad contactid es el id de la tabla contact`,
      `En la tabla cr794_proyecto vas a tener cr794_cliente: Referencia a la entidad Cliente, cr794_cliente: Referencia a la entidad Cliente, cr794_equiponame: Nombre del equipo asignado, cr794_jefedeequipo: Referencia al jefe del equipo asignado al proyecto, cr794_jefedeequiponame: Nombre del jefe de equipo, cr794_name: Nombre del proyecto, cr794_progreso: Progreso porcentual del proyecto,cr794_proyectoid: ID del proyecto,int_descripcion: Descripción del proyecto,int_nombredevops: Nombre relacionado con DevOps `,
      `Recuerda filtrar los datos por lo que pide el usuario, usa la documentacion ofical para de la API de Dynamics 365 (Dataverse) para filtrar OData.`,
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
    const model = data.model;
    const {choices} = data
    const responseMessage = choices[0].message.content
    const jsonString = responseMessage.replace(/```json\n|\n```/g, '').trim();
    return {
      query:message,
      model:model,
      response:JSON.parse(jsonString)
    };
    
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

    var userEmail = data.userEmail;
    if (typeof data == "string"){
      const User = require('~/models/User');
      const { email } = await User.findOne({ _id: this.userId }).lean();
      userEmail = email;
    }
    const token =  await global.myCache.get(userEmail.toString() + '-dynamics');  
    const {query, model, response} = await this.getDataverseApi(data.query);
    const search = await this.searchInDynamics(response, token);
    const queryTokens = intelequiaCountTokens([query, search], model)
     global.appInsights.trackEvent({
      name: 'Plugin',
      properties: {
        toolName: "dataverse",
        userEmail: userEmail ,
        assistantId: data.assistant ?? "",
        tokens:queryTokens.prompt,
        pluginModel:model
      },
    });

    return search;
  }
}

module.exports = Dataverse;