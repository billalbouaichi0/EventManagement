import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    guestId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PRESENT'),
      allowNull: false,
      defaultValue: 'PRESENT'
    },
    attendanceType: {
      type: DataTypes.ENUM('SELF', 'PROXY'),
      allowNull: false,
      defaultValue: 'SELF'
    },
    representativeLastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    representativeFirstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    representativeNIN: {
      type: DataTypes.STRING,
      allowNull: true
    },
    representativePosition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    representativeNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    checkedInBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    workstation: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Poste Principal'
    }
  }, {
    tableName: 'attendances',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['eventId', 'guestId']
      }
    ]
  });
}
