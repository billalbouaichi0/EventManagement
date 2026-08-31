import { BadgePrint, Guest, Event, User } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

export const recordBadgePrint = async (req, res) => {
  const { eventId, guestId, printerName } = req.body;

  if (!eventId || !guestId) {
    return res.status(400).json({ error: 'eventId et guestId sont obligatoires.' });
  }

  try {
    const guest = await Guest.findOne({ where: { id: guestId, eventId } });
    if (!guest) {
      return res.status(404).json({ error: 'Invité introuvable.' });
    }

    const previousPrintsCount = await BadgePrint.count({ where: { eventId, guestId } });
    const printNumber = previousPrintsCount + 1;

    const badgePrint = await BadgePrint.create({
      eventId,
      guestId,
      printedBy: req.user.id,
      printNumber,
      printerName: printerName || 'Imprimante Badgeuse Standard',
      printedAt: new Date()
    });

    await logAudit({
      userId: req.user.id,
      action: 'PRINT_BADGE',
      resource: 'BADGE',
      resourceId: guest.id,
      details: `Impression badge #${printNumber} pour ${guest.lastNameOrCompany} (${guest.refId})`,
      workstation: req.headers['x-workstation'] || 'Poste Badge',
      req
    });

    // Notify agents via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('badge:printed', {
        eventId,
        guestId,
        printNumber,
        agentName: req.user.fullName
      });
      io.emit('stats:refresh', { eventId });
    }

    res.status(201).json({
      message: 'Impression du badge enregistrée.',
      badgePrint,
      totalPrints: printNumber
    });
  } catch (error) {
    console.error('Erreur recordBadgePrint:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'impression du badge.' });
  }
};

export const getBadgePrintHistory = async (req, res) => {
  const { eventId, guestId } = req.query;

  try {
    const where = {};
    if (eventId) where.eventId = eventId;
    if (guestId) where.guestId = guestId;

    const prints = await BadgePrint.findAll({
      where,
      include: [
        { model: Guest, as: 'guest' },
        { model: User, as: 'agent', attributes: ['id', 'fullName', 'username'] }
      ],
      order: [['printedAt', 'DESC']],
      limit: 100
    });

    res.json({ prints });
  } catch (error) {
    console.error('Erreur getBadgePrintHistory:', error);
    res.status(500).json({ error: 'Impossible de récupérer l\'historique d\'impression.' });
  }
};
