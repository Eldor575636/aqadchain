const router = require('express').Router();
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

const sendSchema = Joi.object({
  listing_id: Joi.string().required(),
  recipient_id: Joi.string().required(),
  body: Joi.string().min(1).max(2000).required(),
});

// GET /api/messages/conversations — list distinct conversations for current user
router.get('/conversations', requireAuth, async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { OR: [{ sender_id: req.user.id }, { recipient_id: req.user.id }] },
      orderBy: { created_at: 'desc' },
      include: {
        listing: { select: { id: true, vehicle_year: true, vehicle_make: true, vehicle_model: true, photo_url: true } },
        sender: { select: { id: true, full_name: true } },
        recipient: { select: { id: true, full_name: true } },
      },
    });

    const seen = new Map();
    for (const m of messages) {
      const otherUser = m.sender_id === req.user.id ? m.recipient : m.sender;
      const key = `${m.listing_id}:${otherUser.id}`;
      if (!seen.has(key)) {
        seen.set(key, {
          listing: m.listing,
          other_user: otherUser,
          last_message: m.body,
          last_message_at: m.created_at,
          unread: m.recipient_id === req.user.id && !m.read_at,
        });
      }
    }

    res.json({ conversations: Array.from(seen.values()) });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:listingId/:otherUserId — full thread
router.get('/:listingId/:otherUserId', requireAuth, async (req, res, next) => {
  try {
    const { listingId, otherUserId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        listing_id: listingId,
        OR: [
          { sender_id: req.user.id, recipient_id: otherUserId },
          { sender_id: otherUserId, recipient_id: req.user.id },
        ],
      },
      orderBy: { created_at: 'asc' },
    });

    await prisma.message.updateMany({
      where: { listing_id: listingId, sender_id: otherUserId, recipient_id: req.user.id, read_at: null },
      data: { read_at: new Date() },
    });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// POST /api/messages — send a message
router.post('/', requireAuth, validate(sendSchema), async (req, res, next) => {
  try {
    if (req.body.recipient_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }
    const message = await prisma.message.create({
      data: { ...req.body, sender_id: req.user.id },
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
