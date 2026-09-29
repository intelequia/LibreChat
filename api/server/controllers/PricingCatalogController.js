const { buildPricingCatalog } = require('@librechat/api');

function pricingCatalogController(_req, res) {
  res.set('Cache-Control', 'public, max-age=1800');
  res.json(buildPricingCatalog());
}

module.exports = pricingCatalogController;
