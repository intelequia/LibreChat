const fs = require('fs').promises;
const { ToolCallTypes, FileContext } = require('librechat-data-provider');
const validateAuthor = require('~/server/middleware/assistants/validateAuthor');
const { validateAndUpdateTool,deleteAssistantActions } = require('~/server/services/ActionService');
const { updateAssistantDoc } = require('~/models/Assistant');
const { manifestToolMap } = require('~/app/clients/tools');
const { getOpenAIClient, fetchAssistants } = require('./helpers');
const { logger } = require('~/config');
const { uploadImageBuffer, filterFile } = require('~/server/services/Files/process');
const { SaveFunctionsInCache, isToolEnabled, GetToolSpecification } = require('~/utils');
const { getCachedTools } = require('~/server/services/Config');

/**
 * Create an assistant.
 * @route POST /assistants
 * @param {AssistantCreateParams} req.body - The assistant creation parameters.
 * @returns {Assistant} 201 - success response - application/json
 */
const createAzureAgent = async (req, res) => {
  try {
    /** @type {{ openai: OpenAIClient }} */
    const azureAgentClient = await getOpenAIClient({ req, res });

    const {
      tools = [],
      endpoint,
      conversation_starters,
      append_current_datetime,
      ...assistantData
    } = req.body;
    delete assistantData.conversation_starters;
    delete assistantData.append_current_datetime;

    const toolDefinitions = await getCachedTools({ includeGlobal: true });

    assistantData.tools = tools
      .map((tool) => {
        if (typeof tool !== 'string') {
          return tool;
        }

        const toolDef = toolDefinitions[tool];
        if (!toolDef && manifestToolMap[tool] && manifestToolMap[tool].toolkit === true) {
          return Object.entries(toolDefinitions)
            .filter(([key]) => key.startsWith(`${tool}_`))

            .map(([_, val]) => val);
        }

        return toolDef;
      })
      .filter((tool) => tool)
      .flat();

    let azureModelIdentifier = null;
    if (azureAgentClient.locals?.azureOptions) {
      azureModelIdentifier = assistantData.model;
      assistantData.model = openai.locals.azureOptions.azureOpenAIApiDeploymentName;
    }

    assistantData.metadata = {
      author: req.user.id,
      endpoint,
    };

    const azureAgent = await azureAgentClient.createAgent(assistantData.model,assistantData);
    const createData = { user: req.user.id };
    if (conversation_starters) {
      createData.conversation_starters = conversation_starters;
    }
    if (append_current_datetime !== undefined) {
      createData.append_current_datetime = append_current_datetime;
    }

    const document = await updateAssistantDoc({ assistant_id: azureAgent.id }, createData);

    if (azureModelIdentifier) {
      azureAgent.model = azureModelIdentifier;
    }

    if (document.conversation_starters) {
      azureAgent.conversation_starters = document.conversation_starters;
    }
    if (append_current_datetime !== undefined) {
      azureAgent.append_current_datetime = append_current_datetime;
    }

    logger.debug('/azureAgents/', azureAgent);
    res.status(201).json(azureAgent);
  } catch (error) {
    logger.error('[/azureAgents] Error creating assistant', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Modifies an assistant.
 * @param {object} params
 * @param {Express.Request} params.req
 * @param {AIProjectsClient} params.azureAgentClient
 * @param {string} params.assistant_id
 * @param {AzureAgentUpdateParams} params.updateData
 * @returns {Promise<Assistant>} The updated assistant.
 */
const updateAzureAgent = async ({ req, azureAgentClient, assistant_id, updateData }) => {
  await validateAuthor({ req, azureAgentClient });
  const tools = [];
  let conversation_starters = null;
  
  updateData.toolResources = updateData.tool_resources ;
  delete updateData.tool_resources;

  if (updateData?.conversation_starters) {
    const conversationStartersUpdate = await updateAssistantDoc(
      { assistant_id: assistant_id },
      { conversation_starters: updateData.conversation_starters },
    );
    conversation_starters = conversationStartersUpdate.conversation_starters;

    delete updateData.conversation_starters;
  }

  if (updateData?.append_current_datetime !== undefined) {
    await updateAssistantDoc(
      { assistant_id: assistant_id },
      { append_current_datetime: updateData.append_current_datetime },
    );
    delete updateData.append_current_datetime;
  }

  let hasFileSearch = false;
  for (const tool of updateData.tools ?? []) {
    const toolDefinitions = await getCachedTools({ includeGlobal: true });
    let actualTool = typeof tool === 'string' ? toolDefinitions[tool] : tool;

    if (!actualTool && manifestToolMap[tool] && manifestToolMap[tool].toolkit === true) {
      actualTool = Object.entries(toolDefinitions)
        .filter(([key]) => key.startsWith(`${tool}_`))
        .map(([_, val]) => val);
    } else if (!actualTool) {
      continue;
    }
    if (await isToolEnabled(tool)){
      actualTool = await GetToolSpecification(tool);
    }

    if (Array.isArray(actualTool)) {
      for (const subTool of actualTool) {
        if (!subTool.function) {
          tools.push(subTool);
          continue;
        }

        const updatedTool = await validateAndUpdateTool({ req, tool: subTool, assistant_id });
        if (updatedTool) {
          tools.push(updatedTool);
        }
      }
      continue;
    }

    if (actualTool.type === ToolCallTypes.FILE_SEARCH) {
      hasFileSearch = true;
    }

    if (!actualTool.function) {
      tools.push(actualTool);
      continue;
    }

    const updatedTool = await validateAndUpdateTool({ req, tool: actualTool, assistant_id });
    if (updatedTool) {
      tools.push(updatedTool);
    }
  }

  if (hasFileSearch && !updateData.toolResources) {
    const azureAgent = await azureAgentClient.getAgent(assistant_id);
    updateData.toolResources = azureAgent.toolResources ?? null;
  }

  if (hasFileSearch && !updateData.toolResources?.fileSearch) {
    updateData.toolResources = {
      ...(updateData.toolResources ?? {}),
      fileSearch: {
        vectorStoreIds: [],
      },
    };
  }

  updateData.tools = tools;

  if (azureAgentClient.locals?.azureOptions && updateData.model) {
    updateData.model = openai.locals.azureOptions.azureOpenAIApiDeploymentName;
  }

  const azureAgent = azureAgentClient.updateAgent(assistant_id, updateData);
  if (conversation_starters) {
    azureAgent.conversation_starters = conversation_starters;
  }

  return azureAgent;
};

/**
 * Modifies an assistant with the resource file id.
 * @param {object} params
 * @param {Express.Request} params.req
 * @param {OpenAIClient} params.openai
 * @param {string} params.assistant_id
 * @param {string} params.tool_resource
 * @param {string} params.file_id
 * @returns {Promise<Assistant>} The updated assistant.
 */
const addResourceFileId = async ({ req, openai, assistant_id, tool_resource, file_id }) => {
  const assistant = await openai.beta.assistants.retrieve(assistant_id);
  const { tool_resources = {} } = assistant;
  if (tool_resources[tool_resource]) {
    tool_resources[tool_resource].file_ids.push(file_id);
  } else {
    tool_resources[tool_resource] = { file_ids: [file_id] };
  }

  delete assistant.id;
  return await updateAssistant({
    req,
    openai,
    assistant_id,
    updateData: { tools: assistant.tools, tool_resources },
  });
};

/**
 * Deletes a file ID from an assistant's resource.
 * @param {object} params
 * @param {Express.Request} params.req
 * @param {OpenAIClient} params.openai
 * @param {string} params.assistant_id
 * @param {string} [params.tool_resource]
 * @param {string} params.file_id
 * @param {AssistantUpdateParams} params.updateData
 * @returns {Promise<Assistant>} The updated assistant.
 */
const deleteResourceFileId = async ({ req, openai, assistant_id, tool_resource, file_id }) => {
  const assistant = await openai.beta.assistants.retrieve(assistant_id);
  const { tool_resources = {} } = assistant;

  if (tool_resource && tool_resources[tool_resource]) {
    const resource = tool_resources[tool_resource];
    const index = resource.file_ids.indexOf(file_id);
    if (index !== -1) {
      resource.file_ids.splice(index, 1);
    }
  } else {
    for (const resourceKey in tool_resources) {
      const resource = tool_resources[resourceKey];
      const index = resource.file_ids.indexOf(file_id);
      if (index !== -1) {
        resource.file_ids.splice(index, 1);
        break;
      }
    }
  }

  delete assistant.id;
  return await updateAssistant({
    req,
    openai,
    assistant_id,
    updateData: { tools: assistant.tools, tool_resources },
  });
};

/**
 * Modifies an assistant.
 * @route PATCH /assistants/:id
 * @param {object} req - Express Request
 * @param {object} req.params - Request params
 * @param {string} req.params.id - Assistant identifier.
 * @param {AssistantUpdateParams} req.body - The assistant update parameters.
 * @returns {Assistant} 200 - success response - application/json
 */
const patchAssistant = async (req, res) => {
  try {
    const azureAgentClient = await getOpenAIClient({ req, res });
    const assistant_id = req.params.id;
    const { endpoint: _e, ...updateData } = req.body;
    updateData.tools = updateData.tools ?? [];
    const updatedAssistant = await updateAzureAgent({ req, azureAgentClient, assistant_id, updateData });
    res.json(updatedAssistant);
  } catch (error) {
    logger.error('[/azureAgents/:id] Error updating assistant', error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Deletes an assistant.
 * @route DELETE /assistants/:id
 * @param {object} req - Express Request
 * @param {object} req.params - Request params
 * @param {string} req.params.id - Assistant identifier.
 * @returns {Assistant} 200 - success response - application/json
 */
const deleteAzureAgent = async (req, res) => {
  try {
    const azureAgentClient = await getOpenAIClient({ req, res });
    await validateAuthor({ req, azureAgentClient });
    /**
     * Custom event to track when an assistant has been deleted
     * @Organization Intelequia
     * @Author Enrique M. Pedroza Castillo
     */
    global.appInsights.trackEvent({
      name: 'AzureAgentDeleted',
      properties: {
        userId: req.user.id,
        userEmail: req.user.email,
        assistantName: req.params.id,
      },
    });

    const assistant_id = req.params.id;
    const deletionStatus = await azureAgentClient.deleteAgent(assistant_id);
    if (deletionStatus?.deleted) {
      await deleteAssistantActions({ req, assistant_id });
    }
    res.json(deletionStatus);
  } catch (error) {
    logger.error('[/azureAgents/:id] Error deleting assistant', error);
    res.status(500).json({ error: 'Error deleting assistant' });
  }
};


/**
 * Uploads and updates an avatar for a specific assistant.
 * @route POST /:assistant_id/avatar
 * @param {object} req - Express Request
 * @param {object} req.params - Request params
 * @param {string} req.params.assistant_id - The ID of the assistant.
 * @param {Express.Multer.File} req.file - The avatar image file.
 * @param {object} req.body - Request body
 * @returns {Object} 200 - success response - application/json
 */
const uploadAzureAgentAvatar = async (req, res) => {
  try {
    filterFile({ req, file: req.file, image: true, isAvatar: true });
    const { assistant_id } = req.params;
    if (!assistant_id) {
      return res.status(400).json({ message: 'Assistant ID is required' });
    }

    const azureAgentClient = await getOpenAIClient({ req, res });
    await validateAuthor({ req, azureAgentClient });

    const buffer = await fs.readFile(req.file.path);
    const image = await uploadImageBuffer({
      req,
      context: FileContext.avatar,
      metadata: { buffer },
    });

    let _metadata;

    try {
      const assistant = await azureAgentClient.getAgent(assistant_id);
      if (assistant) {
        _metadata = assistant.metadata;
      }
    } catch (error) {
      logger.error('[/:assistant_id/avatar] Error fetching assistant', error);
      _metadata = {};
    }

    if (_metadata.avatar && _metadata.avatar_source) {
      const { deleteFile } = getStrategyFunctions(_metadata.avatar_source);
      try {
        await deleteFile(req, { filepath: _metadata.avatar });
        await deleteFileByFilter({ user: req.user.id, filepath: _metadata.avatar });
      } catch (error) {
        logger.error('[/:assistant_id/avatar] Error deleting old avatar', error);
      }
    }

    const metadata = {
      ..._metadata,
      avatar: image.filepath,
      avatar_source: req.app.locals.fileStrategy,
    };

    const promises = [];
    promises.push(
      updateAssistantDoc(
        { assistant_id },
        {
          avatar: {
            filepath: image.filepath,
            source: req.app.locals.fileStrategy,
          },
          user: req.user.id,
        },
      ),
    );
    promises.push(azureAgentClient.updateAgent(assistant_id, { metadata }));

    const resolved = await Promise.all(promises);
    res.status(201).json(resolved[1]);
  } catch (error) {
    const message = 'An error occurred while updating the Assistant Avatar';
    logger.error(message, error);
    res.status(500).json({ message });
  } finally {
    try {
      await fs.unlink(req.file.path);
      logger.debug('[/:agent_id/avatar] Temp. image upload file deleted');
    } catch (error) {
      logger.debug('[/:agent_id/avatar] Temp. image upload file already deleted');
    }
  }
};

/**
 * Returns a list of assistants.
 * @route GET /assistants
 * @param {object} req - Express Request
 * @param {AssistantListParams} req.query - The assistant list parameters for pagination and sorting.
 * @returns {AssistantListResponse} 200 - success response - application/json
 */
const listAssistants = async (req, res) => {
  try {
    const body = await fetchAssistants({ req, res });

    /**
     * saves functions specifications 
     * @Organization Intelequia
     * @Author Enrique M. Pedroza Castillo
     */
    SaveFunctionsInCache(body.data);

    res.json(body);
  } catch (error) {
    logger.error('[/azureAgents] Error listing assistants', error);
    res.status(500).json({ message: 'Error listing assistants' });
  }
};

module.exports = {
  patchAssistant,
  createAzureAgent,
  updateAzureAgent,
  addResourceFileId,
  deleteResourceFileId,
  deleteAzureAgent,
  uploadAzureAgentAvatar,
  listAssistants
};
