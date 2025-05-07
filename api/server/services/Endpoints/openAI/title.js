const { CacheKeys } = require('librechat-data-provider');
const getLogStores = require('~/cache/getLogStores');
const { isEnabled } = require('~/server/utils');
const { saveConvo } = require('~/models');
const { intelequiaCountTokens } = require('~/utils');

const addTitle = async (req, { text, response, client }) => {
  const { TITLE_CONVO = 'true' } = process.env ?? {};
  if (!isEnabled(TITLE_CONVO)) {
    return;
  }

  if (client.options.titleConvo === false) {
    return;
  }

  const titleCache = getLogStores(CacheKeys.GEN_TITLE);
  const key = `${req.user.id}-${response.conversationId}`;

  const title = await client.titleConvo({
    text,
    responseText: response?.text ?? '',
    conversationId: response.conversationId,
  });


  /**
   * Get telemetry data for the title generation
   * @Organization Intelequia
   * @Author Enrique M. Pedroza Castillo
   */
  const model = req.body.model
  const responseText =  response?.text ?? ''
  const { completion, prompt } = intelequiaCountTokens([text, responseText, title], model);
  
  /**
   * Custom event to track when a user is not found
   * @Organization Intelequia
   * @Author Enrique M. Pedroza Castillo
   */
  global.appInsights.trackEvent({
    name: 'Title Generation',
    properties: {
      userId: req.user.id,
      userEmail: req.user.email,
      charactersLength: title.length,
      messageTokens: completion + prompt,
      promptTokens: prompt,
      completionTokens: completion,
      model: model,
    },
  });

  await titleCache.set(key, title, 120000);
  await saveConvo(
    req,
    {
      conversationId: response.conversationId,
      title,
    },
    { context: 'api/server/services/Endpoints/openAI/addTitle.js' },
  );
};

module.exports = addTitle;
