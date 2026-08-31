import express from 'express';
import multer from 'multer';
import {
  getGuests,
  getGuestByRefId,
  searchGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  analyzeCSV,
  confirmImport
} from '../controllers/guestController.js';
import { authenticateToken, isAgentOrAdmin, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticateToken, isAgentOrAdmin, getGuests);
router.get('/search', authenticateToken, isAgentOrAdmin, searchGuests);
router.get('/:refId', authenticateToken, isAgentOrAdmin, getGuestByRefId);
router.post('/', authenticateToken, isAgentOrAdmin, createGuest);
router.put('/:id', authenticateToken, isAgentOrAdmin, updateGuest);
router.delete('/:id', authenticateToken, isAdmin, deleteGuest);

// CSV Import endpoints
router.post('/upload-csv', authenticateToken, isAdmin, upload.single('file'), analyzeCSV);
router.post('/confirm-import', authenticateToken, isAdmin, confirmImport);

export default router;
