/**
 * Token Spending and App Insights Tracking System
 * 
 * Centralized location for all token usage tracking and App Insights event emission.
 * Migrated and optimized by Intelequia for complete tracking coverage.
 * 
 * @organization Intelequia
 * @modified September 2025
 * @description Handles token transactions and App Insights tracking for all contexts
 */

const { logger } = require('~/config');
const { createTransaction, createStructuredTransaction } = require('./Transaction');

// Event type mappings for better maintainability
const EVENT_TYPES = {
  QUERY: 'query',
  START: 'start',
  END: 'end',
  TITLE: 'title',
  REASONING: 'reasoning'
};

// Context mappings
const CONTEXTS = {
  MESSAGE: 'message',
  TITLE: 'title',
  REASONING: 'reasoning',
  INCOMPLETE: 'incomplete'
};

/**
 * Get event name based on endpoint and event type
 * @param {string} endpoint - The endpoint (azureOpenAI, agents, etc.)
 * @param {string} eventType - The event type
 * @returns {string} The App Insights event name
 */
const getEventName = (endpoint, eventType) => {
  const isAzure = endpoint === "azureOpenAI";
  const eventMap = {
    [EVENT_TYPES.QUERY]: isAzure ? 'AzureQuery' : 'AgentQuery',
    [EVENT_TYPES.START]: isAzure ? 'AzureAnswerStarted' : 'AgentAnswerStarted',
    [EVENT_TYPES.END]: isAzure ? 'AzureAnswerEnded' : 'AgentAnswerEnded',
    [EVENT_TYPES.TITLE]: isAzure ? 'AzureTitleGenerated' : 'AgentTitleGenerated',
    [EVENT_TYPES.REASONING]: isAzure ? 'AzureReasoningTokens' : 'AgentReasoningTokens'
  };
  return eventMap[eventType];
};

/**
 * Build properties object for App Insights tracking
 * @param {Object} baseProps - Base properties (userId, userEmail, model, conversationId)
 * @param {string} eventType - The event type
 * @param {Object} tokenUsage - Token usage data
 * @param {Object} additionalData - Additional tracking data
 * @returns {Object} Properties object for tracking
 */
const buildTrackingProperties = (baseProps, eventType, tokenUsage, additionalData) => {
  const { promptTokens = 0, completionTokens = 0 } = tokenUsage;

  // Base properties that are always included (ORIGINAL FORMAT - REQUIRED)
  const coreProperties = {
    ...baseProps,
    // Additional useful properties for analysis
    timestamp: new Date().toISOString(),
    eventType: eventType,
    endpoint: additionalData.endpoint || 'unknown'
  };

  switch (eventType) {
    case EVENT_TYPES.QUERY:
      return {
        ...coreProperties,
        charactersLength: additionalData.charactersLength || 0,
        messageTokens: additionalData.messageTokens || 0,
        queryType: 'user_message'
      };

    case EVENT_TYPES.START:
      return {
        ...coreProperties,
        processingStage: 'completion_started'
      };

    case EVENT_TYPES.END:
      return {
        ...coreProperties,
        charactersLength: additionalData.charactersLength || 0,
        promptTokens,
        completionTokens,
        messageTokens: promptTokens + completionTokens,
        tokenEfficiency: completionTokens > 0 ? (promptTokens / completionTokens).toFixed(2) : '0',
        processingStage: 'completion_ended'
      };

    case EVENT_TYPES.TITLE:
      return {
        ...coreProperties,
        promptTokens,
        completionTokens,
        messageTokens: promptTokens + completionTokens,
        titleGeneration: true,
        processingStage: 'title_generation'
      };

    case EVENT_TYPES.REASONING:
      return {
        ...coreProperties,
        reasoningTokens: completionTokens,
        messageTokens: completionTokens,
        hasReasoning: true,
        processingStage: 'reasoning_tokens'
      };

    default:
      return coreProperties;
  }
};

/**
 * Track App Insights events for token usage
 * @param {Object} txData - Transaction data
 * @param {Object} tokenUsage - Token usage data
 * @param {string} eventType - Type of event (query, start, end, title, reasoning)
 * @param {Object} additionalData - Additional data for tracking
 */
