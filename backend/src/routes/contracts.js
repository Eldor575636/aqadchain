const router = require('express').Router();
const Joi = require('joi');
const { validate } = require('../middleware/validate');
const { requireAuth, requireOnboarding } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const { generateContractNumber } = require('../services/contractNumber');
const { sendEnvelopeForSignature, getEnvelopeStatus, resendEnvelope, downloadSignedDocument } = require('../services/docusign');
const { sendContractCreatedEmail, sendSignatureRequestEmail } = require('../services/email');
const { uploadContract, getDownloadUrl } = require('../services/s3');
const { log } = require('../services/auditLog');
const { renderContractHtml } = require('../services/contractTemplate');

const prisma = new PrismaClient();
const auth = [...requireAuth, requireOnboarding];

const contractSchema = Joi.object({
  contract_type: Joi.string().valid('MURABAHA', 'MUSAWAMA', 'IJARAH').required(),
  vehicle_vin: Joi.string().max(17).allow('', null),
  vehicle_year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 2).allow(null),
  vehicle_make: Joi.string().max(50).allow('', null),
  vehicle_model: Joi.string().max(50).allow('', null),
  vehicle_trim: Joi.string().max(50).allow('', null),
  vehicle_mileage: Joi.number().integer().min(0).allow(null),
  vehicle_color: Joi.string().max(30).allow('', null),
  title_status: Joi.string().valid('CLEAN', 'SALVAGE', 'REBUILT').allow(null),
  seller_name: Joi.string().max(100).allow('', null),
  seller_email: Joi.string().email().allow('', null),
  seller_phone: Joi.string().allow('', null),
  seller_address: Joi.string().allow('', null),
  buyer_name: Joi.string().max(100).allow('', null),
  buyer_email: Joi.string().email().allow('', null),
  buyer_phone: Joi.string().allow('', null),
  buyer_address: Joi.string().allow('', null),
  car_price: Joi.number().positive().allow(null),
  down_payment: Joi.number().min(0).allow(null),
  markup_percentage: Joi.number().min(0).max(15).allow(null),
  markup_amount: Joi.number().min(0).allow(null),
  financed_amount: Joi.number().min(0).allow(null),
  apr: Joi.number().min(0).max(30).allow(null),
  term_months: Joi.number().valid(6, 12, 18, 24, 36, 48, 60).allow(null),
  monthly_payment: Joi.number().min(0).allow(null),
  total_payable: Joi.number().min(0).allow(null),
  payment_frequency: Joi.string().valid('WEEKLY', 'MONTHLY').allow(null),
  payment_start_date: Joi.date().allow(null),
  late_fee_amount: Joi.number().min(0).allow(null),
  charity_name: Joi.string().max(100).allow('', null),
  special_terms: Joi.string().max(2000).allow('', null),
  ijarah_subtype: Joi.string().valid('OPERATING', 'IMIT').allow(null),
  security_deposit: Joi.number().min(0).allow(null),
  residual_value: Joi.number().min(0).allow(null),
});

// POST /api/contracts
router.post('/', auth, validate(contractSchema), async (req, res, next) => {
  try {
    const contract_number = await generateContractNumber();
    const contract = await prisma.contract.create({
      data: { ...req.body, creator_id: req.user.id, contract_number, status: 'DRAFT' },
    });
    await sendContractCreatedEmail(req.user, contract);
    await log(req.user.id, 'CONTRACT_CREATED', 'Contract', contract.id);
    res.status(201).json({ contract });
  } catch (err) { next(err); }
});

// GET /api/contracts
router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const status = req.query.status;
    const search = req.query.search;

    const where = { creator_id: req.user.id };
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { contract_number: { contains: search, mode: 'insensitive' } },
        { buyer_name: { contains: search, mode: 'insensitive' } },
        { vehicle_make: { contains: search, mode: 'insensitive' } },
        { vehicle_model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    res.json({ contracts, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /api/contracts/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
      include: {
        signatures: true,
        creator: { select: { id: true, full_name: true, email: true } },
      },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const auditLogs = await prisma.auditLog.findMany({
      where: { entity_id: contract.id },
      orderBy: { created_at: 'asc' },
    });

    res.json({ contract, auditLogs });
  } catch (err) { next(err); }
});

// GET /api/contracts/:id/preview — returns rendered HTML for DRM viewer
router.get('/:id/preview', auth, async (req, res, next) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    const html = renderContractHtml(contract, true);
    await log(req.user.id, 'CONTRACT_VIEWED', 'Contract', contract.id);
    res.json({ html });
  } catch (err) { next(err); }
});

