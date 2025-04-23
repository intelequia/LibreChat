const {AIProjectsClient} = require ('@azure/ai-projects')
const {
  EModelEndpoint,
} = require('librechat-data-provider');

const { DefaultAzureCredential } = require('@azure/identity');
const { isUserProvided } = require('~/server/utils');


class Files {
  constructor(client) {
    this._client = client;
  }
  /**
   * Create an assistant file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to an
   * [assistant](https://platform.openai.com/docs/api-reference/assistants).
   */
  create(assistantId, body, options) {
    return this._client.post(`/assistants/${assistantId}/files`, {
      body,
      ...options,
      headers: { 'OpenAI-Beta': 'assistants=v1', ...options?.headers },
    });
  }

  /**
   * Retrieves an AssistantFile.
   */
  retrieve(assistantId, fileId, options) {
    return this._client.get(`/assistants/${assistantId}/files/${fileId}`, {
      ...options,
      headers: { 'OpenAI-Beta': 'assistants=v1', ...options?.headers },
    });
  }

  /**
   * Delete an assistant file.
   */
  del(assistantId, fileId, options) {
    return this._client.delete(`/assistants/${assistantId}/files/${fileId}`, {
      ...options,
      headers: { 'OpenAI-Beta': 'assistants=v1', ...options?.headers },
    });
  }
}

const initializeClient = async ({ req, res, version, endpointOption, initAppClient = false }) => {


  const {AZURE_AI_PROJECTS_CONNECTION_STRING} = process.env;

  const usersProvidesProjectConnectionString = isUserProvided(AZURE_AI_PROJECTS_CONNECTION_STRING);

  if (!AZURE_AI_PROJECTS_CONNECTION_STRING && !usersProvidesProjectConnectionString) {
    throw new Error('Azure Agents Project Connection String is not provided. Please provide it again.');
  }

  let userValues = null;

  if (usersProvidesProjectConnectionString) {
    const expiresAt = await getUserKeyExpiry({
      userId: req.user.id,
      name: EModelEndpoint.azureAgents,
    });
    checkUserKeyExpiry(expiresAt, EModelEndpoint.azureAgents);
    userValues = await getUserKeyValues({
      userId: req.user.id,
      name: EModelEndpoint.azureAgents,
    });  
  }


  const credentials =  new DefaultAzureCredential()

  const clientOptions = {
    req,
    res,
    ...endpointOption,
  };


  /** @type {TAzureConfig | undefined} */
  const azureConfig = req.app.locals[EModelEndpoint.azureOpenAI];


  /** @type {AzureOptions | undefined} */
  let azureOptions;

  if(azureConfig && azureConfig.assistants){
    
    if (initAppClient) {
      clientOptions.titleConvo = azureConfig.titleConvo;
      clientOptions.titleModel = azureConfig.titleModel;
      clientOptions.titleMethod = azureConfig.titleMethod ?? 'completion';

      const groupName = modelGroupMap[modelName].group;
      clientOptions.addParams = azureConfig.groupMap[groupName].addParams;
      clientOptions.dropParams = azureConfig.groupMap[groupName].dropParams;
      clientOptions.forcePrompt = azureConfig.groupMap[groupName].forcePrompt;

      clientOptions.reverseProxyUrl = baseURL ?? clientOptions.reverseProxyUrl;
      clientOptions.headers = opts.defaultHeaders;
      clientOptions.azure = !serverless && azureOptions;
      if (serverless === true) {
        clientOptions.defaultQuery = azureOptions.azureOpenAIApiVersion
          ? { 'api-version': azureOptions.azureOpenAIApiVersion }
          : undefined;
        clientOptions.headers['api-key'] = apiKey;
      }
    }
  }



  const client = AIProjectsClient.fromConnectionString( AZURE_AI_PROJECTS_CONNECTION_STRING, credentials)
  
  client.agents.files = new Files(client)

  client.req = req;
  client.res = res;

  return client
};

module.exports = initializeClient;