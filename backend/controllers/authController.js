import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AgentEvent, Event } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_event_app_2026_nvoti';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Votre compte est inactif. Contactez un administrateur.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      resource: 'USER',
      resourceId: user.id,
      details: `Connexion réussie (${user.role})`,
      req
    });

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la connexion.' });
  }
};

export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status
    }
  });
};

export const getAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      attributes: ['id', 'fullName', 'username', 'email', 'role', 'status', 'createdAt'],
      include: [
        {
          model: Event,
          as: 'assignedEvents',
          attributes: ['id', 'refId', 'name', 'status'],
          through: { attributes: ['assignedAt'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ agents });
  } catch (error) {
    console.error('Erreur getAgents:', error);
    res.status(500).json({ error: 'Impossible de récupérer la liste des agents.' });
  }
};

export const createAgent = async (req, res) => {
  const { fullName, username, email, password, role = 'AGENT' } = req.body;

  if (!fullName || !username || !password) {
    return res.status(400).json({ error: 'Nom complet, nom d\'utilisateur et mot de passe requis.' });
  }

  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      username,
      email: email || null,
      password: hashedPassword,
      role: role === 'ADMIN' ? 'ADMIN' : 'AGENT',
      status: 'ACTIVE'
    });

    await logAudit({
      userId: req.user.id,
      action: 'CREATE_USER',
      resource: 'USER',
      resourceId: user.id,
      details: `Création du compte ${user.username} (${user.role})`,
      req
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Erreur createAgent:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
  }
};

export const updateAgentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, role, fullName, email, password } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    if (status) user.status = status;
    if (role) user.role = role;
    if (fullName) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    await logAudit({
      userId: req.user.id,
      action: 'UPDATE_USER',
      resource: 'USER',
      resourceId: user.id,
      details: `Mise à jour du compte ${user.username}`,
      req
    });

    res.json({ message: 'Utilisateur mis à jour avec succès.', user });
  } catch (error) {
    console.error('Erreur updateAgentStatus:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur.' });
  }
};

export const deleteAgent = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    await user.destroy();

    await logAudit({
      userId: req.user.id,
      action: 'DELETE_USER',
      resource: 'USER',
      resourceId: id,
      details: `Suppression du compte ${user.username}`,
      req
    });

    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteAgent:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur.' });
  }
};

export const assignAgentToEvent = async (req, res) => {
  const { userId, eventId } = req.body;
  try {
    const [assignment, created] = await AgentEvent.findOrCreate({
      where: { userId, eventId }
    });

    await logAudit({
      userId: req.user.id,
      action: 'ASSIGN_AGENT',
      resource: 'EVENT',
      resourceId: eventId,
      details: `Assignation de l'agent #${userId} à l'événement #${eventId}`,
      req
    });

    res.json({ message: 'Agent assigné avec succès.', assignment, created });
  } catch (error) {
    console.error('Erreur assignAgentToEvent:', error);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de l\'agent.' });
  }
};

export const removeAgentFromEvent = async (req, res) => {
  const { userId, eventId } = req.body;
  try {
    await AgentEvent.destroy({
      where: { userId, eventId }
    });

    await logAudit({
      userId: req.user.id,
      action: 'UNASSIGN_AGENT',
      resource: 'EVENT',
      resourceId: eventId,
      details: `Désassignation de l'agent #${userId} de l'événement #${eventId}`,
      req
    });

    res.json({ message: 'Agent retiré de l\'événement avec succès.' });
  } catch (error) {
    console.error('Erreur removeAgentFromEvent:', error);
    res.status(500).json({ error: 'Erreur lors du retrait de l\'agent.' });
  }
};
