const {AIProjectsClient} = require ('@azure/ai-projects')
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

// /**
//    * Generates a concise title for a conversation based on the user's input text and response.
//    * Uses either specified method or starts with the OpenAI `functions` method (using LangChain).
//    * If the `functions` method fails, it falls back to the `completion` method,
//    * which involves sending a chat completion request with specific instructions for title generation.
//    *
//    * @param {Object} params - The parameters for the conversation title generation.
//    * @param {string} params.text - The user's input.
//    * @param {string} [params.conversationId] - The current conversationId, if not already defined on client initialization.
//    * @param {string} [params.responseText=''] - The AI's immediate response to the user.
//    *
//    * @returns {Promise<string | 'New Chat'>} A promise that resolves to the generated conversation title.
//    *                            In case of failure, it will return the default title, "New Chat".
//    */
//   async function titleConvo({ text, conversationId, responseText = '' }) {
//     this.conversationId = conversationId;

//     if (this.options.attachments) {
//       delete this.options.attachments;
//     }

//     let title = 'New Chat';
//     const convo = `||>User:
// "${truncateText(text)}"
// ||>Response:
// "${JSON.stringify(truncateText(responseText))}"`;

//     const { OPENAI_TITLE_MODEL } = process.env ?? {};

//     let model = this.options.titleModel ?? OPENAI_TITLE_MODEL ?? openAISettings.model.default;
//     if (model === Constants.CURRENT_MODEL) {
//       model = this.modelOptions.model;
//     }

//     const modelOptions = {
//       // TODO: remove the gpt fallback and make it specific to endpoint
//       model,
//       temperature: 0.2,
//       presence_penalty: 0,
//       frequency_penalty: 0,
//       max_tokens: 16,
//     };

//     /** @type {TAzureConfig | undefined} */
//     const azureConfig = this.options?.req?.app?.locals?.[EModelEndpoint.azureOpenAI];

//     const resetTitleOptions = !!(
//       (this.azure && azureConfig) ||
//       (azureConfig && this.options.endpoint === EModelEndpoint.azureOpenAI)
//     );

//     if (resetTitleOptions) {
//       const { modelGroupMap, groupMap } = azureConfig;
//       const {
//         azureOptions,
//         baseURL,
//         headers = {},
//         serverless,
//       } = mapModelToAzureConfig({
//         modelName: modelOptions.model,
//         modelGroupMap,
//         groupMap,
//       });

//       this.options.headers = resolveHeaders(headers);
//       this.options.reverseProxyUrl = baseURL ?? null;
//       this.langchainProxy = extractBaseURL(this.options.reverseProxyUrl);
//       this.apiKey = azureOptions.azureOpenAIApiKey;

//       const groupName = modelGroupMap[modelOptions.model].group;
//       this.options.addParams = azureConfig.groupMap[groupName].addParams;
//       this.options.dropParams = azureConfig.groupMap[groupName].dropParams;
//       this.options.forcePrompt = azureConfig.groupMap[groupName].forcePrompt;
//       this.azure = !serverless && azureOptions;
//       if (serverless === true) {
//         this.options.defaultQuery = azureOptions.azureOpenAIApiVersion
//           ? { 'api-version': azureOptions.azureOpenAIApiVersion }
//           : undefined;
//         this.options.headers['api-key'] = this.apiKey;
//       }
//     }

//     const titleChatCompletion = async () => {
//       try {
//         modelOptions.model = model;

//         if (this.azure) {
//           modelOptions.model = process.env.AZURE_OPENAI_DEFAULT_MODEL ?? modelOptions.model;
//           this.azureEndpoint = genAzureChatCompletion(this.azure, modelOptions.model, this);
//         }

//         const instructionsPayload = [
//           {
//             role: this.options.titleMessageRole ?? (this.isOllama ? 'user' : 'system'),
//             content: `Please generate ${titleInstruction}

// ${convo}

// ||>Title:`,
//           },
//         ];

//         const promptTokens = this.getTokenCountForMessage(instructionsPayload[0]);

//         let useChatCompletion = true;

//         if (this.options.reverseProxyUrl === CohereConstants.API_URL) {
//           useChatCompletion = false;
//         }

//         title = (
//           await this.sendPayload(instructionsPayload, {
//             modelOptions,
//             useChatCompletion,
//             context: 'title',
//           })
//         ).replaceAll('"', '');

//         const completionTokens = this.getTokenCount(title);

//         this.recordTokenUsage({ promptTokens, completionTokens, context: 'title' });
//       } catch (e) {
//         logger.error(
//           '[OpenAIClient] There was an issue generating the title with the completion method',
//           e,
//         );
//       }
//     };

//     if (this.options.titleMethod === 'completion') {
//       await titleChatCompletion();
//       logger.debug('[OpenAIClient] Convo Title: ' + title);
//       return title;
//     }

//     try {
//       this.abortController = new AbortController();
//       const llm = this.initializeLLM({
//         ...modelOptions,
//         conversationId,
//         context: 'title',
//         tokenBuffer: 150,
//       });

//       title = await runTitleChain({ llm, text, convo, signal: this.abortController.signal });
//     } catch (e) {
//       if (e?.message?.toLowerCase()?.includes('abort')) {
//         logger.debug('[OpenAIClient] Aborted title generation');
//         return;
//       }
//       logger.error(
//         '[OpenAIClient] There was an issue generating title with LangChain, trying completion method...',
//         e,
//       );

//       await titleChatCompletion();
//     }

//     logger.debug('[OpenAIClient] Convo Title: ' + title);
//     return title;
//   }




module.exports = initializeClient;