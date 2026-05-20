'use strict';

var axios = require('axios');
var utils = require('./utils.cjs');

class BaseReranker {
    apiKey;
    logger;
    constructor(logger) {
        // Each specific reranker will set its API key
        this.logger = logger || utils.createDefaultLogger();
    }
    getDefaultRanking(documents, topK) {
        return documents
            .slice(0, Math.min(topK, documents.length))
            .map((doc) => ({ text: doc, score: 0 }));
    }
}
class JinaReranker extends BaseReranker {
    apiUrl;
    constructor({ apiKey = process.env.JINA_API_KEY, apiUrl = process.env.JINA_API_URL || 'https://api.jina.ai/v1/rerank', logger, }) {
        super(logger);
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }
    async rerank(query, documents, topK = 5) {
        this.logger.debug(`Reranking ${documents.length} chunks with Jina using API URL: ${this.apiUrl}`);
        try {
            if (this.apiKey == null || this.apiKey === '') {
                this.logger.warn('JINA_API_KEY is not set. Using default ranking.');
                return this.getDefaultRanking(documents, topK);
            }
            const requestData = {
                model: 'jina-reranker-v2-base-multilingual',
                query: query,
                top_n: topK,
                documents: documents,
                return_documents: true,
            };
            const response = await axios.post(this.apiUrl, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            this.logger.debug('Jina API Model:', response.data?.model);
            this.logger.debug('Jina API Usage:', response.data?.usage);
            if (response.data && response.data.results.length) {
                return response.data.results.map((result) => {
                    const docIndex = result.index;
                    const score = result.relevance_score;
                    let text = '';
                    // If return_documents is true, the document field will be present
                    if (result.document != null) {
                        const doc = result.document;
                        if (typeof doc === 'object' && 'text' in doc) {
                            text = doc.text;
                        }
                        else if (typeof doc === 'string') {
                            text = doc;
                        }
                    }
                    else {
                        // Otherwise, use the index to get the document
                        text = documents[docIndex];
                    }
                    return { text, score };
                });
            }
            else {
                this.logger.warn('Unexpected response format from Jina API. Using default ranking.');
                return this.getDefaultRanking(documents, topK);
            }
        }
        catch (error) {
            this.logger.error('Error using Jina reranker:', error);
            // Fallback to default ranking on error
            return this.getDefaultRanking(documents, topK);
        }
    }
}
class CohereReranker extends BaseReranker {
    apiUrl;
    model;
    static _circuitOpen = false;
    static _circuitResetAt = 0;
    static _queue = Promise.resolve();
    static _callTimestamps = [];
    // Batch mode state
    static _batch = [];
    static _batchTimer = null;
    // Configurable via env vars (with sensible defaults)
    static get MAX_RPM() { return parseInt(process.env.CUSTOM_RERANKER_MAX_RPM || '18', 10); }
    static get TIMEOUT_MS() { return parseInt(process.env.CUSTOM_RERANKER_TIMEOUT_MS || '10000', 10); }
    static get BATCH_TIMEOUT_MS() { return parseInt(process.env.CUSTOM_RERANKER_BATCH_TIMEOUT_MS || '15000', 10); }
    static get BATCH_WAIT_MS() { return parseInt(process.env.CUSTOM_RERANKER_BATCH_WAIT_MS || '300', 10); }
    static get CIRCUIT_COOLDOWN_MS() { return parseInt(process.env.CUSTOM_RERANKER_CIRCUIT_COOLDOWN_MS || '30000', 10); }
    static get TIMEOUT_COOLDOWN_MS() { return parseInt(process.env.CUSTOM_RERANKER_TIMEOUT_COOLDOWN_MS || '15000', 10); }
    constructor({ apiKey, apiUrl, model, logger, }) {
        super(logger);
        this.apiKey = process.env.CUSTOM_RERANKER_API_KEY || apiKey || process.env.COHERE_API_KEY;
        this.apiUrl = process.env.CUSTOM_RERANKER_URL || apiUrl || 'https://api.cohere.com/v2/rerank';
        this.model = process.env.CUSTOM_RERANKER_MODEL || model || 'rerank-v3.5';
    }
    async rerank(query, documents, topK = 5) {
        // If circuit is open, skip immediately
        if (CohereReranker._circuitOpen && Date.now() < CohereReranker._circuitResetAt) {
            this.logger.debug('Reranker circuit open, skipping.');
            return this.getDefaultRanking(documents, topK);
        }
        // SINGLE_REQUEST mode: batch all calls into 1 API request
        if (process.env.CUSTOM_RERANKER_SINGLE_REQUEST === 'true') {
            return this._batchedRerank(query, documents, topK);
        }
        // Normal mode: serial queue
        const result = await (CohereReranker._queue = CohereReranker._queue.then(() => this._doRerank(query, documents, topK)).catch(() => this.getDefaultRanking(documents, topK)));
        return result;
    }
    _batchedRerank(query, documents, topK) {
        return new Promise((resolve) => {
            CohereReranker._batch.push({ query, documents, topK, resolve, reranker: this });
            if (CohereReranker._batchTimer) clearTimeout(CohereReranker._batchTimer);
            CohereReranker._batchTimer = setTimeout(() => this._flushBatch(), CohereReranker.BATCH_WAIT_MS);
        });
    }
    async _flushBatch() {
        const batch = CohereReranker._batch;
        CohereReranker._batch = [];
        CohereReranker._batchTimer = null;
        if (batch.length === 0) return;
        const query = batch[0].query;
        const allDocs = [];
        const offsets = [];
        for (const entry of batch) {
            offsets.push({ start: allDocs.length, end: allDocs.length + entry.documents.length, topK: entry.topK });
            for (const doc of entry.documents) {
                allDocs.push(doc);
            }
        }
        this.logger.debug(`Batch rerank: ${batch.length} callers, ${allDocs.length} total docs, 1 API call`);
        if (this.apiKey == null || this.apiKey === '') {
            this.logger.warn('API key not set. Returning default ranking for all.');
            for (let i = 0; i < batch.length; i++) {
                batch[i].resolve(this.getDefaultRanking(batch[i].documents, batch[i].topK));
            }
            return;
        }
        // Rate limit check
        const now = Date.now();
        CohereReranker._callTimestamps = CohereReranker._callTimestamps.filter(t => now - t < 60000);
        if (CohereReranker._callTimestamps.length >= CohereReranker.MAX_RPM) {
            this.logger.warn(`Reranker self-throttle in batch mode (${CohereReranker._callTimestamps.length}/${CohereReranker.MAX_RPM} RPM), returning defaults.`);
            for (let i = 0; i < batch.length; i++) {
                batch[i].resolve(this.getDefaultRanking(batch[i].documents, batch[i].topK));
            }
            return;
        }
        CohereReranker._callTimestamps.push(now);
        try {
            const requestData = {
                model: this.model,
                query: query,
                top_n: allDocs.length,
                documents: allDocs,
            };
            const start = Date.now();
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(requestData),
                signal: AbortSignal.timeout(CohereReranker.BATCH_TIMEOUT_MS),
            });
            const ms = Date.now() - start;
            if (!response.ok) {
                const status = response.status;
                const errorText = await response.text().catch(() => '');
                if (status === 429) {
                    CohereReranker._circuitOpen = true;
                    CohereReranker._circuitResetAt = Date.now() + CohereReranker.CIRCUIT_COOLDOWN_MS;
                    this.logger.warn(`Batch reranker 429 after ${ms}ms. Circuit open ${CohereReranker.CIRCUIT_COOLDOWN_MS / 1000}s.`);
                } else {
                    this.logger.error(`Batch reranker HTTP ${status} after ${ms}ms: ${errorText.substring(0, 200)}`);
                }
                for (let i = 0; i < batch.length; i++) {
                    batch[i].resolve(this.getDefaultRanking(batch[i].documents, batch[i].topK));
                }
                return;
            }
            const data = await response.json();
            this.logger.debug(`Batch rerank OK in ${ms}ms, id: ${data?.id}, results: ${data?.results?.length}`);
            if (data && data.results && data.results.length) {
                for (let i = 0; i < batch.length; i++) {
                    const { start: docStart, end: docEnd, topK: callerTopK } = offsets[i];
                    const callerResults = data.results
                        .filter(r => r.index >= docStart && r.index < docEnd)
                        .sort((a, b) => b.relevance_score - a.relevance_score)
                        .slice(0, callerTopK)
                        .map(r => ({ text: allDocs[r.index], score: r.relevance_score }));
                    batch[i].resolve(callerResults.length > 0 ? callerResults : this.getDefaultRanking(batch[i].documents, callerTopK));
                }
            } else {
                this.logger.warn('Batch rerank: unexpected response format.');
                for (let i = 0; i < batch.length; i++) {
                    batch[i].resolve(this.getDefaultRanking(batch[i].documents, batch[i].topK));
                }
            }
        } catch (error) {
            if (error?.name === 'TimeoutError') {
                CohereReranker._circuitOpen = true;
                CohereReranker._circuitResetAt = Date.now() + CohereReranker.TIMEOUT_COOLDOWN_MS;
                this.logger.warn(`Batch reranker timeout (${CohereReranker.BATCH_TIMEOUT_MS}ms). Circuit open ${CohereReranker.TIMEOUT_COOLDOWN_MS / 1000}s.`);
            } else {
                this.logger.error(`Batch reranker [${error?.name}]: ${error?.message}`);
            }
            for (let i = 0; i < batch.length; i++) {
                batch[i].resolve(this.getDefaultRanking(batch[i].documents, batch[i].topK));
            }
        }
    }
    async _doRerank(query, documents, topK) {
        if (CohereReranker._circuitOpen && Date.now() < CohereReranker._circuitResetAt) {
            this.logger.debug('Reranker circuit open (queued), skipping.');
            return this.getDefaultRanking(documents, topK);
        }
        CohereReranker._circuitOpen = false;
        const now = Date.now();
        CohereReranker._callTimestamps = CohereReranker._callTimestamps.filter(t => now - t < 60000);
        if (CohereReranker._callTimestamps.length >= CohereReranker.MAX_RPM) {
            this.logger.warn(`Reranker self-throttle: ${CohereReranker._callTimestamps.length}/${CohereReranker.MAX_RPM} RPM, skipping.`);
            return this.getDefaultRanking(documents, topK);
        }
        CohereReranker._callTimestamps.push(now);
        this.logger.debug(`Reranking ${documents.length} chunks (${CohereReranker._callTimestamps.length}/${CohereReranker.MAX_RPM} in window)`);
        try {
            if (this.apiKey == null || this.apiKey === '') {
                this.logger.warn('API key not set. Using default ranking.');
                return this.getDefaultRanking(documents, topK);
            }
            const requestData = {
                model: this.model,
                query: query,
                top_n: topK,
                documents: documents,
            };
            const start = Date.now();
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(requestData),
                signal: AbortSignal.timeout(CohereReranker.TIMEOUT_MS),
            });
            const ms = Date.now() - start;
            if (!response.ok) {
                const status = response.status;
                const errorText = await response.text().catch(() => '');
                if (status === 429) {
                    CohereReranker._circuitOpen = true;
                    CohereReranker._circuitResetAt = Date.now() + CohereReranker.CIRCUIT_COOLDOWN_MS;
                    this.logger.warn(`Reranker 429 after ${ms}ms. Circuit open ${CohereReranker.CIRCUIT_COOLDOWN_MS / 1000}s.`);
                } else {
                    this.logger.error(`Reranker HTTP ${status} after ${ms}ms: ${errorText.substring(0, 200)}`);
                }
                return this.getDefaultRanking(documents, topK);
            }
            const data = await response.json();
            this.logger.debug(`Rerank OK in ${ms}ms, id: ${data?.id}`);
            if (data && data.results && data.results.length) {
                return data.results.map((result) => ({
                    text: documents[result.index],
                    score: result.relevance_score,
                }));
            }
            else {
                this.logger.warn('Unexpected response format. Using default ranking.');
                return this.getDefaultRanking(documents, topK);
            }
        }
        catch (error) {
            if (error?.name === 'TimeoutError') {
                CohereReranker._circuitOpen = true;
                CohereReranker._circuitResetAt = Date.now() + CohereReranker.TIMEOUT_COOLDOWN_MS;
                this.logger.warn(`Reranker timeout (${CohereReranker.TIMEOUT_MS}ms). Circuit open ${CohereReranker.TIMEOUT_COOLDOWN_MS / 1000}s.`);
            } else {
                this.logger.error(`Reranker [${error?.name}]: ${error?.message}`);
            }
            return this.getDefaultRanking(documents, topK);
        }
    }
}
class InfinityReranker extends BaseReranker {
    constructor(logger) {
        super(logger);
        // No API key needed for the placeholder implementation
    }
    async rerank(query, documents, topK = 5) {
        this.logger.debug(`Reranking ${documents.length} chunks with Infinity (placeholder)`);
        // This would be replaced with actual Infinity reranker implementation
        return this.getDefaultRanking(documents, topK);
    }
}
/**
 * Creates the appropriate reranker based on type and configuration
 */
const createReranker = (config) => {
    const { rerankerType, jinaApiKey, jinaApiUrl, cohereApiKey, logger } = config;
    // Create a default logger if none is provided
    const defaultLogger = logger || utils.createDefaultLogger();
    switch (rerankerType.toLowerCase()) {
        case 'jina':
            return new JinaReranker({ apiKey: jinaApiKey, apiUrl: jinaApiUrl, logger: defaultLogger });
        case 'cohere':
            return new CohereReranker({
                apiKey: cohereApiKey,
                logger: defaultLogger,
            });
        case 'infinity':
            return new InfinityReranker(defaultLogger);
        case 'none':
            defaultLogger.debug('Skipping reranking as reranker is set to "none"');
            return undefined;
        default:
            defaultLogger.warn(`Unknown reranker type: ${rerankerType}. Defaulting to InfinityReranker.`);
            return new JinaReranker({ apiKey: jinaApiKey, apiUrl: jinaApiUrl, logger: defaultLogger });
    }
};

exports.BaseReranker = BaseReranker;
exports.CohereReranker = CohereReranker;
exports.InfinityReranker = InfinityReranker;
exports.JinaReranker = JinaReranker;
exports.createReranker = createReranker;
