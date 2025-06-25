const { klona } = require('klona');
const {
  StepTypes,
  RunStatus,
  StepStatus,
  ContentTypes,
  ToolCallTypes,
  imageGenTools,
  EModelEndpoint,
  defaultOrderQuery,
} = require('librechat-data-provider');
const { retrieveAndProcessFile } = require('~/server/services/Files/process');
const { processRequiredActions } = require('~/server/services/ToolService');
const { createOnProgress, sendMessage, sleep } = require('~/server/utils');
const { RunManager, waitForAzureAgentRun } = require('~/server/services/Runs');
const { processMessages } = require('~/server/services/Threads');
const { TextStream } = require('~/app/clients');
const { logger } = require('~/config');
const { intelequiaTools } = require ("~/utils")
/**
 * Sorts, processes, and flattens messages to a single string.
 *
 * @param {Object} params - Params for creating the onTextProgress function.
 * @param {AIProjectsClient} params.azureAgentClient - The azureAgentClient client instance.
 * @param {string} params.conversationId - The current conversation ID.
 * @param {string} params.userMessageId - The user message ID; response's `parentMessageId`.
 * @param {string} params.messageId - The response message ID.
 * @param {string} params.thread_id - The current thread ID.
 * @returns {void}
 */
async function createOnTextProgress({
  azureAgentClient,
  conversationId,
  userMessageId,
  messageId,
  thread_id,
}) {
  azureAgentClient.responseMessage = {
    conversationId,
    parentMessageId: userMessageId,
    role: 'assistant',
    messageId,
    content: [],
  };

  azureAgentClient.responseText = '';

  azureAgentClient.addContentData = (data) => {
    const { type, index } = data;
    azureAgentClient.responseMessage.content[index] = { type, [type]: data[type] };

    if (type === ContentTypes.TEXT) {
      azureAgentClient.responseText += data[type].value;
      return;
    }

    const contentData = {
      index,
      type,
      [type]: data[type],
      messageId,
      thread_id,
      conversationId,
    };

    logger.debug('Content data:', contentData);
    sendMessage(azureAgentClient.res, contentData);
  };
}

/**
 * Retrieves the response from an azureAgentClient run.
 *
 * @param {Object} params - The parameters for getting the response.
 * @param {AIProjectsClient} params.azureAgentClient - The azureAgentClient client instance.
 * @param {string} params.run_id - The ID of the run to get the response for.
 * @param {string} params.thread_id - The ID of the thread associated with the run.
 * @return {Promise<OpenAIAssistantFinish | OpenAIAssistantAction[] | ThreadMessage[] | RequiredActionFunctionToolCall[]>}
 */
async function getResponse({ azureAgentClient, run_id, thread_id }) {
  const run = await waitForRun({ azureAgentClient, run_id, thread_id, pollIntervalMs: 2000 });

  if (run.status === RunStatus.COMPLETED) {
    const messages = await azureAgentClient.beta.threads.messages.list(thread_id, defaultOrderQuery);
    const newMessages = messages.data.filter((msg) => msg.run_id === run_id);

    return newMessages;
  } else if (run.status === RunStatus.REQUIRES_ACTION) {
    const actions = [];
    run.required_action?.submit_tool_outputs.tool_calls.forEach((item) => {
      const functionCall = item.function;
      const args = JSON.parse(functionCall.arguments);
      actions.push({
        tool: functionCall.name,
        toolInput: args,
        toolCallId: item.id,
        run_id,
        thread_id,
      });
    });

    return actions;
  }

  const runInfo = JSON.stringify(run, null, 2);
  throw new Error(`Unexpected run status ${run.status}.\nFull run info:\n\n${runInfo}`);
}

/**
 * Filters the steps to keep only the most recent instance of each unique step.
 * @param {RunStep[]} steps - The array of RunSteps to filter.
 * @return {RunStep[]} The filtered array of RunSteps.
 */
