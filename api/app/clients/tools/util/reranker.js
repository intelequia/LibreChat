const { logger } = require('@librechat/data-schemas');
const { RerankerTypes } = require('librechat-data-provider');
const customReranker = require('./rerankers/CustomReranker');

async function applyReranking(query, documents, rerankerType, options) {
  logger.info(`[applyReranking] Reranking with ${rerankerType}`);
  logger.info('[applyReranking] documents:', documents);
  if (!rerankerType) {
    return documents;
  }

  switch (rerankerType) {
    case RerankerTypes.CUSTOMLOCAL:
      return customReranker(query, documents);
    // case RerankerTypes.COHERE:
    //   // return cohereReranker(query, documents, options);
    // case RerankerTypes.JINA:
    //   // return jinaReranker(query, documents, options);
    default:
      return documents;
  }
}

module.exports = { applyReranking };