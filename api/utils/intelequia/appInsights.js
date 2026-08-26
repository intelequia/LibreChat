/**
 * App Insights Tracking — Single Source of Truth
 *
 * ALL Application Insights telemetry MUST go through this module.
 * No other file should reference `global.appInsights` directly.
 *
 * @organization Intelequia
 */

const { CANCEL_RATE = 1.15, logger } = require('@librechat/data-schemas');

/* ─────────────────────────────────────────────
 * Core: the ONE function that talks to App Insights
 * ───────────────────────────────────────────── */

/**
 * Emit an App Insights custom event. Safe to call even when App Insights is not configured.
 * @param {string} name - Event name (e.g. 'Login', 'Plugin', 'AzureQuery')
 * @param {Record<string, unknown>} [properties] - Event properties
 */
const trackEvent = async (name, properties = {}) => {
    if (!global.appInsights) {
        return;
    }
    try {
        // Enrich with userEmail if userId present but email missing
        const enrichedProps = await enrichPropertiesWithUserEmail(properties);
        global.appInsights.trackEvent({ name, properties: enrichedProps });
    } catch (err) {
        logger.error(`[appInsights] Error emitting "${name}":`, err);
    }
};

/**
 * Enrich properties with userEmail if userId is present but email is missing.
 * Resolves user email from database.
 * @param {Record<string, unknown>} properties - Event properties
 * @returns {Promise<Record<string, unknown>>} Properties with userEmail added
 */
const enrichPropertiesWithUserEmail = async (properties) => {
    if (!properties || typeof properties !== 'object') {
        return properties;
    }

    // If email already present or no userId, return as-is
    if (properties.userEmail || !properties.userId) {
        return properties;
    }

    try {
        const { findUser } = require('~/models');
        const user = await findUser({ _id: properties.userId });
        if (user && user.email) {
            return { ...properties, userEmail: user.email };
        }
    } catch (err) {
        logger.warn(`[appInsights] Could not resolve email for userId ${properties.userId}:`, err);
    }

    return properties;
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

const CACHE_SUBSET_PROVIDERS = new Set([
    'openAI',
    'azureOpenAI',
    'google',
    'vertexai',
    'xai',
    'deepseek',
    'openrouter',
    'moonshot',
    'anthropic',
]);

const toTokenCount = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
};

const toRate = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? Math.abs(numericValue) : 1;
};

const firstTokenCount = (...values) => {
    for (const value of values) {
        const tokenCount = toTokenCount(value);
        if (tokenCount > 0) {
            return tokenCount;
        }
    }
    return 0;
};

const getCacheCreationTokens = (usage = {}) => firstTokenCount(
    usage.input_token_details?.cache_creation,
    usage.input_token_details?.cache_write_tokens,
    usage.cache_creation_input_tokens,
    usage.cache_write_tokens,
);

const getCacheReadTokens = (usage = {}) => firstTokenCount(
    usage.input_token_details?.cache_read,
    usage.cache_read_input_tokens,
);

const inputTokensIncludeCache = (provider) => CACHE_SUBSET_PROVIDERS.has(provider || '');

const resolveCompletionTokens = (usage, provider, cacheCreationTokens, cacheReadTokens) => {
    const inputTokens = toTokenCount(usage.input_tokens);
    const outputTokens = toTokenCount(usage.output_tokens);
    const totalTokens = toTokenCount(usage.total_tokens);
    const cacheAdjustment = inputTokensIncludeCache(provider)
        ? 0
        : cacheCreationTokens + cacheReadTokens;

    if (totalTokens > inputTokens + outputTokens + cacheAdjustment) {
        return totalTokens - inputTokens - cacheAdjustment;
    }

    return outputTokens;
};

const normalizeCollectedUsage = (usage = {}, endpoint) => {
    const provider = usage.provider || endpoint;
    const rawInputTokens = toTokenCount(usage.input_tokens);
    const rawCacheCreationTokens = getCacheCreationTokens(usage);
    const rawCacheReadTokens = getCacheReadTokens(usage);
    const rawPromptTokens = inputTokensIncludeCache(provider)
        ? Math.max(0, rawInputTokens - rawCacheCreationTokens - rawCacheReadTokens)
        : rawInputTokens;

    return {
        promptTokens: rawPromptTokens,
        cacheCreationTokens: rawCacheCreationTokens,
        cacheReadTokens: rawCacheReadTokens,
        completionTokens: resolveCompletionTokens(
            usage,
            provider,
            rawCacheCreationTokens,
            rawCacheReadTokens,
        ),
        rawInputTokens,
    };
};

const getPricing = (pricing) => pricing || require('~/models');

