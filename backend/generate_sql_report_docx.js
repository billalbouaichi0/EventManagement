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

// Color Palette
const PRIMARY_COLOR = '722083'; // Purple brand
const SECONDARY_COLOR = '10B981'; // Green
const DARK_COLOR = '0F172A';
const LIGHT_BG = 'F8FAFC';
const CODE_BG = 'F1F5F9';
const BORDER_COLOR = 'CBD5E1';

const createSectionHeader = (title, level = HeadingLevel.HEADING_1) => {
  return new Paragraph({
    text: title,
    heading: level,
    spacing: { before: 360, after: 180 },
    border: {
      bottom: {
        color: PRIMARY_COLOR,
        space: 4,
        value: 'single',
        size: 12
      }
    }
  });
};

const createSubHeader = (title) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24, // 12pt
        color: PRIMARY_COLOR
      })
    ],
    spacing: { before: 240, after: 100 }
  });
};

const createParagraph = (text, options = {}) => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 21, // 10.5pt
        color: DARK_COLOR,
        ...options
      })
    ],
    spacing: { before: 80, after: 80 }
  });
};

const createCodeBlock = (sqlCode) => {
  const lines = sqlCode.trim().split('\n');
  const rows = lines.map(line => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ',
                  font: 'Consolas',
                  size: 18, // 9pt
                  color: '1E293B'
                })
              ],
              spacing: { before: 20, after: 20 }
            })
          ],
          shading: { fill: CODE_BG, type: ShadingType.CLEAR, color: 'auto' },
          margins: { top: 40, bottom: 40, left: 120, right: 120 }
        })
      ]
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 18, color: PRIMARY_COLOR },
      right: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows
  });
};

const createDataTable = (headers, rowsData) => {
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: h,
              bold: true,
              size: 19,
              color: 'FFFFFF'
            })
          ],
          alignment: AlignmentType.CENTER
        })
      ],
      shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    }))
  });

  const dataRows = rowsData.map(row => new TableRow({
    children: row.map((cell, idx) => new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: cell,
              size: 18,
              color: DARK_COLOR
            })
          ]
        })
      ],
      shading: { fill: idx % 2 === 0 ? 'FFFFFF' : LIGHT_BG, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 100, right: 100 }
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' }
    },
    rows: [headerRow, ...dataRows]
  });
};

