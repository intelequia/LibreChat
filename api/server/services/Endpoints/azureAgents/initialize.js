const {AIProjectClient} = require ('@azure/ai-projects')
const { AgentsClient } = require ("@azure/ai-agents");

const {
  EModelEndpoint,
} = require('librechat-data-provider');

const { DefaultAzureCredential } = require('@azure/identity');
const { isUserProvided } = require('~/server/utils');
const { truncateText, titleInstruction } = require('~/app/clients/prompts/index');




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

const initializeClient = async ({ req, res, initAppClient = false }) => {


  const {AZURE_AI_PROJECT_ENDPOINT} = process.env;

  const usersProvidesProjectConnectionString = isUserProvided(AZURE_AI_PROJECT_ENDPOINT);

  if (!AZURE_AI_PROJECT_ENDPOINT && !usersProvidesProjectConnectionString) {
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

  const client = new AgentsClient(AZURE_AI_PROJECT_ENDPOINT, credentials);

  client.options = {}

  if(azureConfig && azureConfig.assistants){
    
    if (initAppClient) {
      client.options.titleConvo = azureConfig.titleConvo;
      client.options.titleModel = azureConfig.titleModel;
      client.options.titleMethod = azureConfig.titleMethod ?? 'completion';
    }
  }
  
  client.files = new Files(client)

  client.req = req;
  client.res = res;
  client.titleConvo = titleConvo;
  return client
};

const titleConvo = async ({ text, conversationId, responseText = '', model, req })=>{

  const convo = `||>User:
    "${truncateText(text)}"
    ||>Response:
    "${JSON.stringify(truncateText(responseText))}"`;

  const body ={   
    messages: [
      {
        role: 'system',
        content: titleInstruction
      },
      {
        role: 'user',
        content: convo
      }

    ],
    temperature: 0.2,
    presence_penalty: 0,
    frequency_penalty: 0,
    max_tokens: 16,
  }
  const formattedBody = JSON.stringify(body)

  const endpoint = process.env.AZURE_RESOURSE_NAME;
  const deploymentName = model;
  const apiVersion = process.env.AZURE_ASSISTANTS_BASE_URL_API_VERSION;
  const apiKey = process.env.AZURE_ASSISTANTS_API_KEY;
  const url = `https://${endpoint}.openai.azure.com/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
  try{
    const response = await fetch(url,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: formattedBody
    });
    const data = await response.json();
    const result = data.choices[0].message.content;

    global.appInsights.trackEvent({
      name: 'Azure Agent Title Generation',
      properties: {
        userId: req.user.id,
        userEmail: req.user.email,
        charactersLength: result.length,
        messageTokens: data.usage.total_tokens,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        model: model,
      },
    });

    return result
  }catch(e){
    console.error('Error in titleConvo:', e);
  }

}

module.exports = initializeClient;