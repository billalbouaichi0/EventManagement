import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    refId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '09:00'
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '18:00'
    },
    location: {
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
    organizer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('BROUILLON', 'PLANIFIE', 'EN_COURS', 'TERMINE', 'ARCHIVE'),
      allowNull: false,
      defaultValue: 'EN_COURS'
    }
  }, {
    tableName: 'events',
    timestamps: true
  });
}
