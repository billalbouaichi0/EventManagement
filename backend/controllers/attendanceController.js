import { Attendance, Guest, Event, User, sequelize } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

export const recordAttendance = async (req, res) => {
  const {
    eventId,
    guestId,
    workstation,
    attendanceType = 'SELF',
    representativeLastName,
    representativeFirstName,
    representativeNIN,
    representativePosition,
    representativeNotes
  } = req.body;

  if (!eventId || !guestId) {
    return res.status(400).json({ error: 'eventId et guestId sont obligatoires.' });
  }

  const t = await sequelize.transaction();

  try {
    const existing = await Attendance.findOne({
      where: { eventId, guestId },
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'fullName', 'username']
        }
      ],
      transaction: t
    });

    if (existing) {
      await t.rollback();
      return res.status(409).json({
        error: 'Cet invité est déjà marqué présent !',
        alreadyCheckedIn: true,
        attendance: existing,
        checkedInAt: existing.checkedInAt,
        checkedInBy: existing.agent ? existing.agent.fullName : 'Agent',
        workstation: existing.workstation,
        attendanceType: existing.attendanceType,
        representativeLastName: existing.representativeLastName,
        representativeFirstName: existing.representativeFirstName,
        representativeNIN: existing.representativeNIN,
        representativePosition: existing.representativePosition
      });
    }

    const guest = await Guest.findOne({
      where: { id: guestId, eventId },
      transaction: t
    });

    if (!guest) {
      await t.rollback();
      return res.status(404).json({ error: 'Invité introuvable pour cet événement.' });
    }

    const ws = workstation || req.headers['x-workstation'] || 'Poste Accueil';
    const isProxy = attendanceType === 'PROXY';
    const repLastName = isProxy ? (representativeLastName ? String(representativeLastName).trim() : '') : null;
    const repFirstName = isProxy ? (representativeFirstName ? String(representativeFirstName).trim() : '') : null;
    const repNIN = isProxy ? (representativeNIN ? String(representativeNIN).trim() : '') : null;
    const repPosition = isProxy ? (representativePosition ? String(representativePosition).trim() : '') : null;
    const repNotes = isProxy ? (representativeNotes ? String(representativeNotes).trim() : '') : null;

    const attendance = await Attendance.create({
      eventId,
      guestId,
      status: 'PRESENT',
      attendanceType: isProxy ? 'PROXY' : 'SELF',
      representativeLastName: repLastName,
      representativeFirstName: repFirstName,
      representativeNIN: repNIN,
      representativePosition: repPosition,
      representativeNotes: repNotes,
      checkedInAt: new Date(),
      checkedInBy: req.user.id,
      workstation: ws
    }, { transaction: t });

    await t.commit();

    const auditDetails = isProxy
      ? `Émargement par Mandataire/Représentant (${repLastName} ${repFirstName || ''} - ${repPosition || 'Mandataire'}) pour ${guest.lastNameOrCompany} ${guest.firstName || ''} (${guest.refId})`
      : `Émargement direct de ${guest.lastNameOrCompany} ${guest.firstName || ''} (${guest.refId})`;

    await logAudit({
      userId: req.user.id,
      action: 'CHECK_IN',
      resource: 'GUEST',
      resourceId: guest.id,
      details: auditDetails,
      workstation: ws,
      req
    });

    // Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('guest:checked-in', {
        eventId,
        guestId: guest.id,
        guest: {
          ...guest.toJSON(),
          attendance: {
            ...attendance.toJSON(),
            agent: { id: req.user.id, fullName: req.user.fullName }
          }
        },
        checkedInAt: attendance.checkedInAt,
        agentName: req.user.fullName,
        workstation: ws
      });

      io.emit('stats:refresh', { eventId });
    }

    res.status(201).json({
      message: 'Présence enregistrée avec succès.',
      attendance: {
        ...attendance.toJSON(),
        agent: { id: req.user.id, fullName: req.user.fullName }
      },
      guest
    });
  } catch (error) {
    await t.rollback();
    console.error('Erreur recordAttendance:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la présence.' });
  }
};

export const cancelAttendance = async (req, res) => {
  const { eventId, guestId } = req.body;

  if (!eventId || !guestId) {
    return res.status(400).json({ error: 'eventId et guestId sont obligatoires.' });
  }

  try {
    const attendance = await Attendance.findOne({
      where: { eventId, guestId },
      include: [{ model: Guest, as: 'guest' }]
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Aucun enregistrement de présence trouvé pour cet invité.' });
    }

    const guestName = attendance.guest?.lastNameOrCompany || 'Invité';
    await attendance.destroy();

    await logAudit({
      userId: req.user.id,
      action: 'CANCEL_CHECK_IN',
      resource: 'GUEST',
      resourceId: guestId,
      details: `Annulation de la présence de ${guestName}`,
      req
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('guest:check-in-cancelled', {
        eventId,
        guestId,
        cancelledBy: req.user.fullName
      });
      io.emit('stats:refresh', { eventId });
    }

    res.json({ message: 'Émargement annulé avec succès.' });
  } catch (error) {
    console.error('Erreur cancelAttendance:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de l\'émargement.' });
  }
};

export const getEventAttendances = async (req, res) => {
  const { eventId, page = 1, limit = 50 } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId est obligatoire.' });
  }

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Attendance.findAndCountAll({
      where: { eventId },
      include: [
        {
          model: Guest,
          as: 'guest'
        },
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'fullName', 'username']
        }
      ],
      order: [['checkedInAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      attendances: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Erreur getEventAttendances:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des émargements.' });
  }
};
