const Joi = require('joi');

// Wraps a Joi schema and validates req.body, returning 400 on failure
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};

// Validate query params
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: error.details.map((d) => d.message),
    });
  }
  req.query = value;
  next();
};

module.exports = { validate, validateQuery };
