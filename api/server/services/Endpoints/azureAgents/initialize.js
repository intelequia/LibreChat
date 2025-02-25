const OpenAI = require('openai');
const {AIProjectsClient} = require ('@azure/ai-projects')
const { HttpsProxyAgent } = require('https-proxy-agent');
const { TokenCredential, AccessToken } = require("@azure/core-auth");
const {
  ErrorTypes,
  EModelEndpoint,
  resolveHeaders,
  mapModelToAzureConfig,
} = require('librechat-data-provider');
const {
  getUserKeyValues,
  getUserKeyExpiry,
  checkUserKeyExpiry,
} = require('~/server/services/UserService');
const OpenAIClient = require('~/app/clients/OpenAIClient');
const { isUserProvided } = require('~/server/utils');
const { constructAzureURL } = require('~/utils');
const { DefaultAzureCredential, ClientSecretCredential } = require('@azure/identity');


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

  const client = AIProjectsClient.fromConnectionString(
    AZURE_AI_PROJECTS_CONNECTION_STRING, 
    new DefaultAzureCredential(),)

  const clientOptions = {
    reverseProxyUrl:  null,
    proxy: null,
    req,
    res,
    ...endpointOption,
  };

  /** @type {TAzureConfig | undefined} */
  const azureConfig = req.app.locals[EModelEndpoint.azureOpenAI];

  /** @type {AzureOptions | undefined} */
  // let azureOptions;

  if (azureConfig && azureConfig.assistants) {
    const { modelGroupMap, groupMap, assistantModels } = azureConfig;
    const modelName = req.body.model ?? req.query.model ?? assistantModels[0];
    const {
      azureOptions: currentOptions,
      baseURL: azureBaseURL,
      headers = {},
      serverless,
    } = mapModelToAzureConfig({
      modelName,
      modelGroupMap,
      groupMap,
    });
  }
  return client
};

module.exports = initializeClient;
