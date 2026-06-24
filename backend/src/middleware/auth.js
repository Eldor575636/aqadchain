const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Verify Auth0 JWT token
const verifyToken = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// Attach full user record from DB to req.user
const attachUser = async (req, res, next) => {
  try {
    if (!req.auth?.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { auth0_id: req.auth.sub },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found. Please complete registration.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Combined middleware: verify JWT then attach DB user
const requireAuth = [verifyToken, attachUser];

// Require onboarding to be completed
const requireOnboarding = (req, res, next) => {
  if (!req.user.onboarding_completed) {
    return res.status(403).json({ error: 'Please complete onboarding first.' });
  }
  next();
};

module.exports = { verifyToken, attachUser, requireAuth, requireOnboarding };
