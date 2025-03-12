const Balance = require('~/models/Balance');

async function balanceController(req, res) {

  const isBalanceEnabled = process.env.CHECK_BALANCE;

  if (!isBalanceEnabled) {
    return res.status(200).send('' + balance);
  }      

  
  const balanceRecord = await Balance.findOne({ user: req.user.id }, 'tokenCredits').lean();
  
  const balance = balanceRecord?.tokenCredits ?? 0;
  
  console.info("Balance del usuario:", balance);
  
  return res.status(200).send('' + balance);

}

module.exports = balanceController;
