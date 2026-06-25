const router = require('express').Router();
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

const createSchema = Joi.object({
  contract_id: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow('', null),
});

// GET /api/reviews/seller/:userId — public reviews for a seller
router.get('/seller/:userId', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { reviewee_id: req.params.userId },
      orderBy: { created_at: 'desc' },
      include: { reviewer: { select: { full_name: true } } },
    });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
    res.json({ reviews, average_rating: avg, count: reviews.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews — leave a review for the seller of a completed contract tied to a listing
router.post('/', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({ where: { id: req.body.contract_id } });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    if (contract.status !== 'COMPLETED' && contract.status !== 'SIGNED') {
      return res.status(400).json({ error: 'Contract must be signed or completed to leave a review' });
    }
    if (!contract.listing_id) return res.status(400).json({ error: 'This contract is not tied to a marketplace listing' });
    if (contract.creator_id !== req.user.id) return res.status(403).json({ error: 'Only the contract creator can review this deal' });

    const listing = await prisma.listing.findUnique({ where: { id: contract.listing_id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.seller_id === req.user.id) return res.status(400).json({ error: 'Cannot review your own listing' });

    const review = await prisma.review.create({
      data: {
        listing_id: listing.id,
        contract_id: contract.id,
        reviewer_id: req.user.id,
        reviewee_id: listing.seller_id,
        rating: req.body.rating,
        comment: req.body.comment || null,
      },
    });
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'You already reviewed this deal' });
    next(err);
  }
});

module.exports = router;