function filterSteps(steps = []) {
  if (steps.length <= 1) {
    return steps;
  }
  const stepMap = new Map();

  steps.forEach((step) => {
    if (!step) {
      return;
    }

    const effectiveTimestamp = Math.max(
      step.created_at,
      step.expired_at || 0,
      step.cancelled_at || 0,
      step.failed_at || 0,
      step.completed_at || 0,
    );

    if (!stepMap.has(step.id) || effectiveTimestamp > stepMap.get(step.id).effectiveTimestamp) {
      const latestStep = { ...step, effectiveTimestamp };
      if (latestStep.last_error) {
        // testing to see if we ever step into this
      }
      stepMap.set(step.id, latestStep);
    }
  });

  return Array.from(stepMap.values()).map((step) => {
    delete step.effectiveTimestamp;
    return step;
  });
}

/**
 * @callback InProgressFunction
 * @param {Object} params - The parameters for the in progress step.
 * @param {RunStep} params.step - The step object with details about the message creation.
 * @returns {Promise<void>} - A promise that resolves when the step is processed.
 */

function hasToolCallChanged(previousCall, currentCall) {
  return JSON.stringify(previousCall) !== JSON.stringify(currentCall);
}

/**
 * Creates a handler function for steps in progress, specifically for
 * processing messages and managing seen completed messages.
 *
 * @param {AIProjectsClient} azureAgentClient - The azureAgentClient client instance.
 * @param {string} thread_id - The ID of the thread the run is in.
 * @param {ThreadMessage[]} messages - The accumulated messages for the run.
 * @return {InProgressFunction} a function to handle steps in progress.
 */
