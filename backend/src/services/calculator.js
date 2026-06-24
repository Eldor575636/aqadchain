const { addMonths, addWeeks, format } = require('date-fns');

/**
 * Calculate full payment details for a Murabaha/Musawama deal.
 *
 * Formula: markup is added to principal first, then standard amortization
 * is applied to (financed_amount + markup) at the disclosed APR.
 * This keeps the Islamic structure (cost + markup agreed upfront) while
 * computing a standard level-payment schedule.
 */
function calculate({ car_price, down_payment, markup_percentage, apr, term_months, payment_frequency, payment_start_date }) {
  const price = parseFloat(car_price);
  const down = parseFloat(down_payment);
  const markupPct = parseFloat(markup_percentage);
  const annualRate = parseFloat(apr) / 100;
  const months = parseInt(term_months);

  if (markupPct > 15) throw new Error('Markup percentage cannot exceed 15%');
  if (down > price * 0.25) throw new Error('Down payment cannot exceed 25% of car price');

  const financed = price - down;
  const markupAmount = financed * (markupPct / 100);
  const totalPrincipal = financed + markupAmount;

  let monthlyPayment;
  if (annualRate === 0) {
    monthlyPayment = totalPrincipal / months;
  } else {
    const monthlyRate = annualRate / 12;
    monthlyPayment = (totalPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                     (Math.pow(1 + monthlyRate, months) - 1);
  }

  const weeklyPayment = monthlyPayment / (52 / 12); // approximate
  const totalPayable = down + monthlyPayment * months;

  // Build full payment schedule
  const startDate = payment_start_date ? new Date(payment_start_date) : addMonths(new Date(), 1);
  const schedule = [];

  if (payment_frequency === 'MONTHLY') {
    for (let i = 1; i <= months; i++) {
      schedule.push({
        payment_number: i,
        due_date: format(addMonths(startDate, i - 1), 'yyyy-MM-dd'),
        amount: round2(monthlyPayment),
      });
    }
  } else {
    // Weekly: term_months * 4 weeks approx
    const weeks = Math.round(months * 52 / 12);
    for (let i = 1; i <= weeks; i++) {
      schedule.push({
        payment_number: i,
        due_date: format(addWeeks(startDate, i - 1), 'yyyy-MM-dd'),
        amount: round2(weeklyPayment),
      });
    }
  }

  return {
    financed_amount: round2(financed),
    markup_amount: round2(markupAmount),
    monthly_payment: round2(monthlyPayment),
    weekly_payment: round2(weeklyPayment),
    total_payable: round2(totalPayable),
    total_principal: round2(totalPrincipal),
    schedule,
  };
}

/**
 * Calculate Ijarah rental payments.
 * Monthly rental = (asset_value - security_deposit - residual_value) / term_months
 * For OPERATING leases residual_value = 0 (asset returned at end).
 * For IMIT leases residual_value = agreed buyout price.
 */
function calculateIjarah({ car_price, security_deposit = 0, residual_value = 0, term_months, payment_frequency, payment_start_date }) {
  const assetValue = parseFloat(car_price);
  const deposit = parseFloat(security_deposit) || 0;
  const residual = parseFloat(residual_value) || 0;
  const months = parseInt(term_months);

  if (deposit > assetValue * 0.3) throw new Error('Security deposit cannot exceed 30% of asset value');
  if (residual >= assetValue) throw new Error('Residual value must be less than asset value');

  const rentableBase = assetValue - deposit - residual;
  const monthlyRental = rentableBase / months;
  const weeklyRental = monthlyRental / (52 / 12);
  const totalRentals = monthlyRental * months;
  const totalPayable = deposit + totalRentals + residual;

  const startDate = payment_start_date ? new Date(payment_start_date) : addMonths(new Date(), 1);
  const schedule = [];

  if (payment_frequency === 'WEEKLY') {
    const weeks = Math.round(months * 52 / 12);
    for (let i = 1; i <= weeks; i++) {
      schedule.push({ payment_number: i, due_date: format(addWeeks(startDate, i - 1), 'yyyy-MM-dd'), amount: round2(weeklyRental) });
    }
  } else {
    for (let i = 1; i <= months; i++) {
      schedule.push({ payment_number: i, due_date: format(addMonths(startDate, i - 1), 'yyyy-MM-dd'), amount: round2(monthlyRental) });
    }
  }

  return {
    asset_value: round2(assetValue),
    security_deposit: round2(deposit),
    residual_value: round2(residual),
    rentable_base: round2(rentableBase),
    monthly_payment: round2(monthlyRental),
    weekly_payment: round2(weeklyRental),
    total_rentals: round2(totalRentals),
    total_payable: round2(totalPayable),
    schedule,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { calculate, calculateIjarah };
