import express from 'express';
import {
  recordBadgePrint,
  getBadgePrintHistory
} from '../controllers/badgeController.js';
import { authenticateToken, isAgentOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/history', authenticateToken, isAgentOrAdmin, getBadgePrintHistory);
router.post('/print', authenticateToken, isAgentOrAdmin, recordBadgePrint);

export default router;
