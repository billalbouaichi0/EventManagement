import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('BadgePrint', {
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
    printedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    printedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    printNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    printerName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Default-Label-Printer'
    }
  }, {
    tableName: 'badge_prints',
    timestamps: true
  });
}
