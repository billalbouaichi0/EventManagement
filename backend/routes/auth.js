import express from 'express';
import {
  login,
  getMe,
  getAgents,
  createAgent,
  updateAgentStatus,
  deleteAgent,
  assignAgentToEvent,
  removeAgentFromEvent
} from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// Agent management (ADMIN only)
router.get('/agents', authenticateToken, isAdmin, getAgents);
router.post('/agents', authenticateToken, isAdmin, createAgent);
router.put('/agents/:id', authenticateToken, isAdmin, updateAgentStatus);
router.delete('/agents/:id', authenticateToken, isAdmin, deleteAgent);

// Event assignment
router.post('/assign-agent', authenticateToken, isAdmin, assignAgentToEvent);
router.post('/unassign-agent', authenticateToken, isAdmin, removeAgentFromEvent);

export default router;
