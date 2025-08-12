const express = require('express');
const router = express.Router();
const { intelequiaConfigLoader } = require('~/utils/intelequia');

async function initializeConfigController(req, res) {
  const api_key = process.env.REMOTE_CONFIG_LOCAL_API_KEY || '';
  if (api_key && api_key !== "") {
    if (req.headers['x-api-key'] !== api_key) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
    
  const result = await intelequiaConfigLoader(req);
  if (!result.loaded) {
    return res.status(500).json({ error: 'Failed to load configuration' });
  }
  res.status(200).json({ message: 'Configuration loaded successfully' });
}

router.get('/refresh', initializeConfigController);
module.exports = router;

