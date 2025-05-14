const { CacheKeys } = require('librechat-data-provider');
const { saveConvo } = require('~/models/Conversation');
const getLogStores = require('~/cache/getLogStores');
const { isEnabled } = require('~/server/utils');


const addTitle = async (req, { text, responseText, conversationId, azureAgentClient }) => {
  const { TITLE_CONVO = 'true' } = process.env ?? {};
  if (!isEnabled(TITLE_CONVO)) {
    return;
  }

  if (azureAgentClient.options.titleConvo === false) {
    return;
  }

  const titleCache = getLogStores(CacheKeys.GEN_TITLE);
  const key = `${req.user.id}-${conversationId}`;
  const model = azureAgentClient.res.req.body.model;
  const title = await azureAgentClient.titleConvo({ text, conversationId, responseText, model, req });
  await titleCache.set(key, title, 120000);

  await saveConvo(
    req,
    {
      conversationId,
      title,
    },
    { context: 'api/server/services/Endpoints/assistants/addTitle.js' },
  );
};

module.exports = addTitle;