function createInProgressHandler(azureAgentClient, thread_id, messages) {
  azureAgentClient.index = 0;
  azureAgentClient.mappedOrder = new Map();
  azureAgentClient.seenToolCalls = new Map();
  azureAgentClient.processedFileIds = new Set();
  azureAgentClient.completeToolCallSteps = new Set();
  azureAgentClient.seenCompletedMessages = new Set();

  /**
   * The in_progress function for handling message creation steps.
   *
   * @type {InProgressFunction}
   */
  async function in_progress({ step }) {
    if (step.type === StepTypes.TOOL_CALLS) {
      const { toolCalls } = step.stepDetails;

      for (const _toolCall of toolCalls) {
        /** @type {StepToolCall} */
        const toolCall = _toolCall;
        const previousCall = azureAgentClient.seenToolCalls.get(toolCall.id);

        // If the tool call isn't new and hasn't changed
        if (previousCall && !hasToolCallChanged(previousCall, toolCall)) {
          continue;
        }

        let toolCallIndex = azureAgentClient.mappedOrder.get(toolCall.id);
        if (toolCallIndex === undefined) {
          // New tool call
          toolCallIndex = azureAgentClient.index;
          azureAgentClient.mappedOrder.set(toolCall.id, azureAgentClient.index);
          azureAgentClient.index++;
        }

        if (step.status === StepStatus.IN_PROGRESS) {
          toolCall.progress =
            previousCall && previousCall.progress
              ? Math.min(previousCall.progress + 0.2, 0.95)
              : 0.01;
        } else {
          toolCall.progress = 1;
          azureAgentClient.completeToolCallSteps.add(step.id);
        }

        if (
          toolCall.type === ToolCallTypes.CODE_INTERPRETER &&
          step.status === StepStatus.COMPLETED
        ) {
          const { outputs } = toolCall.codeInterpreter;

          for (const output of outputs) {
            if (output.type !== 'image') {
              continue;
            }

            if (azureAgentClient.processedFileIds.has(output.image?.file_id)) {
              continue;
            }

            const { file_id } = output.image;
            const file = await retrieveAndProcessFile({
              azureAgentClient,
              client: azureAgentClient,
              file_id,
              basename: `${file_id}.png`,
            });

            const prelimImage = file;

            // check if every key has a value before adding to content
            const prelimImageKeys = Object.keys(prelimImage);
            const validImageFile = prelimImageKeys.every((key) => prelimImage[key]);

            if (!validImageFile) {
              continue;
            }

            const image_file = {
              [ContentTypes.IMAGE_FILE]: prelimImage,
              type: ContentTypes.IMAGE_FILE,
              index: azureAgentClient.index,
            };
            azureAgentClient.addContentData(image_file);
            azureAgentClient.processedFileIds.add(file_id);
            azureAgentClient.index++;
          }
        } else if (
          toolCall.type === ToolCallTypes.FUNCTION &&
          step.status === StepStatus.COMPLETED &&
          imageGenTools.has(toolCall[toolCall.type].name)
        ) {
          /* If a change is detected, skip image generation tools as already processed */
          azureAgentClient.seenToolCalls.set(toolCall.id, toolCall);
          continue;
        }

        azureAgentClient.addContentData({
          [ContentTypes.TOOL_CALL]: toolCall,
          index: toolCallIndex,
          type: ContentTypes.TOOL_CALL,
        });

        // Update the stored tool call
        azureAgentClient.seenToolCalls.set(toolCall.id, toolCall);
      }
    } else if (step.type === StepTypes.MESSAGE_CREATION && step.status === StepStatus.COMPLETED) {

      const { messageId } = step.stepDetails.messageCreation;
      
      if (azureAgentClient.seenCompletedMessages.has(messageId)) {
        return;
      }

      azureAgentClient.seenCompletedMessages.add(messageId);
      
      let message;
      let messageList = [] ;
      for await (const message of azureAgentClient.messages.list(thread_id, messageId)){
        messageList.push(message);
      }
      message = messageList.find(msg => msg.id === messageId )
      
      if (!message?.content?.length) {
        return;
      }
      messages.push(message);

      let messageIndex = azureAgentClient.mappedOrder.get(step.id);
      if (messageIndex === undefined) {
        // New message
        messageIndex = azureAgentClient.index;
        azureAgentClient.mappedOrder.set(step.id, azureAgentClient.index);
        azureAgentClient.index++;
      }

      const result = await processMessages({ azureAgentClient, client: azureAgentClient, messages: [message] });
      azureAgentClient.addContentData({
        [ContentTypes.TEXT]: { value: result.text },
        type: ContentTypes.TEXT,
        index: messageIndex,
      });

      // Create the Factory Function to stream the message
      const { onProgress: progressCallback } = createOnProgress({
        // todo: add option to save partialText to db
        // onProgress: () => {},
      });

      // This creates a function that attaches all of the parameters
      // specified here to each SSE message generated by the TextStream
      const onProgress = progressCallback({
        res: azureAgentClient.res,
        index: messageIndex,
        messageId: azureAgentClient.responseMessage.messageId,
        conversationId: azureAgentClient.responseMessage.conversationId,
        type: ContentTypes.TEXT,
        thread_id,
      });

      // Create a small buffer before streaming begins
      await sleep(500);

      const stream = new TextStream(result.text, { delay: 9 });
      await stream.processTextStream(onProgress);
    }
  }

  return in_progress;
}

/**
 * Initializes a RunManager with handlers, then invokes waitForRun to monitor and manage an azureAgentClient run.
 *
 * @param {Object} params - The parameters for managing and monitoring the run.
 * @param {AIProjectsClient} params.azureAgentClient - The azureAgentClient client instance.
 * @param {string} params.run_id - The ID of the run to manage and monitor.
 * @param {string} params.thread_id - The ID of the thread associated with the run.
 * @param {RunStep[]} params.accumulatedSteps - The accumulated steps for the run.
 * @param {ThreadMessage[]} params.accumulatedMessages - The accumulated messages for the run.
 * @param {InProgressFunction} [params.in_progress] - The `in_progress` function from a previous run.
 * @return {Promise<RunResponse>} A promise that resolves to an object containing the run and managed steps.
 */
