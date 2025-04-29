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


  /** @type {TAzureConfig | undefined} */
  const azureConfig = req.app.locals[EModelEndpoint.azureOpenAI];

  const client = AIProjectsClient.fromConnectionString( AZURE_AI_PROJECTS_CONNECTION_STRING, credentials)
  client.options = {}

  if(azureConfig && azureConfig.assistants){
    
    if (initAppClient) {
      client.options.titleConvo = azureConfig.titleConvo;
      client.options.titleModel = azureConfig.titleModel;
      client.options.titleMethod = azureConfig.titleMethod ?? 'completion';
    }
  }



  
  client.agents.files = new Files(client)

  client.req = req;
  client.res = res;

  return client
};

module.exports = initializeClient;