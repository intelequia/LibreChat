const { Tool } = require('langchain/tools');
const axios = require('axios');
const intelequiaCountTokens = require('../../intelequiaTokenCount')
const {
  createProjectCompletionQuery,
  handleProyectsfilter
} = require('../configurations/projectHandler')

class Dataverse extends Tool  {

  constructor(fields) {
    super();
    this.name = 'dataverse';
    this.description = 'Use the \'dataverse\' tool to retrieve search results from Dataverse/Dynamics';

    this.dataverseURL = process.env.DATAVERSE_URL;

    this.resourceName = process.env.AZURE_RESOURSE_NAME;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION;
    this.azureOpenAIKey = process.env.AZURE_OPENAI_API_KEY;

    this.userId = fields.userId;
  }

  async sendCompletion(query) {
    const url = `https://${this.resourceName}.openai.azure.com/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`
    const headers = {
      "api-key": this.azureOpenAIKey,
      "Content-Type": "application/json"
    }
    const body = {
      "messages": [
        {
          "role": "user",
          "content": query
        }
      ],
      "temperature": 0.7,
      "top_p": 0.95,
      "max_tokens": 800
    }

    const { data } = await axios.post(url, body, { headers })
    const model = data.model;
    const { choices } = data
    const responseMessage = choices[0].message.content
    const jsonString = responseMessage.replace(/```json\n|\n```/g, '').trim();

    return {
      query: query,
      model: model,
      response: JSON.parse(jsonString)
    };
  }

  async getDynamicsSearch (url, token){
    url = url.replace('GET ',"")
    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      const { data } = await axios.get(url, { headers })
      return data
    }
    catch (e){
      throw new Error("Error at retrieve data from Dynamics");
    }
  }

  async smartSwitch (query, token){

    const instructions = [
      `La consulta del usuario es la siguiente: ${query}.`,
      `Si el usuario quiere un proyecto, responderas unicamente con un 1`,
      `Si el usuario quiere una oportunidad, responderas unicamente con un 2`,
    ]

    const message = instructions.join(' ');
    const { response } = await this.sendCompletion(message)
    switch (response){
      case 1: return await this.handleProject(query, message, token);
      case 2: return await this.handleOportunity(query, message, token);
    }
  }

  async handleOportunity(query, message, token){
    const url = 'https://intelequia.crm4.dynamics.com/api/data/v9.2/opportunities?$top=10&$select=prioritycode,totaltax,estimatedclosedate,_pricelevelid_value,confirminterest,opportunityid,identifycompetitors,name,inteleq_numerodeofertas,statuscode,customerneed,totaltax_base,estimatedvalue,currentsituation,statecode,need&$orderby=createdon desc'
    const {value} = await this.getDynamicsSearch(url, token);
    return {
      response: JSON.stringify(value),
      model:"gpt-4o-mini",
      query: "(completionQuery + message)"
    }
  }

  async handleProject (query, message, token){
    const completionQuery = createProjectCompletionQuery(query)
    const projectFilterResponse = await this.sendCompletion(completionQuery)
    const dataverseUrlQuery = handleProyectsfilter(projectFilterResponse.response, this.dataverseURL)
    const {value} = await this.getDynamicsSearch(dataverseUrlQuery, token);

    const dataverseResponse = []

    for (const item of value){

      if(item.cr794_Jefedeequipo && item.owninguser && item.cr794_Equipo && item.cr794_Cliente && item.owningbusinessunit)
          dataverseResponse.push(item)

      if(dataverseResponse.length == 10)
        break
    }

    return {
      response: JSON.stringify(dataverseResponse),
      model:projectFilterResponse.model,
      query: (completionQuery + message)
    }
  }

  async _call(data) {

    var userEmail = data.
      userEmail;
    if (typeof data == "string") {
      const User = require('~/models/User');
      const { email } = await User.findOne({ _id: this.userId }).lean();
      userEmail = email;
    }
    const token = await global.myCache.get(userEmail.toString() + '-dynamics');

    const { query, model, response } = await this.smartSwitch(data.query, token)

    const queryTokens = intelequiaCountTokens([query], model)

    const responseTokens = intelequiaCountTokens([response],model)

    global.appInsights.trackEvent({
      name: 'Plugin',
      properties: {
        toolName: "dataverse",
        userEmail: userEmail,
        assistantId: data.assistant ?? "",
        queryTokens: queryTokens.prompt,
        queryLength: query.length,
        responseTokens: responseTokens.prompt,
        pluginModel: model
      },
    });

    return response;
  }
}

module.exports = Dataverse;