const router = require('express').Router();
const Joi = require('joi');
const { validate } = require('../middleware/validate');
const { calculate, calculateIjarah } = require('../services/calculator');

const calcSchema = Joi.object({
  contract_type: Joi.string().valid('MURABAHA', 'MUSAWAMA', 'IJARAH').default('MURABAHA'),
  car_price: Joi.number().positive().required(),
  down_payment: Joi.number().min(0).default(0),
  markup_percentage: Joi.number().min(0).max(25).when('contract_type', { is: 'IJARAH', then: Joi.optional(), otherwise: Joi.required() }),
  apr: Joi.number().min(0).max(30).when('contract_type', { is: 'IJARAH', then: Joi.optional(), otherwise: Joi.required() }),
  term_months: Joi.number().valid(6, 12, 18, 24, 36, 48, 60).required(),
  payment_frequency: Joi.string().valid('WEEKLY', 'MONTHLY').default('MONTHLY'),
  payment_start_date: Joi.date().allow(null),
  // Ijarah-specific
  security_deposit: Joi.number().min(0).allow(null),
  residual_value: Joi.number().min(0).allow(null),
});

// POST /api/calculator
router.post('/', validate(calcSchema), (req, res, next) => {
  try {
    const result = req.body.contract_type === 'IJARAH'
      ? calculateIjarah(req.body)
      : calculate(req.body);
    res.json(result);
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

module.exports = router;
