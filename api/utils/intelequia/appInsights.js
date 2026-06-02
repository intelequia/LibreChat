/**
 * App Insights Tracking — Single Source of Truth
 *
 * ALL Application Insights telemetry MUST go through this module.
 * No other file should reference `global.appInsights` directly.
 *
 * @organization Intelequia
 */

const { logger } = require('@librechat/data-schemas');

/* ─────────────────────────────────────────────
 * Core: the ONE function that talks to App Insights
 * ───────────────────────────────────────────── */

/**
 * Emit an App Insights custom event. Safe to call even when App Insights is not configured.
 * @param {string} name - Event name (e.g. 'Login', 'Plugin', 'AzureQuery')
 * @param {Record<string, unknown>} [properties] - Event properties
 */
const trackEvent = (name, properties = {}) => {
    if (!global.appInsights) {
        return;
    }
    try {
        global.appInsights.trackEvent({ name, properties });
    } catch (err) {
        logger.error(`[appInsights] Error emitting "${name}":`, err);
    }
};

/* ─────────────────────────────────────────────
 * Token-usage tracking (spendTokens wrappers)
 * ───────────────────────────────────────────── */

const EVENT_TYPES = {
    QUERY: 'query',
    START: 'start',
    END: 'end',
    TITLE: 'title',
    REASONING: 'reasoning',
};

const CONTEXTS = {
    MESSAGE: 'message',
    TITLE: 'title',
    REASONING: 'reasoning',
    INCOMPLETE: 'incomplete',
};

const getSpendEventName = (endpoint, eventType) => {
    const isAzure = endpoint === 'azureOpenAI';
    const map = {
        [EVENT_TYPES.QUERY]: isAzure ? 'AzureQuery' : 'AgentQuery',
        [EVENT_TYPES.START]: isAzure ? 'AzureAnswerStarted' : 'AgentAnswerStarted',
        [EVENT_TYPES.END]: isAzure ? 'AzureAnswerEnded' : 'AgentAnswerEnded',
        [EVENT_TYPES.TITLE]: isAzure ? 'AzureTitleGenerated' : 'AgentTitleGenerated',
        [EVENT_TYPES.REASONING]: isAzure ? 'AzureReasoningTokens' : 'AgentReasoningTokens',
    };
    return map[eventType];
};

const getTrackingInfo = (context) => {
    switch (context) {
        case CONTEXTS.MESSAGE:
        case CONTEXTS.INCOMPLETE:
            return { shouldTrack: true, eventType: EVENT_TYPES.END };
        case CONTEXTS.TITLE:
            return { shouldTrack: true, eventType: EVENT_TYPES.TITLE };
        case CONTEXTS.REASONING:
            return { shouldTrack: true, eventType: EVENT_TYPES.REASONING };
        default:
            return { shouldTrack: false, eventType: null };
    }
};

const buildSpendProperties = (baseProps, eventType, tokenUsage, additionalData) => {
    const { promptTokens = 0, completionTokens = 0, cacheCreationTokens = 0, cacheReadTokens = 0 } = tokenUsage;
    const core = {
        ...baseProps,
        timestamp: new Date().toISOString(),
        eventType,
        endpoint: additionalData.endpoint || 'unknown',
    };

    switch (eventType) {
        case EVENT_TYPES.QUERY:
            return { ...core, charactersLength: additionalData.charactersLength || 0, messageTokens: additionalData.messageTokens || 0 };
        case EVENT_TYPES.START:
            return core;
        case EVENT_TYPES.END:
            return { ...core, charactersLength: additionalData.charactersLength || 0, promptTokens, cacheCreationTokens, cacheReadTokens, completionTokens, messageTokens: promptTokens + cacheCreationTokens + cacheReadTokens + completionTokens };
        case EVENT_TYPES.TITLE:
            return { ...core, promptTokens, cacheCreationTokens, cacheReadTokens, completionTokens, messageTokens: promptTokens + cacheCreationTokens + cacheReadTokens + completionTokens };
        case EVENT_TYPES.REASONING:
            return { ...core, reasoningTokens: completionTokens, messageTokens: completionTokens };
        default:
            return core;
    }
};

/**
 * Internal: track a token-spending event (resolves user email from DB).
 */
const trackTokenUsage = async (txData, tokenUsage, eventType, additionalData = {}) => {
    if (!global.appInsights) {
        return;
    }
    const userId = txData.user;
    if (!userId) {
        return;
    }
    try {
        const { findUser } = require('~/models');
        const user = await findUser({ _id: userId });
        if (!user) {
            return;
        }
        const endpoint = additionalData.endpoint || txData.endpoint;
        const eventName = getSpendEventName(endpoint, eventType);
        if (!eventName) {
            return;
        }
        const properties = buildSpendProperties(
            { userId, userEmail: user.email, model: additionalData.model || txData.model, conversationId: txData.conversationId },
            eventType,
            tokenUsage,
            { ...additionalData, endpoint },
        );
        trackEvent(eventName, properties);
    } catch (err) {
        logger.error('[appInsights] trackTokenUsage error:', err);
    }
};

const trackQueryEvent = async (txData, trackingData = {}) => {
    await trackTokenUsage(txData, {}, EVENT_TYPES.QUERY, trackingData);
};

const trackStartEvent = async (txData, trackingData = {}) => {
    await trackTokenUsage(txData, {}, EVENT_TYPES.START, trackingData);
};

const createGlobalTrackingSpendTokens = (spendTokensFn) => {
    return async (txData, tokenUsage, trackingData = {}) => {
        const { promptTokens = 0, completionTokens = 0 } = tokenUsage;
        if (promptTokens > 0 || completionTokens > 0) {
            const { shouldTrack, eventType } = getTrackingInfo(txData.context);
            if (shouldTrack) {
                await trackTokenUsage(txData, tokenUsage, eventType, {
                    endpoint: trackingData.endpoint || txData.endpoint,
                    model: trackingData.model || txData.model,
                    charactersLength: trackingData.completionLength || trackingData.charactersLength || 0,
                });
            }
        }
        return spendTokensFn(txData, tokenUsage);
    };
};

const createGlobalTrackingSpendStructuredTokens = (spendStructuredTokensFn) => {
    return async (txData, tokenUsage, trackingData = {}) => {
        const { promptTokens, completionTokens = 0 } = tokenUsage;
        const inputTokens = promptTokens ? (promptTokens.input || 0) : 0;
        const cacheCreationTokens = promptTokens ? (promptTokens.write || 0) : 0;
        const cacheReadTokens = promptTokens ? (promptTokens.read || 0) : 0;
        if (inputTokens > 0 || cacheCreationTokens > 0 || cacheReadTokens > 0 || completionTokens > 0) {
            const { shouldTrack, eventType } = getTrackingInfo(txData.context);
            if (shouldTrack) {
                await trackTokenUsage(txData, { promptTokens: inputTokens, cacheCreationTokens, cacheReadTokens, completionTokens }, eventType, {
                    endpoint: trackingData.endpoint || txData.endpoint,
                    model: trackingData.model || txData.model,
                    charactersLength: trackingData.completionLength || trackingData.charactersLength || 0,
                });
            }
        }
        return spendStructuredTokensFn(txData, tokenUsage);
    };
};

/* ─────────────────────────────────────────────
 * Exports
 * ───────────────────────────────────────────── */

module.exports = {
    trackEvent,
    trackQueryEvent,
    trackStartEvent,
    createGlobalTrackingSpendTokens,
    createGlobalTrackingSpendStructuredTokens,
};