// PUT /api/contracts/:id
router.put('/:id', auth, validate(contractSchema), async (req, res, next) => {
  try {
    const existing = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Contract not found' });
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT contracts can be edited' });
    }

    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await log(req.user.id, 'CONTRACT_UPDATED', 'Contract', contract.id);
    res.json({ contract });
  } catch (err) { next(err); }
});

// DELETE /api/contracts/:id (soft delete)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const existing = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Contract not found' });

    await prisma.contract.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    await log(req.user.id, 'CONTRACT_CANCELLED', 'Contract', req.params.id);
    res.json({ message: 'Contract cancelled' });
  } catch (err) { next(err); }
});

// POST /api/contracts/:id/send — send for DocuSign signatures
router.post('/:id/send', auth, async (req, res, next) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    if (contract.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT contracts can be sent for signature' });
    }
    if (!contract.seller_email || !contract.buyer_email) {
      return res.status(400).json({ error: 'Seller and buyer emails are required' });
    }

    const contractHtml = renderContractHtml(contract, false);
    const envelopeId = await sendEnvelopeForSignature({
      contractHtml,
      contractNumber: contract.contract_number,
      sellerName: contract.seller_name,
      sellerEmail: contract.seller_email,
      buyerName: contract.buyer_name,
      buyerEmail: contract.buyer_email,
    });

    const updated = await prisma.contract.update({
      where: { id: contract.id },
      data: { status: 'PENDING_SIGNATURE', docusign_envelope_id: envelopeId },
    });

    // Create signature tracking records
    await prisma.signature.createMany({
      data: [
        { contract_id: contract.id, signer_role: 'SELLER', signer_name: contract.seller_name, signer_email: contract.seller_email, docusign_recipient_id: '1' },
        { contract_id: contract.id, signer_role: 'BUYER', signer_name: contract.buyer_name, signer_email: contract.buyer_email, docusign_recipient_id: '2' },
      ],
    });

    // Notify both parties via platform email
    await sendSignatureRequestEmail({ name: contract.seller_name, email: contract.seller_email }, contract, 'Seller');
    await sendSignatureRequestEmail({ name: contract.buyer_name, email: contract.buyer_email }, contract, 'Buyer');

    await log(req.user.id, 'CONTRACT_SENT_FOR_SIGNATURE', 'Contract', contract.id, { envelopeId });
    res.json({ contract: updated, envelopeId });
  } catch (err) { next(err); }
});

// GET /api/contracts/:id/status
router.get('/:id/status', auth, async (req, res, next) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    if (!contract.docusign_envelope_id) {
      return res.json({ status: contract.status, signing: null });
    }

    const { envelope, recipients } = await getEnvelopeStatus(contract.docusign_envelope_id);
    res.json({ status: contract.status, envelope, recipients });
  } catch (err) { next(err); }
});

// POST /api/contracts/:id/resend
router.post('/:id/resend', auth, async (req, res, next) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
    });
    if (!contract || !contract.docusign_envelope_id) {
      return res.status(404).json({ error: 'Contract or envelope not found' });
    }
    await resendEnvelope(contract.docusign_envelope_id);
    await log(req.user.id, 'SIGNATURE_RESENT', 'Contract', contract.id);
    res.json({ message: 'Signature request resent' });
  } catch (err) { next(err); }
});

// POST /api/contracts/:id/download
router.post('/:id/download', auth, async (req, res, next) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, creator_id: req.user.id },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    if (contract.status !== 'SIGNED' && contract.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Contract must be signed before downloading' });
    }

    // Return pre-signed S3 URL if already stored
    if (contract.signed_pdf_url) {
      const url = await getDownloadUrl(contract.signed_pdf_url);
      return res.json({ url });
    }

    // Fetch from DocuSign on demand
    if (!contract.docusign_envelope_id) {
      return res.status(400).json({ error: 'No signed document available' });
    }

    const pdfBuffer = await downloadSignedDocument(contract.docusign_envelope_id);
    const s3Key = await uploadContract(contract.contract_number, pdfBuffer);

    await prisma.contract.update({
      where: { id: contract.id },
      data: { signed_pdf_url: s3Key },
    });

    const url = await getDownloadUrl(s3Key);
    await log(req.user.id, 'CONTRACT_DOWNLOADED', 'Contract', contract.id);
    res.json({ url });
  } catch (err) { next(err); }
});

module.exports = router;
