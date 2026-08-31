import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('Guest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    refId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    importNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lastNameOrCompany: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numberOfShares: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    birthDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    wilaya: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nationalIdentificationNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    registrationIssueDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taxIdentificationNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: true
    },
    guestType: {
      type: DataTypes.ENUM('REGISTERED', 'WALK_IN', 'VIP', 'ORGANIZATION', 'PRESS', 'OTHER'),
      allowNull: false,
      defaultValue: 'REGISTERED'
    },
    source: {
      type: DataTypes.ENUM('CSV', 'MANUAL'),
      allowNull: false,
      defaultValue: 'CSV'
    },
    searchNormalized: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'guests',
    timestamps: true,
    indexes: [
      { fields: ['eventId'] },
      { fields: ['refId'] },
      { fields: ['lastNameOrCompany'] },
      { fields: ['firstName'] },
      { fields: ['nationalIdentificationNumber'] }
    ]
  });
}
