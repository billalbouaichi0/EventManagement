import express from 'express';
import {
  recordAttendance,
  cancelAttendance,
  getEventAttendances
} from '../controllers/attendanceController.js';
import { authenticateToken, isAgentOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, isAgentOrAdmin, getEventAttendances);
router.post('/check-in', authenticateToken, isAgentOrAdmin, recordAttendance);
router.post('/cancel', authenticateToken, isAgentOrAdmin, cancelAttendance);

export default router;
