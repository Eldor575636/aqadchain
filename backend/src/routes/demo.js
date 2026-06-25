const router = require('express').Router();
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { validate } = require('../middleware/validate');
const { sendDemoRequestConfirmation, sendDemoRequestNotification } = require('../services/email');
const { createMeetEvent } = require('../services/googleCalendar');

const prisma = new PrismaClient();

const createSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).allow('', null),
  company: Joi.string().max(100).allow('', null),
  preferred_date: Joi.date().min('now').required(),
  preferred_time: Joi.string().required(),
  message: Joi.string().max(1000).allow('', null),
});

// POST /api/demo-requests — public lead capture for booking a live demo
router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    let request = await prisma.demoRequest.create({ data: req.body });

    const meetEvent = await createMeetEvent(request);
    if (meetEvent) {
      request = await prisma.demoRequest.update({
        where: { id: request.id },
        data: { meet_link: meetEvent.meetLink, calendar_event_id: meetEvent.eventId },
      });
    }

    await Promise.all([
      sendDemoRequestConfirmation(request),
      sendDemoRequestNotification(request),
    ]);
    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
