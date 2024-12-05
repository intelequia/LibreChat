const Balance = require('~/models/Balance');

async function balanceController(req, res) {
  const { tokenCredits: balance = '' } =
    (await Balance.findOne({ user: req.user.id }, 'tokenCredits').lean()) ?? {};
  
  balance = process.env.CHECK_BALANCE === 'true' ? balance : 0;

  res.status(200).send('' + balance);
}

module.exports = balanceController;
