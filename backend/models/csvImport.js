import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('CsvImport', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalRows: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    successfulRows: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    failedRows: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    importedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    importedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'csv_imports',
    timestamps: true
  });
}
