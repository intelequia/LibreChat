const mongoose = require('mongoose');
const { createMethods } = require('@librechat/data-schemas');
const { matchModelName, findMatchingPattern } = require('@librechat/api');
const getLogStores = require('~/cache/getLogStores');
const {
  trackQueryEvent,
  trackStartEvent,
  createGlobalTrackingSpendTokens,
  createGlobalTrackingSpendStructuredTokens,
} = require('~/utils/intelequia/appInsights');

const methods = createMethods(mongoose, {
  matchModelName,
  findMatchingPattern,
  getCache: getLogStores,
});

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
  seedDatabase,
};
