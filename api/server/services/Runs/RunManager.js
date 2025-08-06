const { ToolCallTypes } = require('librechat-data-provider');
const { logger } = require('~/config');

/**
 * @typedef {import('openai').OpenAI} OpenAI
 * @typedef {import('../AssistantService').RunStep} RunStep
 * @callback StepHandler
 * @param {RunStep} step - A single run step to be processed.
 */

/**
 * @typedef {Object} RunManager
 * Manages the retrieval and processing of run steps based on run status.
 * @property {Set<string>} seenSteps - A set of IDs for steps that have already been seen.
 * @property {Object.<string, Promise<RunStep[]>>} stepsByStatus - Steps organized by run status.
 * @property {Object.<string, StepHandler>} handlers - Handlers for different run statuses.
 * @property {Object.<string, Promise>} lastStepPromiseByStatus - Last processed step's promise by run status.
 * @property {Function} fetchRunSteps - Fetches run steps based on run status.
 * @property {Function} handleStep - Handles a run step based on its status.
 */

/**
 * Generates a signature string for a given tool call object. This signature includes
 * the tool call's id, type, and other distinguishing features based on its type.
 *
 * @param {ToolCall} toolCall The tool call object for which to generate a signature.
 * @returns {string} The generated signature for the tool call.
 */
function getToolCallSignature(toolCall) {
  if (toolCall.type === ToolCallTypes.CODE_INTERPRETER) {
    const inputLength = toolCall.code_interpreter?.input?.length ?? 0;
    const outputsLength = toolCall.code_interpreter?.outputs?.length ?? 0;
    return `${toolCall.id}-${toolCall.type}-${inputLength}-${outputsLength}`;
  }
  if (toolCall.type === ToolCallTypes.RETRIEVAL) {
    return `${toolCall.id}-${toolCall.type}`;
  }
  if (toolCall.type === ToolCallTypes.FUNCTION) {
    const argsLength = toolCall.function?.arguments?.length ?? 0;
    const hasOutput = toolCall.function?.output ? 1 : 0;
    return `${toolCall.id}-${toolCall.type}-${argsLength}-${hasOutput}`;
  }

  return `${toolCall.id}-unknown-type`;
}

/**
 * Generates a signature based on the specifics of the step details.
 * This function supports 'message_creation' and 'tool_calls' types, and returns a default signature
 * for any other type or in case the details are undefined.
 *
 * @param {MessageCreationStepDetails | ToolCallsStepDetails | undefined} details - The detailed content of the step, which can be undefined.
 * @returns {string} A signature string derived from the content of step details.
 */
function getDetailsSignature(details) {
  if (!details) {
    return 'undefined-details';
  }

  if (details.type === 'message_creation') {
    return `${details.type}-${details.message_creation.message_id}`;
  } else if (details.type === 'tool_calls') {
    const toolCallsSignature = details.tool_calls.map(getToolCallSignature).join('|');
    return `${details.type}-${toolCallsSignature}`;
  }
  return 'unknown-type';
}


/**
 * Generates a signature based on the specifics of the step details.
 * This function supports 'message_creation' and 'tool_calls' types, and returns a default signature
 * for any other type or in case the details are undefined.
 *
 * @param {MessageCreationStepDetails | ToolCallsStepDetails | undefined} details - The detailed content of the step, which can be undefined.
 * @returns {string} A signature string derived from the content of step details.
 */
function getAzureAgentDetailsSignature(details) {
  if (!details) {
    return 'undefined-details';
  }

  if (details.type === 'message_creation') {
    return `${details.type}-${details.messageCreation.messageId}`;
  } else if (details.type === 'tool_calls') {
    const toolCallsSignature = details.toolCalls.map(getToolCallSignature).join('|');
    return `${details.type}-${toolCallsSignature}`;
  }
  return 'unknown-type';
}

/**
 * Manages the retrieval and processing of run steps based on run status.
 */
class RunManager {
  /**
   * Initializes the RunManager instance.
   * @param {Object.<string, StepHandler>} handlers - An object containing handler functions for different run statuses.
   */
  constructor(handlers = {}) {
    this.seenSteps = new Set();
    this.stepsByStatus = {};
    this.handlers = handlers;
    this.lastStepPromiseByStatus = {};
  }

