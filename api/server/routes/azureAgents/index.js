const express = require('express');
const router = express.Router();
const { uaParser, checkBan, requireJwtAuth } = require('~/server/middleware');

const v2 = require('./v2');
const chatV2 = require('./chatV2');

router.use(requireJwtAuth);
router.use(checkBan);
router.use(uaParser);
router.use('/', v2);
router.use('/chat', chatV2);

module.exports = router;
