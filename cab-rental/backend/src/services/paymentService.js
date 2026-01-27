exports.calculateCommission = (amount, percent) =>
  (amount * percent) / 100;

exports.splitPayment = ({
  totalAmount,
  commissionPercent
}) => {
  const commission =
    (totalAmount * commissionPercent) / 100;

  return {
    driverAmount: totalAmount - commission,
    platformCommission: commission
  };
};

exports.validatePaymentAmount = (amount) => {
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Invalid payment amount");
  }
  return true;
};
