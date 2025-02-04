const Balance = require('~/models/Balance');

async function balanceController(req, res) {
  const { tokenCredits: balance = '' } =
    (await Balance.findOne({ user: req.user.id }, 'tokenCredits').lean()) ?? {};
  
  const isBalanceEnabled = process.env.CHECK_BALANCE

  balance = isBalanceEnabled == 'true' ? balance : 0;
  console.log("balance")
  res.status(200).send('' + balance);
}

module.exports = balanceController;
