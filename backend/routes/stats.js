import express from 'express';
import {
  getEventStats,
  exportGuestsExcel,
  getAuditLogs
} from '../controllers/statsController.js';
import { authenticateToken, isAgentOrAdmin, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/event/:eventId', authenticateToken, isAgentOrAdmin, getEventStats);
router.get('/export-excel/:eventId', authenticateToken, isAgentOrAdmin, exportGuestsExcel);
router.get('/audit-logs', authenticateToken, isAdmin, getAuditLogs);

export default router;