const trackTokenUsage = async (txData, tokenUsage, eventType, additionalData = {}) => {
  try {
    if (!global.appInsights) {
      return;
    }

    const { findUser } = require('~/models');
    const userId = txData.user;

    if (!userId) {
      return;
    }

    const { email } = await findUser({ _id: userId });
    const endpoint = additionalData.endpoint || txData.endpoint;
    const eventName = getEventName(endpoint, eventType);

    if (!eventName) {
      return;
    }

    const baseProperties = {
      userId: userId,
      userEmail: email,
      model: additionalData.model || txData.model,
      conversationId: txData.conversationId,
    };

    const properties = buildTrackingProperties(baseProperties, eventType, tokenUsage, additionalData);

    global.appInsights.trackEvent({
      name: eventName,
      properties: properties,
    });

    logger.debug(`[trackTokenUsage] Event tracked: ${eventName}`, {
      endpoint: additionalData.endpoint,
      model: properties.model,
      tokens: properties.messageTokens || properties.reasoningTokens || 0,
    });
  } catch (err) {
    logger.error('[trackTokenUsage] Error tracking event:', err);
  }
};

/**
 * Determine if tracking should occur and what event type to use
 * @param {string} context - The context (message, title, reasoning, incomplete)
 * @returns {Object} { shouldTrack: boolean, eventType: string }
 */
const getTrackingInfo = (context) => {
  switch (context) {
    case CONTEXTS.MESSAGE:
      return { shouldTrack: true, eventType: EVENT_TYPES.END };
    case CONTEXTS.TITLE:
      return { shouldTrack: true, eventType: EVENT_TYPES.TITLE };
    case CONTEXTS.REASONING:
      return { shouldTrack: true, eventType: EVENT_TYPES.REASONING };
    case CONTEXTS.INCOMPLETE:
      return { shouldTrack: true, eventType: EVENT_TYPES.END }; // Track incomplete as end event
    default:
      return { shouldTrack: false, eventType: null };
  }
};
/**
 * Creates up to two transactions to record the spending of tokens.
 *
 * @function
 * @async
 * @param {txData} txData - Transaction data.
 * @param {Object} tokenUsage - The number of tokens used.
 * @param {number} tokenUsage.promptTokens - The number of prompt tokens used.
 * @param {number} tokenUsage.completionTokens - The number of completion tokens used.
 * @param {Object} [trackingData] - Additional data for App Insights tracking.
 * @returns {Promise<void>} - Returns nothing.
 * @throws {Error} - Throws an error if there's an issue creating the transactions.
 */
const spendTokens = async (txData, tokenUsage, trackingData = {}) => {
  const { promptTokens, completionTokens } = tokenUsage;

  logger.debug(
    `[spendTokens] conversationId: ${txData.conversationId}${txData?.context ? ` | Context: ${txData?.context}` : ''
    } | Token usage: `,
    {
      promptTokens,
      completionTokens,
    },
  );

  // Track App Insights events based on context
  if ((promptTokens > 0 || completionTokens > 0) && trackingData.skipTracking !== true) {
    const { shouldTrack, eventType } = getTrackingInfo(txData.context);

    if (shouldTrack) {
      await trackTokenUsage(txData, tokenUsage, eventType, {
        endpoint: trackingData.endpoint,
        model: txData.model || trackingData.model,
        charactersLength: trackingData.charactersLength || trackingData.completionLength || 0,
      });
    }
  }

  // Create balance transactions
  let prompt, completion;
  try {
    if (promptTokens !== undefined) {
      prompt = await createTransaction({
        ...txData,
        tokenType: 'prompt',
        rawAmount: promptTokens === 0 ? 0 : -Math.max(promptTokens, 0),
      });
    }

    if (completionTokens !== undefined) {
      completion = await createTransaction({
        ...txData,
        tokenType: 'completion',
        rawAmount: completionTokens === 0 ? 0 : -Math.max(completionTokens, 0),
      });
    }

    if (prompt || completion) {
      logger.debug('[spendTokens] Transaction data record against balance:', {
        user: txData.user,
        prompt: prompt?.prompt,
        promptRate: prompt?.rate,
        completion: completion?.completion,
        completionRate: completion?.rate,
        balance: completion?.balance ?? prompt?.balance,
      });
    } else {
      logger.debug('[spendTokens] No transactions incurred against balance');
    }
  } catch (err) {
    logger.error('[spendTokens]', err);
  }
};