const getUsageRates = ({
    model,
    endpoint,
    endpointTokenConfig,
    inputTokenCount,
    context,
    pricing,
}) => {
    const pricingMethods = getPricing(pricing);
    const promptRate = toRate(pricingMethods.getMultiplier({
        model,
        endpoint,
        tokenType: 'prompt',
        inputTokenCount,
        endpointTokenConfig,
    }));
    const completionRate = toRate(pricingMethods.getMultiplier({
        model,
        endpoint,
        tokenType: 'completion',
        inputTokenCount,
        endpointTokenConfig,
    })) * (context === CONTEXTS.INCOMPLETE ? CANCEL_RATE : 1);
    const cacheCreationRate = pricingMethods.getCacheMultiplier({
        model,
        endpoint,
        cacheType: 'write',
        inputTokenCount,
        endpointTokenConfig,
    });
    const cacheReadRate = pricingMethods.getCacheMultiplier({
        model,
        endpoint,
        cacheType: 'read',
        inputTokenCount,
        endpointTokenConfig,
    });

    return {
        promptRate,
        completionRate,
        cacheCreationRate: cacheCreationRate == null ? promptRate : toRate(cacheCreationRate),
        cacheReadRate: cacheReadRate == null ? promptRate : toRate(cacheReadRate),
    };
};

const computeRatedUsage = (tokenUsage = {}, options = {}) => {
    const rawPromptTokens = toTokenCount(tokenUsage.promptTokens);
    const rawCacheCreationTokens = toTokenCount(tokenUsage.cacheCreationTokens);
    const rawCacheReadTokens = toTokenCount(tokenUsage.cacheReadTokens);
    const rawCompletionTokens = toTokenCount(tokenUsage.completionTokens);
    const rawMessageTokens = rawPromptTokens
        + rawCacheCreationTokens
        + rawCacheReadTokens
        + rawCompletionTokens;
    const inputTokenCount = options.inputTokenCount ?? rawPromptTokens
        + rawCacheCreationTokens
        + rawCacheReadTokens;
    const rates = getUsageRates({ ...options, inputTokenCount });
    const promptTokens = rawPromptTokens * rates.promptRate;
    const cacheCreationTokens = rawCacheCreationTokens * rates.cacheCreationRate;
    const cacheReadTokens = rawCacheReadTokens * rates.cacheReadRate;
    const completionTokens = rawCompletionTokens * rates.completionRate;
    const messageTokens = promptTokens + cacheCreationTokens + cacheReadTokens + completionTokens;
    const rawInputTokens = tokenUsage.rawInputTokens == null
        ? rawPromptTokens + rawCacheCreationTokens + rawCacheReadTokens
        : toTokenCount(tokenUsage.rawInputTokens);

    return {
        promptTokens,
        cacheCreationTokens,
        cacheReadTokens,
        completionTokens,
        messageTokens,
        rawPromptTokens,
        rawCacheCreationTokens,
        rawCacheReadTokens,
        rawCompletionTokens,
        rawMessageTokens,
        rawInputTokens,
        promptRate: rates.promptRate,
        cacheCreationRate: rates.cacheCreationRate,
        cacheReadRate: rates.cacheReadRate,
        completionRate: rates.completionRate,
        rate: rawMessageTokens > 0 ? messageTokens / rawMessageTokens : rates.promptRate,
    };
};

