const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { PrismaClient } = require('@prisma/client');
const { log } = require('../services/auditLog');

const prisma = new PrismaClient();
const adminAuth = [...requireAuth, requireRole('ADMIN')];

// GET /api/admin/users
router.get('/users', adminAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const kyc = req.query.kyc_status;

    const where = {};
    if (kyc) where.kyc_status = kyc;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, full_name: true, phone: true,
          role: true, kyc_status: true, kyc_verified_at: true,
          onboarding_completed: true, created_at: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, limit });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/kyc
router.put('/users/:id/kyc', adminAuth, async (req, res, next) => {
  try {
    const { kyc_status } = req.body;
    if (!['VERIFIED', 'REJECTED'].includes(kyc_status)) {
      return res.status(400).json({ error: 'kyc_status must be VERIFIED or REJECTED' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        kyc_status,
        kyc_verified_at: kyc_status === 'VERIFIED' ? new Date() : null,
      },
    });

    await log(req.user.id, 'KYC_STATUS_UPDATED', 'User', user.id, { kyc_status });
    res.json({ user });
  } catch (err) { next(err); }
});

// GET /api/admin/contracts
router.get('/contracts', adminAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const status = req.query.status;

    const where = {};
    if (status && status !== 'ALL') where.status = status;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { creator: { select: { email: true, full_name: true } } },
      }),
      prisma.contract.count({ where }),
    ]);

    res.json({ contracts, total, page, limit });
  } catch (err) { next(err); }
});

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalContracts, signedContracts, cancelledContracts,
      drafts, pendingSignature, signedToday, newUsersToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: { in: ['SIGNED', 'COMPLETED'] } } }),
      prisma.contract.count({ where: { status: 'CANCELLED' } }),
      prisma.contract.count({ where: { status: 'DRAFT' } }),
      prisma.contract.count({ where: { status: 'PENDING_SIGNATURE' } }),
      prisma.contract.count({ where: { status: { in: ['SIGNED', 'COMPLETED'] }, buyer_signed_at: { gte: today } } }),
      prisma.user.count({ where: { created_at: { gte: today } } }),
    ]);

    res.json({
      totalUsers, totalContracts, signedContracts, cancelledContracts,
      drafts, pendingSignature, signedToday, newUsersToday,
    });
  } catch (err) { next(err); }
});

module.exports = router;
