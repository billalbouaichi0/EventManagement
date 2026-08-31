import { Guest, Attendance, Event, User, BadgePrint, AuditLog, sequelize } from '../models/index.js';
import ExcelJS from 'exceljs';

export const getEventStats = async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId est obligatoire.' });
  }

  try {
    const totalGuests = await Guest.count({ where: { eventId } });
    const presentCount = await Attendance.count({ where: { eventId } });
    const absentCount = Math.max(0, totalGuests - presentCount);
    const presenceRate = totalGuests > 0 ? parseFloat(((presentCount / totalGuests) * 100).toFixed(1)) : 0;
    const walkInCount = await Guest.count({ where: { eventId, guestType: 'WALK_IN' } });
    const totalBadgePrints = await BadgePrint.count({ where: { eventId } });

    // Hourly arrivals
    const attendances = await Attendance.findAll({
      where: { eventId },
      attributes: ['checkedInAt'],
      order: [['checkedInAt', 'ASC']]
    });

    const hourlyMap = {};
    attendances.forEach(att => {
      if (att.checkedInAt) {
        const hour = new Date(att.checkedInAt).getHours();
        const label = `${String(hour).padStart(2, '0')}:00`;
        hourlyMap[label] = (hourlyMap[label] || 0) + 1;
      }
    });

    const hourlyArrivals = Object.keys(hourlyMap).map(hour => ({
      hour,
      count: hourlyMap[hour]
    }));

    // Wilaya Distribution
    const wilayaCounts = await Guest.findAll({
      where: { eventId },
      attributes: ['wilaya', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['wilaya'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    const wilayaDistribution = wilayaCounts
      .filter(w => w.wilaya)
      .map(w => ({
        wilaya: w.wilaya,
        count: parseInt(w.get('count'), 10)
      }));

    // Bank Distribution
    const bankCounts = await Guest.findAll({
      where: { eventId },
      attributes: ['bank', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['bank'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 8
    });

    const bankDistribution = bankCounts
      .filter(b => b.bank)
      .map(b => ({
        bank: b.bank,
        count: parseInt(b.get('count'), 10)
      }));

    // Agent Leaderboard
    const agentActivity = await Attendance.findAll({
      where: { eventId },
      attributes: ['checkedInBy', [sequelize.fn('COUNT', sequelize.col('Attendance.id')), 'checkInCount']],
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'fullName', 'username']
        }
      ],
      group: ['checkedInBy', 'agent.id', 'agent.fullName', 'agent.username'],
      order: [[sequelize.literal('checkInCount'), 'DESC']]
    });

    const agentLeaderboard = agentActivity.map(item => ({
      agentId: item.checkedInBy,
      agentName: item.agent ? item.agent.fullName : 'Agent Inconnu',
      username: item.agent ? item.agent.username : '',
      checkInCount: parseInt(item.get('checkInCount'), 10)
    }));

    res.json({
      stats: {
        totalGuests,
        presentCount,
        absentCount,
        presenceRate,
        walkInCount,
        totalBadgePrints,
        hourlyArrivals,
        wilayaDistribution,
        bankDistribution,
        agentLeaderboard
      }
    });
  } catch (error) {
    console.error('Erreur getEventStats:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des statistiques.' });
  }
};

export const exportGuestsExcel = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    const guests = await Guest.findAll({
      where: { eventId },
      include: [
        {
          model: Attendance,
          as: 'attendance',
          include: [{ model: User, as: 'agent', attributes: ['fullName'] }]
        }
      ],
      order: [['id', 'ASC']]
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NVOTI Event Platform';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Liste des Invités');

    worksheet.columns = [
      { header: 'N° Réf', key: 'refId', width: 16 },
      { header: 'Nom / Raison Sociale', key: 'lastNameOrCompany', width: 30 },
      { header: 'Prénom', key: 'firstName', width: 20 },
      { header: 'Nombre d\'actions', key: 'numberOfShares', width: 18 },
      { header: 'Date Naissance', key: 'birthDate', width: 16 },
      { header: 'Adresse', key: 'address', width: 30 },
      { header: 'Wilaya', key: 'wilaya', width: 18 },
      { header: 'NIN', key: 'nationalIdentificationNumber', width: 22 },
      { header: 'RC / N° Agrément', key: 'registrationNumber', width: 20 },
      { header: 'Date délivrance RC', key: 'registrationIssueDate', width: 18 },
      { header: 'NIF', key: 'taxIdentificationNumber', width: 20 },
      { header: 'Banque', key: 'bank', width: 18 },
      { header: 'Type Invité', key: 'guestType', width: 15 },
      { header: 'Statut Présence', key: 'presenceStatus', width: 16 },
      { header: 'Heure Émargement', key: 'checkedInAt', width: 22 },
      { header: 'Agent Émargement', key: 'agentName', width: 22 },
      { header: 'Poste', key: 'workstation', width: 18 }
    ];

    // Styling Header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2596BE' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    guests.forEach((g) => {
      const isPresent = !!g.attendance;
      worksheet.addRow({
        refId: g.refId,
        lastNameOrCompany: g.lastNameOrCompany,
        firstName: g.firstName || '',
        numberOfShares: g.numberOfShares,
        birthDate: g.birthDate || '',
        address: g.address || '',
        wilaya: g.wilaya || '',
        nationalIdentificationNumber: g.nationalIdentificationNumber || '',
        registrationNumber: g.registrationNumber || '',
        registrationIssueDate: g.registrationIssueDate || '',
        taxIdentificationNumber: g.taxIdentificationNumber || '',
        bank: g.bank || '',
        guestType: g.guestType,
        presenceStatus: isPresent ? 'PRÉSENT' : 'ABSENT',
        checkedInAt: isPresent && g.attendance.checkedInAt ? new Date(g.attendance.checkedInAt).toLocaleString('fr-FR') : '-',
        agentName: isPresent && g.attendance.agent ? g.attendance.agent.fullName : '-',
        workstation: isPresent && g.attendance.workstation ? g.attendance.workstation : '-'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=invites_${event.refId}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur exportGuestsExcel:', error);
    res.status(500).json({ error: 'Erreur lors de l\'exportation Excel.' });
  }
};

export const getAuditLogs = async (req, res) => {
  const { page = 1, limit = 50, action, resource } = req.query;

  try {
    const where = {};
    if (action) where.action = action;
    if (resource) where.resource = resource;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'username', 'role'] }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      logs: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Erreur getAuditLogs:', error);
    res.status(500).json({ error: 'Impossible de récupérer les logs d\'audit.' });
  }
};
