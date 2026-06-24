const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { uploadContract } = require('../services/s3');
const { sendContractSignedEmail } = require('../services/email');
const { log } = require('../services/auditLog');
const { downloadSignedDocument } = require('../services/docusign');

const prisma = new PrismaClient();

// POST /api/webhooks/docusign
// DocuSign sends Connect webhook events here when envelope status changes.
// Note: body is raw Buffer (set in server.js) for HMAC verification.
router.post('/docusign', async (req, res) => {
  try {
    // Parse the raw body
    const payload = JSON.parse(req.body.toString());
    const { event, data } = payload;

    if (!data?.envelopeId) {
      return res.status(200).send('OK');
    }

    const envelopeId = data.envelopeId;
    const contract = await prisma.contract.findFirst({
      where: { docusign_envelope_id: envelopeId },
    });

    if (!contract) {
      console.log(`[DocuSign Webhook] No contract found for envelope: ${envelopeId}`);
      return res.status(200).send('OK');
    }

    // Handle individual recipient signing
    if (event === 'recipient-completed') {
      const recipientId = data.recipients?.signers?.[0]?.recipientId;
      const role = recipientId === '1' ? 'SELLER' : 'BUYER';
      const signedAt = new Date();
      const ipAddress = data.recipients?.signers?.[0]?.ipAddress || null;

      await prisma.signature.updateMany({
        where: { contract_id: contract.id, docusign_recipient_id: recipientId },
        data: { signed_at: signedAt, ip_address: ipAddress },
      });

      const updateData = role === 'SELLER'
        ? { seller_signed_at: signedAt }
        : { buyer_signed_at: signedAt };

      await prisma.contract.update({ where: { id: contract.id }, data: updateData });
      await log(null, `${role}_SIGNED`, 'Contract', contract.id, { envelopeId, ipAddress });
    }

    // Handle envelope completed (both parties signed)
    if (event === 'envelope-completed') {
      const now = new Date();

      // Download and store signed PDF
      let s3Key = null;
      try {
        const pdfBuffer = await downloadSignedDocument(envelopeId);
        s3Key = await uploadContract(contract.contract_number, pdfBuffer);
      } catch (err) {
        console.error('[DocuSign Webhook] PDF download failed:', err.message);
      }

      const updated = await prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: 'SIGNED',
          seller_signed_at: contract.seller_signed_at || now,
          buyer_signed_at: now,
          signed_pdf_url: s3Key,
        },
      });

      await sendContractSignedEmail(updated);
      await log(null, 'CONTRACT_SIGNED', 'Contract', contract.id, { envelopeId, s3Key });
    }

    // Handle declined or voided
    if (event === 'envelope-declined' || event === 'envelope-voided') {
      await prisma.contract.update({
        where: { id: contract.id },
        data: { status: 'CANCELLED' },
      });
      await log(null, `CONTRACT_${event.toUpperCase().replace('-', '_')}`, 'Contract', contract.id);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[DocuSign Webhook] Error:', err.message);
    res.status(200).send('OK'); // Always 200 to DocuSign to prevent retries on our logic errors
  }
});

module.exports = router;
