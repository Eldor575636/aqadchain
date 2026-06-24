const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function log(userId, action, entityType, entityId, metadata = {}) {
  try {
    await prisma.auditLog.create({
      data: { user_id: userId, action, entity_type: entityType, entity_id: entityId, metadata },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write:', err.message);
  }
}

module.exports = { log };
