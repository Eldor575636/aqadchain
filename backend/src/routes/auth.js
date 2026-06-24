const router = require('express').Router();
const Joi = require('joi');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const { sendWelcomeEmail, sendOnboardingCompleteEmail } = require('../services/email');
const { log } = require('../services/auditLog');

const prisma = new PrismaClient();

// POST /api/auth/callback — called by frontend after Auth0 login to sync user to DB
router.post('/callback', async (req, res, next) => {
  try {
    const { auth0_id, email, full_name } = req.body;
    if (!auth0_id || !email || !full_name) {
      return res.status(400).json({ error: 'auth0_id, email, and full_name are required' });
    }

    let user = await prisma.user.findUnique({ where: { auth0_id } });
    const isNew = !user;

    user = await prisma.user.upsert({
      where: { auth0_id },
      update: { email, full_name },
      create: { auth0_id, email, full_name, role: 'INDIVIDUAL' },
    });

    if (isNew) {
      await sendWelcomeEmail(user);
      await log(user.id, 'USER_CREATED', 'User', user.id);
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
const profileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(/^\+?[\d\s\-().]{7,20}$/).allow('', null),
});

router.put('/profile', requireAuth, validate(profileSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/onboarding — mark onboarding complete
router.put('/onboarding', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { onboarding_completed: true },
    });
    await sendOnboardingCompleteEmail(user);
    await log(user.id, 'ONBOARDING_COMPLETED', 'User', user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
