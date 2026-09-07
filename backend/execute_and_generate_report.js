import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType
} from 'docx';
import { sequelize } from './config/db.js';

// Color Scheme
const PRIMARY = '722083'; // Purple brand
const PRIMARY_LIGHT = 'F3E8FF';
const SUCCESS = '10B981';
const SUCCESS_LIGHT = 'ECFDF5';
const WARNING = 'F59E0B';
const DARK = '0F172A';
const MUTED = '64748B';
const BORDER = 'CBD5E1';
const ROW_ALT = 'F8FAFC';
const WHITE = 'FFFFFF';

const createTitle = (text) => new Paragraph({
  children: [
    new TextRun({
      text,
      bold: true,
      size: 36,
      color: PRIMARY
    })
  ],
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 100 }
});

const createSubtitle = (text) => new Paragraph({
  children: [
    new TextRun({
      text,
      bold: true,
      size: 24,
      color: DARK
    })
  ],
  alignment: AlignmentType.CENTER,
  spacing: { before: 50, after: 300 }
});

const createSectionHeader = (title) => new Paragraph({
  children: [
    new TextRun({
      text: title,
      bold: true,
      size: 26,
      color: PRIMARY
    })
  ],
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 180 },
  border: {
    bottom: {
      color: PRIMARY,
      space: 4,
      value: 'single',
      size: 12
    }
  }
});

const createSubHeader = (title) => new Paragraph({
  children: [
    new TextRun({
      text: title,
      bold: true,
      size: 22,
      color: DARK
    })
  ],
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 100 }
});

const createParagraph = (text, options = {}) => new Paragraph({
  children: [
    new TextRun({
      text,
      size: 20,
      color: DARK,
      ...options
    })
  ],
  spacing: { before: 60, after: 60 }
});

const createKpiCard = (items) => {
  const cells = items.map(item => new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: item.label.toUpperCase(),
            size: 16,
            bold: true,
            color: MUTED
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: String(item.value),
            size: 28,
            bold: true,
            color: item.color || PRIMARY
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 60 }
      })
    ],
    shading: { fill: item.bg || ROW_ALT, type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 120, bottom: 120, left: 100, right: 100 }
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: BORDER }
    },
    rows: [new TableRow({ children: cells })]
  });
};

const createResultsTable = (columns, rows) => {
  if (!rows || rows.length === 0) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
        left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
        right: { style: BorderStyle.SINGLE, size: 4, color: BORDER }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Aucune donnée enregistrée pour cette requête.", italic: true, size: 18, color: MUTED })],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: { fill: ROW_ALT, type: ShadingType.CLEAR, color: 'auto' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ]
        })
      ]
    });
  }

  // Header Row
  const headerRow = new TableRow({
    children: columns.map(col => new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: col.label || col.key,
              bold: true,
              size: 18,
              color: WHITE
            })
          ],
          alignment: AlignmentType.CENTER
        })
      ],
      shading: { fill: PRIMARY, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 80, right: 80 }
    }))
  });

  // Data Rows
  const dataRows = rows.map((r, rowIndex) => new TableRow({
    children: columns.map(col => {
      let val = r[col.key];
      if (val === null || val === undefined || val === '') val = '-';
      if (val instanceof Date) val = new Date(val).toLocaleString('fr-FR');

      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(val),
                size: 17,
                color: DARK,
                bold: col.bold ? true : false
              })
            ],
            alignment: col.align || AlignmentType.LEFT
          })
        ],
        shading: { fill: rowIndex % 2 === 0 ? WHITE : ROW_ALT, type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 60, bottom: 60, left: 80, right: 80 }
      });
    })
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' }
    },
    rows: [headerRow, ...dataRows]
  });
};