/**
 * Creates transactions to record the spending of structured tokens.
 *
 * @function
 * @async
 * @param {txData} txData - Transaction data.
 * @param {Object} tokenUsage - The number of tokens used.
 * @param {Object} tokenUsage.promptTokens - The number of prompt tokens used.
 * @param {number} tokenUsage.promptTokens.input - The number of input tokens.
 * @param {number} tokenUsage.promptTokens.write - The number of write tokens.
 * @param {number} tokenUsage.promptTokens.read - The number of read tokens.
 * @param {number} tokenUsage.completionTokens - The number of completion tokens used.
 * @param {Object} [trackingData] - Additional data for App Insights tracking.
 * @returns {Promise<Object>} - Returns { prompt, completion } transaction objects.
 * @throws {Error} - Throws an error if there's an issue creating the transactions.
 */
const spendStructuredTokens = async (txData, tokenUsage, trackingData = {}) => {
  const { promptTokens, completionTokens } = tokenUsage;

  logger.debug(
    `[spendStructuredTokens] conversationId: ${txData.conversationId}${txData?.context ? ` | Context: ${txData?.context}` : ''
    } | Token usage: `,
    {
      promptTokens,
      completionTokens,
    },
  );

  // Calculate total prompt tokens for tracking
  let totalPromptTokens = 0;
  if (promptTokens) {
    const { input = 0, write = 0, read = 0 } = promptTokens;
    totalPromptTokens = input + write + read;
  }

  // Track App Insights events based on context
  if ((totalPromptTokens > 0 || completionTokens > 0) && trackingData.skipTracking !== true) {
    const { shouldTrack, eventType } = getTrackingInfo(txData.context);

    if (shouldTrack) {
      await trackTokenUsage(txData, {
        promptTokens: totalPromptTokens,
        completionTokens: completionTokens || 0
      }, eventType, {
        endpoint: trackingData.endpoint,
        model: txData.model || trackingData.model,
        charactersLength: trackingData.charactersLength || trackingData.completionLength || 0,
      });
    }
  }

  // Create balance transactions
  let prompt, completion;
  try {
    if (promptTokens) {
      const { input = 0, write = 0, read = 0 } = promptTokens;
      prompt = await createStructuredTransaction({
        ...txData,
        tokenType: 'prompt',
        inputTokens: -input,
        writeTokens: -write,
        readTokens: -read,
      });
    }

    if (completionTokens) {
      completion = await createTransaction({
        ...txData,
        tokenType: 'completion',
        rawAmount: -completionTokens,
      });
    }

    if (prompt || completion) {
      logger.debug('[spendStructuredTokens] Transaction data record against balance:', {
        user: txData.user,
        prompt: prompt?.prompt,
        promptRate: prompt?.rate,
        completion: completion?.completion,
        completionRate: completion?.rate,
        balance: completion?.balance ?? prompt?.balance,
      });
    } else {
      logger.debug('[spendStructuredTokens] No transactions incurred against balance');
    }
  } catch (err) {
    logger.error('[spendStructuredTokens]', err);
  }

  return { prompt, completion };
};

module.exports = {
  spendTokens,
  spendStructuredTokens,
  trackTokenUsage,
  EVENT_TYPES,
  CONTEXTS,
  // Event tracking functions (for events WITHOUT token consumption)
  /**
   * Track query event when user creates a completion request
   * @param {Object} txData - Transaction data
   * @param {Object} trackingData - Additional tracking data
   */
  trackQueryEvent: async (txData, trackingData = {}) => {
    await trackTokenUsage(txData, {}, EVENT_TYPES.QUERY, trackingData);
  },

  /**
   * Track start event when completion processing begins
   * @param {Object} txData - Transaction data  
   * @param {Object} trackingData - Additional tracking data
   */
  trackStartEvent: async (txData, trackingData = {}) => {
    await trackTokenUsage(txData, {}, EVENT_TYPES.START, trackingData);
  }

  // NOTE: For events WITH token consumption, use spendTokens() with appropriate context:
  // - spendTokens(txData, tokenUsage, { context: 'message' })    → tracks AzureAnswerEnded/AgentAnswerEnded
  // - spendTokens(txData, tokenUsage, { context: 'title' })      → tracks AzureTitleGenerated/AgentTitleGenerated  
  // - spendTokens(txData, tokenUsage, { context: 'reasoning' })  → tracks AzureReasoningTokens/AgentReasoningTokens
};
