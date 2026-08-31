import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_event_app_2026_nvoti';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Jeton d\'authentification manquant.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Compte utilisateur inactif ou introuvable.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Jeton d\'authentification invalide ou expiré.' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
};

export const isAgentOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'AGENT')) {
    next();
  } else {
    res.status(403).json({ error: 'Accès non autorisé.' });
  }
};
