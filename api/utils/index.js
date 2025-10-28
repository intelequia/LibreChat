const deriveBaseURL = require('./deriveBaseURL');
const extractBaseURL = require('./extractBaseURL');
const findMessageContent = require('./findMessageContent');
const intelequia = require('./intelequia');

module.exports = {
  deriveBaseURL,
  extractBaseURL,
  findMessageContent,
  ...intelequia,
};
