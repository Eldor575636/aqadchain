const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generate a sequential contract number: AQD-000001
 * Uses a DB count to derive the next number — safe for moderate concurrency.
 */
async function generateContractNumber() {
  const count = await prisma.contract.count();
  const num = String(count + 1).padStart(6, '0');
  return `AQD-${num}`;
}

module.exports = { generateContractNumber };
