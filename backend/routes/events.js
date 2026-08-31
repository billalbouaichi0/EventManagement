import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { authenticateToken, isAdmin, isAgentOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, isAgentOrAdmin, getEvents);
router.get('/:id', authenticateToken, isAgentOrAdmin, getEventById);
router.post('/', authenticateToken, isAdmin, createEvent);
router.put('/:id', authenticateToken, isAdmin, updateEvent);
router.delete('/:id', authenticateToken, isAdmin, deleteEvent);

export default router;