async function executeQueriesAndGenerateReport() {
  console.log('Connexion à la base de données MySQL...');
  await sequelize.authenticate();
  console.log('Connecté avec succès.');

  // Get active event
  const [events] = await sequelize.query(`SELECT id, name, eventDate, location, organizer FROM events ORDER BY id ASC LIMIT 1;`);
  const activeEvent = events[0] || { id: 1, name: "Événement Principal" };
  const eventId = activeEvent.id;

  console.log(`Exécution des requêtes pour l'événement ID ${eventId} (${activeEvent.name})...`);

  // Query 1.1: Total Presents (Direct vs Mandataire) & Actions
  const [res1_1] = await sequelize.query(`
    SELECT 
        e.name AS Evenement,
        COUNT(a.id) AS Total_Presents,
        COUNT(CASE WHEN a.attendanceType = 'SELF' THEN 1 END) AS Presents_En_Personne_Titulaire,
        COUNT(CASE WHEN a.attendanceType = 'PROXY' THEN 1 END) AS Presents_Par_Mandataire,
        COALESCE(SUM(g.numberOfShares), 0) AS Total_Actions_Representees
    FROM attendances a
    JOIN guests g ON a.guestId = g.id
    JOIN events e ON a.eventId = e.id
    WHERE a.status = 'PRESENT' AND a.eventId = :eventId
    GROUP BY e.id, e.name;
  `, { replacements: { eventId } });

  // Query 1.2: Taux de présence & Quorum
  const [res1_2] = await sequelize.query(`
    SELECT 
        e.name AS Evenement,
        COUNT(DISTINCT g.id) AS Total_Invites_Inscrits,
        COUNT(DISTINCT a.id) AS Total_Presents,
        CONCAT(ROUND((COUNT(DISTINCT a.id) * 100.0 / NULLIF(COUNT(DISTINCT g.id), 0)), 2), ' %') AS Taux_Presence,
        COALESCE(SUM(g.numberOfShares), 0) AS Total_Actions_Inscrites,
        COALESCE(SUM(CASE WHEN a.id IS NOT NULL THEN g.numberOfShares ELSE 0 END), 0) AS Total_Actions_Presents
    FROM events e
    LEFT JOIN guests g ON e.id = g.eventId
    LEFT JOIN attendances a ON g.id = a.guestId AND a.status = 'PRESENT'
    WHERE e.id = :eventId
    GROUP BY e.id, e.name;
  `, { replacements: { eventId } });

  // Query 2.1: Badges imprimés & réimpressions
  const [res2_1] = await sequelize.query(`
    SELECT 
        e.name AS Evenement,
        COUNT(bp.id) AS Total_Impressions_Effectuees,
        COUNT(DISTINCT bp.guestId) AS Total_Invites_Avec_Badge_Imprime,
        COUNT(bp.id) - COUNT(DISTINCT bp.guestId) AS Total_Reimpressions
    FROM badge_prints bp
    JOIN events e ON bp.eventId = e.id
    WHERE bp.eventId = :eventId
    GROUP BY e.id, e.name;
  `, { replacements: { eventId } });

  // Query 2.2: Badges par agent
  const [res2_2] = await sequelize.query(`
    SELECT 
        u.fullName AS Agent_Nom,
        u.username AS Identifiant_Agent,
        COUNT(bp.id) AS Total_Badges_Imprimes,
        COUNT(DISTINCT bp.guestId) AS Invites_Uniques
    FROM badge_prints bp
    JOIN users u ON bp.printedBy = u.id
    WHERE bp.eventId = :eventId
    GROUP BY u.id, u.fullName, u.username
    ORDER BY Total_Badges_Imprimes DESC;
  `, { replacements: { eventId } });

  // Query 3: Liste des présents avec mode de présence et badge
  const [res3] = await sequelize.query(`
    SELECT 
        g.refId AS Reference,
        g.lastNameOrCompany AS Nom_Ou_Raison_Sociale,
        COALESCE(g.firstName, '') AS Prenom,
        g.numberOfShares AS Nombre_Actions,
        g.guestType AS Type_Invite,
        CASE 
            WHEN a.attendanceType = 'PROXY' THEN 'MANDATAIRE'
            ELSE 'EN PERSONNE'
        END AS Mode_Presence,
        COALESCE(CONCAT(a.representativeLastName, ' ', COALESCE(a.representativeFirstName, '')), '-') AS Mandataire_Nom_Prenom,
        COALESCE(a.representativePosition, '-') AS Mandataire_Fonction,
        DATE_FORMAT(a.checkedInAt, '%d/%m/%Y %H:%i:%s') AS Date_Heure_Emargement,
        a.workstation AS Poste_Guichet,
        agentCheckin.fullName AS Enregistre_Par_Agent,
        CASE 
            WHEN COUNT(bp.id) > 0 THEN 'OUI' 
            ELSE 'NON' 
        END AS Badge_Imprime
    FROM attendances a
    JOIN guests g ON a.guestId = g.id
    JOIN users agentCheckin ON a.checkedInBy = agentCheckin.id
    LEFT JOIN badge_prints bp ON g.id = bp.guestId
    WHERE a.eventId = :eventId AND a.status = 'PRESENT'
    GROUP BY 
        g.id, g.refId, g.lastNameOrCompany, g.firstName, 
        g.numberOfShares, g.guestType, a.attendanceType, 
        a.representativeLastName, a.representativeFirstName, a.representativePosition,
        a.checkedInAt, a.workstation, agentCheckin.fullName
    ORDER BY a.checkedInAt DESC;
  `, { replacements: { eventId } });

  // Query 4: Extraction détaillée avec NIN, RC, NIF
  const [res4] = await sequelize.query(`
    SELECT 
        g.refId AS Reference,
        g.lastNameOrCompany AS Nom_Ou_Raison_Sociale,
        COALESCE(g.firstName, '') AS Prenom,
        g.numberOfShares AS Nombre_Actions,
        COALESCE(g.nationalIdentificationNumber, '') AS NIN_Titulaire,
        COALESCE(g.registrationNumber, '') AS RC,
        COALESCE(g.taxIdentificationNumber, '') AS NIF,
        COALESCE(g.bank, '') AS Banque,
        COALESCE(g.wilaya, '') AS Wilaya,
        CASE 
            WHEN a.attendanceType = 'PROXY' THEN 'MANDATAIRE'
            ELSE 'TITULAIRE'
        END AS Type_Presence,
        COALESCE(a.representativeLastName, '') AS Mandataire_Nom,
        COALESCE(a.representativeFirstName, '') AS Mandataire_Prenom,
        COALESCE(a.representativeNIN, '') AS Mandataire_NIN,
        DATE_FORMAT(a.checkedInAt, '%d/%m/%Y %H:%i') AS Heure_Presence,
        a.workstation AS Guichet,
        u.fullName AS Agent
    FROM attendances a
    JOIN guests g ON a.guestId = g.id
    JOIN users u ON a.checkedInBy = u.id
    WHERE a.eventId = :eventId AND a.status = 'PRESENT'
    ORDER BY a.checkedInAt ASC;
  `, { replacements: { eventId } });

  // Query 5: Productivité par agent
  const [res5] = await sequelize.query(`
    SELECT 
        u.fullName AS Nom_Agent,
        u.username AS Identifiant,
        COUNT(a.id) AS Total_Emargements,
        COUNT(CASE WHEN a.attendanceType = 'SELF' THEN 1 END) AS Emargements_Directs,
        COUNT(CASE WHEN a.attendanceType = 'PROXY' THEN 1 END) AS Emargements_Mandataires,
        COALESCE(SUM(g.numberOfShares), 0) AS Total_Actions_Validees,
        DATE_FORMAT(MIN(a.checkedInAt), '%H:%i:%s') AS Premier_Emargement,
        DATE_FORMAT(MAX(a.checkedInAt), '%H:%i:%s') AS Dernier_Emargement
    FROM attendances a
    JOIN users u ON a.checkedInBy = u.id
    JOIN guests g ON a.guestId = g.id
    WHERE a.eventId = :eventId AND a.status = 'PRESENT'
    GROUP BY u.id, u.fullName, u.username
    ORDER BY Total_Emargements DESC;
  `, { replacements: { eventId } });

  // Query 6: Flux horaire
  const [res6] = await sequelize.query(`
    SELECT 
        DATE_FORMAT(a.checkedInAt, '%Y-%m-%d %H:00') AS Tranche_Horaire,
        COUNT(a.id) AS Total_Arrivees,
        COUNT(CASE WHEN a.attendanceType = 'SELF' THEN 1 END) AS Arrivees_Directes,
        COUNT(CASE WHEN a.attendanceType = 'PROXY' THEN 1 END) AS Arrivees_Mandataires,
        SUM(g.numberOfShares) AS Actions_Arrivees
    FROM attendances a
    JOIN guests g ON a.guestId = g.id
    WHERE a.eventId = :eventId AND a.status = 'PRESENT'
    GROUP BY DATE_FORMAT(a.checkedInAt, '%Y-%m-%d %H:00')
    ORDER BY Tranche_Horaire ASC;
  `, { replacements: { eventId } });

  // Query 7: Absents
  const [res7] = await sequelize.query(`
    SELECT 
        g.refId AS Reference,
        g.lastNameOrCompany AS Nom_Ou_Raison_Sociale,
        COALESCE(g.firstName, '') AS Prenom,
        g.numberOfShares AS Nombre_Actions,
        COALESCE(g.nationalIdentificationNumber, '') AS NIN,
        COALESCE(g.wilaya, '') AS Wilaya,
        g.guestType AS Categorie
    FROM guests g
    LEFT JOIN attendances a ON g.id = a.guestId AND a.status = 'PRESENT'
    WHERE g.eventId = :eventId AND a.id IS NULL
    ORDER BY g.lastNameOrCompany ASC;
  `, { replacements: { eventId } });

  // Query 8: Mandataires exclusifs
  const [res8] = await sequelize.query(`
    SELECT 
        g.refId AS Reference,
        g.lastNameOrCompany AS Societe_Ou_Actionnaire,
        COALESCE(g.firstName, '') AS Prenom_Titulaire,
        g.numberOfShares AS Nombre_Actions,
        COALESCE(g.registrationNumber, '') AS RC,
        a.representativeLastName AS Nom_Mandataire,
        COALESCE(a.representativeFirstName, '') AS Prenom_Mandataire,
        COALESCE(a.representativeNIN, '') AS NIN_Mandataire,
        COALESCE(a.representativePosition, '') AS Poste_Fonction,
        COALESCE(a.representativeNotes, '') AS Observations,
        DATE_FORMAT(a.checkedInAt, '%d/%m/%Y %H:%i') AS Date_Heure_Presence,
        a.workstation AS Guichet,
        u.fullName AS Valide_Par_Agent
    FROM attendances a
    JOIN guests g ON a.guestId = g.id
    JOIN users u ON a.checkedInBy = u.id
    WHERE a.eventId = :eventId AND a.status = 'PRESENT' AND a.attendanceType = 'PROXY'
    ORDER BY a.checkedInAt ASC;
  `, { replacements: { eventId } });

  console.log('Résultats récupérés avec succès de MySQL. Génération du document Word...');

  const row1_1 = res1_1[0] || {};
  const row1_2 = res1_2[0] || {};
  const row2_1 = res2_1[0] || {};

  const doc = new Document({
    title: `Rapport Résultats Statistiques — ${activeEvent.name}`,
    description: "Rapport d'exécution réel des requêtes SQL de statistiques et d'émargement",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
          }
        },
        children: [
          createTitle("EL-MOULTAKA APP"),
          createSubtitle(`RAPPORT OFFICIEL DES RÉSULTATS STATISTIQUES D'ÉMARGEMENT\nÉvénement : ${activeEvent.name}`),

          // Event Summary Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      createParagraph(`Date d'extraction : ${new Date().toLocaleString('fr-FR')}`, { bold: true }),
                      createParagraph(`Événement analysé : ${activeEvent.name} (ID: ${eventId})`),
                      createParagraph(`Lieu : ${activeEvent.location || 'Siège Social / Salle de Conférence'}`),
                      createParagraph(`Base de données source : event_management (MySQL)`)
                    ],
                    shading: { fill: PRIMARY_LIGHT, type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 }
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { after: 150 } }),

          // KPI Cards
          createKpiCard([
            { label: "Total Inscrits", value: row1_2.Total_Invites_Inscrits || 0, color: DARK },
            { label: "Total Présents", value: row1_2.Total_Presents || 0, color: SUCCESS, bg: SUCCESS_LIGHT },
            { label: "Taux Présence", value: row1_2.Taux_Presence || "0 %", color: PRIMARY },
            { label: "Actions Représentées", value: Number(row1_1.Total_Actions_Representees || 0).toLocaleString('fr-FR'), color: DARK }
          ]),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 1
          createSectionHeader("1. RÉSULTATS DU DÉCOMPTE GLOBAL DES PRÉSENCES & QUORUM"),
          createParagraph("Résultats consolidés de la requête SQL 1.1 (Ventilation Titulaires vs Mandataires) et 1.2 (Taux de présence et Quorum légal) :"),

          createSubHeader("1.1 Synthèse de Présence par Type (Direct vs Mandataire)"),
          createResultsTable(
            [
              { key: 'Evenement', label: 'Événement', bold: true },
              { key: 'Total_Presents', label: 'Total Présents', align: AlignmentType.CENTER, bold: true },
              { key: 'Presents_En_Personne_Titulaire', label: 'En Personne (Titulaire)', align: AlignmentType.CENTER },
              { key: 'Presents_Par_Mandataire', label: 'Par Mandataire / Représentant', align: AlignmentType.CENTER },
              { key: 'Total_Actions_Representees', label: 'Total Actions Validées', align: AlignmentType.RIGHT, bold: true }
            ],
            res1_1
          ),

          createSubHeader("1.2 Taux de Participation Global & Quorum d'Actions"),
          createResultsTable(
            [
              { key: 'Evenement', label: 'Événement', bold: true },
              { key: 'Total_Invites_Inscrits', label: 'Inscrits Totaux', align: AlignmentType.CENTER },
              { key: 'Total_Presents', label: 'Présents Émargés', align: AlignmentType.CENTER, bold: true },
              { key: 'Taux_Presence', label: 'Taux de Présence', align: AlignmentType.CENTER, bold: true },
              { key: 'Total_Actions_Inscrites', label: 'Actions Inscrites', align: AlignmentType.RIGHT },
              { key: 'Total_Actions_Presents', label: 'Actions des Présents', align: AlignmentType.RIGHT, bold: true }
            ],
            res1_2
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 2
          createSectionHeader("2. RÉSULTATS D'IMPRESSION DES BADGES"),
          createParagraph("Résultats réels extraits de la table badge_prints (étiquettes 65 mm × 102 mm) :"),

          createSubHeader("2.1 Total des impressions & réimpressions"),
          createResultsTable(
            [
              { key: 'Evenement', label: 'Événement', bold: true },
              { key: 'Total_Impressions_Effectuees', label: 'Total Impressions', align: AlignmentType.CENTER, bold: true },
              { key: 'Total_Invites_Avec_Badge_Imprime', label: 'Invités Uniques avec Badge', align: AlignmentType.CENTER },
              { key: 'Total_Reimpressions', label: 'Réimpressions (Doublons/Perte)', align: AlignmentType.CENTER }
            ],
            res2_1
          ),

          createSubHeader("2.2 Répartition des impressions par agent d'accueil"),
          createResultsTable(
            [
              { key: 'Agent_Nom', label: 'Nom de l\'Agent', bold: true },
              { key: 'Identifiant_Agent', label: 'Identifiant (Username)' },
              { key: 'Total_Badges_Imprimes', label: 'Badges Imprimés', align: AlignmentType.CENTER, bold: true },
              { key: 'Invites_Uniques', label: 'Invités Uniques Servis', align: AlignmentType.CENTER }
            ],
            res2_2
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 3
          createSectionHeader("3. LISTE DES PARTICIPANTS ÉMARGÉS (RÉSULTAT REQUÊTE 3)"),
          createParagraph(`Derniers émargements enregistrés (Total : ${res3.length} présents) :`),
          createResultsTable(
            [
              { key: 'Reference', label: 'Réf ID', bold: true },
              { key: 'Nom_Ou_Raison_Sociale', label: 'Nom / Société', bold: true },
              { key: 'Prenom', label: 'Prénom' },
              { key: 'Nombre_Actions', label: 'Actions', align: AlignmentType.RIGHT },
              { key: 'Mode_Presence', label: 'Présence', align: AlignmentType.CENTER },
              { key: 'Mandataire_Nom_Prenom', label: 'Mandataire / Représentant' },
              { key: 'Date_Heure_Emargement', label: 'Date & Heure' },
              { key: 'Enregistre_Par_Agent', label: 'Agent Guichet' },
              { key: 'Badge_Imprime', label: 'Badge', align: AlignmentType.CENTER }
            ],
            res3
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 4
          createSectionHeader("4. EXTRACTION DÉTAILLÉE RÉGLEMENTAIRE (NIN, RC, NIF & MANDATS)"),
          createParagraph(`Résultat complet de la requête 4 avec identifiants fiscaux et commerciaux (${res4.length} lignes) :`),
          createResultsTable(
            [
              { key: 'Reference', label: 'Réf', bold: true },
              { key: 'Nom_Ou_Raison_Sociale', label: 'Nom / Raison Sociale', bold: true },
              { key: 'NIN_Titulaire', label: 'NIN' },
              { key: 'RC', label: 'RC' },
              { key: 'NIF', label: 'NIF' },
              { key: 'Banque', label: 'Banque' },
              { key: 'Wilaya', label: 'Wilaya' },
              { key: 'Type_Presence', label: 'Mode' },
              { key: 'Mandataire_Nom', label: 'Nom Mandataire' },
              { key: 'Mandataire_NIN', label: 'NIN Mandataire' },
              { key: 'Heure_Presence', label: 'Heure' },
              { key: 'Guichet', label: 'Guichet' }
            ],
            res4
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 5
          createSectionHeader("5. PRODUCTIVITÉ PAR AGENT & GUICHET D'ACCUEIL"),
          createParagraph("Résultat de la requête 5 sur les volumes traités par chaque opérateur :"),
          createResultsTable(
            [
              { key: 'Nom_Agent', label: 'Agent d\'Accueil', bold: true },
              { key: 'Identifiant', label: 'Identifiant' },
              { key: 'Total_Emargements', label: 'Total Émargements', align: AlignmentType.CENTER, bold: true },
              { key: 'Emargements_Directs', label: 'Directs', align: AlignmentType.CENTER },
              { key: 'Emargements_Mandataires', label: 'Mandataires', align: AlignmentType.CENTER },
              { key: 'Total_Actions_Validees', label: 'Actions Traitées', align: AlignmentType.RIGHT },
              { key: 'Premier_Emargement', label: 'Premier', align: AlignmentType.CENTER },
              { key: 'Dernier_Emargement', label: 'Dernier', align: AlignmentType.CENTER }
            ],
            res5
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 6
          createSectionHeader("6. FLUX DES ARRIVÉES PAR TRANCHE HORAIRE"),
          createParagraph("Résultat de la requête 6 sur la cadence horaire des arrivées :"),
          createResultsTable(
            [
              { key: 'Tranche_Horaire', label: 'Heure / Tranche', bold: true },
              { key: 'Total_Arrivees', label: 'Arrivées', align: AlignmentType.CENTER, bold: true },
              { key: 'Arrivees_Directes', label: 'Directs', align: AlignmentType.CENTER },
              { key: 'Arrivees_Mandataires', label: 'Mandataires', align: AlignmentType.CENTER },
              { key: 'Actions_Arrivees', label: 'Actions Entrées', align: AlignmentType.RIGHT }
            ],
            res6
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 7
          createSectionHeader("7. LISTE DES INVITÉS NON ENCORE ÉMARGÉS (ABSENTS)"),
          createParagraph(`Résultat de la requête 7 (Total restants : ${res7.length} absents) :`),
          createResultsTable(
            [
              { key: 'Reference', label: 'Réf ID', bold: true },
              { key: 'Nom_Ou_Raison_Sociale', label: 'Nom / Raison Sociale', bold: true },
              { key: 'Prenom', label: 'Prénom' },
              { key: 'Nombre_Actions', label: 'Actions', align: AlignmentType.RIGHT },
              { key: 'NIN', label: 'NIN' },
              { key: 'Wilaya', label: 'Wilaya' },
              { key: 'Categorie', label: 'Catégorie' }
            ],
            res7.slice(0, 50) // Show up to 50 in document table
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // SECTION 8
          createSectionHeader("8. REGISTRE SPÉCIFIQUE DES ÉMARGEMENTS PAR MANDATAIRE"),
          createParagraph(`Résultat de la requête 8 pour les procurations / représentations légales (Total : ${res8.length} mandats enregistrés) :`),
          createResultsTable(
            [
              { key: 'Reference', label: 'Réf Actionnaire', bold: true },
              { key: 'Societe_Ou_Actionnaire', label: 'Société / Titulaire', bold: true },
              { key: 'Nombre_Actions', label: 'Actions', align: AlignmentType.RIGHT },
              { key: 'Nom_Mandataire', label: 'Nom Mandataire', bold: true },
              { key: 'Prenom_Mandataire', label: 'Prénom Mandataire' },
              { key: 'NIN_Mandataire', label: 'NIN Mandataire' },
              { key: 'Poste_Fonction', label: 'Qualité / Poste' },
              { key: 'Observations', label: 'Observations / Procuration' },
              { key: 'Date_Heure_Presence', label: 'Date & Heure' },
              { key: 'Valide_Par_Agent', label: 'Validé Par' }
            ],
            res8
          )
        ]
      }
    ]
  });

  const outputPath = path.resolve('..', 'Rapport_Resultats_Statistiques_ElMoultaka.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document Word des résultats réels généré avec succès : ${outputPath}`);
  process.exit(0);
}

executeQueriesAndGenerateReport().catch((err) => {
  console.error('Erreur lors de la génération du rapport des résultats:', err);
  process.exit(1);
});