const aggregateCollectedUsage = (collectedUsage, options = {}) => {
    const totals = {
        rawPromptTokens: 0,
        rawCacheCreationTokens: 0,
        rawCacheReadTokens: 0,
        rawCompletionTokens: 0,
        rawInputTokens: 0,
        ratedPromptTokens: 0,
        ratedCacheCreationTokens: 0,
        ratedCacheReadTokens: 0,
        ratedCompletionTokens: 0,
        firstRates: null,
    };

    for (const usage of collectedUsage || []) {
        if (!usage) {
            continue;
        }
        const normalizedUsage = normalizeCollectedUsage(usage, options.endpoint);
        const endpointTokenConfig = options.resolveEndpointTokenConfig
            ? options.resolveEndpointTokenConfig(usage)
            : options.endpointTokenConfig;
        const ratedUsage = computeRatedUsage(normalizedUsage, {
            ...options,
            endpointTokenConfig,
            model: usage.model || options.model,
        });

        totals.rawPromptTokens += ratedUsage.rawPromptTokens;
        totals.rawCacheCreationTokens += ratedUsage.rawCacheCreationTokens;
        totals.rawCacheReadTokens += ratedUsage.rawCacheReadTokens;
        totals.rawCompletionTokens += ratedUsage.rawCompletionTokens;
        totals.rawInputTokens += ratedUsage.rawInputTokens;
        totals.ratedPromptTokens += ratedUsage.promptTokens;
        totals.ratedCacheCreationTokens += ratedUsage.cacheCreationTokens;
        totals.ratedCacheReadTokens += ratedUsage.cacheReadTokens;
        totals.ratedCompletionTokens += ratedUsage.completionTokens;
        totals.firstRates ||= ratedUsage;
    }

    const rawMessageTokens = totals.rawPromptTokens
        + totals.rawCacheCreationTokens
        + totals.rawCacheReadTokens
        + totals.rawCompletionTokens;
    const messageTokens = totals.ratedPromptTokens
        + totals.ratedCacheCreationTokens
        + totals.ratedCacheReadTokens
        + totals.ratedCompletionTokens;
    const firstRates = totals.firstRates || computeRatedUsage({}, options);
    const weightedRate = (ratedTokens, rawTokens, fallback) => (
        rawTokens > 0 ? ratedTokens / rawTokens : fallback
    );

    return {
        promptTokens: totals.ratedPromptTokens,
        cacheCreationTokens: totals.ratedCacheCreationTokens,
        cacheReadTokens: totals.ratedCacheReadTokens,
        completionTokens: totals.ratedCompletionTokens,
        messageTokens,
        rawPromptTokens: totals.rawPromptTokens,
        rawCacheCreationTokens: totals.rawCacheCreationTokens,
        rawCacheReadTokens: totals.rawCacheReadTokens,
        rawCompletionTokens: totals.rawCompletionTokens,
        rawMessageTokens,
        rawInputTokens: totals.rawInputTokens,
        promptRate: weightedRate(totals.ratedPromptTokens, totals.rawPromptTokens, firstRates.promptRate),
        cacheCreationRate: weightedRate(
            totals.ratedCacheCreationTokens,
            totals.rawCacheCreationTokens,
            firstRates.cacheCreationRate,
        ),
        cacheReadRate: weightedRate(
            totals.ratedCacheReadTokens,
            totals.rawCacheReadTokens,
            firstRates.cacheReadRate,
        ),
        completionRate: weightedRate(
            totals.ratedCompletionTokens,
            totals.rawCompletionTokens,
            firstRates.completionRate,
        ),
        rate: weightedRate(messageTokens, rawMessageTokens, firstRates.rate),
    };
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

const buildSpendProperties = (baseProps, eventType, tokenUsage, additionalData = {}) => {
    const core = {
        ...baseProps,
        timestamp: new Date().toISOString(),
        eventType,
        endpoint: additionalData.endpoint || 'unknown',
    };

    switch (eventType) {
        case EVENT_TYPES.QUERY: {
            const ratedUsage = computeRatedUsage({
                promptTokens: additionalData.messageTokens,
                rawInputTokens: additionalData.messageTokens,
            }, additionalData);
            return {
                ...core,
                charactersLength: additionalData.charactersLength || 0,
                ...ratedUsage,
            };
        }
        case EVENT_TYPES.START:
            return core;
        case EVENT_TYPES.END:
        case EVENT_TYPES.TITLE: {
            const ratedUsage = additionalData.ratedUsage
                ? tokenUsage
                : computeRatedUsage(tokenUsage, additionalData);
            return {
                ...core,
                ...(eventType === EVENT_TYPES.END && { charactersLength: additionalData.charactersLength || 0 }),
                ...ratedUsage,
            };
        }
        case EVENT_TYPES.REASONING: {
            const ratedUsage = additionalData.ratedUsage
                ? tokenUsage
                : computeRatedUsage({ completionTokens: tokenUsage.completionTokens }, additionalData);
            return {
                ...core,
                reasoningTokens: ratedUsage.completionTokens,
                rawReasoningTokens: ratedUsage.rawCompletionTokens,
                completionRate: ratedUsage.completionRate,
                rate: ratedUsage.rate,
                messageTokens: ratedUsage.messageTokens,
                rawMessageTokens: ratedUsage.rawMessageTokens,
            };
        }
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
            {
                ...additionalData,
                context: txData.context,
                endpoint,
                endpointTokenConfig: additionalData.endpointTokenConfig ?? txData.endpointTokenConfig,
            },
        );
        await trackEvent(eventName, properties);
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

const trackSpendEvent = async ({
    eventName,
    userId,
    userEmail,
    agentId,
    model,
    conversationId,
    endpoint,
    endpointTokenConfig,
    resolveEndpointTokenConfig,
    collectedUsage,
    context = CONTEXTS.MESSAGE,
    charactersLength = 0,
}) => {
    if (!global.appInsights || !userId || !collectedUsage?.length) {
        return;
    }

    try {
        const { eventType } = getTrackingInfo(context);
        const resolvedEventType = eventType || EVENT_TYPES.END;
        const properties = buildSpendProperties(
            { userId, userEmail, ...(agentId && { agentId }), model, conversationId },
            resolvedEventType,
            aggregateCollectedUsage(collectedUsage, {
                endpoint,
                endpointTokenConfig,
                resolveEndpointTokenConfig,
                model,
                context,
            }),
            { endpoint, charactersLength, context, ratedUsage: true },
        );
        await trackEvent(eventName || getSpendEventName(endpoint, resolvedEventType), properties);
    } catch (err) {
        logger.error('[appInsights] trackSpendEvent error:', err);
    }
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
                    endpointTokenConfig: trackingData.endpointTokenConfig ?? txData.endpointTokenConfig,
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
                    endpointTokenConfig: trackingData.endpointTokenConfig ?? txData.endpointTokenConfig,
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
    trackSpendEvent,
    computeRatedUsage,
    createGlobalTrackingSpendTokens,
    createGlobalTrackingSpendStructuredTokens,
};
