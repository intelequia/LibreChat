const { Balance } = require('~/db/models');

async function balanceController(req, res) {

  // Intelequia Code
  // const isBalanceEnabled = process.env.CHECK_BALANCE;

  // if (!isBalanceEnabled) {
  //   return res.status(200).send('' + balance);
  // }      

  
  // const balanceRecord = await Balance.findOne({ user: req.user.id }, 'tokenCredits').lean();
  
  // const balance = balanceRecord?.tokenCredits ?? 0;
  
  // console.info("Balance del usuario:", balance);
  
  // return res.status(200).send('' + balance);

  const balanceData = await Balance.findOne(
    { user: req.user.id },
    '-_id tokenCredits autoRefillEnabled refillIntervalValue refillIntervalUnit lastRefill refillAmount',
  ).lean();

  if (!balanceData) {
    return res.status(404).json({ error: 'Balance not found' });
  }

  // If auto-refill is not enabled, remove auto-refill related fields from the response
  if (!balanceData.autoRefillEnabled) {
    delete balanceData.refillIntervalValue;
    delete balanceData.refillIntervalUnit;
    delete balanceData.lastRefill;
    delete balanceData.refillAmount;
  }

  res.status(200).json(balanceData);
}

module.exports = balanceController;
