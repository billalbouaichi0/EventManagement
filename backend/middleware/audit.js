import { AuditLog } from '../models/index.js';

export async function logAudit({ userId, action, resource, resourceId, details, workstation, ipAddress, req }) {
  try {
    const ip = ipAddress || (req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip) : '127.0.0.1');
    const ws = workstation || (req?.headers['x-workstation'] || 'Poste Standard');

    await AuditLog.create({
      userId: userId || req?.user?.id,
      action,
      resource,
      resourceId: String(resourceId || ''),
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      workstation: ws,
      ipAddress: ip
    });
  } catch (err) {
    console.error('Erreur enregistrement AuditLog:', err);
  }
}