  /**
   * Fetches run steps once and filters out already seen steps.
   * @param {Object} params - The parameters for fetching run steps.
   * @param {OpenAI} params.openai - The OpenAI client instance.
   * @param {string} params.thread_id - The ID of the thread associated with the run.
   * @param {string} params.run_id - The ID of the run to retrieve steps for.
   * @param {string} params.runStatus - The status of the run.
   * @param {boolean} [params.final] - The end of the run polling loop, due to `requires_action`, `cancelling`, `cancelled`, `failed`, `completed`, or `expired` statuses.
   */
  async fetchRunSteps({ openai, thread_id, run_id, runStatus, final = false }) {
    // const { data: steps, first_id, last_id, has_more } = await openai.beta.threads.runs.steps.list(thread_id, run_id);
    const { data: _steps } = await openai.beta.threads.runs.steps.list(
      run_id,
      { thread_id },
      {
        timeout: 3000,
        maxRetries: 5,
      },
    );
    const steps = _steps.sort((a, b) => a.created_at - b.created_at);
    for (const [i, step] of steps.entries()) {
      const detailsSignature = getDetailsSignature(step.step_details);
      const stepKey = `${step.id}-${step.status}-${detailsSignature}`;
      if (!final && this.seenSteps.has(stepKey)) {
        continue;
      }

      const isLast = i === steps.length - 1;
      this.seenSteps.add(stepKey);
      this.stepsByStatus[runStatus] = this.stepsByStatus[runStatus] || [];

      const currentStepPromise = (async () => {
        await (this.lastStepPromiseByStatus[runStatus] || Promise.resolve());
        return this.handleStep({ step, runStatus, final, isLast });
      })();

      if (final && isLast) {
        return await currentStepPromise;
      }

      if (step.type === 'tool_calls') {
        await currentStepPromise;


        /**
         * Custom event to track when assistant tool_calls query has ended
         * @Organization Intelequia
         * @Author Pablo Suarez Romero
         */
        const detailsArray = detailsSignature.split('-');
        if(detailsArray.length > 4 && runStatus === 'completed'){
          global.appInsights.trackEvent({
            name: 'ToolCall',
            properties: {
              toolName: detailsArray[2] ?? "",
              userEmail: openai.req.user.email ,
              promptTokens: detailsArray[3] ?? "",
              completionTokens: detailsArray[4] ?? "",
              thread_id: thread_id,
              run_id: run_id,
            },
          });
        }
      }
      if (step.type === 'message_creation' && step.status === 'completed') {
        await currentStepPromise;
      }

      this.lastStepPromiseByStatus[runStatus] = currentStepPromise;
      this.stepsByStatus[runStatus].push(currentStepPromise);
    }
  }
  /**
   * Fetches run steps once and filters out already seen steps.
   * @param {Object} params - The parameters for fetching run steps.
   * @param {AIProjectsClient} params.azureAgentClient - The OpenAI client instance.
   * @param {string} params.thread_id - The ID of the thread associated with the run.
   * @param {string} params.run_id - The ID of the run to retrieve steps for.
   * @param {string} params.runStatus - The status of the run.
   * @param {boolean} [params.final] - The end of the run polling loop, due to `requires_action`, `cancelling`, `cancelled`, `failed`, `completed`, or `expired` statuses.
   */
  async fetchAzureAgentRunSteps({ azureAgentClient, thread_id, run_id, runStatus, final = false }) {
    try{
      let _steps = []
      for await (const step of azureAgentClient.runSteps.list(thread_id, run_id)){
        _steps.push(step);
      }

      const steps = _steps.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      for (const [i, step] of steps.entries()) {
        const detailsSignature = getAzureAgentDetailsSignature(step.stepDetails);
        const stepKey = `${step.id}-${step.status}-${detailsSignature}`;
        if (!final && this.seenSteps.has(stepKey)) {
          continue;
        }
        const isLast = i === steps.length - 1;
        this.seenSteps.add(stepKey);
        this.stepsByStatus[runStatus] = this.stepsByStatus[runStatus] || [];
  
        const currentStepPromise = (async () => {
          await (this.lastStepPromiseByStatus[runStatus] || Promise.resolve());
          return this.handleStep({ step, runStatus, final, isLast });
        })();

        
        if (final && isLast) {
          return await currentStepPromise;
        }

        if (step.type === 'tool_calls') {
          await currentStepPromise;
        }
        /**
         * Custom event to track when assistant tool_calls query has ended
         * @Organization Intelequia
         * @Author Pablo Suarez Romero
         */
        const detailsArray = detailsSignature.split('-');
        if(detailsArray.length > 4 && runStatus === 'completed'){
          global.appInsights.trackEvent({
            name: 'ToolCall',
            properties: {
              toolName: detailsArray[2] ?? "",
              userEmail: azureAgentClient.req.user.email ,
              promptTokens: detailsArray[3] ?? "",
              completionTokens: detailsArray[4] ?? "",
              thread_id: thread_id,
              run_id: run_id,
            },
          });
        }
      
        if (step.type === 'message_creation' && step.status === 'completed') {
          await currentStepPromise;
        } 

        this.lastStepPromiseByStatus[runStatus] = currentStepPromise;
        this.stepsByStatus[runStatus].push(currentStepPromise);
      }
    }catch (error) {
      logger.error(`[RunManager] Error fetching Azure agent run steps: ${error.message}`)
      return;
    }
  }
  /**
   * Handles a run step based on its status.
   * @param {Object} params - The parameters for handling a run step.
   * @param {RunStep} params.step - The run step to handle.
   * @param {string} params.runStatus - The status of the run step.
   * @param {string} params.final - The final run status (no further polling will occur)
   * @param {boolean} params.isLast - Whether the current step is the last step of the list.
   */
  async handleStep({ step, runStatus, final, isLast }) {
    if (this.handlers[runStatus]) {
      return await this.handlers[runStatus]({ step, final, isLast });
    }

    if (final && isLast && this.handlers['final']) {
      return await this.handlers['final']({ step, runStatus, stepsByStatus: this.stepsByStatus });
    }

    logger.debug(`[RunManager] Default handler for ${step.id} with status \`${runStatus}\``, {
      step,
      runStatus,
      final,
      isLast,
    });
    return step;
  }
}

module.exports = RunManager;
