import { Op } from 'sequelize';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { Guest, Attendance, Event, CsvImport, User, BadgePrint, sequelize } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

// Normalisation string generator for high-speed multi-field search
export const normalizeString = (str) => {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
};

export const getSearchNormalized = (data) => {
  const parts = [
    data.lastNameOrCompany,
    data.firstName,
    data.refId,
    data.nationalIdentificationNumber,
    data.registrationNumber,
    data.taxIdentificationNumber,
    data.bank,
    data.wilaya,
    data.guestType
  ].filter(Boolean);

  const rawJoined = parts.join(' ');
  const normalized = normalizeString(rawJoined);
  const withoutSpaces = normalized.replace(/\s+/g, '');
  return `${normalized} | ${withoutSpaces}`;
};

export const getGuests = async (req, res) => {
  const {
    eventId,
    search,
    status, // 'PRESENT', 'ABSENT'
    guestType,
    source,
    wilaya,
    bank,
    page = 1,
    limit = 20,
    sortBy = 'id',
    sortOrder = 'ASC'
  } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId est obligatoire.' });
  }

  try {
    const where = { eventId };

    if (guestType) where.guestType = guestType;
    if (source) where.source = source;
    if (wilaya) where.wilaya = wilaya;
    if (bank) where.bank = bank;

    if (search) {
      const searchTerms = normalizeString(search).split(/\s+/).filter(Boolean);
      where[Op.and] = searchTerms.map(term => ({
        searchNormalized: { [Op.like]: `%${term}%` }
      }));
    }

    const attendanceInclude = {
      model: Attendance,
      as: 'attendance',
      required: status === 'PRESENT',
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'fullName', 'username']
        }
      ]
    };

    if (status === 'ABSENT') {
      where['$attendance.id$'] = null;
      attendanceInclude.required = false;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Guest.findAndCountAll({
      where,
      include: [attendanceInclude],
      distinct: true,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      guests: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Erreur getGuests:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des invités.' });
  }
};

export const getGuestByRefId = async (req, res) => {
  const { refId } = req.params;
  try {
    const guest = await Guest.findOne({
      where: isNaN(refId) ? { refId } : { [Op.or]: [{ refId }, { id: refId }] },
      include: [
        {
          model: Attendance,
          as: 'attendance',
          include: [{ model: User, as: 'agent', attributes: ['id', 'fullName'] }]
        },
        {
          model: BadgePrint,
          as: 'badgePrints',
          include: [{ model: User, as: 'agent', attributes: ['id', 'fullName'] }]
        },
        {
          model: Event,
          as: 'event'
        }
      ]
    });

    if (!guest) {
      return res.status(404).json({ error: 'Invité introuvable.' });
    }

    res.json({ guest });
  } catch (error) {
    console.error('Erreur getGuestByRefId:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'invité.' });
  }
};

export const searchGuests = async (req, res) => {
  const { q, eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId est obligatoire.' });
  }

  try {
    const where = { eventId };

    if (q && q.trim()) {
      const searchTerms = normalizeString(q).split(/\s+/).filter(Boolean);
      where[Op.and] = searchTerms.map(term => ({
        searchNormalized: { [Op.like]: `%${term}%` }
      }));
    }

    const guests = await Guest.findAll({
      where,
      include: [
        {
          model: Attendance,
          as: 'attendance',
          include: [{ model: User, as: 'agent', attributes: ['id', 'fullName'] }]
        }
      ],
      limit: 30,
      order: [['id', 'ASC']]
    });

    res.json({ guests });
  } catch (error) {
    console.error('Erreur searchGuests:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche des invités.' });
  }
};

export const createGuest = async (req, res) => {
  const {
    eventId,
    lastNameOrCompany,
    firstName,
    numberOfShares = 0,
    birthDate,
    address,
    wilaya,
    nationalIdentificationNumber,
    registrationNumber,
    registrationIssueDate,
    taxIdentificationNumber,
    bank,
    guestType = 'WALK_IN',
    source = 'MANUAL',
    autoCheckIn = false,
    workstation
  } = req.body;

  if (!eventId || !lastNameOrCompany) {
    return res.status(400).json({ error: 'eventId et le Nom/Raison sociale sont obligatoires.' });
  }

  const t = await sequelize.transaction();

  try {
    const event = await Event.findByPk(eventId, { transaction: t });
    if (!event) {
      await t.rollback();
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    // 1. Strict duplicate validation in the same event
    const trimmedLast = String(lastNameOrCompany).trim();
    const trimmedFirst = firstName ? String(firstName).trim() : '';
    const trimmedNIN = nationalIdentificationNumber ? String(nationalIdentificationNumber).trim() : '';
    const trimmedRC = registrationNumber ? String(registrationNumber).trim() : '';

    const duplicateConditions = [
      {
        lastNameOrCompany: trimmedLast,
        firstName: trimmedFirst
      }
    ];

    if (trimmedNIN) {
      duplicateConditions.push({ nationalIdentificationNumber: trimmedNIN });
    }
    if (trimmedRC) {
      duplicateConditions.push({ registrationNumber: trimmedRC });
    }

    const existingGuest = await Guest.findOne({
      where: {
        eventId: parseInt(eventId, 10),
        [Op.or]: duplicateConditions
      },
      transaction: t
    });

    if (existingGuest) {
      await t.rollback();
      let errorMsg = `Cet invité (${trimmedLast} ${trimmedFirst}) est déjà enregistré dans cet événement (Réf: ${existingGuest.refId}).`;
      if (trimmedNIN && existingGuest.nationalIdentificationNumber === trimmedNIN) {
        errorMsg = `Un invité avec ce Numéro d'Identification National (${trimmedNIN}) est déjà enregistré dans cet événement (${existingGuest.lastNameOrCompany} - ${existingGuest.refId}).`;
      } else if (trimmedRC && existingGuest.registrationNumber === trimmedRC) {
        errorMsg = `Un invité avec ce Registre de Commerce (${trimmedRC}) est déjà enregistré dans cet événement (${existingGuest.lastNameOrCompany} - ${existingGuest.refId}).`;
      }
      return res.status(409).json({ error: errorMsg, duplicateGuest: existingGuest });
    }

    // 2. Generate unique global refId
    const maxGuest = await Guest.findOne({ order: [['id', 'DESC']], transaction: t });
    const nextSeq = (maxGuest?.id || 0) + 1;
    const sequence = String(nextSeq).padStart(6, '0');
    const refId = `INV-${sequence}`;

    const searchNormalized = getSearchNormalized({
      lastNameOrCompany: trimmedLast,
      firstName: trimmedFirst,
      refId,
      nationalIdentificationNumber: trimmedNIN,
      registrationNumber: trimmedRC,
      taxIdentificationNumber,
      bank,
      wilaya,
      guestType
    });

    const guest = await Guest.create({
      eventId: parseInt(eventId, 10),
      refId,
      importNumber: nextSeq,
      lastNameOrCompany: trimmedLast,
      firstName: trimmedFirst,
      numberOfShares: parseInt(numberOfShares) || 0,
      birthDate,
      address,
      wilaya,
      nationalIdentificationNumber: trimmedNIN,
      registrationNumber: trimmedRC,
      registrationIssueDate,
      taxIdentificationNumber,
      bank,
      guestType,
      source,
      searchNormalized
    }, { transaction: t });

    let attendance = null;
    if (autoCheckIn) {
      attendance = await Attendance.create({
        eventId: parseInt(eventId, 10),
        guestId: guest.id,
        status: 'PRESENT',
        checkedInAt: new Date(),
        checkedInBy: req.user.id,
        workstation: workstation || req.headers['x-workstation'] || 'Poste Accueil'
      }, { transaction: t });
    }

    await t.commit();

    await logAudit({
      userId: req.user.id,
      action: 'CREATE_GUEST',
      resource: 'GUEST',
      resourceId: guest.id,
      details: `Ajout manuel de l'invité ${guest.lastNameOrCompany} (${guest.refId})`,
      req
    });

    // Notify real-time if check-in occurred
    if (autoCheckIn && req.app.get('io')) {
      req.app.get('io').emit('guest:checked-in', {
        eventId: parseInt(eventId, 10),
        guestId: guest.id,
        guest: { ...guest.toJSON(), attendance },
        agentName: req.user.fullName
      });
    }

    res.status(201).json({
      message: 'Invité créé avec succès.',
      guest: { ...guest.toJSON(), attendance }
    });
  } catch (error) {
    try {
      await t.rollback();
    } catch (rbErr) { }
    console.error('Erreur createGuest:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la création de l\'invité.' });
  }
};

export const updateGuest = async (req, res) => {
  const { id } = req.params;
  try {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ error: 'Invité introuvable.' });
    }

    // Check duplicate in same event if identifiers changed
    const targetLast = req.body.lastNameOrCompany !== undefined ? String(req.body.lastNameOrCompany).trim() : guest.lastNameOrCompany;
    const targetFirst = req.body.firstName !== undefined ? String(req.body.firstName).trim() : (guest.firstName || '');
    const targetNIN = req.body.nationalIdentificationNumber !== undefined ? String(req.body.nationalIdentificationNumber).trim() : (guest.nationalIdentificationNumber || '');
    const targetRC = req.body.registrationNumber !== undefined ? String(req.body.registrationNumber).trim() : (guest.registrationNumber || '');

    const duplicateConditions = [
      {
        lastNameOrCompany: targetLast,
        firstName: targetFirst
      }
    ];
    if (targetNIN) duplicateConditions.push({ nationalIdentificationNumber: targetNIN });
    if (targetRC) duplicateConditions.push({ registrationNumber: targetRC });

    const existingDuplicate = await Guest.findOne({
      where: {
        eventId: guest.eventId,
        id: { [Op.ne]: guest.id },
        [Op.or]: duplicateConditions
      }
    });

    if (existingDuplicate) {
      return res.status(409).json({
        error: `Impossible de modifier : un autre invité avec ces informations existe déjà dans cet événement (${existingDuplicate.lastNameOrCompany} ${existingDuplicate.firstName || ''} - Réf: ${existingDuplicate.refId}).`
      });
    }

    const updatableFields = [
      'lastNameOrCompany', 'firstName', 'numberOfShares', 'birthDate',
      'address', 'wilaya', 'nationalIdentificationNumber', 'registrationNumber',
      'registrationIssueDate', 'taxIdentificationNumber', 'bank', 'guestType'
    ];

    updatableFields.forEach(f => {
      if (req.body[f] !== undefined) guest[f] = req.body[f];
    });

    guest.searchNormalized = getSearchNormalized(guest);
    await guest.save();

    await logAudit({
      userId: req.user.id,
      action: 'UPDATE_GUEST',
      resource: 'GUEST',
      resourceId: guest.id,
      details: `Mise à jour de l'invité ${guest.lastNameOrCompany}`,
      req
    });

    res.json({ message: 'Invité mis à jour avec succès.', guest });
  } catch (error) {
    console.error('Erreur updateGuest:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la modification de l\'invité.' });
  }
};

