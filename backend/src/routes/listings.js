const router = require('express').Router();
const Joi = require('joi');
const axios = require('axios');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { validate, validateQuery } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { log } = require('../services/auditLog');
const { geocodeZip, distanceMiles } = require('../services/geo');
const { uploadListingPhoto } = require('../services/s3');

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

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
  zip: Joi.string().max(10).allow('', null),
  photo_url: Joi.string().uri().allow('', null),
});

const browseQuerySchema = Joi.object({
  make: Joi.string(),
  contract_type: Joi.string().valid('MURABAHA', 'MUSAWAMA', 'IJARAH'),
  min_price: Joi.number().min(0),
  max_price: Joi.number().min(0),
  search: Joi.string(),
  near_zip: Joi.string().max(10),
  radius_miles: Joi.number().min(1).max(2000),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(24),
});

async function fetchRecalls(make, model, year) {
  if (!make || !model || !year) return [];
  try {
    const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    return (data?.results || []).map((r) => ({
      component: r.Component,
      summary: r.Summary,
      consequence: r.Consequence,
      remedy: r.Remedy,
      campaign_number: r.NHTSACampaignNumber,
    }));
  } catch {
    return [];
  }
}

// GET /api/listings — public browse with filters
router.get('/', validateQuery(browseQuerySchema), async (req, res, next) => {
  try {
    const { make, contract_type, min_price, max_price, search, near_zip, radius_miles, page, limit } = req.query;

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

    // Radius search: geocode the zip, then filter in-app (no PostGIS available)
    let originGeo = null;
    if (near_zip) originGeo = await geocodeZip(near_zip);

    if (originGeo && radius_miles) {
      const all = await prisma.listing.findMany({
        where, orderBy: { created_at: 'desc' },
        include: { seller: { select: { full_name: true, kyc_status: true } } },
      });
      const filtered = all.filter((l) => {
        if (l.latitude == null || l.longitude == null) return false;
        return distanceMiles(originGeo.latitude, originGeo.longitude, l.latitude, l.longitude) <= radius_miles;
      });
      const total = filtered.length;
      const paged = filtered.slice((page - 1) * limit, page * limit);
      return res.json({ listings: paged, total, page, limit, pages: Math.ceil(total / limit) });
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
      include: { seller: { select: { id: true, full_name: true, kyc_status: true, created_at: true } } },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    await prisma.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } });

    const reviews = await prisma.review.findMany({ where: { reviewee_id: listing.seller_id } });
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

    res.json({ listing, seller_rating: avgRating, seller_review_count: reviews.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id/similar — similar active listings (same make, or similar price)
router.get('/:id/similar', async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const price = Number(listing.asking_price);
    const similar = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: listing.id },
        OR: [
          { vehicle_make: { equals: listing.vehicle_make, mode: 'insensitive' } },
          { asking_price: { gte: price * 0.8, lte: price * 1.2 } },
        ],
      },
      take: 4,
      orderBy: { created_at: 'desc' },
    });
    res.json({ listings: similar });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings — create a listing
router.post('/', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const { vehicle_make, vehicle_model, vehicle_year, zip } = req.body;

    const [recalls, geo] = await Promise.all([
      fetchRecalls(vehicle_make, vehicle_model, vehicle_year),
      geocodeZip(zip),
    ]);

    const listing = await prisma.listing.create({
      data: {
        ...req.body,
        seller_id: req.user.id,
        recalls,
        has_recalls: recalls.length > 0,
        latitude: geo?.latitude ?? null,
        longitude: geo?.longitude ?? null,
      },
    });
    await log(req.user.id, 'LISTING_CREATED', 'Listing', listing.id);
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings/:id/photo — upload a listing photo
router.post('/:id/photo', requireAuth, upload.single('photo'), async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
    if (!process.env.AWS_S3_BUCKET) return res.status(503).json({ error: 'Photo storage not configured' });

    const url = await uploadListingPhoto(existing.id, req.file.buffer, req.file.mimetype);
    const listing = await prisma.listing.update({ where: { id: existing.id }, data: { photo_url: url } });
    res.json({ listing });
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

// ── Favorites ───────────────────────────────────────────────────────
// GET /api/listings/favorites/mine
router.get('/favorites/mine', requireAuth, async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { user_id: req.user.id },
      include: { listing: true },
      orderBy: { created_at: 'desc' },
    });
    res.json({ favorites });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings/:id/favorite — toggle favorite
router.post('/:id/favorite', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { user_id_listing_id: { user_id: req.user.id, listing_id: req.params.id } },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ favorited: false });
    }
    await prisma.favorite.create({ data: { user_id: req.user.id, listing_id: req.params.id } });
    res.json({ favorited: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
