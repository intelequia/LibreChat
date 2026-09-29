const express = require('express');
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const configMiddleware = require('~/server/middleware/config/app');
const endpointController = require('~/server/controllers/EndpointController');
const tokenConfigController = require('~/server/controllers/TokenConfigController');
const pricingCatalogController = require('~/server/controllers/PricingCatalogController');

const router = express.Router();
/** Auth required for role/tenant-scoped endpoint config resolution. */
router.get('/', requireJwtAuth, configMiddleware, endpointController);
router.get('/token-config', requireJwtAuth, configMiddleware, tokenConfigController);
router.get('/pricing-catalog', pricingCatalogController);

module.exports = router;
