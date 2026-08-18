jest.mock('~/models', () => ({
    getMultiplier: ({ tokenType }) => (tokenType === 'prompt' ? 2.5 : 10),
    getCacheMultiplier: ({ cacheType }) => (cacheType === 'write' ? 1.25 : 0.25),
    findUser: jest.fn().mockResolvedValue({ email: 'user@example.com' }),
}));

const {
    computeRatedUsage,
    createGlobalTrackingSpendStructuredTokens,
    createGlobalTrackingSpendTokens,
    trackQueryEvent,
    trackSpendEvent,
} = require('./appInsights');

describe('App Insights token usage', () => {
    afterEach(() => {
        delete global.appInsights;
    });

    it('applies per-category rates while preserving raw token counts', () => {
        const ratedUsage = computeRatedUsage(
            {
                promptTokens: 70,
                cacheCreationTokens: 10,
                cacheReadTokens: 20,
                completionTokens: 5,
            },
            { model: 'gpt-4o', endpoint: 'azureOpenAI' },
        );

        expect(ratedUsage).toEqual({
            promptTokens: 175,
            cacheCreationTokens: 12.5,
            cacheReadTokens: 5,
            completionTokens: 50,
            messageTokens: 242.5,
            rawPromptTokens: 70,
            rawCacheCreationTokens: 10,
            rawCacheReadTokens: 20,
            rawCompletionTokens: 5,
            rawMessageTokens: 105,
            rawInputTokens: 100,
            promptRate: 2.5,
            cacheCreationRate: 1.25,
            cacheReadRate: 0.25,
            completionRate: 10,
            rate: 242.5 / 105,
        });
    });

    it('does not count Azure cache tokens twice in bulk telemetry', async () => {
        const trackEvent = jest.fn();
        global.appInsights = { trackEvent };

        await trackSpendEvent({
            eventName: 'AzureAnswerEnded',
            userId: 'user-1',
            agentId: 'agent-1',
            model: 'gpt-4o',
            conversationId: 'conversation-1',
            endpoint: 'azureOpenAI',
            context: 'message',
            collectedUsage: [
                {
                    input_tokens: 100,
                    input_token_details: { cache_creation: 10, cache_read: 20 },
                    output_tokens: 5,
                    provider: 'azureOpenAI',
                    model: 'gpt-4o',
                },
            ],
        });

        const [event] = trackEvent.mock.calls[0];
        expect(event.properties).toEqual(
            expect.objectContaining({
                agentId: 'agent-1',
                promptTokens: 175,
                cacheCreationTokens: 12.5,
                cacheReadTokens: 5,
                completionTokens: 50,
                messageTokens: 242.5,
                rawPromptTokens: 70,
                rawInputTokens: 100,
                rawMessageTokens: 105,
                rate: 242.5 / 105,
            }),
        );
    });

    it('rates standard and structured spend wrapper events', async () => {
        const trackEvent = jest.fn();
        const spendTokens = jest.fn().mockResolvedValue('standard');
        const spendStructuredTokens = jest.fn().mockResolvedValue('structured');
        global.appInsights = { trackEvent };

        const standardResult = await createGlobalTrackingSpendTokens(spendTokens)(
            {
                user: 'user-1',
                model: 'gpt-4o',
                endpoint: 'azureOpenAI',
                context: 'message',
                conversationId: 'conversation-1',
            },
            { promptTokens: 10, completionTokens: 2 },
        );
        const structuredResult = await createGlobalTrackingSpendStructuredTokens(spendStructuredTokens)(
            {
                user: 'user-1',
                model: 'gpt-4o',
                endpoint: 'azureOpenAI',
                context: 'message',
                conversationId: 'conversation-1',
            },
            { promptTokens: { input: 10, write: 2, read: 3 }, completionTokens: 2 },
        );

        expect(standardResult).toBe('standard');
        expect(structuredResult).toBe('structured');
        expect(trackEvent.mock.calls[0][0].properties).toEqual(
            expect.objectContaining({
                promptTokens: 25,
                completionTokens: 20,
                messageTokens: 45,
                rawPromptTokens: 10,
                rawCompletionTokens: 2,
                rate: 45 / 12,
            }),
        );
        expect(trackEvent.mock.calls[1][0].properties).toEqual(
            expect.objectContaining({
                promptTokens: 25,
                cacheCreationTokens: 2.5,
                cacheReadTokens: 0.75,
                completionTokens: 20,
                messageTokens: 48.25,
                rawMessageTokens: 17,
            }),
        );
    });

    it('rates estimated query token metadata without storing query text', async () => {
        const trackEvent = jest.fn();
        global.appInsights = { trackEvent };

        await trackQueryEvent(
            {
                user: 'user-1',
                model: 'gpt-4o',
                endpoint: 'azureOpenAI',
                conversationId: 'conversation-1',
            },
            { charactersLength: 5, messageTokens: 10 },
        );

        expect(trackEvent).toHaveBeenCalledWith(expect.objectContaining({ name: 'AzureQuery' }));
        expect(trackEvent.mock.calls[0][0].properties).toEqual(
            expect.objectContaining({
                messageTokens: 25,
                rawMessageTokens: 10,
                promptRate: 2.5,
            }),
        );
        expect(trackEvent.mock.calls[0][0].properties).not.toHaveProperty('query');
    });
});
