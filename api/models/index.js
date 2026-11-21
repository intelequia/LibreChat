const mongoose = require('mongoose');
const {
  createMethods,
  createToolFavoriteMethods,
  createPostgresFavoriteBackend,
} = require('@librechat/data-schemas');
const {
  matchModelName,
  findMatchingPattern,
  isDeploymentSkillId,
  createMessageBudgetReader,
  createFavoriteRuntime,
  getPersistenceConfig,
  createChannelStorageConfigReader,
} = require('@librechat/api');
const getLogStores = require('~/cache/getLogStores');
const {
  trackQueryEvent,
  trackStartEvent,
  configureAppInsights,
  createGlobalTrackingSpendTokens,
  createGlobalTrackingSpendStructuredTokens,
} = require('~/utils/intelequia/appInsights');

const messageBudget = createMessageBudgetReader();
const channelStorageConfig = createChannelStorageConfigReader();

const favorites = createFavoriteRuntime(
  createToolFavoriteMethods(mongoose),
  process.env,
  createPostgresFavoriteBackend,
);

const methods = createMethods(mongoose, {
  toolFavorites: favorites.methods,
  matchModelName,
  findMatchingPattern,
  isExternalSkillId: isDeploymentSkillId,
  getCache: getLogStores,
  getChannelStorageConfig: channelStorageConfig.getConfig,
  getMCPAppMessageBudget: messageBudget.getBudget,
});

configureAppInsights({ pricing: methods, findUser: methods.findUser });

const seedDatabase = async () => {
  await methods.initializeRoles();
  await methods.seedDefaultRoles();
  await methods.ensureDefaultCategories();
  await methods.seedSystemGrants();
};

module.exports = {
  ...methods,
  spendTokens: createGlobalTrackingSpendTokens(methods.spendTokens),
  spendStructuredTokens: createGlobalTrackingSpendStructuredTokens(methods.spendStructuredTokens),
  trackQueryEvent,
  trackStartEvent,
  initializeFavorites: (config) => favorites.initialize(getPersistenceConfig(config)),
  closeFavorites: favorites.close,
  initializeMessageBudget: messageBudget.initialize,
  initializeChannelStorageConfig: channelStorageConfig.initialize,
  seedDatabase,
};
