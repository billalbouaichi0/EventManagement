import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    workstation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'audit_logs',
    timestamps: false
  });
}
