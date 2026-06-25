const router = require('express').Router();
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { validate, validateQuery } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { log } = require('../services/auditLog');

const prisma = new PrismaClient();

const createSchema = Joi.object({
  vehicle_vin: Joi.string().length(17).uppercase().allow('', null),
  vehicle_year: Joi.number().integer().min(1980).max(new Date().getFullYear() + 1).required(),
  vehicle_make: Joi.string().required(),
  vehicle_model: Joi.string().required(),
  vehicle_trim: Joi.string().allow('', null),
  vehicle_mileage: Joi.number().integer().min(0).allow(null),
  vehicle_color: Joi.string().allow('', null),
  title_status: Joi.string().valid('CLEAN', 'SALVAGE', 'REBUILT').allow(null),
  asking_price: Joi.number().positive().required(),
  contract_type_offered: Joi.string().valid('MURABAHA', 'MUSAWAMA', 'IJARAH').required(),
  description: Joi.string().max(2000).allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  photo_url: Joi.string().uri().allow('', null),
});

const browseQuerySchema = Joi.object({
  make: Joi.string(),
  contract_type: Joi.string().valid('MURABAHA', 'MUSAWAMA', 'IJARAH'),
  min_price: Joi.number().min(0),
  max_price: Joi.number().min(0),
  search: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(24),
});

// GET /api/listings — public browse with filters
router.get('/', validateQuery(browseQuerySchema), async (req, res, next) => {
  try {
    const { make, contract_type, min_price, max_price, search, page, limit } = req.query;

    const where = { status: 'ACTIVE' };
    if (make) where.vehicle_make = { equals: make, mode: 'insensitive' };
    if (contract_type) where.contract_type_offered = contract_type;
    if (min_price || max_price) {
      where.asking_price = {};
      if (min_price) where.asking_price.gte = min_price;
      if (max_price) where.asking_price.lte = max_price;
    }
    if (search) {
      where.OR = [
        { vehicle_make: { contains: search, mode: 'insensitive' } },
        { vehicle_model: { contains: search, mode: 'insensitive' } },
        { vehicle_trim: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { seller: { select: { full_name: true, kyc_status: true } } },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/mine — current user's own listings
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { seller_id: req.user.id },
      orderBy: { created_at: 'desc' },
    });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id — public listing detail
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { full_name: true, kyc_status: true, created_at: true } } },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    await prisma.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } });

    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings — create a listing
router.post('/', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const listing = await prisma.listing.create({
      data: { ...req.body, seller_id: req.user.id },
    });
    await log(req.user.id, 'LISTING_CREATED', 'Listing', listing.id);
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// PUT /api/listings/:id — update own listing
router.put('/:id', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

    const listing = await prisma.listing.update({ where: { id: req.params.id }, data: req.body });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// PUT /api/listings/:id/status — change status (mark sold/removed)
router.put('/:id/status', requireAuth, validate(Joi.object({ status: Joi.string().valid('ACTIVE', 'PENDING', 'SOLD', 'REMOVED').required() })), async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

    const listing = await prisma.listing.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id — remove own listing
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