async function generateDocx() {
  const doc = new Document({
    title: "Rapport des Requêtes SQL Statistiques — El-Moultaka App",
    description: "Guide et rapport d'exécution des requêtes SQL pour la gestion des statistiques d'émargement",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1200,
              bottom: 1200,
              left: 1200
            }
          }
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "EL-MOULTAKA APP",
                bold: true,
                size: 36,
                color: PRIMARY_COLOR
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "RAPPORT & GUIDE TECHNIQUE DES REQUÊTES SQL DE STATISTIQUES",
                bold: true,
                size: 26,
                color: DARK_COLOR
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 }
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
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
                      createParagraph("Base de données : event_management (MySQL / MariaDB)", { bold: true }),
                      createParagraph("Système : Application de Gestion des Événements & Émargement (v2.0)"),
                      createParagraph("Support des mandataires : Personnes physiques & Personnes morales (SPA, SARL...)"),
                      createParagraph("Paramètre par défaut : eventId = 1 (remplaçable selon l'événement cible)")
                    ],
                    shading: { fill: 'FAF5FF', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 }
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 1. TOTAL INVITÉS & ACTIONS
          createSectionHeader("1. TOTAL DES INVITÉS PRÉSENTS (ÉMARGÉS) & ACTIONS"),
          createParagraph("Ces requêtes permettent de consolider le décompte officiel des présences pour l'Assemblée Générale ou l'Événement, avec ventilation entre la présence physique du titulaire/PDG et la présence par représentant ou mandataire légal."),

          createSubHeader("1.1 Nombre total de présents (Titulaire direct vs Mandataire)"),
          createParagraph("Objectif : Fournir en temps réel le nombre de participants émargés et le total des actions représentées."),
          createCodeBlock(`SELECT 
    e.name AS Evenement,
    COUNT(a.id) AS Total_Presents,
    COUNT(CASE WHEN a.attendanceType = 'SELF' THEN 1 END) AS Presents_En_Personne_Titulaire,
    COUNT(CASE WHEN a.attendanceType = 'PROXY' THEN 1 END) AS Presents_Par_Mandataire,
    COALESCE(SUM(g.numberOfShares), 0) AS Total_Actions_Representees
FROM attendances a
JOIN guests g ON a.guestId = g.id
JOIN events e ON a.eventId = e.id
WHERE a.status = 'PRESENT' AND a.eventId = 1
GROUP BY e.id, e.name;`),
          new Paragraph({ text: "", spacing: { after: 80 } }),
          createDataTable(
            ["Colonne Résultat", "Type", "Description Métier"],
            [
              ["Evenement", "VARCHAR", "Nom de l'événement en cours"],
              ["Total_Presents", "INT", "Nombre total d'invités émargés"],
              ["Presents_En_Personne_Titulaire", "INT", "Invités s'étant présentés eux-mêmes"],
              ["Presents_Par_Mandataire", "INT", "Invités/Sociétés représentés par mandataire"],
              ["Total_Actions_Representees", "BIGINT", "Somme cumulée des actions des présents"]
            ]
          ),

          createSubHeader("1.2 Taux de présence global (Inscrits vs Présents & Quorum)"),
          createParagraph("Objectif : Calculer le pourcentage de participation physique et le pourcentage du capital/actions représenté (quorum légal)."),
          createCodeBlock(`SELECT 
    e.name AS Evenement,
    COUNT(DISTINCT g.id) AS Total_Invites_Inscrits,
    COUNT(DISTINCT a.id) AS Total_Presents,
    CONCAT(ROUND((COUNT(DISTINCT a.id) * 100.0 / NULLIF(COUNT(DISTINCT g.id), 0)), 2), ' %') AS Taux_Presence,
    COALESCE(SUM(g.numberOfShares), 0) AS Total_Actions_Inscrites,
    COALESCE(SUM(CASE WHEN a.id IS NOT NULL THEN g.numberOfShares ELSE 0 END), 0) AS Total_Actions_Presents
FROM events e
LEFT JOIN guests g ON e.id = g.eventId
LEFT JOIN attendances a ON g.id = a.guestId AND a.status = 'PRESENT'
WHERE e.id = 1
GROUP BY e.id, e.name;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 2. BADGES IMPRIMÉS
          createSectionHeader("2. STATISTIQUES D'IMPRESSION DES BADGES"),
          createParagraph("Suivi des impressions physiques sur les imprimantes d'étiquettes (format standard 65 mm × 102 mm)."),

          createSubHeader("2.1 Total des badges imprimés et réimpressions"),
          createCodeBlock(`SELECT 
    e.name AS Evenement,
    COUNT(bp.id) AS Total_Impressions_Effectuees,
    COUNT(DISTINCT bp.guestId) AS Total_Invites_Avec_Badge_Imprime,
    COUNT(bp.id) - COUNT(DISTINCT bp.guestId) AS Total_Reimpressions
FROM badge_prints bp
JOIN events e ON bp.eventId = e.id
WHERE bp.eventId = 1
GROUP BY e.id, e.name;`),

          createSubHeader("2.2 Répartition des impressions par agent d'accueil"),
          createCodeBlock(`SELECT 
    u.fullName AS Agent_Nom,
    u.username AS Identifiant_Agent,
    COUNT(bp.id) AS Total_Badges_Imprimes,
    COUNT(DISTINCT bp.guestId) AS Invites_Uniques
FROM badge_prints bp
JOIN users u ON bp.printedBy = u.id
WHERE bp.eventId = 1
GROUP BY u.id, u.fullName, u.username
ORDER BY Total_Badges_Imprimes DESC;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 3. LISTE DES PRÉSENTS
          createSectionHeader("3. LISTE OPÉRATIONNELLE DES PRÉSENTS AVEC AGENT & BADGE"),
          createParagraph("Cette vue synthétique permet de vérifier pour chaque invité émargé qui a validé son arrivée, l'heure exacte et l'état de l'impression du badge."),
          createCodeBlock(`SELECT 
    g.refId AS Reference,
    g.lastNameOrCompany AS Nom_Ou_Raison_Sociale,
    COALESCE(g.firstName, '') AS Prenom,
    g.numberOfShares AS Nombre_Actions,
    g.guestType AS Type_Invite,
    CASE 
        WHEN a.attendanceType = 'PROXY' THEN 'MANDATAIRE / REPRÉSENTANT'
        ELSE 'EN PERSONNE (TITULAIRE)'
    END AS Mode_Presence,
    COALESCE(CONCAT(a.representativeLastName, ' ', COALESCE(a.representativeFirstName, '')), '-') AS Mandataire_Nom_Prenom,
    COALESCE(a.representativePosition, '-') AS Mandataire_Poste_Fonction,
    a.checkedInAt AS Date_Heure_Emargement,
    a.workstation AS Poste_Guichet,
    agentCheckin.fullName AS Enregistre_Par_Agent,
    agentCheckin.username AS Username_Agent_Emargement,
    CASE 
        WHEN COUNT(bp.id) > 0 THEN 'OUI' 
        ELSE 'NON' 
    END AS Badge_Imprime,
    COUNT(bp.id) AS Nombre_Impressions_Badge,
    MAX(bp.printedAt) AS Derniere_Impression_A
FROM attendances a
JOIN guests g ON a.guestId = g.id
JOIN users agentCheckin ON a.checkedInBy = agentCheckin.id
LEFT JOIN badge_prints bp ON g.id = bp.guestId
LEFT JOIN users agentPrint ON bp.printedBy = agentPrint.id
WHERE a.eventId = 1 AND a.status = 'PRESENT'
GROUP BY 
    g.id, g.refId, g.lastNameOrCompany, g.firstName, 
    g.numberOfShares, g.guestType, a.attendanceType, 
    a.representativeLastName, a.representativeFirstName, a.representativePosition,
    a.checkedInAt, a.workstation, agentCheckin.fullName, agentCheckin.username
ORDER BY a.checkedInAt DESC;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 4. LISTE DÉTAILLÉE AVEC IDENTIFIANTS
          createSectionHeader("4. EXTRACTION DÉTAILLÉE DES PRÉSENTS (NIN, RC, NIF & COORDONNÉES)"),
          createParagraph("Ce rapport exhaustif intègre l'ensemble des identifiants légaux et fiscaux ainsi que les informations de mandat. Indispensable pour la conformité réglementaire et l'archivage légal."),
          createCodeBlock(`SELECT 
    g.refId AS Reference,
    g.importNumber AS Numero_Ordre_Import,
    g.lastNameOrCompany AS Nom_Ou_Raison_Sociale,
    COALESCE(g.firstName, '') AS Prenom,
    g.numberOfShares AS Nombre_Actions,
    COALESCE(g.nationalIdentificationNumber, '') AS NIN_Titulaire,
    COALESCE(g.registrationNumber, '') AS Registre_Commerce_RC,
    COALESCE(g.registrationIssueDate, '') AS Date_Delivrance_RC,
    COALESCE(g.taxIdentificationNumber, '') AS NIF,
    COALESCE(g.birthDate, '') AS Date_Naissance,
    COALESCE(g.wilaya, '') AS Wilaya,
    COALESCE(g.address, '') AS Adresse,
    COALESCE(g.bank, '') AS Banque_Agence,
    g.guestType AS Categorie,
    CASE 
        WHEN a.attendanceType = 'PROXY' THEN 'MANDATAIRE'
        ELSE 'TITULAIRE'
    END AS Type_Presence,
    COALESCE(a.representativeLastName, '') AS Mandataire_Nom,
    COALESCE(a.representativeFirstName, '') AS Mandataire_Prenom,
    COALESCE(a.representativeNIN, '') AS Mandataire_NIN,
    COALESCE(a.representativePosition, '') AS Mandataire_Fonction,
    COALESCE(a.representativeNotes, '') AS Mandataire_Observations,
    a.checkedInAt AS Date_Heure_Presence,
    a.workstation AS Poste_Guichet,
    u.fullName AS Agent_Operateur
FROM attendances a
JOIN guests g ON a.guestId = g.id
JOIN users u ON a.checkedInBy = u.id
WHERE a.eventId = 1 AND a.status = 'PRESENT'
ORDER BY a.checkedInAt ASC;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 5. PRODUCTIVITÉ DES GUICHETS
          createSectionHeader("5. RÉCAPITULATIF DE PRODUCTIVITÉ PAR GUICHET & AGENT"),
          createParagraph("Analyse des volumes traités par poste de travail pour auditer la cadence et la répartition de la charge d'accueil."),
          createCodeBlock(`SELECT 
    u.fullName AS Nom_Agent,
    u.username AS Identifiant,
    COUNT(a.id) AS Total_Emargements_Realises,
    COUNT(CASE WHEN a.attendanceType = 'SELF' THEN 1 END) AS Emargements_Directs,
    COUNT(CASE WHEN a.attendanceType = 'PROXY' THEN 1 END) AS Emargements_Mandataires,
    COALESCE(SUM(g.numberOfShares), 0) AS Total_Actions_Validees,
    MIN(a.checkedInAt) AS Premier_Emargement,
    MAX(a.checkedInAt) AS Dernier_Emargement
FROM attendances a
JOIN users u ON a.checkedInBy = u.id
JOIN guests g ON a.guestId = g.id
WHERE a.eventId = 1 AND a.status = 'PRESENT'
GROUP BY u.id, u.fullName, u.username
ORDER BY Total_Emargements_Realises DESC;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 6. FLUX PAR HEURE
          createSectionHeader("6. HISTORIQUE DU FLUX D'ARRIVÉE PAR TRANCHE HORAIRE"),
          createParagraph("Permet de tracer la courbe de fréquentation des arrivées pour les rapports post-événement."),
          createCodeBlock(`SELECT 
    DATE_FORMAT(a.checkedInAt, '%Y-%m-%d %H:00:00') AS Heure_Tranche,
    COUNT(a.id) AS Nombre_Arrivees,
    COUNT(CASE WHEN a.attendanceType = 'SELF' THEN 1 END) AS Arrivees_Directes,
    COUNT(CASE WHEN a.attendanceType = 'PROXY' THEN 1 END) AS Arrivees_Mandataires,
    SUM(g.numberOfShares) AS Actions_Arrivees
FROM attendances a
JOIN guests g ON a.guestId = g.id
WHERE a.eventId = 1 AND a.status = 'PRESENT'
GROUP BY DATE_FORMAT(a.checkedInAt, '%Y-%m-%d %H:00:00')
ORDER BY Heure_Tranche ASC;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 7. LISTE DES ABSENTS
          createSectionHeader("7. LISTE DES INVITÉS NON ÉMARGÉS (ABSENTS)"),
          createParagraph("Extraction des invités ou actionnaires inscrits qui ne se sont pas encore présentés aux guichets."),
          createCodeBlock(`SELECT 
    g.refId AS Reference,
    g.lastNameOrCompany AS Nom_Ou_Raison_Sociale,
    COALESCE(g.firstName, '') AS Prenom,
    g.numberOfShares AS Nombre_Actions,
    COALESCE(g.nationalIdentificationNumber, '') AS NIN,
    COALESCE(g.wilaya, '') AS Wilaya,
    g.guestType AS Categorie
FROM guests g
LEFT JOIN attendances a ON g.id = a.guestId AND a.status = 'PRESENT'
WHERE g.eventId = 1 AND a.id IS NULL
ORDER BY g.lastNameOrCompany ASC;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // 8. MANDATAIRES & REPRÉSENTANTS
          createSectionHeader("8. REGISTRE DES MANDATAIRES & REPRÉSENTANTS LÉGAUX"),
          createParagraph("Ce rapport spécifique extrait exclusivement les votes ou présences par procuration/mandat pour validation par le bureau de l'Assemblée ou le commissaire aux comptes."),
          createCodeBlock(`SELECT 
    g.refId AS Reference_Actionnaire,
    g.lastNameOrCompany AS Actionnaire_Ou_Societe,
    COALESCE(g.firstName, '') AS Prenom_Actionnaire,
    g.numberOfShares AS Nombre_Actions,
    COALESCE(g.registrationNumber, '') AS RC_Societe,
    a.representativeLastName AS Nom_Mandataire,
    COALESCE(a.representativeFirstName, '') AS Prenom_Mandataire,
    COALESCE(a.representativeNIN, '') AS NIN_Mandataire,
    COALESCE(a.representativePosition, '') AS Poste_Fonction_Mandataire,
    COALESCE(a.representativeNotes, '') AS Observations_Procuration,
    a.checkedInAt AS Date_Heure_Presence,
    a.workstation AS Guichet,
    u.fullName AS Valide_Par_Agent
FROM attendances a
JOIN guests g ON a.guestId = g.id
JOIN users u ON a.checkedInBy = u.id
WHERE a.eventId = 1 AND a.status = 'PRESENT' AND a.attendanceType = 'PROXY'
ORDER BY a.checkedInAt ASC;`),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // INSTRUCTIONS DE CONNEXION
          createSectionHeader("9. GUIDE D'EXÉCUTION SUR LES SGBD"),
          createParagraph("Vous pouvez exécuter ces requêtes directement sur :", { bold: true }),
          createParagraph("• phpMyAdmin : Onglet 'SQL' après avoir sélectionné la base event_management."),
          createParagraph("• MySQL Workbench / DBeaver : Ouvrez un éditeur SQL, collez la requête et exécutez (Ctrl+Enter)."),
          createParagraph("• Ligne de commande MySQL :"),
          createCodeBlock(`mysql -u root -p event_management -e "SELECT e.name, COUNT(a.id) FROM attendances a JOIN events e ON a.eventId = e.id WHERE a.status = 'PRESENT' GROUP BY e.id;"`)
        ]
      }
    ]
  });

  const outputPath = path.resolve('..', 'Rapport_Requetes_SQL_Statistiques_ElMoultaka.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document Word généré avec succès : ${outputPath}`);
}

generateDocx().catch(console.error);
