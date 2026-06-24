const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL || 'noreply@aqadchain.com',
  name: process.env.SENDGRID_FROM_NAME || 'AqadChain',
};

async function send(to, subject, html, text) {
  const msg = { to, from: FROM, subject, html, text: text || subject };
  try {
    await sgMail.send(msg);
  } catch (err) {
    console.error('[SendGrid] Failed to send email:', err.response?.body || err.message);
    // Don't throw — email failure should not block the main flow
  }
}

function baseLayout(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #F3F4F6; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #0D6E63; padding: 32px 40px; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; }
    .header span { color: #C9A84C; }
    .body { padding: 32px 40px; color: #374151; font-size: 15px; line-height: 1.6; }
    .body h2 { color: #111827; margin-top: 0; }
    .btn { display: inline-block; margin: 24px 0; padding: 12px 28px; background: #0D6E63; color: #fff !important; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px; }
    .footer { padding: 20px 40px; background: #F3F4F6; color: #9CA3AF; font-size: 12px; text-align: center; }
    .divider { border: none; border-top: 1px solid #E5E7EB; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
    .detail-label { color: #6B7280; font-size: 13px; }
    .detail-value { font-weight: 600; color: #111827; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Aqad<span>Chain</span></h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>AqadChain — Shariah-compliant vehicle financing contracts</p>
      <p>This email was sent automatically. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendWelcomeEmail(user) {
  const html = baseLayout(`
    <h2>Welcome to AqadChain, ${user.full_name}!</h2>
    <p>We're glad you're here. AqadChain makes it simple to create legally binding, Shariah-compliant vehicle financing contracts — right from your browser.</p>
    <p>You're just a few steps away from creating your first contract.</p>
    <a href="${process.env.FRONTEND_URL}/onboarding" class="btn">Complete your setup →</a>
    <hr class="divider" />
    <p style="font-size:13px;color:#6B7280;">If you did not create an account, you can safely ignore this email.</p>
  `);
  await send(user.email, 'Welcome to AqadChain', html);
}

async function sendOnboardingCompleteEmail(user) {
  const html = baseLayout(`
    <h2>You're all set, ${user.full_name}!</h2>
    <p>Your onboarding is complete. You can now create Murabaha and Musawama vehicle financing contracts that are Shariah-compliant and legally binding under California law.</p>
    <a href="${process.env.FRONTEND_URL}/contracts/new/type" class="btn">Create your first contract →</a>
  `);
  await send(user.email, 'Onboarding Complete — Start creating contracts', html);
}

async function sendContractCreatedEmail(user, contract) {
  const html = baseLayout(`
    <h2>Contract Created</h2>
    <p>Your contract <strong>${contract.contract_number}</strong> has been saved as a draft.</p>
    <div class="detail-row"><span class="detail-label">Contract Type</span><span class="detail-value">${contract.contract_type}</span></div>
    <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${contract.vehicle_year} ${contract.vehicle_make} ${contract.vehicle_model}</span></div>
    <div class="detail-row"><span class="detail-label">Buyer</span><span class="detail-value">${contract.buyer_name}</span></div>
    <div class="detail-row"><span class="detail-label">Amount Financed</span><span class="detail-value">$${Number(contract.financed_amount).toLocaleString()}</span></div>
    <br/>
    <a href="${process.env.FRONTEND_URL}/contracts/${contract.id}" class="btn">View Contract →</a>
  `);
  await send(user.email, `Contract ${contract.contract_number} Created`, html);
}

async function sendSignatureRequestEmail(recipient, contract, role) {
  const html = baseLayout(`
    <h2>Action Required: Please sign your contract</h2>
    <p>Hello ${recipient.name},</p>
    <p>A Halal vehicle financing contract has been sent to you for signature.</p>
    <div class="detail-row"><span class="detail-label">Contract #</span><span class="detail-value">${contract.contract_number}</span></div>
    <div class="detail-row"><span class="detail-label">Your Role</span><span class="detail-value">${role}</span></div>
    <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${contract.vehicle_year} ${contract.vehicle_make} ${contract.vehicle_model}</span></div>
    <div class="detail-row"><span class="detail-label">Amount Financed</span><span class="detail-value">$${Number(contract.financed_amount).toLocaleString()}</span></div>
    <br/>
    <p>You will receive a separate email from DocuSign with the signing link. Please check your inbox.</p>
    <a href="${process.env.FRONTEND_URL}/contracts/${contract.id}" class="btn">View Contract Details →</a>
    <p style="font-size:13px;color:#6B7280;">This contract is structured as a ${contract.contract_type} agreement in accordance with Islamic finance principles.</p>
  `);
  await send(recipient.email, `Please sign: AqadChain Contract ${contract.contract_number}`, html);
}

async function sendContractSignedEmail(contract) {
  const recipients = [
    { name: contract.seller_name, email: contract.seller_email },
    { name: contract.buyer_name, email: contract.buyer_email },
  ];

  for (const r of recipients) {
    const html = baseLayout(`
      <h2>Contract Fully Signed ✓</h2>
      <p>Hello ${r.name},</p>
      <p>Both parties have signed the contract. Your Halal vehicle financing agreement is now complete and legally binding.</p>
      <div class="detail-row"><span class="detail-label">Contract #</span><span class="detail-value">${contract.contract_number}</span></div>
      <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${contract.vehicle_year} ${contract.vehicle_make} ${contract.vehicle_model}</span></div>
      <div class="detail-row"><span class="detail-label">Amount Financed</span><span class="detail-value">$${Number(contract.financed_amount).toLocaleString()}</span></div>
      <br/>
      <a href="${process.env.FRONTEND_URL}/contracts/${contract.id}" class="btn">View Signed Contract →</a>
    `);
    await send(r.email, `Contract ${contract.contract_number} — Fully Signed`, html);
  }
}

async function sendDownloadReadyEmail(user, contract, downloadUrl) {
  const html = baseLayout(`
    <h2>Your signed contract is ready to download</h2>
    <p>Hello ${user.full_name},</p>
    <p>The signed PDF for contract <strong>${contract.contract_number}</strong> is ready.</p>
    <a href="${downloadUrl}" class="btn">Download PDF →</a>
    <p style="font-size:13px;color:#6B7280;">This link expires in 24 hours.</p>
  `);
  await send(user.email, `Download Ready: Contract ${contract.contract_number}`, html);
}

module.exports = {
  sendWelcomeEmail,
  sendOnboardingCompleteEmail,
  sendContractCreatedEmail,
  sendSignatureRequestEmail,
  sendContractSignedEmail,
  sendDownloadReadyEmail,
};
