const { logger } = require('@librechat/data-schemas');

async function customReranker(query, documents) {
  console.log('documents in custom reranker: ', documents);
  const url = process.env.CUSTOM_RERANKER_URL;
  if (!url) {
    throw new Error('Custom reranker URL not set');
  }

  if (!Array.isArray(documents)) {
    logger.error('[customReranker] documents is not an array', documents);
    return [];
  }

  if (documents.length === 0) {
    return [];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      documents: documents.map(doc => doc.pageContent),
    }),
  });

  if (!response.ok) {
    logger.error(`Custom reranker API error: ${response.statusText}`);
    throw new Error(`Custom reranker API error: ${response.statusText}`);
  }

  const rerankedDocs = await response.json();
  return rerankedDocs.map((doc, index) => ({
    ...documents[index],
    pageContent: doc,
  }));
}

module.exports = customReranker;