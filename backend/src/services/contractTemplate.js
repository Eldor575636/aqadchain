const { format } = require('date-fns');

function fmt(val) {
  if (val == null) return '_______________';
  return String(val);
}

function money(val) {
  if (val == null) return '$___________';
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(val) {
  if (!val) return '_______________';
  try { return format(new Date(val), 'MMMM d, yyyy'); } catch { return String(val); }
}

function buildScheduleTable(contract) {
  if (!contract.payment_start_date || !contract.term_months) return '<p>Payment schedule to be determined.</p>';

  const { calculate, calculateIjarah } = require('./calculator');
  try {
    const result = contract.contract_type === 'IJARAH'
      ? calculateIjarah({
          car_price: contract.car_price,
          security_deposit: contract.security_deposit,
          residual_value: contract.residual_value,
          term_months: contract.term_months,
          payment_frequency: contract.payment_frequency || 'MONTHLY',
          payment_start_date: contract.payment_start_date,
        })
      : calculate({
          car_price: contract.car_price,
          down_payment: contract.down_payment,
          markup_percentage: contract.markup_percentage,
          apr: contract.apr,
          term_months: contract.term_months,
          payment_frequency: contract.payment_frequency || 'MONTHLY',
          payment_start_date: contract.payment_start_date,
        });

    const rows = result.schedule.slice(0, 60).map((p) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #E5E7EB;text-align:center">${p.payment_number}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #E5E7EB;text-align:center">${p.due_date}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #E5E7EB;text-align:right">$${p.amount.toFixed(2)}</td>
      </tr>`).join('');

    return `
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px">
        <thead>
          <tr style="background:#0D6E63;color:#fff">
            <th style="padding:8px 10px">#</th>
            <th style="padding:8px 10px">Due Date</th>
            <th style="padding:8px 10px;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch {
    return '<p>Payment schedule unavailable — please verify deal terms.</p>';
  }
}

/**
 * Render the full contract as HTML.
 * @param {object} contract - Prisma contract record
 * @param {boolean} preview - If true, adds PREVIEW watermark
 */
function renderContractHtml(contract, preview = true) {
  const isIjarah = contract.contract_type === 'IJARAH';
  const isMurabaha = contract.contract_type === 'MURABAHA';
  const today = fmtDate(new Date());

  if (isIjarah) return renderIjarahHtml(contract, preview);

  const pricingSection = isMurabaha ? `
    <div class="section">
      <h3>4. PURCHASE PRICE AND MARKUP DISCLOSURE (MURABAHA)</h3>
      <p>In accordance with Murabaha principles, the Seller discloses the following:</p>
      <table class="terms-table">
        <tr><td>Seller's Purchase Price (Cost):</td><td><strong>${money(contract.car_price)}</strong></td></tr>
        <tr><td>Down Payment:</td><td><strong>${money(contract.down_payment)}</strong></td></tr>
        <tr><td>Amount to be Financed:</td><td><strong>${money(contract.financed_amount)}</strong></td></tr>
        <tr><td>Agreed Markup Percentage:</td><td><strong>${fmt(contract.markup_percentage)}%</strong></td></tr>
        <tr><td>Markup Amount:</td><td><strong>${money(contract.markup_amount)}</strong></td></tr>
        <tr><td>Total Amount Payable:</td><td><strong>${money(contract.total_payable)}</strong></td></tr>
        <tr><td>Annual Percentage Rate (APR):</td><td><strong>${fmt(contract.apr)}%</strong></td></tr>
        <tr><td>Term:</td><td><strong>${fmt(contract.term_months)} months</strong></td></tr>
        <tr><td>Payment Frequency:</td><td><strong>${fmt(contract.payment_frequency)}</strong></td></tr>
        <tr><td>Regular Payment Amount:</td><td><strong>${money(contract.monthly_payment)}</strong></td></tr>
      </table>
      <p style="font-size:12px;color:#6B7280;margin-top:8px">The Seller hereby discloses to the Buyer the actual cost of the Vehicle and the agreed-upon markup, as required under Murabaha financing principles recognized by AAOIFI Shari'ah Standards.</p>
    </div>` : `
    <div class="section">
      <h3>4. PURCHASE PRICE (MUSAWAMA)</h3>
      <p>This contract is structured as a Musawama agreement. The parties have agreed upon the following selling price without the requirement for cost disclosure:</p>
      <table class="terms-table">
        <tr><td>Agreed Selling Price:</td><td><strong>${money(contract.car_price)}</strong></td></tr>
        <tr><td>Down Payment:</td><td><strong>${money(contract.down_payment)}</strong></td></tr>
        <tr><td>Amount to be Financed:</td><td><strong>${money(contract.financed_amount)}</strong></td></tr>
        <tr><td>Markup Amount:</td><td><strong>${money(contract.markup_amount)}</strong></td></tr>
        <tr><td>Total Amount Payable:</td><td><strong>${money(contract.total_payable)}</strong></td></tr>
        <tr><td>Annual Percentage Rate (APR):</td><td><strong>${fmt(contract.apr)}%</strong></td></tr>
        <tr><td>Term:</td><td><strong>${fmt(contract.term_months)} months</strong></td></tr>
        <tr><td>Payment Frequency:</td><td><strong>${fmt(contract.payment_frequency)}</strong></td></tr>
        <tr><td>Regular Payment Amount:</td><td><strong>${money(contract.monthly_payment)}</strong></td></tr>
      </table>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Vehicle Financing Agreement — ${contract.contract_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #1F2937; background: #fff; margin: 0; padding: 0; }
    .contract-wrapper { max-width: 850px; margin: 0 auto; padding: 48px 48px 80px; position: relative; }
    h1.title { text-align: center; font-size: 22px; font-weight: 700; margin-bottom: 4px; color: #111827; }
    .subtitle { text-align: center; font-size: 13px; color: #6B7280; margin-bottom: 32px; }
    .contract-meta { display: flex; justify-content: space-between; padding: 12px 16px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; margin-bottom: 32px; font-size: 13px; }
    .shariah-box { background: #ECFDF5; border-left: 4px solid #0D6E63; padding: 12px 16px; margin-bottom: 28px; border-radius: 4px; font-size: 13px; color: #065F46; }
    .section { margin-bottom: 28px; }
    .section h3 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0D6E63; border-bottom: 2px solid #0D6E63; padding-bottom: 4px; margin-bottom: 14px; }
    .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .party-card { border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px; }
    .party-card h4 { margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #0D6E63; }
    .party-card p { margin: 0; font-size: 13px; line-height: 1.6; }
    .terms-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .terms-table td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
    .terms-table td:first-child { color: #6B7280; width: 55%; }
    .clause { font-size: 13px; margin-bottom: 10px; }
    .clause strong { color: #111827; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 20px; }
    .sig-block { border-top: 2px solid #374151; padding-top: 10px; }
    .sig-block .label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
    .sig-block .name { font-weight: 600; font-size: 14px; }
    .sig-placeholder { height: 48px; margin: 8px 0; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 96px; font-weight: 900; color: rgba(0,0,0,0.06); pointer-events: none; z-index: 9999; white-space: nowrap; letter-spacing: 12px; }
    @media print {
      .watermark { position: fixed; }
      .contract-wrapper { padding: 20px; }
      body { font-size: 12px; }
    }
  </style>
</head>
<body>
  ${preview ? '<div class="watermark">PREVIEW</div>' : ''}
  <div class="contract-wrapper">

    <h1 class="title">VEHICLE FINANCING AGREEMENT</h1>
    <p class="subtitle">${isMurabaha ? 'Murabaha' : 'Musawama'} Structure — Shariah-Compliant Deferred Payment Sale</p>

    <div class="contract-meta">
      <span><strong>Contract #:</strong> ${contract.contract_number}</span>
      <span><strong>Date:</strong> ${today}</span>
      <span><strong>Type:</strong> ${contract.contract_type}</span>
    </div>

    <div class="shariah-box">
      <strong>Shariah Compliance Declaration:</strong> This contract is structured in accordance with Islamic finance principles (${isMurabaha ? 'Murabaha' : 'Musawama'}) as recognized by the Accounting and Auditing Organization for Islamic Financial Institutions (AAOIFI) standards. The transaction represents a genuine sale of an asset with deferred payment. No interest (Riba) is charged or received.
    </div>

    <div class="section">
      <h3>1. PARTIES</h3>
      <div class="parties-grid">
        <div class="party-card">
          <h4>SELLER (Lienholder)</h4>
          <p><strong>${fmt(contract.seller_name)}</strong><br/>
          Email: ${fmt(contract.seller_email)}<br/>
          Phone: ${fmt(contract.seller_phone)}<br/>
          Address: ${fmt(contract.seller_address)}</p>
        </div>
        <div class="party-card">
          <h4>BUYER</h4>
          <p><strong>${fmt(contract.buyer_name)}</strong><br/>
          Email: ${fmt(contract.buyer_email)}<br/>
          Phone: ${fmt(contract.buyer_phone)}<br/>
          Address: ${fmt(contract.buyer_address)}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>2. VEHICLE DESCRIPTION</h3>
      <table class="terms-table">
        <tr><td>VIN:</td><td><strong>${fmt(contract.vehicle_vin)}</strong></td></tr>
        <tr><td>Year / Make / Model:</td><td><strong>${fmt(contract.vehicle_year)} ${fmt(contract.vehicle_make)} ${fmt(contract.vehicle_model)}</strong></td></tr>
        <tr><td>Trim / Series:</td><td><strong>${fmt(contract.vehicle_trim)}</strong></td></tr>
        <tr><td>Mileage at Sale:</td><td><strong>${contract.vehicle_mileage != null ? Number(contract.vehicle_mileage).toLocaleString() + ' miles' : '_______________'}</strong></td></tr>
        <tr><td>Color:</td><td><strong>${fmt(contract.vehicle_color)}</strong></td></tr>
        <tr><td>Title Status:</td><td><strong>${fmt(contract.title_status)}</strong></td></tr>
      </table>
      <p class="clause" style="margin-top:12px">The Seller warrants that the Vehicle is sold in its present, as-is condition unless otherwise stated herein. The Seller confirms ownership of the Vehicle and the right to sell it, and that the Vehicle is free of undisclosed liens.</p>
    </div>

    <div class="section">
      <h3>3. CONDITION DECLARATION</h3>
      <p class="clause">The Buyer acknowledges having inspected the Vehicle (or having had the opportunity to inspect it) and accepts it in its current condition. The Buyer is encouraged to obtain an independent mechanical inspection prior to signing this agreement.</p>
    </div>

    ${pricingSection}

    <div class="section">
      <h3>5. PAYMENT SCHEDULE</h3>
      <p class="clause">The Buyer agrees to make payments according to the following schedule. Payments are due on the dates specified. The first payment is due on <strong>${fmtDate(contract.payment_start_date)}</strong>.</p>
      ${buildScheduleTable(contract)}
    </div>

    <div class="section">
      <h3>6. LATE PAYMENT AND CHARITABLE PENALTY</h3>
      <p class="clause">
        If the Buyer fails to make any scheduled payment within <strong>30 days</strong> of its due date, a fixed daily late fee of <strong>${money(contract.late_fee_amount)}</strong> per day shall apply for each day the payment remains overdue, beginning on the 31st day.
      </p>
      <p class="clause">
        <strong>Important:</strong> In order to maintain Shariah compliance, all late fees collected are donated to <strong>${fmt(contract.charity_name)}</strong> and do not constitute income for the Seller. The Seller acknowledges that late fees are not a form of interest (Riba) and are collected solely as a deterrent against default.
      </p>
    </div>

    <div class="section">
      <h3>7. INSURANCE</h3>
      <p class="clause">The Buyer shall maintain comprehensive and collision insurance on the Vehicle at all times during the term of this agreement, naming the Seller as lienholder. Proof of insurance must be provided to the Seller upon request. In the event insurance lapses, the Seller may, at their discretion, purchase insurance on the Buyer's behalf and add the cost to the outstanding balance.</p>
    </div>

    <div class="section">
      <h3>8. EARLY PAYOFF</h3>
      <p class="clause">The Buyer may pay off the remaining balance at any time prior to the final payment due date without penalty. Early payoff does not entitle the Buyer to a rebate of the agreed markup amount, as the total price was mutually agreed upon at the time of contracting.</p>
    </div>

    <div class="section">
      <h3>9. DEFAULT AND REPOSSESSION</h3>
      <p class="clause">In the event the Buyer defaults on two (2) or more consecutive payments, the Seller, as lienholder, shall have the right to repossess the Vehicle after providing written notice to the Buyer. The Seller must follow all applicable California repossession laws, including providing proper notice and right of redemption.</p>
      <p class="clause">The Seller agrees to act in good faith and to pursue resolution with the Buyer before initiating repossession proceedings.</p>
    </div>

    <div class="section">
      <h3>10. ACCIDENTS AND TOTAL LOSS</h3>
      <p class="clause">In the event the Vehicle is involved in an accident, the Buyer bears full responsibility for any damages to the Vehicle or third parties from the date of delivery. In the event of a total loss, insurance proceeds shall first be applied to the outstanding balance owed to the Seller, with any surplus remitted to the Buyer.</p>
    </div>

    <div class="section">
      <h3>11. TITLE AND LIEN</h3>
      <p class="clause">The Seller shall retain a security interest in the Vehicle until all amounts owed under this agreement have been paid in full. Upon full payment, the Seller shall release the lien and transfer the title to the Buyer within 10 business days.</p>
    </div>

    ${contract.special_terms ? `
    <div class="section">
      <h3>12. SPECIAL TERMS AND CONDITIONS</h3>
      <p class="clause">${contract.special_terms}</p>
    </div>` : ''}

    <div class="section">
      <h3>${contract.special_terms ? '13' : '12'}. GOVERNING LAW</h3>
      <p class="clause">This agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to conflict of law provisions. The parties further agree that this agreement is structured in accordance with Islamic finance principles and that any disputes shall first be attempted to be resolved through good-faith negotiation.</p>
      <p class="clause">In case of any conflict between California law and Shariah principles, California law shall prevail. The Shariah-compliance structure is intended as a contractual framework and does not constitute a fatwa or religious ruling.</p>
    </div>

    <div class="section">
      <h3>SIGNATURES</h3>
      <p class="clause">By signing below, both parties confirm they have read, understood, and agreed to all terms of this Vehicle Financing Agreement.</p>

      <div class="signature-grid">
        <div class="sig-block">
          <div class="label">SELLER SIGNATURE</div>
          <div class="sig-placeholder">**seller_signature**</div>
          <div class="name">${fmt(contract.seller_name)}</div>
          <div class="label" style="margin-top:8px">Date: **seller_date**</div>
          <div style="font-size:12px;color:#6B7280;margin-top:8px">${fmt(contract.seller_address)}</div>
        </div>

        <div class="sig-block">
          <div class="label">BUYER SIGNATURE</div>
          <div class="sig-placeholder">**buyer_signature**</div>
          <div class="name">${fmt(contract.buyer_name)}</div>
          <div class="label" style="margin-top:8px">Date: **buyer_date**</div>
          <div style="font-size:12px;color:#6B7280;margin-top:8px">${fmt(contract.buyer_address)}</div>
        </div>
      </div>

      <p style="font-size:11px;color:#9CA3AF;margin-top:32px;text-align:center">
        This document was generated by AqadChain. Contract ${contract.contract_number} | Generated ${today}<br/>
        This contract is legally binding upon execution by both parties.
      </p>
    </div>

  </div>
</body>
</html>`;
}

function renderIjarahHtml(contract, preview = true) {
  const isIMIT = contract.ijarah_subtype === 'IMIT';
  const today = fmtDate(new Date());
  const typeLabel = isIMIT ? 'Ijarah Muntahia Bittamleek (IMIT)' : 'Ijarah (Operating Lease)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Vehicle Ijarah Agreement — ${contract.contract_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #1F2937; background: #fff; margin: 0; padding: 0; }
    .contract-wrapper { max-width: 850px; margin: 0 auto; padding: 48px 48px 80px; position: relative; }
    h1.title { text-align: center; font-size: 22px; font-weight: 700; margin-bottom: 4px; color: #111827; }
    .subtitle { text-align: center; font-size: 13px; color: #6B7280; margin-bottom: 32px; }
    .contract-meta { display: flex; justify-content: space-between; padding: 12px 16px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; margin-bottom: 32px; font-size: 13px; }
    .shariah-box { background: #EFF6FF; border-left: 4px solid #1D4ED8; padding: 12px 16px; margin-bottom: 28px; border-radius: 4px; font-size: 13px; color: #1E3A8A; }
    .section { margin-bottom: 28px; }
    .section h3 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1D4ED8; border-bottom: 2px solid #1D4ED8; padding-bottom: 4px; margin-bottom: 14px; }
    .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .party-card { border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px; }
    .party-card h4 { margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1D4ED8; }
    .party-card p { margin: 0; font-size: 13px; line-height: 1.6; }
    .terms-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .terms-table td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
    .terms-table td:first-child { color: #6B7280; width: 55%; }
    .clause { font-size: 13px; margin-bottom: 10px; }
    .clause strong { color: #111827; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 20px; }
    .sig-block { border-top: 2px solid #374151; padding-top: 10px; }
    .sig-block .label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
    .sig-block .name { font-weight: 600; font-size: 14px; }
    .sig-placeholder { height: 48px; margin: 8px 0; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 96px; font-weight: 900; color: rgba(0,0,0,0.06); pointer-events: none; z-index: 9999; white-space: nowrap; letter-spacing: 12px; }
  </style>
</head>
<body>
  ${preview ? '<div class="watermark">PREVIEW</div>' : ''}
  <div class="contract-wrapper">

    <h1 class="title">VEHICLE IJARAH AGREEMENT</h1>
    <p class="subtitle">${typeLabel} — Shariah-Compliant Islamic Lease</p>

    <div class="contract-meta">
      <span><strong>Contract #:</strong> ${contract.contract_number}</span>
      <span><strong>Date:</strong> ${today}</span>
      <span><strong>Type:</strong> ${typeLabel}</span>
    </div>

    <div class="shariah-box">
      <strong>Shariah Compliance Declaration:</strong> This contract is structured as an Ijarah (Islamic lease) agreement in accordance with AAOIFI Shari'ah Standard No. 9. The Lessor retains ownership of the Vehicle throughout the lease term. The Lessee acquires the right to use (usufruct) the Vehicle in exchange for rental payments (Ujrah). No interest (Riba) is charged.${isIMIT ? ' At the conclusion of the lease term, the Lessee shall have the right to purchase the Vehicle at the agreed residual value (Ijarah Muntahia Bittamleek).' : ''}
    </div>

    <div class="section">
      <h3>1. PARTIES</h3>
      <div class="parties-grid">
        <div class="party-card">
          <h4>LESSOR (Owner)</h4>
          <p><strong>${fmt(contract.seller_name)}</strong><br/>
          Email: ${fmt(contract.seller_email)}<br/>
          Phone: ${fmt(contract.seller_phone)}<br/>
          Address: ${fmt(contract.seller_address)}</p>
        </div>
        <div class="party-card">
          <h4>LESSEE (Renter)</h4>
          <p><strong>${fmt(contract.buyer_name)}</strong><br/>
          Email: ${fmt(contract.buyer_email)}<br/>
          Phone: ${fmt(contract.buyer_phone)}<br/>
          Address: ${fmt(contract.buyer_address)}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>2. VEHICLE DESCRIPTION</h3>
      <table class="terms-table">
        <tr><td>VIN:</td><td><strong>${fmt(contract.vehicle_vin)}</strong></td></tr>
        <tr><td>Year / Make / Model:</td><td><strong>${fmt(contract.vehicle_year)} ${fmt(contract.vehicle_make)} ${fmt(contract.vehicle_model)}</strong></td></tr>
        <tr><td>Trim / Series:</td><td><strong>${fmt(contract.vehicle_trim)}</strong></td></tr>
        <tr><td>Mileage at Lease Start:</td><td><strong>${contract.vehicle_mileage != null ? Number(contract.vehicle_mileage).toLocaleString() + ' miles' : '_______________'}</strong></td></tr>
        <tr><td>Color:</td><td><strong>${fmt(contract.vehicle_color)}</strong></td></tr>
        <tr><td>Title Status:</td><td><strong>${fmt(contract.title_status)}</strong></td></tr>
      </table>
    </div>

    <div class="section">
      <h3>3. CONDITION DECLARATION</h3>
      <p class="clause">The Lessee acknowledges having inspected the Vehicle and accepts it in its current condition for the purposes of this lease. The Lessor warrants that the Vehicle is free of undisclosed mechanical defects and that the Lessor holds clear title.</p>
    </div>

    <div class="section">
      <h3>4. IJARAH TERMS (LEASE TERMS)</h3>
      <table class="terms-table">
        <tr><td>Asset Fair Market Value:</td><td><strong>${money(contract.car_price)}</strong></td></tr>
        <tr><td>Security Deposit (Refundable):</td><td><strong>${money(contract.security_deposit)}</strong></td></tr>
        ${isIMIT ? `<tr><td>Residual / Purchase Option Price:</td><td><strong>${money(contract.residual_value)}</strong></td></tr>` : ''}
        <tr><td>Lease Term:</td><td><strong>${fmt(contract.term_months)} months</strong></td></tr>
        <tr><td>Rental Frequency:</td><td><strong>${fmt(contract.payment_frequency)}</strong></td></tr>
        <tr><td>Rental Payment (Ujrah):</td><td><strong>${money(contract.monthly_payment)}</strong></td></tr>
        <tr><td>Total Rental Payments:</td><td><strong>${money(contract.total_payable ? Number(contract.total_payable) - Number(contract.security_deposit || 0) - Number(contract.residual_value || 0) : null)}</strong></td></tr>
        <tr><td>Total Amount Payable (incl. deposit):</td><td><strong>${money(contract.total_payable)}</strong></td></tr>
        <tr><td>First Rental Due:</td><td><strong>${fmtDate(contract.payment_start_date)}</strong></td></tr>
      </table>
      <p style="font-size:12px;color:#6B7280;margin-top:8px">The rental payments (Ujrah) represent compensation for the right to use (usufruct) the Vehicle only. They do not constitute interest and do not reduce a financing balance.</p>
    </div>

    <div class="section">
      <h3>5. RENTAL PAYMENT SCHEDULE</h3>
      <p class="clause">The Lessee agrees to make rental payments (Ujrah) according to the following schedule. The first payment is due on <strong>${fmtDate(contract.payment_start_date)}</strong>.</p>
      ${buildScheduleTable(contract)}
    </div>

    <div class="section">
      <h3>6. ${isIMIT ? 'END-OF-LEASE PURCHASE OPTION' : 'RETURN OF VEHICLE'}</h3>
      ${isIMIT ? `
      <p class="clause">At the conclusion of the lease term, provided all rental payments have been made in full, the Lessee shall have the right to purchase the Vehicle from the Lessor for the agreed <strong>residual value of ${money(contract.residual_value)}</strong>.</p>
      <p class="clause">This purchase option is a separate, independent contract (Bay' — sale agreement) that the parties agree to execute at the end of the lease. The Lessor may not revoke this offer as long as the Lessee has fulfilled all obligations under this Ijarah agreement.</p>
      <p class="clause">If the Lessee chooses not to exercise the purchase option, the Vehicle must be returned to the Lessor within 5 business days of the final rental payment. The security deposit of ${money(contract.security_deposit)} shall be refunded within 10 business days of return, less any documented damage beyond normal wear and tear.</p>
      ` : `
      <p class="clause">At the conclusion of the lease term, the Lessee shall return the Vehicle to the Lessor in good condition, subject to normal wear and tear. The Lessee shall bear the cost of any damage beyond normal wear and tear as determined by independent appraisal.</p>
      <p class="clause">The security deposit of <strong>${money(contract.security_deposit)}</strong> shall be refunded to the Lessee within 10 business days of the Vehicle's return, less any documented damage costs.</p>
      `}
    </div>

    <div class="section">
      <h3>7. LESSOR'S OBLIGATIONS</h3>
      <p class="clause">As the owner of the Vehicle, the Lessor is responsible for: (a) major structural repairs not caused by the Lessee's misuse; (b) maintaining clear title throughout the lease term; (c) ensuring the Vehicle is roadworthy at the start of the lease.</p>
      <p class="clause">The Lessee is responsible for: routine maintenance, fuel, registration, traffic violations, and all costs of day-to-day operation.</p>
    </div>

    <div class="section">
      <h3>8. INSURANCE</h3>
      <p class="clause">The Lessee shall maintain comprehensive and collision insurance on the Vehicle at all times during the lease, naming the Lessor as the primary named insured (as owner). Proof of insurance must be provided to the Lessor upon request.</p>
    </div>

    <div class="section">
      <h3>9. LATE PAYMENT AND CHARITABLE PENALTY</h3>
      <p class="clause">If the Lessee fails to make any scheduled rental payment within <strong>30 days</strong> of its due date, a fixed daily late fee of <strong>${money(contract.late_fee_amount)}</strong> per day shall apply from the 31st day. In accordance with Shariah principles, all late fees are donated to <strong>${fmt(contract.charity_name)}</strong> and do not constitute income for the Lessor.</p>
    </div>

    <div class="section">
      <h3>10. DEFAULT AND EARLY TERMINATION</h3>
      <p class="clause">In the event the Lessee defaults on two (2) or more consecutive rental payments, the Lessor shall have the right to terminate this Ijarah agreement and recover the Vehicle after providing written notice. The Lessee shall remain liable for any outstanding rental payments up to the date of recovery.</p>
      <p class="clause">Early termination by the Lessee does not entitle the Lessee to a refund of rental payments already made. The security deposit shall be applied to any outstanding amounts owed.</p>
    </div>

    <div class="section">
      <h3>11. ACCIDENTS AND TOTAL LOSS</h3>
      <p class="clause">In the event of a total loss, the Lessee must immediately notify the Lessor. Insurance proceeds shall be remitted to the Lessor as owner. If the Lessee holds an IMIT purchase option, any insurance surplus above the remaining rental obligations shall be remitted to the Lessee.</p>
    </div>

    ${contract.special_terms ? `
    <div class="section">
      <h3>12. SPECIAL TERMS AND CONDITIONS</h3>
      <p class="clause">${contract.special_terms}</p>
    </div>` : ''}

    <div class="section">
      <h3>${contract.special_terms ? '13' : '12'}. GOVERNING LAW</h3>
      <p class="clause">This agreement shall be governed by the laws of the State of California. The Ijarah structure is intended as a contractual framework compliant with AAOIFI Shari'ah Standard No. 9. In case of conflict between California law and Shariah principles, California law shall prevail.</p>
    </div>

    <div class="section">
      <h3>SIGNATURES</h3>
      <p class="clause">By signing below, both parties confirm they have read, understood, and agreed to all terms of this Vehicle Ijarah Agreement.</p>
      <div class="signature-grid">
        <div class="sig-block">
          <div class="label">LESSOR SIGNATURE</div>
          <div class="sig-placeholder">**seller_signature**</div>
          <div class="name">${fmt(contract.seller_name)}</div>
          <div class="label" style="margin-top:8px">Date: **seller_date**</div>
          <div style="font-size:12px;color:#6B7280;margin-top:8px">${fmt(contract.seller_address)}</div>
        </div>
        <div class="sig-block">
          <div class="label">LESSEE SIGNATURE</div>
          <div class="sig-placeholder">**buyer_signature**</div>
          <div class="name">${fmt(contract.buyer_name)}</div>
          <div class="label" style="margin-top:8px">Date: **buyer_date**</div>
          <div style="font-size:12px;color:#6B7280;margin-top:8px">${fmt(contract.buyer_address)}</div>
        </div>
      </div>
      <p style="font-size:11px;color:#9CA3AF;margin-top:32px;text-align:center">
        This document was generated by AqadChain. Contract ${contract.contract_number} | Generated ${today}<br/>
        This contract is legally binding upon execution by both parties.
      </p>
    </div>

  </div>
</body>
</html>`;
}

module.exports = { renderContractHtml };