export const deleteGuest = async (req, res) => {
  const { id } = req.params;
  try {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ error: 'Invité introuvable.' });
    }

    await guest.destroy();

    await logAudit({
      userId: req.user.id,
      action: 'DELETE_GUEST',
      resource: 'GUEST',
      resourceId: id,
      details: `Suppression de l'invité ${guest.lastNameOrCompany}`,
      req
    });

    res.json({ message: 'Invité supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteGuest:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'invité.' });
  }
};

// CSV Upload & Stateless Analysis (Phase 1)
export const analyzeCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier CSV fourni.' });
  }

  const results = [];
  const errors = [];
  const preview = [];
  let rowNumber = 1;

  // Convert buffer to string to detect separator and strip BOM
  const fileContent = req.file.buffer.toString('utf-8').replace(/^\uFEFF/, '');
  const firstLine = fileContent.split('\n')[0] || '';
  const separator = firstLine.includes(';') ? ';' : (firstLine.includes('\t') ? '\t' : ',');

  const bufferStream = new Readable();
  bufferStream.push(fileContent);
  bufferStream.push(null);

  bufferStream
    .pipe(csvParser({
      separator,
      mapHeaders: ({ header }) => header.trim().replace(/^["']|["']$/g, '')
    }))
    .on('data', (rawRow) => {
      rowNumber++;

      // Clean keys in row
      const row = {};
      Object.keys(rawRow).forEach(k => {
        row[k.trim()] = rawRow[k];
      });

      const rawImportNum = row['N°'] || row['N'] || row['Numero'] || '';
      const importNumber = rawImportNum ? parseInt(String(rawImportNum).replace(/[^0-9]/g, ''), 10) : null;

      const lastNameOrCompany = (row['Nom ou raison sociale'] || row['Nom'] || row['Raison Sociale'] || row['Raison sociale'] || '').trim();
      const firstName = (row['Prénom'] || row['Prenom'] || '').trim();

      const sharesRaw = row['Nombre d\'actions'] || row['Nombre d’actions'] || row['Actions'] || row['Nombre actions'] || '0';
      const numberOfShares = parseInt(String(sharesRaw).replace(/[^0-9]/g, ''), 10) || 0;

      const birthDate = (row['Date de naissance'] || row['Date naissance'] || '').trim();
      const address = (row['Adresse'] || '').trim();
      const wilaya = (row['Wilaya'] || '').trim();
      const nationalIdentificationNumber = (row['Numéro d\'Identification National'] || row['Numéro d’Identification National'] || row['NIN'] || '').trim();
      const registrationNumber = (row['RC/N° agrément'] || row['RC/N° agrement'] || row['RC'] || row['N° agrément'] || '').trim();
      const registrationIssueDate = (row['Date de délivrance RC'] || row['Date délivrance RC'] || '').trim();
      const taxIdentificationNumber = (row['Numéro d\'identification fiscal (NIF)'] || row['Numéro d’identification fiscal (NIF)'] || row['NIF'] || '').trim();
      const bank = (row['Banque'] || '').trim();

      if (!lastNameOrCompany) {
        const hasOtherData = Object.values(row).some(v => String(v).trim().length > 0);
        if (hasOtherData) {
          errors.push({
            line: rowNumber,
            error: 'Nom ou raison sociale manquant ou colonne non détectée',
            rawData: row,
            draft: {
              importNumber,
              lastNameOrCompany: '',
              firstName,
              numberOfShares,
              birthDate,
              address,
              wilaya,
              nationalIdentificationNumber,
              registrationNumber,
              registrationIssueDate,
              taxIdentificationNumber,
              bank,
              guestType: 'REGISTERED',
              source: 'CSV'
            }
          });
        }
        return;
      }

      const parsedGuest = {
        importNumber,
        lastNameOrCompany,
        firstName,
        numberOfShares,
        birthDate,
        address,
        wilaya,
        nationalIdentificationNumber,
        registrationNumber,
        registrationIssueDate,
        taxIdentificationNumber,
        bank,
        guestType: 'REGISTERED',
        source: 'CSV'
      };

      results.push(parsedGuest);
      if (preview.length < 10) {
        preview.push(parsedGuest);
      }
    })
    .on('end', () => {
      res.json({
        totalRows: rowNumber - 1,
        validCount: results.length,
        invalidCount: errors.length,
        errors,
        preview,
        guests: results
      });
    })
    .on('error', (err) => {
      console.error('Erreur parsing CSV:', err);
      res.status(500).json({ error: 'Erreur lors de la lecture du fichier CSV.' });
    });
};

// CSV Confirm & Bulk Insert (Phase 2)
export const confirmImport = async (req, res) => {
  const { eventId, guests, fileName = 'import.csv' } = req.body;

  if (!eventId || !guests || !Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'eventId et la liste d\'invités sont obligatoires.' });
  }

  try {
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable.' });
    }

    const currentCount = await Guest.count({ where: { eventId } });

    // Clean and prepare all guests
    const preparedGuests = guests.map((g, index) => {
      const sequence = String(currentCount + index + 1).padStart(6, '0');
      const refId = `INV-${sequence}`;

      const cleanGuest = {
        eventId: parseInt(eventId, 10),
        refId,
        importNumber: g.importNumber ? parseInt(String(g.importNumber).replace(/[^0-9]/g, ''), 10) : (currentCount + index + 1),
        lastNameOrCompany: String(g.lastNameOrCompany || 'SANS NOM').trim().substring(0, 255),
        firstName: g.firstName ? String(g.firstName).trim().substring(0, 255) : '',
        numberOfShares: parseInt(String(g.numberOfShares || 0).replace(/[^0-9]/g, ''), 10) || 0,
        birthDate: g.birthDate ? String(g.birthDate).trim().substring(0, 50) : '',
        address: g.address ? String(g.address).trim().substring(0, 255) : '',
        wilaya: g.wilaya ? String(g.wilaya).trim().substring(0, 100) : '',
        nationalIdentificationNumber: g.nationalIdentificationNumber ? String(g.nationalIdentificationNumber).trim().substring(0, 50) : '',
        registrationNumber: g.registrationNumber ? String(g.registrationNumber).trim().substring(0, 50) : '',
        registrationIssueDate: g.registrationIssueDate ? String(g.registrationIssueDate).trim().substring(0, 50) : '',
        taxIdentificationNumber: g.taxIdentificationNumber ? String(g.taxIdentificationNumber).trim().substring(0, 50) : '',
        bank: g.bank ? String(g.bank).trim().substring(0, 150) : '',
        guestType: g.guestType || 'REGISTERED',
        source: 'CSV'
      };

      cleanGuest.searchNormalized = getSearchNormalized(cleanGuest);
      return cleanGuest;
    });

    // Execute in batches inside a managed transaction to avoid packet size overflow
    const BATCH_SIZE = 100;
    let totalInserted = 0;

    await sequelize.transaction(async (t) => {
      for (let i = 0; i < preparedGuests.length; i += BATCH_SIZE) {
        const batch = preparedGuests.slice(i, i + BATCH_SIZE);
        await Guest.bulkCreate(batch, { transaction: t, validate: false });
        totalInserted += batch.length;
      }

      await CsvImport.create({
        eventId: parseInt(eventId, 10),
        fileName: String(fileName || 'import.csv').substring(0, 255),
        totalRows: guests.length,
        successfulRows: totalInserted,
        failedRows: 0,
        importedBy: req.user.id
      }, { transaction: t });
    });

    await logAudit({
      userId: req.user.id,
      action: 'IMPORT_CSV',
      resource: 'EVENT',
      resourceId: eventId,
      details: `Importation réussie de ${totalInserted} invités pour l'événement ${event.name}`,
      req
    });

    res.status(201).json({
      message: 'Importation effectuée avec succès.',
      importedCount: totalInserted
    });
  } catch (error) {
    console.error('Erreur confirmImport:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l\'enregistrement des invités importés.' });
  }
};
