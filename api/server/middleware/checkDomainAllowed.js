const { logger } = require('@librechat/data-schemas');
const {
  getAppConfigOptionsFromUser,
  isEmailDomainAllowed,
  redirectOpenIDResult,
} = require('@librechat/api');
const { getAppConfig } = require('~/server/services/Config');

/**
 * Checks the domain's social login is allowed
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware function.
 *
 * @returns {Promise<void>} - Calls next middleware if the domain's email is allowed, otherwise redirects to login
 */
const checkDomainAllowed = async (req, res, next) => {
  try {
    const email = req?.user?.email;
    const appConfig = await getAppConfig(getAppConfigOptionsFromUser(req?.user));

    if (email && !isEmailDomainAllowed(email, appConfig?.registration?.allowedDomains)) {
      logger.error(`[Social Login] [Social Login not allowed] [Email: ${email}]`);
      redirectOpenIDResult(res, {
        clientDomain: process.env.DOMAIN_CLIENT,
        redirectUri: '/login',
        error: 'auth_failed',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('[checkDomainAllowed] Error checking domain:', error);
    redirectOpenIDResult(res, {
      clientDomain: process.env.DOMAIN_CLIENT,
      redirectUri: '/login',
      error: 'auth_failed',
    });
  }
};

module.exports = checkDomainAllowed;
