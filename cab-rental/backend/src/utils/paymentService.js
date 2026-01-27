exports.calculateCommission = (amount, percent) =>
  (amount * percent) / 100;

exports.splitPayment = ({
  totalAmount,
  commissionPercent
}) => {
  const commission =
    (totalAmount * commissionPercent) / 100;

  return {
    platformAmount: commission,
    driverAmount: totalAmount - commission
  };
};
