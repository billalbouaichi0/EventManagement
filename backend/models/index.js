import { sequelize } from '../config/db.js';
import defineUser from './user.js';
import defineEvent from './event.js';
import defineGuest from './guest.js';
import defineAttendance from './attendance.js';
import defineBadgePrint from './badgePrint.js';
import defineCsvImport from './csvImport.js';
import defineAgentEvent from './agentEvent.js';
import defineAuditLog from './auditLog.js';

export const User = defineUser(sequelize);
export const Event = defineEvent(sequelize);
export const Guest = defineGuest(sequelize);
export const Attendance = defineAttendance(sequelize);
export const BadgePrint = defineBadgePrint(sequelize);
export const CsvImport = defineCsvImport(sequelize);
export const AgentEvent = defineAgentEvent(sequelize);
export const AuditLog = defineAuditLog(sequelize);

// Associations
Event.hasMany(Guest, { foreignKey: 'eventId', as: 'guests', onDelete: 'CASCADE' });
Guest.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Event.hasMany(Attendance, { foreignKey: 'eventId', as: 'attendances', onDelete: 'CASCADE' });
Attendance.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Guest.hasOne(Attendance, { foreignKey: 'guestId', as: 'attendance', onDelete: 'CASCADE' });
Attendance.belongsTo(Guest, { foreignKey: 'guestId', as: 'guest' });

User.hasMany(Attendance, { foreignKey: 'checkedInBy', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'checkedInBy', as: 'agent' });

Event.hasMany(BadgePrint, { foreignKey: 'eventId', as: 'badgePrints', onDelete: 'CASCADE' });
BadgePrint.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Guest.hasMany(BadgePrint, { foreignKey: 'guestId', as: 'badgePrints', onDelete: 'CASCADE' });
BadgePrint.belongsTo(Guest, { foreignKey: 'guestId', as: 'guest' });

User.hasMany(BadgePrint, { foreignKey: 'printedBy', as: 'printedBadges' });
BadgePrint.belongsTo(User, { foreignKey: 'printedBy', as: 'agent' });

Event.hasMany(CsvImport, { foreignKey: 'eventId', as: 'csvImports', onDelete: 'CASCADE' });
CsvImport.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

User.hasMany(CsvImport, { foreignKey: 'importedBy', as: 'csvImports' });
CsvImport.belongsTo(User, { foreignKey: 'importedBy', as: 'admin' });

User.belongsToMany(Event, { through: AgentEvent, foreignKey: 'userId', as: 'assignedEvents' });
Event.belongsToMany(User, { through: AgentEvent, foreignKey: 'eventId', as: 'assignedAgents' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize };
