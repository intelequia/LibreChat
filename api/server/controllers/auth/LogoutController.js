const cookies = require('cookie');
const { logoutUser } = require('~/server/services/AuthService');
const { logger } = require('~/config');

const logoutController = async (req, res) => {
  const refreshToken = req.headers.cookie ? cookies.parse(req.headers.cookie).refreshToken : null;
  try {
    /**
     * Custom event to track when a user logs out
     * @Organization Intelequia
     * @Author Enrique M. Pedroza Castillo
     */
    global.appInsights.trackEvent({ 
      name: 'Logout', 
      properties: { 
        userEmail: req.user.email 
      } 
    });

    const logout = await logoutUser(req, refreshToken);
    const { status, message } = logout;
    res.clearCookie('refreshToken');
    return res.status(status).send({ message });
  } catch (err) {
    logger.error('[logoutController]', err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  logoutController,
};
