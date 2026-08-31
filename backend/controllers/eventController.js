import { Event, Guest, Attendance, User, AgentEvent } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['eventDate', 'DESC'], ['id', 'DESC']],
      include: [
        {
          model: User,
          as: 'assignedAgents',
          attributes: ['id', 'fullName', 'username'],
          through: { attributes: [] }
        }
      ]
    });

    // Attach basic counters to each event
    const eventsWithStats = await Promise.all(
      events.map(async (evt) => {
        const totalGuests = await Guest.count({ where: { eventId: evt.id } });
        const presentCount = await Attendance.count({ where: { eventId: evt.id } });
        return {
          ...evt.toJSON(),
          totalGuests,
          presentCount,
          absentCount: totalGuests - presentCount,
          presenceRate: totalGuests > 0 ? ((presentCount / totalGuests) * 100).toFixed(1) : 0
        };
      })
    );

    res.json({ events: eventsWithStats });
  } catch (error) {
    console.error('Erreur getEvents:', error);
    res.status(500).json({ error: 'Impossible de récupérer les événements.' });
  }
};

export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findOne({
      where: isNaN(id) ? { refId: id } : { id },
      include: [
        {
          model: User,
          as: 'assignedAgents',
          attributes: ['id', 'fullName', 'username', 'email'],
          through: { attributes: ['assignedAt'] }
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    const totalGuests = await Guest.count({ where: { eventId: event.id } });
    const presentCount = await Attendance.count({ where: { eventId: event.id } });

    res.json({
      event: {
        ...event.toJSON(),
        totalGuests,
        presentCount,
        absentCount: totalGuests - presentCount,
        presenceRate: totalGuests > 0 ? ((presentCount / totalGuests) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Erreur getEventById:', error);
    res.status(500).json({ error: 'Impossible de récupérer l\'événement.' });
  }
};

export const createEvent = async (req, res) => {
  const {
    name,
    description,
    eventDate,
    startTime = '09:00',
    endTime = '18:00',
    location,
    address,
    wilaya,
    organizer,
    logo,
    status = 'EN_COURS'
  } = req.body;

  if (!name || !eventDate) {
    return res.status(400).json({ error: 'Le nom et la date de l\'événement sont obligatoires.' });
  }

  try {
    const year = new Date(eventDate).getFullYear() || new Date().getFullYear();
    const count = await Event.count();
    const sequence = String(count + 1).padStart(4, '0');
    const refId = `EVT-${year}-${sequence}`;

    const event = await Event.create({
      refId,
      name,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      address,
      wilaya,
      organizer,
      logo,
      status
    });

    await logAudit({
      userId: req.user.id,
      action: 'CREATE_EVENT',
      resource: 'EVENT',
      resourceId: event.id,
      details: `Création de l'événement ${event.name} (${event.refId})`,
      req
    });

    res.status(201).json({ message: 'Événement créé avec succès.', event });
  } catch (error) {
    console.error('Erreur createEvent:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement.' });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    const fields = [
      'name', 'description', 'eventDate', 'startTime', 'endTime',
      'location', 'address', 'wilaya', 'organizer', 'logo', 'status'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    await logAudit({
      userId: req.user.id,
      action: 'UPDATE_EVENT',
      resource: 'EVENT',
      resourceId: event.id,
      details: `Mise à jour de l'événement ${event.name}`,
      req
    });

    res.json({ message: 'Événement mis à jour avec succès.', event });
  } catch (error) {
    console.error('Erreur updateEvent:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement.' });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    await event.destroy();

    await logAudit({
      userId: req.user.id,
      action: 'DELETE_EVENT',
      resource: 'EVENT',
      resourceId: id,
      details: `Suppression de l'événement ${event.name}`,
      req
    });

    res.json({ message: 'Événement supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteEvent:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement.' });
  }
};