async function runAssistant({
  userEmail = "",
  azureAgentClient,
  run_id,
  thread_id,
  accumulatedSteps = [],
  accumulatedMessages = [],
  in_progress: inProgress,
}) {
  let steps = accumulatedSteps;
  let messages = accumulatedMessages;
  const in_progress = inProgress ?? createInProgressHandler(azureAgentClient, thread_id, messages);
  azureAgentClient.in_progress = in_progress;

  const runManager = new RunManager({
    in_progress,
    final: async ({ step, runStatus, stepsByStatus }) => {
      logger.debug(`[runAssistant] Final step for ${run_id} with status ${runStatus}`, step);

      const promises = [];

      for (const [_status, stepsPromises] of Object.entries(stepsByStatus)) {
        promises.push(...stepsPromises);
      }

      const resolved = await Promise.all(promises);
      const finalSteps = filterSteps(steps.concat(resolved));

      if (step.type === StepTypes.MESSAGE_CREATION) {
        const incompleteToolCallSteps = finalSteps.filter(
          (s) => s && s.type === StepTypes.TOOL_CALLS && !azureAgentClient.completeToolCallSteps.has(s.id),
        );
        for (const incompleteToolCallStep of incompleteToolCallSteps) {
          await in_progress({ step: incompleteToolCallStep });
        }
      }
      await in_progress({ step });

      resolved.push(step);
      steps = klona(finalSteps);
    },
  });

  /** @type {TCustomConfig.endpoints.assistants} */
  const assistantsEndpointConfig = azureAgentClient.req.app.locals?.[EModelEndpoint.azureAssistants] ?? {};
  let { pollIntervalMs, timeoutMs } = assistantsEndpointConfig;

  const run = await waitForAzureAgentRun({
    azureAgentClient,
    run_id,
    thread_id,
    runManager,
    pollIntervalMs,
    timeout: timeoutMs,
  });

  if (!run.requiredAction) {
    const sortedMessages = messages.sort((a, b) => a.created_at - b.created_at);
    return {
      run,
      steps,
      messages: sortedMessages,
      finalMessage: azureAgentClient.responseMessage,
      text: azureAgentClient.responseText,
    };
  }

  const { submitToolOutputs } = run.requiredAction;

  const actions = submitToolOutputs.toolCalls.map((item) => {
    const functionCall = item.function;
    const args = JSON.parse(functionCall.arguments);

    /**
     * Add Azure Functions feature to assistants
     * @Organization Intelequia
     * @Author Enrique M. Pedroza Castillo
     */
    if ( process.env.ENABLE_PERMISSION_MANAGE == "true" ) {

      if( intelequiaTools.includes(functionCall.name)){
        args["userEmail"] = userEmail;
        args['toolName'] = functionCall.name;
        args['assistant'] = run.assistant_id;
        args['toolInput'] = JSON.parse(item.function.arguments);
      }
      else if (run.tools.find((tool) => tool.function.name === functionCall.name)) {
        // args["functionInfo"] = matchingTool
        args['toolName'] = functionCall.name;
        args['assistant'] = run.assistant_id;
        args['toolInput'] = JSON.parse(item.function.arguments);
      }
    }
    return {
      tool: functionCall.name,
      toolInput: args,
      toolCallId: item.id,
      run_id,
      thread_id,
    };
  });

  let outputs = await processRequiredActions(azureAgentClient, actions, run.assistantId);
  
  // Transform property names in each tool output
  if (outputs && outputs.tool_outputs && Array.isArray(outputs.tool_outputs)) {
    outputs.tool_outputs = outputs.tool_outputs.map(output => {
      // Create a new object with the toolCallId property instead of tool_call_id
      const transformedOutput = {
        toolCallId: output.tool_call_id,
        output: output.output
      };
      return transformedOutput;
    });
  }

  // const toolRun = await azureAgentClient.agents.submitToolOutputsToRun(run.threadId, run.id, outputs.tool_outputs);
  const toolRun = await azureAgentClient.runs.submitToolOutputs(run.threadId, run.id, outputs.tool_outputs);
  // Recursive call with accumulated steps and messages
  return await runAssistant({
    userEmail,
    azureAgentClient,
    run_id: toolRun.id,
    thread_id,
    accumulatedSteps: steps,
    accumulatedMessages: messages,
    in_progress,
  });
}

module.exports = {
  getResponse,
  runAssistant,
  createOnTextProgress,
};