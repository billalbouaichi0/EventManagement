import bcrypt from 'bcryptjs';
import { sequelize, User, Event, Guest, AgentEvent } from './models/index.js';
import { getSearchNormalized } from './controllers/guestController.js';

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('🌱 Initialisation du seed de la base de données...');

    // 1. Admin & Agent Users
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        fullName: 'Administrateur Principal',
        username: 'admin',
        email: 'admin@event-nvoti.dz',
        password: hashedAdminPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    const hashedAgentPassword = await bcrypt.hash('agent123', 10);
    const [agentUser] = await User.findOrCreate({
      where: { username: 'agent1' },
      defaults: {
        fullName: 'Karim Hadj (Poste A)',
        username: 'agent1',
        email: 'karim.hadj@event-nvoti.dz',
        password: hashedAgentPassword,
        role: 'AGENT',
        status: 'ACTIVE'
      }
    });

    const [agentUser2] = await User.findOrCreate({
      where: { username: 'agent2' },
      defaults: {
        fullName: 'Samia Benali (Poste B)',
        username: 'agent2',
        email: 'samia.benali@event-nvoti.dz',
        password: hashedAgentPassword,
        role: 'AGENT',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Utilisateurs créés (admin: admin123, agent1: agent123, agent2: agent123)');

    // 2. Default Event
    const [event] = await Event.findOrCreate({
      where: { refId: 'EVT-2026-0001' },
      defaults: {
        refId: 'EVT-2026-0001',
        name: 'Assemblée Générale Extraordinaire & Ordinaire 2026',
        description: 'Rencontre annuelle des actionnaires et partenaires stratégiques.',
        eventDate: '2026-08-30',
        startTime: '08:30',
        endTime: '18:00',
        location: 'Centre International des Conférences (CIC) - Salle Zighout Youcef',
        address: 'Club des Pins, Staoueli',
        wilaya: 'Alger',
        organizer: 'Groupe Financier & Industriel d\'Algérie',
        status: 'EN_COURS'
      }
    });

    // 3. Assign Agents to Event
    await AgentEvent.findOrCreate({
      where: { userId: agentUser.id, eventId: event.id }
    });
    await AgentEvent.findOrCreate({
      where: { userId: agentUser2.id, eventId: event.id }
    });

    // 4. Seed Initial Guests
    const sampleGuests = [
      {
        importNumber: 1,
        lastNameOrCompany: 'SPA ALLIANCE INVESTISSEMENT',
        firstName: '',
        numberOfShares: 45000,
        birthDate: '15/04/1998',
        address: '14 Boulevard Colonel Amirouche',
        wilaya: 'Alger',
        nationalIdentificationNumber: '09981600123456789012',
        registrationNumber: '16/00-0987654B18',
        registrationIssueDate: '12/03/2012',
        taxIdentificationNumber: '001216009876543',
        bank: 'BNA (Banque Nationale d\'Algérie)',
        guestType: 'ORGANIZATION',
        source: 'CSV'
      },
      {
        importNumber: 2,
        lastNameOrCompany: 'BENMOHAMED',
        firstName: 'Redouane',
        numberOfShares: 1250,
        birthDate: '22/07/1974',
        address: 'Cité des 500 Logements, Bt C4',
        wilaya: 'Oran',
        nationalIdentificationNumber: '19743100456789012345',
        registrationNumber: '',
        registrationIssueDate: '',
        taxIdentificationNumber: '197431004567890',
        bank: 'BEA (Banque Extérieure d\'Algérie)',
        guestType: 'REGISTERED',
        source: 'CSV'
      },
      {
        importNumber: 3,
        lastNameOrCompany: 'SARL MAGHREB TECH LOGISTICS',
        firstName: '',
        numberOfShares: 18200,
        birthDate: '05/11/2005',
        address: 'Zone Industrielle Oued Smar, Lot 45',
        wilaya: 'Alger',
        nationalIdentificationNumber: '00051600876543210987',
        registrationNumber: '16/00-1122334A05',
        registrationIssueDate: '20/06/2008',
        taxIdentificationNumber: '000516001122334',
        bank: 'CPA (Crédit Populaire d\'Algérie)',
        guestType: 'ORGANIZATION',
        source: 'CSV'
      },
      {
        importNumber: 4,
        lastNameOrCompany: 'MEKHLOUFI',
        firstName: 'Amina',
        numberOfShares: 850,
        birthDate: '10/09/1988',
        address: 'Rue Didouche Mourad N°78',
        wilaya: 'Alger',
        nationalIdentificationNumber: '19881600789012345678',
        registrationNumber: '',
        registrationIssueDate: '',
        taxIdentificationNumber: '198816007890123',
        bank: 'BDL (Banque de Développement Local)',
        guestType: 'REGISTERED',
        source: 'CSV'
      },
      {
        importNumber: 5,
        lastNameOrCompany: 'KHELIFI',
        firstName: 'Djamel Eddine',
        numberOfShares: 3400,
        birthDate: '03/01/1965',
        address: 'Boulevard de la Soummam',
        wilaya: 'Constantine',
        nationalIdentificationNumber: '19652500123456789012',
        registrationNumber: '',
        registrationIssueDate: '',
        taxIdentificationNumber: '196525001234567',
        bank: 'BADR',
        guestType: 'VIP',
        source: 'CSV'
      },
      {
        importNumber: 6,
        lastNameOrCompany: 'EURL AGRO FOOD PACKAGING',
        firstName: '',
        numberOfShares: 9200,
        birthDate: '18/02/2015',
        address: 'Zone d\'Activité Commerciale',
        wilaya: 'Sétif',
        nationalIdentificationNumber: '00151900345678901234',
        registrationNumber: '19/00-4455667B15',
        registrationIssueDate: '14/05/2015',
        taxIdentificationNumber: '001519004455667',
        bank: 'Société Générale Algérie',
        guestType: 'ORGANIZATION',
        source: 'CSV'
      },
      {
        importNumber: 7,
        lastNameOrCompany: 'ZEGHICHE',
        firstName: 'Farid',
        numberOfShares: 500,
        birthDate: '12/12/1980',
        address: 'Avenue de l\'ALN',
        wilaya: 'Annaba',
        nationalIdentificationNumber: '19802300901234567890',
        registrationNumber: '',
        registrationIssueDate: '',
        taxIdentificationNumber: '198023009012345',
        bank: 'Gulf Bank Algérie (AGB)',
        guestType: 'REGISTERED',
        source: 'CSV'
      }
    ];

    for (let i = 0; i < sampleGuests.length; i++) {
      const g = sampleGuests[i];
      const sequence = String(i + 1).padStart(6, '0');
      const refId = `INV-${sequence}`;
      const searchNormalized = getSearchNormalized({ ...g, refId });

      await Guest.findOrCreate({
        where: { refId, eventId: event.id },
        defaults: {
          ...g,
          eventId: event.id,
          refId,
          searchNormalized
        }
      });
    }

    console.log(`✅ ${sampleGuests.length} invités de démonstration créés pour l'événement ${event.name}.`);
    console.log('🎉 Seed de la base de données terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
