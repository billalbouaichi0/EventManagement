import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('AgentEvent', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'agents_events',
    timestamps: false
  });
}
